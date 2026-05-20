import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router';
import DashboardLayout from '@/app/components/layout';
import { useLanguage } from '@/app/providers/LanguageProvider';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea } from '@/app/components/ui';
import { createService } from '@/app/storage';

export default function CreateService() {
  const navigate = useNavigate();
  const { isEnglish, language } = useLanguage();
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    price: '',
    delivery: '',
    description: '',
  });
  const [feedback, setFeedback] = useState('');

  const normalizePrice = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      return '';
    }

    return trimmed.startsWith('$') ? trimmed : `$${trimmed}`;
  };

  const normalizePriceInput = (value: string) => value.replace(/[^\d]/g, '');
  const normalizeDaysInput = (value: string) => value.replace(/[^\d]/g, '');
  const formatDaysLabel = (value: string) => {
    const digits = normalizeDaysInput(value);
    if (!digits) {
      return '';
    }

    return `${digits} ${digits === '1' ? (isEnglish ? 'day' : 'يوم') : isEnglish ? 'days' : 'أيام'}`;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formData.title || !formData.category || !formData.price || !formData.delivery) {
      setFeedback(
        isEnglish
          ? 'Fill in all required fields before publishing the service.'
          : 'املأ جميع الحقول الأساسية قبل نشر الخدمة.',
      );
      return;
    }

    createService({
      ...formData,
      price: normalizePrice(formData.price),
      delivery: formatDaysLabel(formData.delivery),
      provider: 'أحمد محمد',
      providerId: 1,
    });
    navigate('/services/my');
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <div>
          <h1 className="text-3xl font-bold">{isEnglish ? 'Publish a New Service' : 'نشر خدمة جديدة'}</h1>
          <p className="mt-1 text-muted-foreground">
            {isEnglish
              ? 'Add your service details so it appears ضمن available services.'
              : 'أضف تفاصيل خدمتك لتظهر ضمن الخدمات المتاحة.'}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{isEnglish ? 'Service Details' : 'بيانات الخدمة'}</CardTitle>
            <CardDescription>
              {isEnglish
                ? 'The service will be saved locally in the project and shown in the services list.'
                : 'سيتم حفظ الخدمة محليًا داخل المشروع وظهورها في قائمة الخدمات.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="service-title">{isEnglish ? 'Service Title' : 'عنوان الخدمة'}</Label>
                <Input
                  id="service-title"
                  value={formData.title}
                  onChange={(event) =>
                    setFormData((current) => ({ ...current, title: event.target.value }))
                  }
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{isEnglish ? 'Category' : 'التصنيف'}</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData((current) => ({ ...current, category: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={isEnglish ? 'Choose category' : 'اختر التصنيف'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="تصميم">{isEnglish ? 'Design' : 'تصميم'}</SelectItem>
                      <SelectItem value="برمجة وتطوير">
                        {isEnglish ? 'Programming & Development' : 'برمجة وتطوير'}
                      </SelectItem>
                      <SelectItem value="كتابة وترجمة">
                        {isEnglish ? 'Writing & Translation' : 'كتابة وترجمة'}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="service-price">{isEnglish ? 'Price' : 'السعر'}</Label>
                  <Input
                    id="service-price"
                    value={formData.price}
                    onBlur={() =>
                      setFormData((current) => ({ ...current, price: normalizePrice(current.price) }))
                    }
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        price: normalizePriceInput(event.target.value),
                      }))
                    }
                    placeholder="$250"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="service-delivery">
                  {isEnglish ? 'Delivery Time in Days' : 'مدة التسليم بالأيام'}
                </Label>
                <Input
                  id="service-delivery"
                  value={formData.delivery}
                  onBlur={() =>
                    setFormData((current) => ({
                      ...current,
                      delivery: formatDaysLabel(current.delivery),
                    }))
                  }
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      delivery: normalizeDaysInput(event.target.value),
                    }))
                  }
                  placeholder="3"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="service-description">{isEnglish ? 'Service Description' : 'وصف الخدمة'}</Label>
                <Textarea
                  id="service-description"
                  rows={6}
                  value={formData.description}
                  onChange={(event) =>
                    setFormData((current) => ({ ...current, description: event.target.value }))
                  }
                />
              </div>

              {feedback ? <p className="text-sm text-destructive">{feedback}</p> : null}

              <div className="flex flex-wrap gap-3">
                <Button type="submit">{isEnglish ? 'Publish Service' : 'نشر الخدمة'}</Button>
                <Button type="button" variant="outline" onClick={() => navigate('/services')}>
                  {isEnglish ? 'Cancel' : 'إلغاء'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
