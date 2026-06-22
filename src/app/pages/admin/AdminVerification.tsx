import { useEffect, useState } from 'react';
import DashboardLayout from '@/app/components/layout';
import { useLanguage } from '@/app/providers/LanguageProvider';
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui';
import { getApiErrorMessage } from '@/app/api/client';
import {
  getPendingAdminCompanies,
  unverifyAdminCompany,
  verifyAdminCompany,
} from '@/app/api/endpoints';

interface AdminCompany {
  id: number;
  company_name?: string;
  name?: string;
  email?: string;
  is_verified?: boolean;
  user?: {
    name?: string;
    email?: string;
  };
}

export default function AdminVerification() {
  const { language, isEnglish } = useLanguage();
  const [companies, setCompanies] = useState<AdminCompany[]>([]);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<number | null>(null);

  const loadCompanies = async () => {
    const response = await getPendingAdminCompanies<{ companies?: AdminCompany[]; data?: AdminCompany[] } | AdminCompany[]>();
    if (Array.isArray(response)) {
      setCompanies(response);
      return;
    }

    setCompanies(response.companies || response.data || []);
  };

  useEffect(() => {
    loadCompanies()
      .catch((error) => setFeedback(getApiErrorMessage(error)))
      .finally(() => setLoading(false));
  }, []);

  const runAction = async (company: AdminCompany, action: 'verify' | 'unverify') => {
    try {
      setActingId(company.id);
      if (action === 'verify') {
        await verifyAdminCompany(company.id);
        setFeedback(`تم توثيق الشركة ${company.company_name || company.name || company.id}`);
      } else {
        await unverifyAdminCompany(company.id);
        setFeedback(`تم إلغاء توثيق الشركة ${company.company_name || company.name || company.id}`);
      }
      await loadCompanies();
    } catch (error) {
      setFeedback(getApiErrorMessage(error));
    } finally {
      setActingId(null);
    }
  };

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <section>
          <h2 className="text-3xl font-bold">
            {isEnglish ? 'Company verification' : 'توثيق حسابات الشركات'}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {isEnglish
              ? 'Review pending company verification requests.'
              : 'مراجعة طلبات توثيق الشركات واتخاذ قرار التوثيق أو إلغائه.'}
          </p>
        </section>

        {feedback ? (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6 text-sm text-primary">{feedback}</CardContent>
          </Card>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>{isEnglish ? 'Pending companies' : 'الشركات بانتظار التوثيق'}</CardTitle>
            <CardDescription>
              {loading
                ? isEnglish
                  ? 'Loading pending companies...'
                  : 'جار تحميل الشركات...'
                : `${companies.length} ${isEnglish ? 'companies' : 'شركة'}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-2">
            {!loading && companies.length === 0 ? (
              <div className="lg:col-span-2 rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                {isEnglish
                  ? 'There are no pending company verification requests.'
                  : 'لا توجد طلبات توثيق شركات معلقة حاليا.'}
              </div>
            ) : null}

            {companies.map((company) => (
              <Card key={company.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle>{company.company_name || company.name || company.user?.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {company.email || company.user?.email || '—'}
                      </CardDescription>
                    </div>
                    <Badge className={company.is_verified ? 'bg-green-600' : 'bg-amber-500'}>
                      {company.is_verified
                        ? isEnglish
                          ? 'Verified'
                          : 'موثق'
                        : isEnglish
                          ? 'Pending'
                          : 'قيد المراجعة'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  <Button
                    disabled={actingId === company.id}
                    onClick={() => runAction(company, 'verify')}
                  >
                    {isEnglish ? 'Verify' : 'توثيق'}
                  </Button>
                  <Button
                    variant="outline"
                    disabled={actingId === company.id}
                    onClick={() => runAction(company, 'unverify')}
                  >
                    {isEnglish ? 'Unverify' : 'إلغاء التوثيق'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
