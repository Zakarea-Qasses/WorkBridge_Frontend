import { useEffect, useMemo, useState } from 'react';
import { BriefcaseBusiness, FileText, LoaderCircle, Pencil, Plus, RefreshCw, Search, Trash2 } from 'lucide-react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui';
import { getApiErrorMessage } from '@/app/api/client';
import {
  AdminContentStatus,
  AdminContentType,
  Category,
  JobPost,
  PaginatedResponse,
  Service,
  UserProject,
  createAdminContentCategory,
  deleteAdminContentCategory,
  deleteAdminContentJob,
  deleteAdminContentProject,
  deleteAdminContentService,
  getAdminContentCategories,
  getAdminContentJobs,
  getAdminContentProjects,
  getAdminContentServices,
  updateAdminContentCategory,
  updateAdminJobStatus,
  updateAdminProjectStatus,
  updateAdminServiceStatus,
} from '@/app/api/endpoints';
import { categoryDisplayName } from '@/app/utils/categoryLabels';

type StatusFilter = 'all' | AdminContentStatus;
type Feedback = { type: 'success' | 'error'; message: string } | null;
type AdminContentItem = UserProject | Service | JobPost;
type AdminContentTab = AdminContentType | 'categories';

const contentTypes: Array<{
  value: AdminContentTab;
  labelAr: string;
  labelEn: string;
}> = [
  { value: 'projects', labelAr: 'المشاريع', labelEn: 'Projects' },
  { value: 'services', labelAr: 'الخدمات', labelEn: 'Services' },
  { value: 'jobs', labelAr: 'الوظائف', labelEn: 'Jobs' },
  { value: 'categories', labelAr: 'التصنيفات', labelEn: 'Categories' },
];

const statusOptions: Array<{ value: AdminContentStatus; labelAr: string; labelEn: string }> = [
  { value: 'active', labelAr: 'نشط', labelEn: 'Active' },
  { value: 'paused', labelAr: 'متوقف مؤقتا', labelEn: 'Paused' },
  { value: 'closed', labelAr: 'مغلق', labelEn: 'Closed' },
];

function getStatusLabel(status: string | undefined, isEnglish: boolean) {
  if (status === 'paused') {
    return isEnglish ? 'Paused' : 'متوقف مؤقتا';
  }

  if (status === 'closed') {
    return isEnglish ? 'Closed' : 'مغلق';
  }

  return isEnglish ? 'Active' : 'نشط';
}

function getStatusClass(status: string | undefined) {
  if (status === 'paused') {
    return 'bg-amber-100 text-amber-700 border-amber-200';
  }

  if (status === 'closed') {
    return 'bg-slate-100 text-slate-700 border-slate-200';
  }

  return 'bg-green-100 text-green-700 border-green-200';
}

function formatDate(value: string | undefined, isEnglish: boolean) {
  if (!value) {
    return isEnglish ? 'Not available' : 'غير متوفر';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(isEnglish ? 'en' : 'ar', { dateStyle: 'medium' }).format(date);
}

function formatAmount(value: number | string | null | undefined, isEnglish: boolean) {
  if (value === null || value === undefined || value === '') {
    return isEnglish ? 'Not available' : 'غير متوفر';
  }

  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    return String(value);
  }

  return new Intl.NumberFormat(isEnglish ? 'en' : 'ar', {
    maximumFractionDigits: 2,
  }).format(amount);
}

function getOwnerName(item: AdminContentItem, type: AdminContentType) {
  if (type === 'jobs') {
    const job = item as JobPost;
    return job.company?.company_name || job.company?.user?.name || job.company?.user?.email || '';
  }

  return (item as UserProject | Service).user?.name || (item as UserProject | Service).user?.email || '';
}

function getCategoryName(item: AdminContentItem, type: AdminContentType) {
  if (type === 'jobs') {
    const job = item as JobPost;
    return job.city?.name || job.location_type || '';
  }

  return (item as UserProject | Service).category?.name || '';
}

function getContentValue(item: AdminContentItem, type: AdminContentType, isEnglish: boolean) {
  if (type === 'projects') {
    return `${isEnglish ? 'Budget' : 'الميزانية'}: ${formatAmount((item as UserProject).budget, isEnglish)}`;
  }

  if (type === 'services') {
    return `${isEnglish ? 'Price' : 'السعر'}: ${formatAmount((item as Service).price, isEnglish)}`;
  }

  return `${isEnglish ? 'Salary' : 'الراتب'}: ${formatAmount((item as JobPost).salary, isEnglish)}`;
}

function getContentDescription(item: AdminContentItem) {
  return item.description || '';
}

export default function AdminProjects() {
  const { language, isEnglish } = useLanguage();
  const [activeType, setActiveType] = useState<AdminContentTab>('projects');
  const [items, setItems] = useState<AdminContentItem[]>([]);
  const [pagination, setPagination] = useState<PaginatedResponse<AdminContentItem> | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [categoryName, setCategoryName] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actingKey, setActingKey] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const activeLabel = useMemo(() => {
    const type = contentTypes.find((item) => item.value === activeType);
    return isEnglish ? type?.labelEn : type?.labelAr;
  }, [activeType, isEnglish]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [search]);

  const loadContent = async () => {
    setLoading(true);
    setFeedback(null);

    try {
      if (activeType === 'categories') {
        const response = await getAdminContentCategories();
        setCategories(response);
        setItems([]);
        setPagination(null);
        return;
      }

      const params = {
        page,
        search: debouncedSearch || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
      };
      const response =
        activeType === 'projects'
          ? await getAdminContentProjects(params)
          : activeType === 'services'
            ? await getAdminContentServices(params)
            : await getAdminContentJobs(params);

      setPagination(response as PaginatedResponse<AdminContentItem>);
      setItems(response.data as AdminContentItem[]);
    } catch (error) {
      setItems([]);
      setCategories([]);
      setPagination(null);
      setFeedback({ type: 'error', message: getApiErrorMessage(error) });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
  }, [activeType, debouncedSearch, statusFilter, page]);

  const resetForType = (type: AdminContentTab) => {
    setActiveType(type);
    setPage(1);
    setFeedback(null);
    setSearch('');
    setStatusFilter('all');
    setEditingCategoryId(null);
    setEditingCategoryName('');
  };

  const updateStatus = async (item: AdminContentItem, status: AdminContentStatus) => {
    const actionKey = `${activeType}-${item.id}-${status}`;
    try {
      setActingKey(actionKey);
      setFeedback(null);

      if (activeType === 'projects') {
        await updateAdminProjectStatus(item.id, status);
      } else if (activeType === 'services') {
        await updateAdminServiceStatus(item.id, status);
      } else {
        await updateAdminJobStatus(item.id, status);
      }

      setFeedback({
        type: 'success',
        message: isEnglish
          ? `Status updated to ${getStatusLabel(status, true)}.`
          : `تم تحديث الحالة إلى ${getStatusLabel(status, false)}.`,
      });
      await loadContent();
    } catch (error) {
      setFeedback({ type: 'error', message: getApiErrorMessage(error) });
    } finally {
      setActingKey(null);
    }
  };

  const deleteItem = async (item: AdminContentItem) => {
    const confirmed = window.confirm(
      isEnglish
        ? `Delete "${item.title}" from content management?`
        : `هل تريد حذف "${item.title}" من إدارة المحتوى؟`,
    );

    if (!confirmed) {
      return;
    }

    const actionKey = `${activeType}-${item.id}-delete`;
    try {
      setActingKey(actionKey);
      setFeedback(null);

      if (activeType === 'projects') {
        await deleteAdminContentProject(item.id);
      } else if (activeType === 'services') {
        await deleteAdminContentService(item.id);
      } else {
        await deleteAdminContentJob(item.id);
      }

      setFeedback({
        type: 'success',
        message: isEnglish ? 'Post deleted successfully.' : 'تم حذف المنشور بنجاح.',
      });
      await loadContent();
    } catch (error) {
      setFeedback({ type: 'error', message: getApiErrorMessage(error) });
    } finally {
      setActingKey(null);
    }
  };

  const createCategory = async () => {
    const name = categoryName.trim();
    if (!name) {
      setFeedback({
        type: 'error',
        message: isEnglish ? 'Enter category name.' : 'أدخل اسم التصنيف.',
      });
      return;
    }

    try {
      setActingKey('category-create');
      setFeedback(null);
      await createAdminContentCategory(name);
      setCategoryName('');
      setFeedback({
        type: 'success',
        message: isEnglish ? 'Category created successfully.' : 'تم إنشاء التصنيف بنجاح.',
      });
      await loadContent();
    } catch (error) {
      setFeedback({ type: 'error', message: getApiErrorMessage(error) });
    } finally {
      setActingKey(null);
    }
  };

  const startEditCategory = (category: Category) => {
    setEditingCategoryId(category.id);
    setEditingCategoryName(category.name);
    setFeedback(null);
  };

  const updateCategory = async (category: Category) => {
    const name = editingCategoryName.trim();
    if (!name) {
      setFeedback({
        type: 'error',
        message: isEnglish ? 'Enter category name.' : 'أدخل اسم التصنيف.',
      });
      return;
    }

    try {
      setActingKey(`category-${category.id}-update`);
      setFeedback(null);
      await updateAdminContentCategory(category.id, name);
      setEditingCategoryId(null);
      setEditingCategoryName('');
      setFeedback({
        type: 'success',
        message: isEnglish ? 'Category updated successfully.' : 'تم تحديث التصنيف بنجاح.',
      });
      await loadContent();
    } catch (error) {
      setFeedback({ type: 'error', message: getApiErrorMessage(error) });
    } finally {
      setActingKey(null);
    }
  };

  const deleteCategory = async (category: Category) => {
    const confirmed = window.confirm(
      isEnglish
        ? `Delete category "${categoryDisplayName(category.name, true)}"?`
        : `هل تريد حذف التصنيف "${categoryDisplayName(category.name, false)}"؟`,
    );

    if (!confirmed) return;

    try {
      setActingKey(`category-${category.id}-delete`);
      setFeedback(null);
      await deleteAdminContentCategory(category.id);
      setFeedback({
        type: 'success',
        message: isEnglish ? 'Category deleted successfully.' : 'تم حذف التصنيف بنجاح.',
      });
      await loadContent();
    } catch (error) {
      setFeedback({ type: 'error', message: getApiErrorMessage(error) });
    } finally {
      setActingKey(null);
    }
  };

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <section className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-3xl font-bold">
              {isEnglish ? 'Content management' : 'إدارة المحتوى'}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {isEnglish
                ? 'Review projects, services, and jobs, then change publication status when needed.'
                : 'عرض المشاريع والخدمات والوظائف وتغيير حالة النشر عند الحاجة.'}
            </p>
          </div>
          <Button variant="outline" onClick={loadContent} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {isEnglish ? 'Refresh' : 'تحديث'}
          </Button>
        </section>

        {feedback ? (
          <Card
            className={
              feedback.type === 'error'
                ? 'border-destructive/30 bg-destructive/5'
                : 'border-primary/20 bg-primary/5'
            }
          >
            <CardContent
              className={
                feedback.type === 'error'
                  ? 'pt-6 text-sm text-destructive'
                  : 'pt-6 text-sm text-primary'
              }
            >
              {feedback.message}
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <CardTitle>{activeLabel}</CardTitle>
                <CardDescription>
                  {pagination
                    ? `${pagination.total} ${isEnglish ? 'items total' : 'عنصر بالمجموع'}`
                    : isEnglish
                      ? 'Manage platform content from one place.'
                      : 'إدارة محتوى المنصة من مكان واحد.'}
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                {contentTypes.map((type) => (
                  <Button
                    key={type.value}
                    variant={activeType === type.value ? 'default' : 'outline'}
                    onClick={() => resetForType(type.value)}
                  >
                    {isEnglish ? type.labelEn : type.labelAr}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {activeType !== 'categories' ? (
            <div className="grid gap-3 lg:grid-cols-[1fr_260px]">
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground ltr:left-3 rtl:right-3" />
                <Input
                  className="ltr:pl-9 rtl:pr-9"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={
                    isEnglish ? 'Search by title or description' : 'ابحث حسب العنوان أو الوصف'
                  }
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value as StatusFilter);
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isEnglish ? 'All statuses' : 'كل الحالات'}</SelectItem>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {isEnglish ? status.labelEn : status.labelAr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            ) : null}

            {loading ? (
              <div className="flex min-h-44 items-center justify-center gap-2 rounded-lg border border-dashed text-sm text-muted-foreground">
                <LoaderCircle className="h-4 w-4 animate-spin" />
                {isEnglish ? 'Loading content...' : 'جار تحميل المحتوى...'}
              </div>
            ) : null}

            {!loading && activeType === 'categories' ? (
              <div className="space-y-4">
                <div className="grid gap-3 rounded-lg border p-4 md:grid-cols-[1fr_auto]">
                  <Input
                    value={categoryName}
                    onChange={(event) => setCategoryName(event.target.value)}
                    placeholder={isEnglish ? 'New category name' : 'اسم التصنيف الجديد'}
                    disabled={actingKey === 'category-create'}
                  />
                  <Button onClick={() => void createCategory()} disabled={actingKey === 'category-create'}>
                    {actingKey === 'category-create' ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                    {isEnglish ? 'Add category' : 'إضافة تصنيف'}
                  </Button>
                </div>

                {categories.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                    {isEnglish ? 'No categories found.' : 'لا توجد تصنيفات.'}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {categories.map((category) => {
                      const isEditing = editingCategoryId === category.id;
                      return (
                        <Card key={category.id}>
                          <CardContent className="flex flex-col gap-3 pt-6 md:flex-row md:items-center md:justify-between">
                            <div className="min-w-0 flex-1">
                              {isEditing ? (
                                <Input
                                  value={editingCategoryName}
                                  onChange={(event) => setEditingCategoryName(event.target.value)}
                                  autoFocus
                                />
                              ) : (
                                <>
                                  <h3 className="font-semibold">{categoryDisplayName(category.name, isEnglish)}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    {isEnglish ? 'Category ID' : 'رقم التصنيف'}: {category.id}
                                  </p>
                                </>
                              )}
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {isEditing ? (
                                <>
                                  <Button
                                    size="sm"
                                    disabled={actingKey !== null}
                                    onClick={() => void updateCategory(category)}
                                  >
                                    {actingKey === `category-${category.id}-update` ? (
                                      <LoaderCircle className="h-4 w-4 animate-spin" />
                                    ) : null}
                                    {isEnglish ? 'Save' : 'حفظ'}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={actingKey !== null}
                                    onClick={() => {
                                      setEditingCategoryId(null);
                                      setEditingCategoryName('');
                                    }}
                                  >
                                    {isEnglish ? 'Cancel' : 'إلغاء'}
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={actingKey !== null}
                                    onClick={() => startEditCategory(category)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                    {isEnglish ? 'Edit' : 'تعديل'}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    disabled={actingKey !== null}
                                    onClick={() => void deleteCategory(category)}
                                  >
                                    {actingKey === `category-${category.id}-delete` ? (
                                      <LoaderCircle className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-4 w-4" />
                                    )}
                                    {isEnglish ? 'Delete' : 'حذف'}
                                  </Button>
                                </>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : null}

            {!loading && activeType !== 'categories' && items.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                {isEnglish
                  ? 'No content matches the current filters.'
                  : 'لا يوجد محتوى مطابق للفلاتر الحالية.'}
              </div>
            ) : null}

            {!loading && activeType !== 'categories' && items.length > 0 ? (
              <div className="space-y-4">
                {items.map((item) => {
                  const currentStatus = (item.status || 'active') as AdminContentStatus;
                  const ownerName = getOwnerName(item, activeType);
                  const categoryName = getCategoryName(item, activeType);
                  const displayCategoryName =
                    activeType === 'jobs' ? categoryName : categoryDisplayName(categoryName, isEnglish);

                  return (
                    <Card key={`${activeType}-${item.id}`}>
                      <CardContent className="pt-6">
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                          <div className="min-w-0 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              {activeType === 'jobs' ? (
                                <BriefcaseBusiness className="h-4 w-4 text-primary" />
                              ) : (
                                <FileText className="h-4 w-4 text-primary" />
                              )}
                              <h3 className="font-semibold">{item.title}</h3>
                              <Badge className={getStatusClass(currentStatus)}>
                                {getStatusLabel(currentStatus, isEnglish)}
                              </Badge>
                            </div>
                            <p className="line-clamp-2 text-sm text-muted-foreground">
                              {getContentDescription(item) ||
                                (isEnglish ? 'No description available.' : 'لا يوجد وصف متوفر.')}
                            </p>
                            <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
                              <span>
                                {isEnglish ? 'Owner' : 'المالك'}:{' '}
                                <strong className="font-medium text-foreground">
                                  {ownerName || (isEnglish ? 'Not available' : 'غير متوفر')}
                                </strong>
                              </span>
                              <span>
                                {isEnglish ? 'Category/location' : 'التصنيف/الموقع'}:{' '}
                                <strong className="font-medium text-foreground">
                                  {displayCategoryName || (isEnglish ? 'Not available' : 'غير متوفر')}
                                </strong>
                              </span>
                              <span>
                                <strong className="font-medium text-foreground">
                                  {getContentValue(item, activeType, isEnglish)}
                                </strong>
                              </span>
                              <span>
                                {isEnglish ? 'Created' : 'تاريخ النشر'}:{' '}
                                <strong className="font-medium text-foreground">
                                  {formatDate(item.created_at, isEnglish)}
                                </strong>
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 xl:justify-end">
                            {statusOptions.map((status) => {
                              const actionKey = `${activeType}-${item.id}-${status.value}`;
                              return (
                                <Button
                                  key={status.value}
                                  size="sm"
                                  variant={currentStatus === status.value ? 'default' : 'outline'}
                                  disabled={actingKey !== null || currentStatus === status.value}
                                  onClick={() => updateStatus(item, status.value)}
                                >
                                  {actingKey === actionKey ? (
                                    <LoaderCircle className="h-4 w-4 animate-spin" />
                                  ) : null}
                                  {isEnglish ? status.labelEn : status.labelAr}
                                </Button>
                              );
                            })}
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={actingKey !== null}
                              onClick={() => deleteItem(item)}
                            >
                              {actingKey === `${activeType}-${item.id}-delete` ? (
                                <LoaderCircle className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                              {isEnglish ? 'Delete' : 'حذف'}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : null}

            {pagination && pagination.last_page > 1 ? (
              <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4 text-sm text-muted-foreground">
                <span>
                  {isEnglish ? 'Page' : 'الصفحة'} {pagination.current_page} /{' '}
                  {pagination.last_page}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={loading || page <= 1}
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                  >
                    {isEnglish ? 'Previous' : 'السابق'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={loading || page >= pagination.last_page}
                    onClick={() => setPage((current) => current + 1)}
                  >
                    {isEnglish ? 'Next' : 'التالي'}
                  </Button>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
