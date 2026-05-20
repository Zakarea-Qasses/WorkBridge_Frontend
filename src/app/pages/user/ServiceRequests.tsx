import { useMemo, useState } from 'react';
import { CheckCircle2, Clock3, XCircle } from 'lucide-react';
import DashboardLayout from '@/app/components/layout';
import { getDisplayDurationLabel, getDisplayStatusLabel } from '@/app/data';
import { useLanguage } from '@/app/providers/LanguageProvider';
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui';
import { createContract, getServiceRequests, updateServiceRequestStatus } from '@/app/storage';

function getStatusBadge(status: string) {
  switch (status) {
    case 'مقبول':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'مرفوض':
      return 'bg-rose-100 text-rose-700 border-rose-200';
    case 'مؤجل':
      return 'bg-slate-100 text-slate-700 border-slate-200';
    default:
      return 'bg-amber-100 text-amber-800 border-amber-200';
  }
}

export default function ServiceRequests() {
  const { isEnglish, language } = useLanguage();
  const [refreshKey, setRefreshKey] = useState(0);
  const [feedback, setFeedback] = useState(
    isEnglish
      ? 'Here you can see the requests you sent, and the requests received by you as a service provider inside the interface.'
      : 'تظهر هنا الطلبات المرسلة منك، والطلبات الواردة إليك كمقدم خدمة داخل الواجهة.',
  );

  const requests = useMemo(() => getServiceRequests(), [refreshKey]);
  const outgoingRequests = requests.filter((request) => request.clientId === 1);
  const incomingRequests = requests.filter((request) => request.providerId === 1);

  const handleStatusChange = (
    id: number,
    status: 'مقبول' | 'مرفوض' | 'مؤجل',
    title: string,
  ) => {
    const targetRequest = requests.find((request) => request.id === id);
    updateServiceRequestStatus(id, status);
    if (status === 'مقبول' && targetRequest) {
      const amount = Number(targetRequest.price.replace(/[^\d]/g, ''));
      const commission = Math.round(amount * 0.1);

      createContract({
        postId: targetRequest.serviceId,
        postTitle: targetRequest.requestTitle,
        postType: 'خدمة',
        clientId: targetRequest.clientId,
        clientName: targetRequest.client,
        freelancerId: targetRequest.providerId,
        freelancerName: targetRequest.provider,
        companyId: targetRequest.client.includes('شركة') ? 1 : undefined,
        companyName: targetRequest.client.includes('شركة') ? targetRequest.client : undefined,
        amount,
        commission,
        finalAmount: amount - commission,
        status: 'بانتظار البدء',
      });
    }
    setRefreshKey((current) => current + 1);
    setFeedback(
      isEnglish
        ? `The service request "${title}" was ${status === 'مقبول' ? 'accepted' : status === 'مرفوض' ? 'rejected' : 'postponed'}${status === 'مقبول' ? ' and a new contract was created for it.' : '.'}`
        : `تم ${status === 'مقبول' ? 'قبول' : status === 'مرفوض' ? 'رفض' : 'تأجيل'} طلب الخدمة: ${title}${status === 'مقبول' ? ' وإنشاء عقد جديد له.' : '.'}`,
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <section>
          <h1 className="text-3xl font-bold">{isEnglish ? 'Service Requests' : 'طلبات الخدمات'}</h1>
          <p className="mt-1 text-muted-foreground">
            {isEnglish
              ? 'Track requests you sent as a client, and requests received by you as a service provider.'
              : 'متابعة الطلبات التي أرسلتها كعميل، والطلبات الواردة إليك كمقدم خدمة.'}
          </p>
        </section>

        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6 text-sm text-primary">{feedback}</CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{isEnglish ? 'My Requests as a Client' : 'طلباتي كعميل'}</CardTitle>
              <CardDescription>
                {isEnglish
                  ? 'Every service request you sent from the services interface.'
                  : 'كل طلب خدمة قمت بإرساله من واجهة الخدمات.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {outgoingRequests.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  {isEnglish ? 'There are no service requests sent yet.' : 'لا توجد طلبات خدمات مرسلة حتى الآن.'}
                </div>
              ) : null}

              {outgoingRequests.map((request) => (
                <div key={request.id} className="space-y-3 rounded-2xl border border-border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">{request.requestTitle}</h3>
                      <p className="text-sm text-muted-foreground">
                        {isEnglish ? 'Service:' : 'الخدمة:'} {request.serviceTitle} | {isEnglish ? 'Provider:' : 'مقدم الخدمة:'} {request.provider}
                      </p>
                    </div>
                    <Badge className={getStatusBadge(request.status)}>
                      {getDisplayStatusLabel(request.status, isEnglish)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{request.details}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span>{isEnglish ? 'Price:' : 'السعر:'} {request.price}</span>
                    <span>{isEnglish ? 'Deadline:' : 'الموعد:'} {getDisplayDurationLabel(request.deadline, isEnglish)}</span>
                    <span>{isEnglish ? 'Sent at:' : 'تاريخ الإرسال:'} {request.createdAt}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{isEnglish ? 'Incoming Requests' : 'الطلبات الواردة إليك'}</CardTitle>
              <CardDescription>
                {isEnglish
                  ? 'Service requests received by you as a provider.'
                  : 'طلبات خدمات وصلت إليك كمقدم خدمة.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {incomingRequests.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  {isEnglish ? 'There are no incoming requests yet.' : 'لا توجد طلبات واردة حتى الآن.'}
                </div>
              ) : null}

              {incomingRequests.map((request) => (
                <div key={request.id} className="space-y-3 rounded-2xl border border-border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">{request.requestTitle}</h3>
                      <p className="text-sm text-muted-foreground">
                        {isEnglish ? 'From:' : 'من:'} {request.client} | {isEnglish ? 'Service:' : 'الخدمة:'} {request.serviceTitle}
                      </p>
                    </div>
                    <Badge className={getStatusBadge(request.status)}>
                      {getDisplayStatusLabel(request.status, isEnglish)}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground">{request.details}</p>

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span>{isEnglish ? 'Price:' : 'السعر:'} {request.price}</span>
                    <span>{isEnglish ? 'Requested deadline:' : 'الموعد المطلوب:'} {getDisplayDurationLabel(request.deadline, isEnglish)}</span>
                    <span>{isEnglish ? 'Sent at:' : 'تاريخ الإرسال:'} {request.createdAt}</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(request.id, 'مقبول', request.requestTitle)}
                      disabled={request.status !== 'بانتظار المراجعة'}
                    >
                      <CheckCircle2 className="ml-2 size-4" />
                      {isEnglish ? 'Accept' : 'قبول'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange(request.id, 'مرفوض', request.requestTitle)}
                      disabled={request.status !== 'بانتظار المراجعة'}
                    >
                      <XCircle className="ml-2 size-4" />
                      {isEnglish ? 'Reject' : 'رفض'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleStatusChange(request.id, 'مؤجل', request.requestTitle)}
                      disabled={request.status !== 'بانتظار المراجعة'}
                    >
                      <Clock3 className="ml-2 size-4" />
                      {isEnglish ? 'Follow up later' : 'متابعة لاحقًا'}
                    </Button>
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
