import { FormEvent, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
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
  Textarea,
} from '@/app/components/ui';
import { getDisplayStatusLabel, getStatusClasses } from '@/app/data';
import { getAdminDisputeRecords, saveAdminDisputeDecision } from '@/app/storage';

export default function AdminDisputes() {
  const { language, isEnglish } = useLanguage();
  const navigate = useNavigate();
  const [items, setItems] = useState(() => getAdminDisputeRecords());
  const [selectedDisputeId, setSelectedDisputeId] = useState<number>(
    getAdminDisputeRecords().find((item) => item.status !== 'مكتمل')?.id ?? 0,
  );
  const [decisionTitle, setDecisionTitle] = useState('');
  const [decisionSummary, setDecisionSummary] = useState('');
  const [feedback, setFeedback] = useState(
    isEnglish
      ? 'Open the dispute, record the final decision, or contact the parties from the same page.'
      : 'يمكنك فتح النزاع ثم تسجيل القرار النهائي أو مراسلة الأطراف من نفس الصفحة.',
  );

  const openDisputes = useMemo(
    () => items.filter((item) => item.status !== 'مكتمل'),
    [items],
  );

  const resolvedDisputes = useMemo(
    () => items.filter((item) => item.status === 'مكتمل'),
    [items],
  );

  const selectedDispute = useMemo(
    () => openDisputes.find((item) => item.id === selectedDisputeId) ?? openDisputes[0],
    [openDisputes, selectedDisputeId],
  );

  const handleDecisionSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedDispute || !decisionTitle.trim() || !decisionSummary.trim()) {
      setFeedback(
        isEnglish
          ? 'Enter a decision title and summary before saving.'
          : 'أدخل عنوان القرار وملخصه قبل الحفظ.',
      );
      return;
    }

    const nextItems = saveAdminDisputeDecision(
      selectedDispute.id,
      decisionTitle.trim(),
      decisionSummary.trim(),
    );
    const nextOpenDisputes = nextItems.filter((item) => item.status !== 'مكتمل');

    setItems(nextItems);
    setSelectedDisputeId(nextOpenDisputes[0]?.id ?? 0);
    setDecisionTitle('');
    setDecisionSummary('');
    setFeedback(
      isEnglish
        ? `The final decision for "${selectedDispute.subject}" was saved and the dispute moved to completed cases.`
        : `تم اعتماد القرار للنزاع "${selectedDispute.subject}" ونقله إلى الحالات المكتملة.`,
    );
  };

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <section>
          <h2 className="text-3xl font-bold">
            {isEnglish ? 'Complaints and disputes' : 'الشكاوى والنزاعات'}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {isEnglish
              ? 'Review open disputes and record the final decision directly from this page without opening another screen.'
              : 'راجع البلاغات المفتوحة واتخذ القرار النهائي من داخل الصفحة نفسها بدون الانتقال إلى واجهة أخرى.'}
          </p>
        </section>

        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6 text-sm text-primary">{feedback}</CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[1.25fr_1fr]">
          <div className="grid gap-6 lg:grid-cols-2">
            {openDisputes.length > 0 ? (
              openDisputes.map((dispute) => (
                <Card key={dispute.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle>{dispute.subject}</CardTitle>
                        <CardDescription className="mt-1">{dispute.parties}</CardDescription>
                      </div>
                      <Badge className={getStatusClasses(dispute.status)}>
                        {getDisplayStatusLabel(dispute.status, isEnglish)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {isEnglish ? 'Priority' : 'الأولوية'}
                      </span>
                      <span className="font-medium">{dispute.priority}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {isEnglish ? 'Amount' : 'القيمة'}
                      </span>
                      <span className="font-medium">{dispute.amount}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {isEnglish ? 'Last update' : 'آخر تحديث'}
                      </span>
                      <span className="font-medium">{dispute.updatedAt}</span>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        className="flex-1"
                        onClick={() => {
                          setSelectedDisputeId(dispute.id);
                          setDecisionTitle('');
                          setDecisionSummary('');
                          setFeedback(
                            isEnglish
                              ? `The dispute "${dispute.subject}" is now open for final action from this page.`
                              : `تم فتح النزاع "${dispute.subject}" لاتخاذ القرار النهائي من نفس الصفحة.`,
                          );
                        }}
                      >
                        {isEnglish ? 'Take action' : 'اتخاذ القرار'}
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          setFeedback(
                            isEnglish
                              ? `You were moved to admin messages to follow up on: ${dispute.subject}.`
                              : `تم تحويلك إلى محادثات الأدمن لمتابعة النزاع: ${dispute.subject}.`,
                          );
                          navigate('/admin/messages');
                        }}
                      >
                        {isEnglish ? 'Message parties' : 'مراسلة الأطراف'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="lg:col-span-2">
                <CardContent className="pt-6 text-sm text-muted-foreground">
                  {isEnglish
                    ? 'There are no open complaints or disputes right now. Once any decision is saved, the case leaves the work list and remains in completed cases.'
                    : 'لا توجد شكاوى أو نزاعات مفتوحة حاليًا. عند اعتماد أي قرار ستختفي الحالة من قائمة العمل وتبقى في قسم الحالات المكتملة.'}
                </CardContent>
              </Card>
            )}
          </div>

          {selectedDispute ? (
            <Card>
              <CardHeader>
                <CardTitle>{isEnglish ? 'Final decision' : 'القرار النهائي'}</CardTitle>
                <CardDescription>
                  {isEnglish
                    ? 'Record the admin decision and save it directly from here.'
                    : 'سجل قرار الأدمن واحفظه مباشرة من هنا.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-2xl border border-border p-4">
                  <h3 className="font-semibold">{selectedDispute.subject}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{selectedDispute.parties}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge className={getStatusClasses(selectedDispute.status)}>
                      {getDisplayStatusLabel(selectedDispute.status, isEnglish)}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {isEnglish ? 'Amount:' : 'القيمة:'} {selectedDispute.amount}
                    </span>
                  </div>
                </div>

                <form className="space-y-4" onSubmit={handleDecisionSubmit}>
                  <div className="space-y-2">
                    <Label htmlFor="decision-title">
                      {isEnglish ? 'Decision title' : 'عنوان القرار'}
                    </Label>
                    <Input
                      id="decision-title"
                      value={decisionTitle}
                      onChange={(event) => setDecisionTitle(event.target.value)}
                      placeholder={
                        isEnglish
                          ? 'Example: refund the amount to the client'
                          : 'مثال: إعادة المبلغ إلى العميل'
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="decision-summary">
                      {isEnglish ? 'Decision summary' : 'ملخص القرار'}
                    </Label>
                    <Textarea
                      id="decision-summary"
                      value={decisionSummary}
                      onChange={(event) => setDecisionSummary(event.target.value)}
                      placeholder={
                        isEnglish
                          ? 'Write the final decision details and the approved action'
                          : 'اكتب تفاصيل القرار النهائي والإجراء المعتمد'
                      }
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button type="submit">{isEnglish ? 'Save decision' : 'حفظ القرار'}</Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setDecisionTitle('');
                        setDecisionSummary('');
                        setFeedback(
                          isEnglish
                            ? 'The current decision form was cleared.'
                            : 'تم مسح نموذج القرار الحالي.',
                        );
                      }}
                    >
                      {isEnglish ? 'Clear' : 'مسح'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>{isEnglish ? 'Final decision' : 'القرار النهائي'}</CardTitle>
                <CardDescription>
                  {isEnglish
                    ? 'All open disputes have already been handled.'
                    : 'جميع النزاعات المفتوحة تمت معالجتها.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {isEnglish
                  ? 'If a new case appears, you will be able to open it and save the final decision from here.'
                  : 'إذا ظهرت حالة جديدة ستتمكن من فتحها وتسجيل القرار النهائي من هنا.'}
              </CardContent>
            </Card>
          )}
        </div>

        {resolvedDisputes.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>{isEnglish ? 'Completed cases' : 'الحالات المكتملة'}</CardTitle>
              <CardDescription>
                {isEnglish
                  ? 'Disputes that already have a saved final decision.'
                  : 'النزاعات التي تم اعتماد القرار النهائي لها.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {resolvedDisputes.map((dispute) => (
                <div key={dispute.id} className="rounded-2xl border border-border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">{dispute.subject}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{dispute.parties}</p>
                    </div>
                    <Badge className={getStatusClasses(dispute.status)}>
                      {getDisplayStatusLabel(dispute.status, isEnglish)}
                    </Badge>
                  </div>
                  <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                    <p>{isEnglish ? 'Amount:' : 'القيمة:'} {dispute.amount}</p>
                    <p>{isEnglish ? 'Last update:' : 'آخر تحديث:'} {dispute.updatedAt}</p>
                    {dispute.decisionTitle ? (
                      <p>{isEnglish ? 'Decision:' : 'القرار:'} {dispute.decisionTitle}</p>
                    ) : null}
                    {dispute.resolvedAt ? (
                      <p>{isEnglish ? 'Closed on:' : 'تاريخ الإغلاق:'} {dispute.resolvedAt}</p>
                    ) : null}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
