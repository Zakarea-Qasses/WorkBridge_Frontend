import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
import { Briefcase, Clock, LoaderCircle, RefreshCw, Search, Sparkles, Tag, Wallet } from 'lucide-react';
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
import { getApiErrorMessage } from '@/app/api/client';
import { createReport, getCategories, getProjects, type Category, type UserProject } from '@/app/api/endpoints';

type StatusMessage = { type: 'success' | 'error'; message: string } | null;

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
  return new Intl.DateTimeFormat(isEnglish ? 'en' : 'ar', { dateStyle: 'medium' }).format(date);
}

function statusLabel(status: string, isEnglish: boolean) {
  const labels: Record<string, { ar: string; en: string }> = {
    active: { ar: 'نشط', en: 'Active' },
    paused: { ar: 'متوقف مؤقتاً', en: 'Paused' },
    closed: { ar: 'مغلق', en: 'Closed' },
  };
  return isEnglish ? labels[status]?.en || status : labels[status]?.ar || status;
}

function budgetRange(value: string) {
  if (value === 'low') return { max_price: 5000 };
  if (value === 'medium') return { min_price: 5000, max_price: 15000 };
  if (value === 'high') return { min_price: 15000 };
  return {};
}

export default function Projects() {
  const { isEnglish, language } = useLanguage();
  const requestIdRef = useRef(0);
  const [projects, setProjects] = useState<UserProject[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBudget, setSelectedBudget] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [reportingId, setReportingId] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<StatusMessage>(null);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  const loadProjects = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setLoading(true);
    setStatusMessage(null);

    try {
      const budgetParams = budgetRange(selectedBudget);
      const response = await getProjects({
        page: currentPage,
        search: searchTerm.trim() || undefined,
        category_id: selectedCategory !== 'all' ? Number(selectedCategory) : undefined,
        ...budgetParams,
      });
      if (requestId !== requestIdRef.current) return;
      setProjects(response.data);
      setLastPage(response.last_page || 1);
    } catch (error) {
      if (requestId !== requestIdRef.current) return;
      setProjects([]);
      setStatusMessage({
        type: 'error',
        message: getApiErrorMessage(error) || (isEnglish ? 'Could not load projects.' : 'تعذر تحميل المشاريع'),
      });
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, [currentPage, isEnglish, searchTerm, selectedBudget, selectedCategory]);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedBudget]);

  const reportProject = async (project: UserProject) => {
    try {
      setReportingId(project.id);
      setStatusMessage(null);
      await createReport({
        target_type: 'project',
        target_id: project.id,
        title: `بلاغ عن مشروع: ${project.title}`,
        category: 'complaint',
        priority: 'normal',
        description: `تم إرسال بلاغ على المشروع "${project.title}" لمراجعته من قبل الإدارة.\n\n${project.description}`,
      });
      setStatusMessage({
        type: 'success',
        message: isEnglish ? 'Report sent successfully.' : 'تم إرسال البلاغ بنجاح',
      });
    } catch (error) {
      setStatusMessage({
        type: 'error',
        message: getApiErrorMessage(error) || (isEnglish ? 'Could not send report.' : 'تعذر إرسال البلاغ'),
      });
    } finally {
      setReportingId(null);
    }
  };

  const projectCount = useMemo(() => projects.length, [projects]);

  return (
    <DashboardLayout>
      <div className="space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <section className="rounded-md border border-border bg-white p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
                <Sparkles className="size-4" />
                {isEnglish ? 'Projects ready to receive offers' : 'مشاريع جاهزة لاستقبال العروض'}
              </div>
              <h1 className="text-3xl font-bold">{isEnglish ? 'Available Projects' : 'المشاريع المتاحة'}</h1>
              <p className="mt-2 text-muted-foreground">
                {isEnglish
                  ? 'Browse real projects from the backend and submit offers from the details page.'
                  : 'تصفح المشاريع الحقيقية من الباك وقدّم عروضك من صفحة التفاصيل.'}
              </p>
            </div>

            <Button asChild className="min-w-36">
              <Link to="/projects/create">{isEnglish ? 'Post a new project' : 'نشر مشروع جديد'}</Link>
            </Button>
          </div>
        </section>

        {statusMessage ? (
          <Card className={statusMessage.type === 'error' ? 'border-destructive/30' : 'border-green-200 bg-green-50'}>
            <CardContent className={`pt-6 text-sm ${statusMessage.type === 'error' ? 'text-destructive' : 'text-green-700'}`}>
              {statusMessage.message}
            </CardContent>
          </Card>
        ) : null}

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="md:col-span-2">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder={isEnglish ? 'Search projects...' : 'ابحث عن مشروع...'}
                  className="bg-input-background pr-10"
                  disabled={loading}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <Select value={selectedCategory} onValueChange={setSelectedCategory} disabled={loading}>
                <SelectTrigger className="bg-input-background">
                  <SelectValue placeholder={isEnglish ? 'Category' : 'التصنيف'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isEnglish ? 'All categories' : 'كل التصنيفات'}</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <Select value={selectedBudget} onValueChange={setSelectedBudget} disabled={loading}>
                <SelectTrigger className="bg-input-background">
                  <SelectValue placeholder={isEnglish ? 'Budget' : 'الميزانية'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isEnglish ? 'All budgets' : 'كل الميزانيات'}</SelectItem>
                  <SelectItem value="low">{isEnglish ? 'Less than 5,000' : 'أقل من 5,000'}</SelectItem>
                  <SelectItem value="medium">5,000 - 15,000</SelectItem>
                  <SelectItem value="high">{isEnglish ? 'More than 15,000' : 'أكثر من 15,000'}</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="rounded-md bg-primary/10 p-3 text-primary">
              <Briefcase className="size-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{isEnglish ? 'Projects on this page' : 'مشاريع هذه الصفحة'}</p>
              <p className="text-2xl font-bold">{loading ? '-' : projectCount}</p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {loading ? (
            [1, 2, 3].map((item) => <div key={item} className="h-48 animate-pulse rounded-md bg-muted" />)
          ) : projects.length > 0 ? (
            projects.map((project) => (
              <Card key={project.id} className="transition-shadow hover:shadow-lg">
                <CardHeader className="gap-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <CardTitle className="text-xl">{project.title}</CardTitle>
                        {project.category ? <Badge variant="secondary">{project.category.name}</Badge> : null}
                        <Badge variant="outline">{statusLabel(project.status, isEnglish)}</Badge>
                      </div>
                      <CardDescription className="text-sm">
                        {isEnglish ? 'Posted by:' : 'الجهة الناشرة:'} {project.user?.name || (isEnglish ? 'Unknown' : 'غير معروف')}
                      </CardDescription>
                    </div>
                    <div className="rounded-md bg-muted px-4 py-2 text-sm">
                      <span className="block text-muted-foreground">{isEnglish ? 'Posted' : 'منشور'}</span>
                      <span className="font-medium">{formatDate(project.created_at, isEnglish)}</span>
                    </div>
                  </div>
                  <CardDescription className="leading-7">{project.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-5">
                  {project.skills?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {project.skills.map((skill) => (
                        <Badge key={skill.id} variant="outline" className="text-xs">
                          <Tag className="size-3" />
                          {skill.name}
                        </Badge>
                      ))}
                    </div>
                  ) : null}

                  <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4">
                    <div className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
                      <span className="flex items-center gap-2">
                        <Wallet className="size-4 text-primary" />
                        <span className="font-semibold text-foreground">{formatBudget(project.budget, isEnglish)}</span>
                      </span>
                      <span className="flex items-center gap-2">
                        <Clock className="size-4" />
                        {project.duration_days} {isEnglish ? 'days' : 'يوم'}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Button
                        variant="outline"
                        disabled={reportingId === project.id}
                        onClick={() => void reportProject(project)}
                      >
                        {reportingId === project.id ? <LoaderCircle className="me-2 size-4 animate-spin" /> : null}
                        {isEnglish ? 'Report post' : 'إبلاغ عن المنشور'}
                      </Button>
                      <Button asChild>
                        <Link to={`/projects/${project.id}`}>{isEnglish ? 'View details' : 'عرض التفاصيل'}</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-lg font-medium">{isEnglish ? 'No projects currently available' : 'لا توجد مشاريع متاحة حالياً'}</p>
                <p className="mt-2 text-muted-foreground">
                  {isEnglish ? 'Try changing the filters or publish a new project.' : 'جرّب تعديل الفلاتر أو انشر مشروعاً جديداً.'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {!loading && lastPage > 1 ? (
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            >
              {isEnglish ? 'Previous' : 'السابق'}
            </Button>
            <span className="px-3 text-sm text-muted-foreground">
              {currentPage} / {lastPage}
            </span>
            <Button
              variant="outline"
              disabled={currentPage === lastPage}
              onClick={() => setCurrentPage((page) => Math.min(lastPage, page + 1))}
            >
              {isEnglish ? 'Next' : 'التالي'}
            </Button>
          </div>
        ) : null}

        {statusMessage?.type === 'error' ? (
          <div className="flex justify-center">
            <Button variant="outline" onClick={() => void loadProjects()}>
              <RefreshCw className="me-2 size-4" />
              {isEnglish ? 'Try again' : 'إعادة المحاولة'}
            </Button>
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
