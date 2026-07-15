import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { CheckCircle2, MessageSquare, RefreshCw, XCircle } from 'lucide-react';
import DashboardLayout from '@/app/components/layout';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui';
import { getApiErrorMessage, getValidationErrors } from '@/app/api/client';
import { startConversation } from '@/app/api/pages/user/serviceRequests';
import { acceptServiceRequest, getMyServiceRequests, getReceivedServiceRequests, rejectServiceRequest, type ServiceRequest } from '@/app/api/pages/user/serviceRequests';
import { useLanguage } from '@/app/providers/LanguageProvider';

function statusLabel(status: ServiceRequest['status'], isEnglish: boolean) {
  if (status === 'accepted') return isEnglish ? 'Accepted' : 'مقبول';
  if (status === 'rejected') return isEnglish ? 'Rejected' : 'مرفوض';
  return isEnglish ? 'Pending' : 'قيد الانتظار';
}

function RequestList({ items, incoming, isEnglish, busyId, onDecision, onMessage }: {
  items: ServiceRequest[];
  incoming: boolean;
  isEnglish: boolean;
  busyId: number | null;
  onDecision: (id: number, decision: 'accept' | 'reject') => void;
  onMessage: (request: ServiceRequest, incoming: boolean) => void;
}) {
  if (!items.length) {
    return <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">{isEnglish ? 'No service requests yet.' : 'لا توجد طلبات خدمات حتى الآن.'}</div>;
  }
  return <div className="space-y-4">{items.map((request) => (
    <div key={request.id} className="space-y-3 rounded-lg border p-4">
      <div className="flex items-start justify-between gap-3">
        <div><h3 className="font-semibold">{request.title}</h3><p className="text-sm text-muted-foreground">{incoming ? request.client?.name : request.service?.user?.name} · {request.service?.title}</p></div>
        <Badge variant="outline">{statusLabel(request.status, isEnglish)}</Badge>
      </div>
      <p className="text-sm text-muted-foreground">{request.description}</p>
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground"><span>{request.delivery_days} {isEnglish ? 'days' : 'يوم'}</span><span>{request.created_at ? new Date(request.created_at).toLocaleDateString(isEnglish ? 'en' : 'ar') : ''}</span></div>
      {incoming && request.status === 'pending' ? <div className="flex gap-2"><Button size="sm" disabled={busyId === request.id} onClick={() => onDecision(request.id, 'accept')}><CheckCircle2 className="me-2 size-4" />{isEnglish ? 'Accept' : 'قبول'}</Button><Button size="sm" variant="outline" disabled={busyId === request.id} onClick={() => onDecision(request.id, 'reject')}><XCircle className="me-2 size-4" />{isEnglish ? 'Reject' : 'رفض'}</Button></div> : null}
      {request.status === 'accepted' ? (
        <Button size="sm" variant="outline" disabled={busyId === request.id} onClick={() => onMessage(request, incoming)}>
          <MessageSquare className="me-2 size-4" />
          {isEnglish ? 'Message the other party' : 'مراسلة الطرف الآخر'}
        </Button>
      ) : null}
    </div>
  ))}</div>;
}

export default function ServiceRequests() {
  const navigate = useNavigate();
  const { isEnglish, language } = useLanguage();
  const [sent, setSent] = useState<ServiceRequest[]>([]);
  const [received, setReceived] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [myRequests, receivedRequests] = await Promise.all([getMyServiceRequests(), getReceivedServiceRequests()]);
      setSent(myRequests);
      setReceived(receivedRequests);
    } catch {
      setError(isEnglish ? 'Unable to load service requests.' : 'تعذر تحميل طلبات الخدمات');
    } finally {
      setLoading(false);
    }
  }, [isEnglish]);

  useEffect(() => { load(); }, [load]);

  const decide = async (id: number, decision: 'accept' | 'reject') => {
    try {
      setBusyId(id);
      if (decision === 'accept') {
        const response = await acceptServiceRequest(id);
        const rejectedIds = new Set(response.rejected_request_ids);
        setReceived((current) => current.map((item) => {
          if (item.id === id) return { ...item, status: 'accepted' };
          if (rejectedIds.has(item.id)) return { ...item, status: 'rejected' };
          return item;
        }));
      } else {
        await rejectServiceRequest(id);
        setReceived((current) => current.map((item) => item.id === id ? { ...item, status: 'rejected' } : item));
      }
    } catch (requestError) {
      const validationMessage = Object.values(getValidationErrors(requestError)).flat()[0];
      setError(
        validationMessage ||
          getApiErrorMessage(requestError) ||
          (isEnglish ? 'The request could not be updated.' : 'تعذر تحديث حالة الطلب'),
      );
    } finally {
      setBusyId(null);
    }
  };

  const openConversation = async (request: ServiceRequest, incoming: boolean) => {
    const otherUserId = incoming ? request.client?.id : request.service?.user?.id;
    if (!otherUserId) {
      setError(isEnglish ? 'The other party could not be identified.' : 'تعذر تحديد الطرف الآخر');
      return;
    }

    try {
      setBusyId(request.id);
      const conversation = await startConversation(otherUserId);
      navigate(`/messages?conversation=${conversation.id}`);
    } catch {
      setError(isEnglish ? 'Unable to open the conversation.' : 'تعذر فتح المحادثة');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-bold">{isEnglish ? 'Service Requests' : 'طلبات الخدمات'}</h1>
          <Button variant="outline" onClick={load} disabled={loading}>
            <RefreshCw className={`me-2 size-4 ${loading ? 'animate-spin' : ''}`} />
            {isEnglish ? 'Refresh requests' : 'تحديث الطلبات'}
          </Button>
        </div>
        {loading ? <div className="h-64 animate-pulse rounded-lg bg-muted" /> : error ? <Card><CardContent className="py-12 text-center"><p>{error}</p><Button className="mt-4" onClick={load}><RefreshCw className="me-2 size-4" />{isEnglish ? 'Try again' : 'إعادة المحاولة'}</Button></CardContent></Card> : (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card><CardHeader><CardTitle>{isEnglish ? 'Requests I Sent' : 'الطلبات التي أرسلتها'}</CardTitle></CardHeader><CardContent><RequestList items={sent} incoming={false} isEnglish={isEnglish} busyId={busyId} onDecision={decide} onMessage={openConversation} /></CardContent></Card>
            <Card><CardHeader><CardTitle>{isEnglish ? 'Requests I Received' : 'الطلبات الواردة إلي'}</CardTitle></CardHeader><CardContent><RequestList items={received} incoming isEnglish={isEnglish} busyId={busyId} onDecision={decide} onMessage={openConversation} /></CardContent></Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
