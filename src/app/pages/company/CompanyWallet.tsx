import { Link } from 'react-router';
import {
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  CreditCard,
  TrendingUp,
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
import { getWalletData } from '@/app/storage';

export default function CompanyWallet() {
  const { language, isEnglish } = useLanguage();
  const wallet = getWalletData('company');
  const { balance, transactions } = wallet;

  const monthlyRevenue = transactions
    .filter((transaction) => transaction.type === 'credit')
    .reduce((sum, transaction) => sum + Math.max(transaction.amount, 0), 0);

  const monthlyWithdrawals = transactions
    .filter((transaction) => transaction.type === 'debit')
    .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);

  const commissions = transactions
    .filter((transaction) => transaction.description.includes('عمولة'))
    .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);

  return (
    <DashboardLayout userType="company">
      <div className="space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <div>
          <h1 className="text-3xl font-bold">{isEnglish ? 'Company wallet' : 'محفظة الشركة'}</h1>
          <p className="mt-1 text-muted-foreground">
            {isEnglish
              ? 'Manage the company balance and financial transactions.'
              : 'إدارة رصيد الشركة ومعاملاتها المالية'}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
            <CardHeader>
              <CardDescription className="text-blue-100">
                {isEnglish ? 'Total balance' : 'الرصيد الكلي'}
              </CardDescription>
              <CardTitle className="text-4xl">${balance.total.toLocaleString()}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-blue-100">
                <WalletIcon className="size-5" />
                <span className="text-sm">
                  {isEnglish
                    ? 'Total funds inside the company wallet'
                    : 'إجمالي الأرصدة داخل محفظة الشركة'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>{isEnglish ? 'Available balance' : 'الرصيد المتاح'}</CardDescription>
              <CardTitle className="text-3xl text-green-600">
                ${balance.available.toLocaleString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {isEnglish ? 'Available for withdrawal or use' : 'متاح للسحب أو الاستخدام'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>{isEnglish ? 'Reserved balance' : 'الرصيد المحجوز'}</CardDescription>
              <CardTitle className="text-3xl text-yellow-600">
                ${balance.reserved.toLocaleString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {isEnglish ? 'Reserved for jobs and running operations' : 'محجوز للوظائف والعمليات الجارية'}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="transition-shadow hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{isEnglish ? 'Add funds' : 'إضافة أموال'}</CardTitle>
                <CardDescription>
                  {isEnglish
                    ? 'Top up the company wallet from a dedicated page'
                    : 'اشحن محفظة الشركة من صفحة تفاصيل مستقلة'}
                </CardDescription>
              </div>
              <div className="rounded-full bg-green-100 p-3">
                <ArrowDownLeft className="size-6 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link to="/company/wallet/top-up">{isEnglish ? 'Add balance' : 'إضافة رصيد'}</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="transition-shadow hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{isEnglish ? 'Withdraw funds' : 'سحب الأموال'}</CardTitle>
                <CardDescription>
                  {isEnglish
                    ? 'Create a withdrawal request from a dedicated page'
                    : 'أنشئ طلب سحب من صفحة تفاصيل مستقلة'}
                </CardDescription>
              </div>
              <div className="rounded-full bg-blue-100 p-3">
                <ArrowUpRight className="size-6 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link to="/company/wallet/withdraw">
                  {isEnglish ? 'Withdraw funds' : 'سحب الأموال'}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                {isEnglish ? 'Revenue' : 'الإيرادات'}
              </CardTitle>
              <TrendingUp className="size-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ${monthlyRevenue.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                {isEnglish ? 'Withdrawals' : 'المسحوبات'}
              </CardTitle>
              <ArrowUpRight className="size-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${monthlyWithdrawals.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                {isEnglish ? 'Commissions' : 'العمولات'}
              </CardTitle>
              <CreditCard className="size-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${commissions.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                {isEnglish ? 'Pending' : 'معلّق'}
              </CardTitle>
              <Clock className="size-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${balance.reserved.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{isEnglish ? 'Transaction log' : 'سجل المعاملات'}</CardTitle>
            <CardDescription>
              {isEnglish
                ? 'All company financial transactions recorded in the interface'
                : 'جميع معاملات الشركة المالية المسجلة في الواجهة'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">{isEnglish ? 'Date' : 'التاريخ'}</TableHead>
                  <TableHead className="text-right">{isEnglish ? 'Description' : 'الوصف'}</TableHead>
                  <TableHead className="text-right">{isEnglish ? 'Amount' : 'المبلغ'}</TableHead>
                  <TableHead className="text-right">{isEnglish ? 'Status' : 'الحالة'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{transaction.date}</span>
                        <span className="text-xs text-muted-foreground">{transaction.time}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {transaction.type === 'credit' ? (
                          <ArrowDownLeft className="size-4 text-green-600" />
                        ) : (
                          <ArrowUpRight className="size-4 text-blue-600" />
                        )}
                        <span>{transaction.description}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`font-bold ${
                          transaction.amount > 0 ? 'text-green-600' : 'text-foreground'
                        }`}
                      >
                        {transaction.amount > 0 ? '+' : ''}
                        ${transaction.amount.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      {transaction.status === 'completed' ? (
                        <Badge className="bg-green-500">
                          <CheckCircle2 className="ml-1 size-3" />
                          {isEnglish ? 'Completed' : 'مكتمل'}
                        </Badge>
                      ) : (
                        <Badge className="bg-yellow-500">
                          <Clock className="ml-1 size-3" />
                          {isEnglish ? 'Pending' : 'معلّق'}
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
