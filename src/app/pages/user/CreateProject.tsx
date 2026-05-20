import { useState } from 'react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@/app/components/ui';
import { createProject } from '@/app/storage';
import { getCitiesByGovernorate, getLocationLabel, governorates } from '@/app/data/locationsData';

const defaultGovernorateId = 1;
const defaultCityId = 101;

export default function CreateProject() {
  const navigate = useNavigate();
  const { isEnglish, language } = useLanguage();
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    duration: '',
    category: '',
    skills: '',
    governorateId: String(defaultGovernorateId),
    cityId: String(defaultCityId),
  });

  const normalizeBudget = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      return '';
    }

    return trimmed.startsWith('$') ? trimmed : `$${trimmed}`;
  };

  const normalizeBudgetInput = (value: string) => value.replace(/[^\d]/g, '');
  const normalizeDaysInput = (value: string) => value.replace(/[^\d]/g, '');

  const formatDaysLabel = (value: string) => {
    const digits = normalizeDaysInput(value);
    if (!digits) {
      return '';
    }

    return `${digits} ${digits === '1' ? (isEnglish ? 'day' : 'يوم') : isEnglish ? 'days' : 'أيام'}`;
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDurationChange = (value: string) => {
    const normalizedValue = normalizeDaysInput(value);

    if (!normalizedValue) {
      handleChange('duration', '');
      setError('');
      return;
    }

    if (Number(normalizedValue) === 0) {
      handleChange('duration', '');
      setError(isEnglish ? 'You cannot enter 0 in the number of days.' : 'لا يمكن إدخال 0 في عدد الأيام.');
      return;
    }

    handleChange('duration', String(Number(normalizedValue)));
    setError('');
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.title.trim() || !formData.description.trim() || !formData.budget.trim()) {
      setError(
        isEnglish
          ? 'Complete the required fields before publishing the project.'
          : 'أكمل الحقول الأساسية قبل نشر المشروع.',
      );
      return;
    }

    if (!normalizeDaysInput(formData.duration) || Number(normalizeDaysInput(formData.duration)) <= 0) {
      setError(isEnglish ? 'Number of days must be greater than 0.' : 'عدد الأيام يجب أن يكون أكبر من 0.');
      return;
    }

    createProject({
      title: formData.title.trim(),
      description: `${formData.description.trim()}\n\n${isEnglish ? 'Location' : 'الموقع'}: ${getLocationLabel(
        Number(formData.governorateId),
        Number(formData.cityId),
      )}`,
      budget: normalizeBudget(formData.budget),
      budgetValue: Number(normalizeBudgetInput(formData.budget)),
      category: formData.category || (isEnglish ? 'General' : 'عام'),
      duration: formatDaysLabel(formData.duration),
      client: isEnglish ? 'You' : 'أنت',
      skills: formData.skills
        .split(',')
        .map((skill) => skill.trim())
        .filter(Boolean),
    });

    setError('');
    navigate('/projects');
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <div>
          <h1 className="text-3xl font-bold">{isEnglish ? 'Create New Project' : 'إنشاء مشروع جديد'}</h1>
          <p className="mt-1 text-muted-foreground">
            {isEnglish
              ? 'Enter the details of the project you want to publish.'
              : 'أدخل تفاصيل المشروع الذي تريد نشره.'}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{isEnglish ? 'Project Details' : 'تفاصيل المشروع'}</CardTitle>
            <CardDescription>
              {isEnglish ? 'Fill out the following fields to publish your project.' : 'املأ الحقول التالية لنشر مشروعك.'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium">{isEnglish ? 'Project Title' : 'عنوان المشروع'}</label>
                <Input
                  placeholder={isEnglish ? 'Example: Develop an e-commerce store' : 'مثال: تطوير متجر إلكتروني'}
                  value={formData.title}
                  onChange={(event) => handleChange('title', event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{isEnglish ? 'Project Description' : 'وصف المشروع'}</label>
                <Textarea
                  rows={6}
                  placeholder={
                    isEnglish
                      ? 'Write a clear description about the project and its requirements'
                      : 'اكتب وصفًا واضحًا عن المشروع والمتطلبات'
                  }
                  value={formData.description}
                  onChange={(event) => handleChange('description', event.target.value)}
                  className="resize-none"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{isEnglish ? 'Budget' : 'الميزانية'}</label>
                  <Input
                    placeholder="$5000"
                    value={formData.budget}
                    onBlur={() => handleChange('budget', normalizeBudget(formData.budget))}
                    onChange={(event) => handleChange('budget', normalizeBudgetInput(event.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">{isEnglish ? 'Project Duration in Days' : 'مدة المشروع بالأيام'}</label>
                  <Input
                    placeholder="7"
                    value={formData.duration}
                    onBlur={() => handleChange('duration', formatDaysLabel(formData.duration))}
                    onChange={(event) => handleDurationChange(event.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{isEnglish ? 'Governorate' : 'المحافظة'}</label>
                  <Select
                    value={formData.governorateId}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        governorateId: value,
                        cityId: String(getCitiesByGovernorate(Number(value))[0]?.id ?? defaultCityId),
                      }))
                    }
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
                      {getCitiesByGovernorate(Number(formData.governorateId)).map((city) => (
                        <SelectItem key={city.id} value={String(city.id)}>
                          {city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {error ? <p className="text-sm text-destructive">{error}</p> : null}

              <div className="space-y-2">
                <label className="text-sm font-medium">{isEnglish ? 'Category' : 'التصنيف'}</label>
                <Select onValueChange={(value) => handleChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={isEnglish ? 'Choose category' : 'اختر التصنيف'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="برمجة وتطوير">{isEnglish ? 'Programming & Development' : 'برمجة وتطوير'}</SelectItem>
                    <SelectItem value="تصميم">{isEnglish ? 'Design' : 'تصميم'}</SelectItem>
                    <SelectItem value="كتابة وترجمة">{isEnglish ? 'Writing & Translation' : 'كتابة وترجمة'}</SelectItem>
                    <SelectItem value="تسويق">{isEnglish ? 'Marketing' : 'تسويق'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{isEnglish ? 'Required Skills' : 'المهارات المطلوبة'}</label>
                <Input
                  placeholder={isEnglish ? 'Example: React, Node.js, MongoDB' : 'مثال: React, Node.js, MongoDB'}
                  value={formData.skills}
                  onChange={(event) => handleChange('skills', event.target.value)}
                />
              </div>

              <div className="flex gap-3">
                <Button type="submit">{isEnglish ? 'Publish Project' : 'نشر المشروع'}</Button>
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
