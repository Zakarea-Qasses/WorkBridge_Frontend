import { useMemo, useState } from 'react';
import { CircleHelp } from 'lucide-react';
import DashboardLayout from '@/app/components/layout';
import { useLanguage } from '@/app/providers/LanguageProvider';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/app/components/ui';
import {
  createContentReport,
  getSupportTickets,
  SupportTicket,
  updateSupportTicketStatus,
} from '@/app/storage';

function getCategoryClasses(category: SupportTicket['category']) {
  if (category === 'نزاع') {
    return 'bg-red-100 text-red-700 border-red-200';
  }

  if (category === 'شكوى') {
    return 'bg-amber-100 text-amber-700 border-amber-200';
  }

  return 'bg-blue-100 text-blue-700 border-blue-200';
}

function getTicketStatusClasses(status: SupportTicket['status']) {
  if (status === 'مغلق') {
    return 'bg-green-100 text-green-700 border-green-200';
  }

  if (status === 'قيد المراجعة') {
    return 'bg-amber-100 text-amber-700 border-amber-200';
  }

  return 'bg-slate-100 text-slate-700 border-slate-200';
}

export default function AdminSupport() {
  const { language, isEnglish } = useLanguage();
  const [tickets, setTickets] = useState(getSupportTickets());
  const [feedback, setFeedback] = useState(
    isEnglish
      ? 'All Support Center tickets from the user side appear here. Reports only go to Reports Center, but a ticket can be escalated manually when needed.'
      : 'هنا تظهر كل تذاكر مركز الدعم القادمة من واجهة المستخدم. البلاغات فقط تُرسل إلى مركز التقارير، ويمكن تصعيد التذكرة يدويًا إذا لزم الأمر.',
  );

  const openTickets = useMemo(() => tickets.filter((ticket) => ticket.status !== 'مغلق'), [tickets]);
  const closedTickets = useMemo(() => tickets.filter((ticket) => ticket.status === 'مغلق'), [tickets]);

  const handleStatus = (id: number, status: SupportTicket['status'], message: string) => {
    setTickets(updateSupportTicketStatus(id, status));
    setFeedback(message);
  };

  const handleEscalateToReports = (ticket: SupportTicket) => {
    createContentReport({
      targetType: isEnglish
        ? `Escalated from support - ${ticket.category}`
        : `حالة محولة من الدعم - ${ticket.category}`,
      targetLabel: ticket.subject,
      reporter: isEnglish ? 'Support Center' : 'مركز الدعم',
      description: isEnglish
        ? `The ticket "${ticket.subject}" was escalated from Support Center to Reports Center for deeper review. Original details: ${ticket.description}`
        : `تم تحويل التذكرة "${ticket.subject}" من مركز الدعم إلى مركز التقارير لمراجعة أعمق. التفاصيل الأصلية: ${ticket.description}`,
    });

    setTickets(updateSupportTicketStatus(ticket.id, 'قيد المراجعة'));
    setFeedback(
      isEnglish
        ? `The "${ticket.subject}" ticket was escalated to Reports Center and remains under review in support.`
        : `تم تحويل التذكرة "${ticket.subject}" إلى مركز التقارير، وبقيت حالتها في الدعم قيد المراجعة.`,
    );
  };

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <section>
          <h2 className="text-3xl font-bold">{isEnglish ? 'Support Center tickets' : 'طلبات مركز الدعم'}</h2>
          <p className="mt-2 text-muted-foreground">
            {isEnglish
              ? 'Review support tickets, help requests, complaints, and disputes. This page is for tickets, while reports and violations are handled from Reports Center. Sensitive cases can be escalated manually.'
              : 'راجع تذاكر الدعم وطلبات المساعدة والشكاوى والنزاعات. هذه الصفحة مخصصة للتذاكر، أما البلاغات والمخالفات فتدار من مركز التقارير. عند وجود حالة حساسة يمكنك تحويلها يدويًا.'}
          </p>
        </section>

        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6 text-sm text-primary">{feedback}</CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{isEnglish ? 'Total tickets' : 'إجمالي التذاكر'}</p>
              <p className="mt-1 text-3xl font-bold">{tickets.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{isEnglish ? 'Open' : 'المفتوحة'}</p>
              <p className="mt-1 text-3xl font-bold">{openTickets.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{isEnglish ? 'Closed' : 'المغلقة'}</p>
              <p className="mt-1 text-3xl font-bold">{closedTickets.length}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{isEnglish ? 'Awaiting handling' : 'بانتظار المعالجة'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {openTickets.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  {isEnglish ? 'There are no open tickets right now.' : 'لا توجد تذاكر مفتوحة حاليًا.'}
                </div>
              ) : null}

              {openTickets.map((ticket) => (
                <div key={ticket.id} className="space-y-4 rounded-2xl border border-border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CircleHelp className="size-4 text-primary" />
                        <h3 className="font-semibold">{ticket.subject}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">{ticket.description}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={getCategoryClasses(ticket.category)}>{ticket.category}</Badge>
                      <Badge className={getTicketStatusClasses(ticket.status)}>{ticket.status}</Badge>
                    </div>
                  </div>

                  {ticket.attachments.length > 0 ? (
                    <div className="rounded-xl bg-muted/40 p-3 text-sm">
                      <p className="mb-2 font-medium">{isEnglish ? 'Attachments' : 'المرفقات'}</p>
                      <div className="space-y-1 text-muted-foreground">
                        {ticket.attachments.map((file) => (
                          <p key={`${ticket.id}-${file.name}-${file.size}`}>
                            {file.name} - {(file.size / 1024).toFixed(1)} KB
                          </p>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="text-xs text-muted-foreground">{ticket.createdAt}</span>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleStatus(
                            ticket.id,
                            'قيد المراجعة',
                            isEnglish
                              ? `The "${ticket.subject}" ticket was reviewed and is now under follow-up.`
                              : `تمت مراجعة التذكرة "${ticket.subject}" وهي الآن قيد المتابعة.`,
                          )
                        }
                      >
                        {isEnglish ? 'Start review' : 'بدء المراجعة'}
                      </Button>

                      {ticket.category !== 'دعم' ? (
                        <Button variant="outline" size="sm" onClick={() => handleEscalateToReports(ticket)}>
                          {isEnglish ? 'Escalate to Reports Center' : 'تحويل إلى مركز التقارير'}
                        </Button>
                      ) : null}

                      <Button
                        size="sm"
                        onClick={() =>
                          handleStatus(
                            ticket.id,
                            'مغلق',
                            isEnglish
                              ? `The "${ticket.subject}" ticket was closed.`
                              : `تم إغلاق التذكرة "${ticket.subject}".`,
                          )
                        }
                      >
                        {isEnglish ? 'Close ticket' : 'إغلاق التذكرة'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{isEnglish ? 'Closed tickets' : 'التذاكر المغلقة'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {closedTickets.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  {isEnglish ? 'There are no closed tickets yet.' : 'لا توجد تذاكر مغلقة بعد.'}
                </div>
              ) : null}

              {closedTickets.map((ticket) => (
                <div key={ticket.id} className="space-y-2 rounded-2xl border border-border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">{ticket.subject}</h3>
                      <p className="text-sm text-muted-foreground">{ticket.description}</p>
                    </div>
                    <Badge className={getCategoryClasses(ticket.category)}>{ticket.category}</Badge>
                  </div>

                  {ticket.attachments.length > 0 ? (
                    <div className="rounded-xl bg-muted/40 p-3 text-sm">
                      <p className="mb-2 font-medium">{isEnglish ? 'Attachments' : 'المرفقات'}</p>
                      <div className="space-y-1 text-muted-foreground">
                        {ticket.attachments.map((file) => (
                          <p key={`${ticket.id}-${file.name}-${file.size}`}>{file.name}</p>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{ticket.createdAt}</span>
                    <Badge className={getTicketStatusClasses(ticket.status)}>{ticket.status}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
