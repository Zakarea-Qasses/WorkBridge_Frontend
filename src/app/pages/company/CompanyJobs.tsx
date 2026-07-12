import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Navigate } from 'react-router';
import {
  AlertTriangle,
  BriefcaseBusiness,
  Loader2,
  Pencil,
  Plus,
  Power,
  RefreshCw,
  Trash2,
  X,
} from 'lucide-react';
import DashboardLayout from '@/app/components/layout';
import { ApiError, getApiErrorMessage, getValidationErrors } from '@/app/api/client';
import {
  activateJob,
  createJob,
  deleteJob,
  getCompanyJobsPage,
  getJob,
  JobPayload,
  JobPost,
  PaginatedResponse,
  pauseJob,
  updateJob,
} from '@/app/api/pages/company/jobs';
import { getCitiesByGovernorate, getGovernorates, LocationOption } from '@/app/api/pages/company/jobs';
import { getDashboardPathForUser, useAuth } from '@/app/providers/AuthProvider';
import { useLanguage } from '@/app/providers/LanguageProvider';
import { locationDisplayName } from '@/app/utils/locationLabels';
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
  Textarea,
  useConfirmDialog,
} from '@/app/components/ui';

type JobStatus = 'active' | 'paused' | 'closed' | string;
type LocationType = 'remote' | 'on_site' | 'hybrid' | 'none';

type StatusMessage = {
  type: 'success' | 'error' | 'info';
  message: string;
} | null;

type JobDraft = {
  title: string;
  description: string;
  location_type: LocationType;
  governorate_id: string;
  city_id: string;
  salary: string;
};

const noneValue = 'none';

const emptyDraft: JobDraft = {
  title: '',
  description: '',
  location_type: 'none',
  governorate_id: noneValue,
  city_id: noneValue,
  salary: '',
};

function createDraftFromJob(job: JobPost): JobDraft {
  return {
    title: job.title || '',
    description: job.description || '',
    location_type: job.location_type || 'none',
    governorate_id: job.city?.governorate?.id
      ? String(job.city.governorate.id)
      : noneValue,
    city_id: job.city_id ? String(job.city_id) : noneValue,
    salary: job.salary === null || job.salary === undefined ? '' : String(job.salary),
  };
}

function getStatusLabel(status: JobStatus, isEnglish: boolean) {
  const labels: Record<string, { en: string; ar: string }> = {
    active: { en: 'Active', ar: 'نشطة' },
    paused: { en: 'Paused', ar: 'متوقفة مؤقتاً' },
    closed: { en: 'Closed', ar: 'مغلقة' },
  };

  return isEnglish ? labels[status]?.en || status : labels[status]?.ar || status;
}

function getStatusClass(status: JobStatus) {
  if (status === 'active') {
    return 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100';
  }

  if (status === 'paused') {
    return 'bg-amber-100 text-amber-700 hover:bg-amber-100';
  }

  if (status === 'closed') {
    return 'bg-slate-100 text-slate-700 hover:bg-slate-100';
  }

  return 'bg-muted text-muted-foreground hover:bg-muted';
}

function getLocationTypeLabel(type: JobPost['location_type'] | LocationType | null, isEnglish: boolean) {
  const labels: Record<string, { en: string; ar: string }> = {
    remote: { en: 'Remote', ar: 'عن بعد' },
    on_site: { en: 'On site', ar: 'حضوري' },
    hybrid: { en: 'Hybrid', ar: 'هجين' },
    none: { en: 'Not selected', ar: 'غير محدد' },
  };

  const key = type || 'none';
  return isEnglish ? labels[key]?.en || key : labels[key]?.ar || key;
}

function getJobLocation(job: JobPost, isEnglish: boolean) {
  const city = job.city?.name;
  const governorate = job.city?.governorate?.name;

  if (city && governorate) {
    return `${locationDisplayName(city, isEnglish)}, ${locationDisplayName(governorate, isEnglish)}`;
  }

  if (city || governorate) {
    return locationDisplayName(city || governorate, isEnglish);
  }

  return isEnglish ? 'No city selected' : 'لم يتم تحديد مدينة';
}

function formatSalary(value: JobPost['salary'], isEnglish: boolean) {
  if (value === null || value === undefined || value === '') {
    return isEnglish ? 'Not provided' : 'غير محدد';
  }

  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) {
    return String(value);
  }

  return `${numberValue.toLocaleString(isEnglish ? 'en-US' : 'ar-SY')} ${isEnglish ? 'SYP' : 'ل.س'}`;
}

function formatDate(value: string | null | undefined, isEnglish: boolean) {
  if (!value) {
    return isEnglish ? 'Not provided' : 'غير محدد';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return isEnglish ? 'Not provided' : 'غير محدد';
  }

  return new Intl.DateTimeFormat(isEnglish ? 'en-US' : 'ar-SY', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function getFieldError(errors: Record<string, string[]>, key: string) {
  return errors[key]?.[0] || null;
}

function formatValidationMessage(message: string, isEnglish: boolean) {
  if (!isEnglish && message === 'The skills field is required.') {
    return 'حقل المهارات مطلوب';
  }

  return message;
}

function getFriendlyJobsError(error: unknown, isEnglish: boolean) {
  if (error instanceof ApiError) {
    if (error.status === 403) {
      return isEnglish
        ? 'You are not allowed to view company jobs.'
        : 'ليس لديك صلاحية لعرض وظائف الشركة';
    }

    if (error.status === 404) {
      return isEnglish ? 'Company profile was not found.' : 'ملف الشركة غير موجود';
    }

    if (error.status >= 500) {
      return isEnglish ? 'Could not load company jobs.' : 'تعذر تحميل وظائف الشركة';
    }
  }

  return getApiErrorMessage(error);
}

function buildPayload(draft: JobDraft): JobPayload {
  const salary = draft.salary.trim();

  return {
    title: draft.title.trim(),
    description: draft.description.trim(),
    location_type: draft.location_type === 'none' ? null : draft.location_type,
    city_id: draft.city_id === noneValue ? null : Number(draft.city_id),
    salary: salary ? Number(salary) : null,
  };
}

export default function CompanyJobs() {
  const { language, isEnglish } = useLanguage();
  const { user, initializing } = useAuth();
  const requestIdRef = useRef(0);
  const [jobsPage, setJobsPage] = useState<PaginatedResponse<JobPost> | null>(null);
  const [governorates, setGovernorates] = useState<LocationOption[]>([]);
  const [cities, setCities] = useState<LocationOption[]>([]);
  const [draft, setDraft] = useState<JobDraft>(emptyDraft);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionId, setActionId] = useState<number | null>(null);
  const [status, setStatus] = useState<StatusMessage>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [page, setPage] = useState(1);
  const { confirm, ConfirmDialog } = useConfirmDialog({
    title: isEnglish ? 'Confirm action' : 'تأكيد العملية',
    confirmLabel: isEnglish ? 'Confirm' : 'تأكيد',
    cancelLabel: isEnglish ? 'Cancel' : 'إلغاء',
  });

  const isCompanyUser = user?.role === 'company';
  const activeCompanyId = user?.company?.id ?? null;

  const labels = useMemo(
    () => ({
      title: isEnglish ? 'Manage jobs' : 'إدارة الوظائف',
      subtitle: isEnglish
        ? 'Publish, edit, pause, activate, and delete your company job posts.'
        : 'نشر وتعديل وإيقاف وتفعيل وحذف وظائف الشركة.',
      loading: isEnglish ? 'Loading company jobs...' : 'جاري تحميل وظائف الشركة...',
      retry: isEnglish ? 'Retry' : 'إعادة المحاولة',
      createTitle: isEnglish ? 'Publish a new job' : 'نشر وظيفة جديدة',
      editTitle: isEnglish ? 'Edit job' : 'تعديل الوظيفة',
      formDescription: isEnglish
        ? 'Fill in the job details you want to publish.'
        : 'املأ تفاصيل الوظيفة التي تريد نشرها.',
      jobTitle: isEnglish ? 'Job title' : 'عنوان الوظيفة',
      description: isEnglish ? 'Description' : 'الوصف',
      locationType: isEnglish ? 'Work type' : 'نوع الدوام',
      governorate: isEnglish ? 'Governorate' : 'المحافظة',
      city: isEnglish ? 'City' : 'المدينة',
      salary: isEnglish ? 'Salary' : 'الراتب',
      save: isEnglish ? 'Save changes' : 'حفظ التعديلات',
      publish: isEnglish ? 'Publish job' : 'نشر الوظيفة',
      cancel: isEnglish ? 'Cancel' : 'إلغاء',
      currentJobs: isEnglish ? 'Current postings' : 'الوظائف الحالية',
      currentDescription: isEnglish
        ? 'Your published company jobs.'
        : 'وظائف الشركة المنشورة.',
      empty: isEnglish ? 'You have not added any jobs yet.' : 'لم تقم بإضافة وظائف حتى الآن',
      addJob: isEnglish ? 'Add job' : 'إضافة وظيفة',
      edit: isEnglish ? 'Edit' : 'تعديل',
      delete: isEnglish ? 'Delete' : 'حذف',
      activate: isEnglish ? 'Activate' : 'تفعيل',
      pause: isEnglish ? 'Pause' : 'إيقاف مؤقت',
      createdAt: isEnglish ? 'Created at' : 'تاريخ النشر',
      workType: isEnglish ? 'Work type' : 'نوع الدوام',
      location: isEnglish ? 'Location' : 'الموقع',
      confirmDelete: isEnglish
        ? 'Are you sure you want to delete this job?'
        : 'هل أنت متأكد من حذف هذه الوظيفة؟',
      createSuccess: isEnglish ? 'Job was created successfully.' : 'تمت إضافة الوظيفة بنجاح',
      updateSuccess: isEnglish ? 'Job was updated successfully.' : 'تم تعديل الوظيفة بنجاح',
      deleteSuccess: isEnglish ? 'Job was deleted successfully.' : 'تم حذف الوظيفة بنجاح',
      activateSuccess: isEnglish ? 'Job was activated successfully.' : 'تم تفعيل الوظيفة بنجاح',
      pauseSuccess: isEnglish ? 'Job was paused successfully.' : 'تم إيقاف الوظيفة مؤقتاً',
      previous: isEnglish ? 'Previous' : 'السابق',
      next: isEnglish ? 'Next' : 'التالي',
      page: isEnglish ? 'Page' : 'صفحة',
    }),
    [isEnglish],
  );

  const resetDraft = () => {
    setDraft(emptyDraft);
    setEditingId(null);
    setFieldErrors({});
  };

  const loadJobs = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setJobsPage(null);
    setStatus(null);
    setFieldErrors({});

    if (!isCompanyUser) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const [nextJobsPage, nextGovernorates] = await Promise.all([
        getCompanyJobsPage(page),
        getGovernorates(),
      ]);

      if (requestId !== requestIdRef.current) {
        return;
      }

      if (
        activeCompanyId &&
        nextJobsPage.data.some((job) => Number(job.company_id) !== Number(activeCompanyId))
      ) {
        return;
      }

      setJobsPage(nextJobsPage);
      setGovernorates(nextGovernorates);
    } catch (error) {
      if (requestId === requestIdRef.current) {
        setStatus({ type: 'error', message: getFriendlyJobsError(error, isEnglish) });
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [activeCompanyId, isCompanyUser, isEnglish, page]);

  useEffect(() => {
    if (initializing) {
      return;
    }

    loadJobs();
  }, [initializing, loadJobs]);

  useEffect(() => {
    const governorateId = draft.governorate_id;
    if (!governorateId || governorateId === noneValue) {
      setCities([]);
      return;
    }

    let mounted = true;
    setLocationsLoading(true);
    getCitiesByGovernorate(governorateId)
      .then((cityData) => {
        if (mounted) {
          setCities(cityData);
        }
      })
      .catch((error) => {
        if (mounted) {
          setCities([]);
          setStatus({ type: 'error', message: getApiErrorMessage(error) });
        }
      })
      .finally(() => {
        if (mounted) {
          setLocationsLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [draft.governorate_id]);

  const handleDraftChange = (key: keyof JobDraft, value: string) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => {
      if (!current[key]) {
        return current;
      }

      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const handleGovernorateChange = (value: string) => {
    setDraft((current) => ({
      ...current,
      governorate_id: value,
      city_id: noneValue,
    }));
    setFieldErrors((current) => {
      const next = { ...current };
      delete next.city_id;
      return next;
    });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting) {
      return;
    }

    setSubmitting(true);
    setStatus(null);
    setFieldErrors({});

    try {
      if (editingId) {
        await updateJob(editingId, buildPayload(draft));
        setStatus({ type: 'success', message: labels.updateSuccess });
      } else {
        await createJob(buildPayload(draft));
        setStatus({ type: 'success', message: labels.createSuccess });
      }

      resetDraft();
      await loadJobs();
    } catch (error) {
      setFieldErrors(getValidationErrors(error));
      setStatus({
        type: 'error',
        message: getApiErrorMessage(error),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = async (job: JobPost) => {
    setActionId(job.id);
    setStatus(null);
    setFieldErrors({});

    try {
      const freshJob = await getJob(job.id);
      if (activeCompanyId && Number(freshJob.company_id) !== Number(activeCompanyId)) {
        setStatus({
          type: 'error',
          message: isEnglish
            ? 'You cannot edit a job owned by another company.'
            : 'لا يمكنك تعديل وظيفة لا تملكها.',
        });
        return;
      }

      setEditingId(freshJob.id);
      setDraft(createDraftFromJob(freshJob));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setStatus({ type: 'error', message: getApiErrorMessage(error) });
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (job: JobPost) => {
    if (actionId) {
      return;
    }

    const confirmed = await confirm({
      title: labels.delete,
      description: labels.confirmDelete,
      confirmLabel: labels.delete,
      destructive: true,
    });
    if (!confirmed) {
      return;
    }

    setActionId(job.id);
    setStatus(null);

    try {
      await deleteJob(job.id);
      setStatus({ type: 'success', message: labels.deleteSuccess });
      await loadJobs();
    } catch (error) {
      setStatus({ type: 'error', message: getApiErrorMessage(error) });
    } finally {
      setActionId(null);
    }
  };

  const handleStatusToggle = async (job: JobPost) => {
    if (actionId) {
      return;
    }

    setActionId(job.id);
    setStatus(null);

    try {
      if (job.status === 'paused') {
        await activateJob(job.id);
        setStatus({ type: 'success', message: labels.activateSuccess });
      } else {
        await pauseJob(job.id);
        setStatus({ type: 'success', message: labels.pauseSuccess });
      }

      await loadJobs();
    } catch (error) {
      setStatus({ type: 'error', message: getApiErrorMessage(error) });
    } finally {
      setActionId(null);
    }
  };

  const renderFieldError = (key: string) => {
    const error = getFieldError(fieldErrors, key);
    if (!error) {
      return null;
    }

    return <p className="text-xs text-destructive">{formatValidationMessage(error, isEnglish)}</p>;
  };

  if (initializing || loading) {
    return (
      <DashboardLayout userType="company">
        <div className="space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
          <section className="space-y-3">
            <div className="h-8 w-48 animate-pulse rounded bg-muted" />
            <div className="h-4 w-96 max-w-full animate-pulse rounded bg-muted" />
          </section>

          <Card>
            <CardHeader className="space-y-3">
              <div className="h-5 w-40 animate-pulse rounded bg-muted" />
              <div className="h-4 w-72 animate-pulse rounded bg-muted" />
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="h-10 animate-pulse rounded bg-muted" />
              <div className="h-10 animate-pulse rounded bg-muted" />
              <div className="h-28 animate-pulse rounded bg-muted md:col-span-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="space-y-3">
              <div className="h-5 w-40 animate-pulse rounded bg-muted" />
              <div className="h-4 w-64 animate-pulse rounded bg-muted" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-28 animate-pulse rounded-lg bg-muted" />
              ))}
            </CardContent>
          </Card>

          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            {labels.loading}
          </p>
        </div>
      </DashboardLayout>
    );
  }

  if (!isCompanyUser) {
    return <Navigate to={getDashboardPathForUser(user)} replace />;
  }

  const jobs = jobsPage?.data || [];

  return (
    <DashboardLayout userType="company">
      <ConfirmDialog />
      <div className="space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <section className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold">{labels.title}</h2>
            <p className="mt-2 text-muted-foreground">{labels.subtitle}</p>
          </div>
        </section>

        {status ? (
          <Card
            className={
              status.type === 'error'
                ? 'border-destructive/40 bg-destructive/5'
                : 'border-emerald-200 bg-emerald-50'
            }
          >
            <CardContent
              className={
                status.type === 'error'
                  ? 'pt-6 text-sm text-destructive'
                  : 'pt-6 text-sm text-emerald-700'
              }
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span>{status.message}</span>
                {status.type === 'error' ? (
                  <Button variant="outline" size="sm" onClick={loadJobs}>
                    <RefreshCw className="me-2 h-4 w-4" />
                    {labels.retry}
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>{editingId ? labels.editTitle : labels.createTitle}</CardTitle>
            <CardDescription>{labels.formDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-medium">{labels.jobTitle}</label>
                <Input
                  value={draft.title}
                  onChange={(event) => handleDraftChange('title', event.target.value)}
                />
                {renderFieldError('title')}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{labels.salary}</label>
                <Input
                  type="number"
                  min="1"
                  value={draft.salary}
                  onChange={(event) => handleDraftChange('salary', event.target.value)}
                />
                {renderFieldError('salary')}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{labels.locationType}</label>
                <Select
                  value={draft.location_type}
                  onValueChange={(value) => handleDraftChange('location_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{getLocationTypeLabel('none', isEnglish)}</SelectItem>
                    <SelectItem value="remote">{getLocationTypeLabel('remote', isEnglish)}</SelectItem>
                    <SelectItem value="on_site">{getLocationTypeLabel('on_site', isEnglish)}</SelectItem>
                    <SelectItem value="hybrid">{getLocationTypeLabel('hybrid', isEnglish)}</SelectItem>
                  </SelectContent>
                </Select>
                {renderFieldError('location_type')}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{labels.governorate}</label>
                <Select value={draft.governorate_id} onValueChange={handleGovernorateChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={noneValue}>{isEnglish ? 'Not selected' : 'غير محدد'}</SelectItem>
                    {governorates.map((governorate) => (
                      <SelectItem key={governorate.id} value={String(governorate.id)}>
                        {locationDisplayName(governorate.name, isEnglish)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{labels.city}</label>
                <Select
                  value={draft.city_id}
                  onValueChange={(value) => handleDraftChange('city_id', value)}
                  disabled={draft.governorate_id === noneValue || locationsLoading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={noneValue}>{isEnglish ? 'Not selected' : 'غير محدد'}</SelectItem>
                    {cities.map((city) => (
                      <SelectItem key={city.id} value={String(city.id)}>
                        {locationDisplayName(city.name, isEnglish)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {renderFieldError('city_id')}
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">{labels.description}</label>
                <Textarea
                  rows={5}
                  value={draft.description}
                  onChange={(event) => handleDraftChange('description', event.target.value)}
                />
                {renderFieldError('description')}
              </div>

              <div className="flex flex-wrap gap-2 md:col-span-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : <Plus className="me-2 h-4 w-4" />}
                  {editingId ? labels.save : labels.publish}
                </Button>
                <Button type="button" variant="outline" onClick={resetDraft} disabled={submitting}>
                  <X className="me-2 h-4 w-4" />
                  {labels.cancel}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{labels.currentJobs}</CardTitle>
            <CardDescription>{labels.currentDescription}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {jobs.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
                <BriefcaseBusiness className="mx-auto mb-3 h-8 w-8 text-primary" />
                <p>{labels.empty}</p>
                <Button className="mt-4" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                  <Plus className="me-2 h-4 w-4" />
                  {labels.addJob}
                </Button>
              </div>
            ) : (
              jobs.map((job) => (
                <div
                  key={job.id}
                  className="grid gap-4 rounded-lg border border-border p-4 lg:grid-cols-[1.25fr_0.8fr_0.8fr_0.8fr_auto]"
                >
                  <div>
                    <h3 className="font-semibold">{job.title}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {job.description}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{labels.location}</p>
                    <p className="font-medium">{getJobLocation(job, isEnglish)}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {getLocationTypeLabel(job.location_type, isEnglish)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{labels.salary}</p>
                    <p className="font-medium">{formatSalary(job.salary, isEnglish)}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">{labels.createdAt}</p>
                    <p className="text-sm">{formatDate(job.created_at, isEnglish)}</p>
                    <Badge className={getStatusClass(job.status)}>
                      {getStatusLabel(job.status, isEnglish)}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEdit(job)}
                      disabled={actionId === job.id}
                    >
                      <Pencil className="me-2 h-4 w-4" />
                      {labels.edit}
                    </Button>
                    {job.status !== 'closed' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusToggle(job)}
                        disabled={actionId === job.id}
                      >
                        {actionId === job.id ? (
                          <Loader2 className="me-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Power className="me-2 h-4 w-4" />
                        )}
                        {job.status === 'paused' ? labels.activate : labels.pause}
                      </Button>
                    ) : null}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(job)}
                      disabled={actionId === job.id}
                    >
                      <Trash2 className="me-2 h-4 w-4" />
                      {labels.delete}
                    </Button>
                  </div>
                </div>
              ))
            )}

            {jobsPage && jobsPage.last_page > 1 ? (
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <p className="text-sm text-muted-foreground">
                  {labels.page} {jobsPage.current_page} / {jobsPage.last_page}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={jobsPage.current_page <= 1}
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                  >
                    {labels.previous}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={jobsPage.current_page >= jobsPage.last_page}
                    onClick={() => setPage((current) => current + 1)}
                  >
                    {labels.next}
                  </Button>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
