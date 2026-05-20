import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  MessageSquare,
  Search,
  ShieldAlert,
  Sparkles,
  Star,
  Wallet,
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
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui';
import { getCategorySearchTerms, getDisplayCategoryLabel, getDisplayDurationLabel } from '@/app/data';
import { createContentReport, getServices } from '@/app/storage';

export default function Services() {
  const navigate = useNavigate();
  const { isEnglish, language } = useLanguage();
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

      const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;

      return isVisible && matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory, services]);

  const handleReportService = (serviceTitle: string) => {
    createContentReport({
      targetType: isEnglish ? 'Published service' : 'خدمة منشورة',
      targetLabel: serviceTitle,
      reporter: isEnglish ? 'Personal account user' : 'مستخدم الحساب الشخصي',
      description: isEnglish
        ? `A report was submitted for the service "${serviceTitle}" for admin review.`
        : `تم إرسال بلاغ على الخدمة "${serviceTitle}" لمراجعتها من قبل الأدمن.`,
    });
    setStatusMessage(
      isEnglish
        ? `The report for "${serviceTitle}" was sent successfully.`
        : `تم إرسال البلاغ على الخدمة "${serviceTitle}" بنجاح.`,
    );
  };

  const categoryOptions = [
    { value: 'all', label: isEnglish ? 'All categories' : 'كل التصنيفات' },
    { value: 'تصميم', label: isEnglish ? 'Design' : 'تصميم' },
    { value: 'برمجة وتطوير', label: isEnglish ? 'Programming & Development' : 'برمجة وتطوير' },
    { value: 'كتابة وترجمة', label: isEnglish ? 'Writing & Translation' : 'كتابة وترجمة' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <section className="rounded-3xl border border-border bg-gradient-to-l from-emerald-50 via-white to-teal-50 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-sm text-emerald-700">
                <Sparkles className="size-4" />
                {isEnglish ? 'Ready-made services for direct request' : 'خدمات جاهزة للطلب المباشر'}
              </div>
              <h1 className="text-3xl font-bold">{isEnglish ? 'Services' : 'الخدمات'}</h1>
              <p className="mt-2 text-muted-foreground">
                {isEnglish
                  ? 'Here you browse services already published by providers and request a ready-made service directly. Unlike projects, projects collect offers on your request, while here you choose a ready service published by its owner.'
                  : 'هنا تتصفح خدمات منشورة مسبقًا من مقدمي الخدمة وتطلب الخدمة الجاهزة مباشرة. الفرق عن صفحة المشاريع أن المشاريع تستقبل عروضًا على طلبك، أما هنا فأنت تختار خدمة جاهزة منشورة من صاحبها.'}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline">
                <Link to="/services/my">{isEnglish ? 'My services' : 'خدماتي'}</Link>
              </Button>
              <Button asChild>
                <Link to="/services/create">{isEnglish ? 'Publish service' : 'نشر خدمة'}</Link>
              </Button>
            </div>
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
                {categoryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{isEnglish ? 'Available services' : 'الخدمات المتاحة'}</p>
              <p className="mt-2 text-2xl font-bold">{filteredServices.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{isEnglish ? 'Direct request' : 'الطلب المباشر'}</p>
              <p className="mt-2 text-sm leading-6 text-foreground">
                {isEnglish
                  ? 'This page is meant for selecting a published service and requesting it immediately.'
                  : 'هذه الصفحة مخصصة لاختيار خدمة منشورة والبدء بطلبها فورًا.'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{isEnglish ? 'For attention' : 'للتنبيه'}</p>
              <p className="mt-2 text-sm leading-6 text-foreground">
                {isEnglish
                  ? 'If a service is abusive or violates the rules, you can report it directly from the card.'
                  : 'إذا كانت الخدمة مسيئة أو مخالفة يمكنك الإبلاغ عنها من نفس البطاقة.'}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {filteredServices.length > 0 ? (
            filteredServices.map((service) => (
              <Card key={service.id} className="transition-shadow hover:shadow-lg">
                <CardHeader className="gap-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg">{service.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {isEnglish ? 'Provider:' : 'مقدم الخدمة:'} {service.provider}
                      </CardDescription>
                    </div>
                    <Badge variant="outline">
                      {getDisplayCategoryLabel(service.category, isEnglish)}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
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
                    <Button onClick={() => navigate(`/services/${service.id}/request`)}>
                      {isEnglish ? 'Request service' : 'طلب الخدمة'}
                    </Button>

                    <Button variant="outline" onClick={() => navigate('/messages')}>
                      <MessageSquare className="ml-2 size-4" />
                      {isEnglish ? 'Message provider' : 'مراسلة مقدم الخدمة'}
                    </Button>

                    <Button variant="outline" onClick={() => handleReportService(service.title)}>
                      <ShieldAlert className="ml-2 size-4" />
                      {isEnglish ? 'Report service' : 'إبلاغ عن الخدمة'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="md:col-span-2">
              <CardContent className="py-10 text-center">
                <p className="text-lg font-medium">{isEnglish ? 'No matching services found' : 'لا توجد خدمات مطابقة'}</p>
                <p className="mt-2 text-muted-foreground">
                  {isEnglish
                    ? 'Try changing the search or category to get better results.'
                    : 'جرّب تغيير البحث أو التصنيف حتى تظهر لك نتائج مناسبة.'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
