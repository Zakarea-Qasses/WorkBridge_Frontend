import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  ExternalLink,
  ImagePlus,
  Loader2,
  MapPin,
  Phone,
  Save,
  X,
} from 'lucide-react';
import { Navigate } from 'react-router';
import DashboardLayout from '@/app/components/layout';
import { ApiError, getApiErrorMessage, getValidationErrors } from '@/app/api/client';
import {
  CompanyProfile as CompanyProfileData,
  getCitiesByGovernorate,
  getCompany,
  getGovernorates,
  LocationOption,
  updateCompany,
} from '@/app/api/endpoints';
import { useLanguage } from '@/app/providers/LanguageProvider';
import { getDashboardPathForUser, useAuth } from '@/app/providers/AuthProvider';
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
} from '@/app/components/ui';

type StatusMessage = {
  type: 'success' | 'error' | 'info';
  message: string;
} | null;

type CompanyDraft = {
  company_name: string;
  website: string;
  location: string;
  phone: string;
  description: string;
  governorate_id: string;
  city_id: string;
  skills: string;
};

const noneValue = 'none';
const API_ORIGIN = new URL(import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api').origin;

function createDraft(company: CompanyProfileData): CompanyDraft {
  return {
    company_name: company.company_name || '',
    website: company.website || '',
    location: company.location || '',
    phone: company.phone || '',
    description: company.description || '',
    governorate_id: company.governorate_id ? String(company.governorate_id) : noneValue,
    city_id: company.city_id ? String(company.city_id) : noneValue,
    skills: (company.skills || []).map((skill) => skill.name).join(', '),
  };
}

function normalizeWebsite(value: string | null) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const url = new URL(withProtocol);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : null;
  } catch {
    return null;
  }
}

function normalizeAssetUrl(value: string | null) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `${API_ORIGIN}/${trimmed.replace(/^\/+/, '')}`;
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

function getLocationText(company: CompanyProfileData, emptyLabel: string) {
  const city = company.city?.name;
  const governorate = company.governorate?.name;

  if (city && governorate) {
    return `${city}، ${governorate}`;
  }

  if (city || governorate) {
    return city || governorate || emptyLabel;
  }

  return company.location || emptyLabel;
}

export default function CompanyProfile() {
  const { language, isEnglish } = useLanguage();
  const { user, initializing, refreshUser } = useAuth();
  const requestIdRef = useRef(0);
  const [company, setCompany] = useState<CompanyProfileData | null>(null);
  const [governorates, setGovernorates] = useState<LocationOption[]>([]);
  const [cities, setCities] = useState<LocationOption[]>([]);
  const [draft, setDraft] = useState<CompanyDraft | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<StatusMessage>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const isCompanyUser = user?.role === 'company';
  const activeUserId = user?.id ?? null;

  const labels = useMemo(
    () => ({
      title: isEnglish ? 'Company profile' : 'ملف الشركة',
      subtitle: isEnglish
        ? 'Manage the real company data shown to users and administrators.'
        : 'إدارة بيانات الشركة الحقيقية الظاهرة للمستخدمين والإدارة.',
      edit: isEnglish ? 'Edit profile' : 'تعديل الملف',
      cancel: isEnglish ? 'Cancel' : 'إلغاء',
      save: isEnglish ? 'Save changes' : 'حفظ التغييرات',
      verified: isEnglish ? 'Verified company' : 'شركة موثقة',
      pending: isEnglish ? 'Verification pending' : 'الحساب قيد التوثيق',
      loading: isEnglish ? 'Loading company profile...' : 'جاري تحميل ملف الشركة...',
      notAllowed: isEnglish
        ? 'This page is available for company accounts only.'
        : 'هذه الصفحة متاحة لحسابات الشركات فقط.',
      loadError: isEnglish ? 'Could not load company profile.' : 'تعذر تحميل ملف الشركة.',
      updateError: isEnglish ? 'Could not update company profile.' : 'تعذر تحديث ملف الشركة.',
      notFound: isEnglish ? 'Company profile was not found.' : 'ملف الشركة غير موجود.',
      forbidden: isEnglish
        ? 'You are not allowed to access the company profile.'
        : 'ليس لديك صلاحية للوصول إلى ملف الشركة.',
      saved: isEnglish ? 'Company profile was updated successfully.' : 'تم تحديث ملف الشركة بنجاح.',
      retry: isEnglish ? 'Retry' : 'إعادة المحاولة',
      companyName: isEnglish ? 'Company name' : 'اسم الشركة',
      description: isEnglish ? 'Description' : 'وصف الشركة',
      website: isEnglish ? 'Website' : 'الموقع الإلكتروني',
      phone: isEnglish ? 'Phone' : 'رقم الهاتف',
      location: isEnglish ? 'Address details' : 'تفاصيل العنوان',
      governorate: isEnglish ? 'Governorate' : 'المحافظة',
      city: isEnglish ? 'City' : 'المدينة',
      skills: isEnglish ? 'Company skills' : 'مجالات عمل الشركة',
      skillsHint: isEnglish
        ? 'Separate skills with commas, for example: Laravel, React, Marketing'
        : 'افصل المجالات بفواصل، مثال: Laravel, React, Marketing',
      noDescription: isEnglish
        ? 'No company description has been added yet.'
        : 'لم تتم إضافة وصف للشركة بعد.',
      noPhone: isEnglish ? 'No phone number has been added.' : 'لم تتم إضافة رقم هاتف.',
      noWebsite: isEnglish ? 'No website has been added.' : 'لم تتم إضافة موقع إلكتروني.',
      noLocation: isEnglish ? 'No location information has been added.' : 'لم تتم إضافة معلومات الموقع.',
      noSkills: isEnglish ? 'No skills have been added yet.' : 'لم تتم إضافة مهارات بعد.',
      selectGovernorate: isEnglish ? 'Select governorate' : 'اختر المحافظة',
      selectCity: isEnglish ? 'Select city' : 'اختر المدينة',
      clearSelection: isEnglish ? 'Not selected' : 'غير محدد',
      openWebsite: isEnglish ? 'Open website' : 'فتح الموقع',
      logo: isEnglish ? 'Company logo' : 'شعار الشركة',
      logoChoose: isEnglish ? 'Choose logo' : 'اختيار شعار',
      logoHint: isEnglish
        ? 'Upload a PNG, JPG, or WebP image. The logo is saved with the company profile.'
        : 'ارفع صورة PNG أو JPG أو WebP. يتم حفظ الشعار مع ملف الشركة.',
      logoPreview: isEnglish ? 'Logo preview' : 'معاينة الشعار',
      readOnlyVerification: isEnglish
        ? 'Verification status is managed by the admin.'
        : 'حالة التوثيق تتم إدارتها من قبل الأدمن.',
    }),
    [isEnglish],
  );

  const getCompanyRequestError = useCallback(
    (error: unknown) => {
      if (error instanceof ApiError) {
        if (error.status === 403) {
          return labels.forbidden;
        }
        if (error.status === 404) {
          return labels.notFound;
        }
        if (error.status >= 500) {
          return labels.loadError;
        }
      }

      return getApiErrorMessage(error) || labels.loadError;
    },
    [labels.forbidden, labels.loadError, labels.notFound],
  );

  const getCompanyUpdateError = useCallback(
    (error: unknown) => {
      if (error instanceof ApiError) {
        if (error.status === 403) {
          return labels.forbidden;
        }
        if (error.status === 404) {
          return labels.notFound;
        }
        if (error.status >= 500) {
          return labels.updateError;
        }
      }

      return getApiErrorMessage(error) || labels.updateError;
    },
    [labels.forbidden, labels.notFound, labels.updateError],
  );

  const loadCompany = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setCompany(null);
    setDraft(null);
    setLogoFile(null);
    setCities([]);
    setFieldErrors({});
    setIsEditing(false);

    if (!isCompanyUser) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const [companyData, governorateData] = await Promise.all([getCompany(), getGovernorates()]);

      if (
        requestId !== requestIdRef.current ||
        activeUserId === null ||
        companyData.user_id !== activeUserId
      ) {
        return;
      }

      setCompany(companyData);
      setDraft(createDraft(companyData));
      setGovernorates(governorateData);
    } catch (error) {
      if (requestId === requestIdRef.current) {
        setStatus({
          type: 'error',
          message: getCompanyRequestError(error),
        });
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [activeUserId, getCompanyRequestError, isCompanyUser]);

  useEffect(() => {
    if (initializing) {
      return;
    }

    loadCompany();
  }, [initializing, loadCompany]);

  useEffect(() => {
    const governorateId = draft?.governorate_id;
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
          setStatus({
            type: 'error',
            message: getApiErrorMessage(error),
          });
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
  }, [draft?.governorate_id]);

  const websiteUrl = useMemo(() => normalizeWebsite(company?.website || null), [company?.website]);
  const currentLogoUrl = normalizeAssetUrl(company?.logo || null);
  const displayedLogoUrl = logoPreviewUrl || currentLogoUrl;

  const skills = company?.skills || [];
  const locationText = company ? getLocationText(company, labels.noLocation) : labels.noLocation;

  useEffect(() => {
    if (!logoFile) {
      setLogoPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(logoFile);
    setLogoPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [logoFile]);

  const handleDraftChange = (key: keyof CompanyDraft, value: string) => {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
    setFieldErrors((current) => {
      if (!current[key]) {
        return current;
      }

      const next = { ...current };
      delete next[key];
      if (key === 'skills') {
        Object.keys(next).forEach((errorKey) => {
          if (errorKey.startsWith('skills.')) {
            delete next[errorKey];
          }
        });
      }
      return next;
    });
  };

  const handleGovernorateChange = (value: string) => {
    setDraft((current) =>
      current
        ? {
            ...current,
            governorate_id: value,
            city_id: noneValue,
          }
        : current,
    );
    setFieldErrors((current) => {
      const next = { ...current };
      delete next.governorate_id;
      delete next.city_id;
      return next;
    });
  };

  const handleCancel = () => {
    setDraft(company ? createDraft(company) : null);
    setLogoFile(null);
    setFieldErrors({});
    setStatus(null);
    setIsEditing(false);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!draft || saving) {
      return;
    }

    setSaving(true);
    setStatus(null);
    setFieldErrors({});

    try {
      await updateCompany({
        company_name: draft.company_name.trim(),
        website: draft.website.trim() || null,
        location: draft.location.trim() || null,
        governorate_id:
          draft.governorate_id === noneValue ? null : Number(draft.governorate_id),
        city_id: draft.city_id === noneValue ? null : Number(draft.city_id),
        description: draft.description.trim() || null,
        phone: draft.phone.trim() || null,
        skills: draft.skills
          .split(',')
          .map((skill) => skill.trim())
          .filter(Boolean),
        logo: logoFile,
      });

      const freshCompany = await getCompany();

      if (activeUserId === null || freshCompany.user_id !== activeUserId) {
        return;
      }

      setCompany(freshCompany);
      setDraft(createDraft(freshCompany));
      setLogoFile(null);
      setIsEditing(false);
      setStatus({ type: 'success', message: labels.saved });
      await refreshUser();
    } catch (error) {
      setFieldErrors(getValidationErrors(error));
      setStatus({
        type: 'error',
        message: getCompanyUpdateError(error),
      });
    } finally {
      setSaving(false);
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
          <section className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-3">
              <div className="h-8 w-48 animate-pulse rounded bg-muted" />
              <div className="h-4 w-80 max-w-full animate-pulse rounded bg-muted" />
            </div>
            <div className="h-7 w-32 animate-pulse rounded bg-muted" />
          </section>

          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 animate-pulse rounded-full bg-muted" />
                  <div className="space-y-3">
                    <div className="h-5 w-44 animate-pulse rounded bg-muted" />
                    <div className="h-4 w-56 animate-pulse rounded bg-muted" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-20 animate-pulse rounded bg-muted" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="h-24 animate-pulse rounded-lg bg-muted" />
                  <div className="h-24 animate-pulse rounded-lg bg-muted" />
                  <div className="h-24 animate-pulse rounded-lg bg-muted sm:col-span-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="space-y-3">
                <div className="h-5 w-36 animate-pulse rounded bg-muted" />
                <div className="h-4 w-56 animate-pulse rounded bg-muted" />
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="h-8 w-full animate-pulse rounded bg-muted" />
                <div className="h-8 w-2/3 animate-pulse rounded bg-muted" />
              </CardContent>
            </Card>
          </div>
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

  return (
    <DashboardLayout userType="company">
      <div className="space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <section className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold">{labels.title}</h2>
            <p className="mt-2 text-muted-foreground">{labels.subtitle}</p>
          </div>

          {company ? (
            <div className="flex flex-col items-start gap-2 sm:items-end">
              <Badge
                className={
                  company.is_verified
                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                    : 'bg-amber-100 text-amber-700 hover:bg-amber-100'
                }
              >
                {company.is_verified ? (
                  <CheckCircle2 className="me-1 h-3.5 w-3.5" />
                ) : (
                  <AlertTriangle className="me-1 h-3.5 w-3.5" />
                )}
                {company.is_verified ? labels.verified : labels.pending}
              </Badge>
              <p className="text-xs text-muted-foreground">{labels.readOnlyVerification}</p>
            </div>
          ) : null}
        </section>

        {status ? (
          <Card
            className={
              status.type === 'error'
                ? 'border-destructive/40 bg-destructive/5'
                : status.type === 'success'
                  ? 'border-emerald-200 bg-emerald-50'
                  : 'border-primary/20 bg-primary/5'
            }
          >
            <CardContent
              className={
                status.type === 'error'
                  ? 'pt-6 text-sm text-destructive'
                  : status.type === 'success'
                    ? 'pt-6 text-sm text-emerald-700'
                    : 'pt-6 text-sm text-primary'
              }
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span>{status.message}</span>
                {!company && status.type === 'error' ? (
                  <Button variant="outline" size="sm" onClick={loadCompany}>
                    {labels.retry}
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>
        ) : null}

        {company && draft ? (
          <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <Card>
              <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary">
                    {displayedLogoUrl ? (
                      <img
                        src={displayedLogoUrl}
                        alt={company.company_name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Building2 className="h-8 w-8" />
                    )}
                  </div>
                  <div>
                    <CardTitle>{company.company_name}</CardTitle>
                    <CardDescription>{company.website || labels.noWebsite}</CardDescription>
                  </div>
                </div>

                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <Button type="button" variant="outline" onClick={handleCancel} disabled={saving}>
                        <X className="me-2 h-4 w-4" />
                        {labels.cancel}
                      </Button>
                      <Button type="submit" disabled={saving}>
                        {saving ? (
                          <Loader2 className="me-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="me-2 h-4 w-4" />
                        )}
                        {labels.save}
                      </Button>
                    </>
                  ) : (
                    <Button type="button" onClick={() => setIsEditing(true)}>
                      {labels.edit}
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-5">
                {isEditing ? (
                  <>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-3 md:col-span-2">
                        <label className="text-sm font-medium">{labels.logo}</label>
                        <div className="flex flex-wrap items-center gap-4 rounded-lg border border-dashed border-border p-4">
                          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary">
                            {displayedLogoUrl ? (
                              <img
                                src={displayedLogoUrl}
                                alt={labels.logoPreview}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Building2 className="h-9 w-9" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1 space-y-2">
                            <Input
                              type="file"
                              accept="image/png,image/jpeg,image/jpg,image/webp"
                              onChange={(event) => {
                                const file = event.target.files?.[0] || null;
                                setLogoFile(file);
                                setFieldErrors((current) => {
                                  if (!current.logo) {
                                    return current;
                                  }

                                  const next = { ...current };
                                  delete next.logo;
                                  return next;
                                });
                              }}
                            />
                            <p className="text-xs text-muted-foreground">{labels.logoHint}</p>
                            {logoFile ? (
                              <p className="text-xs text-primary">
                                <ImagePlus className="me-1 inline h-3.5 w-3.5" />
                                {logoFile.name}
                              </p>
                            ) : null}
                            {renderFieldError('logo')}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium">{labels.companyName}</label>
                        <Input
                          value={draft.company_name}
                          onChange={(event) => handleDraftChange('company_name', event.target.value)}
                        />
                        {renderFieldError('company_name')}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">{labels.website}</label>
                        <Input
                          dir="ltr"
                          value={draft.website}
                          onChange={(event) => handleDraftChange('website', event.target.value)}
                          placeholder="https://example.com"
                        />
                        {renderFieldError('website')}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">{labels.phone}</label>
                        <Input
                          dir="ltr"
                          value={draft.phone}
                          onChange={(event) => handleDraftChange('phone', event.target.value)}
                          placeholder="+963..."
                        />
                        {renderFieldError('phone')}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">{labels.governorate}</label>
                        <Select value={draft.governorate_id} onValueChange={handleGovernorateChange}>
                          <SelectTrigger>
                            <SelectValue placeholder={labels.selectGovernorate} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={noneValue}>{labels.clearSelection}</SelectItem>
                            {governorates.map((governorate) => (
                              <SelectItem key={governorate.id} value={String(governorate.id)}>
                                {governorate.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {renderFieldError('governorate_id')}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">{labels.city}</label>
                        <Select
                          value={draft.city_id}
                          onValueChange={(value) => handleDraftChange('city_id', value)}
                          disabled={draft.governorate_id === noneValue || locationsLoading}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={labels.selectCity} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={noneValue}>{labels.clearSelection}</SelectItem>
                            {cities.map((city) => (
                              <SelectItem key={city.id} value={String(city.id)}>
                                {city.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {renderFieldError('city_id')}
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium">{labels.location}</label>
                        <Input
                          value={draft.location}
                          onChange={(event) => handleDraftChange('location', event.target.value)}
                        />
                        {renderFieldError('location')}
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
                    </div>
                  </>
                ) : (
                  <>
                    <p className="leading-7 text-muted-foreground">
                      {company.description || labels.noDescription}
                    </p>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-lg bg-muted p-4">
                        <p className="text-sm text-muted-foreground">{labels.location}</p>
                        <p className="mt-1 flex items-center gap-2 font-semibold">
                          <MapPin className="h-4 w-4 text-primary" />
                          {locationText}
                        </p>
                      </div>

                      <div className="rounded-lg bg-muted p-4">
                        <p className="text-sm text-muted-foreground">{labels.phone}</p>
                        {company.phone ? (
                          <a
                            href={`tel:${company.phone}`}
                            dir="ltr"
                            className="mt-1 flex items-center gap-2 font-semibold text-primary"
                          >
                            <Phone className="h-4 w-4" />
                            {company.phone}
                          </a>
                        ) : (
                          <p className="mt-1 font-semibold">{labels.noPhone}</p>
                        )}
                      </div>

                      <div className="rounded-lg bg-muted p-4 sm:col-span-2">
                        <p className="text-sm text-muted-foreground">{labels.website}</p>
                        {websiteUrl ? (
                          <a
                            href={websiteUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-1 inline-flex items-center gap-2 font-semibold text-primary"
                          >
                            <ExternalLink className="h-4 w-4" />
                            {company.website}
                          </a>
                        ) : (
                          <p className="mt-1 font-semibold">{labels.noWebsite}</p>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{labels.skills}</CardTitle>
                <CardDescription>{labels.skillsHint}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <div className="space-y-2">
                    <Textarea
                      rows={5}
                      value={draft.skills}
                      onChange={(event) => handleDraftChange('skills', event.target.value)}
                      placeholder="Laravel, React, Marketing"
                    />
                    {renderFieldError('skills')}
                    {renderFieldError('skills.0')}
                  </div>
                ) : skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <Badge key={skill.id} variant="secondary">
                        {skill.name}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-border p-6 text-center text-muted-foreground">
                    {labels.noSkills}
                  </div>
                )}
              </CardContent>
            </Card>
          </form>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
