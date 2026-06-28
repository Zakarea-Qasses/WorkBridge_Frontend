import { useEffect, useMemo, useState } from 'react';
import { FileText, LoaderCircle, RefreshCw, Search } from 'lucide-react';
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
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@/app/components/ui';
import { getApiErrorMessage, getValidationErrors } from '@/app/api/client';
import {
  getAdminCompanies,
  getPendingAdminCompanies,
  requestAdminCompanyDocuments,
  unverifyAdminCompany,
  verifyAdminCompany,
} from '@/app/api/endpoints';

type CompanyStatusFilter = 'all' | 'pending' | 'verified' | 'documents_requested';
type Feedback = { type: 'success' | 'error'; message: string } | null;

interface AdminCompany {
  id: number;
  company_name?: string | null;
  name?: string | null;
  email?: string | null;
  status?: string | null;
  verification_status?: string | null;
  is_verified?: boolean | number | null;
  documents_requested_at?: string | null;
  created_at?: string | null;
  user?: {
    id?: number;
    name?: string | null;
    email?: string | null;
  } | null;
}

type CompanyResponse =
  | AdminCompany[]
  | {
      companies?: AdminCompany[] | { data?: AdminCompany[] };
      data?: AdminCompany[];
    };

const normalizeCompanies = (response: CompanyResponse): AdminCompany[] => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response.companies)) {
    return response.companies;
  }

  if (response.companies && Array.isArray(response.companies.data)) {
    return response.companies.data;
  }

  if (Array.isArray(response.data)) {
    return response.data;
  }

  return [];
};

const getCompanyName = (company: AdminCompany) =>
  company.company_name || company.name || company.user?.name || `#${company.id}`;

const getCompanyEmail = (company: AdminCompany) =>
  company.email || company.user?.email || '';

const getCompanyStatus = (company: AdminCompany) => {
  const rawStatus = (company.verification_status || company.status || '').toLowerCase();

  if (rawStatus === 'documents_requested' || company.documents_requested_at) {
    return 'documents_requested';
  }

  if (company.is_verified === true || company.is_verified === 1 || rawStatus === 'verified') {
    return 'verified';
  }

  return 'pending';
};

const getStatusLabel = (status: string, isEnglish: boolean) => {
  if (status === 'verified') {
    return isEnglish ? 'Verified' : 'موثقة';
  }

  if (status === 'documents_requested') {
    return isEnglish ? 'Documents requested' : 'بانتظار المستندات';
  }

  return isEnglish ? 'Pending review' : 'قيد المراجعة';
};

const getStatusClassName = (status: string) => {
  if (status === 'verified') {
    return 'bg-green-600';
  }

  if (status === 'documents_requested') {
    return 'bg-blue-600';
  }

  return 'bg-amber-500';
};

export default function AdminVerification() {
  const { language, isEnglish } = useLanguage();
  const [companies, setCompanies] = useState<AdminCompany[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<CompanyStatusFilter>('pending');
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<number | null>(null);
  const [documentCompanyId, setDocumentCompanyId] = useState<number | null>(null);
  const [documentTitle, setDocumentTitle] = useState('');
  const [documentMessage, setDocumentMessage] = useState('');

  const loadCompanies = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const response = await getAdminCompanies<CompanyResponse>();
      setCompanies(normalizeCompanies(response));
    } catch (error) {
      const pendingResponse = await getPendingAdminCompanies<CompanyResponse>();
      setCompanies(normalizeCompanies(pendingResponse));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies().catch((error) => {
      setFeedback({ type: 'error', message: getApiErrorMessage(error) });
      setLoading(false);
    });
  }, []);

  const filteredCompanies = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return companies.filter((company) => {
      const status = getCompanyStatus(company);
      const matchesStatus = statusFilter === 'all' || status === statusFilter;
      const searchable = [
        getCompanyName(company),
        getCompanyEmail(company),
        company.user?.name || '',
        company.user?.email || '',
        company.status || '',
        company.verification_status || '',
      ]
        .join(' ')
        .toLowerCase();
      const matchesSearch = !normalizedSearch || searchable.includes(normalizedSearch);

      return matchesStatus && matchesSearch;
    });
  }, [companies, search, statusFilter]);

  const runAction = async (company: AdminCompany, action: 'verify' | 'unverify') => {
    try {
      setActingId(company.id);
      setFeedback(null);

      if (action === 'verify') {
        await verifyAdminCompany(company.id);
        setFeedback({
          type: 'success',
          message: isEnglish
            ? `Company ${getCompanyName(company)} verified successfully.`
            : `تم توثيق الشركة ${getCompanyName(company)} بنجاح.`,
        });
      } else {
        await unverifyAdminCompany(company.id);
        setFeedback({
          type: 'success',
          message: isEnglish
            ? `Company ${getCompanyName(company)} unverified successfully.`
            : `تم إلغاء توثيق الشركة ${getCompanyName(company)} بنجاح.`,
        });
      }

      await loadCompanies();
    } catch (error) {
      setFeedback({ type: 'error', message: getApiErrorMessage(error) });
    } finally {
      setActingId(null);
    }
  };

  const openDocumentRequest = (company: AdminCompany) => {
    setDocumentCompanyId(company.id);
    setDocumentTitle(isEnglish ? 'Additional verification documents' : 'مستندات توثيق إضافية');
    setDocumentMessage(
      isEnglish
        ? 'Please send the company commercial registration, tax number, and owner identity documents to complete verification.'
        : 'يرجى إرسال السجل التجاري والرقم الضريبي ووثائق هوية صاحب الشركة لاستكمال عملية التوثيق.',
    );
    setFieldErrors({});
  };

  const sendDocumentRequest = async (company: AdminCompany) => {
    try {
      setActingId(company.id);
      setFeedback(null);
      setFieldErrors({});

      await requestAdminCompanyDocuments(company.id, {
        title: documentTitle,
        message: documentMessage,
      });

      setFeedback({
        type: 'success',
        message: isEnglish
          ? `Document request sent to ${getCompanyName(company)}.`
          : `تم إرسال طلب المستندات إلى ${getCompanyName(company)}.`,
      });
      setDocumentCompanyId(null);
      setDocumentTitle('');
      setDocumentMessage('');
      await loadCompanies();
    } catch (error) {
      setFieldErrors(getValidationErrors(error));
      setFeedback({ type: 'error', message: getApiErrorMessage(error) });
    } finally {
      setActingId(null);
    }
  };

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <section className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-3xl font-bold">
              {isEnglish ? 'Company verification' : 'توثيق حسابات الشركات'}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {isEnglish
                ? 'Review companies, request documents, and manage verification status.'
                : 'مراجعة الشركات وطلب المستندات وإدارة حالة التوثيق من لوحة الأدمن.'}
            </p>
          </div>
          <Button variant="outline" onClick={loadCompanies} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {isEnglish ? 'Refresh' : 'تحديث'}
          </Button>
        </section>

        {feedback ? (
          <Card
            className={
              feedback.type === 'error'
                ? 'border-destructive/30 bg-destructive/5'
                : 'border-primary/20 bg-primary/5'
            }
          >
            <CardContent
              className={
                feedback.type === 'error'
                  ? 'pt-6 text-sm text-destructive'
                  : 'pt-6 text-sm text-primary'
              }
            >
              {feedback.message}
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>{isEnglish ? 'Company requests' : 'طلبات توثيق الشركات'}</CardTitle>
            <CardDescription>
              {loading
                ? isEnglish
                  ? 'Loading companies...'
                  : 'جار تحميل الشركات...'
                : `${filteredCompanies.length} ${isEnglish ? 'companies shown' : 'شركة معروضة'}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-3 lg:grid-cols-[1fr_260px]">
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground ltr:left-3 rtl:right-3" />
                <Input
                  className="ltr:pl-9 rtl:pr-9"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={
                    isEnglish ? 'Search by company name or email' : 'ابحث حسب اسم الشركة أو البريد'
                  }
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as CompanyStatusFilter)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">
                    {isEnglish ? 'Pending review' : 'قيد المراجعة'}
                  </SelectItem>
                  <SelectItem value="verified">{isEnglish ? 'Verified' : 'موثقة'}</SelectItem>
                  <SelectItem value="documents_requested">
                    {isEnglish ? 'Documents requested' : 'بانتظار المستندات'}
                  </SelectItem>
                  <SelectItem value="all">{isEnglish ? 'All companies' : 'كل الشركات'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="flex min-h-40 items-center justify-center gap-2 rounded-lg border border-dashed text-sm text-muted-foreground">
                <LoaderCircle className="h-4 w-4 animate-spin" />
                {isEnglish ? 'Loading company requests...' : 'جار تحميل طلبات الشركات...'}
              </div>
            ) : null}

            {!loading && filteredCompanies.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                {isEnglish
                  ? 'No companies match the current filters.'
                  : 'لا توجد شركات مطابقة للفلاتر الحالية.'}
              </div>
            ) : null}

            {!loading && filteredCompanies.length > 0 ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {filteredCompanies.map((company) => {
                  const status = getCompanyStatus(company);
                  const isActing = actingId === company.id;
                  const isDocumentFormOpen = documentCompanyId === company.id;

                  return (
                    <Card key={company.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <CardTitle>{getCompanyName(company)}</CardTitle>
                            <CardDescription className="mt-1">
                              {getCompanyEmail(company) || (isEnglish ? 'No email' : 'لا يوجد بريد')}
                            </CardDescription>
                          </div>
                          <Badge className={getStatusClassName(status)}>
                            {getStatusLabel(status, isEnglish)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            disabled={isActing || status === 'verified'}
                            onClick={() => runAction(company, 'verify')}
                          >
                            {isActing ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                            {isEnglish ? 'Verify' : 'توثيق'}
                          </Button>
                          <Button
                            variant="outline"
                            disabled={isActing || status !== 'verified'}
                            onClick={() => runAction(company, 'unverify')}
                          >
                            {isEnglish ? 'Unverify' : 'إلغاء التوثيق'}
                          </Button>
                          <Button
                            variant="outline"
                            disabled={isActing}
                            onClick={() => openDocumentRequest(company)}
                          >
                            <FileText className="h-4 w-4" />
                            {isEnglish ? 'Request documents' : 'طلب مستندات'}
                          </Button>
                        </div>

                        {isDocumentFormOpen ? (
                          <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
                            <div className="space-y-2">
                              <Label htmlFor={`document-title-${company.id}`}>
                                {isEnglish ? 'Request title' : 'عنوان الطلب'}
                              </Label>
                              <Input
                                id={`document-title-${company.id}`}
                                value={documentTitle}
                                onChange={(event) => setDocumentTitle(event.target.value)}
                              />
                              {fieldErrors.title ? (
                                <p className="text-xs text-destructive">
                                  {fieldErrors.title.join(' ')}
                                </p>
                              ) : null}
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`document-message-${company.id}`}>
                                {isEnglish ? 'Message' : 'الرسالة'}
                              </Label>
                              <Textarea
                                id={`document-message-${company.id}`}
                                rows={4}
                                value={documentMessage}
                                onChange={(event) => setDocumentMessage(event.target.value)}
                              />
                              {fieldErrors.message ? (
                                <p className="text-xs text-destructive">
                                  {fieldErrors.message.join(' ')}
                                </p>
                              ) : null}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Button
                                disabled={isActing}
                                onClick={() => sendDocumentRequest(company)}
                              >
                                {isActing ? (
                                  <LoaderCircle className="h-4 w-4 animate-spin" />
                                ) : null}
                                {isEnglish ? 'Send request' : 'إرسال الطلب'}
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setDocumentCompanyId(null)}
                              >
                                {isEnglish ? 'Cancel' : 'إلغاء'}
                              </Button>
                            </div>
                          </div>
                        ) : null}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
