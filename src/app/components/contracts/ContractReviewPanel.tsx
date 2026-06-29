import { useMemo, useState } from 'react';
import { LoaderCircle, Star, Trash2 } from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@/app/components/ui';
import { getApiErrorMessage, getValidationErrors } from '@/app/api/client';
import {
  createReview,
  deleteReview,
  getContract,
  type Contract,
  type ProfileReview,
  updateReview,
} from '@/app/api/endpoints';

interface ContractReviewPanelProps {
  contract: Contract;
  currentUserId?: number;
  isEnglish: boolean;
  onChanged?: (contract: Contract) => void;
}

function otherPartyName(contract: Contract, currentUserId?: number) {
  const isClient = contract.client_id === currentUserId;
  const other = isClient ? contract.freelancer : contract.client;
  return other?.name || '';
}

function findMyReview(contract: Contract, currentUserId?: number) {
  return contract.reviews?.find((review) => review.reviewer_id === currentUserId) || null;
}

export default function ContractReviewPanel({
  contract,
  currentUserId,
  isEnglish,
  onChanged,
}: ContractReviewPanelProps) {
  const [open, setOpen] = useState(false);
  const [loadedContract, setLoadedContract] = useState<Contract | null>(null);
  const [rating, setRating] = useState('5');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const activeContract = loadedContract || contract;
  const myReview = useMemo(
    () => findMyReview(activeContract, currentUserId),
    [activeContract, currentUserId],
  );
  const targetName = otherPartyName(activeContract, currentUserId);

  if (contract.status !== 'completed') {
    return null;
  }

  const openReview = async () => {
    setOpen((current) => !current);
    setMessage('');
    setError('');

    if (open) return;

    try {
      setLoading(true);
      const freshContract = await getContract(contract.id);
      setLoadedContract(freshContract);
      const existingReview = findMyReview(freshContract, currentUserId);
      setRating(String(existingReview?.rating || 5));
      setComment(existingReview?.comment || '');
      onChanged?.(freshContract);
    } catch (requestError) {
      setError(
        getApiErrorMessage(requestError) ||
          (isEnglish ? 'Could not load review data.' : 'تعذر تحميل بيانات التقييم.'),
      );
    } finally {
      setLoading(false);
    }
  };

  const saveReview = async () => {
    const numericRating = Number(rating);
    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      setError(isEnglish ? 'Choose a rating from 1 to 5.' : 'اختر تقييماً من 1 إلى 5.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setMessage('');

      let review: ProfileReview;
      if (myReview) {
        review = await updateReview(myReview.id, {
          rating: numericRating,
          comment: comment.trim() || null,
        });
      } else {
        review = await createReview({
          contract_id: activeContract.id,
          rating: numericRating,
          comment: comment.trim() || null,
        });
      }

      const nextContract = {
        ...activeContract,
        reviews: [
          ...(activeContract.reviews || []).filter((item) => item.id !== review.id),
          review,
        ],
      };
      setLoadedContract(nextContract);
      onChanged?.(nextContract);
      setMessage(isEnglish ? 'Review saved successfully.' : 'تم حفظ التقييم بنجاح.');
    } catch (requestError) {
      const validationMessage = Object.values(getValidationErrors(requestError)).flat()[0];
      setError(
        validationMessage ||
          getApiErrorMessage(requestError) ||
          (isEnglish ? 'Could not save review.' : 'تعذر حفظ التقييم.'),
      );
    } finally {
      setSaving(false);
    }
  };

  const removeReview = async () => {
    if (!myReview) return;

    const confirmed = window.confirm(
      isEnglish ? 'Delete your review?' : 'هل تريد حذف تقييمك؟',
    );
    if (!confirmed) return;

    try {
      setSaving(true);
      setError('');
      setMessage('');
      await deleteReview(myReview.id);
      const nextContract = {
        ...activeContract,
        reviews: (activeContract.reviews || []).filter((item) => item.id !== myReview.id),
      };
      setLoadedContract(nextContract);
      setRating('5');
      setComment('');
      onChanged?.(nextContract);
      setMessage(isEnglish ? 'Review deleted.' : 'تم حذف التقييم.');
    } catch (requestError) {
      setError(
        getApiErrorMessage(requestError) ||
          (isEnglish ? 'Could not delete review.' : 'تعذر حذف التقييم.'),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="space-y-4 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-medium">
              <Star className="size-4 fill-primary text-primary" />
              {isEnglish ? 'Post-completion review' : 'تقييم بعد إنجاز العقد'}
            </div>
            <p className="text-sm text-muted-foreground">
              {myReview
                ? isEnglish
                  ? 'You already reviewed this contract.'
                  : 'قمت بتقييم هذا العقد سابقاً.'
                : isEnglish
                  ? `Review ${targetName || 'the other party'} after completion.`
                  : `قيّم ${targetName || 'الطرف الآخر'} بعد إنجاز العقد.`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {myReview ? (
              <Badge variant="outline" className="border-yellow-200 bg-yellow-50 text-yellow-700">
                {myReview.rating}/5
              </Badge>
            ) : null}
            <Button variant="outline" disabled={loading} onClick={() => void openReview()}>
              {loading ? <LoaderCircle className="me-2 size-4 animate-spin" /> : null}
              {open
                ? isEnglish ? 'Close' : 'إغلاق'
                : myReview
                  ? isEnglish ? 'Edit review' : 'تعديل التقييم'
                  : isEnglish ? 'Add review' : 'إضافة تقييم'}
            </Button>
          </div>
        </div>

        {open ? (
          <div className="space-y-4 rounded-md border bg-background p-4">
            {message ? <p className="text-sm text-green-700">{message}</p> : null}
            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <div className="grid gap-3 sm:grid-cols-[180px_1fr]">
              <div className="space-y-2">
                <Label>{isEnglish ? 'Rating' : 'التقييم'}</Label>
                <Select value={rating} onValueChange={setRating}>
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

              <div className="space-y-2">
                <Label htmlFor={`contract-review-${contract.id}`}>
                  {isEnglish ? 'Comment' : 'التعليق'}
                </Label>
                <Textarea
                  id={`contract-review-${contract.id}`}
                  rows={3}
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder={
                    isEnglish
                      ? 'Write a short note about the experience.'
                      : 'اكتب ملاحظة قصيرة عن تجربة العمل.'
                  }
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button disabled={saving || loading} onClick={() => void saveReview()}>
                {saving ? <LoaderCircle className="me-2 size-4 animate-spin" /> : null}
                {myReview ? (isEnglish ? 'Save changes' : 'حفظ التعديل') : isEnglish ? 'Save review' : 'حفظ التقييم'}
              </Button>
              {myReview ? (
                <Button
                  variant="destructive"
                  disabled={saving || loading}
                  onClick={() => void removeReview()}
                >
                  <Trash2 className="me-2 size-4" />
                  {isEnglish ? 'Delete review' : 'حذف التقييم'}
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
