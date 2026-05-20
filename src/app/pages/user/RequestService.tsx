import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { MessageSquare, Wallet } from 'lucide-react';
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
  Textarea,
} from '@/app/components/ui';
import { getDisplayCategoryLabel, getDisplayDurationLabel } from '@/app/data';
import { createServiceRequest, getServiceById } from '@/app/storage';

export default function RequestService() {
  const navigate = useNavigate();
  const params = useParams();
  const { isEnglish, language } = useLanguage();
  const serviceId = Number(params.id);
  const service = useMemo(() => getServiceById(serviceId), [serviceId]);
  const [feedback, setFeedback] = useState('');
  const [form, setForm] = useState({
    requestTitle: '',
    details: '',
    references: '',
    deadline: '',
  });

  const normalizeDaysInput = (value: string) => value.replace(/[^\d]/g, '');

  const formatDaysLabel = (value: string) => {
    const digits = normalizeDaysInput(value);
    if (!digits) {
      return '';
    }

    return `${digits} ${digits === '1' ? (isEnglish ? 'day' : 'يوم') : isEnglish ? 'days' : 'أيام'}`;
  };

  const handleDeadlineChange = (value: string) => {
    const normalizedValue = normalizeDaysInput(value);

    if (!normalizedValue) {
      setForm((current) => ({
        ...current,
        deadline: '',
      }));
      setFeedback('');
      return;
    }

    if (Number(normalizedValue) === 0) {
      setForm((current) => ({
        ...current,
        deadline: '',
      }));
      setFeedback(isEnglish ? 'You cannot enter 0 in the number of days.' : 'لا يمكن إدخال 0 في عدد الأيام.');
      return;
    }

    setForm((current) => ({
      ...current,
      deadline: String(Number(normalizedValue)),
    }));
    setFeedback('');
  };

  if (!service) {
    return (
      <DashboardLayout>
        <div className="space-y-4" dir={language === 'en' ? 'ltr' : 'rtl'}>
          <h1 className="text-3xl font-bold">{isEnglish ? 'Request Service' : 'طلب خدمة'}</h1>
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">
                {isEnglish ? 'The requested service was not found or is no longer available.' : 'الخدمة المطلوبة غير موجودة أو لم تعد متاحة.'}
              </p>
              <div className="mt-4">
                <Button asChild>
                  <Link to="/services">{isEnglish ? 'Back to services' : 'العودة إلى الخدمات'}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.requestTitle.trim() || !form.details.trim() || !form.deadline.trim()) {
      setFeedback(
        isEnglish
          ? 'Complete the request title, details, and deadline before sending.'
          : 'أكمل عنوان الطلب والتفاصيل وموعد التسليم قبل الإرسال.',
      );
      return;
    }

    if (Number(normalizeDaysInput(form.deadline)) <= 0) {
      setFeedback(isEnglish ? 'Number of days must be greater than 0.' : 'عدد الأيام يجب أن يكون أكبر من 0.');
      return;
    }

    createServiceRequest({
      serviceId: service.id,
      serviceTitle: service.title,
      provider: service.provider,
      providerId: service.providerId,
      client: 'أحمد محمد',
      clientId: 1,
      price: service.price,
      requestTitle: form.requestTitle,
      details: form.details,
      references: form.references,
      deadline: formatDaysLabel(form.deadline),
    });

    setFeedback(
      isEnglish
        ? `The service request was sent to ${service.provider} successfully.`
        : `تم إرسال طلب الخدمة إلى ${service.provider} بنجاح.`,
    );
    setForm({
      requestTitle: '',
      details: '',
      references: '',
      deadline: '',
    });

    navigate('/services/requests');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/services" className="hover:text-primary">
            {isEnglish ? 'Services' : 'الخدمات'}
          </Link>
          <span>/</span>
          <span className="text-foreground">{isEnglish ? 'Request Service' : 'طلب خدمة'}</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{isEnglish ? 'Request Service' : 'طلب خدمة'}</h1>
            <p className="mt-1 text-muted-foreground">
              {isEnglish
                ? 'Send clear details to the service provider before execution starts.'
                : 'أرسل تفاصيل واضحة لمقدم الخدمة قبل بدء التنفيذ.'}
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/messages')}>
              <MessageSquare className="ml-2 size-4" />
              {isEnglish ? 'Message provider' : 'مراسلة مقدم الخدمة'}
            </Button>
            <Button asChild variant="outline">
              <Link to="/services">{isEnglish ? 'Back to services' : 'العودة إلى الخدمات'}</Link>
            </Button>
          </div>
        </div>

        {feedback ? (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6 text-sm text-primary">{feedback}</CardContent>
          </Card>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
          <Card>
            <CardHeader>
              <CardTitle>{isEnglish ? 'Request Details' : 'تفاصيل الطلب'}</CardTitle>
              <CardDescription>
                {isEnglish ? 'Explain clearly to the provider what you need exactly.' : 'اشرح لمقدم الخدمة ما الذي تحتاجه بالضبط.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="request-title">{isEnglish ? 'Request Title' : 'عنوان الطلب'}</Label>
                  <Input
                    id="request-title"
                    value={form.requestTitle}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, requestTitle: event.target.value }))
                    }
                    placeholder={isEnglish ? 'Example: Design a landing page for a new product launch' : 'مثال: تصميم صفحة هبوط لإطلاق منتج جديد'}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="request-details">{isEnglish ? 'What You Need' : 'تفاصيل ما تحتاجه'}</Label>
                  <Textarea
                    id="request-details"
                    rows={7}
                    value={form.details}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, details: event.target.value }))
                    }
                    placeholder={isEnglish ? 'Write the required work details, expected result, and any important notes.' : 'اكتب تفاصيل العمل المطلوب، النتيجة المتوقعة، وأي ملاحظات مهمة.'}
                    className="resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="request-references">{isEnglish ? 'Links or References' : 'روابط أو مراجع'}</Label>
                  <Textarea
                    id="request-references"
                    rows={4}
                    value={form.references}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, references: event.target.value }))
                    }
                    placeholder={isEnglish ? 'Add sample links, visual references, or files you want to rely on.' : 'أضف روابط أمثلة أو مراجع بصرية أو ملفات تريد الاعتماد عليها.'}
                    className="resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="request-deadline">
                    {isEnglish ? 'Requested Delivery Time in Days' : 'موعد التسليم المطلوب بالأيام'}
                  </Label>
                  <Input
                    id="request-deadline"
                    value={form.deadline}
                    onBlur={() =>
                      setForm((current) => ({
                        ...current,
                        deadline: formatDaysLabel(current.deadline),
                      }))
                    }
                    onChange={(event) => handleDeadlineChange(event.target.value)}
                    placeholder="5"
                  />
                </div>

                <Button type="submit" className="w-full">
                  {isEnglish ? 'Send Request' : 'إرسال الطلب'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{service.title}</CardTitle>
                <CardDescription>{service.provider}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Badge variant="outline">{getDisplayCategoryLabel(service.category, isEnglish)}</Badge>
                <p className="text-sm text-muted-foreground">{service.description}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{isEnglish ? 'Delivery time' : 'مدة التنفيذ'}</span>
                    <span className="font-medium">{getDisplayDurationLabel(service.delivery, isEnglish)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{isEnglish ? 'Rating' : 'التقييم'}</span>
                    <span className="font-medium">{service.rating}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{isEnglish ? 'Orders count' : 'عدد الطلبات'}</span>
                    <span className="font-medium">{service.orders}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="size-5 text-primary" />
                  {isEnglish ? 'Financial Summary' : 'الملخص المالي'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{isEnglish ? 'Service price' : 'سعر الخدمة'}</span>
                  <span className="font-semibold">{service.price}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{isEnglish ? 'Current status' : 'الحالة الحالية'}</span>
                  <span className="font-semibold">{isEnglish ? 'Awaiting request submission' : 'بانتظار إرسال الطلب'}</span>
                </div>
                <p className="text-muted-foreground">
                  {isEnglish
                    ? 'After sending the request, you can follow up with the provider before execution starts.'
                    : 'بعد إرسال الطلب يمكن متابعة التفاصيل مع مقدم الخدمة قبل البدء بالتنفيذ.'}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
