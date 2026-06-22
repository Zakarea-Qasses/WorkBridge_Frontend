import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
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
  Textarea,
} from '@/app/components/ui';
import { getApiErrorMessage, getValidationErrors } from '@/app/api/client';
import { createService, getCategories, type Category } from '@/app/api/endpoints';

export default function CreateService() {
  const navigate = useNavigate();
  const { isEnglish, language } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    category_id: '',
    price: '',
    delivery_days: '',
    description: '',
  });
  const [feedback, setFeedback] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch((error) => setFeedback(getApiErrorMessage(error)));
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback('');
    setFieldErrors({});

    if (!formData.title || !formData.category_id || !formData.price || !formData.delivery_days) {
      setFeedback(isEnglish ? 'Fill in all required fields before publishing the service.' : 'املأ جميع الحقول الأساسية قبل نشر الخدمة.');
      return;
    }

    try {
      setIsSubmitting(true);
      await createService({
        title: formData.title.trim(),
        category_id: Number(formData.category_id),
        price: Number(formData.price),
        delivery_days: Number(formData.delivery_days),
        description: formData.description.trim(),
      });
      navigate('/services/my');
    } catch (error) {
      setFieldErrors(getValidationErrors(error));
      setFeedback(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <div>
          <h1 className="text-3xl font-bold">{isEnglish ? 'Publish a New Service' : 'نشر خدمة جديدة'}</h1>
          <p className="mt-1 text-muted-foreground">
            {isEnglish ? 'Add your service details so it appears in available services.' : 'أضف تفاصيل خدمتك لتظهر ضمن الخدمات المتاحة.'}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{isEnglish ? 'Service Details' : 'بيانات الخدمة'}</CardTitle>
            <CardDescription>
              {isEnglish ? 'Service data is sent to the backend using the Laravel field names.' : 'سيتم إرسال بيانات الخدمة إلى الخادم بالحقول المطلوبة.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="service-title">{isEnglish ? 'Service Title' : 'عنوان الخدمة'}</Label>
                <Input
                  id="service-title"
                  value={formData.title}
                  onChange={(event) => setFormData((current) => ({ ...current, title: event.target.value }))}
                />
                {fieldErrors.title?.[0] ? <p className="text-xs text-destructive">{fieldErrors.title[0]}</p> : null}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{isEnglish ? 'Category' : 'التصنيف'}</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => setFormData((current) => ({ ...current, category_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={isEnglish ? 'Choose category' : 'اختر التصنيف'} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={String(category.id)}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldErrors.category_id?.[0] ? <p className="text-xs text-destructive">{fieldErrors.category_id[0]}</p> : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="service-price">{isEnglish ? 'Price' : 'السعر'}</Label>
                  <Input
                    id="service-price"
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={(event) => setFormData((current) => ({ ...current, price: event.target.value }))}
                  />
                  {fieldErrors.price?.[0] ? <p className="text-xs text-destructive">{fieldErrors.price[0]}</p> : null}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="service-delivery">{isEnglish ? 'Delivery Time in Days' : 'مدة التسليم بالأيام'}</Label>
                <Input
                  id="service-delivery"
                  type="number"
                  min="1"
                  value={formData.delivery_days}
                  onChange={(event) => setFormData((current) => ({ ...current, delivery_days: event.target.value }))}
                />
                {fieldErrors.delivery_days?.[0] ? <p className="text-xs text-destructive">{fieldErrors.delivery_days[0]}</p> : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="service-description">{isEnglish ? 'Service Description' : 'وصف الخدمة'}</Label>
                <Textarea
                  id="service-description"
                  rows={6}
                  value={formData.description}
                  onChange={(event) => setFormData((current) => ({ ...current, description: event.target.value }))}
                />
                {fieldErrors.description?.[0] ? <p className="text-xs text-destructive">{fieldErrors.description[0]}</p> : null}
              </div>

              {feedback ? <p className="text-sm text-destructive">{feedback}</p> : null}

              <div className="flex flex-wrap gap-3">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (isEnglish ? 'Publishing...' : 'جار النشر...') : isEnglish ? 'Publish Service' : 'نشر الخدمة'}
                </Button>
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
