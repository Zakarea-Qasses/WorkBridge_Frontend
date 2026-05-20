import { Link } from 'react-router';
import DashboardLayout from '@/app/components/layout';
import { useLanguage } from '@/app/providers/LanguageProvider';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui';
import { financeSummary } from '@/app/data';

export default function AdminFinance() {
  const { language, isEnglish } = useLanguage();

  const summaryMeta = [
    {
      label: isEnglish ? 'Total wallet balance' : 'إجمالي الرصيد في المحافظ',
      note: isEnglish ? 'Across 12,543 wallets' : 'عبر 12,543 محفظة',
    },
    {
      label: isEnglish ? 'Collected commissions' : 'العمولات المحصلة',
      note: isEnglish ? 'During the last 30 days' : 'آخر 30 يومًا',
    },
    {
      label: isEnglish ? 'Pending withdrawal requests' : 'طلبات السحب المعلقة',
      note: isEnglish ? 'Needs financial review' : 'بحاجة مراجعة مالية',
    },
    {
      label: isEnglish ? 'Reserved amounts' : 'المبالغ المحجوزة',
      note: isEnglish ? 'Projects currently in progress' : 'مشاريع قيد التنفيذ',
    },
  ];

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <section>
          <h2 className="text-3xl font-bold">
            {isEnglish ? 'Finance and reporting' : 'الإدارة المالية والتقارير'}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {isEnglish
              ? 'Track wallets, profits, commissions, and withdrawal requests awaiting review.'
              : 'متابعة المحافظ، الأرباح، العمولات، والسحوبات المعلقة.'}
          </p>
        </section>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {financeSummary.map((item, index) => (
            <Card key={`${item.label}-${index}`}>
              <CardHeader className="pb-3">
                <CardDescription>{summaryMeta[index]?.label ?? item.label}</CardDescription>
                <CardTitle className="text-3xl">{item.value}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {summaryMeta[index]?.note ?? item.note}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle>{isEnglish ? 'Site wallet' : 'محفظة الموقع'}</CardTitle>
            <CardDescription>
              {isEnglish
                ? 'Follow the funds reserved from clients after project approval.'
                : 'متابعة المبالغ التي تم حجزها من العملاء عند اعتماد المشاريع.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/admin/site-wallet">
                {isEnglish ? 'Open site wallet' : 'فتح محفظة الموقع'}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
