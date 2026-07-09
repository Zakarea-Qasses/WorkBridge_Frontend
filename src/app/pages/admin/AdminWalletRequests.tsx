import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, ExternalLink, RefreshCw, Search, XCircle } from 'lucide-react';
import DashboardLayout from '@/app/components/layout';
import { useLanguage } from '@/app/providers/LanguageProvider';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui';
import { getApiErrorMessage, getValidationErrors } from '@/app/api/client';
import {
  approveWalletRequest,
  getAdminWalletRequests,
  rejectWalletRequest,
  type WalletRequest,
  type WalletRequestStatus,
  type WalletRequestType,
} from '@/app/api/endpoints';
import { formatUsd } from '@/app/utils/money';

function typeLabel(type: WalletRequestType, isEnglish: boolean) {
  if (type === 'deposit') return isEnglish ? 'Deposit' : 'شحن';
  return isEnglish ? 'Withdrawal' : 'سحب';
}

function statusLabel(status: WalletRequestStatus, isEnglish: boolean) {
  const labels: Record<WalletRequestStatus, [string, string]> = {
    pending: ['Pending', 'قيد المراجعة'],
    approved: ['Approved', 'مقبول'],
    rejected: ['Rejected', 'مرفوض'],
  };

  return labels[status][isEnglish ? 0 : 1];
}

function formatDate(value: string, isEnglish: boolean) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return isEnglish ? 'Unavailable' : 'غير متاح';
  return new Intl.DateTimeFormat(isEnglish ? 'en' : 'ar', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export default function AdminWalletRequests() {
  const { language, isEnglish } = useLanguage();
  const [requests, setRequests] = useState<WalletRequest[]>([]);
  const [search, setSearch] = useState('');
  const [type, setType] = useState<'all' | WalletRequestType>('all');
  const [status, setStatus] = useState<'all' | WalletRequestStatus>('pending');
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getAdminWalletRequests({
        search,
        type: type === 'all' ? '' : type,
        status: status === 'all' ? '' : status,
      });
      setRequests(response.data);
    } catch (requestError) {
      setRequests([]);
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [search, status, type]);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  const handleDecision = async (request: WalletRequest, decision: 'approve' | 'reject') => {
    try {
      setProcessingId(request.id);
      setError('');
      setSuccess('');
      if (decision === 'approve') {
        await approveWalletRequest(request.id);
        setSuccess(isEnglish ? 'Wallet request approved.' : 'تم قبول طلب المحفظة.');
      } else {
        await rejectWalletRequest(request.id);
        setSuccess(isEnglish ? 'Wallet request rejected.' : 'تم رفض طلب المحفظة.');
      }
      await loadRequests();
    } catch (requestError) {
      const validationErrors = getValidationErrors(requestError);
      setError(
        validationErrors.request?.[0] ||
          validationErrors.amount?.[0] ||
          getApiErrorMessage(requestError),
      );
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <section className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold">
              {isEnglish ? 'Wallet Requests' : 'طلبات المحفظة'}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {isEnglish
                ? 'Review deposit and withdrawal requests before balances change.'
                : 'راجع طلبات الشحن والسحب قبل تغيير الأرصدة.'}
            </p>
          </div>
          <Button variant="outline" disabled={loading} onClick={() => void loadRequests()}>
            <RefreshCw className={`me-2 size-4 ${loading ? 'animate-spin' : ''}`} />
            {isEnglish ? 'Refresh' : 'تحديث'}
          </Button>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>{isEnglish ? 'Filters' : 'الفلاتر'}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-[1fr_180px_180px]">
            <div className="space-y-2">
              <Label htmlFor="wallet-request-search">{isEnglish ? 'Search' : 'بحث'}</Label>
              <div className="relative">
                <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="wallet-request-search"
                  className="ps-9"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={isEnglish ? 'Name or email' : 'الاسم أو البريد'}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{isEnglish ? 'Type' : 'النوع'}</Label>
              <Select value={type} onValueChange={(value) => setType(value as typeof type)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isEnglish ? 'All' : 'الكل'}</SelectItem>
                  <SelectItem value="deposit">{isEnglish ? 'Deposit' : 'شحن'}</SelectItem>
                  <SelectItem value="withdraw">{isEnglish ? 'Withdrawal' : 'سحب'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{isEnglish ? 'Status' : 'الحالة'}</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as typeof status)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isEnglish ? 'All' : 'الكل'}</SelectItem>
                  <SelectItem value="pending">{isEnglish ? 'Pending' : 'قيد المراجعة'}</SelectItem>
                  <SelectItem value="approved">{isEnglish ? 'Approved' : 'مقبول'}</SelectItem>
                  <SelectItem value="rejected">{isEnglish ? 'Rejected' : 'مرفوض'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {success ? (
          <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            <CheckCircle2 className="size-4" />
            {success}
          </div>
        ) : null}

        {error ? (
          <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="size-4" />
            {error}
          </div>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>{isEnglish ? 'Requests' : 'الطلبات'}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-56 animate-pulse rounded-md bg-muted" />
            ) : requests.length === 0 ? (
              <div className="rounded-md border border-dashed p-8 text-center text-muted-foreground">
                {isEnglish ? 'No wallet requests found.' : 'لا توجد طلبات محفظة.'}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{isEnglish ? 'User' : 'المستخدم'}</TableHead>
                    <TableHead>{isEnglish ? 'Type' : 'النوع'}</TableHead>
                    <TableHead>{isEnglish ? 'Amount' : 'المبلغ'}</TableHead>
                    <TableHead>{isEnglish ? 'Details' : 'التفاصيل'}</TableHead>
                    <TableHead>{isEnglish ? 'Status' : 'الحالة'}</TableHead>
                    <TableHead>{isEnglish ? 'Date' : 'التاريخ'}</TableHead>
                    <TableHead>{isEnglish ? 'Decision' : 'القرار'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div className="font-medium">{request.user?.name || '-'}</div>
                        <div className="text-xs text-muted-foreground">{request.user?.email || '-'}</div>
                      </TableCell>
                      <TableCell>{typeLabel(request.type, isEnglish)}</TableCell>
                      <TableCell className="font-semibold">
                        {formatUsd(request.amount, isEnglish ? 'en' : 'ar')}
                      </TableCell>
                      <TableCell className="max-w-[260px]">
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <div className="whitespace-pre-line">
                            {request.type === 'deposit'
                              ? request.payment_note || (isEnglish ? 'No note' : 'لا توجد ملاحظة')
                              : request.withdrawal_details || (isEnglish ? 'No details' : 'لا توجد تفاصيل')}
                          </div>
                          {request.type === 'deposit' && request.deposit_receipt_url ? (
                            <Button asChild size="sm" variant="outline">
                              <a href={request.deposit_receipt_url} target="_blank" rel="noreferrer">
                                <ExternalLink className="me-1 size-4" />
                                {isEnglish ? 'View receipt' : 'عرض إيصال الإيداع'}
                              </a>
                            </Button>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{statusLabel(request.status, isEnglish)}</Badge>
                      </TableCell>
                      <TableCell>{formatDate(request.created_at, isEnglish)}</TableCell>
                      <TableCell>
                        {request.status === 'pending' ? (
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              disabled={processingId === request.id}
                              onClick={() => void handleDecision(request, 'approve')}
                            >
                              <CheckCircle2 className="me-1 size-4" />
                              {isEnglish ? 'Approve' : 'قبول'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={processingId === request.id}
                              onClick={() => void handleDecision(request, 'reject')}
                            >
                              <XCircle className="me-1 size-4" />
                              {isEnglish ? 'Reject' : 'رفض'}
                            </Button>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            {request.admin_note || '-'}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
