import { useMemo, useState } from 'react';
import DashboardLayout from '@/app/components/layout';
import { useLanguage } from '@/app/providers/LanguageProvider';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/app/components/ui';
import { adminUsers, getDisplayStatusLabel, getStatusClasses } from '@/app/data';

export default function AdminUsers() {
  const { language, isEnglish } = useLanguage();
  const pendingSeed = useMemo(() => adminUsers.filter((user) => user.status === 'معلق'), []);
  const [users, setUsers] = useState(pendingSeed);
  const [feedback, setFeedback] = useState(
    isEnglish
      ? 'Pending accounts appear here, and after a decision they move directly to the reviewed section.'
      : 'تظهر هنا الحسابات المعلّقة، وبعد اتخاذ القرار تنتقل مباشرة إلى قسم تمت المراجعة.',
  );

  const pendingUsers = useMemo(() => users.filter((user) => user.status === 'معلق'), [users]);
  const reviewedUsers = useMemo(() => users.filter((user) => user.status !== 'معلق'), [users]);

  const handleAction = (id: number, nextStatus: 'نشط' | 'محظور', message: string) => {
    setUsers((current) =>
      current.map((user) => (user.id === id ? { ...user, status: nextStatus } : user)),
    );
    setFeedback(message);
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
              ? 'Review pending accounts and make approval or ban decisions while keeping a clear review record.'
              : 'مراجعة الحسابات المعلّقة واتخاذ قرار القبول أو الحظر مع الاحتفاظ بسجل مراجعة واضح.'}
          </p>
        </section>

        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6 text-sm text-primary">{feedback}</CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{isEnglish ? 'Awaiting review' : 'بانتظار المراجعة'}</CardTitle>
              <CardDescription>
                {isEnglish
                  ? 'Accounts that still need an admin decision.'
                  : 'الحسابات التي ما زالت تحتاج قرارًا من الأدمن.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingUsers.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  {isEnglish ? 'There are no pending accounts right now.' : 'لا توجد حسابات معلّقة حاليًا.'}
                </div>
              ) : null}

              {pendingUsers.map((user) => (
                <div
                  key={user.id}
                  className="grid gap-4 rounded-2xl border border-border p-4 lg:grid-cols-[1.4fr_0.8fr_0.8fr_auto]"
                >
                  <div>
                    <h3 className="font-semibold">{user.name}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{isEnglish ? 'Role' : 'الدور'}</p>
                    <p className="font-medium">{user.role}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={getStatusClasses(user.status)}>
                      {getDisplayStatusLabel(user.status, isEnglish)}
                    </Badge>
                    <Badge className={getStatusClasses(user.verification)}>
                      {getDisplayStatusLabel(user.verification, isEnglish)}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={() =>
                        handleAction(
                          user.id,
                          'نشط',
                          isEnglish
                            ? `${user.name}'s account was approved and moved to reviewed.`
                            : `تم قبول الحساب ${user.name} ونقله إلى تمت المراجعة.`,
                        )
                      }
                    >
                      {isEnglish ? 'Approve' : 'قبول'}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() =>
                        handleAction(
                          user.id,
                          'محظور',
                          isEnglish
                            ? `${user.name}'s account was banned and moved to reviewed.`
                            : `تم حظر الحساب ${user.name} ونقله إلى تمت المراجعة.`,
                        )
                      }
                    >
                      {isEnglish ? 'Ban' : 'حظر'}
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{isEnglish ? 'Reviewed' : 'تمت المراجعة'}</CardTitle>
              <CardDescription>
                {isEnglish
                  ? 'Accounts that already have a final decision.'
                  : 'الحسابات التي صدر فيها قرار بالفعل.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {reviewedUsers.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  {isEnglish ? 'There are no reviewed accounts yet.' : 'لا توجد حسابات تمت مراجعتها بعد.'}
                </div>
              ) : null}

              {reviewedUsers.map((user) => (
                <div
                  key={user.id}
                  className="grid gap-4 rounded-2xl border border-border p-4 lg:grid-cols-[1.4fr_0.8fr_0.8fr]"
                >
                  <div>
                    <h3 className="font-semibold">{user.name}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{isEnglish ? 'Role' : 'الدور'}</p>
                    <p className="font-medium">{user.role}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={getStatusClasses(user.status)}>
                      {getDisplayStatusLabel(user.status, isEnglish)}
                    </Badge>
                    <Badge className={getStatusClasses(user.verification)}>
                      {getDisplayStatusLabel(user.verification, isEnglish)}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
