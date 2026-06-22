import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { MessageSquare, RefreshCw } from 'lucide-react';
import DashboardLayout from '@/app/components/layout';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui';
import {
  cancelContract,
  completeContract,
  getCompanyContracts,
  getContracts,
  startContract,
  startConversation,
  type Contract,
} from '@/app/api/endpoints';
import { useAuth } from '@/app/providers/AuthProvider';
import { useLanguage } from '@/app/providers/LanguageProvider';

function contractTitle(contract: Contract, isEnglish: boolean) {
  return contract.service_request?.title || contract.project?.title || contract.job_post?.title ||
    (isEnglish ? `Contract #${contract.id}` : `العقد رقم ${contract.id}`);
}

function statusLabel(status: Contract['status'], isEnglish: boolean) {
  const labels: Record<Contract['status'], [string, string]> = {
    pending: ['Pending funding', 'بانتظار البدء'],
    funded: ['Funded', 'ممول'],
    in_progress: ['In progress', 'قيد التنفيذ'],
    completed: ['Completed', 'مكتمل'],
    canceled: ['Canceled', 'ملغى'],
    refunded: ['Refunded', 'تم رد المبلغ'],
    dispute: ['In dispute', 'قيد النزاع'],
  };
  return labels[status][isEnglish ? 0 : 1];
}

export function ContractsPage({ userType = 'user' }: { userType?: 'user' | 'company' }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isEnglish, language } = useLanguage();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setContracts(userType === 'company' ? await getCompanyContracts() : await getContracts());
    } catch {
      setError(isEnglish ? 'Unable to load contracts.' : 'تعذر تحميل العقود');
    } finally {
      setLoading(false);
    }
  }, [isEnglish, userType]);

  useEffect(() => {
    load();
  }, [load]);

  const runAction = async (contract: Contract, action: 'start' | 'complete' | 'cancel') => {
    try {
      setBusyId(contract.id);
      if (action === 'start') await startContract(contract.id);
      else if (action === 'complete') await completeContract(contract.id);
      else await cancelContract(contract.id);
      await load();
    } catch {
      setError(isEnglish ? 'The contract could not be updated.' : 'تعذر تحديث العقد');
    } finally {
      setBusyId(null);
    }
  };

  const messageOtherParty = async (contract: Contract) => {
    const otherId = contract.client_id === user?.id ? contract.freelancer_id : contract.client_id;
    try {
      setBusyId(contract.id);
      const conversation = await startConversation(otherId);
      const path = userType === 'company' ? '/company/messages' : '/messages';
      navigate(`${path}?conversation=${conversation.id}`);
    } catch {
      setError(isEnglish ? 'Unable to open the conversation.' : 'تعذر فتح المحادثة');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <DashboardLayout userType={userType === 'company' ? 'company' : 'user'}>
      <div className="space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h1 className="text-3xl font-bold">{isEnglish ? 'Contracts' : 'العقود'}</h1><p className="mt-1 text-muted-foreground">{isEnglish ? 'Contracts created after accepting projects or service requests.' : 'العقود المنشأة بعد قبول المشاريع أو طلبات الخدمات.'}</p></div>
          <Button variant="outline" onClick={load}><RefreshCw className="me-2 size-4" />{isEnglish ? 'Refresh' : 'تحديث'}</Button>
        </div>

        {error ? <Card className="border-destructive/30"><CardContent className="py-3 text-sm text-destructive">{error}</CardContent></Card> : null}

        {loading ? <div className="h-56 animate-pulse rounded-lg bg-muted" /> : contracts.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">{isEnglish ? 'No contracts yet.' : 'لا توجد عقود حتى الآن.'}</CardContent></Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {contracts.map((contract) => {
              const isClient = contract.client_id === user?.id;
              const other = isClient ? contract.freelancer : contract.client;
              return (
                <Card key={contract.id}>
                  <CardHeader><div className="flex items-start justify-between gap-3"><div><CardTitle>{contractTitle(contract, isEnglish)}</CardTitle><p className="mt-1 text-sm text-muted-foreground">{isEnglish ? 'With' : 'مع'} {other.name}</p></div><Badge variant="outline">{statusLabel(contract.status, isEnglish)}</Badge></div></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-2 text-sm sm:grid-cols-2"><p>{isEnglish ? 'Amount:' : 'المبلغ:'} {contract.amount}</p><p>{isEnglish ? 'Provider net:' : 'صافي مقدم الخدمة:'} {contract.freelancer_amount}</p></div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" disabled={busyId === contract.id} onClick={() => messageOtherParty(contract)}><MessageSquare className="me-2 size-4" />{isEnglish ? 'Message other party' : 'مراسلة الطرف الآخر'}</Button>
                      {isClient && contract.status === 'pending' ? <Button disabled={busyId === contract.id} onClick={() => runAction(contract, 'start')}>{isEnglish ? 'Start contract' : 'بدء العقد'}</Button> : null}
                      {isClient && ['funded', 'in_progress'].includes(contract.status) ? <Button disabled={busyId === contract.id} onClick={() => runAction(contract, 'complete')}>{isEnglish ? 'Confirm completion' : 'تأكيد الإكمال'}</Button> : null}
                      {!['completed', 'canceled', 'refunded'].includes(contract.status) ? <Button variant="destructive" disabled={busyId === contract.id} onClick={() => runAction(contract, 'cancel')}>{isEnglish ? 'Cancel' : 'إلغاء'}</Button> : null}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function Contracts() {
  return <ContractsPage />;
}
