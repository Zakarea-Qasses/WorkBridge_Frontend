import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { LoaderCircle, MessageSquare, RefreshCw, ShieldAlert } from 'lucide-react';
import DashboardLayout from '@/app/components/layout';
import ContractReviewPanel from '@/app/components/contracts/ContractReviewPanel';
import ContractIssueForm from '@/app/components/contracts/ContractIssueForm';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/app/components/ui';
import { getApiErrorMessage, getValidationErrors } from '@/app/api/client';
import {
  cancelContract,
  completeContract,
  createContractIssue,
  getCompanyContracts,
  getContracts,
  startContract,
  type Contract,
} from '@/app/api/pages/user/contracts';
import { startConversation } from '@/app/api/pages/user/contracts';
import { useAuth } from '@/app/providers/AuthProvider';
import { formatUsd } from '@/app/utils/money';
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
  const [needsWalletTopUp, setNeedsWalletTopUp] = useState(false);
  const [issueContractId, setIssueContractId] = useState<number | null>(null);

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
      setError('');
      setNeedsWalletTopUp(false);
      if (action === 'start') await startContract(contract.id);
      else if (action === 'complete') await completeContract(contract.id);
      else await cancelContract(contract.id);
      await load();
    } catch (actionError) {
      const validationErrors = getValidationErrors(actionError);
      const validationMessage = Object.values(validationErrors).flat()[0];
      const message = validationMessage || getApiErrorMessage(actionError);
      const insufficientBalance =
        Boolean(validationErrors.amount?.length) ||
        message.toLowerCase().includes('balance') ||
        message.includes('الرصيد') ||
        message.includes('المحفظة');

      setNeedsWalletTopUp(action === 'start' && insufficientBalance);
      setError(
        message ||
          (isEnglish ? 'The contract could not be updated.' : 'تعذر تحديث العقد'),
      );
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

  const updateContractInList = (updatedContract: Contract) => {
    setContracts((current) =>
      current.map((contract) => (contract.id === updatedContract.id ? updatedContract : contract)),
    );
  };

  return (
    <DashboardLayout userType={userType === 'company' ? 'company' : 'user'}>
      <div className="space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h1 className="text-3xl font-bold">{isEnglish ? 'Contracts' : 'العقود'}</h1><p className="mt-1 text-muted-foreground">{isEnglish ? 'Contracts created after accepting projects or service requests.' : 'العقود المنشأة بعد قبول المشاريع أو طلبات الخدمات.'}</p></div>
          <Button variant="outline" onClick={load}><RefreshCw className="me-2 size-4" />{isEnglish ? 'Refresh' : 'تحديث'}</Button>
        </div>

        {error ? (
          <Card className="border-destructive/30">
            <CardContent className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm text-destructive">
              <span>{error}</span>
              {needsWalletTopUp ? (
                <Button asChild size="sm">
                  <Link to={userType === 'company' ? '/company/wallet/top-up' : '/wallet/top-up'}>
                    {isEnglish ? 'Top up wallet' : 'شحن المحفظة'}
                  </Link>
                </Button>
              ) : null}
            </CardContent>
          </Card>
        ) : null}

        {loading ? <div className="h-56 animate-pulse rounded-lg bg-muted" /> : contracts.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">{isEnglish ? 'No contracts yet.' : 'لا توجد عقود حتى الآن.'}</CardContent></Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {contracts.map((contract) => {
              const isClient = contract.client_id === user?.id;
              const other = isClient ? contract.freelancer : contract.client;
              const canOpenIssue = ['funded', 'in_progress'].includes(contract.status);
              return (
                <Card key={contract.id}>
                  <CardHeader><div className="flex items-start justify-between gap-3"><div><CardTitle>{contractTitle(contract, isEnglish)}</CardTitle><p className="mt-1 text-sm text-muted-foreground">{isEnglish ? 'With' : 'مع'} {other.name}</p></div><Badge variant="outline">{statusLabel(contract.status, isEnglish)}</Badge></div></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-2 text-sm sm:grid-cols-2"><p>{isEnglish ? 'Amount:' : 'المبلغ:'} {formatUsd(contract.amount, isEnglish ? 'en' : 'ar')}</p><p>{isEnglish ? 'Provider net:' : 'صافي مقدم الخدمة:'} {formatUsd(contract.freelancer_amount, isEnglish ? 'en' : 'ar')}</p></div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" disabled={busyId === contract.id} onClick={() => messageOtherParty(contract)}><MessageSquare className="me-2 size-4" />{isEnglish ? 'Message other party' : 'مراسلة الطرف الآخر'}</Button>
                      {isClient && contract.status === 'pending' ? (
                        <Button
                          disabled={busyId === contract.id}
                          onClick={() => runAction(contract, 'start')}
                        >
                          {busyId === contract.id ? (
                            <LoaderCircle className="me-2 size-4 animate-spin" />
                          ) : null}
                          {isEnglish ? 'Fund and start contract' : 'تمويل وبدء العقد'}
                        </Button>
                      ) : null}
                      {isClient && ['funded', 'in_progress'].includes(contract.status) ? <Button disabled={busyId === contract.id} onClick={() => runAction(contract, 'complete')}>{isEnglish ? 'Confirm completion' : 'تأكيد الإكمال'}</Button> : null}
                      {!['completed', 'canceled', 'refunded', 'dispute'].includes(contract.status) ? <Button variant="destructive" disabled={busyId === contract.id} onClick={() => runAction(contract, 'cancel')}>{isEnglish ? 'Cancel' : 'إلغاء'}</Button> : null}
                      <Button
                        variant="outline"
                        className="border-amber-300 text-amber-700 hover:bg-amber-50 hover:text-amber-800"
                        disabled={busyId === contract.id || !canOpenIssue}
                        title={!canOpenIssue ? (isEnglish ? 'Available after funding and starting the contract' : 'يتاح بعد تمويل العقد وبدء تنفيذه') : undefined}
                        onClick={() => setIssueContractId(contract.id)}
                      >
                        <ShieldAlert className="me-2 size-4" />
                        {isEnglish ? 'Open complaint or dispute' : 'فتح نزاع أو شكوى'}
                      </Button>
                    </div>
                    {issueContractId === contract.id ? (
                      <ContractIssueForm
                        contractId={contract.id}
                        otherPartyName={other.name}
                        isEnglish={isEnglish}
                        submitting={busyId === contract.id}
                        onCancel={() => setIssueContractId(null)}
                        onSubmit={async (payload) => {
                          setBusyId(contract.id);
                          try {
                            await createContractIssue(contract.id, payload);
                            setIssueContractId(null);
                            await load();
                          } finally {
                            setBusyId(null);
                          }
                        }}
                      />
                    ) : null}
                    <ContractReviewPanel
                      contract={contract}
                      currentUserId={user?.id}
                      isEnglish={isEnglish}
                      onChanged={updateContractInList}
                    />
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
