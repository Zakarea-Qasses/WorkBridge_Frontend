import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowUpRight, Landmark, Wallet } from 'lucide-react';
import DashboardLayout from '@/app/components/layout';
import { useLanguage } from '@/app/providers/LanguageProvider';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui';
import { getWalletData, submitWalletWithdrawal } from '@/app/storage';

export default function CompanyWithdrawWallet() {
  const { language, isEnglish } = useLanguage();
  const navigate = useNavigate();
  const wallet = getWalletData('company');
  const [amount, setAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState(
    isEnglish ? 'Corporate bank account' : 'الحساب البنكي للشركة',
  );
  const [accountName, setAccountName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      setError(isEnglish ? 'Enter a valid withdrawal amount.' : 'أدخل مبلغًا صحيحًا للسحب.');
      return;
    }

    if (parsedAmount < 500) {
      setError(isEnglish ? 'The minimum withdrawal amount is $500.' : 'الحد الأدنى للسحب هو $500.');
      return;
    }

    if (parsedAmount > wallet.balance.available) {
      setError(
        isEnglish
          ? 'The requested amount is greater than the available balance in the company wallet.'
          : 'المبلغ المطلوب أكبر من الرصيد المتاح في محفظة الشركة.',
      );
      return;
    }

    submitWalletWithdrawal(parsedAmount, withdrawMethod, 'company');
    navigate('/company/wallet');
  };

  const handleAmountChange = (value: string) => {
    const digitsOnly = value.replace(/[^\d]/g, '');

    if (!digitsOnly) {
      setAmount('');
      setError('');
      return;
    }

    if (Number(digitsOnly) === 0) {
      setAmount('');
      setError(isEnglish ? 'You cannot enter 0 as a withdrawal amount.' : 'لا يمكن إدخال 0 كمبلغ للسحب.');
      return;
    }

    setAmount(String(Number(digitsOnly)));
    setError('');
  };

  return (
    <DashboardLayout userType="company">
      <div className="space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              {isEnglish ? 'Withdraw from company wallet' : 'سحب من محفظة الشركة'}
            </h1>
            <p className="mt-1 text-muted-foreground">
              {isEnglish
                ? 'Create a demo withdrawal request from the available company balance inside the interface.'
                : 'أنشئ طلب سحب تجريبي من رصيد الشركة المتاح داخل الواجهة.'}
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/company/wallet">
              {isEnglish ? 'Back to company wallet' : 'العودة إلى محفظة الشركة'}
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowUpRight className="size-5 text-primary" />
              {isEnglish ? 'Withdrawal request' : 'طلب سحب'}
            </CardTitle>
            <CardDescription>
              {isEnglish ? 'Available balance now:' : 'الرصيد المتاح الآن:'}{' '}
              ${wallet.balance.available.toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="company-withdraw-amount">
                  {isEnglish ? 'Amount' : 'المبلغ'}
                </Label>
                <Input
                  id="company-withdraw-amount"
                  type="number"
                  inputMode="numeric"
                  min="500"
                  value={amount}
                  onChange={(event) => handleAmountChange(event.target.value)}
                  placeholder={isEnglish ? 'Enter withdrawal amount' : 'أدخل مبلغ السحب'}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company-withdraw-method">
                  {isEnglish ? 'Withdrawal method' : 'طريقة السحب'}
                </Label>
                <Select value={withdrawMethod} onValueChange={setWithdrawMethod}>
                  <SelectTrigger id="company-withdraw-method">
                    <SelectValue placeholder={isEnglish ? 'Select withdrawal method' : 'اختر طريقة السحب'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={isEnglish ? 'Corporate bank account' : 'الحساب البنكي للشركة'}>
                      {isEnglish ? 'Corporate bank account' : 'الحساب البنكي للشركة'}
                    </SelectItem>
                    <SelectItem value={isEnglish ? 'Corporate digital wallet' : 'المحفظة الرقمية للشركة'}>
                      {isEnglish ? 'Corporate digital wallet' : 'المحفظة الرقمية للشركة'}
                    </SelectItem>
                    <SelectItem value={isEnglish ? 'Corporate local transfer' : 'تحويل محلي للشركة'}>
                      {isEnglish ? 'Corporate local transfer' : 'تحويل محلي للشركة'}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company-account-name">
                  {isEnglish ? 'Account or beneficiary name' : 'اسم الحساب أو المستفيد'}
                </Label>
                <Input
                  id="company-account-name"
                  value={accountName}
                  onChange={(event) => setAccountName(event.target.value)}
                  placeholder={isEnglish ? 'Optional' : 'اختياري'}
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" className="gap-2">
                  <Wallet className="size-4" />
                  {isEnglish ? 'Confirm withdrawal' : 'تأكيد السحب'}
                </Button>
                <Button asChild type="button" variant="outline">
                  <Link to="/company/wallet">{isEnglish ? 'Cancel' : 'إلغاء'}</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-2 pt-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Landmark className="size-4 text-primary" />
              {isEnglish
                ? 'The minimum withdrawal amount from the company wallet is $500.'
                : 'الحد الأدنى للسحب من محفظة الشركة هو $500.'}
            </div>
            <p>
              {isEnglish
                ? 'This is a frontend demo flow and updates the company balance and transaction log locally only.'
                : 'هذه العملية تجريبية من جهة الفرونت، وتحدث رصيد الشركة وسجل معاملاتها محليًا فقط.'}
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
