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
import { getContractsForUser, updateContractStatus } from '@/app/storage';

function getStatusBadge(status: string) {
  switch (status) {
    case 'Completed':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'In Progress':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'Awaiting Delivery':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}

function getContractOriginLabel(postType: string, isEnglish: boolean) {
  switch (postType) {
    case 'Service':
      return isEnglish
        ? 'This contract was created after accepting a request for a published service.'
        : 'هذا العقد نشأ بعد قبول طلب على خدمة منشورة.';
    case 'Job':
      return isEnglish
        ? 'This contract was created after agreeing on a job opportunity or direct hire.'
        : 'هذا العقد نشأ بعد الاتفاق على فرصة وظيفية أو تعاقد مباشر.';
    default:
      return isEnglish
        ? 'This contract was created after accepting an offer on a project.'
        : 'هذا العقد نشأ بعد قبول عرض على مشروع.';
  }
}

function getNextStepForUser(status: string, isEnglish: boolean) {
  switch (status) {
    case 'Awaiting Start':
      return isEnglish
        ? 'The contract is officially active, and the next step is to start execution.'
        : 'العقد جاهز وبدأ رسميًا، والخطوة التالية هي بدء التنفيذ.';
    case 'In Progress':
      return isEnglish
        ? 'Work is now in progress. Once execution is finished, you can move it to awaiting delivery.'
        : 'العمل جارٍ الآن. عندما تنهي التنفيذ يمكنك نقله إلى بانتظار التسليم.';
    case 'Awaiting Delivery':
      return isEnglish
        ? 'The work was submitted to the other party, and you can now confirm completion if everything is finished.'
        : 'تم إرسال العمل للطرف الآخر، ويمكنك الآن تأكيد الإكمال إذا انتهى كل شيء.';
    default:
      return isEnglish
        ? 'The contract has ended and its completion was recorded successfully.'
        : 'العقد انتهى وتم توثيق اكتماله بنجاح.';
  }
}

export default function Contracts() {
  const { isEnglish, language } = useLanguage();
  const [contracts, setContracts] = useState(() => getContractsForUser(1));
  const [feedback, setFeedback] = useState(
    isEnglish
      ? 'A contract is the official agreement created after accepting an offer or service request. From here, you track its status step by step.'
      : 'العقد هو الاتفاق الرسمي الذي يتولد بعد قبول عرض أو قبول طلب خدمة، ومن هنا تتابع حالته خطوة بخطوة.',
  );

  const handleStatusChange = (
    contractId: number,
    status: Parameters<typeof updateContractStatus>[1],
    message: string,
  ) => {
    const nextContracts = updateContractStatus(contractId, status);
    setContracts(
      nextContracts.filter((contract) => contract.clientId === 1 || contract.freelancerId === 1),
    );
    setFeedback(message);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <section className="rounded-3xl border border-border bg-gradient-to-l from-slate-50 via-white to-blue-50 p-6">
          <h1 className="text-3xl font-bold">{isEnglish ? 'Contracts' : 'العقود'}</h1>
          <p className="mt-2 text-muted-foreground">
            {isEnglish
              ? 'This page does not create contracts manually. Instead, it shows official agreements formed after acceptance. Before acceptance there is a project or service, and after acceptance the contract appears here to track execution.'
              : 'هذه الصفحة لا تنشئ العقد يدويًا، بل تعرض الاتفاقات الرسمية التي تشكلت بعد القبول. يعني: قبل القبول يوجد مشروع أو خدمة، وبعد القبول يظهر العقد هنا لمتابعة التنفيذ.'}
          </p>
        </section>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                {isEnglish ? 'When does a contract appear?' : 'متى يظهر العقد؟'}
              </p>
              <p className="mt-2 text-sm leading-6 text-foreground">
                {isEnglish
                  ? 'It appears after accepting a project offer, service request, or a clear contractual agreement.'
                  : 'يظهر بعد قبول عرض مشروع أو قبول طلب خدمة أو اتفاق تعاقدي واضح.'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                {isEnglish ? 'What is this page for?' : 'ما وظيفة الصفحة؟'}
              </p>
              <p className="mt-2 text-sm leading-6 text-foreground">
                {isEnglish
                  ? 'To follow the agreement status instead of losing it between messages, the project, and the wallet.'
                  : 'متابعة حالة الاتفاق بدل ضياعه بين الرسائل والمشروع والمحفظة.'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                {isEnglish ? 'What is expected from you?' : 'ما المطلوب منك؟'}
              </p>
              <p className="mt-2 text-sm leading-6 text-foreground">
                {isEnglish
                  ? 'Move the contract from start to execution, then delivery, then completion depending on the current stage.'
                  : 'تنقل العقد من البدء إلى التنفيذ ثم التسليم ثم الإكمال بحسب المرحلة الحالية.'}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6 text-sm text-primary">{feedback}</CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
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
                <CardDescription>{getContractOriginLabel(contract.postType, isEnglish)}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 text-sm">
                <div className="space-y-2">
                  <p>
                    {isEnglish ? 'Client:' : 'العميل:'} <span className="font-medium">{contract.clientName}</span>
                  </p>
                  <p>
                    {isEnglish ? 'Service provider:' : 'مقدم الخدمة:'}{' '}
                    <span className="font-medium">{contract.freelancerName}</span>
                  </p>
                  <p>
                    {isEnglish ? 'Amount:' : 'المبلغ:'} <span className="font-medium">${contract.amount}</span>
                  </p>
                  <p>
                    {isEnglish ? 'Commission:' : 'العمولة:'}{' '}
                    <span className="font-medium">${contract.commission}</span>
                  </p>
                  <p>
                    {isEnglish ? 'Final net:' : 'الصافي النهائي:'}{' '}
                    <span className="font-medium">${contract.finalAmount}</span>
                  </p>
                  <p>
                    {isEnglish ? 'Created at:' : 'تاريخ الإنشاء:'}{' '}
                    <span className="font-medium">{contract.createdAt}</span>
                  </p>
                </div>

                <div className="rounded-2xl bg-muted p-4">
                  <p className="text-xs text-muted-foreground">
                    {isEnglish ? 'Next step' : 'الخطوة التالية'}
                  </p>
                  <p className="mt-2 leading-6 text-foreground">
                    {getNextStepForUser(contract.status, isEnglish)}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {contract.status === 'Awaiting Start' ? (
                    <Button
                      size="sm"
                      onClick={() =>
                        handleStatusChange(
                          contract.id,
                          'In Progress',
                          isEnglish
                            ? `Execution for "${contract.postTitle}" has started.`
                            : `تم بدء تنفيذ العقد "${contract.postTitle}".`,
                        )
                      }
                    >
                      {isEnglish ? 'Start execution' : 'بدء التنفيذ'}
                    </Button>
                  ) : null}

                  {contract.status === 'In Progress' ? (
                    <Button
                      size="sm"
                      onClick={() =>
                        handleStatusChange(
                          contract.id,
                          'Awaiting Delivery',
                          isEnglish
                            ? `"${contract.postTitle}" moved to awaiting delivery.`
                            : `تم نقل العقد "${contract.postTitle}" إلى بانتظار التسليم.`,
                        )
                      }
                    >
                      {isEnglish ? 'Deliver work' : 'تسليم العمل'}
                    </Button>
                  ) : null}

                  {contract.status === 'Awaiting Delivery' ? (
                    <Button
                      size="sm"
                      onClick={() =>
                        handleStatusChange(
                          contract.id,
                          'Completed',
                          isEnglish
                            ? `Completion of "${contract.postTitle}" was confirmed successfully.`
                            : `تم تأكيد اكتمال العقد "${contract.postTitle}" بنجاح.`,
                        )
                      }
                    >
                      {isEnglish ? 'Confirm completion' : 'تأكيد الإكمال'}
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
