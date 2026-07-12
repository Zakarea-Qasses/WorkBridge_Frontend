import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, LoaderCircle, RefreshCw, Search } from 'lucide-react';
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
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui';
import { getApiErrorMessage } from '@/app/api/client';
import {
  approveAdminUser,
  blockAdminUser,
  getAdminUsers,
  markAdminUserUnderReview,
  type AdminReviewUser,
  type PaginatedResponse,
} from '@/app/api/pages/admin/users';

type StatusFilter = 'all' | 'active' | 'under_review' | 'inactive';
type StatusMessage = { type: 'success' | 'error'; message: string } | null;

type AdminUsersResponse =
  | AdminReviewUser[]
  | PaginatedResponse<AdminReviewUser>
  | {
      users?: AdminReviewUser[] | PaginatedResponse<AdminReviewUser>;
      data?: AdminReviewUser[];
    };

const inactiveStatuses = new Set(['inactive', 'unactive', 'blocked']);

function unwrapUsers(response: AdminUsersResponse) {
  if (Array.isArray(response)) return response;
  if ('users' in response && response.users) {
    return Array.isArray(response.users) ? response.users : response.users.data;
  }
  if ('data' in response && Array.isArray(response.data)) return response.data;
  if ('data' in response && Array.isArray((response as PaginatedResponse<AdminReviewUser>).data)) {
    return (response as PaginatedResponse<AdminReviewUser>).data;
  }
  return [];
}

function statusLabel(status: string | undefined, isEnglish: boolean) {
  const labels: Record<string, [string, string]> = {
    pending_review: ['Pending review', 'بانتظار المراجعة'],
    under_review: ['Under review', 'قيد المراجعة'],
    active: ['Active', 'نشط'],
    blocked: ['Blocked', 'محظور'],
    inactive: ['Inactive', 'غير نشط'],
    unactive: ['Inactive', 'غير نشط'],
  };

  if (!status) return isEnglish ? 'Unknown' : 'غير معروف';
  return labels[status]?.[isEnglish ? 0 : 1] || status;
}

function statusClass(status?: string) {
  if (status === 'active') return 'bg-green-600';
  if (inactiveStatuses.has(status || '')) return 'bg-red-600';
  if (status === 'under_review' || status === 'pending_review') return 'bg-amber-500';
  return 'bg-slate-600';
}

function matchesStatusFilter(user: AdminReviewUser, filter: StatusFilter) {
  if (filter === 'all') return true;
  if (filter === 'inactive') return inactiveStatuses.has(user.status || '');
  if (filter === 'under_review') {
    return user.status === 'under_review' || user.status === 'pending_review';
  }
  return user.status === filter;
}

function StatusMessageBox({ status }: { status: StatusMessage }) {
  if (!status) return null;

  return (
    <Card className={status.type === 'success' ? 'border-green-200 bg-green-50' : 'border-destructive/30 bg-destructive/5'}>
      <CardContent className={status.type === 'success' ? 'flex items-center gap-2 pt-6 text-sm text-green-700' : 'flex items-center gap-2 pt-6 text-sm text-destructive'}>
        {status.type === 'success' ? <CheckCircle2 className="size-4" /> : <AlertCircle className="size-4" />}
        {status.message}
      </CardContent>
    </Card>
  );
}

export default function AdminUsers() {
  const { language, isEnglish } = useLanguage();
  const [users, setUsers] = useState<AdminReviewUser[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [status, setStatus] = useState<StatusMessage>(null);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<number | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setStatus(null);
    try {
      const response = await getAdminUsers<AdminUsersResponse>();
      setUsers(unwrapUsers(response));
    } catch (error) {
      setUsers([]);
      setStatus({
        type: 'error',
        message:
          getApiErrorMessage(error) ||
          (isEnglish ? 'Could not load users.' : 'تعذر تحميل المستخدمين.'),
      });
    } finally {
      setLoading(false);
    }
  }, [isEnglish]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !term ||
        user.name?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term);

      return matchesSearch && matchesStatusFilter(user, statusFilter);
    });
  }, [search, statusFilter, users]);

  const runAction = async (
    user: AdminReviewUser,
    action: 'approve' | 'under_review' | 'block',
  ) => {
    try {
      setActingId(user.id);
      setStatus(null);
      if (action === 'approve') {
        await approveAdminUser(user.id);
        setStatus({
          type: 'success',
          message: isEnglish
            ? `${user.name} was approved successfully.`
            : `تم قبول الحساب ${user.name} بنجاح.`,
        });
      } else if (action === 'under_review') {
        await markAdminUserUnderReview(user.id);
        setStatus({
          type: 'success',
          message: isEnglish
            ? `${user.name} was moved under review.`
            : `تم نقل الحساب ${user.name} إلى قيد المراجعة.`,
        });
      } else {
        await blockAdminUser(user.id);
        setStatus({
          type: 'success',
          message: isEnglish ? `${user.name} was blocked.` : `تم حظر الحساب ${user.name}.`,
        });
      }
      await loadUsers();
    } catch (error) {
      setStatus({ type: 'error', message: getApiErrorMessage(error) });
    } finally {
      setActingId(null);
    }
  };

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <section className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold">
              {isEnglish ? 'User management' : 'إدارة المستخدمين'}
            </h2>
          </div>
          <Button variant="outline" disabled={loading} onClick={() => void loadUsers()}>
            <RefreshCw className="me-2 size-4" />
            {isEnglish ? 'Refresh' : 'تحديث'}
          </Button>
        </section>

        <StatusMessageBox status={status} />

        <Card>
          <CardHeader>
            <CardTitle>{isEnglish ? 'All users' : 'كل المستخدمين'}</CardTitle>
            <CardDescription>
              {loading
                ? isEnglish
                  ? 'Loading users...'
                  : 'جاري تحميل المستخدمين...'
                : `${filteredUsers.length} ${isEnglish ? 'shown from' : 'ظاهر من أصل'} ${users.length}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-3 md:grid-cols-[1fr_220px]">
              <div className="relative">
                <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="ps-9"
                  placeholder={isEnglish ? 'Search by name or email...' : 'ابحث حسب الاسم أو البريد...'}
                />
              </div>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isEnglish ? 'All statuses' : 'كل الحالات'}</SelectItem>
                  <SelectItem value="active">{isEnglish ? 'Active' : 'نشط'}</SelectItem>
                  <SelectItem value="under_review">{isEnglish ? 'Under review' : 'قيد المراجعة'}</SelectItem>
                  <SelectItem value="inactive">{isEnglish ? 'Inactive' : 'غير نشط'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="flex min-h-56 items-center justify-center gap-3 text-muted-foreground">
                <LoaderCircle className="size-7 animate-spin text-primary" />
                {isEnglish ? 'Loading users...' : 'جاري تحميل المستخدمين...'}
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                {isEnglish ? 'No users match the current filters.' : 'لا يوجد مستخدمون مطابقون للبحث أو الفلترة الحالية.'}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
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
                      <Badge className={statusClass(user.status)}>
                        {statusLabel(user.status, isEnglish)}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        disabled={actingId === user.id || user.status === 'active'}
                        onClick={() => void runAction(user, 'approve')}
                      >
                        {isEnglish ? 'Approve' : 'قبول'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={actingId === user.id || user.status === 'under_review'}
                        onClick={() => void runAction(user, 'under_review')}
                      >
                        {isEnglish ? 'Under review' : 'قيد المراجعة'}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={actingId === user.id || inactiveStatuses.has(user.status || '')}
                        onClick={() => void runAction(user, 'block')}
                      >
                        {isEnglish ? 'Block' : 'تعطيل'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
