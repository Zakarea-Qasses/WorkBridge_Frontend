import { useMemo, useState } from 'react';
import { ArrowLeftRight, Landmark, ShieldCheck, TimerReset, Wallet as WalletIcon } from 'lucide-react';
import DashboardLayout from '@/app/components/layout';
import { useLanguage } from '@/app/providers/LanguageProvider';
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui';
import { getSiteEscrows, getWalletData, refundEscrowToClient, releaseEscrowToProvider } from '@/app/storage';

function isReleaseDue(releaseOn: string) {
  return new Date(releaseOn) <= new Date();
}

function getEscrowBadge(status: string) {
  switch (status) {
    case 'released':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'refunded':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'disputed':
      return 'bg-rose-100 text-rose-700 border-rose-200';
    default:
      return 'bg-amber-100 text-amber-800 border-amber-200';
  }
}

function getEscrowStatusLabel(status: string, isEnglish: boolean) {
  switch (status) {
    case 'released':
      return isEnglish ? 'Released' : 'تم التحويل';
    case 'refunded':
      return isEnglish ? 'Refunded' : 'تمت الإعادة';
    case 'disputed':
      return isEnglish ? 'Open dispute' : 'نزاع مفتوح';
    default:
      return isEnglish ? 'Reserved' : 'محجوز';
  }
}

function getIssueStatusBox(status: string) {
  if (status === 'disputed') {
    return 'border-rose-200 bg-rose-50 text-rose-700';
  }

  return 'border-emerald-200 bg-emerald-50 text-emerald-700';
}

function getIssueStatusText(status: string, isEnglish: boolean) {
  if (status === 'disputed') {
    return isEnglish ? 'A dispute or complaint is open on this escrow' : 'مرفوع عليه نزاع أو شكوى';
  }

  return isEnglish ? 'No dispute is open and everything looks fine' : 'لا يوجد نزاع، والأمور تمام';
}

export default function AdminSiteWallet() {
  const { language, isEnglish } = useLanguage();
  const [feedback, setFeedback] = useState(
    isEnglish
      ? 'Funds stay reserved for one week, then they can be released to the provider or refunded when needed.'
      : 'الأموال تبقى محجوزة لمدة أسبوع، وبعدها يمكن تحويلها لمقدم الخدمة أو إعادتها عند الحاجة.',
  );
  const [refreshKey, setRefreshKey] = useState(0);

  const wallet = useMemo(() => getWalletData('site'), [refreshKey]);
  const escrows = useMemo(() => getSiteEscrows(), [refreshKey]);
  const { balance, transactions } = wallet;

  const handleRefresh = (message: string) => {
    setFeedback(message);
    setRefreshKey((current) => current + 1);
  };

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <section>
          <h2 className="text-3xl font-bold">{isEnglish ? 'Site wallet' : 'محفظة الموقع'}</h2>
          <p className="mt-2 text-muted-foreground">
            {isEnglish
              ? 'Track reserved client funds here. They are not transferred immediately; they stay reserved for a full week as protection against any issue or emergency.'
              : 'هنا نتابع المبالغ المحجوزة من العملاء. لا يتم تسليمها فورًا، بل تبقى أسبوعًا كاملًا احتياطًا لأي مشكلة أو طارئ.'}
          </p>
        </section>

        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6 text-sm text-primary">{feedback}</CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>{isEnglish ? 'Total balance' : 'إجمالي الرصيد'}</CardDescription>
              <CardTitle className="text-3xl">${balance.total.toLocaleString()}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
              <WalletIcon className="size-4 text-primary" />
              {isEnglish ? 'Everything that entered the site wallet' : 'مجموع ما دخل إلى محفظة الموقع'}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>{isEnglish ? 'Reserved balance' : 'الرصيد المحجوز'}</CardDescription>
              <CardTitle className="text-3xl">${balance.reserved.toLocaleString()}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="size-4 text-primary" />
              {isEnglish
                ? 'Amounts currently reserved before release or refund'
                : 'مبالغ قيد الحجز قبل التحويل أو الإعادة'}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>{isEnglish ? 'Available balance' : 'الرصيد المتاح'}</CardDescription>
              <CardTitle className="text-3xl">${balance.available.toLocaleString()}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
              <Landmark className="size-4 text-primary" />
              {isEnglish ? 'Appears when later release stages are approved' : 'يظهر عند اعتماد مراحل أخرى لاحقًا'}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{isEnglish ? 'Active escrow operations' : 'عمليات الحجز الجارية'}</CardTitle>
            <CardDescription>
              {isEnglish
                ? 'Current flow: the client pays, the amount stays reserved for a week, then it is released to the provider or refunded by admin decision.'
                : 'السيناريو الحالي: العميل يدفع، المبلغ يُحجز أسبوعًا، ثم يتحول لمقدم الخدمة أو يُعاد للعميل بقرار الأدمن.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {escrows.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                {isEnglish ? 'There are no escrow operations yet.' : 'لا توجد عمليات حجز حتى الآن.'}
              </div>
            ) : null}

            {escrows.map((escrow) => {
              const due = isReleaseDue(escrow.releaseOn);
              const canRelease = escrow.status === 'reserved' && due;
              const canRefund = escrow.status === 'reserved' || escrow.status === 'disputed';
              const canResolveToProvider = escrow.status === 'disputed';

              return (
                <div key={escrow.id} className="space-y-4 rounded-2xl border border-border p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <ArrowLeftRight className="size-4 text-primary" />
                        <h3 className="font-semibold">{escrow.projectTitle}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {isEnglish ? 'Client:' : 'العميل:'} {escrow.clientName} | {isEnglish ? 'Provider:' : 'مقدم الخدمة:'} {escrow.providerName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {isEnglish ? 'Reserved on:' : 'تاريخ الحجز:'} {escrow.reservedAt} | {isEnglish ? 'Release date:' : 'موعد التحويل:'} {escrow.releaseOn}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge className={getEscrowBadge(escrow.status)}>
                        {getEscrowStatusLabel(escrow.status, isEnglish)}
                      </Badge>
                      <span className="text-lg font-semibold text-primary">
                        ${escrow.amount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-xl bg-muted/60 p-3 text-sm text-muted-foreground">
                    {escrow.status === 'reserved' && !due ? (
                      <div className="flex items-center gap-2">
                        <TimerReset className="size-4 text-primary" />
                        {isEnglish
                          ? `This amount remains reserved until ${escrow.releaseOn} before it can be released to the provider.`
                          : `يبقى هذا المبلغ محجوزًا حتى ${escrow.releaseOn} قبل التحويل لمقدم الخدمة.`}
                      </div>
                    ) : null}
                    {escrow.status === 'reserved' && due
                      ? isEnglish
                        ? 'The one-week hold is over, and the amount can now be released to the provider.'
                        : 'اكتملت مدة الأسبوع، ويمكن الآن تحويل المبلغ لمقدم الخدمة.'
                      : null}
                    {escrow.status === 'disputed'
                      ? isEnglish
                        ? 'There is an open dispute on this escrow. The admin can refund the client or approve the release to the provider.'
                        : 'يوجد نزاع مفتوح على هذه العملية. يمكن للأدمن إعادة المبلغ أو اعتماد التحويل لمقدم الخدمة.'
                      : null}
                    {escrow.status === 'released'
                      ? isEnglish
                        ? `The release to the provider was approved${escrow.resolvedAt ? ` on ${escrow.resolvedAt}` : ''}.`
                        : `تم اعتماد التحويل لمقدم الخدمة${escrow.resolvedAt ? ` بتاريخ ${escrow.resolvedAt}` : ''}.`
                      : null}
                    {escrow.status === 'refunded'
                      ? isEnglish
                        ? `The amount was refunded to the client${escrow.resolvedAt ? ` on ${escrow.resolvedAt}` : ''}.`
                        : `تمت إعادة المبلغ إلى العميل${escrow.resolvedAt ? ` بتاريخ ${escrow.resolvedAt}` : ''}.`
                      : null}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => {
                        const result = releaseEscrowToProvider(escrow.id);
                        handleRefresh(result.message);
                      }}
                      disabled={!canRelease}
                    >
                      {isEnglish ? 'Release to provider' : 'تحويل لمقدم الخدمة'}
                    </Button>

                    <div
                      className={`flex min-h-10 min-w-[190px] items-center justify-center rounded-md border px-4 text-sm font-medium ${getIssueStatusBox(
                        escrow.status,
                      )}`}
                    >
                      {getIssueStatusText(escrow.status, isEnglish)}
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => {
                        const result = releaseEscrowToProvider(escrow.id, { force: true });
                        handleRefresh(result.message);
                      }}
                      disabled={!canResolveToProvider}
                    >
                      {isEnglish ? 'Approve for provider' : 'اعتماد لمقدم الخدمة'}
                    </Button>

                    <Button
                      variant="destructive"
                      onClick={() => {
                        const result = refundEscrowToClient(escrow.id);
                        handleRefresh(result.message);
                      }}
                      disabled={!canRefund}
                    >
                      {isEnglish ? 'Refund client' : 'إعادة للعميل'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{isEnglish ? 'Site wallet log' : 'سجل محفظة الموقع'}</CardTitle>
            <CardDescription>
              {isEnglish
                ? 'Every money movement related to reservation, release, or refund appears here.'
                : 'كل حركة مالية مرتبطة بالحجز أو التحويل أو الإعادة تظهر هنا.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex flex-col gap-3 rounded-2xl border border-border p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="space-y-1">
                  <p className="font-medium">{transaction.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {transaction.date} {isEnglish ? 'at' : 'عند'} {transaction.time}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant="outline">
                    {transaction.status === 'pending'
                      ? isEnglish
                        ? 'Pending'
                        : 'معلّق'
                      : isEnglish
                        ? 'Completed'
                        : 'مكتمل'}
                  </Badge>
                  <span
                    className={`text-lg font-semibold ${
                      transaction.amount >= 0 ? 'text-emerald-600' : 'text-foreground'
                    }`}
                  >
                    {transaction.amount >= 0 ? '+' : ''}
                    ${transaction.amount.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
