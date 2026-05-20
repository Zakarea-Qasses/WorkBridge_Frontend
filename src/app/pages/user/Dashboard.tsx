import { Link } from 'react-router';
import {
  AlertCircle,
  Briefcase,
  CheckCircle2,
  Clock,
  Star,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import DashboardLayout from '@/app/components/layout';
import { PostCompletionReviewsSection } from '@/app/components/shared';
import { useLanguage } from '@/app/providers/LanguageProvider';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui';

export default function Dashboard() {
  const { isEnglish, language } = useLanguage();

  const stats = [
    {
      title: isEnglish ? 'Total Projects' : 'إجمالي المشاريع',
      value: '24',
      icon: Briefcase,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: isEnglish ? 'Active Projects' : 'المشاريع النشطة',
      value: '8',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: isEnglish ? 'Wallet Balance' : 'رصيد المحفظة',
      value: '$15,750',
      icon: Wallet,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: isEnglish ? 'Rating' : 'التقييم',
      value: '4.8',
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
  ];

  const recentProjects = [
    {
      id: 1,
      title: isEnglish ? 'E-commerce Website Development' : 'تطوير موقع تجارة إلكترونية',
      status: 'in-progress',
      statusText: isEnglish ? 'In progress' : 'قيد التنفيذ',
      budget: '$12,000',
      deadline: isEnglish ? 'Within 15 days' : 'خلال 15 يوم',
    },
    {
      id: 2,
      title: isEnglish ? 'Mobile App Design' : 'تصميم تطبيق موبايل',
      status: 'pending',
      statusText: isEnglish ? 'Pending' : 'في الانتظار',
      budget: '$8,500',
      deadline: isEnglish ? 'Within 30 days' : 'خلال 30 يوم',
    },
    {
      id: 3,
      title: isEnglish ? 'Marketing Content Writing' : 'كتابة محتوى تسويقي',
      status: 'completed',
      statusText: isEnglish ? 'Completed' : 'مكتمل',
      budget: '$3,000',
      deadline: isEnglish ? '5 days ago' : 'منذ 5 أيام',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in-progress':
        return 'bg-yellow-500';
      case 'pending':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="size-4" />;
      case 'in-progress':
        return <Clock className="size-4" />;
      default:
        return <AlertCircle className="size-4" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <div className="rounded-lg bg-gradient-to-l from-blue-600 to-blue-800 p-6 text-white">
          <h2 className="mb-2 text-2xl font-bold">
            {isEnglish ? 'Welcome, Ahmad Mohammad' : 'مرحبًا، أحمد محمد'}
          </h2>
          <p className="text-blue-100">
            {isEnglish ? 'Here is a summary of your activity on the platform.' : 'إليك ملخص نشاطك على المنصة'}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm text-muted-foreground">{stat.title}</CardTitle>
                <div className={`${stat.bgColor} rounded-lg p-2`}>
                  <stat.icon className={`size-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{isEnglish ? 'Recent Projects' : 'المشاريع الأخيرة'}</CardTitle>
            <Button asChild variant="outline" size="sm">
              <Link to="/projects">{isEnglish ? 'View all' : 'عرض الكل'}</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-accent/50"
                >
                  <div className="flex-1">
                    <Link to={`/projects/${project.id}`} className="font-semibold hover:text-primary">
                      {project.title}
                    </Link>
                    <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Wallet className="size-4" />
                        {project.budget}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="size-4" />
                        {project.deadline}
                      </span>
                    </div>
                  </div>
                  <Badge className={`${getStatusColor(project.status)} flex items-center gap-1`}>
                    {getStatusIcon(project.status)}
                    {project.statusText}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{isEnglish ? 'Quick Actions' : 'إجراءات سريعة'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild variant="outline" className="w-full justify-start gap-2">
                <Link to="/projects">
                  <Briefcase className="size-5" />
                  {isEnglish ? 'Browse available projects' : 'تصفح المشاريع المتاحة'}
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start gap-2">
                <Link to="/services">
                  <Star className="size-5" />
                  {isEnglish ? 'Browse services' : 'تصفح الخدمات'}
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start gap-2">
                <Link to="/jobs">
                  <TrendingUp className="size-5" />
                  {isEnglish ? 'Find a job' : 'البحث عن وظيفة'}
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start gap-2">
                <Link to="/support">
                  <AlertCircle className="size-5" />
                  {isEnglish ? 'Support center' : 'مركز الدعم'}
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{isEnglish ? 'Monthly Statistics' : 'الإحصائيات الشهرية'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {isEnglish ? 'Completed projects' : 'مشاريع مكتملة'}
                </span>
                <span className="font-bold">6</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{isEnglish ? 'Revenue' : 'الإيرادات'}</span>
                <span className="font-bold text-green-600">$24,500</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{isEnglish ? 'Submitted offers' : 'عروض مرسلة'}</span>
                <span className="font-bold">18</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{isEnglish ? 'Acceptance rate' : 'معدل القبول'}</span>
                <span className="font-bold text-primary">65%</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <PostCompletionReviewsSection />
      </div>
    </DashboardLayout>
  );
}
