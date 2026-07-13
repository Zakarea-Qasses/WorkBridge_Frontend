import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, ArrowRight } from 'lucide-react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@/app/components/ui';
import { getApiErrorMessage, getValidationErrors } from '@/app/api/client';
import {
  getCategories,
  getCitiesByGovernorate,
  getGovernorates,
  type Category,
  type LocationOption,
} from '@/app/api/pages/user/createProject';
import { createProject } from '@/app/api/pages/user/createProject';
import { categoryDisplayName } from '@/app/utils/categoryLabels';
import { sanitizePositiveIntegerInput, sanitizePositiveMoneyInput } from '@/app/utils/money';

export default function CreateProject() {
  const navigate = useNavigate();
  const { isEnglish, language } = useLanguage();
  const BackIcon = isEnglish ? ArrowLeft : ArrowRight;
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [governorates, setGovernorates] = useState<LocationOption[]>([]);
  const [cities, setCities] = useState<LocationOption[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    duration_days: '',
    category_id: '',
    governorateId: '',
    cityId: '',
  });

  useEffect(() => {
    Promise.all([getCategories(), getGovernorates()])
      .then(([nextCategories, nextGovernorates]) => {
        setCategories(nextCategories);
        setGovernorates(nextGovernorates);
        const firstGovernorate = nextGovernorates[0];
        if (firstGovernorate) {
          setFormData((current) => ({ ...current, governorateId: String(firstGovernorate.id) }));
        }
      })
      .catch((fetchError) => setError(getApiErrorMessage(fetchError)));
  }, []);

  useEffect(() => {
    if (!formData.governorateId) {
      return;
    }

    getCitiesByGovernorate(formData.governorateId)
      .then((nextCities) => {
        setCities(nextCities);
        setFormData((current) => ({
          ...current,
          cityId: current.cityId || String(nextCities[0]?.id || ''),
        }));
      })
      .catch((fetchError) => setError(getApiErrorMessage(fetchError)));
  }, [formData.governorateId]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setFieldErrors({});

    if (!formData.title.trim() || !formData.description.trim() || !formData.budget.trim() || !formData.category_id) {
      setError(isEnglish ? 'Complete the required fields before publishing the project.' : 'أكمل الحقول الأساسية قبل نشر المشروع.');
      return;
    }

    try {
      setIsSubmitting(true);
      await createProject({
        title: formData.title.trim(),
        description: formData.description.trim(),
        budget: Number(formData.budget),
        duration_days: Number(formData.duration_days),
        category_id: Number(formData.category_id),
        governorate_id: formData.governorateId ? Number(formData.governorateId) : null,
        city_id: formData.cityId ? Number(formData.cityId) : null,
      });
      navigate('/projects');
    } catch (submitError) {
      setFieldErrors(getValidationErrors(submitError));
      setError(getApiErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate('/projects');
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <div className="flex items-start justify-between gap-4">
          <div>
          <h1 className="text-3xl font-bold">{isEnglish ? 'Create New Project' : 'إنشاء مشروع جديد'}</h1>
          <p className="mt-1 text-muted-foreground">
            {isEnglish ? 'Enter the details of the project you want to publish.' : 'أدخل تفاصيل المشروع الذي تريد نشره.'}
          </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleBack}
            aria-label={isEnglish ? 'Back' : 'رجوع'}
            title={isEnglish ? 'Back' : 'رجوع'}
            className="shrink-0"
          >
            <BackIcon className="h-4 w-4" />
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{isEnglish ? 'Project Details' : 'تفاصيل المشروع'}</CardTitle>
            <CardDescription>
              {isEnglish ? 'Add enough details so applicants can send accurate offers.' : 'أضف تفاصيل كافية ليستطيع المتقدمون إرسال عروض دقيقة.'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium">{isEnglish ? 'Project Title' : 'عنوان المشروع'}</label>
                <Input value={formData.title} onChange={(event) => handleChange('title', event.target.value)} />
                {fieldErrors.title?.[0] ? <p className="text-xs text-destructive">{fieldErrors.title[0]}</p> : null}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{isEnglish ? 'Project Description' : 'وصف المشروع'}</label>
                <Textarea
                  rows={6}
                  value={formData.description}
                  onChange={(event) => handleChange('description', event.target.value)}
                  className="resize-none"
                />
                {fieldErrors.description?.[0] ? <p className="text-xs text-destructive">{fieldErrors.description[0]}</p> : null}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{isEnglish ? 'Budget ($)' : 'الميزانية ($)'}</label>
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={formData.budget}
                    onChange={(event) => handleChange('budget', sanitizePositiveMoneyInput(event.target.value))}
                    placeholder="$0.00"
                  />
                  {fieldErrors.budget?.[0] ? <p className="text-xs text-destructive">{fieldErrors.budget[0]}</p> : null}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">{isEnglish ? 'Project Duration in Days' : 'مدة المشروع بالأيام'}</label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={formData.duration_days}
                    onChange={(event) => handleChange('duration_days', sanitizePositiveIntegerInput(event.target.value))}
                  />
                  {fieldErrors.duration_days?.[0] ? <p className="text-xs text-destructive">{fieldErrors.duration_days[0]}</p> : null}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{isEnglish ? 'Governorate' : 'المحافظة'}</label>
                  <Select
                    value={formData.governorateId}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, governorateId: value, cityId: '' }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={isEnglish ? 'Choose governorate' : 'اختر المحافظة'} />
                    </SelectTrigger>
                    <SelectContent>
                      {governorates.map((governorate) => (
                        <SelectItem key={governorate.id} value={String(governorate.id)}>
                          {governorate.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">{isEnglish ? 'City' : 'المدينة'}</label>
                  <Select value={formData.cityId} onValueChange={(value) => handleChange('cityId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder={isEnglish ? 'Choose city' : 'اختر المدينة'} />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city.id} value={String(city.id)}>
                          {city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{isEnglish ? 'Category' : 'التصنيف'}</label>
                <Select value={formData.category_id} onValueChange={(value) => handleChange('category_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={isEnglish ? 'Choose category' : 'اختر التصنيف'} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={String(category.id)}>
                        {categoryDisplayName(category.name, isEnglish)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.category_id?.[0] ? <p className="text-xs text-destructive">{fieldErrors.category_id[0]}</p> : null}
              </div>

              {error ? <p className="text-sm text-destructive">{error}</p> : null}

              <div className="flex gap-3">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (isEnglish ? 'Publishing...' : 'جار النشر...') : isEnglish ? 'Publish Project' : 'نشر المشروع'}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/projects')}>
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
