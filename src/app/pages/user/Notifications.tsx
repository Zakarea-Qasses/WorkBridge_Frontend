import { useCallback, useEffect, useState } from 'react';
import {
  Bell,
  Briefcase,
  Building2,
  CheckCircle2,
  LoaderCircle,
  RefreshCw,
  ShieldAlert,
  Trash2,
  Wallet,
} from 'lucide-react';
import DashboardLayout from '@/app/components/layout';
import { Badge, Button, Card, CardContent } from '@/app/components/ui';
import { getApiErrorMessage } from '@/app/api/client';
import {
  deleteNotification,
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type UserNotification,
} from '@/app/api/endpoints';
import { useAuth } from '@/app/providers/AuthProvider';
import { useLanguage } from '@/app/providers/LanguageProvider';

export const NOTIFICATION_COUNT_CHANGED_EVENT = 'workbridge:notification-count-changed';

export function notifyUnreadCountChanged(count?: number) {
  window.dispatchEvent(
    new CustomEvent(NOTIFICATION_COUNT_CHANGED_EVENT, { detail: { count } }),
  );
}

function notificationTypeLabel(type: string | null, isEnglish: boolean) {
  const labels: Record<string, [string, string]> = {
    new_account_review: ['Account review', 'مراجعة حساب'],
    company_verified: ['Company verification', 'توثيق شركة'],
    company_unverified: ['Company verification', 'توثيق شركة'],
    account_approved: ['Account approval', 'قبول الحساب'],
    account_blocked: ['Account status', 'حالة الحساب'],
    project_application: ['Project application', 'تقديم على مشروع'],
    application_accepted: ['Application accepted', 'قبول تقديم'],
    application_rejected: ['Application rejected', 'رفض تقديم'],
    service_request: ['Service request', 'طلب خدمة'],
    service_request_accepted: ['Service request accepted', 'قبول طلب خدمة'],
    service_request_rejected: ['Service request rejected', 'رفض طلب خدمة'],
    new_report: ['New report', 'بلاغ جديد'],
    report_decision: ['Report decision', 'قرار بلاغ'],
  };
  return type && labels[type] ? labels[type][isEnglish ? 0 : 1] : isEnglish ? 'Notification' : 'إشعار';
}

function notificationIcon(type: string | null) {
  if (type?.includes('company')) return <Building2 className="size-5 text-amber-600" />;
  if (type?.includes('application') || type?.includes('service')) {
    return <Briefcase className="size-5 text-primary" />;
  }
  if (type?.includes('account') || type?.includes('report')) {
    return <ShieldAlert className="size-5 text-rose-600" />;
  }
  if (type?.includes('payment') || type?.includes('wallet')) {
    return <Wallet className="size-5 text-green-600" />;
  }
  return <Bell className="size-5 text-primary" />;
}

function formatDate(value: string, isEnglish: boolean) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return isEnglish ? 'Date unavailable' : 'التاريخ غير متاح';
  return new Intl.DateTimeFormat(isEnglish ? 'en' : 'ar', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function NotificationsPage({
  userType = 'user',
}: {
  userType?: 'user' | 'company' | 'admin';
}) {
  const { user } = useAuth();
  const { isEnglish, language } = useLanguage();
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [markingAll, setMarkingAll] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const [notificationPage, count] = await Promise.all([
        getNotifications(page),
        getUnreadNotificationCount(),
      ]);
      setNotifications(notificationPage.data);
      setLastPage(notificationPage.last_page);
      setUnreadCount(count);
      notifyUnreadCountChanged(count);
    } catch (requestError) {
      setNotifications([]);
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [page, user]);

  useEffect(() => {
    setNotifications([]);
    setUnreadCount(0);
    setPage(1);
  }, [user?.id]);

  useEffect(() => {
    void load();
  }, [load]);

  const refreshCount = async () => {
    const count = await getUnreadNotificationCount();
    setUnreadCount(count);
    notifyUnreadCountChanged(count);
  };

  const markOne = async (notification: UserNotification) => {
    if (notification.read_at || busyId === notification.id) return;
    try {
      setBusyId(notification.id);
      setError('');
      setSuccess('');
      const updated = await markNotificationAsRead(notification.id);
      setNotifications((current) =>
        current.map((item) => (item.id === notification.id ? updated : item)),
      );
      await refreshCount();
      setSuccess(isEnglish ? 'Notification marked as read.' : 'تم تحديد الإشعار كمقروء');
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setBusyId(null);
    }
  };

  const markAll = async () => {
    if (!unreadCount || markingAll) return;
    try {
      setMarkingAll(true);
      setError('');
      setSuccess('');
      await markAllNotificationsAsRead();
      const readAt = new Date().toISOString();
      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          read_at: notification.read_at || readAt,
        })),
      );
      setUnreadCount(0);
      notifyUnreadCountChanged(0);
      setSuccess(
        isEnglish
          ? 'All notifications marked as read.'
          : 'تم تحديد جميع الإشعارات كمقروءة',
      );
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setMarkingAll(false);
    }
  };

  const remove = async (notification: UserNotification) => {
    if (
      !window.confirm(
        isEnglish
          ? 'Are you sure you want to delete this notification?'
          : 'هل أنت متأكد من حذف هذا الإشعار؟',
      )
    ) return;

    try {
      setBusyId(notification.id);
      setError('');
      setSuccess('');
      await deleteNotification(notification.id);
      const remaining = notifications.filter((item) => item.id !== notification.id);
      setNotifications(remaining);
      await refreshCount();
      setSuccess(isEnglish ? 'Notification deleted.' : 'تم حذف الإشعار');
      if (!remaining.length && page > 1) setPage((current) => current - 1);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <DashboardLayout userType={userType}>
      <div className="space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{isEnglish ? 'Notifications' : 'الإشعارات'}</h1>
            <p className="mt-1 text-muted-foreground">
              {isEnglish ? `Unread: ${unreadCount}` : `غير المقروءة: ${unreadCount}`}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" disabled={loading} onClick={() => void load()}>
              <RefreshCw className="me-2 size-4" />
              {isEnglish ? 'Refresh' : 'تحديث'}
            </Button>
            <Button disabled={!unreadCount || markingAll} onClick={() => void markAll()}>
              {markingAll ? <LoaderCircle className="me-2 size-4 animate-spin" /> : null}
              {isEnglish ? 'Mark all as read' : 'تحديد الكل كمقروء'}
            </Button>
          </div>
        </div>

        {error ? (
          <Card className="border-destructive/30">
            <CardContent className="py-3 text-sm text-destructive">{error}</CardContent>
          </Card>
        ) : null}
        {success ? (
          <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            <CheckCircle2 className="size-4" />
            {success}
          </div>
        ) : null}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-32 animate-pulse rounded-md bg-muted" />
            ))}
          </div>
        ) : notifications.length === 0 && !error ? (
          <Card>
            <CardContent className="flex min-h-56 flex-col items-center justify-center gap-3 text-center text-muted-foreground">
              <Bell className="size-10" />
              <p>{isEnglish ? 'No notifications currently.' : 'لا توجد إشعارات حالياً'}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => {
              const busy = busyId === notification.id;
              return (
                <Card
                  key={notification.id}
                  className={!notification.read_at ? 'border-primary/30 bg-primary/5' : ''}
                >
                  <CardContent className="flex flex-wrap items-start justify-between gap-4 pt-6">
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      <div className="mt-1">{notificationIcon(notification.type)}</div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="font-semibold">{notification.title}</h2>
                          <Badge variant="outline">
                            {notificationTypeLabel(notification.type, isEnglish)}
                          </Badge>
                          {!notification.read_at ? (
                            <Badge>{isEnglish ? 'New' : 'جديد'}</Badge>
                          ) : null}
                        </div>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                          {notification.message}
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {formatDate(notification.created_at, isEnglish)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!notification.read_at ? (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={busy}
                          onClick={() => void markOne(notification)}
                        >
                          {busy ? <LoaderCircle className="me-2 size-4 animate-spin" /> : null}
                          {isEnglish ? 'Mark read' : 'تحديد كمقروء'}
                        </Button>
                      ) : null}
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={busy}
                        onClick={() => void remove(notification)}
                        title={isEnglish ? 'Delete' : 'حذف'}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {lastPage > 1 ? (
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              disabled={page === 1 || loading}
              onClick={() => setPage((current) => current - 1)}
            >
              {isEnglish ? 'Previous' : 'السابق'}
            </Button>
            <span className="flex items-center px-3 text-sm text-muted-foreground">
              {page} / {lastPage}
            </span>
            <Button
              variant="outline"
              disabled={page === lastPage || loading}
              onClick={() => setPage((current) => current + 1)}
            >
              {isEnglish ? 'Next' : 'التالي'}
            </Button>
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  );
}

export default function Notifications() {
  return <NotificationsPage />;
}
