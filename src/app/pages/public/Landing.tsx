import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { getLandingData } from '@/app/api/pages/public/landing';
import type { JobPost, Service, UserProject } from '@/app/api/types';
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui';
import { FreshAuthLink, LanguageToggle } from '@/app/components/shared';
import { useLanguage } from '@/app/providers/LanguageProvider';
import { formatUsd } from '@/app/utils/money';
import {
  Briefcase,
  Users,
  Shield,
  MessageSquare,
  Star,
  Gavel,
  CheckCircle2,
  TrendingUp,
  Wallet,
} from 'lucide-react';

type Language = 'ar' | 'en';  

const content = {
  ar: {
    login: 'تسجيل الدخول',
    register: 'إنشاء حساب',
    heroTitle: 'منصة تجمع بين التوظيف والعمل الحر في مكان واحد',
    heroDescription:
      'Work Bridge منصة احترافية تربط الباحثين عن عمل والمستقلين مع الشركات والعملاء ضمن بيئة آمنة ومنظمة وواضحة.',
    startNow: 'ابدأ الآن',
    explore: 'استكشف الفرص',
    help: 'مركز الدعم والمساعدة',
    terms: 'الشروط والأحكام',
    privacy: 'سياسة الخصوصية',
    howItWorksTitle: 'كيف يعمل النظام',
    howItWorksDescription: 'ثلاث خطوات بسيطة للبدء',
    stepOneTitle: 'إنشاء حساب',
    stepOneDescription: 'سجل في المنصة واختر نوع حسابك: مستخدم، مقدم خدمة، شركة، أو أدمن.',
    stepTwoTitle: 'نشر أو تقديم',
    stepTwoDescription: 'انشر وظيفة أو مشروعًا، أو تصفح الخدمات وقدّم على الفرص المناسبة.',
    stepThreeTitle: 'تنفيذ ومتابعة',
    stepThreeDescription: 'تابع العقود والمحادثات والمحفظة والتقييمات ضمن تجربة موحدة وواضحة.',
    featuresTitle: 'مميزات المنصة',
    featuresDescription: 'كل ما تحتاجه في مكان واحد',
    features: [
      {
        title: 'محفظة آمنة',
        description: 'نظام محفظة منظم لمتابعة الرصيد والمعاملات والسحب والإضافة.',
        icon: Wallet,
      },
      {
        title: 'محادثة مباشرة',
        description: 'تواصل واضح بين الأطراف لمناقشة الوظائف والمشاريع والخدمات.',
        icon: MessageSquare,
      },
      {
        title: 'نظام تقييمات',
        description: 'تقييمات ومراجعات تساعد على بناء الثقة وتحسين جودة التعامل.',
        icon: Star,
      },
      {
        title: 'حل النزاعات',
        description: 'قنوات واضحة للشكاوى والنزاعات واتخاذ القرار الإداري عند الحاجة.',
        icon: Gavel,
      },
      {
        title: 'تقارير وخصوصية',
        description: 'بلاغات منظمة ومراجعة دقيقة مع صفحات عامة واضحة للشروط والخصوصية.',
        icon: Shield,
      },
      {
        title: 'نمو مستمر',
        description: 'فرص متجددة وبنية قابلة للتوسع بين المستخدمين والشركات والإدارة.',
        icon: TrendingUp,
      },
    ],
    featuredJobsTitle: 'وظائف مميزة',
    freelanceProjectsTitle: 'مشاريع العمل الحر',
    topFreelancersTitle: 'مقدمو الخدمات',
    topFreelancersDescription: 'مقدمو خدمات مسجلون على المنصة',
    viewAll: 'عرض الكل',
    duration: 'المدة',
    projectsCount: 'خدمة',
    loading: 'جاري تحميل أحدث البيانات...',
    emptyJobs: 'لا توجد وظائف متاحة حالياً.',
    emptyProjects: 'لا توجد مشاريع متاحة حالياً.',
    emptyProviders: 'لا يوجد مقدمو خدمات حالياً.',
    loadError: 'تعذر تحميل بيانات الصفحة الرئيسية من الخادم.',
    days: 'يوم',
    salaryUnavailable: 'الراتب غير محدد',
    ctaTitle: 'ابدأ رحلتك المهنية الآن',
    ctaDescription: 'انضم إلى آلاف المحترفين والشركات على منصة Work Bridge',
    freeAccount: 'إنشاء حساب مجاني',
    visitHelp: 'زيارة مركز المساعدة',
    footerDescription: 'منصة احترافية تجمع بين التوظيف والعمل الحر.',
    quickLinks: 'روابط سريعة',
    jobs: 'الوظائف',
    projects: 'المشاريع',
    support: 'الدعم',
    contact: 'تواصل معنا',
    rights: 'جميع الحقوق محفوظة لدى Work Bridge',
    city: 'دمشق، سوريا',
  },
  en: {
    login: 'Login',
    register: 'Create Account',
    heroTitle: 'One platform for jobs, freelance work, and services',
    heroDescription:
      'Work Bridge connects job seekers, freelancers, companies, and clients in one clear and organized workspace.',
    startNow: 'Get Started',
    explore: 'Explore Opportunities',
    help: 'Help & Support Center',
    terms: 'Terms & Conditions',
    privacy: 'Privacy Policy',
    howItWorksTitle: 'How It Works',
    howItWorksDescription: 'Three simple steps to get started',
    stepOneTitle: 'Create an Account',
    stepOneDescription: 'Sign up and choose your account type: user, service provider, company, or admin.',
    stepTwoTitle: 'Post or Apply',
    stepTwoDescription: 'Post a job or project, or browse services and apply to the right opportunities.',
    stepThreeTitle: 'Track and Complete',
    stepThreeDescription: 'Follow contracts, messages, wallet activity, and reviews in one clear experience.',
    featuresTitle: 'Platform Features',
    featuresDescription: 'Everything you need in one place',
    features: [
      {
        title: 'Secure Wallet',
        description: 'A clear wallet system for balance tracking, deposits, withdrawals, and transactions.',
        icon: Wallet,
      },
      {
        title: 'Direct Messaging',
        description: 'Simple communication between both sides for jobs, projects, and services.',
        icon: MessageSquare,
      },
      {
        title: 'Reviews System',
        description: 'Ratings and reviews that help build trust and improve collaboration quality.',
        icon: Star,
      },
      {
        title: 'Dispute Resolution',
        description: 'Clear channels for complaints, disputes, and admin decisions when needed.',
        icon: Gavel,
      },
      {
        title: 'Reports & Privacy',
        description: 'Organized reporting tools and clear public pages for terms and privacy.',
        icon: Shield,
      },
      {
        title: 'Continuous Growth',
        description: 'A flexible platform built to scale for users, companies, and admin workflows.',
        icon: TrendingUp,
      },
    ],
    featuredJobsTitle: 'Featured Jobs',
    freelanceProjectsTitle: 'Freelance Projects',
    topFreelancersTitle: 'Service Providers',
    topFreelancersDescription: 'Service providers registered on the platform',
    viewAll: 'View All',
    duration: 'Duration',
    projectsCount: 'services',
    loading: 'Loading the latest data...',
    emptyJobs: 'No jobs are currently available.',
    emptyProjects: 'No projects are currently available.',
    emptyProviders: 'No service providers are currently available.',
    loadError: 'Unable to load homepage data from the server.',
    days: 'days',
    salaryUnavailable: 'Salary not specified',
    ctaTitle: 'Start your professional journey today',
    ctaDescription: 'Join thousands of professionals and companies on Work Bridge',
    freeAccount: 'Create Free Account',
    visitHelp: 'Visit Help Center',
    footerDescription: 'A professional platform for jobs and freelance work.',
    quickLinks: 'Quick Links',
    jobs: 'Jobs',
    projects: 'Projects',
    support: 'Support',
    contact: 'Contact Us',
    rights: 'All rights reserved to Work Bridge',
    city: 'Damascus, Syria',
  },
} satisfies Record<
  Language,
  {
    login: string;
    register: string;
    heroTitle: string;
    heroDescription: string;
    startNow: string;
    explore: string;
    help: string;
    terms: string;
    privacy: string;
    howItWorksTitle: string;
    howItWorksDescription: string;
    stepOneTitle: string;
    stepOneDescription: string;
    stepTwoTitle: string;
    stepTwoDescription: string;
    stepThreeTitle: string;
    stepThreeDescription: string;
    featuresTitle: string;
    featuresDescription: string;
    features: Array<{ title: string; description: string; icon: typeof Wallet }>;
    featuredJobsTitle: string;
    freelanceProjectsTitle: string;
    topFreelancersTitle: string;
    topFreelancersDescription: string;
    viewAll: string;
    duration: string;
    projectsCount: string;
    loading: string;
    emptyJobs: string;
    emptyProjects: string;
    emptyProviders: string;
    loadError: string;
    days: string;
    salaryUnavailable: string;
    ctaTitle: string;
    ctaDescription: string;
    freeAccount: string;
    visitHelp: string;
    footerDescription: string;
    quickLinks: string;
    jobs: string;
    projects: string;
    support: string;
    contact: string;
    rights: string;
    city: string;
  }
>;

export default function Landing() {
  const { language: currentLanguage } = useLanguage();
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [projects, setProjects] = useState<UserProject[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  const helpPath = '/help';
  const termsPath = '/terms';
  const privacyPath = '/privacy';

  const t = content[currentLanguage];
  const locale = currentLanguage === 'en' ? 'en' : 'ar';
  const providers = useMemo(() => {
    const providerMap = new Map<number, { id: number; name: string; specialty: string; services: number }>();

    services.forEach((service) => {
      if (!service.user?.id) return;
      const current = providerMap.get(service.user.id);
      providerMap.set(service.user.id, {
        id: service.user.id,
        name: service.user.name,
        specialty: current?.specialty || service.category?.name || service.title,
        services: (current?.services || 0) + 1,
      });
    });

    return Array.from(providerMap.values()).slice(0, 4);
  }, [services]);

  useEffect(() => {
    let active = true;

    getLandingData()
      .then((data) => {
        if (!active) return;
        setJobs(data.jobs.slice(0, 3));
        setProjects(data.projects.slice(0, 3));
        setServices(data.services);
      })
      .catch(() => {
        if (active) setLoadFailed(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <header className="sticky top-0 z-50 border-b border-border bg-white">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <Briefcase className="size-8 text-primary" />
            <span className="text-2xl font-bold text-primary">Work Bridge</span>
          </div>
          <div className="flex items-center gap-4">
            <LanguageToggle />
            <Button asChild variant="ghost">
              <FreshAuthLink mode="login">{t.login}</FreshAuthLink>
            </Button>
            <Button asChild>
              <FreshAuthLink mode="register">{t.register}</FreshAuthLink>
            </Button>
          </div>
        </div>
      </header>

      <section className="bg-gradient-to-b from-blue-50 to-white py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-5xl font-bold text-foreground">{t.heroTitle}</h1>
            <p className="mb-8 text-xl text-muted-foreground">{t.heroDescription}</p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button asChild size="lg" className="px-8 text-lg">
                <FreshAuthLink mode="register">{t.startNow}</FreshAuthLink>
              </Button>
              <Button asChild size="lg" variant="outline" className="px-8 text-lg">
                <FreshAuthLink mode="login">{t.explore}</FreshAuthLink>
              </Button>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
              <Link to={helpPath} className="hover:text-primary hover:underline">
                {t.help}
              </Link>
              <span className="text-slate-300">|</span>
              <Link to={termsPath} className="hover:text-primary hover:underline">
                {t.terms}
              </Link>
              <span className="text-slate-300">|</span>
              <Link to={privacyPath} className="hover:text-primary hover:underline">
                {t.privacy}
              </Link>
            </div>

            <div className="mt-12">
              <div className="rounded-2xl bg-blue-100 p-12 shadow-lg">
                <Users className="mx-auto size-32 text-primary opacity-80" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-muted py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold text-foreground">{t.howItWorksTitle}</h2>
            <p className="text-xl text-muted-foreground">{t.howItWorksDescription}</p>
          </div>
          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 w-fit rounded-full bg-primary/10 p-4">
                  <Users className="size-10 text-primary" />
                </div>
                <CardTitle>{t.stepOneTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{t.stepOneDescription}</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 w-fit rounded-full bg-primary/10 p-4">
                  <Briefcase className="size-10 text-primary" />
                </div>
                <CardTitle>{t.stepTwoTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{t.stepTwoDescription}</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 w-fit rounded-full bg-primary/10 p-4">
                  <CheckCircle2 className="size-10 text-primary" />
                </div>
                <CardTitle>{t.stepThreeTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{t.stepThreeDescription}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold text-foreground">{t.featuresTitle}</h2>
            <p className="text-xl text-muted-foreground">{t.featuresDescription}</p>
          </div>
          <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-3">
            {t.features.map((feature) => {
              const Icon = feature.icon;

              return (
                <Card key={feature.title}>
                  <CardHeader>
                    <Icon className="mb-2 size-8 text-primary" />
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-muted py-20">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between gap-4">
            <h2 className="text-3xl font-bold text-foreground">{t.featuredJobsTitle}</h2>
            <Button asChild variant="outline">
              <FreshAuthLink mode="login">{t.viewAll}</FreshAuthLink>
            </Button>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              <Card className="md:col-span-2 lg:col-span-3"><CardContent className="py-10 text-center text-muted-foreground">{t.loading}</CardContent></Card>
            ) : loadFailed ? (
              <Card className="md:col-span-2 lg:col-span-3"><CardContent className="py-10 text-center text-destructive">{t.loadError}</CardContent></Card>
            ) : jobs.length === 0 ? (
              <Card className="md:col-span-2 lg:col-span-3"><CardContent className="py-10 text-center text-muted-foreground">{t.emptyJobs}</CardContent></Card>
            ) : jobs.map((job) => (
              <FreshAuthLink key={job.id} mode="login" className="block">
                <Card className="cursor-pointer transition-shadow hover:shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg">{job.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Briefcase className="size-4" />
                      {job.company?.company_name || '-'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="font-semibold text-primary">
                      {job.salary === null ? t.salaryUnavailable : formatUsd(job.salary, locale)}
                    </p>
                  </CardContent>
                </Card>
              </FreshAuthLink>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between gap-4">
            <h2 className="text-3xl font-bold text-foreground">{t.freelanceProjectsTitle}</h2>
            <Button asChild variant="outline">
              <FreshAuthLink mode="login">{t.viewAll}</FreshAuthLink>
            </Button>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              <Card className="md:col-span-2 lg:col-span-3"><CardContent className="py-10 text-center text-muted-foreground">{t.loading}</CardContent></Card>
            ) : loadFailed ? (
              <Card className="md:col-span-2 lg:col-span-3"><CardContent className="py-10 text-center text-destructive">{t.loadError}</CardContent></Card>
            ) : projects.length === 0 ? (
              <Card className="md:col-span-2 lg:col-span-3"><CardContent className="py-10 text-center text-muted-foreground">{t.emptyProjects}</CardContent></Card>
            ) : projects.map((project) => (
              <FreshAuthLink key={project.id} mode="login" className="block">
                <Card className="cursor-pointer transition-shadow hover:shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg">{project.title}</CardTitle>
                    <CardDescription>
                      {t.duration}: {project.duration_days} {t.days}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-primary">{formatUsd(project.budget, locale)}</p>
                      {project.category?.name && <Badge variant="secondary">{project.category.name}</Badge>}
                    </div>
                  </CardContent>
                </Card>
              </FreshAuthLink>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-muted py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-foreground">{t.topFreelancersTitle}</h2>
            <p className="mt-2 text-muted-foreground">{t.topFreelancersDescription}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {loading ? (
              <Card className="md:col-span-2 lg:col-span-4"><CardContent className="py-10 text-center text-muted-foreground">{t.loading}</CardContent></Card>
            ) : loadFailed ? (
              <Card className="md:col-span-2 lg:col-span-4"><CardContent className="py-10 text-center text-destructive">{t.loadError}</CardContent></Card>
            ) : providers.length === 0 ? (
              <Card className="md:col-span-2 lg:col-span-4"><CardContent className="py-10 text-center text-muted-foreground">{t.emptyProviders}</CardContent></Card>
            ) : providers.map((provider) => (
              <Link key={provider.id} to={`/freelancers/${provider.id}`} className="block">
                <Card className="cursor-pointer text-center transition-shadow hover:shadow-lg">
                  <CardHeader>
                    <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-full bg-primary/10">
                      <Users className="size-10 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{provider.name}</CardTitle>
                    <CardDescription>{provider.specialty}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      {provider.services} {t.projectsCount}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-primary py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-4xl font-bold">{t.ctaTitle}</h2>
          <p className="mb-8 text-xl text-blue-100">{t.ctaDescription}</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg" variant="secondary" className="px-8 text-lg">
              <FreshAuthLink mode="register">{t.freeAccount}</FreshAuthLink>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/30 bg-transparent px-8 text-lg text-white hover:bg-white/10">
              <Link to={helpPath}>{t.visitHelp}</Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="bg-slate-900 py-12 text-white">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Briefcase className="size-6" />
                <span className="text-xl font-bold">Work Bridge</span>
              </div>
              <p className="text-slate-400">{t.footerDescription}</p>
            </div>
            <div>
              <h3 className="mb-4 font-semibold">{t.quickLinks}</h3>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <FreshAuthLink mode="login" className="hover:text-white">
                    {t.jobs}
                  </FreshAuthLink>
                </li>
                <li>
                  <FreshAuthLink mode="login" className="hover:text-white">
                    {t.projects}
                  </FreshAuthLink>
                </li>
                <li>
                  <FreshAuthLink mode="register" className="hover:text-white">
                    {t.register}
                  </FreshAuthLink>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-semibold">{t.support}</h3>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <Link to={helpPath} className="hover:text-white">
                    {t.help}
                  </Link>
                </li>
                <li>
                  <Link to={termsPath} className="hover:text-white">
                    {t.terms}
                  </Link>
                </li>
                <li>
                  <Link to={privacyPath} className="hover:text-white">
                    {t.privacy}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-semibold">{t.contact}</h3>
              <ul className="space-y-2 text-slate-400">
                <li>Work0bridge@gmail.com</li>
                <li>0958373965</li>
                <li>{t.city}</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-slate-800 pt-8 text-center text-slate-400">
            <p>{t.rights}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
