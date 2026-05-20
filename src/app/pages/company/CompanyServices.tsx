import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  MessageSquare,
  Search,
  ShieldAlert,
  Sparkles,
  Star,
  User,
  Wallet,
} from 'lucide-react';
import DashboardLayout from '@/app/components/layout';
import { useLanguage } from '@/app/providers/LanguageProvider';
import {
  Badge,
  Button,
  Card,
  CardContent,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui';
import { getCategorySearchTerms, getDisplayCategoryLabel, getDisplayDurationLabel } from '@/app/data';
import { createContentReport, getServices } from '@/app/storage';

export default function CompanyServices() {
  const { language, isEnglish } = useLanguage();
  const navigate = useNavigate();
  const [services, setServices] = useState(getServices());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    setServices(getServices());
  }, []);

  const filteredServices = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return services.filter((service) => {
      const isVisible = service.status === 'نشط';
      const matchesSearch =
        normalizedSearch === '' ||
        service.title.toLowerCase().includes(normalizedSearch) ||
        service.provider.toLowerCase().includes(normalizedSearch) ||
        service.description.toLowerCase().includes(normalizedSearch) ||
        getCategorySearchTerms(service.category).some((term) =>
          term.toLowerCase().includes(normalizedSearch),
        );

      const matchesCategory =
        selectedCategory === 'all' || service.category === selectedCategory;

      return isVisible && matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory, services]);

  const handleReportService = (serviceTitle: string) => {
    createContentReport({
      targetType: isEnglish ? 'Published service' : 'خدمة منشورة',
      targetLabel: serviceTitle,
      reporter: isEnglish ? 'Company account' : 'حساب شركة',
      description: isEnglish
        ? `A company account reported the "${serviceTitle}" service for admin review.`
        : `تم إرسال بلاغ من حساب شركة على الخدمة "${serviceTitle}" لمراجعتها من قبل الأدمن.`,
    });
    setStatusMessage(
      isEnglish
        ? `The report for "${serviceTitle}" was sent successfully.`
        : `تم إرسال البلاغ على الخدمة "${serviceTitle}" بنجاح.`,
    );
  };

  return (
    <DashboardLayout userType="company">
      <div className="space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <section className="rounded-3xl border border-border bg-gradient-to-l from-slate-50 via-white to-blue-50 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
                <Sparkles className="size-4" />
                {isEnglish ? 'Browse provider listings' : 'تصفح منشورات مقدمي الخدمة'}
              </div>
              <h1 className="text-3xl font-bold">
                {isEnglish ? 'Service provider offerings' : 'خدمات مقدمي الخدمة'}
              </h1>
              <p className="mt-2 text-muted-foreground">
                {isEnglish
                  ? 'Browse ready-to-order services published by freelancers and service providers, review their profiles, or contact them directly when needed.'
                  : 'من هنا تستطيع الشركة استعراض الخدمات الجاهزة المنشورة من المستقلين ومقدمي الخدمة، ومراجعة ملفاتهم الشخصية أو مراسلتهم مباشرة عند الحاجة.'}
              </p>
            </div>

            <Button asChild variant="outline">
              <Link to="/company/messages">{isEnglish ? 'Open messages' : 'فتح المحادثات'}</Link>
            </Button>
          </div>
        </section>

        {statusMessage ? (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-6 text-sm text-amber-800">{statusMessage}</CardContent>
          </Card>
        ) : null}

        <Card>
          <CardContent className="grid gap-4 pt-6 md:grid-cols-3">
            <div className="relative md:col-span-2">
              <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={isEnglish ? 'Search for a service or provider...' : 'ابحث عن خدمة أو مقدم خدمة...'}
                className="pr-10"
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder={isEnglish ? 'Category' : 'التصنيف'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isEnglish ? 'All categories' : 'كل التصنيفات'}</SelectItem>
                <SelectItem value="تصميم">{isEnglish ? 'Design' : 'تصميم'}</SelectItem>
                <SelectItem value="برمجة وتطوير">
                  {isEnglish ? 'Programming & Development' : 'برمجة وتطوير'}
                </SelectItem>
                <SelectItem value="كتابة وترجمة">
                  {isEnglish ? 'Writing & Translation' : 'كتابة وترجمة'}
                </SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                {isEnglish ? 'Available services for the company' : 'الخدمات المتاحة للشركة'}
              </p>
              <p className="mt-2 text-2xl font-bold">{filteredServices.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                {isEnglish ? 'Purpose of this page' : 'الهدف من الصفحة'}
              </p>
              <p className="mt-2 text-sm leading-6 text-foreground">
                {isEnglish
                  ? 'Explore ready-to-order offerings instead of relying only on traditional hiring flows.'
                  : 'استكشاف ما يقدمه مقدمو الخدمة الجاهزون بدل انتظار طلبات التوظيف التقليدية فقط.'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                {isEnglish ? 'Quick action' : 'إجراء سريع'}
              </p>
              <p className="mt-2 text-sm leading-6 text-foreground">
                {isEnglish
                  ? 'Open the public profile, message the provider, or report the service if it is inappropriate.'
                  : 'يمكنك فتح الملف الشخصي العام أو مراسلة مقدم الخدمة أو الإبلاغ عن الخدمة إذا كانت مخالفة.'}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {filteredServices.length > 0 ? (
            filteredServices.map((service) => (
              <Card key={service.id} className="transition-shadow hover:shadow-lg">
                <div className="space-y-4 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold">{service.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {isEnglish ? 'Provider:' : 'مقدم الخدمة:'} {service.provider}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {getDisplayCategoryLabel(service.category, isEnglish)}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground">{service.description}</p>

                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Wallet className="size-4 text-primary" />
                      {service.price}
                    </span>
                    <span>{getDisplayDurationLabel(service.delivery, isEnglish)}</span>
                    <span className="flex items-center gap-1">
                      <Star className="size-4 fill-yellow-400 text-yellow-400" />
                      {service.rating || (isEnglish ? 'New' : 'جديد')}
                    </span>
                    <span>
                      {service.orders} {isEnglish ? 'orders' : 'طلب'}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button asChild variant="outline">
                      <Link
                        to={`/freelancers/${service.providerId}`}
                        state={{ viewerType: 'company', returnTo: '/company/services' }}
                      >
                        <User className="ml-2 size-4" />
                        {isEnglish ? 'View profile' : 'عرض الملف الشخصي'}
                      </Link>
                    </Button>

                    <Button variant="outline" onClick={() => navigate('/company/messages')}>
                      <MessageSquare className="ml-2 size-4" />
                      {isEnglish ? 'Message provider' : 'مراسلة مقدم الخدمة'}
                    </Button>

                    <Button variant="outline" onClick={() => handleReportService(service.title)}>
                      <ShieldAlert className="ml-2 size-4" />
                      {isEnglish ? 'Report service' : 'إبلاغ عن الخدمة'}
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="md:col-span-2">
              <CardContent className="py-10 text-center">
                <p className="text-lg font-medium">
                  {isEnglish ? 'No matching services found' : 'لا توجد خدمات مطابقة'}
                </p>
                <p className="mt-2 text-muted-foreground">
                  {isEnglish
                    ? 'Try adjusting the search or category to find relevant services.'
                    : 'جرّب تعديل البحث أو التصنيف لتظهر لك خدمات مناسبة.'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
