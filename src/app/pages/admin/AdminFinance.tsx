import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { AlertCircle, CheckCircle2, Clock, RefreshCw, Wallet as WalletIcon } from 'lucide-react';
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
  getAdminEarnings,
  getAdminTransactionsWallet,
  getAdminWallets,
  getEscrowTransactionsWallet,
} from '@/app/api/pages/admin/finance';
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
    deposit: ['Deposit', 'إيداع'],
    withdraw: ['Withdrawal', 'سحب'],
    transfer_to_admin: ['Transfer to admin', 'تحويل إلى الأدمن'],
    admin_receive: ['Admin receipt', 'استلام إداري'],
    commission: ['Commission', 'عمولة'],
    platform_commission: ['Platform commission', 'عمولة المنصة'],
    contract_fund: ['Contract funding', 'تمويل عقد'],
    contract_payment: ['Contract payment', 'دفعة عقد'],
    refund: ['Refund', 'استرداد'],
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

export default function AdminFinance() {
  const { language, isEnglish } = useLanguage();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [adminWallet, setAdminWallet] = useState<Wallet | null>(null);
  const [escrowWallet, setEscrowWallet] = useState<Wallet | null>(null);
  const [earnings, setEarnings] = useState<number | string>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadFinance = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [walletsResponse, adminResponse, escrowResponse, earningsResponse] = await Promise.all([
        getAdminWallets(),
        getAdminTransactionsWallet(),
        getEscrowTransactionsWallet(),
        getAdminEarnings(),
      ]);

      setWallets(walletsResponse);
      setAdminWallet(adminResponse);
      setEscrowWallet(escrowResponse);
      setEarnings(earningsResponse.earnings);
    } catch (requestError) {
      setWallets([]);
      setAdminWallet(null);
      setEscrowWallet(null);
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadFinance();
  }, [loadFinance]);

  const totalWalletBalance = useMemo(
    () => wallets.reduce((total, wallet) => total + toAmount(wallet.balance), 0),
    [wallets],
  );

  const adminTransactions = useMemo(
    () => sortTransactions(adminWallet?.transactions || []).slice(0, 8),
    [adminWallet?.transactions],
  );

  const escrowTransactions = useMemo(
    () => sortTransactions(escrowWallet?.transactions || []).slice(0, 8),
    [escrowWallet?.transactions],
  );

  const reservedEscrowTotal = escrowWallet?.balance || 0;

  const summaryCards = [
    {
      label: isEnglish ? 'All wallets balance' : 'إجمالي أرصدة المحافظ',
      value: formatAmount(totalWalletBalance, isEnglish),
      note: isEnglish ? `${wallets.length} wallets` : `${wallets.length} محفظة`,
    },
    {
      label: isEnglish ? 'Admin wallet balance' : 'رصيد محفظة الأدمن',
      value: formatAmount(adminWallet?.balance || 0, isEnglish),
      note: isEnglish ? 'Platform revenue wallet' : 'محفظة أرباح وعمولات المنصة',
    },
    {
      label: isEnglish ? 'Collected earnings' : 'الأرباح والعمولات المحصلة',
      value: formatAmount(earnings, isEnglish),
      note: isEnglish ? 'From admin earnings endpoint' : 'من راوت أرباح الأدمن',
    },
    {
      label: isEnglish ? 'Escrow balance' : 'رصيد محفظة الوسيط',
      value: formatAmount(reservedEscrowTotal, isEnglish),
      note: isEnglish ? 'Reserved contract amounts' : 'المبالغ المحجوزة للعقود',
    },
  ];

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <section className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold">
              {isEnglish ? 'Finance Management' : 'الإدارة المالية'}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {isEnglish
                ? 'Admin wallet, escrow, earnings, and platform wallet data.'
                : 'بيانات محفظة الأدمن ومحفظة الوسيط والأرباح والمحافظ.'}
            </p>
          </div>
          <Button variant="outline" disabled={loading} onClick={() => void loadFinance()}>
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

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((item) => (
            <Card key={item.label}>
              <CardHeader className="pb-3">
                <CardDescription>{item.label}</CardDescription>
                <CardTitle className="text-3xl">
                  {loading ? <span className="block h-9 w-28 animate-pulse rounded bg-muted" /> : item.value}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{item.note}</CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle>{isEnglish ? 'Escrow wallet' : 'محفظة الوسيط'}</CardTitle>
            <CardDescription>
              {isEnglish
                ? 'Open the escrow wallet page to review reserved transactions.'
                : 'افتح صفحة محفظة الوسيط لمراجعة الحركات المحجوزة.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/admin/site-wallet">
                <WalletIcon className="me-2 size-4" />
                {isEnglish ? 'Open escrow wallet' : 'فتح محفظة الوسيط'}
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle>{isEnglish ? 'Wallet requests' : 'طلبات المحفظة'}</CardTitle>
            <CardDescription>
              {isEnglish
                ? 'Approve or reject user and company deposit and withdrawal requests.'
                : 'اقبل أو ارفض طلبات الشحن والسحب للمستخدمين والشركات.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/admin/wallet-requests">
                <WalletIcon className="me-2 size-4" />
                {isEnglish ? 'Open wallet requests' : 'فتح طلبات المحفظة'}
              </Link>
            </Button>
          </CardContent>
        </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <TransactionsCard
            title={isEnglish ? 'Admin wallet transactions' : 'حركات محفظة الأدمن'}
            description={
              isEnglish
                ? 'Commissions, platform earnings, and admin transfers.'
                : 'العمولات وأرباح المنصة والتحويلات الإدارية.'
            }
            transactions={adminTransactions}
            isEnglish={isEnglish}
            loading={loading}
          />
          <TransactionsCard
            title={isEnglish ? 'Escrow transactions' : 'حركات محفظة الوسيط'}
            description={
              isEnglish
                ? 'Reserved amounts, releases, and refunds.'
                : 'المبالغ المحجوزة والتحريرات والاستردادات.'
            }
            transactions={escrowTransactions}
            isEnglish={isEnglish}
            loading={loading}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}

function TransactionsCard({
  title,
  description,
  transactions,
  isEnglish,
  loading,
}: {
  title: string;
  description: string;
  transactions: WalletTransaction[];
  isEnglish: boolean;
  loading: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-44 animate-pulse rounded-md bg-muted" />
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
                <TableHead>{isEnglish ? 'Amount' : 'المبلغ'}</TableHead>
                <TableHead>{isEnglish ? 'Status' : 'الحالة'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{formatDate(transaction.created_at, isEnglish)}</TableCell>
                  <TableCell>
                    <div className="font-medium">{transactionTypeLabel(transaction.type, isEnglish)}</div>
                    <div className="max-w-[220px] truncate text-xs text-muted-foreground">
                      {transaction.description || '-'}
                    </div>
                  </TableCell>
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
