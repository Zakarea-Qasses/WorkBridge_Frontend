import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  Briefcase,
  Building,
  CheckCircle2,
  DollarSign,
  MapPin,
  Search,
} from 'lucide-react';
import DashboardLayout from '@/app/components/layout';
import { useLanguage } from '@/app/providers/LanguageProvider';
import { getDisplayRelativeTimeLabel } from '@/app/data';
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
import { jobs } from '@/app/data';
import {
  createContentReport,
  getAppliedJobIds,
  getSavedJobIds,
  setAppliedJobIds as persistAppliedJobIds,
  setSavedJobIds as persistSavedJobIds,
} from '@/app/storage';

const JOBS_PER_PAGE = 3;

const locationLabelMap: Record<string, { ar: string; en: string }> = {
  الرياض: { ar: 'الرياض', en: 'Riyadh' },
  جدة: { ar: 'جدة', en: 'Jeddah' },
  الدمام: { ar: 'الدمام', en: 'Dammam' },
  'عن بعد': { ar: 'عن بعد', en: 'Remote' },
};

const jobTypeLabelMap: Record<string, { ar: string; en: string }> = {
  'دوام كامل': { ar: 'دوام كامل', en: 'Full-time' },
  'دوام جزئي': { ar: 'دوام جزئي', en: 'Part-time' },
  'عن بعد': { ar: 'عن بعد', en: 'Remote' },
};

export default function Jobs() {
  const navigate = useNavigate();
  const { isEnglish, language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [appliedJobIds, setAppliedJobIds] = useState<number[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<number[]>([]);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    setAppliedJobIds(getAppliedJobIds());
    setSavedJobIds(getSavedJobIds());
  }, []);

  const filteredJobs = useMemo(
    () =>
      jobs.filter((job) => {
        const normalizedSearch = searchTerm.trim().toLowerCase();
        const matchesSearch =
          normalizedSearch === '' ||
          job.title.toLowerCase().includes(normalizedSearch) ||
          job.company.toLowerCase().includes(normalizedSearch) ||
          job.description.toLowerCase().includes(normalizedSearch) ||
          job.requirements.some((requirement) => requirement.toLowerCase().includes(normalizedSearch));

        const matchesLocation = selectedLocation === 'all' || job.location === selectedLocation;
        const matchesType = selectedType === 'all' || job.type === selectedType;

        return matchesSearch && matchesLocation && matchesType;
      }),
    [searchTerm, selectedLocation, selectedType],
  );

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / JOBS_PER_PAGE));
  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * JOBS_PER_PAGE,
    currentPage * JOBS_PER_PAGE,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedLocation, selectedType]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleApply = (jobId: number) => {
    setAppliedJobIds((current) => {
      const nextIds = current.includes(jobId) ? current : [...current, jobId];
      persistAppliedJobIds(nextIds);
      setStatusMessage(
        current.includes(jobId)
          ? isEnglish
            ? 'This job is already in your applications.'
            : 'هذه الوظيفة موجودة مسبقًا ضمن طلباتك.'
          : isEnglish
            ? 'Your application was submitted successfully. You can track it from My Applications.'
            : 'تم التقدم على الوظيفة بنجاح ويمكنك متابعتها من صفحة طلباتي.',
      );
      return nextIds;
    });
  };

  const handleSave = (jobId: number) => {
    setSavedJobIds((current) => {
      const nextIds = current.includes(jobId)
        ? current.filter((id) => id !== jobId)
        : [...current, jobId];
      persistSavedJobIds(nextIds);
      setStatusMessage(
        current.includes(jobId)
          ? isEnglish
            ? 'The job was removed from saved jobs.'
            : 'تمت إزالة الوظيفة من المحفوظات.'
          : isEnglish
            ? 'The job was saved for later.'
            : 'تم حفظ الوظيفة للرجوع إليها لاحقًا.',
      );
      return nextIds;
    });
  };

  const handleReportJob = (jobTitle: string) => {
    createContentReport({
      targetType: isEnglish ? 'Job post' : 'منشور وظيفة',
      targetLabel: jobTitle,
      reporter: isEnglish ? 'Personal account user' : 'مستخدم الحساب الشخصي',
      description: isEnglish
        ? `A report was submitted for the job "${jobTitle}" for admin review.`
        : `تم إرسال بلاغ على الوظيفة "${jobTitle}" لمراجعته من قبل الأدمن.`,
    });
    setStatusMessage(
      isEnglish
        ? `The report for "${jobTitle}" was sent successfully.`
        : `تم إرسال البلاغ على الوظيفة "${jobTitle}" بنجاح.`,
    );
  };

  const getJobTypeColor = (type: string) => {
    switch (type) {
      case 'دوام كامل':
        return 'bg-green-500';
      case 'دوام جزئي':
        return 'bg-blue-500';
      case 'عن بعد':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const locationOptions = [
    { value: 'all', label: isEnglish ? 'All locations' : 'جميع المواقع' },
    { value: 'الرياض', label: isEnglish ? 'Riyadh' : 'الرياض' },
    { value: 'جدة', label: isEnglish ? 'Jeddah' : 'جدة' },
    { value: 'الدمام', label: isEnglish ? 'Dammam' : 'الدمام' },
    { value: 'عن بعد', label: isEnglish ? 'Remote' : 'عن بعد' },
  ];

  const typeOptions = [
    { value: 'all', label: isEnglish ? 'All types' : 'جميع الأنواع' },
    { value: 'دوام كامل', label: isEnglish ? 'Full-time' : 'دوام كامل' },
    { value: 'دوام جزئي', label: isEnglish ? 'Part-time' : 'دوام جزئي' },
    { value: 'عن بعد', label: isEnglish ? 'Remote' : 'عن بعد' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold">{isEnglish ? 'Available Jobs' : 'الوظائف المتاحة'}</h1>
            <p className="mt-1 text-muted-foreground">
              {isEnglish
                ? 'Browse jobs that suit you, apply to them, or save them for later.'
                : 'تصفح الوظائف المناسبة لك وقدّم عليها أو احفظها للرجوع إليها لاحقًا.'}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Button asChild variant="outline">
              <Link to="/saved-jobs">{isEnglish ? 'Saved jobs' : 'الوظائف المحفوظة'}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/applied-jobs">{isEnglish ? 'Applied jobs' : 'الوظائف التي قدمت عليها'}</Link>
            </Button>
            <Button onClick={() => navigate('/services/create')}>
              {isEnglish ? 'Publish service' : 'نشر خدمة'}
            </Button>
          </div>
        </div>

        {statusMessage && (
          <Card className="border-green-200 bg-green-50 p-3 text-sm text-green-700">
            {statusMessage}
          </Card>
        )}

        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="relative md:col-span-2">
                <Search className="absolute right-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder={isEnglish ? 'Search for a job...' : 'ابحث عن وظيفة...'}
                  className="bg-input-background pr-10"
                />
              </div>

              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="bg-input-background">
                  <SelectValue placeholder={isEnglish ? 'Location' : 'الموقع'} />
                </SelectTrigger>
                <SelectContent>
                  {locationOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="bg-input-background">
                  <SelectValue placeholder={isEnglish ? 'Work type' : 'نوع العمل'} />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground flex-wrap">
          <span>
            {isEnglish ? 'Results count:' : 'عدد النتائج:'} {filteredJobs.length}
          </span>
          <span>
            {isEnglish ? 'Page' : 'الصفحة'} {currentPage} {isEnglish ? 'of' : 'من'} {totalPages}
          </span>
        </div>

        <div className="grid gap-6">
          {paginatedJobs.length > 0 ? (
            paginatedJobs.map((job) => {
              const isApplied = appliedJobIds.includes(job.id);
              const isSaved = savedJobIds.includes(job.id);

              return (
                <Card key={job.id} className="transition-shadow hover:shadow-lg">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                          <Building className="size-8 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="mb-1 flex items-center gap-2 flex-wrap">
                            <CardTitle className="text-xl">{job.title}</CardTitle>
                            {job.verified && (
                              <Badge className="bg-green-500 text-xs">
                                {isEnglish ? 'Verified' : 'موثق'}
                              </Badge>
                            )}
                          </div>
                          <CardDescription className="mb-2 flex items-center gap-2">
                            <Briefcase className="size-4" />
                            {job.company}
                          </CardDescription>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="size-4" />
                              {locationLabelMap[job.location]?.[isEnglish ? 'en' : 'ar'] ?? job.location}
                            </span>
                            <Badge className={getJobTypeColor(job.type)}>
                              {jobTypeLabelMap[job.type]?.[isEnglish ? 'en' : 'ar'] ?? job.type}
                            </Badge>
                            <span className="flex items-center gap-1">
                              <DollarSign className="size-4" />
                              {job.salary}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className="whitespace-nowrap text-xs text-muted-foreground">
                        {getDisplayRelativeTimeLabel(job.postedTime, isEnglish)}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <p className="mb-4 text-muted-foreground">{job.description}</p>
                    <div className="mb-4 flex flex-wrap gap-2">
                      {job.requirements.map((requirement) => (
                        <Badge key={requirement} variant="outline" className="text-xs">
                          {requirement}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <Button onClick={() => handleApply(job.id)} disabled={isApplied} className="gap-2">
                        {isApplied && <CheckCircle2 className="size-4" />}
                        {isApplied
                          ? isEnglish
                            ? 'Applied'
                            : 'تم التقديم'
                          : isEnglish
                            ? 'Apply for the job'
                            : 'التقدم إلى الوظيفة'}
                      </Button>
                      <Button variant={isSaved ? 'default' : 'outline'} onClick={() => handleSave(job.id)}>
                        {isSaved ? (isEnglish ? 'Saved' : 'تم الحفظ') : isEnglish ? 'Save' : 'حفظ'}
                      </Button>
                      <Button variant="outline" onClick={() => handleReportJob(job.title)}>
                        {isEnglish ? 'Report post' : 'إبلاغ عن المنشور'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-lg font-medium">{isEnglish ? 'No matching jobs found' : 'لا توجد وظائف مطابقة'}</p>
                <p className="mt-2 text-muted-foreground">
                  {isEnglish
                    ? 'Try changing the search, location, or work type.'
                    : 'جرّب تغيير البحث أو الموقع أو نوع العمل.'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex items-center justify-center gap-2 flex-wrap">
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
