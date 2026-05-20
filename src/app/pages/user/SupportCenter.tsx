import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@/app/components/ui';
import {
  createSupportTicket,
  getSupportTickets,
  SupportAttachment,
  SupportTicket,
} from '@/app/storage';

function getCategoryClasses(category: SupportTicket['category']) {
  if (category === 'Dispute') {
    return 'bg-red-100 text-red-700 border-red-200';
  }

  if (category === 'Complaint') {
    return 'bg-amber-100 text-amber-700 border-amber-200';
  }

  return 'bg-blue-100 text-blue-700 border-blue-200';
}

function getCategoryLabel(category: SupportTicket['category'], isEnglish: boolean) {
  if (isEnglish) {
    return category;
  }

  switch (category) {
    case 'Support':
      return 'دعم';
    case 'Complaint':
      return 'شكوى';
    case 'Dispute':
      return 'نزاع';
    default:
      return category;
  }
}

function getStatusClasses(status: SupportTicket['status']) {
  if (status === 'Closed') {
    return 'bg-green-100 text-green-700 border-green-200';
  }

  if (status === 'Under Review') {
    return 'bg-amber-100 text-amber-700 border-amber-200';
  }

  return 'bg-slate-100 text-slate-700 border-slate-200';
}

function getStatusLabel(status: SupportTicket['status'], isEnglish: boolean) {
  if (isEnglish) {
    return status;
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

function getStatusText(status: SupportTicket['status'], isEnglish: boolean) {
  if (status === 'Under Review') {
    return isEnglish ? 'The support team is reviewing your request now.' : 'فريق الدعم يراجع طلبك الآن.';
  }

  if (status === 'Closed') {
    return isEnglish ? 'The request was handled and the ticket was closed.' : 'تمت معالجة الطلب وإغلاق التذكرة.';
  }

  return isEnglish ? 'The request was received and is waiting for review to start.' : 'تم استلام الطلب وهو بانتظار بدء المراجعة.';
}

export default function SupportCenter() {
  const { isEnglish, language } = useLanguage();
  const [tickets, setTickets] = useState(getSupportTickets());
  const [form, setForm] = useState({
    subject: '',
    category: 'Support' as SupportTicket['category'],
    description: '',
  });
  const [attachments, setAttachments] = useState<SupportAttachment[]>([]);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const syncTickets = () => setTickets(getSupportTickets());

    syncTickets();
    window.addEventListener('focus', syncTickets);
    document.addEventListener('visibilitychange', syncTickets);

    return () => {
      window.removeEventListener('focus', syncTickets);
      document.removeEventListener('visibilitychange', syncTickets);
    };
  }, []);

  const latestTicket = useMemo(() => tickets[0], [tickets]);

  const handleFilesChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    const mappedFiles: SupportAttachment[] = files.map((file) => ({
      name: file.name,
      type: file.type || 'unknown',
      size: file.size,
    }));
    setAttachments(mappedFiles);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.subject || !form.description) {
      setFeedback(isEnglish ? 'Enter the subject and description before sending.' : 'أدخل عنوان الرسالة ووصفها قبل الإرسال.');
      return;
    }

    setTickets(
      createSupportTicket({
        ...form,
        attachments,
      }),
    );
    setForm({ subject: '', category: 'Support', description: '' });
    setAttachments([]);

    if (form.category === 'Dispute') {
      setFeedback(
        isEnglish
          ? 'The dispute was opened and sent with attachments to the support center.'
          : 'تم فتح النزاع وإرسال الطلب مع المرفقات إلى مركز الدعم.',
      );
      return;
    }

    if (form.category === 'Complaint') {
      setFeedback(
        isEnglish
          ? 'The complaint was sent with attachments to the support center.'
          : 'تم إرسال الشكوى مع المرفقات إلى مركز الدعم.',
      );
      return;
    }

    setFeedback(
      isEnglish
        ? 'The support request was sent with attachments to the support center.'
        : 'تم إرسال طلب الدعم مع المرفقات إلى مركز الدعم.',
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <div>
          <h1 className="text-3xl font-bold">{isEnglish ? 'Support Center' : 'مركز الدعم'}</h1>
          <p className="mt-1 text-muted-foreground">
            {isEnglish
              ? 'Send your ticket with images or files, and track the review status from the same page.'
              : 'أرسل تذكرتك مع الصور أو الملفات، وتابع حالة المراجعة من نفس الصفحة.'}
          </p>
        </div>

        {feedback && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6 text-sm text-primary">{feedback}</CardContent>
          </Card>
        )}

        {latestTicket ? (
          <Card className="border-amber-200 bg-amber-50/60">
            <CardHeader>
              <CardTitle>{isEnglish ? 'Latest Update on Your Request' : 'آخر تحديث على طلبك'}</CardTitle>
              <CardDescription>{latestTicket.subject}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <Badge className={getStatusClasses(latestTicket.status)}>
                  {getStatusLabel(latestTicket.status, isEnglish)}
                </Badge>
                <p className="text-sm text-muted-foreground">{getStatusText(latestTicket.status, isEnglish)}</p>
              </div>
              <span className="text-xs text-muted-foreground">{latestTicket.createdAt}</span>
            </CardContent>
          </Card>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>{isEnglish ? 'Create New Ticket' : 'إنشاء تذكرة جديدة'}</CardTitle>
              <CardDescription>
                {isEnglish
                  ? 'You can attach images or files with the request so the support team can review them.'
                  : 'يمكنك إرفاق صور أو ملفات مع الطلب حتى يطلع عليها فريق الدعم.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="support-subject">{isEnglish ? 'Subject' : 'العنوان'}</Label>
                  <Input
                    id="support-subject"
                    value={form.subject}
                    onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{isEnglish ? 'Ticket Type' : 'نوع التذكرة'}</Label>
                  <Select
                    value={form.category}
                    onValueChange={(value: SupportTicket['category']) =>
                      setForm((current) => ({ ...current, category: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Support">{isEnglish ? 'Support' : 'دعم'}</SelectItem>
                      <SelectItem value="Complaint">{isEnglish ? 'Complaint' : 'شكوى'}</SelectItem>
                      <SelectItem value="Dispute">{isEnglish ? 'Dispute' : 'نزاع'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="support-description">{isEnglish ? 'Description' : 'الوصف'}</Label>
                  <Textarea
                    id="support-description"
                    rows={6}
                    value={form.description}
                    onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="support-attachments">{isEnglish ? 'Upload Images or Files' : 'رفع صور أو ملفات'}</Label>
                  <Input
                    id="support-attachments"
                    type="file"
                    multiple
                    onChange={handleFilesChange}
                    accept="image/*,.pdf,.doc,.docx,.txt,.zip,.rar"
                  />
                  {attachments.length > 0 ? (
                    <div className="rounded-2xl border border-border p-3 text-sm">
                      <p className="mb-2 font-medium">{isEnglish ? 'Attached Files' : 'الملفات المرفقة'}</p>
                      <div className="space-y-1 text-muted-foreground">
                        {attachments.map((file) => (
                          <p key={`${file.name}-${file.size}`}>
                            {file.name} - {(file.size / 1024).toFixed(1)} KB
                          </p>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>

                <Button type="submit">{isEnglish ? 'Send Ticket' : 'إرسال التذكرة'}</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{isEnglish ? 'Your Tickets History' : 'سجل تذاكرك'}</CardTitle>
              <CardDescription>
                {isEnglish
                  ? 'Here you can see the status of every request and know whether it is under admin review.'
                  : 'هنا ترى حالة كل طلب، ومن هنا تعرف إذا كان الطلب قيد المراجعة عند الأدمن.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {tickets.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  {isEnglish ? 'There are no tickets yet.' : 'لا توجد تذاكر بعد.'}
                </div>
              ) : null}

              {tickets.map((ticket) => (
                <div key={ticket.id} className="space-y-3 rounded-2xl border border-border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">{ticket.subject}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{ticket.description}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge className={getCategoryClasses(ticket.category)}>
                        {getCategoryLabel(ticket.category, isEnglish)}
                      </Badge>
                      <Badge className={getStatusClasses(ticket.status)}>
                        {getStatusLabel(ticket.status, isEnglish)}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground">{getStatusText(ticket.status, isEnglish)}</p>

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

                  <div className="text-xs text-muted-foreground">{ticket.createdAt}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
