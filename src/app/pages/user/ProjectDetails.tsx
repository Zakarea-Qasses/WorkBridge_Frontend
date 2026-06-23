import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router';
import { AlertCircle, CheckCircle2, LoaderCircle, User, Wallet } from 'lucide-react';
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
  Separator,
  Textarea,
} from '@/app/components/ui';
import { getApiErrorMessage, getValidationErrors } from '@/app/api/client';
import { applyToProject, getProject, type UserProject } from '@/app/api/endpoints';
import { useAuth } from '@/app/providers/AuthProvider';

type Status = { type: 'success' | 'error'; message: string } | null;

function formatBudget(value: number | string, isEnglish: boolean) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return isEnglish ? 'Budget unavailable' : 'الميزانية غير متاحة';
  return new Intl.NumberFormat(isEnglish ? 'en' : 'ar', {
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(value: string, isEnglish: boolean) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return isEnglish ? 'Date unavailable' : 'التاريخ غير متاح';
  return new Intl.DateTimeFormat(isEnglish ? 'en' : 'ar', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function statusLabel(status: string, isEnglish: boolean) {
  const labels: Record<string, { ar: string; en: string }> = {
    active: { ar: 'نشط', en: 'Active' },
    paused: { ar: 'متوقف مؤقتاً', en: 'Paused' },
    closed: { ar: 'مغلق', en: 'Closed' },
  };
  return isEnglish ? labels[status]?.en || status : labels[status]?.ar || status;
}

function StatusMessage({ status }: { status: Status }) {
  if (!status) return null;

  return (
    <div
      className={`flex items-center gap-2 rounded-md border px-4 py-3 text-sm ${
        status.type === 'success'
          ? 'border-green-200 bg-green-50 text-green-700'
          : 'border-destructive/30 bg-destructive/5 text-destructive'
      }`}
    >
      {status.type === 'success' ? (
        <CheckCircle2 className="size-4 shrink-0" />
      ) : (
        <AlertCircle className="size-4 shrink-0" />
      )}
      {status.message}
    </div>
  );
}

export default function ProjectDetails() {
  const { id } = useParams();
  const { isEnglish, language } = useLanguage();
  const { user } = useAuth();
  const requestIdRef = useRef(0);
  const [project, setProject] = useState<UserProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [proposalForm, setProposalForm] = useState({
    price: '',
    duration_days: '',
    description: '',
  });

  const loadProject = useCallback(async () => {
    const projectId = Number(id);
    if (!Number.isInteger(projectId) || projectId <= 0) {
      setProject(null);
      setLoading(false);
      setStatus({
        type: 'error',
        message: isEnglish
          ? 'Project not found or no longer available.'
          : 'المشروع غير موجود أو لم يعد متاحاً',
      });
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setLoading(true);
    setStatus(null);
    setProject(null);

    try {
      const loadedProject = await getProject(projectId);
      if (requestId !== requestIdRef.current) return;
      setProject(loadedProject);
    } catch (error) {
      if (requestId !== requestIdRef.current) return;
      setStatus({
        type: 'error',
        message:
          getApiErrorMessage(error) ||
          (isEnglish ? 'Could not load project details.' : 'تعذر تحميل تفاصيل المشروع'),
      });
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, [id, isEnglish]);

  useEffect(() => {
    setProposalForm({ price: '', duration_days: '', description: '' });
    setFieldErrors({});
    void loadProject();
  }, [loadProject]);

  const canApply =
    project &&
    user?.role === 'personal' &&
    project.user_id !== user.id &&
    project.status === 'active';

  const handleSubmitProposal = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!project || submitting) return;

    try {
      setSubmitting(true);
      setStatus(null);
      setFieldErrors({});
      await applyToProject(project.id, {
        price: Number(proposalForm.price),
        duration_days: Number(proposalForm.duration_days),
        description: proposalForm.description.trim(),
      });
      setProposalForm({ price: '', duration_days: '', description: '' });
      setStatus({
        type: 'success',
        message: isEnglish
          ? 'Project application sent successfully.'
          : 'تم إرسال طلب التقديم بنجاح',
      });
      await loadProject();
    } catch (error) {
      setFieldErrors(getValidationErrors(error));
      setStatus({
        type: 'error',
        message:
          getApiErrorMessage(error) ||
          (isEnglish ? 'Could not send project application.' : 'تعذر إرسال طلب التقديم'),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/projects" className="hover:text-primary">
            {isEnglish ? 'Projects' : 'المشاريع'}
          </Link>
          <span>/</span>
          <span className="text-foreground">{isEnglish ? 'Project Details' : 'تفاصيل المشروع'}</span>
        </div>

        <StatusMessage status={status} />

        {loading ? (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="h-96 animate-pulse rounded-md bg-muted lg:col-span-2" />
            <div className="h-96 animate-pulse rounded-md bg-muted" />
          </div>
        ) : !project ? (
          <Card>
            <CardContent className="space-y-4 py-10 text-center">
              <p className="text-lg font-semibold">
                {isEnglish ? 'Project not found' : 'المشروع غير موجود'}
              </p>
              <p className="text-sm text-muted-foreground">
                {isEnglish
                  ? 'The project may be unavailable or the link is invalid.'
                  : 'المشروع غير موجود أو لم يعد متاحاً'}
              </p>
              <div className="flex justify-center gap-2">
                <Button variant="outline" onClick={() => void loadProject()}>
                  {isEnglish ? 'Try again' : 'إعادة المحاولة'}
                </Button>
                <Button asChild>
                  <Link to="/projects">{isEnglish ? 'Back to Projects' : 'العودة إلى المشاريع'}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-2">
                      <CardTitle className="text-2xl">{project.title}</CardTitle>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        {project.category ? <Badge variant="secondary">{project.category.name}</Badge> : null}
                        <span>{formatDate(project.created_at, isEnglish)}</span>
                      </div>
                    </div>
                    <Badge className="bg-emerald-500">{statusLabel(project.status, isEnglish)}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="mb-2 font-semibold">{isEnglish ? 'Project Description' : 'وصف المشروع'}</h3>
                    <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">
                      {project.description}
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="mb-3 font-semibold">{isEnglish ? 'Required Skills' : 'المهارات المطلوبة'}</h3>
                    {project.skills?.length ? (
                      <div className="flex flex-wrap gap-2">
                        {project.skills.map((skill) => (
                          <Badge key={skill.id} variant="outline">
                            {skill.name}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {isEnglish ? 'No skills listed.' : 'لا توجد مهارات محددة.'}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {canApply ? (
                <Card>
                  <CardHeader>
                    <CardTitle>{isEnglish ? 'Submit Proposal' : 'تقديم عرض'}</CardTitle>
                    <CardDescription>
                      {isEnglish
                        ? 'Your proposal will be sent to the project owner through the backend.'
                        : 'سيتم إرسال عرضك لصاحب المشروع عبر الباك.'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-4" onSubmit={handleSubmitProposal}>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="price">{isEnglish ? 'Offer value' : 'قيمة العرض'}</Label>
                          <Input
                            id="price"
                            type="number"
                            min="1"
                            value={proposalForm.price}
                            onChange={(event) =>
                              setProposalForm((current) => ({ ...current, price: event.target.value }))
                            }
                          />
                          {fieldErrors.price?.[0] ? (
                            <p className="text-xs text-destructive">{fieldErrors.price[0]}</p>
                          ) : null}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="duration_days">{isEnglish ? 'Duration in days' : 'مدة التنفيذ بالأيام'}</Label>
                          <Input
                            id="duration_days"
                            type="number"
                            min="1"
                            value={proposalForm.duration_days}
                            onChange={(event) =>
                              setProposalForm((current) => ({ ...current, duration_days: event.target.value }))
                            }
                          />
                          {fieldErrors.duration_days?.[0] ? (
                            <p className="text-xs text-destructive">{fieldErrors.duration_days[0]}</p>
                          ) : null}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">{isEnglish ? 'Proposal details' : 'تفاصيل العرض'}</Label>
                        <Textarea
                          id="description"
                          rows={6}
                          value={proposalForm.description}
                          onChange={(event) =>
                            setProposalForm((current) => ({ ...current, description: event.target.value }))
                          }
                        />
                        {fieldErrors.description?.[0] ? (
                          <p className="text-xs text-destructive">{fieldErrors.description[0]}</p>
                        ) : null}
                      </div>
                      <Button type="submit" className="w-full" disabled={submitting}>
                        {submitting ? <LoaderCircle className="me-2 size-4 animate-spin" /> : null}
                        {isEnglish ? 'Send Proposal' : 'إرسال العرض'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="pt-6 text-sm text-muted-foreground">
                    {project.user_id === user?.id
                      ? isEnglish
                        ? 'You cannot apply to your own project.'
                        : 'لا يمكنك التقديم على مشروعك.'
                      : isEnglish
                        ? 'Applying is available only for personal active accounts.'
                        : 'التقديم متاح فقط للحسابات الشخصية النشطة.'}
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{isEnglish ? 'Project Information' : 'معلومات المشروع'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{isEnglish ? 'Budget' : 'الميزانية'}</span>
                    <span className="font-bold text-primary">{formatBudget(project.budget, isEnglish)}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{isEnglish ? 'Expected duration' : 'المدة المتوقعة'}</span>
                    <span className="font-semibold">
                      {project.duration_days} {isEnglish ? 'days' : 'يوم'}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{isEnglish ? 'Status' : 'الحالة'}</span>
                    <Badge className="bg-emerald-500">{statusLabel(project.status, isEnglish)}</Badge>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{isEnglish ? 'Location' : 'الموقع'}</span>
                    <span className="font-semibold">
                      {project.city?.name || project.governorate?.name || (isEnglish ? 'Not specified' : 'غير محدد')}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{isEnglish ? 'Client Information' : 'معلومات العميل'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                      <User className="size-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{project.user?.name || (isEnglish ? 'Unknown' : 'غير معروف')}</h4>
                      <p className="text-sm text-muted-foreground">{project.user?.role || ''}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="size-5 text-primary" />
                    {isEnglish ? 'How offers work' : 'كيف تعمل العروض؟'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    {isEnglish
                      ? 'Enter your price, duration, and execution details. The project owner reviews real applications from the backend.'
                      : 'أدخل السعر والمدة وتفاصيل التنفيذ. صاحب المشروع يراجع التقديمات الحقيقية من الباك.'}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
