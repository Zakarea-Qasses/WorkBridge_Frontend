import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import {
  CheckCircle2,
  Clock,
  FileText,
  Star,
  User,
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
  Label,
  Separator,
  Textarea,
} from '@/app/components/ui';
import {
  getDisplayCategoryLabel,
  getDisplayDurationLabel,
  getDisplayRelativeTimeLabel,
} from '@/app/data';
import { getProjects } from '@/app/storage';

function normalizeDaysInput(value: string) {
  return value.replace(/[^\d]/g, '');
}

function formatDaysLabel(value: string, isEnglish: boolean) {
  const digits = normalizeDaysInput(value);
  if (!digits) {
    return '';
  }

  return `${digits} ${digits === '1' ? (isEnglish ? 'day' : 'يوم') : isEnglish ? 'days' : 'أيام'}`;
}

function buildRequirements(skills: string[], isEnglish: boolean) {
  return [
    isEnglish
      ? 'Commitment to a clear plan and regular updates during execution.'
      : 'الالتزام بخطة واضحة وتحديثات منتظمة خلال التنفيذ.',
    isEnglish
      ? 'Provide similar samples or previous work when needed.'
      : 'تقديم نماذج أو أعمال سابقة مشابهة عند الحاجة.',
    ...skills.map((skill) => (isEnglish ? `Strong command of ${skill}.` : `إتقان ${skill}.`)),
  ];
}

function buildDeliverables(title: string, isEnglish: boolean) {
  return [
    isEnglish
      ? `Full implementation of the requirements for "${title}".`
      : `تنفيذ كامل لمتطلبات مشروع "${title}".`,
    isEnglish
      ? 'Organized final files ready for review.'
      : 'ملفات العمل النهائية بشكل منظم وقابل للمراجعة.',
    isEnglish
      ? 'Delivery of all agreed outputs within the planned duration.'
      : 'تسليم واضح للمخرجات المتفق عليها ضمن المدة المحددة.',
  ];
}

export default function ProjectDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isEnglish, language } = useLanguage();
  const [feedback, setFeedback] = useState(
    isEnglish
      ? 'The project is still open to receive offers, and you can submit yours directly from the form below.'
      : 'المشروع ما زال مفتوحًا لاستقبال العروض، ويمكنك إرسال عرضك مباشرة من النموذج أدناه.',
  );
  const [proposalForm, setProposalForm] = useState({
    bid: '',
    duration: '',
    proposal: '',
  });

  const project = useMemo(() => {
    const projectId = Number(id);
    if (Number.isNaN(projectId)) {
      return null;
    }

    return getProjects().find((item) => item.id === projectId) ?? null;
  }, [id]);

  const requirements = useMemo(() => (project ? buildRequirements(project.skills, isEnglish) : []), [project, isEnglish]);
  const deliverables = useMemo(() => (project ? buildDeliverables(project.title, isEnglish) : []), [project, isEnglish]);

  const handleSubmitProposal = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!proposalForm.bid || !proposalForm.duration || !proposalForm.proposal.trim()) {
      setFeedback(isEnglish ? 'Complete all proposal fields before sending.' : 'أكملي جميع حقول العرض قبل الإرسال.');
      return;
    }

    setFeedback(
      isEnglish
        ? 'The proposal was sent successfully. It will appear to the project owner in the incoming offers list.'
        : 'تم إرسال العرض بنجاح. سيظهر لصاحب المشروع ضمن قائمة العروض الواردة.',
    );
    setProposalForm({ bid: '', duration: '', proposal: '' });
  };

  const handleProposalDurationChange = (value: string) => {
    const normalizedValue = normalizeDaysInput(value);

    if (!normalizedValue) {
      setProposalForm((current) => ({ ...current, duration: '' }));
      return;
    }

    if (Number(normalizedValue) === 0) {
      setProposalForm((current) => ({ ...current, duration: '' }));
      setFeedback(isEnglish ? 'You cannot enter 0 in execution duration.' : 'لا يمكن إدخال 0 في مدة التنفيذ.');
      return;
    }

    setProposalForm((current) => ({
      ...current,
      duration: String(Number(normalizedValue)),
    }));
  };

  if (!project) {
    return (
      <DashboardLayout>
        <div className="space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/projects" className="hover:text-primary">
              {isEnglish ? 'Projects' : 'المشاريع'}
            </Link>
            <span>/</span>
            <span className="text-foreground">{isEnglish ? 'Project Details' : 'تفاصيل المشروع'}</span>
          </div>

          <Card>
            <CardContent className="space-y-4 py-10 text-center">
              <p className="text-lg font-semibold">{isEnglish ? 'Project Not Found' : 'المشروع غير موجود'}</p>
              <p className="text-sm text-muted-foreground">
                {isEnglish ? 'The link may be invalid, or the project was removed from the list.' : 'قد يكون الرابط غير صحيح أو تم حذف المشروع من القائمة.'}
              </p>
              <Button asChild className="mx-auto w-fit">
                <Link to="/projects">{isEnglish ? 'Back to Projects' : 'العودة إلى المشاريع'}</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/projects" className="hover:text-primary">
            {isEnglish ? 'Projects' : 'المشاريع'}
          </Link>
          <span>/</span>
          <span className="text-foreground">{isEnglish ? 'Project Details' : 'تفاصيل المشروع'}</span>
        </div>

        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6 text-sm text-primary">{feedback}</CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <CardTitle className="text-2xl">{project.title}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <Badge variant="secondary">
                        {getDisplayCategoryLabel(project.category, isEnglish)}
                      </Badge>
                      <span>{getDisplayRelativeTimeLabel(project.postedTime, isEnglish)}</span>
                    </div>
                  </div>
                  <Badge className="bg-emerald-500">{isEnglish ? 'Open for Offers' : 'مفتوح لاستقبال العروض'}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="mb-2 font-semibold">{isEnglish ? 'Project Description' : 'وصف المشروع'}</h3>
                  <p className="leading-relaxed text-muted-foreground">{project.description}</p>
                </div>

                <Separator />

                <div>
                  <h3 className="mb-3 font-semibold">{isEnglish ? 'Required Skills' : 'المهارات المطلوبة'}</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.skills.map((skill) => (
                      <Badge key={skill} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="mb-3 font-semibold">{isEnglish ? 'Requirements' : 'المتطلبات'}</h3>
                  <ul className="space-y-2">
                    {requirements.map((requirement) => (
                      <li key={requirement} className="flex items-start gap-2 text-muted-foreground">
                        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-green-500" />
                        <span>{requirement}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Separator />

                <div>
                  <h3 className="mb-3 font-semibold">{isEnglish ? 'Expected Deliverables' : 'المخرجات المطلوبة'}</h3>
                  <ul className="space-y-2">
                    {deliverables.map((deliverable) => (
                      <li key={deliverable} className="flex items-start gap-2 text-muted-foreground">
                        <FileText className="mt-0.5 size-5 shrink-0 text-primary" />
                        <span>{deliverable}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{isEnglish ? 'Submit Proposal' : 'تقديم عرض'}</CardTitle>
                <CardDescription>
                  {isEnglish
                    ? 'If the project suits you, fill in the following details then submit your offer.'
                    : 'إذا كان المشروع مناسبًا لك، املئي التفاصيل التالية ثم اضحطي على زر إرسال العرض.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleSubmitProposal}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="bid">{isEnglish ? 'Bid Value ($)' : 'قيمة العرض ($)'}</Label>
                      <Input
                        id="bid"
                        type="number"
                        value={proposalForm.bid}
                        onChange={(event) =>
                          setProposalForm((current) => ({ ...current, bid: event.target.value }))
                        }
                        placeholder="15000"
                        className="bg-input-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration">{isEnglish ? 'Execution Duration' : 'مدة التنفيذ'}</Label>
                      <Input
                        id="duration"
                        type="text"
                        value={proposalForm.duration}
                        onBlur={() =>
                          setProposalForm((current) => ({
                            ...current,
                            duration: formatDaysLabel(current.duration, isEnglish),
                          }))
                        }
                        onChange={(event) => handleProposalDurationChange(event.target.value)}
                        placeholder="7"
                        className="bg-input-background"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="proposal">{isEnglish ? 'Proposal Details' : 'تفاصيل العرض'}</Label>
                    <Textarea
                      id="proposal"
                      rows={6}
                      value={proposalForm.proposal}
                      onChange={(event) =>
                        setProposalForm((current) => ({ ...current, proposal: event.target.value }))
                      }
                      placeholder={isEnglish ? 'Write your offer details here...' : 'اكتبي تفاصيل عرضك هنا...'}
                      className="resize-none bg-input-background"
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    {isEnglish ? 'Send Proposal' : 'إرسال العرض'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{isEnglish ? 'Project Information' : 'معلومات المشروع'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{isEnglish ? 'Budget' : 'الميزانية'}</span>
                  <span className="font-bold text-primary">{project.budget}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{isEnglish ? 'Expected Duration' : 'المدة المتوقعة'}</span>
                  <span className="font-semibold">{getDisplayDurationLabel(project.duration, isEnglish)}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{isEnglish ? 'Current Offers' : 'العروض الحالية'}</span>
                  <span className="font-semibold">{project.proposals} {isEnglish ? 'offers' : 'عرض'}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{isEnglish ? 'Status' : 'الحالة'}</span>
                  <Badge className="bg-emerald-500">{isEnglish ? 'Open' : 'مفتوح'}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{isEnglish ? 'Client Information' : 'معلومات العميل'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                    <User className="size-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{project.client}</h4>
                      <Badge className="bg-green-500 text-xs">{isEnglish ? 'Verified' : 'موثق'}</Badge>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Star className="size-4 fill-yellow-400 text-yellow-400" />
                      <span>4.8</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{isEnglish ? 'Published Projects' : 'عدد المشاريع المنشورة'}</span>
                    <span className="font-semibold">12</span>
                  </div>
                </div>

                <Button className="w-full" onClick={() => navigate('/messages')}>
                  {isEnglish ? 'Send Message' : 'إرسال رسالة'}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="size-5 text-primary" />
                  {isEnglish ? 'How to Send an Offer?' : 'كيف يتم إرسال العرض؟'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>
                  {isEnglish
                    ? 'Enter the offer value and proposed duration, then write how you will execute the project.'
                    : 'أدخلي قيمة العرض والمدة المقترحة ثم اكتبي تفاصيل تنفيذك للمشروع.'}
                </p>
                <p>
                  {isEnglish
                    ? 'After pressing "Send Proposal", the offer reaches the project owner for review.'
                    : 'بعد الضغط على زر "إرسال العرض" يصل العرض إلى صاحب المشروع ليقوم بمراجعته.'}
                </p>
                <p>
                  {isEnglish
                    ? 'Only when your offer is accepted does the project move later to execution.'
                    : 'عند قبول عرضك فقط ينتقل المشروع لاحقًا إلى حالة التنفيذ.'}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
