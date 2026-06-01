import { useMemo, useState } from 'react';
import { FileText, ShieldAlert } from 'lucide-react';
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
import { getDisplayStatusLabel, getDisplayTypeLabel, getStatusClasses } from '@/app/data';
import {
  AdminProjectRecord,
  deleteAdminProject,
  getAdminProjectRecords,
  processAdminProject,
  resetAdminProjectRecords,
} from '@/app/storage';

type ProcessedAdminProject = AdminProjectRecord & {
  processedAt: string;
  actionLabel: string;
};

function getAdminProjectTypeLabel(type: string, isEnglish: boolean) {
  if (!isEnglish) {
    return type;
  }

  switch (type.trim()) {
    case 'مشروع حر':
      return 'Freelance project';
    case 'إعلان وظيفي':
      return 'Job posting';
    case 'خدمة مستقلة':
      return 'Freelance service';
    default:
      return getDisplayTypeLabel(type, true);
  }
}

function getAdminProjectActionLabel(actionLabel: string, isEnglish: boolean) {
  if (!isEnglish) {
    return actionLabel;
  }

  switch (actionLabel.trim()) {
    case 'اعتماد أو إغلاق':
      return 'Approved or closed';
    default:
      return actionLabel;
  }
}

function getAdminProjectOwnerLabel(owner: string, isEnglish: boolean) {
  if (!isEnglish) {
    return owner;
  }

  const ownerMap: Record<string, string> = {
    'شركة ألفا': 'Alpha Company',
    'شركة التقنية المتقدمة': 'Advanced Tech Company',
    'خالد سعيد': 'Khaled Saeed',
    'مؤسسة النجاح': 'Al Najah Foundation',
    'دار الأناقة': 'Elegance House',
  };

  return ownerMap[owner.trim()] ?? owner;
}

function getAdminProjectProcessedDateLabel(processedAt: string, isEnglish: boolean) {
  if (!isEnglish) {
    return processedAt;
  }

  const normalized = processedAt.trim();
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  const westernDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

  let converted = normalized;
  arabicDigits.forEach((digit, index) => {
    converted = converted.replaceAll(digit, westernDigits[index]);
  });

  const parts = converted.split(/[\/]/).map((part) => part.trim()).filter(Boolean);
  if (parts.length === 3) {
    const [day, month, year] = parts;
    return `${year}/${month.padStart(2, '0')}/${day.padStart(2, '0')}`;
  }

  return converted;
}

export default function AdminProjects() {
  const { language, isEnglish } = useLanguage();
  const [items, setItems] = useState<AdminProjectRecord[]>(() => getAdminProjectRecords());
  const [selectedItemId, setSelectedItemId] = useState<number>(
    getAdminProjectRecords().find((item) => !item.processedAt)?.id ?? 0,
  );
  const [feedback, setFeedback] = useState(
    isEnglish
      ? 'Review reported or pending items and take the appropriate administrative action.'
      : 'يمكنك مراجعة العناصر المبلغ عنها أو التي تنتظر اعتمادًا واتخاذ الإجراء المناسب.',
  );

  const openItems = useMemo(() => items.filter((item) => !item.processedAt), [items]);
  const processedItems = useMemo(
    () =>
      items.filter(
        (item): item is ProcessedAdminProject => Boolean(item.processedAt && item.actionLabel),
      ),
    [items],
  );

  const selectedItem = openItems.find((item) => item.id === selectedItemId) ?? openItems[0] ?? null;

  const handleProcessItem = (item: AdminProjectRecord, actionLabel: string) => {
    const nextItems = processAdminProject(item.id, actionLabel);
    const nextOpenItems = nextItems.filter((currentItem) => !currentItem.processedAt);

    setItems(nextItems);
    setSelectedItemId(nextOpenItems[0]?.id ?? 0);
    setFeedback(
      isEnglish
        ? `"${item.title}" was processed and moved to the handled section.`
        : `تم ${actionLabel} "${item.title}" ونقله إلى قسم تمت معالجته.`,
    );
  };

  const handleDeletePost = (item: AdminProjectRecord) => {
    const nextItems = deleteAdminProject(item.id);
    const nextOpenItems = nextItems.filter((currentItem) => !currentItem.processedAt);

    setItems(nextItems);
    setSelectedItemId(nextOpenItems[0]?.id ?? 0);
    setFeedback(
      isEnglish
        ? `"${item.title}" was deleted from content management.`
        : `تم حذف المنشور "${item.title}" من إدارة المحتوى.`,
    );
  };

  const handleShowExamples = () => {
    const nextItems = resetAdminProjectRecords();
    const nextOpenItems = nextItems.filter((currentItem) => !currentItem.processedAt);

    setItems(nextItems);
    setSelectedItemId(nextOpenItems[0]?.id ?? 0);
    setFeedback(
      isEnglish
        ? 'Example content items were added so you can test the delete post button.'
        : 'تمت إضافة أمثلة محتوى حتى تستطيع تجربة زر حذف منشور.',
    );
  };

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <section className="rounded-3xl bg-gradient-to-l from-slate-900 via-blue-900 to-blue-700 p-6 text-white">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold">
                {isEnglish ? 'Content management' : 'إدارة المحتوى'}
              </h2>
              <p className="mt-2 text-blue-100">
                {isEnglish
                  ? 'Review jobs, services, and projects that need approval or were reported.'
                  : 'مراجعة الوظائف والخدمات والمشاريع التي تحتاج اعتمادًا أو وصلت عليها بلاغات.'}
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-3 text-sm text-white">
              <p className="text-blue-100">
                {isEnglish ? 'Items needing action' : 'عناصر تحتاج متابعة'}
              </p>
              <p className="mt-1 text-2xl font-bold">{openItems.length}</p>
            </div>
          </div>
        </section>

        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6 text-sm text-primary">{feedback}</CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader>
              <CardTitle>{isEnglish ? 'Items under review' : 'العناصر المعروضة للمراجعة'}</CardTitle>
              <CardDescription>
                {isEnglish
                  ? 'This list gathers content that needs a quick administrative decision.'
                  : 'هذه القائمة تجمع المحتوى الذي يحتاج قرارًا إداريًا سريعًا.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {openItems.length === 0 ? (
                <div className="space-y-4 rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  {isEnglish
                    ? 'There are no open items right now. Any new items will appear here automatically.'
                    : 'لا توجد عناصر مفتوحة حاليًا. ستظهر أي عناصر جديدة هنا تلقائيًا.'}
                </div>
              ) : null}

              {openItems.length === 0 ? (
                <div className="flex justify-center">
                  <Button type="button" variant="outline" onClick={handleShowExamples}>
                    {isEnglish ? 'Show examples' : 'إظهار أمثلة'}
                  </Button>
                </div>
              ) : null}

              {openItems.map((item) => (
                <div key={item.id} className="rounded-2xl border border-border p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <FileText className="size-4 text-primary" />
                        <h3 className="font-semibold">{item.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {getAdminProjectTypeLabel(item.type, isEnglish)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {isEnglish ? 'Owner:' : 'المالك:'}{' '}
                        <span className="font-medium text-foreground">
                          {getAdminProjectOwnerLabel(item.owner, isEnglish)}
                        </span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {isEnglish ? 'Related side:' : 'الجهة المرتبطة:'}{' '}
                        <span className="font-medium text-foreground">{item.assignee}</span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {isEnglish ? 'Value:' : 'القيمة:'}{' '}
                        <span className="font-medium text-foreground">{item.budget}</span>
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={getStatusClasses(item.status)}>
                        {getDisplayStatusLabel(item.status, isEnglish)}
                      </Badge>
                      {(item.status === 'قيد المراجعة' ||
                        item.status === 'نشط' ||
                        item.status === 'قيد التنفيذ') && (
                        <Badge variant="outline" className="gap-1">
                          <ShieldAlert className="size-3.5" />
                          {isEnglish ? 'Needs follow-up' : 'يحتاج متابعة'}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={() =>
                        handleProcessItem(item, isEnglish ? 'Approved or closed' : 'اعتماد أو إغلاق')
                      }
                    >
                      {isEnglish ? 'Approve or close' : 'اعتماد أو إغلاق'}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedItemId(item.id);
                        setFeedback(
                          isEnglish
                            ? `Details for "${item.title}" are now shown in the side panel.`
                            : `تم عرض تفاصيل "${item.title}" في اللوحة الجانبية.`,
                        );
                      }}
                    >
                      {isEnglish ? 'View details' : 'عرض التفاصيل'}
                    </Button>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeletePost(item)}
                    >
                      {isEnglish ? 'Delete post' : 'حذف منشور'}
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{isEnglish ? 'Item details' : 'تفاصيل العنصر'}</CardTitle>
              <CardDescription>
                {isEnglish
                  ? 'Inspect the item first, then take the right action from the review list.'
                  : 'استعرض بيانات العنصر أولًا، ثم اتخذ القرار المناسب من قائمة المراجعة.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedItem ? (
                <div className="space-y-4 rounded-2xl border border-border bg-muted/20 p-5">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">{selectedItem.title}</h3>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={getStatusClasses(selectedItem.status)}>
                        {getDisplayStatusLabel(selectedItem.status, isEnglish)}
                      </Badge>
                      <Badge variant="outline">
                        {getAdminProjectTypeLabel(selectedItem.type, isEnglish)}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <p>
                      {isEnglish ? 'Owner:' : 'المالك:'}{' '}
                      <span className="font-medium">
                        {getAdminProjectOwnerLabel(selectedItem.owner, isEnglish)}
                      </span>
                    </p>
                    <p>
                      {isEnglish ? 'Related side:' : 'الجهة المرتبطة:'}{' '}
                      <span className="font-medium">{selectedItem.assignee}</span>
                    </p>
                    <p>
                      {isEnglish ? 'Related value:' : 'القيمة المرتبطة:'}{' '}
                      <span className="font-medium">{selectedItem.budget}</span>
                    </p>
                  </div>

                  <div className="rounded-2xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
                    {isEnglish
                      ? 'Viewing details does not remove the item. The actual action only happens when you press approve or close.'
                      : 'عرض التفاصيل لا يزيل العنصر. الإجراء الفعلي يحصل فقط عند الضغط على زر الاعتماد أو الإغلاق.'}
                  </div>

                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => handleDeletePost(selectedItem)}
                  >
                    {isEnglish ? 'Delete post' : 'حذف منشور'}
                  </Button>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  {isEnglish
                    ? 'Choose any item with the view details button to show its explanation here.'
                    : 'اختر أي عنصر من زر عرض التفاصيل ليظهر شرحه هنا.'}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {processedItems.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>{isEnglish ? 'Handled items' : 'تمت معالجته'}</CardTitle>
              <CardDescription>
                {isEnglish
                  ? 'Items that already received a final action inside content management.'
                  : 'العناصر التي اتخذت لها قرارًا بالفعل داخل إدارة المحتوى.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {processedItems.map((item) => (
                <div key={item.id} className="rounded-2xl border border-border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {getAdminProjectTypeLabel(item.type, isEnglish)}
                      </p>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                      {isEnglish ? 'Done' : 'تم'}
                    </Badge>
                  </div>

                  <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                    <p>
                      {isEnglish ? 'Action:' : 'الإجراء:'}{' '}
                      <span className="font-medium text-foreground">
                        {getAdminProjectActionLabel(item.actionLabel, isEnglish)}
                      </span>
                    </p>
                    <p>
                      {isEnglish ? 'Owner:' : 'المالك:'}{' '}
                      <span className="font-medium text-foreground">
                        {getAdminProjectOwnerLabel(item.owner, isEnglish)}
                      </span>
                    </p>
                    <p>
                      {isEnglish ? 'Processed on:' : 'تمت المعالجة بتاريخ:'}{' '}
                      <span className="font-medium text-foreground">
                        {getAdminProjectProcessedDateLabel(item.processedAt, isEnglish)}
                      </span>
                    </p>
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
