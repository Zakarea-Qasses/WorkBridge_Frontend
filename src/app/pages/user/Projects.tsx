import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import {
  Briefcase,
  Clock,
  Search,
  Sparkles,
  Tag,
  Users,
  Wallet,
} from 'lucide-react';
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
import {
  getCategorySearchTerms,
  getDisplayCategoryLabel,
  getDisplayDurationLabel,
  getDisplayRelativeTimeLabel,
} from '@/app/data';
import { createContentReport, getProjects } from '@/app/storage';

const PROJECTS_PER_PAGE = 4;

export default function Projects() {
  const { isEnglish, language } = useLanguage();
  const [projects, setProjects] = useState(() => getProjects());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBudget, setSelectedBudget] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    setProjects(getProjects());
  }, []);

  const filteredProjects = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return projects.filter((project) => {
      const matchesSearch =
        normalizedSearch === '' ||
        project.title.toLowerCase().includes(normalizedSearch) ||
        project.description.toLowerCase().includes(normalizedSearch) ||
        project.client.toLowerCase().includes(normalizedSearch) ||
        project.skills.some((skill) => skill.toLowerCase().includes(normalizedSearch)) ||
        getCategorySearchTerms(project.category).some((term) =>
          term.toLowerCase().includes(normalizedSearch),
        );

      const matchesCategory = selectedCategory === 'all' || project.category === selectedCategory;

      const matchesBudget =
        selectedBudget === 'all' ||
        (selectedBudget === 'low' && project.budgetValue < 5000) ||
        (selectedBudget === 'medium' && project.budgetValue >= 5000 && project.budgetValue <= 15000) ||
        (selectedBudget === 'high' && project.budgetValue > 15000);

      return matchesSearch && matchesCategory && matchesBudget;
    });
  }, [projects, searchTerm, selectedBudget, selectedCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / PROJECTS_PER_PAGE));
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * PROJECTS_PER_PAGE,
    currentPage * PROJECTS_PER_PAGE,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedBudget]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleReportProject = (projectTitle: string) => {
    createContentReport({
      targetType: isEnglish ? 'Project post' : 'منشور مشروع',
      targetLabel: projectTitle,
      reporter: isEnglish ? 'Personal account user' : 'مستخدم الحساب الشخصي',
      description: isEnglish
        ? `A report was submitted for the project "${projectTitle}" for admin review.`
        : `تم إرسال بلاغ على المشروع "${projectTitle}" لمراجعته من قبل الأدمن.`,
    });
    setStatusMessage(
      isEnglish
        ? `The report for "${projectTitle}" was sent successfully.`
        : `تم إرسال البلاغ على المشروع "${projectTitle}" بنجاح.`,
    );
  };

  const categoryOptions = [
    { value: 'all', label: isEnglish ? 'All categories' : 'جميع التصنيفات' },
    { value: 'برمجة وتطوير', label: isEnglish ? 'Programming & Development' : 'برمجة وتطوير' },
    { value: 'تصميم', label: isEnglish ? 'Design' : 'تصميم' },
    { value: 'كتابة وترجمة', label: isEnglish ? 'Writing & Translation' : 'كتابة وترجمة' },
    { value: 'تسويق', label: isEnglish ? 'Marketing' : 'تسويق' },
    { value: 'عام', label: isEnglish ? 'General' : 'عام' },
  ];

  const budgetOptions = [
    { value: 'all', label: isEnglish ? 'All budgets' : 'كل الميزانيات' },
    { value: 'low', label: isEnglish ? 'Less than $5,000' : 'أقل من $5,000' },
    { value: 'medium', label: '$5,000 - $15,000' },
    { value: 'high', label: isEnglish ? 'More than $15,000' : 'أكثر من $15,000' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <section className="rounded-3xl border border-border bg-gradient-to-l from-slate-50 via-white to-blue-50 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
                <Sparkles className="size-4" />
                {isEnglish ? 'Projects ready to receive offers' : 'مشاريع جاهزة لاستقبال العروض'}
              </div>
              <h1 className="text-3xl font-bold">{isEnglish ? 'Available Projects' : 'المشاريع المتاحة'}</h1>
              <p className="mt-2 text-muted-foreground">
                {isEnglish
                  ? 'Browse open projects, filter what matches your skills, or publish a new project and start receiving freelancer offers.'
                  : 'تصفّح المشاريع المفتوحة، رشّح الأنسب لمهاراتك، أو انشر مشروعًا جديدًا وابدأ باستقبال عروض المستقلين.'}
              </p>
            </div>

            <Button asChild className="min-w-36">
              <Link to="/projects/create">{isEnglish ? 'Post a new project' : 'نشر مشروع جديد'}</Link>
            </Button>
          </div>
        </section>

        {statusMessage ? (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-6 text-sm text-amber-800">{statusMessage}</CardContent>
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
                  placeholder={
                    isEnglish
                      ? 'Search by project, skill, or client...'
                      : 'ابحث عن مشروع أو مهارة أو جهة ناشرة...'
                  }
                  className="bg-input-background pr-10"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="bg-input-background">
                  <SelectValue placeholder={isEnglish ? 'Category' : 'التصنيف'} />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <Select value={selectedBudget} onValueChange={setSelectedBudget}>
                <SelectTrigger className="bg-input-background">
                  <SelectValue placeholder={isEnglish ? 'Budget' : 'الميزانية'} />
                </SelectTrigger>
                <SelectContent>
                  {budgetOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-3 pt-6">
              <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                <Briefcase className="size-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{isEnglish ? 'Projects count' : 'عدد المشاريع'}</p>
                <p className="text-2xl font-bold">{filteredProjects.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-3 pt-6">
              <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
                <Users className="size-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{isEnglish ? 'Average offers' : 'متوسط العروض'}</p>
                <p className="text-2xl font-bold">
                  {filteredProjects.length > 0
                    ? Math.round(
                        filteredProjects.reduce((sum, project) => sum + project.proposals, 0) /
                          filteredProjects.length,
                      )
                    : 0}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-3 pt-6">
              <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                <Wallet className="size-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{isEnglish ? 'Featured projects' : 'مشاريع مميزة'}</p>
                <p className="text-2xl font-bold">
                  {filteredProjects.filter((project) => project.featured).length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {paginatedProjects.length > 0 ? (
            paginatedProjects.map((project) => (
              <Card key={project.id} className="transition-shadow hover:shadow-lg">
                <CardHeader className="gap-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <CardTitle className="text-xl">{project.title}</CardTitle>
                        {project.featured ? (
                          <Badge className="bg-primary text-primary-foreground">
                            {isEnglish ? 'Featured' : 'مميز'}
                          </Badge>
                        ) : null}
                        <Badge variant="secondary">
                          {getDisplayCategoryLabel(project.category, isEnglish)}
                        </Badge>
                      </div>

                      <CardDescription className="text-sm">
                        {isEnglish ? 'Posted by:' : 'الجهة الناشرة:'} {project.client}
                      </CardDescription>
                    </div>

                    <div className="rounded-2xl bg-muted px-4 py-2 text-sm">
                      <span className="block text-muted-foreground">{isEnglish ? 'Posted' : 'منشور'}</span>
                      <span className="font-medium">
                        {getDisplayRelativeTimeLabel(project.postedTime, isEnglish)}
                      </span>
                    </div>
                  </div>

                  <CardDescription className="leading-7">{project.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-5">
                  <div className="flex flex-wrap gap-2">
                    {project.skills.map((skill) => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        <Tag className="size-3" />
                        {skill}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4">
                    <div className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
                      <span className="flex items-center gap-2">
                        <Wallet className="size-4 text-primary" />
                        <span className="font-semibold text-foreground">{project.budget}</span>
                      </span>
                      <span className="flex items-center gap-2">
                        <Clock className="size-4" />
                        {getDisplayDurationLabel(project.duration, isEnglish)}
                      </span>
                      <span className="flex items-center gap-2">
                        <Users className="size-4" />
                        {project.proposals} {isEnglish ? 'offers' : 'عرض'}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Button variant="outline" onClick={() => handleReportProject(project.title)}>
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
                <p className="text-lg font-medium">{isEnglish ? 'No matching projects found' : 'لا توجد مشاريع مطابقة'}</p>
                <p className="mt-2 text-muted-foreground">
                  {isEnglish
                    ? 'Try adjusting the search, category, or budget range.'
                    : 'جرّب تعديل البحث أو التصنيف أو نطاق الميزانية.'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
          >
            {isEnglish ? 'Previous' : 'السابق'}
          </Button>

          {Array.from({ length: totalPages }, (_, index) => {
            const pageNumber = index + 1;
            return (
              <Button
                key={pageNumber}
                variant={currentPage === pageNumber ? 'default' : 'outline'}
                onClick={() => setCurrentPage(pageNumber)}
              >
                {pageNumber}
              </Button>
            );
          })}

          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
          >
            {isEnglish ? 'Next' : 'التالي'}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
