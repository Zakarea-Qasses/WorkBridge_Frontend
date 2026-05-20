import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@/app/components/ui';
import { useLanguage } from '@/app/providers/LanguageProvider';
import { getDisplayCategoryLabel, getDisplayStatusLabel } from '@/app/data';
import {
  getReviewContracts,
  getReviewCriteriaByRole,
  submitMyContractReview,
} from '@/app/storage';

function getDisplayRoleLabel(role: string, isEnglish: boolean) {
  if (!isEnglish) {
    if (role === 'Client') {
      return 'عميل';
    }

    if (role === 'Service Provider') {
      return 'مقدم خدمة';
    }

    return role;
  }

  switch (role) {
    case 'عميل':
    case 'Client':
      return 'Client';
    case 'مقدم خدمة':
    case 'Service Provider':
      return 'Service Provider';
    default:
      return role;
  }
}

function isAgreedAndCompleted(agreementStatus: string, workStatus: string) {
  const agreed = agreementStatus === 'تم الاتفاق' || agreementStatus === 'Agreed';
  const completed = workStatus === 'مكتمل' || workStatus === 'Completed';
  return agreed && completed;
}

function isClientRole(role: string) {
  return role === 'عميل' || role === 'Client';
}

function isProviderRole(role: string) {
  return role === 'مقدم خدمة' || role === 'Service Provider';
}

export default function PostCompletionReviewsSection() {
  const { isEnglish } = useLanguage();
  const [contracts, setContracts] = useState(getReviewContracts());
  const [selectedContractId, setSelectedContractId] = useState<number | null>(null);
  const [criteriaValues, setCriteriaValues] = useState<Record<string, string>>({});
  const [comment, setComment] = useState('');
  const [feedback, setFeedback] = useState('');
  const [showReviewHint, setShowReviewHint] = useState(false);
  const reviewFormRef = useRef<HTMLDivElement | null>(null);

  const eligibleContracts = useMemo(
    () => contracts.filter((contract) => isAgreedAndCompleted(contract.agreementStatus, contract.workStatus)),
    [contracts],
  );

  const clientContracts = eligibleContracts.filter((contract) => isClientRole(contract.currentUserRole));
  const providerContracts = eligibleContracts.filter((contract) => isProviderRole(contract.currentUserRole));

  const selectedContract =
    eligibleContracts.find((contract) => contract.id === selectedContractId) ?? null;

  const selectedCriteria = selectedContract
    ? getReviewCriteriaByRole(selectedContract.currentUserRole as 'Service Provider' | 'Client')
    : [];

  useEffect(() => {
    if (!selectedContract || !reviewFormRef.current) {
      return;
    }

    reviewFormRef.current.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
    setShowReviewHint(true);

    const timeoutId = window.setTimeout(() => {
      setShowReviewHint(false);
    }, 2600);

    return () => window.clearTimeout(timeoutId);
  }, [selectedContract]);

  const handleOpenReview = (contractId: number) => {
    const contract = eligibleContracts.find((item) => item.id === contractId);
    if (!contract) {
      return;
    }

    const defaults = getReviewCriteriaByRole(contract.currentUserRole as 'Service Provider' | 'Client').reduce<Record<string, string>>(
      (accumulator, criterion) => {
        accumulator[criterion] = '5';
        return accumulator;
      },
      {},
    );

    setSelectedContractId(contractId);
    setCriteriaValues(defaults);
    setComment('');
    setFeedback('');
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedContract || !comment.trim()) {
      setFeedback(isEnglish ? 'Write the review comment before saving.' : 'اكتب تعليق التقييم قبل الحفظ.');
      return;
    }

    const criteria = selectedCriteria.map((label) => ({
      label,
      value: Number(criteriaValues[label] ?? '5'),
    }));

    const nextContracts = submitMyContractReview(selectedContract.id, {
      comment: comment.trim(),
      criteria,
    });

    setContracts(nextContracts);
    setFeedback(
      isEnglish
        ? `Your review was sent to ${selectedContract.otherPartyName} and will appear on their profile.`
        : `تم إرسال تقييمك إلى ${selectedContract.otherPartyName} وسيظهر على ملفه الشخصي.`,
    );
    setSelectedContractId(null);
    setCriteriaValues({});
    setComment('');
    setShowReviewHint(false);
  };

  const renderList = (
    title: string,
    description: string,
    items: typeof eligibleContracts,
    accentClassName: string,
  ) => (
    <Card className={accentClassName}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {isEnglish ? 'There are no items ready for review here right now.' : 'لا توجد عناصر جاهزة للتقييم هنا حاليًا.'}
          </p>
        ) : (
          items.map((contract) => (
            <div key={contract.id} className="rounded-2xl border border-border bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-2">
                  <h3 className="font-semibold">{contract.title}</h3>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <Badge variant="outline">
                      {getDisplayCategoryLabel(contract.category, isEnglish)}
                    </Badge>
                    <Badge className="bg-green-600">
                      {getDisplayStatusLabel(contract.workStatus, isEnglish)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {isEnglish ? 'Other party:' : 'الطرف المقابل:'} {contract.otherPartyName} -{' '}
                    {getDisplayRoleLabel(contract.otherPartyRole, isEnglish)}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className="text-xs text-muted-foreground">
                    {contract.myReview
                      ? isEnglish
                        ? 'Your review was submitted'
                        : 'تم إرسال تقييمك'
                      : isEnglish
                        ? 'Waiting for your review'
                        : 'بانتظار تقييمك'}
                  </span>
                  <Button
                    variant={contract.myReview ? 'outline' : 'default'}
                    disabled={Boolean(contract.myReview)}
                    onClick={() => handleOpenReview(contract.id)}
                  >
                    {contract.myReview
                      ? isEnglish
                        ? 'Review submitted'
                        : 'تم إرسال تقييمك'
                      : isEnglish
                        ? `Review ${getDisplayRoleLabel(contract.otherPartyRole, true)}`
                        : `تقييم ${getDisplayRoleLabel(contract.otherPartyRole, false)}`}
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{isEnglish ? 'Post-completion reviews' : 'التقييم بعد الإنجاز'}</CardTitle>
          <CardDescription>
            {isEnglish
              ? 'This section only appears for work that was agreed upon and completed, whether you are the client or the service provider.'
              : 'يظهر هذا القسم فقط للأعمال التي تم الاتفاق عليها واكتملت، سواء كنت عميلًا أو مقدم خدمة.'}
          </CardDescription>
        </CardHeader>
      </Card>

      {feedback ? (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6 text-sm text-primary">{feedback}</CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        {renderList(
          isEnglish ? 'Client' : 'عميل',
          isEnglish
            ? 'Review the service provider based on speed, results, and communication.'
            : 'قيّم مقدم الخدمة حسب السرعة والنتيجة وطريقة التعامل.',
          clientContracts,
          'border-blue-200 bg-blue-50/40',
        )}
        {renderList(
          isEnglish ? 'Service Provider' : 'مقدم خدمة',
          isEnglish
            ? 'Review the client based on communication, clarity, and commitment.'
            : 'قيّم العميل حسب التعامل والوضوح والالتزام.',
          providerContracts,
          'border-emerald-200 bg-emerald-50/40',
        )}
      </div>

      <div
        ref={reviewFormRef}
        className={`scroll-mt-28 rounded-3xl transition-all duration-500 ${
          showReviewHint ? 'ring-4 ring-primary/20' : ''
        }`}
      >
        <Card className={selectedContract ? 'border-primary shadow-md shadow-primary/10' : undefined}>
          <CardHeader>
            <CardTitle>
              {selectedContract
                ? isEnglish
                  ? `Submit a review for ${getDisplayRoleLabel(selectedContract.otherPartyRole, true)}`
                  : `إرسال تقييم ${getDisplayRoleLabel(selectedContract.otherPartyRole, false)}`
                : isEnglish
                  ? 'Review form'
                  : 'نموذج التقييم'}
            </CardTitle>
            <CardDescription>
              {selectedContract
                ? isEnglish
                  ? `You are now reviewing ${selectedContract.otherPartyName} after the work was completed.`
                  : `أنت الآن تقيّم ${selectedContract.otherPartyName} بعد اكتمال العمل.`
                : isEnglish
                  ? 'Choose a completed item from the two lists above to show the form here.'
                  : 'اختر عملًا مكتملًا من القائمتين أعلاه حتى يظهر النموذج هنا.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showReviewHint && selectedContract ? (
              <div className="mb-4 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
                {isEnglish
                  ? 'This is the review area. Fill in the form here, then save.'
                  : 'هذا هو مكان التقييم. عبّئ النموذج هنا ثم احفظ.'}
              </div>
            ) : null}

            {selectedContract ? (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="rounded-2xl border border-border bg-muted/30 p-4 text-sm">
                  <p className="font-semibold">{selectedContract.title}</p>
                  <p className="mt-1 text-muted-foreground">
                    {isEnglish ? 'Current role:' : 'الدور الحالي:'}{' '}
                    {getDisplayRoleLabel(selectedContract.currentUserRole, isEnglish)}
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  {selectedCriteria.map((criterion) => (
                    <div key={criterion} className="space-y-2">
                      <Label>{criterion}</Label>
                      <Select
                        value={criteriaValues[criterion] ?? '5'}
                        onValueChange={(value) =>
                          setCriteriaValues((current) => ({ ...current, [criterion]: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5</SelectItem>
                          <SelectItem value="4">4</SelectItem>
                          <SelectItem value="3">3</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="1">1</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="review-comment-inline">{isEnglish ? 'Comment' : 'التعليق'}</Label>
                  <Textarea
                    id="review-comment-inline"
                    rows={5}
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                  />
                </div>

                <Button type="submit">{isEnglish ? 'Save review' : 'حفظ التقييم'}</Button>
              </form>
            ) : (
              <p className="text-sm text-muted-foreground">
                {isEnglish
                  ? 'After the work is completed, you will be able to submit a review directly from here.'
                  : 'بعد إنجاز العمل ستتمكن من التقييم من هنا مباشرة.'}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
