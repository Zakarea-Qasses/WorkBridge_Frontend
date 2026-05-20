import { Link } from 'react-router';
import { AlertTriangle, Building2, FileText, ShieldCheck, Users, Wallet } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
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
} from '@/app/components/ui';
import {
  adminProjects,
  adminStats,
  companyVerificationQueue,
  disputes,
  getDisplayStatusLabel,
  getDisplayTypeLabel,
  getStatusClasses,
  getToneClasses,
} from '@/app/data';

const revenueData = [
  { monthAr: 'يناير', monthEn: 'Jan', revenue: 350000 },
  { monthAr: 'فبراير', monthEn: 'Feb', revenue: 487500 },
  { monthAr: 'مارس', monthEn: 'Mar', revenue: 420000 },
  { monthAr: 'أبريل', monthEn: 'Apr', revenue: 510000 },
  { monthAr: 'مايو', monthEn: 'May', revenue: 490000 },
  { monthAr: 'يونيو', monthEn: 'Jun', revenue: 560000 },
];

const userGrowthData = [
  { monthAr: 'يناير', monthEn: 'Jan', users: 8500 },
  { monthAr: 'فبراير', monthEn: 'Feb', users: 9200 },
  { monthAr: 'مارس', monthEn: 'Mar', users: 10100 },
  { monthAr: 'أبريل', monthEn: 'Apr', users: 11000 },
  { monthAr: 'مايو', monthEn: 'May', users: 11800 },
  { monthAr: 'يونيو', monthEn: 'Jun', users: 12543 },
];

function formatRevenueTick(value: number) {
  return `${Math.round(value / 1000)}k`;
}

function formatUsersTick(value: number) {
  return `${(value / 1000).toFixed(1)}k`;
}

const sharedAxisStyle = { fontSize: 12 };

export default function AdminDashboard() {
  const { language, isEnglish } = useLanguage();

  const quickLinks = [
    {
      title: isEnglish ? 'User management' : 'إدارة المستخدمين',
      description: isEnglish
        ? 'Review pending accounts, bans, and general verification states.'
        : 'مراجعة الحسابات المعلقة والحظر والتوثيق العام للحسابات.',
      icon: Users,
      to: '/admin/users',
    },
    {
      title: isEnglish ? 'Company verification' : 'توثيق الشركات',
      description: isEnglish
        ? 'Follow company requests and approve or reject documents.'
        : 'متابعة طلبات الشركات وقبول أو رفض المستندات.',
      icon: Building2,
      to: '/admin/verification',
    },
    {
      title: isEnglish ? 'Finance management' : 'الإدارة المالية',
      description: isEnglish
        ? 'Monitor profits, commissions, and pending withdrawals.'
        : 'مراقبة الأرباح والعمولات والسحوبات المعلقة.',
      icon: Wallet,
      to: '/admin/finance',
    },
  ];

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <section className="rounded-3xl bg-gradient-to-l from-slate-900 via-blue-900 to-blue-700 p-6 text-white">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold">
                {isEnglish ? 'Admin dashboard' : 'لوحة تحكم الأدمن'}
              </h2>
              <p className="mt-2 text-blue-100">
                {isEnglish
                  ? 'Monitor accounts, projects, disputes, and platform financial performance from one place.'
                  : 'متابعة الحسابات والمشاريع والنزاعات والأداء المالي للمنصة من مكان واحد.'}
              </p>
            </div>
            <Badge className="border-white/20 bg-white/10 px-4 py-1 text-white">
              {isEnglish ? 'Last update: March 29, 2026' : 'آخر تحديث: 29 مارس 2026'}
            </Badge>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {adminStats.map((stat) => (
            <Card key={stat.title} className={`border ${getToneClasses(stat.tone)}`}>
              <CardHeader className="pb-3">
                <CardDescription className="text-current/80">{stat.title}</CardDescription>
                <CardTitle className="text-3xl">{stat.value}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-current/80">
                  {stat.change} {isEnglish ? 'compared with last month' : 'مقارنة بالشهر الماضي'}
                </p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>{isEnglish ? 'Monthly revenue' : 'الإيرادات الشهرية'}</CardTitle>
              <CardDescription>
                {isEnglish ? 'Platform returns over the last 6 months.' : 'عائدات المنصة خلال آخر 6 أشهر.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-5 sm:px-6">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={revenueData} margin={{ top: 12, right: 28, left: 52, bottom: 12 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey={isEnglish ? 'monthEn' : 'monthAr'}
                    tickMargin={14}
                    minTickGap={20}
                    tick={sharedAxisStyle}
                  />
                  <YAxis
                    width={96}
                    tickMargin={20}
                    tickFormatter={formatRevenueTick}
                    axisLine={false}
                    tickLine={false}
                    tick={sharedAxisStyle}
                  />
                  <Tooltip formatter={(value: number | string) => `$${Number(value).toLocaleString()}`} />
                  <Legend wrapperStyle={{ paddingTop: 14 }} />
                  <Bar
                    dataKey="revenue"
                    name={isEnglish ? 'Revenue' : 'الإيرادات'}
                    fill="#1E3A8A"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>{isEnglish ? 'User growth' : 'نمو المستخدمين'}</CardTitle>
              <CardDescription>
                {isEnglish
                  ? 'Cumulative growth in registered users.'
                  : 'التطور التراكمي لعدد المستخدمين المسجلين.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-5 sm:px-6">
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={userGrowthData} margin={{ top: 12, right: 28, left: 52, bottom: 12 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey={isEnglish ? 'monthEn' : 'monthAr'}
                    tickMargin={14}
                    minTickGap={20}
                    tick={sharedAxisStyle}
                  />
                  <YAxis
                    width={96}
                    tickMargin={20}
                    tickFormatter={formatUsersTick}
                    axisLine={false}
                    tickLine={false}
                    tick={sharedAxisStyle}
                  />
                  <Tooltip formatter={(value: number | string) => Number(value).toLocaleString()} />
                  <Legend wrapperStyle={{ paddingTop: 14 }} />
                  <Line
                    type="monotone"
                    dataKey="users"
                    name={isEnglish ? 'Users' : 'المستخدمون'}
                    stroke="#2563eb"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{isEnglish ? 'Alerts requiring action' : 'تنبيهات تحتاج تدخلاً'}</CardTitle>
                <CardDescription>
                  {isEnglish
                    ? 'The most important open platform-level cases.'
                    : 'أهم القضايا المفتوحة على مستوى المنصة.'}
                </CardDescription>
              </div>
              <Button asChild variant="outline">
                <Link to="/admin/disputes">{isEnglish ? 'Open disputes' : 'فتح النزاعات'}</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {disputes.slice(0, 3).map((dispute) => (
                <div
                  key={dispute.id}
                  className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-border p-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="size-4 text-amber-600" />
                      <h3 className="font-semibold">{dispute.subject}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{dispute.parties}</p>
                    <p className="text-sm text-muted-foreground">
                      {isEnglish ? 'Amount:' : 'القيمة:'}{' '}
                      <span className="font-medium text-foreground">{dispute.amount}</span>
                    </p>
                  </div>
                  <Badge className={getStatusClasses(dispute.status)}>
                    {getDisplayStatusLabel(dispute.status, isEnglish)}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{isEnglish ? 'Quick links' : 'روابط سريعة'}</CardTitle>
              <CardDescription>
                {isEnglish
                  ? 'The most frequently used sections by the admin team.'
                  : 'أكثر الأقسام استخدامًا من قبل فريق الإدارة.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickLinks.map((link) => (
                <Link key={link.title} to={link.to} className="block">
                  <div className="rounded-2xl border border-border p-4 transition-colors hover:bg-accent/40">
                    <div className="mb-2 flex items-center gap-3">
                      <div className="rounded-xl bg-primary/10 p-2">
                        <link.icon className="size-5 text-primary" />
                      </div>
                      <h3 className="font-semibold">{link.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{link.description}</p>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{isEnglish ? 'Company verification requests' : 'طلبات توثيق الشركات'}</CardTitle>
                <CardDescription>
                  {isEnglish
                    ? 'Latest companies waiting for an administrative decision.'
                    : 'أحدث الشركات التي تحتاج قرارًا إداريًا.'}
                </CardDescription>
              </div>
              <Button asChild variant="outline">
                <Link to="/admin/verification">{isEnglish ? 'View all' : 'عرض الكل'}</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {companyVerificationQueue.map((company) => (
                <div
                  key={company.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border p-4"
                >
                  <div>
                    <h3 className="font-semibold">{company.company}</h3>
                    <p className="text-sm text-muted-foreground">
                      {company.sector} • {company.contact}
                    </p>
                  </div>
                  <Badge className={getStatusClasses(company.status)}>
                    {getDisplayStatusLabel(company.status, isEnglish)}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{isEnglish ? 'Content needing review' : 'محتوى يحتاج مراجعة'}</CardTitle>
                <CardDescription>
                  {isEnglish
                    ? 'Jobs, services, and projects that were reported or are awaiting approval.'
                    : 'وظائف وخدمات ومشاريع تم الإبلاغ عنها أو تنتظر اعتمادًا.'}
                </CardDescription>
              </div>
              <Button asChild variant="outline">
                <Link to="/admin/projects">{isEnglish ? 'Manage content' : 'إدارة المحتوى'}</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {adminProjects.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border p-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <FileText className="size-4 text-primary" />
                      <h3 className="font-semibold">{item.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {getDisplayTypeLabel(item.type, isEnglish)}
                    </p>
                  </div>
                  <Badge className={getStatusClasses(item.status)}>
                    {getDisplayStatusLabel(item.status, isEnglish)}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="size-5 text-primary" />
                <CardTitle>{isEnglish ? 'Accounts' : 'الحسابات'}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {isEnglish
                ? 'Manage permissions for job seekers, freelancers, clients, companies, and admins.'
                : 'إدارة صلاحيات الباحثين عن عمل والمستقلين والعملاء والشركات والأدمن.'}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-primary" />
                <CardTitle>{isEnglish ? 'Disputes' : 'النزاعات'}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {isEnglish
                ? 'Follow reports and open disputes and record documented final decisions.'
                : 'متابعة البلاغات والنزاعات المفتوحة واتخاذ قرارات نهائية موثقة.'}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Wallet className="size-5 text-primary" />
                <CardTitle>{isEnglish ? 'Commissions and profits' : 'العمولات والأرباح'}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {isEnglish
                ? 'View profit indicators, reserved funds, and withdrawal requests awaiting review.'
                : 'عرض مؤشرات الأرباح والمبالغ المحجوزة وطلبات السحب قيد المراجعة.'}
            </CardContent>
          </Card>
        </section>
      </div>
    </DashboardLayout>
  );
}
