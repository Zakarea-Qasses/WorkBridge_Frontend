import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import {
  AlertCircle,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  RefreshCw,
  Wallet as WalletIcon,
} from 'lucide-react';
import DashboardLayout from '@/app/components/layout';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui';
import { getApiErrorMessage } from '@/app/api/client';
import {
  getMyWallet,
  getMyWalletRequests,
  type Wallet,
  type WalletRequest,
  type WalletTransaction,
} from '@/app/api/pages/company/wallet';
import { useLanguage } from '@/app/providers/LanguageProvider';
import { formatUsd } from '@/app/utils/money';

function parseAmount(value: number | string) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : null;
}

function formatAmount(value: number | string, isEnglish: boolean) {
  const amount = parseAmount(value);
  if (amount === null) {
    return isEnglish ? 'Unavailable' : 'غير متاح';
  }

  return formatUsd(amount, isEnglish ? 'en' : 'ar');
}

function transactionTypeLabel(type: string, isEnglish: boolean) {
  const labels: Record<string, [string, string]> = {
    deposit: ['Deposit', 'إيداع'],
    withdraw: ['Withdrawal', 'سحب'],
    transfer_to_admin: ['Transfer to administration', 'تحويل إلى الإدارة'],
    contract_fund: ['Contract funding', 'تمويل عقد'],
    refund: ['Refund', 'استرداد'],
    contract_payment: ['Contract payment', 'دفعة عقد'],
    admin_receive: ['Administration receipt', 'استلام إداري'],
    commission: ['Commission', 'عمولة'],
    platform_commission: ['Platform commission', 'عمولة المنصة'],
  };

  return labels[type]?.[isEnglish ? 0 : 1] || type.replaceAll('_', ' ');
}

function statusLabel(status: string, isEnglish: boolean) {
  const labels: Record<string, [string, string]> = {
    completed: ['Completed', 'مكتملة'],
    pending: ['Pending', 'معلقة'],
    failed: ['Failed', 'فشلت'],
  };

  return labels[status]?.[isEnglish ? 0 : 1] || status.replaceAll('_', ' ');
}

function validDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export default function CompanyWallet() {
  const { language, isEnglish } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [walletRequests, setWalletRequests] = useState<WalletRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage] = useState(
    () => (location.state as { walletMessage?: string } | null)?.walletMessage || '',
  );

  const loadWallet = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [walletResponse, requestsResponse] = await Promise.all([
        getMyWallet(),
        getMyWalletRequests(),
      ]);
      setWallet(walletResponse);
      setWalletRequests(requestsResponse.data);
    } catch (requestError) {
      setWallet(null);
      setWalletRequests([]);
      setError(
        getApiErrorMessage(requestError) ||
          (isEnglish ? 'Unable to load company wallet.' : 'تعذر تحميل محفظة الشركة.'),
      );
    } finally {
      setLoading(false);
    }
  }, [isEnglish]);

  useEffect(() => {
    void loadWallet();
  }, [loadWallet]);

  useEffect(() => {
    if (successMessage) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, navigate, successMessage]);

  const transactions = useMemo(
    () =>
      [...(wallet?.transactions || [])].sort(
        (first, second) =>
          (validDate(second.created_at)?.getTime() || 0) -
          (validDate(first.created_at)?.getTime() || 0),
      ),
    [wallet?.transactions],
  );

  const creditsTotal = useMemo(
    () =>
      transactions
        .filter((transaction) => transaction.direction === 'credit')
        .reduce((total, transaction) => total + (parseAmount(transaction.amount) || 0), 0),
    [transactions],
  );

  const debitsTotal = useMemo(
    () =>
      transactions
        .filter((transaction) => transaction.direction === 'debit')
        .reduce((total, transaction) => total + (parseAmount(transaction.amount) || 0), 0),
    [transactions],
  );

  return (
    <DashboardLayout userType="company">
      <div className="space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{isEnglish ? 'Company wallet' : 'محفظة الشركة'}</h1>
          </div>
          <Button variant="outline" disabled={loading} onClick={() => void loadWallet()}>
            <RefreshCw className="me-2 size-4" />
            {isEnglish ? 'Refresh' : 'تحديث'}
          </Button>
        </div>

        {successMessage ? (
          <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            <CheckCircle2 className="size-4" />
            {successMessage}
          </div>
        ) : null}

        {loading ? (
          <>
            <div className="h-40 animate-pulse rounded-md bg-muted" />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="h-32 animate-pulse rounded-md bg-muted" />
              <div className="h-32 animate-pulse rounded-md bg-muted" />
            </div>
            <div className="h-64 animate-pulse rounded-md bg-muted" />
          </>
        ) : error || !wallet ? (
          <Card className="border-destructive/30">
            <CardContent className="flex min-h-56 flex-col items-center justify-center gap-4 text-center">
              <AlertCircle className="size-9 text-destructive" />
              <p className="text-destructive">
                {error || (isEnglish ? 'Company wallet is unavailable.' : 'محفظة الشركة غير متاحة.')}
              </p>
              <Button variant="outline" onClick={() => void loadWallet()}>
                {isEnglish ? 'Try again' : 'إعادة المحاولة'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="border-primary/20 bg-primary text-primary-foreground">
              <CardHeader>
                <p className="text-sm opacity-80">{isEnglish ? 'Current balance' : 'الرصيد الحالي'}</p>
                <CardTitle className="text-4xl">{formatAmount(wallet.balance, isEnglish)}</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-2 opacity-80">
                <WalletIcon className="size-5" />
                <span className="text-sm">
                  {isEnglish ? 'Available balance' : 'الرصيد المتاح'}
                </span>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>{isEnglish ? 'Add funds' : 'إضافة رصيد'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link to="/company/wallet/top-up">
                      <ArrowDownLeft className="me-2 size-4" />
                      {isEnglish ? 'Top up company wallet' : 'شحن محفظة الشركة'}
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{isEnglish ? 'Withdraw funds' : 'سحب الرصيد'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/company/wallet/withdraw">
                      <ArrowUpRight className="me-2 size-4" />
                      {isEnglish ? 'Withdraw from company wallet' : 'سحب من محفظة الشركة'}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm text-muted-foreground">
                    {isEnglish ? 'Credits' : 'الإيداعات'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-bold text-green-700">
                  {formatAmount(creditsTotal, isEnglish)}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm text-muted-foreground">
                    {isEnglish ? 'Debits' : 'السحوبات'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-bold">
                  {formatAmount(debitsTotal, isEnglish)}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm text-muted-foreground">
                    {isEnglish ? 'Transactions' : 'عدد الحركات'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-bold">{transactions.length}</CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{isEnglish ? 'Wallet requests' : 'طلبات المحفظة'}</CardTitle>
              </CardHeader>
              <CardContent>
                {!walletRequests.length ? (
                  <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                    {isEnglish ? 'No wallet requests yet.' : 'لا توجد طلبات محفظة حتى الآن.'}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {walletRequests.slice(0, 5).map((request) => (
                      <div key={request.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3">
                        <div>
                          <div className="font-medium">
                            {request.type === 'deposit'
                              ? isEnglish ? 'Deposit request' : 'طلب شحن'
                              : isEnglish ? 'Withdrawal request' : 'طلب سحب'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatAmount(request.amount, isEnglish)}
                          </div>
                        </div>
                        <Badge variant="outline">
                          {request.status === 'pending'
                            ? isEnglish ? 'Pending' : 'قيد المراجعة'
                            : request.status === 'approved'
                              ? isEnglish ? 'Approved' : 'مقبول'
                              : isEnglish ? 'Rejected' : 'مرفوض'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{isEnglish ? 'Transaction history' : 'سجل الحركات المالية'}</CardTitle>
              </CardHeader>
              <CardContent>
                {!transactions.length ? (
                  <div className="py-10 text-center text-muted-foreground">
                    {isEnglish ? 'No financial transactions yet.' : 'لا توجد حركات مالية حتى الآن.'}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{isEnglish ? 'Date' : 'التاريخ'}</TableHead>
                        <TableHead>{isEnglish ? 'Type' : 'النوع'}</TableHead>
                        <TableHead>{isEnglish ? 'Description' : 'الوصف'}</TableHead>
                        <TableHead>{isEnglish ? 'Amount' : 'المبلغ'}</TableHead>
                        <TableHead>{isEnglish ? 'Balance after' : 'الرصيد بعد العملية'}</TableHead>
                        <TableHead>{isEnglish ? 'Status' : 'الحالة'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((transaction: WalletTransaction) => {
                        const date = validDate(transaction.created_at);
                        return (
                          <TableRow key={transaction.id}>
                            <TableCell>
                              {date
                                ? new Intl.DateTimeFormat(isEnglish ? 'en' : 'ar', {
                                    dateStyle: 'medium',
                                    timeStyle: 'short',
                                  }).format(date)
                                : isEnglish ? 'Unavailable' : 'غير متاح'}
                            </TableCell>
                            <TableCell>{transactionTypeLabel(transaction.type, isEnglish)}</TableCell>
                            <TableCell>{transaction.description || '-'}</TableCell>
                            <TableCell
                              className={
                                transaction.direction === 'credit'
                                  ? 'font-semibold text-green-700'
                                  : 'font-semibold text-foreground'
                              }
                            >
                              {transaction.direction === 'credit' ? '+' : '-'}
                              {formatAmount(transaction.amount, isEnglish)}
                            </TableCell>
                            <TableCell>{formatAmount(transaction.balance_after, isEnglish)}</TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  transaction.status === 'completed'
                                    ? 'border-green-200 bg-green-50 text-green-700'
                                    : 'border-amber-200 bg-amber-50 text-amber-800'
                                }
                              >
                                {transaction.status === 'completed' ? (
                                  <CheckCircle2 className="me-1 size-3" />
                                ) : (
                                  <Clock className="me-1 size-3" />
                                )}
                                {statusLabel(transaction.status, isEnglish)}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
