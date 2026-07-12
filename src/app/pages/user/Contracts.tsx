import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { LoaderCircle, MessageSquare, Paperclip, RefreshCw, ShieldAlert, X } from 'lucide-react';
import DashboardLayout from '@/app/components/layout';
import ContractReviewPanel from '@/app/components/contracts/ContractReviewPanel';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Textarea,
} from '@/app/components/ui';
import { getApiErrorMessage, getValidationErrors } from '@/app/api/client';
import {
  cancelContract,
  completeContract,
  createContractDispute,
  getCompanyContracts,
  getContracts,
  startContract,
  type Contract,
} from '@/app/api/pages/user/contracts';
import { startConversation } from '@/app/api/pages/user/contracts';
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
  const [needsWalletTopUp, setNeedsWalletTopUp] = useState(false);
  const [disputeContractId, setDisputeContractId] = useState<number | null>(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeAttachments, setDisputeAttachments] = useState<File[]>([]);
  const [disputeErrors, setDisputeErrors] = useState<Record<string, string[]>>({});

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

  const closeDisputeForm = () => {
    setDisputeContractId(null);
    setDisputeReason('');
    setDisputeAttachments([]);
    setDisputeErrors({});
  };

  const submitDispute = async (contract: Contract) => {
    const reason = disputeReason.trim();
    if (!reason) {
      setDisputeErrors({
        description: [isEnglish ? 'Please explain the dispute reason.' : 'يرجى توضيح سبب النزاع.'],
      });
      return;
    }

    try {
      setBusyId(contract.id);
      setError('');
      setDisputeErrors({});
      await createContractDispute(contract.id, {
        description: reason,
        attachments: disputeAttachments,
      });
      closeDisputeForm();
      await load();
    } catch (submitError) {
      setDisputeErrors(getValidationErrors(submitError));
      setError(getApiErrorMessage(submitError));
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
              return (
                <Card key={contract.id}>
                  <CardHeader><div className="flex items-start justify-between gap-3"><div><CardTitle>{contractTitle(contract, isEnglish)}</CardTitle><p className="mt-1 text-sm text-muted-foreground">{isEnglish ? 'With' : 'مع'} {other.name}</p></div><Badge variant="outline">{statusLabel(contract.status, isEnglish)}</Badge></div></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-2 text-sm sm:grid-cols-2"><p>{isEnglish ? 'Amount:' : 'المبلغ:'} {contract.amount}</p><p>{isEnglish ? 'Provider net:' : 'صافي مقدم الخدمة:'} {contract.freelancer_amount}</p></div>
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
                      {['funded', 'in_progress'].includes(contract.status) ? (
                        <Button
                          variant="outline"
                          className="border-amber-300 text-amber-700 hover:bg-amber-50 hover:text-amber-800"
                          disabled={busyId === contract.id}
                          onClick={() => {
                            setDisputeContractId(contract.id);
                            setDisputeReason('');
                            setDisputeAttachments([]);
                            setDisputeErrors({});
                          }}
                        >
                          <ShieldAlert className="me-2 size-4" />
                          {isEnglish ? 'Open dispute' : 'فتح نزاع'}
                        </Button>
                      ) : null}
                    </div>
                    {disputeContractId === contract.id ? (
                      <div className="space-y-4 rounded-md border border-amber-200 bg-amber-50/40 p-4">
                        <div>
                          <h3 className="font-semibold text-amber-900">
                            {isEnglish ? 'Open a contract dispute' : 'فتح نزاع على العقد'}
                          </h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {isEnglish
                              ? `Contract #${contract.id} with ${other.name}. The request and evidence will be sent to the admin.`
                              : `العقد رقم ${contract.id} مع ${other.name}. سيتم إرسال السبب والأدلة إلى الأدمن.`}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`dispute-reason-${contract.id}`}>
                            {isEnglish ? 'Dispute reason' : 'سبب النزاع'}
                          </Label>
                          <Textarea
                            id={`dispute-reason-${contract.id}`}
                            rows={5}
                            value={disputeReason}
                            onChange={(event) => {
                              setDisputeReason(event.target.value);
                              setDisputeErrors((current) => ({ ...current, description: [] }));
                            }}
                          />
                          {disputeErrors.description?.[0] ? (
                            <p className="text-xs text-destructive">{disputeErrors.description[0]}</p>
                          ) : null}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`dispute-files-${contract.id}`}>
                            {isEnglish ? 'Evidence attachments' : 'صور ومستندات الأدلة'}
                          </Label>
                          <Input
                            id={`dispute-files-${contract.id}`}
                            type="file"
                            multiple
                            accept=".jpg,.jpeg,.png,.webp,.gif,.pdf,.doc,.docx,.xls,.xlsx,.zip,.txt"
                            onChange={(event) => {
                              setDisputeAttachments((current) => [
                                ...current,
                                ...Array.from(event.target.files || []),
                              ]);
                              event.target.value = '';
                            }}
                          />
                          <p className="text-xs text-muted-foreground">
                            {isEnglish
                              ? 'Optional: upload images or documents that support your claim, up to 10 MB each.'
                              : 'اختياري: ارفع صوراً أو مستندات تدعم سبب النزاع، بحد أقصى 10 ميغابايت للملف.'}
                          </p>
                          {disputeAttachments.length ? (
                            <div className="space-y-2">
                              {disputeAttachments.map((file, index) => (
                                <div
                                  key={`${file.name}-${file.lastModified}-${index}`}
                                  className="flex items-center justify-between gap-2 rounded-md border bg-background px-3 py-2 text-sm"
                                >
                                  <span className="flex min-w-0 items-center gap-2">
                                    <Paperclip className="size-4 shrink-0" />
                                    <span className="truncate">{file.name}</span>
                                  </span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      setDisputeAttachments((current) =>
                                        current.filter((_, itemIndex) => itemIndex !== index),
                                      )
                                    }
                                  >
                                    <X className="size-4" />
                                    <span className="sr-only">{isEnglish ? 'Remove' : 'إزالة'}</span>
                                  </Button>
                                </div>
                              ))}
                            </div>
                          ) : null}
                          {disputeErrors.attachments?.[0] ? (
                            <p className="text-xs text-destructive">{disputeErrors.attachments[0]}</p>
                          ) : null}
                        </div>

                        <div className="flex flex-wrap justify-end gap-2">
                          <Button type="button" variant="outline" onClick={closeDisputeForm}>
                            {isEnglish ? 'Cancel' : 'إلغاء'}
                          </Button>
                          <Button
                            type="button"
                            disabled={busyId === contract.id}
                            onClick={() => void submitDispute(contract)}
                          >
                            {busyId === contract.id ? (
                              <LoaderCircle className="me-2 size-4 animate-spin" />
                            ) : (
                              <ShieldAlert className="me-2 size-4" />
                            )}
                            {isEnglish ? 'Submit dispute' : 'إرسال النزاع'}
                          </Button>
                        </div>
                      </div>
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
