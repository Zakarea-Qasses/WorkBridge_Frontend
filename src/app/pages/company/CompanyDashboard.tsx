import { Link } from 'react-router';
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui';
import DashboardLayout from '@/app/components/layout';
import { useLanguage } from '@/app/providers/LanguageProvider';
import {
  companyActivity,
  companyJobs,
  companyProfile,
  companyStats,
  getDisplayStatusLabel,
  getStatusClasses,
  getToneClasses,
} from '@/app/data';

export default function CompanyDashboard() {
  const { language, isEnglish } = useLanguage();

  return (
    <DashboardLayout userType="company">
      <div className="space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <section className="rounded-3xl bg-gradient-to-l from-blue-700 via-blue-800 to-slate-900 p-6 text-white">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold">{companyProfile.name}</h2>
              <p className="mt-2 text-blue-100">
                {isEnglish
                  ? 'Manage jobs, applicants, and the verified account status from one place.'
                  : 'إدارة الوظائف، المتقدمين، وحالة الحساب الموثق من مكان واحد.'}
              </p>
            </div>
            <div className="space-y-2 text-left">
              <Badge className="border-white/20 bg-white/10 px-4 py-1 text-white">
                {getDisplayStatusLabel(companyProfile.verification, isEnglish)}
              </Badge>
              <p className="text-sm text-blue-100">{companyProfile.industry}</p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {companyStats.map((stat) => (
            <Card key={stat.title} className={`border ${getToneClasses(stat.tone)}`}>
              <CardHeader className="pb-3">
                <CardDescription className="text-current/80">{stat.title}</CardDescription>
                <CardTitle className="text-3xl">{stat.value}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-current/80">{stat.change}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{isEnglish ? 'Latest published jobs' : 'أحدث الوظائف المنشورة'}</CardTitle>
                <CardDescription>
                  {isEnglish
                    ? 'Posting status and number of applicants for each job.'
                    : 'حالة الإعلانات وعدد المتقدمين على كل وظيفة.'}
                </CardDescription>
              </div>
              <Button asChild variant="outline">
                <Link to="/company/jobs">{isEnglish ? 'Manage jobs' : 'إدارة الوظائف'}</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {companyJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border p-4"
                >
                  <div>
                    <h3 className="font-semibold">{job.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {job.department} • {job.location}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      {job.applicants} {isEnglish ? 'applicants' : 'متقدم'}
                    </span>
                    <Badge className={getStatusClasses(job.status)}>
                      {getDisplayStatusLabel(job.status, isEnglish)}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{isEnglish ? 'Quick shortcuts' : 'اختصارات سريعة'}</CardTitle>
              <CardDescription>
                {isEnglish
                  ? 'Core daily actions for the hiring team.'
                  : 'المهام اليومية الأساسية لفريق التوظيف.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full">
                <Link to="/company/jobs">
                  {isEnglish ? 'Post or edit a job opening' : 'نشر أو تعديل إعلان وظيفي'}
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link to="/company/applicants">
                  {isEnglish ? 'Review applicants' : 'مراجعة المتقدمين'}
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link to="/company/profile">
                  {isEnglish ? 'Update company profile' : 'تحديث ملف الشركة'}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{isEnglish ? 'Account activity' : 'نشاط الحساب'}</CardTitle>
              <CardDescription>
                {isEnglish
                  ? 'Updates related to hiring, verification, and interviews.'
                  : 'تنبيهات مرتبطة بالتوظيف والتوثيق والمقابلات.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {companyActivity.map((item) => (
                <div key={item.title} className="rounded-2xl border border-border p-4">
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{isEnglish ? 'Company profile' : 'ملف الشركة'}</CardTitle>
              <CardDescription>
                {isEnglish
                  ? 'A summary of the key information visible to candidates.'
                  : 'ملخص المعلومات الأساسية المعروضة للمرشحين.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-muted p-4">
                  <p className="text-sm text-muted-foreground">{isEnglish ? 'Industry' : 'المجال'}</p>
                  <p className="mt-1 font-semibold">{companyProfile.industry}</p>
                </div>
                <div className="rounded-2xl bg-muted p-4">
                  <p className="text-sm text-muted-foreground">
                    {isEnglish ? 'Company size' : 'حجم الشركة'}
                  </p>
                  <p className="mt-1 font-semibold">{companyProfile.size}</p>
                </div>
                <div className="rounded-2xl bg-muted p-4">
                  <p className="text-sm text-muted-foreground">
                    {isEnglish ? 'Headquarters' : 'المقر'}
                  </p>
                  <p className="mt-1 font-semibold">{companyProfile.headquarters}</p>
                </div>
                <div className="rounded-2xl bg-muted p-4">
                  <p className="text-sm text-muted-foreground">
                    {isEnglish ? 'Website' : 'الموقع الإلكتروني'}
                  </p>
                  <p className="mt-1 font-semibold">{companyProfile.website}</p>
                </div>
              </div>
              <p className="text-sm leading-7 text-muted-foreground">{companyProfile.about}</p>
            </CardContent>
          </Card>
        </section>
      </div>
    </DashboardLayout>
  );
}
