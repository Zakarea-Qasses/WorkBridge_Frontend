import { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '@/app/components/layout';
import { useLanguage } from '@/app/providers/LanguageProvider';
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui';
import { getApiErrorMessage } from '@/app/api/client';
import {
  approveAdminUser,
  blockAdminUser,
  getAdminUserReviewBoard,
  markAdminUserUnderReview,
  type AdminReviewUser,
} from '@/app/api/endpoints';

const statusLabels: Record<string, string> = {
  pending_review: 'بانتظار المراجعة',
  under_review: 'قيد المراجعة',
  active: 'نشط',
  blocked: 'محظور',
};

function getStatusClass(status?: string) {
  if (status === 'active') {
    return 'bg-green-600';
  }
  if (status === 'blocked') {
    return 'bg-red-600';
  }
  if (status === 'under_review') {
    return 'bg-amber-500';
  }

  return 'bg-slate-600';
}

export default function AdminUsers() {
  const { language, isEnglish } = useLanguage();
  const [pendingUsers, setPendingUsers] = useState<AdminReviewUser[]>([]);
  const [underReviewUsers, setUnderReviewUsers] = useState<AdminReviewUser[]>([]);
  const [reviewedUsers, setReviewedUsers] = useState<AdminReviewUser[]>([]);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<number | null>(null);

  const allUsers = useMemo(
    () => [
      ...pendingUsers.map((user) => ({ ...user, group: 'pending' })),
      ...underReviewUsers.map((user) => ({ ...user, group: 'underReview' })),
      ...reviewedUsers.map((user) => ({ ...user, group: 'reviewed' })),
    ],
    [pendingUsers, reviewedUsers, underReviewUsers],
  );

  const loadReviewBoard = async () => {
    const board = await getAdminUserReviewBoard();
    setPendingUsers(board.pending_review || []);
    setUnderReviewUsers(board.under_review || []);
    setReviewedUsers(board.reviewed || []);
  };

  useEffect(() => {
    loadReviewBoard()
      .catch((error) => setFeedback(getApiErrorMessage(error)))
      .finally(() => setLoading(false));
  }, []);

  const runAction = async (
    user: AdminReviewUser,
    action: 'approve' | 'under_review' | 'block',
  ) => {
    try {
      setActingId(user.id);
      if (action === 'approve') {
        await approveAdminUser(user.id);
        setFeedback(`تم قبول الحساب ${user.name} بنجاح`);
      } else if (action === 'under_review') {
        await markAdminUserUnderReview(user.id);
        setFeedback(`تم نقل الحساب ${user.name} إلى قيد المراجعة`);
      } else {
        await blockAdminUser(user.id);
        setFeedback(`تم حظر الحساب ${user.name}`);
      }
      await loadReviewBoard();
    } catch (error) {
      setFeedback(getApiErrorMessage(error));
    } finally {
      setActingId(null);
    }
  };

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <section>
          <h2 className="text-3xl font-bold">
            {isEnglish ? 'Manage users and accounts' : 'إدارة المستخدمين والحسابات'}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {isEnglish
              ? 'Review accounts and make approval, review, or block decisions.'
              : 'مراجعة الحسابات واتخاذ قرارات القبول أو وضعها قيد المراجعة أو الحظر.'}
          </p>
        </section>

        {feedback ? (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6 text-sm text-primary">{feedback}</CardContent>
          </Card>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>{isEnglish ? 'Review board' : 'لوحة مراجعة الحسابات'}</CardTitle>
            <CardDescription>
              {loading
                ? isEnglish
                  ? 'Loading review board...'
                  : 'جار تحميل لوحة المراجعة...'
                : `${allUsers.length} ${isEnglish ? 'accounts' : 'حساب'}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!loading && allUsers.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                {isEnglish ? 'There are no accounts to review.' : 'لا توجد حسابات للمراجعة حاليا.'}
              </div>
            ) : null}

            {allUsers.map((user) => (
              <div
                key={`${user.group}-${user.id}`}
                className="grid gap-4 rounded-2xl border border-border p-4 lg:grid-cols-[1.4fr_0.6fr_0.7fr_auto]"
              >
                <div>
                  <h3 className="font-semibold">{user.name}</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{isEnglish ? 'Role' : 'الدور'}</p>
                  <p className="font-medium">{user.role}</p>
                </div>
                <div className="flex items-center">
                  <Badge className={getStatusClass(user.status)}>
                    {isEnglish ? user.status : statusLabels[user.status || ''] || user.status}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    disabled={actingId === user.id || user.status === 'active'}
                    onClick={() => runAction(user, 'approve')}
                  >
                    {isEnglish ? 'Approve' : 'قبول'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={actingId === user.id || user.status === 'under_review'}
                    onClick={() => runAction(user, 'under_review')}
                  >
                    {isEnglish ? 'Under review' : 'قيد المراجعة'}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={actingId === user.id || user.status === 'blocked'}
                    onClick={() => runAction(user, 'block')}
                  >
                    {isEnglish ? 'Block' : 'حظر'}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
