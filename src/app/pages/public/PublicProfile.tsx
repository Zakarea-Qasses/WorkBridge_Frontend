import { Link, useLocation, useParams } from 'react-router';
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Progress } from '@/app/components/ui';
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  CheckCircle2,
  Globe,
  Mail,
  MapPin,
  MessageSquare,
  Star,
  User,
} from 'lucide-react';
import { getAverageRatingFromReviews, getReviewsForProfile } from '@/app/storage';

const freelancers = {
  '1': {
    id: '1',
    name: 'أحمد محمد',
    title: 'مطور واجهات أمامية',
    rating: 4.9,
    completedProjects: 45,
    completionRate: 98,
    responseRate: 95,
    location: 'الرياض، السعودية',
    email: 'ahmed@example.com',
    website: 'ahmed-dev.com',
    joinDate: 'يناير 2024',
    verified: true,
    bio: 'مطور واجهات أمامية متخصص في React وTypeScript مع خبرة عملية في بناء لوحات التحكم ومواقع الشركات ومنصات الخدمات الرقمية.',
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'Responsive Design'],
    highlights: [
      'تصميم وتنفيذ واجهات متجاوبة بالكامل',
      'تحويل التصميم من Figma إلى صفحات عملية',
      'خبرة في لوحات التحكم والأنظمة الإدارية',
    ],
    projects: [
      {
        id: 'p1',
        title: 'لوحة تحكم لإدارة الطلبات',
        category: 'Dashboard',
        year: '2026',
        description: 'تنفيذ واجهة كاملة لإدارة الطلبات والعملاء مع جداول وفلاتر وإحصائيات مرئية.',
        stack: ['React', 'TypeScript', 'Tailwind'],
      },
      {
        id: 'p2',
        title: 'منصة توظيف وعمل حر',
        category: 'Platform UI',
        year: '2025',
        description: 'واجهة متعددة الصفحات تشمل وظائف ومشاريع ورسائل ومحفظة وبروفايلات مستخدمين.',
        stack: ['React', 'Router', 'TypeScript'],
      },
    ],
    reviews: [
      {
        id: 1,
        client: 'وكالة الإبداع الرقمي',
        rating: 4.9,
        comment: 'سريع بالتعديل ويفهم تفاصيل التصميم بدقة.',
        criteria: [],
        date: '2026-02-18',
      },
    ],
  },
  '2': {
    id: '2',
    name: 'فاطمة علي',
    title: 'مصممة جرافيك',
    rating: 5,
    completedProjects: 62,
    completionRate: 99,
    responseRate: 97,
    location: 'جدة، السعودية',
    email: 'fatima@example.com',
    website: 'fatima-design.com',
    joinDate: 'أكتوبر 2023',
    verified: true,
    bio: 'مصممة متخصصة في الهوية البصرية وتصميم واجهات الاستخدام مع خبرة في بناء أنظمة بصرية متكاملة للعلامات التجارية الناشئة.',
    skills: ['Brand Design', 'Figma', 'Illustrator', 'Photoshop', 'Design Systems'],
    highlights: ['بناء هويات بصرية كاملة', 'تصميم أنظمة UI متناسقة', 'إخراج احترافي مناسب للتسليم'],
    projects: [
      {
        id: 'p1',
        title: 'هوية بصرية لشركة ناشئة',
        category: 'Branding',
        year: '2026',
        description: 'تصميم شعار وألوان وخطوط ودليل استخدام كامل للهوية.',
        stack: ['Illustrator', 'Photoshop'],
      },
    ],
    reviews: [
      {
        id: 1,
        client: 'مؤسسة النجاح',
        rating: 5,
        comment: 'تصميم نظيف وفهم ممتاز للهوية.',
        criteria: [],
        date: '2026-02-11',
      },
    ],
  },
  '3': {
    id: '3',
    name: 'خالد سعيد',
    title: 'مطور تطبيقات',
    rating: 4.8,
    completedProjects: 38,
    completionRate: 96,
    responseRate: 92,
    location: 'الدمام، السعودية',
    email: 'khaled@example.com',
    website: 'khaled-apps.dev',
    joinDate: 'مايو 2024',
    verified: true,
    bio: 'مطور تطبيقات يعمل على بناء تجارب استخدام سلسة وتطبيقات عملية مع تركيز على الأداء والتنظيم.',
    skills: ['React Native', 'Firebase', 'TypeScript', 'Mobile UI'],
    highlights: ['تنفيذ تطبيقات إنتاجية', 'سرعة جيدة في التسليم', 'تنظيم ممتاز للواجهات'],
    projects: [
      {
        id: 'p1',
        title: 'تطبيق متابعة مهام',
        category: 'Mobile App',
        year: '2026',
        description: 'تطبيق لإدارة المهام مع شاشات متابعة وتذكيرات وتقارير أسبوعية.',
        stack: ['React Native', 'Firebase'],
      },
    ],
    reviews: [
      {
        id: 1,
        client: 'وكالة التسويق الذكي',
        rating: 4.8,
        comment: 'شغل مضبوط وتجربة استخدام مرتبة.',
        criteria: [],
        date: '2026-02-07',
      },
    ],
  },
  '4': {
    id: '4',
    name: 'نورة حسن',
    title: 'كاتبة محتوى',
    rating: 4.9,
    completedProjects: 71,
    completionRate: 99,
    responseRate: 98,
    location: 'المدينة المنورة، السعودية',
    email: 'noura@example.com',
    website: 'noura-content.com',
    joinDate: 'فبراير 2023',
    verified: true,
    bio: 'كاتبة محتوى متخصصة في المحتوى التسويقي والوصف التجاري وصفحات الهبوط، مع أسلوب واضح يناسب العلامات الحديثة.',
    skills: ['Copywriting', 'SEO', 'Content Strategy', 'Arabic Writing'],
    highlights: ['صياغة محتوى تسويقي مقنع', 'خبرة كبيرة في صفحات الهبوط', 'كتابة مناسبة لمحركات البحث'],
    projects: [
      {
        id: 'p1',
        title: 'محتوى موقع شركة خدمات',
        category: 'Website Content',
        year: '2026',
        description: 'كتابة النصوص الرئيسية لواجهة الشركة وصفحات الخدمات والتواصل.',
        stack: ['SEO', 'Copywriting'],
      },
    ],
    reviews: [
      {
        id: 1,
        client: 'شركة أعمال رقمية',
        rating: 4.9,
        comment: 'نصوص قوية وواضحة وساعدتنا كثير بالتحويل.',
        criteria: [],
        date: '2026-02-01',
      },
    ],
  },
} as const;

export default function PublicProfile() {
  const { id = '1' } = useParams();
  const location = useLocation();
  const freelancer = freelancers[id as keyof typeof freelancers] ?? freelancers['1'];
  const navigationState = (location.state as
    | {
        viewerType?: 'user' | 'company' | 'admin';
        returnTo?: string;
      }
    | undefined) ?? { viewerType: 'user' };
  const viewerType = navigationState.viewerType ?? 'user';
  const backLink =
    navigationState.returnTo ??
    (viewerType === 'company'
      ? '/company/services'
      : viewerType === 'admin'
        ? '/admin/reports'
        : '/dashboard');
  const messagesLink =
    viewerType === 'company'
      ? '/company/messages'
      : viewerType === 'admin'
        ? '/admin/messages'
        : '/messages';
  const topActions =
    viewerType === 'company'
      ? [
          { to: '/company/services', label: 'تصفح الخدمات' },
          { to: '/company/jobs', label: 'إدارة الوظائف' },
        ]
      : viewerType === 'admin'
        ? [
            { to: '/admin/reports', label: 'مركز التقارير' },
            { to: '/admin/users', label: 'إدارة المستخدمين' },
          ]
        : [
            { to: '/projects', label: 'استعراض المشاريع' },
            { to: '/jobs', label: 'استعراض الوظائف' },
          ];

  const dynamicReviews = getReviewsForProfile(freelancer.name).map((review) => ({
    id: review.id,
    client: review.reviewerName,
    rating: review.rating,
    comment: review.comment,
    criteria: review.criteria,
    date: review.date,
  }));

  const reviews = [...dynamicReviews, ...freelancer.reviews].sort((first, second) =>
    second.date.localeCompare(first.date),
  );
  const visibleRating = getAverageRatingFromReviews(reviews, freelancer.rating);

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      <header className="sticky top-0 z-20 border-b border-border bg-white">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center gap-2 font-bold text-primary">
            <Briefcase className="size-7" />
            <span>Work Bridge</span>
          </Link>
          <div className="flex items-center gap-3">
            {topActions.map((action) => (
              <Button key={action.to} asChild variant="outline">
                <Link to={action.to}>{action.label}</Link>
              </Button>
            ))}
          </div>
        </div>
      </header>

      <main className="container mx-auto space-y-6 px-4 py-8">
        <div className="flex items-center justify-between">
          <Link
            to={backLink}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            {viewerType === 'company'
              ? 'العودة إلى واجهات الشركة'
              : viewerType === 'admin'
                ? 'العودة إلى واجهات الأدمن'
                : 'العودة إلى الرئيسية'}
          </Link>
          {freelancer.verified && (
            <Badge className="bg-green-500">
              <CheckCircle2 className="ml-1 size-3" />
              موثق
            </Badge>
          )}
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-6 lg:flex-row">
              <div className="flex size-28 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <User className="size-14 text-primary" />
              </div>
              <div className="flex-1 space-y-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h1 className="text-3xl font-bold">{freelancer.name}</h1>
                    <p className="mt-1 text-xl text-muted-foreground">{freelancer.title}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="size-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{visibleRating}</span>
                      </div>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">{reviews.length} تقييم</span>
                    </div>
                  </div>
                  <Button asChild className="gap-2">
                    <Link to={messagesLink} state={{ viewerType, returnTo: backLink }}>
                      <MessageSquare className="size-4" />
                      تواصل معه
                    </Link>
                  </Button>
                </div>

                <div className="grid gap-4 text-sm text-muted-foreground md:grid-cols-2 lg:grid-cols-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="size-4" />
                    <span>{freelancer.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="size-4" />
                    <span>{freelancer.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="size-4" />
                    <span>{freelancer.website}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="size-4" />
                    <span>عضو منذ {freelancer.joinDate}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>نبذة عنه</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="leading-8 text-muted-foreground">{freelancer.bio}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>المشاريع التي عمل عليها</CardTitle>
                <CardDescription>بعض الأعمال والمشاريع المكتملة التي تبرز خبرته</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {freelancer.projects.map((project) => (
                  <div key={project.id} className="rounded-xl border border-border bg-white p-4">
                    <div className="mb-3 flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-lg">{project.title}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">{project.description}</p>
                      </div>
                      <Badge variant="secondary">{project.category}</Badge>
                    </div>
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex flex-wrap gap-2">
                        {project.stack.map((item) => (
                          <Badge key={item} variant="outline">
                            {item}
                          </Badge>
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">{project.year}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>آراء العملاء</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="rounded-xl border border-border p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="font-semibold">{review.client}</h4>
                      <div className="flex items-center gap-1">
                        <Star className="size-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{review.rating}</span>
                      </div>
                    </div>
                    <p className="text-muted-foreground">{review.comment}</p>
                    {review.criteria.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {review.criteria.map((criterion) => (
                          <Badge key={`${review.id}-${criterion.label}`} variant="outline">
                            {criterion.label}: {criterion.value}/5
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>المهارات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {freelancer.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>نقاط القوة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {freelancer.highlights.map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-1 size-4 shrink-0 text-green-600" />
                    <p className="text-sm text-muted-foreground">{item}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>إحصائيات الأداء</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">معدل الإنجاز</span>
                    <span className="font-semibold">{freelancer.completionRate}%</span>
                  </div>
                  <Progress value={freelancer.completionRate} className="h-2" />
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">سرعة الاستجابة</span>
                    <span className="font-semibold">{freelancer.responseRate}%</span>
                  </div>
                  <Progress value={freelancer.responseRate} className="h-2" />
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="rounded-xl bg-muted p-4 text-center">
                    <div className="text-2xl font-bold">{freelancer.completedProjects}</div>
                    <div className="text-sm text-muted-foreground">مشروع مكتمل</div>
                  </div>
                  <div className="rounded-xl bg-muted p-4 text-center">
                    <div className="text-2xl font-bold">{visibleRating}</div>
                    <div className="text-sm text-muted-foreground">التقييم العام</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}







