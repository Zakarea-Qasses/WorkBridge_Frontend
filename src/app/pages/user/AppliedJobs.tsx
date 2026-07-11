import { Link } from 'react-router';
import DashboardLayout from '@/app/components/layout';
import JobApplicationsList from '@/app/components/job-applications/JobApplicationsList';
import { Button } from '@/app/components/ui';
import { useLanguage } from '@/app/providers/LanguageProvider';

export default function AppliedJobs() {
  const { isEnglish, language } = useLanguage();

  return (
    <DashboardLayout>
      <div className="space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              {isEnglish ? 'My Job Applications' : 'تقديماتي على الوظائف'}
            </h1>
          </div>
          <Button asChild>
            <Link to="/jobs">{isEnglish ? 'Browse jobs' : 'تصفح الوظائف'}</Link>
          </Button>
        </div>

        <JobApplicationsList isEnglish={isEnglish} />
      </div>
    </DashboardLayout>
  );
}
