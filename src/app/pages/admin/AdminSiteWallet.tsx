import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Landmark,
  RefreshCw,
  ShieldCheck,
  Wallet as WalletIcon,
} from 'lucide-react';
import DashboardLayout from '@/app/components/layout';
import { useLanguage } from '@/app/providers/LanguageProvider';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
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
  Wallet,
  WalletTransaction,
  getAdminTransactionsWallet,
  getEscrowTransactionsWallet,
} from '@/app/api/pages/admin/siteWallet';
import { formatUsd } from '@/app/utils/money';

function toAmount(value: number | string | null | undefined) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
}

function formatAmount(value: number | string | null | undefined, isEnglish: boolean) {
  return formatUsd(toAmount(value), isEnglish ? 'en' : 'ar');
}

function formatDate(value: string | undefined, isEnglish: boolean) {
  if (!value) return isEnglish ? 'Unavailable' : 'غير متوفر';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(isEnglish ? 'en' : 'ar', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function transactionTypeLabel(type: string, isEnglish: boolean) {
  const labels: Record<string, [string, string]> = {
    contract_fund: ['Contract funding', 'تمويل عقد'],
    contract_payment: ['Contract payment', 'دفعة عقد'],
    refund: ['Refund', 'استرداد'],
    commission: ['Commission', 'عمولة'],
    platform_commission: ['Platform commission', 'عمولة المنصة'],
    admin_receive: ['Admin receipt', 'استلام إداري'],
    deposit: ['Deposit', 'إيداع'],
    withdraw: ['Withdrawal', 'سحب'],
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

function sortTransactions(transactions: WalletTransaction[]) {
  return [...transactions].sort(
    (first, second) =>
      new Date(second.created_at).getTime() - new Date(first.created_at).getTime(),
  );
}

export default function AdminSiteWallet() {
  const { language, isEnglish } = useLanguage();
  const [escrowWallet, setEscrowWallet] = useState<Wallet | null>(null);
  const [adminWallet, setAdminWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadWallets = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [escrowResponse, adminResponse] = await Promise.all([
        getEscrowTransactionsWallet(),
        getAdminTransactionsWallet(),
      ]);
      setEscrowWallet(escrowResponse);
      setAdminWallet(adminResponse);
    } catch (requestError) {
      setEscrowWallet(null);
      setAdminWallet(null);
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadWallets();
  }, [loadWallets]);

  const escrowTransactions = useMemo(
    () => sortTransactions(escrowWallet?.transactions || []),
    [escrowWallet?.transactions],
  );

  const adminTransactions = useMemo(
    () => sortTransactions(adminWallet?.transactions || []),
    [adminWallet?.transactions],
  );

  const escrowCredits = useMemo(
    () =>
      escrowTransactions
        .filter((transaction) => transaction.direction === 'credit')
        .reduce((total, transaction) => total + toAmount(transaction.amount), 0),
    [escrowTransactions],
  );

  const escrowDebits = useMemo(
    () =>
      escrowTransactions
        .filter((transaction) => transaction.direction === 'debit')
        .reduce((total, transaction) => total + toAmount(transaction.amount), 0),
    [escrowTransactions],
  );

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <section className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold">
              {isEnglish ? 'Escrow Wallet' : 'محفظة الوسيط'}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {isEnglish
                ? 'Track reserved funds and escrow transaction history.'
                : 'متابعة المبالغ المحجوزة وحركات محفظة الوسيط.'}
            </p>
          </div>
          <Button variant="outline" disabled={loading} onClick={() => void loadWallets()}>
            <RefreshCw className={`me-2 size-4 ${loading ? 'animate-spin' : ''}`} />
            {isEnglish ? 'Refresh' : 'تحديث'}
          </Button>
        </section>

        {error ? (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="flex items-center gap-2 pt-6 text-sm text-destructive">
              <AlertCircle className="size-4" />
              {error}
            </CardContent>
          </Card>
        ) : null}

        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6 text-sm text-primary">
            {isEnglish
              ? 'Release or refund decisions are handled from Reports Management when a report is linked to a contract.'
              : 'قرارات تحرير المبلغ أو إرجاعه تتم من إدارة البلاغات عندما يكون البلاغ مرتبطا بعقد.'}
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>{isEnglish ? 'Escrow balance' : 'رصيد الوسيط'}</CardDescription>
              <CardTitle className="text-3xl">
                {loading ? (
                  <span className="block h-9 w-28 animate-pulse rounded bg-muted" />
                ) : (
                  formatAmount(escrowWallet?.balance || 0, isEnglish)
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="size-4 text-primary" />
              {isEnglish ? 'Reserved funds wallet' : 'محفظة المبالغ المحجوزة'}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>{isEnglish ? 'Escrow credits' : 'داخل للوسيط'}</CardDescription>
              <CardTitle className="text-3xl">{formatAmount(escrowCredits, isEnglish)}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
              <WalletIcon className="size-4 text-primary" />
              {isEnglish ? 'Total credit movements' : 'مجموع الحركات الدائنة'}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>{isEnglish ? 'Escrow debits' : 'خارج من الوسيط'}</CardDescription>
              <CardTitle className="text-3xl">{formatAmount(escrowDebits, isEnglish)}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
              <Landmark className="size-4 text-primary" />
              {isEnglish ? 'Released or refunded amounts' : 'مبالغ محررة أو مستردة'}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>{isEnglish ? 'Admin wallet' : 'محفظة الأدمن'}</CardDescription>
              <CardTitle className="text-3xl">{formatAmount(adminWallet?.balance || 0, isEnglish)}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="size-4 text-primary" />
              {isEnglish ? 'Revenue and commissions' : 'الأرباح والعمولات'}
            </CardContent>
          </Card>
        </div>

        <TransactionsTable
          title={isEnglish ? 'Escrow wallet transactions' : 'حركات محفظة الوسيط'}
          description={
            isEnglish
              ? 'Every transaction recorded on the escrow wallet.'
              : 'كل حركة مالية مسجلة على محفظة الوسيط.'
          }
          transactions={escrowTransactions}
          loading={loading}
          isEnglish={isEnglish}
        />

        <TransactionsTable
          title={isEnglish ? 'Admin wallet transactions' : 'حركات محفظة الأدمن'}
          description={
            isEnglish
              ? 'Revenue, commissions, and admin wallet transfers.'
              : 'الأرباح والعمولات والتحويلات الخاصة بمحفظة الأدمن.'
          }
          transactions={adminTransactions}
          loading={loading}
          isEnglish={isEnglish}
        />
      </div>
    </DashboardLayout>
  );
}

function TransactionsTable({
  title,
  description,
  transactions,
  loading,
  isEnglish,
}: {
  title: string;
  description: string;
  transactions: WalletTransaction[];
  loading: boolean;
  isEnglish: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-56 animate-pulse rounded-md bg-muted" />
        ) : transactions.length === 0 ? (
          <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
            {isEnglish ? 'No transactions yet.' : 'لا توجد حركات مالية بعد.'}
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
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{formatDate(transaction.created_at, isEnglish)}</TableCell>
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
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
