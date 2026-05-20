import { useState } from 'react';
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
import { companyJobs, getDisplayStatusLabel, getStatusClasses } from '@/app/data';
import { getCitiesByGovernorate, getLocationLabel, governorates } from '@/app/data/locationsData';

const emptyJob = {
  title: '',
  department: '',
  governorateId: '1',
  cityId: '101',
};

export default function CompanyJobs() {
  const { language, isEnglish } = useLanguage();
  const [jobs, setJobs] = useState(companyJobs);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState(emptyJob);
  const [feedback, setFeedback] = useState(
    'You can publish a new job or edit and pause current openings.',
  );

  const resetDraft = () => {
    setDraft(emptyJob);
    setEditingId(null);
  };

  const saveJob = () => {
    if (!draft.title.trim() || !draft.department.trim() || !draft.cityId.trim()) {
      setFeedback(
        isEnglish
          ? 'Please fill in the job title, department, and location before publishing.'
          : 'يرجى تعبئة عنوان الوظيفة والقسم والموقع قبل النشر.',
      );
      return;
    }

    const locationLabel = getLocationLabel(Number(draft.governorateId), Number(draft.cityId));

    if (editingId) {
      setJobs((current) =>
        current.map((job) =>
          job.id === editingId
            ? { ...job, title: draft.title, department: draft.department, location: locationLabel }
            : job,
        ),
      );
      setFeedback(
        isEnglish
          ? `The "${draft.title}" posting was updated successfully.`
          : `تم تعديل إعلان "${draft.title}" بنجاح.`,
      );
    } else {
      setJobs((current) => [
        {
          id: Date.now(),
          title: draft.title,
          department: draft.department,
          location: locationLabel,
          applicants: 0,
          publishedAt: '2026-03-29',
          status: 'نشط',
        },
        ...current,
      ]);
      setFeedback(
        isEnglish
          ? `The "${draft.title}" posting was published successfully.`
          : `تم نشر إعلان "${draft.title}" بنجاح.`,
      );
    }

    resetDraft();
  };

  return (
    <DashboardLayout userType="company">
      <div className="space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <section>
          <div>
            <h2 className="text-3xl font-bold">{isEnglish ? 'Manage jobs' : 'إدارة الوظائف'}</h2>
            <p className="mt-2 text-muted-foreground">
              {isEnglish
                ? 'Publish, edit, and pause job openings while tracking applicant counts.'
                : 'نشر الإعلانات الوظيفية، تعديلها، وإيقافها مع متابعة عدد المتقدمين.'}
            </p>
          </div>
        </section>

        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6 text-sm text-primary">{feedback}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {editingId
                ? isEnglish
                  ? 'Edit posting'
                  : 'تعديل الإعلان'
                : isEnglish
                  ? 'Publish a new job'
                  : 'نشر إعلان جديد'}
            </CardTitle>
            <CardDescription>
              {isEnglish
                ? 'This form works locally in the interface to simulate the full flow.'
                : 'النموذج يعمل محليًا داخل الواجهة لتجربة التدفق الكامل.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <Input
              placeholder={isEnglish ? 'Job title' : 'عنوان الوظيفة'}
              value={draft.title}
              onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
            />
            <Input
              placeholder={isEnglish ? 'Department' : 'القسم'}
              value={draft.department}
              onChange={(event) =>
                setDraft((current) => ({ ...current, department: event.target.value }))
              }
            />
            <Select
              value={draft.governorateId}
              onValueChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  governorateId: value,
                  cityId: String(getCitiesByGovernorate(Number(value))[0]?.id ?? 101),
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={isEnglish ? 'Select governorate' : 'اختر المحافظة'} />
              </SelectTrigger>
              <SelectContent>
                {governorates.map((governorate) => (
                  <SelectItem key={governorate.id} value={String(governorate.id)}>
                    {governorate.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="grid gap-4 md:col-span-3 md:grid-cols-[1fr_auto]">
              <Select
                value={draft.cityId}
                onValueChange={(value) => setDraft((current) => ({ ...current, cityId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isEnglish ? 'Select city' : 'اختر المدينة'} />
                </SelectTrigger>
                <SelectContent>
                  {getCitiesByGovernorate(Number(draft.governorateId)).map((city) => (
                    <SelectItem key={city.id} value={String(city.id)}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="rounded-xl border border-dashed border-border px-4 py-2 text-sm text-muted-foreground">
                {getLocationLabel(Number(draft.governorateId), Number(draft.cityId))}
              </div>
            </div>
            <div className="flex gap-2 md:col-span-3">
              <Button onClick={saveJob}>
                {editingId
                  ? isEnglish
                    ? 'Save changes'
                    : 'حفظ التعديلات'
                  : isEnglish
                    ? 'Publish new job'
                    : 'نشر إعلان جديد'}
              </Button>
              <Button variant="outline" onClick={resetDraft}>
                {isEnglish ? 'Cancel' : 'إلغاء'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{isEnglish ? 'Current postings' : 'الإعلانات الحالية'}</CardTitle>
            <CardDescription>
              {isEnglish
                ? 'List of jobs with edit and pause actions.'
                : 'قائمة الوظائف مع إجراءات التعديل والإيقاف.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="grid gap-4 rounded-2xl border border-border p-4 lg:grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr_auto]"
              >
                <div>
                  <h3 className="font-semibold">{job.title}</h3>
                  <p className="text-sm text-muted-foreground">{job.department}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{isEnglish ? 'Location' : 'الموقع'}</p>
                  <p className="font-medium">{job.location}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {isEnglish ? 'Applicants' : 'المتقدمون'}
                  </p>
                  <p className="font-medium">{job.applicants}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{job.publishedAt}</p>
                  <Badge className={getStatusClasses(job.status)}>
                    {getDisplayStatusLabel(job.status, isEnglish)}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingId(job.id);
                      setDraft({
                        title: job.title,
                        department: job.department,
                        governorateId: '1',
                        cityId: '101',
                      });
                      setFeedback(
                        isEnglish
                          ? `You are now editing the "${job.title}" job.`
                          : `أنت الآن تعدل وظيفة "${job.title}".`,
                      );
                    }}
                  >
                    {isEnglish ? 'Edit' : 'تعديل'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setJobs((current) =>
                        current.map((currentJob) =>
                          currentJob.id === job.id
                            ? {
                                ...currentJob,
                                status: currentJob.status === 'مغلق' ? 'نشط' : 'مغلق',
                              }
                            : currentJob,
                        ),
                      );
                      setFeedback(
                        isEnglish
                          ? `The status for "${job.title}" was updated.`
                          : `تم تحديث حالة الوظيفة "${job.title}".`,
                      );
                    }}
                  >
                    {job.status === 'مغلق'
                      ? isEnglish
                        ? 'Reactivate'
                        : 'إعادة التفعيل'
                      : isEnglish
                        ? 'Pause'
                        : 'إيقاف'}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
