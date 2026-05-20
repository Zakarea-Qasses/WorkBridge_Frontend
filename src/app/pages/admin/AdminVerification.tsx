import { FormEvent, useMemo, useState } from 'react';
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
import { companyVerificationQueue, getDisplayStatusLabel, getStatusClasses } from '@/app/data';

export default function AdminVerification() {
  const { language, isEnglish } = useLanguage();
  const [companies, setCompanies] = useState(companyVerificationQueue);
  const [requestTargetId, setRequestTargetId] = useState<number | null>(null);
  const [documentTitle, setDocumentTitle] = useState('');
  const [requestReason, setRequestReason] = useState('');
  const [feedback, setFeedback] = useState(
    isEnglish
      ? 'Company verification requests appear here, and once a decision is made the company moves to the reviewed section.'
      : 'تظهر هنا طلبات توثيق الشركات، وبعد القرار تنتقل الشركة إلى قسم تمت المراجعة.',
  );

  const requestTarget = useMemo(
    () => companies.find((company) => company.id === requestTargetId) ?? null,
    [companies, requestTargetId],
  );

  const pendingCompanies = useMemo(
    () => companies.filter((company) => company.status === 'قيد المراجعة'),
    [companies],
  );
  const reviewedCompanies = useMemo(
    () => companies.filter((company) => company.status !== 'قيد المراجعة'),
    [companies],
  );

  const handleAction = (
    id: number,
    status: 'موثق' | 'قيد المراجعة' | 'مرفوض',
    message: string,
  ) => {
    setCompanies((current) =>
      current.map((company) => (company.id === id ? { ...company, status } : company)),
    );

    if (requestTargetId === id) {
      setRequestTargetId(null);
      setDocumentTitle('');
      setRequestReason('');
    }

    setFeedback(message);
  };

  const handleRequestDocuments = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!requestTarget || !documentTitle.trim() || !requestReason.trim()) {
      setFeedback(
        isEnglish
          ? 'Enter the document name and the reason before sending the request.'
          : 'أدخل اسم المستند وسبب الطلب قبل الإرسال.',
      );
      return;
    }

    handleAction(
      requestTarget.id,
      'قيد المراجعة',
      isEnglish
        ? `An additional document request was sent to ${requestTarget.company}, and the company remains under review.`
        : `تم إرسال طلب مستندات إضافية إلى ${requestTarget.company} وبقيت ضمن بانتظار المراجعة.`,
    );
  };

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <section>
          <h2 className="text-3xl font-bold">
            {isEnglish ? 'Company verification' : 'توثيق حسابات الشركات'}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {isEnglish
              ? 'Review company documents and decide whether to approve, reject, or request additional files.'
              : 'مراجعة مستندات الشركات واتخاذ قرار قبول أو رفض أو طلب مستندات إضافية.'}
          </p>
        </section>

        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6 text-sm text-primary">{feedback}</CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.95fr]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{isEnglish ? 'Awaiting review' : 'بانتظار المراجعة'}</CardTitle>
                <CardDescription>
                  {isEnglish
                    ? 'Companies that still need an admin decision.'
                    : 'الشركات التي ما زالت تحتاج قرارًا من الأدمن.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 lg:grid-cols-2">
                {pendingCompanies.length === 0 ? (
                  <div className="lg:col-span-2 rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                    {isEnglish
                      ? 'There are no pending verification requests right now.'
                      : 'لا توجد طلبات توثيق معلّقة حاليًا.'}
                  </div>
                ) : null}

                {pendingCompanies.map((company) => (
                  <Card key={company.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <CardTitle>{company.company}</CardTitle>
                          <CardDescription className="mt-1">{company.sector}</CardDescription>
                        </div>
                        <Badge className={getStatusClasses(company.status)}>
                          {getDisplayStatusLabel(company.status, isEnglish)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {isEnglish ? 'Contact person' : 'مسؤول التواصل'}
                        </p>
                        <p className="font-medium">{company.contact}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {isEnglish ? 'Email address' : 'البريد الإلكتروني'}
                        </p>
                        <p className="font-medium">{company.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {isEnglish ? 'Team size' : 'عدد الموظفين'}
                        </p>
                        <p className="font-medium">{company.employees}</p>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-2">
                        <Button
                          className="min-w-[8rem] flex-1"
                          onClick={() =>
                            handleAction(
                              company.id,
                              'موثق',
                              isEnglish
                                ? `${company.company} was approved and moved to reviewed.`
                                : `تم قبول توثيق ${company.company} ونقله إلى تمت المراجعة.`,
                            )
                          }
                        >
                          {isEnglish ? 'Approve' : 'قبول'}
                        </Button>
                        <Button
                          variant="outline"
                          className="min-w-[11rem] flex-1"
                          onClick={() => {
                            setRequestTargetId(company.id);
                            setDocumentTitle('');
                            setRequestReason('');
                            setFeedback(
                              isEnglish
                                ? `You can now send an additional document request to ${company.company}.`
                                : `يمكنك الآن إرسال طلب مستندات إضافية إلى ${company.company}.`,
                            );
                          }}
                        >
                          {isEnglish ? 'Request documents' : 'طلب مستندات'}
                        </Button>
                        <Button
                          variant="destructive"
                          className="min-w-[7.5rem] flex-1"
                          onClick={() =>
                            handleAction(
                              company.id,
                              'مرفوض',
                              isEnglish
                                ? `${company.company} was rejected and moved to reviewed.`
                                : `تم رفض طلب ${company.company} ونقله إلى تمت المراجعة.`,
                            )
                          }
                        >
                          {isEnglish ? 'Reject' : 'رفض'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{isEnglish ? 'Reviewed companies' : 'تمت المراجعة'}</CardTitle>
                <CardDescription>
                  {isEnglish
                    ? 'Companies that already have a final administrative decision.'
                    : 'الشركات التي صدر فيها قرار نهائي بالفعل.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 lg:grid-cols-2">
                {reviewedCompanies.length === 0 ? (
                  <div className="lg:col-span-2 rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                    {isEnglish
                      ? 'There are no reviewed companies yet.'
                      : 'لا توجد شركات تمت مراجعتها بعد.'}
                  </div>
                ) : null}

                {reviewedCompanies.map((company) => (
                  <Card key={company.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <CardTitle>{company.company}</CardTitle>
                          <CardDescription className="mt-1">{company.sector}</CardDescription>
                        </div>
                        <Badge className={getStatusClasses(company.status)}>
                          {getDisplayStatusLabel(company.status, isEnglish)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {isEnglish ? 'Contact person' : 'مسؤول التواصل'}
                        </p>
                        <p className="font-medium">{company.contact}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {isEnglish ? 'Email address' : 'البريد الإلكتروني'}
                        </p>
                        <p className="font-medium">{company.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {isEnglish ? 'Team size' : 'عدد الموظفين'}
                        </p>
                        <p className="font-medium">{company.employees}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </div>

          {requestTarget ? (
            <Card>
              <CardHeader>
                <CardTitle>
                  {isEnglish ? 'Request additional documents' : 'طلب مستندات إضافية'}
                </CardTitle>
                <CardDescription>
                  {isEnglish ? 'Selected company:' : 'الشركة المحددة:'}{' '}
                  <span className="font-medium text-foreground">{requestTarget.company}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleRequestDocuments}>
                  <div className="space-y-2">
                    <Label htmlFor="verification-document-title">
                      {isEnglish ? 'Required document name' : 'اسم المستند المطلوب'}
                    </Label>
                    <Input
                      id="verification-document-title"
                      value={documentTitle}
                      onChange={(event) => setDocumentTitle(event.target.value)}
                      placeholder={
                        isEnglish
                          ? 'Example: commercial register or registration certificate'
                          : 'مثال: سجل تجاري أو شهادة تسجيل'
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="verification-request-reason">
                      {isEnglish ? 'Reason for the request' : 'سبب الطلب'}
                    </Label>
                    <Textarea
                      id="verification-request-reason"
                      value={requestReason}
                      onChange={(event) => setRequestReason(event.target.value)}
                      placeholder={
                        isEnglish
                          ? 'Explain why additional documents are needed'
                          : 'اكتب سبب طلب المستندات الإضافية'
                      }
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button type="submit">{isEnglish ? 'Send request' : 'إرسال الطلب'}</Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setRequestTargetId(null);
                        setDocumentTitle('');
                        setRequestReason('');
                        setFeedback(
                          isEnglish
                            ? 'The additional document request form was closed.'
                            : 'تم إغلاق نموذج طلب المستندات.',
                        );
                      }}
                    >
                      {isEnglish ? 'Cancel' : 'إلغاء'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>
                  {isEnglish ? 'Request additional documents' : 'طلب مستندات إضافية'}
                </CardTitle>
                <CardDescription>
                  {isEnglish
                    ? 'Choose a company, then click request documents to open the form here.'
                    : 'اختر شركة ثم اضغط طلب مستندات لفتح النموذج هنا.'}
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
