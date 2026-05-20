import { useState } from 'react';
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
import { getContractsForCompany, updateContractStatus } from '@/app/storage';

function getStatusBadge(status: string) {
  switch (status) {
    case 'مكتمل':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'قيد التنفيذ':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'بانتظار التسليم':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}

function getContractMeaning(postType: string, isEnglish: boolean) {
  switch (postType) {
    case 'وظيفة':
      return isEnglish
        ? 'This contract comes from a hiring agreement with a candidate.'
        : 'هذا عقد ناتج عن اتفاق توظيف أو تعاقد مع مرشح.';
    case 'خدمة':
      return isEnglish
        ? 'This contract comes from an accepted published-service request.'
        : 'هذا عقد ناتج عن طلب خدمة منشورة وقبولها.';
    default:
      return isEnglish
        ? 'This contract comes from an accepted project or work agreement.'
        : 'هذا عقد ناتج عن اتفاق عمل أو مشروع تم قبوله.';
  }
}

function getNextStepForCompany(status: string, isEnglish: boolean) {
  switch (status) {
    case 'بانتظار البدء':
      return isEnglish
        ? 'The contract has been created and is ready. The company should now activate execution.'
        : 'العقد تشكل وأصبح جاهزًا، والخطوة الحالية من طرف الشركة هي تفعيل التنفيذ.';
    case 'قيد التنفيذ':
      return isEnglish
        ? 'The assigned party is currently working. The company is waiting for the delivery stage.'
        : 'الطرف المنفذ يعمل الآن، وتنتظر الشركة مرحلة التسليم.';
    case 'بانتظار التسليم':
      return isEnglish
        ? 'Work has been submitted. The company can now approve completion if everything is correct.'
        : 'تم إرسال العمل، ويمكن للشركة الآن اعتماد الإكمال إذا كان كل شيء مطابقًا.';
    default:
      return isEnglish
        ? 'The contract is complete and closed successfully, and can now be reviewed as a final agreement record.'
        : 'العقد اكتمل وأغلق بنجاح، ويمكن الرجوع له كسجل اتفاق نهائي.';
  }
}

export default function CompanyContracts() {
  const { language, isEnglish } = useLanguage();
  const [contracts, setContracts] = useState(() => getContractsForCompany(1));
  const [feedback, setFeedback] = useState(
    isEnglish
      ? 'This page is for tracking official company agreements after approval, not for posting jobs or receiving applicants.'
      : 'هذه الصفحة مخصصة لمتابعة الاتفاقات الرسمية للشركة بعد القبول، وليست لنشر وظائف أو استلام متقدمين.',
  );

  const handleStatusChange = (
    contractId: number,
    status: Parameters<typeof updateContractStatus>[1],
    message: string,
  ) => {
    const nextContracts = updateContractStatus(contractId, status);
    setContracts(nextContracts.filter((contract) => contract.companyId === 1));
    setFeedback(message);
  };

  return (
    <DashboardLayout userType="company">
      <div className="space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <section className="rounded-3xl border border-border bg-gradient-to-l from-slate-50 via-white to-blue-50 p-6">
          <h1 className="text-3xl font-bold">{isEnglish ? 'Company contracts' : 'عقود الشركة'}</h1>
          <p className="mt-2 text-muted-foreground">
            {isEnglish
              ? 'Here the company follows contracts that became official after accepting a candidate, a service, or a clear work agreement. This page covers the stage after acceptance and before final closure.'
              : 'هنا تتابع الشركة العقود التي تحولت إلى اتفاق رسمي بعد قبول مرشح أو قبول خدمة أو بدء تعاقد واضح. هذه الصفحة هي مرحلة ما بعد القبول وما قبل الإغلاق النهائي.'}
          </p>
        </section>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                {isEnglish ? 'What does a contract mean here?' : 'ما معنى العقد هنا؟'}
              </p>
              <p className="mt-2 text-sm leading-6 text-foreground">
                {isEnglish
                  ? 'A contract is the official record of the financial and execution agreement between the company and the assigned party.'
                  : 'العقد هو السجل الرسمي للاتفاق المالي والتنفيذي بين الشركة والطرف المنفذ.'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                {isEnglish ? 'Why is it useful?' : 'ما فائدته؟'}
              </p>
              <p className="mt-2 text-sm leading-6 text-foreground">
                {isEnglish
                  ? 'It gives the company one clear place to follow the amount, status, and next step instead of scattering details across multiple pages.'
                  : 'يعطي الشركة مكانًا واضحًا لمتابعة المبلغ والحالة والخطوة التالية بدل تشتيت المعلومات بين أكثر من صفحة.'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                {isEnglish ? 'What does the company do here?' : 'ماذا تفعل الشركة هنا؟'}
              </p>
              <p className="mt-2 text-sm leading-6 text-foreground">
                {isEnglish
                  ? 'The company activates the contract at the beginning, then approves completion at the end after receiving the work or confirming the engagement is finished.'
                  : 'تفعّل الشركة العقد عند البداية، ثم تعتمد الإكمال في النهاية عندما تستلم العمل أو تؤكد انتهاء التعاقد.'}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6 text-sm text-primary">{feedback}</CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          {contracts.map((contract) => (
            <Card key={contract.id}>
              <CardHeader className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle>{contract.postTitle}</CardTitle>
                    <CardDescription>{getDisplayTypeLabel(contract.postType, isEnglish)}</CardDescription>
                  </div>
                  <Badge className={getStatusBadge(contract.status)}>
                    {getDisplayStatusLabel(contract.status, isEnglish)}
                  </Badge>
                </div>
                <CardDescription>{getContractMeaning(contract.postType, isEnglish)}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 text-sm">
                <div className="space-y-2">
                  <p>
                    {isEnglish ? 'Assigned party:' : 'الطرف المنفذ:'}{' '}
                    <span className="font-medium">{contract.freelancerName}</span>
                  </p>
                  <p>
                    {isEnglish ? 'Amount:' : 'القيمة:'}{' '}
                    <span className="font-medium">${contract.amount}</span>
                  </p>
                  <p>
                    {isEnglish ? 'Commission:' : 'العمولة:'}{' '}
                    <span className="font-medium">${contract.commission}</span>
                  </p>
                  <p>
                    {isEnglish ? 'Final net amount:' : 'الصافي النهائي:'}{' '}
                    <span className="font-medium">${contract.finalAmount}</span>
                  </p>
                  <p>
                    {isEnglish ? 'Created at:' : 'تاريخ الإنشاء:'}{' '}
                    <span className="font-medium">{contract.createdAt}</span>
                  </p>
                </div>

                <div className="rounded-2xl bg-muted p-4">
                  <p className="text-xs text-muted-foreground">
                    {isEnglish ? 'Next company step' : 'الخطوة التالية للشركة'}
                  </p>
                  <p className="mt-2 leading-6 text-foreground">
                    {getNextStepForCompany(contract.status, isEnglish)}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {contract.status === 'بانتظار البدء' ? (
                    <Button
                      size="sm"
                      onClick={() =>
                        handleStatusChange(
                          contract.id,
                          'قيد التنفيذ',
                          isEnglish
                            ? `The "${contract.postTitle}" contract was activated and execution has started.`
                            : `تم تفعيل العقد "${contract.postTitle}" وبدء تنفيذه.`,
                        )
                      }
                    >
                      {isEnglish ? 'Activate contract' : 'تفعيل العقد'}
                    </Button>
                  ) : null}

                  {contract.status === 'بانتظار التسليم' ? (
                    <Button
                      size="sm"
                      onClick={() =>
                        handleStatusChange(
                          contract.id,
                          'مكتمل',
                          isEnglish
                            ? `Completion of the "${contract.postTitle}" contract was approved.`
                            : `تم اعتماد اكتمال العقد "${contract.postTitle}".`,
                        )
                      }
                    >
                      {isEnglish ? 'Approve completion' : 'اعتماد الإكمال'}
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
