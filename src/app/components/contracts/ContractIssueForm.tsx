import { useState } from 'react';
import { LoaderCircle, Paperclip, ShieldAlert, X } from 'lucide-react';
import { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea } from '@/app/components/ui';
import { getApiErrorMessage, getValidationErrors } from '@/app/api/client';
import type { ReportCategory } from '@/app/api/types';

export type ContractIssueCategory = Extract<ReportCategory, 'complaint' | 'dispute' | 'payment'>;

interface ContractIssueFormProps {
  contractId: number;
  otherPartyName: string;
  isEnglish: boolean;
  submitting: boolean;
  onCancel: () => void;
  onSubmit: (payload: {
    category: ContractIssueCategory;
    description: string;
    attachments: File[];
  }) => Promise<void>;
}

function categoryLabel(category: ContractIssueCategory, isEnglish: boolean) {
  const labels: Record<ContractIssueCategory, [string, string]> = {
    complaint: ['Complaint', 'شكوى'],
    dispute: ['Dispute', 'نزاع'],
    payment: ['Payment issue', 'مشكلة دفع'],
  };
  return labels[category][isEnglish ? 0 : 1];
}

export default function ContractIssueForm({
  contractId,
  otherPartyName,
  isEnglish,
  submitting,
  onCancel,
  onSubmit,
}: ContractIssueFormProps) {
  const [category, setCategory] = useState<ContractIssueCategory>('complaint');
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [error, setError] = useState('');

  const submit = async () => {
    const reason = description.trim();
    if (!reason) {
      setFieldErrors({
        description: [isEnglish ? 'Please explain the issue.' : 'يرجى توضيح سبب الطلب.'],
      });
      return;
    }

    try {
      setError('');
      setFieldErrors({});
      await onSubmit({ category, description: reason, attachments });
    } catch (submitError) {
      setFieldErrors(getValidationErrors(submitError));
      setError(getApiErrorMessage(submitError));
    }
  };

  return (
    <div className="space-y-4 rounded-md border border-amber-200 bg-amber-50/40 p-4">
      <div>
        <h3 className="font-semibold text-amber-900">
          {isEnglish ? 'Contract complaint or dispute' : 'شكوى أو نزاع على العقد'}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {isEnglish
            ? `Contract #${contractId} with ${otherPartyName}. The request will be sent to the admin.`
            : `العقد رقم ${contractId} مع ${otherPartyName}. سيتم إرسال الطلب والأدلة إلى الأدمن.`}
        </p>
      </div>

      <div className="space-y-2">
        <Label>{isEnglish ? 'Request type' : 'نوع الطلب'}</Label>
        <Select value={category} onValueChange={(value) => setCategory(value as ContractIssueCategory)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {(['complaint', 'dispute', 'payment'] as const).map((item) => (
              <SelectItem key={item} value={item}>{categoryLabel(item, isEnglish)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`contract-issue-reason-${contractId}`}>
          {isEnglish ? 'Reason and details' : 'السبب والتفاصيل'}
        </Label>
        <Textarea
          id={`contract-issue-reason-${contractId}`}
          rows={5}
          value={description}
          onChange={(event) => {
            setDescription(event.target.value);
            setFieldErrors((current) => ({ ...current, description: [] }));
          }}
        />
        {fieldErrors.description?.[0] ? <p className="text-xs text-destructive">{fieldErrors.description[0]}</p> : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor={`contract-issue-files-${contractId}`}>
          {isEnglish ? 'Evidence attachments' : 'صور ومستندات الأدلة'}
        </Label>
        <Input
          id={`contract-issue-files-${contractId}`}
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.webp,.gif,.pdf,.doc,.docx,.xls,.xlsx,.zip,.txt"
          onChange={(event) => {
            setAttachments((current) => [...current, ...Array.from(event.target.files || [])]);
            event.target.value = '';
          }}
        />
        {attachments.map((file, index) => (
          <div key={`${file.name}-${file.lastModified}-${index}`} className="flex items-center justify-between gap-2 rounded-md border bg-background px-3 py-2 text-sm">
            <span className="flex min-w-0 items-center gap-2"><Paperclip className="size-4 shrink-0" /><span className="truncate">{file.name}</span></span>
            <Button type="button" variant="ghost" size="icon" onClick={() => setAttachments((current) => current.filter((_, itemIndex) => itemIndex !== index))}>
              <X className="size-4" /><span className="sr-only">{isEnglish ? 'Remove' : 'إزالة'}</span>
            </Button>
          </div>
        ))}
        {fieldErrors.attachments?.[0] ? <p className="text-xs text-destructive">{fieldErrors.attachments[0]}</p> : null}
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="flex flex-wrap justify-end gap-2">
        <Button type="button" variant="outline" disabled={submitting} onClick={onCancel}>
          {isEnglish ? 'Cancel' : 'إلغاء'}
        </Button>
        <Button type="button" disabled={submitting} onClick={() => void submit()}>
          {submitting ? <LoaderCircle className="me-2 size-4 animate-spin" /> : <ShieldAlert className="me-2 size-4" />}
          {isEnglish ? 'Send to admin' : 'إرسال إلى الأدمن'}
        </Button>
      </div>
    </div>
  );
}
