import { getMessagingData, updateReportedMessageStatus } from './messagesStorage';

const CONTENT_REPORTS_STORAGE_KEY = 'workbridge-content-reports';

export interface UnifiedReportItem {
  id: string;
  source: 'chat' | 'content';
  targetType: string;
  targetLabel: string;
  reporter: string;
  status: string;
  description: string;
  createdAt: string;
}

interface ContentReportRecord {
  id: number;
  targetType: string;
  targetLabel: string;
  reporter: string;
  status: 'New' | 'Under Review' | 'Closed';
  description: string;
  createdAt: string;
}

function canUseStorage() {
  return typeof window !== 'undefined';
}

function translateReportText(value: string) {
  const trimmed = value.trim();

  const textMap: Record<string, string> = {
    'المستخدم الحالي': 'Current user',
    'مستخدم الحساب الشخصي': 'Personal account user',
    'مركز الدعم': 'Support Center',
    'بلاغ عام على المحادثة': 'General chat report',
    'إساءة استخدام أو محتوى غير مناسب': 'Abusive behavior or inappropriate content',
    'محتوى مزعج أو مزيف': 'Spam or misleading content',
    'سلوك مسيء في المحادثة': 'Abusive behavior in the conversation',
    'منشور مشروع': 'Project post',
    'منشور وظيفة': 'Job post',
    'خدمة منشورة': 'Published service',
    'مشروع': 'Project',
    'وظيفة': 'Job',
    'خدمة': 'Service',
    'بلاغ محادثة': 'Conversation report',
    'حالة محولة من الدعم - دعم': 'Escalated from support - Support',
    'حالة محولة من الدعم - شكوى': 'Escalated from support - Complaint',
    'حالة محولة من الدعم - نزاع': 'Escalated from support - Dispute',
    'جديد': 'New',
    'قيد المراجعة': 'Under Review',
    'مغلق': 'Closed',
  };

  if (textMap[trimmed]) {
    return textMap[trimmed];
  }

  const conversationMatch = trimmed.match(/^محادثة رقم (\d+)$/);
  if (conversationMatch) {
    return `Conversation #${conversationMatch[1]}`;
  }

  const projectMatch = trimmed.match(/^تم إرسال بلاغ على المشروع "(.+)" لمراجعته من قبل الأدمن\.$/);
  if (projectMatch) {
    return `A report was submitted for the project "${projectMatch[1]}" for admin review.`;
  }

  const jobMatch = trimmed.match(/^تم إرسال بلاغ على الوظيفة "(.+)" لمراجعتها من قبل الأدمن\.$/);
  if (jobMatch) {
    return `A report was submitted for the job "${jobMatch[1]}" for admin review.`;
  }

  const serviceMatch = trimmed.match(/^تم إرسال بلاغ على الخدمة "(.+)" لمراجعتها من قبل الأدمن\.$/);
  if (serviceMatch) {
    return `A report was submitted for the service "${serviceMatch[1]}" for admin review.`;
  }

  const supportEscalationMatch = trimmed.match(
    /^تم تحويل التذكرة "(.+)" من مركز الدعم إلى مركز التقارير لمراجعة أعمق\. التفاصيل الأصلية: (.+)$/s,
  );
  if (supportEscalationMatch) {
    return `The ticket "${supportEscalationMatch[1]}" was escalated from Support Center to Reports Center for deeper review. Original details: ${supportEscalationMatch[2]}`;
  }

  return value;
}

function normalizeContentReport(report: ContentReportRecord): ContentReportRecord {
  return {
    ...report,
    targetType: translateReportText(report.targetType),
    targetLabel: translateReportText(report.targetLabel),
    reporter: translateReportText(report.reporter),
    status: translateReportText(report.status) as ContentReportRecord['status'],
    description: translateReportText(report.description),
  };
}

function persistContentReports(reports: ContentReportRecord[]) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(CONTENT_REPORTS_STORAGE_KEY, JSON.stringify(reports));
}

export function getContentReports() {
  if (!canUseStorage()) {
    return [] as ContentReportRecord[];
  }

  const raw = window.localStorage.getItem(CONTENT_REPORTS_STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as ContentReportRecord[];
    if (!Array.isArray(parsed)) {
      return [];
    }

    const normalized = parsed.map(normalizeContentReport);
    persistContentReports(normalized);
    return normalized;
  } catch {
    return [];
  }
}

export function createContentReport(report: {
  targetType: string;
  targetLabel: string;
  reporter: string;
  description: string;
}) {
  const nextReport: ContentReportRecord = {
    id: Date.now(),
    targetType: translateReportText(report.targetType),
    targetLabel: translateReportText(report.targetLabel),
    reporter: translateReportText(report.reporter),
    status: 'New',
    description: translateReportText(report.description),
    createdAt: new Date().toISOString().slice(0, 10),
  };

  const nextReports = [nextReport, ...getContentReports()];
  persistContentReports(nextReports);
  return nextReport;
}

function updateContentReportStatus(
  reportId: number,
  status: 'New' | 'Under Review' | 'Closed',
) {
  const nextReports = getContentReports().map((report) =>
    report.id === reportId ? { ...report, status } : report,
  );
  persistContentReports(nextReports);
  return nextReports;
}

export function getUnifiedReports() {
  const chatReports: UnifiedReportItem[] = getMessagingData().reports.map((report) => ({
    id: `chat-${report.id}`,
    source: 'chat',
    targetType: 'Conversation report',
    targetLabel: `Conversation #${report.conversationId}`,
    reporter: translateReportText(report.reporter),
    status:
      report.status === 'new'
        ? 'New'
        : report.status === 'reviewed'
          ? 'Under Review'
          : 'Closed',
    description: translateReportText(report.reason),
    createdAt: report.createdAt.slice(0, 10),
  }));

  const contentReports: UnifiedReportItem[] = getContentReports().map((report) => ({
    id: `content-${report.id}`,
    source: 'content',
    targetType: report.targetType,
    targetLabel: report.targetLabel,
    reporter: report.reporter,
    status: report.status,
    description: report.description,
    createdAt: report.createdAt,
  }));

  return [...chatReports, ...contentReports].sort((first, second) =>
    second.createdAt.localeCompare(first.createdAt),
  );
}

export function updateUnifiedReportStatus(
  reportId: string,
  status: 'جديد' | 'قيد المراجعة' | 'مغلق',
) {
  if (reportId.startsWith('chat-')) {
    const chatId = Number(reportId.replace('chat-', ''));
    const chatStatus =
      status === 'مغلق' ? 'resolved' : status === 'قيد المراجعة' ? 'reviewed' : 'new';
    updateReportedMessageStatus(chatId, chatStatus);
    return getUnifiedReports();
  }

  if (reportId.startsWith('content-')) {
    const contentId = Number(reportId.replace('content-', ''));
    const normalizedStatus =
      status === 'مغلق' ? 'Closed' : status === 'قيد المراجعة' ? 'Under Review' : 'New';
    updateContentReportStatus(contentId, normalizedStatus);
    return getUnifiedReports();
  }

  return getUnifiedReports();
}
