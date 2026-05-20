import { useMemo, useState } from 'react';
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
import { getDisplayStatusLabel, getDisplayTypeLabel } from '@/app/data';
import { getUnifiedReports, updateUnifiedReportStatus } from '@/app/storage';

function getSourceLabel(source: string, isEnglish: boolean) {
  return source === 'chat'
    ? isEnglish
      ? 'Chat report'
      : 'بلاغ محادثة'
    : isEnglish
      ? 'Content report'
      : 'بلاغ محتوى';
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'مغلق':
    case 'Closed':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'قيد المراجعة':
    case 'Under Review':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    default:
      return 'bg-blue-100 text-blue-700 border-blue-200';
  }
}

function getReportStatusLabel(status: string, isEnglish: boolean) {
  if (isEnglish) {
    if (status === 'New' || status === 'Under Review' || status === 'Closed') {
      return status;
    }

    if (status === 'جديد') {
      return 'New';
    }

    if (status === 'قيد المراجعة') {
      return 'Under Review';
    }

    if (status === 'مغلق') {
      return 'Closed';
    }

    return getDisplayStatusLabel(status, true);
  }

  switch (status) {
    case 'New':
      return 'جديد';
    case 'Under Review':
      return 'قيد المراجعة';
    case 'Closed':
      return 'مغلق';
    default:
      return status;
  }
}

function getReportTargetTypeLabel(source: string, targetType: string, isEnglish: boolean) {
  if (source === 'chat') {
    return isEnglish ? 'Conversation' : 'محادثة';
  }

  switch (targetType) {
    case 'Project post':
      return isEnglish ? 'Project' : 'مشروع';
    case 'Job post':
      return isEnglish ? 'Job' : 'وظيفة';
    case 'Published service':
      return isEnglish ? 'Service' : 'خدمة';
    case 'Escalated from support - Support':
      return isEnglish ? targetType : 'حالة محولة من الدعم - دعم';
    case 'Escalated from support - Complaint':
      return isEnglish ? targetType : 'حالة محولة من الدعم - شكوى';
    case 'Escalated from support - Dispute':
      return isEnglish ? targetType : 'حالة محولة من الدعم - نزاع';
    case 'منشور مشروع':
    case 'منشور وظيفة':
    case 'خدمة منشورة':
    case 'مشروع':
    case 'وظيفة':
    case 'خدمة':
      return getDisplayTypeLabel(targetType, isEnglish);
    default:
      return targetType;
  }
}

function getReportTargetLabel(source: string, targetLabel: string, isEnglish: boolean) {
  if (source !== 'chat') {
    return targetLabel;
  }

  const match = targetLabel.match(/(\d+)/);
  if (!match) {
    return targetLabel;
  }

  return isEnglish ? `Conversation #${match[1]}` : `محادثة رقم ${match[1]}`;
}

function getReportDescriptionLabel(description: string, isEnglish: boolean) {
  const normalized = description.trim();

  if (isEnglish) {
    switch (normalized) {
      case 'General chat report':
      case 'Abusive behavior or inappropriate content':
      case 'Spam or misleading content':
      case 'Abusive behavior in the conversation':
        return normalized;
      case 'بلاغ عام على المحادثة':
        return 'General chat report';
      case 'إساءة استخدام أو محتوى غير مناسب':
        return 'Abusive behavior or inappropriate content';
      case 'محتوى مزعج أو مزيف':
        return 'Spam or misleading content';
      case 'سلوك مسيء في المحادثة':
        return 'Abusive behavior in the conversation';
      default:
        break;
    }
  } else {
    switch (normalized) {
      case 'General chat report':
        return 'بلاغ عام على المحادثة';
      case 'Abusive behavior or inappropriate content':
        return 'إساءة استخدام أو محتوى غير مناسب';
      case 'Spam or misleading content':
        return 'محتوى مزعج أو مزيف';
      case 'Abusive behavior in the conversation':
        return 'سلوك مسيء في المحادثة';
      default:
        break;
    }
  }

  const projectMatch = normalized.match(/^تم إرسال بلاغ على المشروع "(.+)" لمراجعته من قبل الأدمن\.$/);
  if (projectMatch) {
    return isEnglish
      ? `A report was submitted for the project "${projectMatch[1]}" for admin review.`
      : normalized;
  }

  const jobMatch = normalized.match(/^تم إرسال بلاغ على الوظيفة "(.+)" لمراجعتها من قبل الأدمن\.$/);
  if (jobMatch) {
    return isEnglish
      ? `A report was submitted for the job "${jobMatch[1]}" for admin review.`
      : normalized;
  }

  const serviceMatch = normalized.match(/^تم إرسال بلاغ على الخدمة "(.+)" لمراجعتها من قبل الأدمن\.$/);
  if (serviceMatch) {
    return isEnglish
      ? `A report was submitted for the service "${serviceMatch[1]}" for admin review.`
      : normalized;
  }

  const supportEscalationMatch = normalized.match(
    /^تم تحويل التذكرة "(.+)" من مركز الدعم إلى مركز التقارير لمراجعة أعمق\. التفاصيل الأصلية: (.+)$/s,
  );
  if (supportEscalationMatch) {
    return isEnglish
      ? `The ticket "${supportEscalationMatch[1]}" was escalated from Support Center to Reports Center for deeper review. Original details: ${supportEscalationMatch[2]}`
      : normalized;
  }

  return description;
}

function getReportReporterLabel(reporter: string, isEnglish: boolean) {
  const normalized = reporter.trim();

  if (isEnglish) {
    switch (normalized) {
      case 'Current user':
      case 'Personal account user':
      case 'المستخدم الحالي':
      case 'مستخدم الحساب الشخصي':
        return 'Current user';
      case 'Support Center':
      case 'مركز الدعم':
        return 'Support Center';
      default:
        return reporter;
    }
  }

  switch (normalized) {
    case 'Current user':
    case 'Personal account user':
      return 'المستخدم الحالي';
    case 'Support Center':
      return 'مركز الدعم';
    default:
      return reporter;
  }
}

function isNewStatus(status: string) {
  return status === 'جديد' || status === 'New';
}

function isUnderReviewStatus(status: string) {
  return status === 'قيد المراجعة' || status === 'Under Review';
}

function isClosedStatus(status: string) {
  return status === 'مغلق' || status === 'Closed';
}

export default function AdminReports() {
  const { language, isEnglish } = useLanguage();
  const [reports, setReports] = useState(() => getUnifiedReports());
  const [feedback, setFeedback] = useState(
    isEnglish
      ? 'Reports move through three clear stages: new, under review, then closed after approving the final action.'
      : 'البلاغات تمر بثلاث مراحل واضحة: جديد، ثم قيد المراجعة، ثم مغلق بعد اعتماد الإجراء النهائي.',
  );

  const newReports = useMemo(() => reports.filter((report) => isNewStatus(report.status)), [reports]);
  const reviewingReports = useMemo(
    () => reports.filter((report) => isUnderReviewStatus(report.status)),
    [reports],
  );
  const closedReports = useMemo(
    () => reports.filter((report) => isClosedStatus(report.status)),
    [reports],
  );

  const handleStatusChange = (
    reportId: string,
    status: 'جديد' | 'قيد المراجعة' | 'مغلق',
    label: string,
  ) => {
    setReports(updateUnifiedReportStatus(reportId, status));
    setFeedback(
      status === 'قيد المراجعة'
        ? isEnglish
          ? `The "${label}" report was moved to under review.`
          : `تم نقل البلاغ "${label}" إلى قيد المراجعة.`
        : status === 'مغلق'
          ? isEnglish
            ? `The "${label}" report was closed and the final decision was saved.`
            : `تم إغلاق البلاغ "${label}" وحفظ القرار النهائي.`
          : isEnglish
            ? `The "${label}" report status was updated to ${status}.`
            : `تم تحديث حالة البلاغ "${label}" إلى ${status}.`,
    );
  };

  const renderReportCard = (report: (typeof reports)[number]) => (
    <Card key={report.id}>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>{getReportTargetLabel(report.source, report.targetLabel, isEnglish)}</CardTitle>
            <CardDescription>
              {getSourceLabel(report.source, isEnglish)} -{' '}
              {getReportTargetTypeLabel(report.source, report.targetType, isEnglish)}
            </CardDescription>
          </div>
          <Badge className={getStatusBadge(report.status)}>
            {getReportStatusLabel(report.status, isEnglish)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 text-sm">
        <p>
          {isEnglish ? 'Reporter:' : 'المبلّغ:'}{' '}
          <span className="font-medium">{getReportReporterLabel(report.reporter, isEnglish)}</span>
        </p>
        <p className="text-muted-foreground">
          {getReportDescriptionLabel(report.description, isEnglish)}
        </p>
        <p>
          {isEnglish ? 'Created at:' : 'تاريخ الإنشاء:'}{' '}
          <span className="font-medium">{report.createdAt}</span>
        </p>

        <div className="flex flex-wrap gap-2 pt-2">
          {isNewStatus(report.status) ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStatusChange(report.id, 'قيد المراجعة', report.targetLabel)}
            >
              {isEnglish ? 'Start review' : 'بدء المراجعة'}
            </Button>
          ) : null}

          {isUnderReviewStatus(report.status) ? (
            <Button
              size="sm"
              onClick={() => handleStatusChange(report.id, 'مغلق', report.targetLabel)}
            >
              {isEnglish ? 'Approve action and close report' : 'اعتماد الإجراء وإغلاق البلاغ'}
            </Button>
          ) : null}

          {isClosedStatus(report.status) ? (
            <span className="text-xs text-muted-foreground">
              {isEnglish
                ? 'This report is closed and needs no further action.'
                : 'هذا البلاغ مغلق ولا يحتاج إجراء إضافي.'}
            </span>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <section>
          <h1 className="text-3xl font-bold">{isEnglish ? 'Reports Center' : 'مركز التقارير'}</h1>
          <p className="mt-1 text-muted-foreground">
            {isEnglish
              ? 'This center is only for reports and violations, such as chat reports or reports on projects, services, and jobs. Regular support tickets remain in Support Center.'
              : 'هذا المركز مخصص للبلاغات والمخالفات فقط، مثل بلاغات المحادثات أو بلاغات المشاريع والخدمات والوظائف. تذاكر الدعم العادية بقيت في مركز الدعم.'}
          </p>
        </section>

        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6 text-sm text-primary">{feedback}</CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{isEnglish ? 'New reports' : 'بلاغات جديدة'}</p>
              <p className="mt-1 text-3xl font-bold">{newReports.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                {isEnglish ? 'Under review' : 'قيد المراجعة'}
              </p>
              <p className="mt-1 text-3xl font-bold">{reviewingReports.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{isEnglish ? 'Closed' : 'مغلقة'}</p>
              <p className="mt-1 text-3xl font-bold">{closedReports.length}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{isEnglish ? 'New reports' : 'بلاغات جديدة'}</CardTitle>
            <CardDescription>
              {isEnglish
                ? 'These reports are waiting for the first review step.'
                : 'هذه البلاغات بانتظار بدء المراجعة لأول مرة.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {newReports.length > 0 ? (
              newReports.map(renderReportCard)
            ) : (
              <div className="py-6 text-center text-sm text-muted-foreground">
                {isEnglish ? 'There are no new reports right now.' : 'لا توجد بلاغات جديدة حاليًا.'}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{isEnglish ? 'Reports under review' : 'بلاغات قيد المراجعة'}</CardTitle>
            <CardDescription>
              {isEnglish
                ? 'These reports were reviewed initially and are waiting for final closure.'
                : 'هذه البلاغات تمت مراجعتها مبدئيًا وتنتظر الإغلاق النهائي.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {reviewingReports.length > 0 ? (
              reviewingReports.map(renderReportCard)
            ) : (
              <div className="py-6 text-center text-sm text-muted-foreground">
                {isEnglish
                  ? 'There are no reports under review now.'
                  : 'لا توجد بلاغات قيد المراجعة الآن.'}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{isEnglish ? 'Closed reports' : 'البلاغات المغلقة'}</CardTitle>
            <CardDescription>
              {isEnglish
                ? 'A record of reports that were fully handled.'
                : 'سجل البلاغات التي تم إنهاء معالجتها بالكامل.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {closedReports.length > 0 ? (
              closedReports.map(renderReportCard)
            ) : (
              <div className="py-6 text-center text-sm text-muted-foreground">
                {isEnglish ? 'There are no closed reports yet.' : 'لا توجد بلاغات مغلقة بعد.'}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
