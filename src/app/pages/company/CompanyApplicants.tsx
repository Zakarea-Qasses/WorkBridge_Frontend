import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { CheckCircle2, MessageSquare, Users, XCircle } from 'lucide-react';
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
import { getDisplayStatusLabel, getStatusClasses } from '@/app/data';
import { getCompanyApplicants, setCompanyApplicants } from '@/app/storage';

export default function CompanyApplicants() {
  const { language, isEnglish } = useLanguage();
  const navigate = useNavigate();
  const [items, setItems] = useState(() => getCompanyApplicants());
  const [feedback, setFeedback] = useState(
    isEnglish
      ? 'You can accept or reject an applicant, or open a conversation with them.'
      : 'يمكنك قبول المتقدم أو رفضه أو فتح المحادثة معه.',
  );

  const visibleApplicants = useMemo(
    () => items.filter((applicant) => !['مكتمل', 'مغلق'].includes(applicant.status)),
    [items],
  );

  const acceptedCount = useMemo(
    () => items.filter((applicant) => applicant.status === 'مكتمل').length,
    [items],
  );

  const rejectedCount = useMemo(
    () => items.filter((applicant) => applicant.status === 'مغلق').length,
    [items],
  );

  const updateApplicants = (updater: (typeof items) | ((current: typeof items) => typeof items)) => {
    setItems((current) => {
      const nextItems = typeof updater === 'function' ? updater(current) : updater;
      setCompanyApplicants(nextItems);
      return nextItems;
    });
  };

  return (
    <DashboardLayout userType="company">
      <div className="space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <section className="rounded-3xl bg-gradient-to-l from-blue-700 via-blue-800 to-slate-900 p-6 text-white">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold">{isEnglish ? 'Manage applicants' : 'إدارة المتقدمين'}</h2>
              <p className="mt-2 text-blue-100">
                {isEnglish
                  ? 'Review candidates quickly, open a conversation, and make acceptance or rejection decisions while saving the status directly in the interface.'
                  : 'راجع المرشحين بسرعة، افتح المحادثة، واتخذ قرار القبول أو الرفض مع حفظ الحالة مباشرة داخل الواجهة.'}
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 px-4 py-3 text-sm text-white">
              <p className="text-blue-100">{isEnglish ? 'Under review' : 'طلبات قيد المراجعة'}</p>
              <p className="mt-1 text-2xl font-bold">{visibleApplicants.length}</p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-3 pt-6">
              <div className="rounded-2xl bg-blue-100 p-3 text-blue-700">
                <Users className="size-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {isEnglish ? 'Total applicants' : 'إجمالي المتقدمين'}
                </p>
                <p className="text-2xl font-bold">{items.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-3 pt-6">
              <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                <CheckCircle2 className="size-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {isEnglish ? 'Accepted' : 'تم قبولهم'}
                </p>
                <p className="text-2xl font-bold">{acceptedCount}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-3 pt-6">
              <div className="rounded-2xl bg-rose-100 p-3 text-rose-700">
                <XCircle className="size-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {isEnglish ? 'Rejected' : 'تم رفضهم'}
                </p>
                <p className="text-2xl font-bold">{rejectedCount}</p>
              </div>
            </CardContent>
          </Card>
        </section>

        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6 text-sm text-primary">{feedback}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{isEnglish ? 'Applications' : 'طلبات التقديم'}</CardTitle>
            <CardDescription>
              {isEnglish
                ? 'This list shows the applications still waiting for company review.'
                : 'هذه القائمة تعرض الطلبات التي ما زالت بانتظار مراجعة الشركة.'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {visibleApplicants.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                {isEnglish ? 'There are no applications awaiting review right now.' : 'لا توجد طلبات بانتظار المراجعة الآن.'}
              </div>
            ) : null}

            {visibleApplicants.map((applicant) => (
              <div
                key={applicant.id}
                className="grid gap-4 rounded-2xl border border-border p-5 lg:grid-cols-[1.2fr_1fr_0.8fr_0.8fr_auto]"
              >
                <div>
                  <h3 className="font-semibold">{applicant.name}</h3>
                  <p className="text-sm text-muted-foreground">{applicant.role}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {isEnglish ? 'Experience:' : 'الخبرة:'} {applicant.experience}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">
                    {isEnglish ? 'Applied for' : 'التقديم على'}
                  </p>
                  <p className="font-medium">{applicant.appliedFor}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">
                    {isEnglish ? 'Match score' : 'المطابقة'}
                  </p>
                  <p className="font-medium">{applicant.matchScore}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{applicant.stage}</p>
                  <Badge className={getStatusClasses(applicant.status)}>
                    {getDisplayStatusLabel(applicant.status, isEnglish)}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      updateApplicants((current) =>
                        current.map((currentApplicant) =>
                          currentApplicant.id === applicant.id
                            ? { ...currentApplicant, stage: 'تم القبول', status: 'مكتمل' }
                            : currentApplicant,
                        ),
                      );
                      setFeedback(
                        isEnglish
                          ? `${applicant.name} was accepted and the decision was saved locally.`
                          : `تم قبول ${applicant.name} وحفظ القرار محليًا.`,
                      );
                    }}
                  >
                    {isEnglish ? 'Accept' : 'قبول'}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFeedback(
                        isEnglish
                          ? `A company conversation with ${applicant.name} was opened.`
                          : `تم فتح محادثة الشركة مع ${applicant.name}.`,
                      );
                      navigate('/company/messages');
                    }}
                  >
                    <MessageSquare className="ml-1 size-4" />
                    {isEnglish ? 'Message' : 'مراسلة'}
                  </Button>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      updateApplicants((current) =>
                        current.map((currentApplicant) =>
                          currentApplicant.id === applicant.id
                            ? { ...currentApplicant, stage: 'تم الرفض', status: 'مغلق' }
                            : currentApplicant,
                        ),
                      );
                      setFeedback(
                        isEnglish
                          ? `${applicant.name}'s application was rejected and the decision was saved locally.`
                          : `تم رفض طلب ${applicant.name} وحفظ القرار محليًا.`,
                      );
                    }}
                  >
                    {isEnglish ? 'Reject' : 'رفض'}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
