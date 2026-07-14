import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  FileText,
  LoaderCircle,
  MessageSquare,
  PlayCircle,
  RefreshCw,
  ShieldAlert,
  User,
  XCircle,
} from 'lucide-react';
import DashboardLayout from '@/app/components/layout';
import ContractReviewPanel from '@/app/components/contracts/ContractReviewPanel';
import ContractIssueForm from '@/app/components/contracts/ContractIssueForm';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, useConfirmDialog } from '@/app/components/ui';
import { ApiError, getApiErrorMessage, getValidationErrors } from '@/app/api/client';
import {
  cancelContract,
  completeContract,
  createContractIssue,
  getCompanyContractsPage,
  startContract,
  type Contract,
  type PaginatedResponse,
} from '@/app/api/pages/company/contracts';
import { startConversation } from '@/app/api/pages/company/contracts';
import { useAuth } from '@/app/providers/AuthProvider';
import { formatUsd } from '@/app/utils/money';
import { useLanguage } from '@/app/providers/LanguageProvider';

function contractTitle(contract: Contract, isEnglish: boolean) {
  return (
    contract.service_request?.title ||
    contract.job_post?.title ||
    contract.project?.title ||
    (isEnglish ? `Contract #${contract.id}` : `العقد رقم ${contract.id}`)
  );
}

function statusLabel(status: Contract['status'], isEnglish: boolean) {
  const labels: Record<Contract['status'], [string, string]> = {
    pending: ['Pending funding', 'بانتظار التمويل'],
    funded: ['Funded', 'ممولة'],
    in_progress: ['In progress', 'قيد التنفيذ'],
    completed: ['Completed', 'مكتمل'],
    canceled: ['Canceled', 'ملغى'],
    refunded: ['Refunded', 'تم رد المبلغ'],
    dispute: ['In dispute', 'قيد النزاع'],
  };

  return labels[status]?.[isEnglish ? 0 : 1] || status;
}

function statusClasses(status: Contract['status']) {
  if (status === 'completed') {
    return 'border-green-200 bg-green-50 text-green-700';
  }
  if (status === 'canceled' || status === 'refunded') {
    return 'border-red-200 bg-red-50 text-red-700';
  }
  if (status === 'dispute') {
    return 'border-orange-200 bg-orange-50 text-orange-700';
  }
  if (status === 'pending') {
    return 'border-amber-200 bg-amber-50 text-amber-800';
  }
  return 'border-blue-200 bg-blue-50 text-blue-700';
}

function sourceLabel(contract: Contract, isEnglish: boolean) {
  if (contract.service_request) {
    return { type: isEnglish ? 'Service' : 'خدمة', title: contract.service_request.title };
  }
  if (contract.job_post) {
    return { type: isEnglish ? 'Job' : 'وظيفة', title: contract.job_post.title };
  }
  if (contract.project) {
    return { type: isEnglish ? 'Project' : 'مشروع', title: contract.project.title };
  }

  return { type: isEnglish ? 'Unspecified source' : 'مصدر العقد غير محدد', title: '' };
}

function formatDate(value: string | null | undefined, isEnglish: boolean) {
  if (!value) {
    return isEnglish ? 'Not available' : 'غير متوفر';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return isEnglish ? 'Not available' : 'غير متوفر';
  }

  return new Intl.DateTimeFormat(isEnglish ? 'en' : 'ar', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function formatAmount(value: number | string | null | undefined, isEnglish: boolean) {
  if (value === null || value === undefined || value === '') {
    return isEnglish ? 'Amount not set' : 'لم يتم تحديد قيمة العقد';
  }

  return formatUsd(value, isEnglish ? 'en' : 'ar');
}

function getContractsErrorMessage(error: unknown, isEnglish: boolean) {
  if (error instanceof ApiError) {
    if (error.status === 403) {
      return isEnglish ? 'You are not allowed to view company contracts.' : 'ليس لديك صلاحية لعرض عقود الشركة.';
    }
    if (error.status === 404) {
      return isEnglish
        ? 'The contract was not found or is no longer available.'
        : 'العقد غير موجود أو لم يعد متاحا.';
    }
    if (error.status >= 500) {
      return isEnglish ? 'Could not load company contracts.' : 'تعذر تحميل عقود الشركة.';
    }
  }

  return getApiErrorMessage(error);
}

function getContractActionError(error: unknown, isEnglish: boolean) {
  const validationErrors = getValidationErrors(error);
  const validationMessage = Object.values(validationErrors).flat()[0];
  return (
    validationMessage ||
    getApiErrorMessage(error) ||
    (isEnglish ? 'The contract could not be updated.' : 'تعذر تحديث العقد.')
  );
}

function isBalanceError(message: string, validationErrors: Record<string, string[]>) {
  return (
    Boolean(validationErrors.amount?.length) ||
    /balance|wallet/i.test(message) ||
    message.includes('الرصيد') ||
    message.includes('المحفظة')
  );
}

export default function CompanyContracts() {
  const navigate = useNavigate();
  const { isEnglish, language } = useLanguage();
  const { user } = useAuth();
  const requestIdRef = useRef(0);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [pagination, setPagination] = useState<PaginatedResponse<Contract> | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [needsWalletTopUp, setNeedsWalletTopUp] = useState(false);
  const [issueContractId, setIssueContractId] = useState<number | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog({
    title: isEnglish ? 'Confirm action' : 'تأكيد العملية',
    confirmLabel: isEnglish ? 'Confirm' : 'تأكيد',
    cancelLabel: isEnglish ? 'Cancel' : 'إلغاء',
  });

  const load = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setLoading(true);
    setError('');
    setContracts([]);

    try {
      const response = await getCompanyContractsPage(page);
      if (requestIdRef.current !== requestId) return;

      setPagination(response);
      setContracts(response.data);
    } catch (loadError) {
      if (requestIdRef.current !== requestId) return;

      setPagination(null);
      setContracts([]);
      setError(getContractsErrorMessage(loadError, isEnglish));
    } finally {
      if (requestIdRef.current === requestId) {
        setLoading(false);
      }
    }
  }, [isEnglish, page]);

  useEffect(() => {
    requestIdRef.current += 1;
    setContracts([]);
    setPagination(null);
    setPage(1);
  }, [user?.id]);

  useEffect(() => {
    void load();
  }, [load]);

  const runAction = async (contract: Contract, action: 'start' | 'complete' | 'cancel') => {
    const confirmMessage =
      action === 'start'
        ? isEnglish
          ? 'Fund and start this contract?'
          : 'هل تريد تمويل وبدء هذا العقد؟'
        : action === 'complete'
          ? isEnglish
            ? 'Confirm this contract as completed?'
            : 'هل تريد تأكيد إكمال هذا العقد؟'
          : isEnglish
            ? 'Cancel this contract?'
            : 'هل تريد إلغاء هذا العقد؟';

    const confirmed = await confirm({
      title:
        action === 'cancel'
          ? isEnglish ? 'Cancel contract' : 'إلغاء العقد'
          : isEnglish ? 'Confirm contract action' : 'تأكيد إجراء العقد',
      description: confirmMessage,
      destructive: action === 'cancel',
    });
    if (!confirmed) return;

    try {
      setBusyId(contract.id);
      setError('');
      setSuccess('');
      setNeedsWalletTopUp(false);

      if (action === 'start') {
        await startContract(contract.id);
        setSuccess(isEnglish ? 'Contract funded and started.' : 'تم تمويل العقد وبدؤه.');
      } else if (action === 'complete') {
        await completeContract(contract.id);
        setSuccess(isEnglish ? 'Contract marked as completed.' : 'تم تأكيد إكمال العقد.');
      } else {
        await cancelContract(contract.id);
        setSuccess(isEnglish ? 'Contract canceled.' : 'تم إلغاء العقد.');
      }

      await load();
    } catch (actionError) {
      const validationErrors = getValidationErrors(actionError);
      const message = getContractActionError(actionError, isEnglish);
      setNeedsWalletTopUp(action === 'start' && isBalanceError(message, validationErrors));
      setError(message);
    } finally {
      setBusyId(null);
    }
  };

  const messageOtherParty = async (contract: Contract) => {
    const otherId = contract.client_id === user?.id ? contract.freelancer_id : contract.client_id;
    if (!otherId) {
      setError(isEnglish ? 'Other party is unavailable.' : 'الطرف الثاني غير متاح.');
      return;
    }

    try {
      setBusyId(contract.id);
      setError('');
      const conversation = await startConversation(otherId);
      navigate(`/company/messages?conversation=${conversation.id}`);
    } catch (messageError) {
      setError(getApiErrorMessage(messageError) || (isEnglish ? 'Unable to open the conversation.' : 'تعذر فتح المحادثة.'));
    } finally {
      setBusyId(null);
    }
  };

  const updateContractInList = (updatedContract: Contract) => {
    setContracts((current) =>
      current.map((contract) => (contract.id === updatedContract.id ? updatedContract : contract)),
    );
  };

  const canGoPrevious = Boolean(pagination && pagination.current_page > 1);
  const canGoNext = Boolean(pagination && pagination.current_page < pagination.last_page);

  return (
    <DashboardLayout userType="company">
      <ConfirmDialog />
      <div className="space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{isEnglish ? 'Company Contracts' : 'عقود الشركة'}</h1>
            <p className="mt-1 text-muted-foreground">
              {isEnglish
                ? 'View and manage your company contracts.'
                : 'عرض  عقود الشركة.'}
            </p>
          </div>
          <Button variant="outline" disabled={loading} onClick={() => void load()}>
            {loading ? <LoaderCircle className="me-2 size-4 animate-spin" /> : <RefreshCw className="me-2 size-4" />}
            {isEnglish ? 'Refresh' : 'تحديث'}
          </Button>
        </div>

        {error ? (
          <Card className="border-destructive/30">
            <CardContent className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm text-destructive">
              <span>{error}</span>
              {needsWalletTopUp ? (
                <Button asChild size="sm">
                  <Link to="/company/wallet/top-up">{isEnglish ? 'Top up wallet' : 'شحن المحفظة'}</Link>
                </Button>
              ) : null}
            </CardContent>
          </Card>
        ) : null}

        {success ? (
          <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            <CheckCircle2 className="size-4" />
            {success}
          </div>
        ) : null}

        {loading ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {isEnglish ? 'Loading company contracts...' : 'جاري تحميل عقود الشركة...'}
            </p>
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-48 animate-pulse rounded-lg border bg-muted" />
            ))}
          </div>
        ) : error && contracts.length === 0 ? (
          <Card className="border-destructive/30">
            <CardContent className="flex min-h-52 flex-col items-center justify-center gap-4 text-center text-destructive">
              <AlertTriangle className="size-10" />
              <p>{error}</p>
              <Button variant="outline" onClick={() => void load()}>
                <RefreshCw className="me-2 size-4" />
                {isEnglish ? 'Try again' : 'إعادة المحاولة'}
              </Button>
            </CardContent>
          </Card>
        ) : contracts.length === 0 ? (
          <Card>
            <CardContent className="flex min-h-64 flex-col items-center justify-center gap-3 text-center text-muted-foreground">
              <FileText className="size-10" />
              <div>
                <p className="font-medium text-foreground">
                  {isEnglish ? 'No company contracts yet.' : 'لا توجد عقود للشركة حتى الآن.'}
                </p>
                <p className="mt-1 text-sm">
                  {isEnglish
                    ? 'Contracts will appear here after the system creates them from accepted service requests, job applicants, or projects.'
                    : 'ستظهر العقود هنا بعد قبول طلب خدمة أو متقدم على وظيفة أو مشروع، حسب آلية النظام.'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {contracts.map((contract) => {
              const source = sourceLabel(contract, isEnglish);
              const isClient = contract.client_id === user?.id;
              const otherParty = isClient ? contract.freelancer : contract.client;
              const isBusy = busyId === contract.id;
              const isJobContract = Boolean(contract.job_post_id);
              const canStart = !isJobContract && isClient && contract.status === 'pending';
              const canComplete = !isJobContract && isClient && ['funded', 'in_progress'].includes(contract.status);
              const canCancel = !['completed', 'canceled', 'refunded', 'dispute'].includes(contract.status);
              const issueStatusAllowsSubmission = ['funded', 'in_progress', 'dispute'].includes(contract.status);
              const canOpenIssue = issueStatusAllowsSubmission && !contract.has_opened_issue;

              return (
                <Card key={contract.id}>
                  <CardHeader>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <CardTitle>{contractTitle(contract, isEnglish)}</CardTitle>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {isEnglish ? 'Contract' : 'العقد'} #{contract.id}
                        </p>
                      </div>
                      <Badge variant="outline" className={statusClasses(contract.status)}>
                        {statusLabel(contract.status, isEnglish)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-3 text-sm md:grid-cols-2 xl:grid-cols-4">
                      <div>
                        <p className="text-xs text-muted-foreground">{isEnglish ? 'Other party' : 'الطرف الثاني'}</p>
                        <p className="flex items-center gap-1 font-medium">
                          <User className="size-4 text-primary" />
                          {otherParty?.name || (isEnglish ? 'Other party unavailable' : 'الطرف الثاني غير متاح')}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{isEnglish ? 'Source' : 'مصدر العقد'}</p>
                        <p className="font-medium">{source.title ? `${source.type}: ${source.title}` : source.type}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {isJobContract
                            ? (isEnglish ? 'Salary' : 'الراتب')
                            : (isEnglish ? 'Amount' : 'قيمة العقد')}
                        </p>
                        <p className="font-medium">
                          {isJobContract && Number(contract.amount) <= 0
                            ? (isEnglish ? 'Not specified' : 'غير محدد')
                            : formatAmount(contract.amount, isEnglish)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{isEnglish ? 'Created at' : 'تاريخ الإنشاء'}</p>
                        <p className="flex items-center gap-1 font-medium">
                          <Calendar className="size-4 text-primary" />
                          {formatDate(contract.created_at, isEnglish)}
                        </p>
                      </div>
                    </div>

                    {!isJobContract ? <div className="grid gap-3 text-sm md:grid-cols-2">
                      <div className="rounded-md border bg-muted/30 p-3">
                        <p className="text-xs text-muted-foreground">
                          {isEnglish ? 'Funded at' : 'تاريخ البدء / التمويل'}
                        </p>
                        <p className="font-medium">{formatDate(contract.funded_at, isEnglish)}</p>
                      </div>
                      <div className="rounded-md border bg-muted/30 p-3">
                        <p className="text-xs text-muted-foreground">{isEnglish ? 'Completed at' : 'تاريخ الإكمال'}</p>
                        <p className="font-medium">{formatDate(contract.completed_at, isEnglish)}</p>
                      </div>
                    </div> : null}

                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" disabled={isBusy} onClick={() => void messageOtherParty(contract)}>
                        <MessageSquare className="me-2 size-4" />
                        {isEnglish ? 'Message other party' : 'مراسلة الطرف الآخر'}
                      </Button>

                      {canStart ? (
                        <Button disabled={isBusy} onClick={() => void runAction(contract, 'start')}>
                          {isBusy ? <LoaderCircle className="me-2 size-4 animate-spin" /> : <PlayCircle className="me-2 size-4" />}
                          {isEnglish ? 'Fund and start' : 'تمويل وبدء العقد'}
                        </Button>
                      ) : null}

                      {canComplete ? (
                        <Button variant="secondary" disabled={isBusy} onClick={() => void runAction(contract, 'complete')}>
                          {isBusy ? <LoaderCircle className="me-2 size-4 animate-spin" /> : <CheckCircle2 className="me-2 size-4" />}
                          {isEnglish ? 'Confirm completion' : 'تأكيد الإكمال'}
                        </Button>
                      ) : null}

                      {canCancel ? (
                        <Button variant="destructive" disabled={isBusy} onClick={() => void runAction(contract, 'cancel')}>
                          {isBusy ? <LoaderCircle className="me-2 size-4 animate-spin" /> : <XCircle className="me-2 size-4" />}
                          {isEnglish ? 'Cancel contract' : 'إلغاء العقد'}
                        </Button>
                      ) : null}

                      <Button
                        variant="outline"
                        className="border-amber-300 text-amber-700 hover:bg-amber-50 hover:text-amber-800"
                        disabled={isBusy || !canOpenIssue}
                        title={
                          contract.has_opened_issue
                            ? (isEnglish ? 'You already submitted your case for this contract' : 'لقد أرسلت نزاعك على هذا العقد مسبقاً')
                            : !issueStatusAllowsSubmission
                              ? (isEnglish ? 'Available after starting the contract' : 'يتاح بعد بدء تنفيذ العقد')
                              : undefined
                        }
                        onClick={() => setIssueContractId(contract.id)}
                      >
                        <ShieldAlert className="me-2 size-4" />
                        {contract.has_opened_issue
                          ? (isEnglish ? 'Case submitted' : 'تم إرسال النزاع')
                          : (isEnglish ? 'Open complaint or dispute' : 'فتح نزاع أو شكوى')}
                      </Button>
                    </div>
                    {issueContractId === contract.id ? (
                      <ContractIssueForm
                        contractId={contract.id}
                        otherPartyName={otherParty?.name || (isEnglish ? 'Other party' : 'الطرف الثاني')}
                        isEnglish={isEnglish}
                        submitting={isBusy}
                        onCancel={() => setIssueContractId(null)}
                        onSubmit={async (payload) => {
                          setBusyId(contract.id);
                          try {
                            await createContractIssue(contract.id, payload);
                            setIssueContractId(null);
                            setSuccess(isEnglish ? 'Request sent to the admin.' : 'تم إرسال الطلب إلى الأدمن.');
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

            {pagination && pagination.last_page > 1 ? (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  {isEnglish ? 'Page' : 'الصفحة'} {pagination.current_page} / {pagination.last_page}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={!canGoPrevious || loading}
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                  >
                    {isEnglish ? 'Previous' : 'السابق'}
                  </Button>
                  <Button
                    variant="outline"
                    disabled={!canGoNext || loading}
                    onClick={() => setPage((current) => current + 1)}
                  >
                    {isEnglish ? 'Next' : 'التالي'}
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
