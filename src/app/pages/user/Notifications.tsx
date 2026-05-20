import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Bell, Briefcase, Building2, MessageSquare, ShieldAlert, Wallet } from 'lucide-react';
import DashboardLayout from '@/app/components/layout';
import { useLanguage } from '@/app/providers/LanguageProvider';
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui';

function getInitialNotifications(
  userType: 'user' | 'company' | 'admin',
  isEnglish: boolean,
) {
  if (userType === 'company') {
    return [
      {
        id: 1,
        title: isEnglish ? 'New applicant' : 'متقدم جديد',
        description: isEnglish
          ? 'A new applicant has arrived for one of the published jobs.'
          : 'وصل متقدم جديد إلى إحدى الوظائف المنشورة.',
        time: isEnglish ? '10 minutes ago' : 'منذ 10 دقائق',
        type: 'applicants',
        to: '/company/applicants',
        unread: true,
      },
      {
        id: 2,
        title: isEnglish ? 'Message from candidate' : 'رسالة من مرشح',
        description: isEnglish
          ? 'There is a new message inside company conversations.'
          : 'هناك رسالة جديدة داخل محادثات الشركة.',
        time: isEnglish ? '1 hour ago' : 'منذ ساعة',
        type: 'messages',
        to: '/company/messages',
        unread: true,
      },
      {
        id: 3,
        title: isEnglish ? 'Job post update' : 'تحديث على إعلان وظيفي',
        description: isEnglish
          ? 'One of the job posts has been updated or paused.'
          : 'تم تحديث حالة أحد الإعلانات أو إيقافه.',
        time: isEnglish ? '3 hours ago' : 'منذ 3 ساعات',
        type: 'jobs',
        to: '/company/jobs',
        unread: false,
      },
    ];
  }

  if (userType === 'admin') {
    return [
      {
        id: 1,
        title: isEnglish ? 'New dispute' : 'نزاع جديد',
        description: isEnglish
          ? 'A new dispute was opened and needs an admin decision.'
          : 'تم فتح نزاع جديد ويحتاج قرارًا من فريق الإدارة.',
        time: isEnglish ? '20 minutes ago' : 'منذ 20 دقيقة',
        type: 'disputes',
        to: '/admin/disputes',
        unread: true,
      },
      {
        id: 2,
        title: isEnglish ? 'Company verification request' : 'طلب توثيق شركة',
        description: isEnglish
          ? 'There is a new request in the company verification queue.'
          : 'يوجد طلب جديد في قائمة توثيق الشركات.',
        time: isEnglish ? '1 hour ago' : 'منذ ساعة',
        type: 'verification',
        to: '/admin/verification',
        unread: true,
      },
      {
        id: 3,
        title: isEnglish ? 'Financial alert' : 'تنبيه مالي',
        description: isEnglish
          ? 'There is a new payment or withdrawal that needs review.'
          : 'هناك دفعة أو سحب جديد يحتاج مراجعة.',
        time: isEnglish ? '4 hours ago' : 'منذ 4 ساعات',
        type: 'finance',
        to: '/admin/finance',
        unread: false,
      },
    ];
  }

  return [
    {
      id: 1,
      title: isEnglish ? 'New message' : 'رسالة جديدة',
      description: isEnglish
        ? 'You have a new message in conversations from one of the clients.'
        : 'لديك رسالة جديدة في المحادثات من أحد العملاء.',
      time: isEnglish ? '10 minutes ago' : 'منذ 10 دقائق',
      type: 'messages',
      to: '/messages',
      unread: true,
    },
    {
      id: 2,
      title: isEnglish ? 'New project for you' : 'مشروع جديد مناسب لك',
      description: isEnglish
        ? 'A new project was added in a section you follow.'
        : 'تمت إضافة مشروع جديد ضمن القسم الذي تتابعه.',
      time: isEnglish ? '1 hour ago' : 'منذ ساعة',
      type: 'projects',
      to: '/projects',
      unread: true,
    },
    {
      id: 3,
      title: isEnglish ? 'Wallet update' : 'تحديث في المحفظة',
      description: isEnglish
        ? 'One of your wallet transactions has been reviewed.'
        : 'تمت مراجعة إحدى المعاملات المالية في محفظتك.',
      time: isEnglish ? '3 hours ago' : 'منذ 3 ساعات',
      type: 'wallet',
      to: '/wallet',
      unread: false,
    },
  ];
}

export function NotificationsPage({ userType = 'user' }: { userType?: 'user' | 'company' | 'admin' }) {
  const { isEnglish, language } = useLanguage();
  const [notifications, setNotifications] = useState(() => getInitialNotifications(userType, isEnglish));
  const [statusMessage, setStatusMessage] = useState('');

  const unreadCount = useMemo(
    () => notifications.filter((notification) => notification.unread).length,
    [notifications],
  );

  const handleMarkAllAsRead = () => {
    if (unreadCount === 0) {
      setStatusMessage(isEnglish ? 'All notifications are already read.' : 'كل الإشعارات مقروءة بالفعل.');
      return;
    }

    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        unread: false,
      })),
    );
    setStatusMessage(isEnglish ? 'All notifications were marked as read.' : 'تم تحديد جميع الإشعارات كمقروءة.');
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'messages':
        return <MessageSquare className="size-5 text-blue-600" />;
      case 'projects':
      case 'jobs':
        return <Briefcase className="size-5 text-primary" />;
      case 'wallet':
      case 'finance':
        return <Wallet className="size-5 text-green-600" />;
      case 'verification':
        return <Building2 className="size-5 text-amber-600" />;
      case 'disputes':
        return <ShieldAlert className="size-5 text-rose-600" />;
      default:
        return <Bell className="size-5 text-primary" />;
    }
  };

  return (
    <DashboardLayout userType={userType}>
      <div className="space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold">{isEnglish ? 'Notifications' : 'الإشعارات'}</h1>
            <p className="mt-1 text-muted-foreground">
              {isEnglish
                ? 'All alerts and updates related to this account'
                : 'كل التنبيهات والتحديثات الخاصة بهذا الحساب'}
            </p>
          </div>
          <Button variant="outline" onClick={handleMarkAllAsRead}>
            {isEnglish ? 'Mark all as read' : 'تحديد الكل كمقروء'}
          </Button>
        </div>

        {statusMessage && (
          <Card className="border-green-200 bg-green-50 p-3 text-sm text-green-700">
            {statusMessage}
          </Card>
        )}

        <div className="text-sm text-muted-foreground">
          {isEnglish ? 'Unread notifications:' : 'عدد الإشعارات غير المقروءة:'} {unreadCount}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{isEnglish ? 'Latest notifications' : 'آخر الإشعارات'}</CardTitle>
            <CardDescription>
              {isEnglish
                ? 'Click any notification to open its related page.'
                : 'اضغط على أي إشعار للانتقال إلى الصفحة المرتبطة به'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {notifications.map((notification) => (
              <Link key={notification.id} to={notification.to} className="block">
                <div className="flex items-start justify-between gap-4 rounded-xl border border-border p-4 transition-colors hover:bg-accent/40">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{getIcon(notification.type)}</div>
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <h3 className="font-semibold">{notification.title}</h3>
                        {notification.unread && (
                          <Badge className="bg-blue-600">{isEnglish ? 'New' : 'جديد'}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{notification.description}</p>
                    </div>
                  </div>
                  <span className="whitespace-nowrap text-xs text-muted-foreground">
                    {notification.time}
                  </span>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default function Notifications() {
  return <NotificationsPage />;
}
