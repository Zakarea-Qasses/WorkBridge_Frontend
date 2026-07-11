import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { LoaderCircle, Pencil, RefreshCw, Trash2 } from 'lucide-react';
import DashboardLayout from '@/app/components/layout';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea } from '@/app/components/ui';
import { getApiErrorMessage, getValidationErrors } from '@/app/api/client';
import { deleteService, getCategories, getServices, updateService, type Category, type Service } from '@/app/api/endpoints';
import { useAuth } from '@/app/providers/AuthProvider';
import { useLanguage } from '@/app/providers/LanguageProvider';
import { categoryDisplayName } from '@/app/utils/categoryLabels';

export default function MyServices() {
  const { user } = useAuth();
  const { isEnglish, language } = useLanguage();
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Service | null>(null);
  const [draft, setDraft] = useState({ title: '', category_id: '', price: '', delivery_days: '', description: '' });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setFeedback('');
    try {
      const [allServices, allCategories] = await Promise.all([getServices(), getCategories()]);
      setServices(allServices.filter((service) => service.user_id === user?.id));
      setCategories(allCategories);
    } catch {
      setFeedback(isEnglish ? 'Unable to load your services.' : 'تعذر تحميل خدماتك');
    } finally {
      setLoading(false);
    }
  }, [isEnglish, user?.id]);

  useEffect(() => { load(); }, [load]);

  const beginEdit = (service: Service) => {
    setEditing(service);
    setErrors({});
    setFeedback('');
    setDraft({
      title: service.title,
      category_id: String(service.category_id),
      price: String(service.price),
      delivery_days: String(service.delivery_days),
      description: service.description || '',
    });
  };

  const save = async () => {
    if (!editing) return;
    try {
      setBusyId(editing.id);
      setErrors({});
      const updated = await updateService(editing.id, {
        title: draft.title.trim(),
        category_id: Number(draft.category_id),
        price: Number(draft.price),
        delivery_days: Number(draft.delivery_days),
        description: draft.description.trim() || null,
      });
      const hydrated = { ...updated, category: categories.find((item) => item.id === Number(draft.category_id)), user: editing.user };
      setServices((current) => current.map((item) => item.id === editing.id ? hydrated : item));
      setEditing(null);
      setFeedback(isEnglish ? 'Service updated successfully.' : 'تم تعديل الخدمة بنجاح');
    } catch (error) {
      setErrors(getValidationErrors(error));
      setFeedback(getApiErrorMessage(error));
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (service: Service) => {
    const confirmed = window.confirm(isEnglish ? 'Are you sure you want to delete this service?' : 'هل أنت متأكد من حذف هذه الخدمة؟');
    if (!confirmed) return;
    try {
      setBusyId(service.id);
      await deleteService(service.id);
      setServices((current) => current.filter((item) => item.id !== service.id));
      setFeedback(isEnglish ? 'Service deleted successfully.' : 'تم حذف الخدمة بنجاح');
    } catch (error) {
      setFeedback(getApiErrorMessage(error));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div><h1 className="text-3xl font-bold">{isEnglish ? 'My Services' : 'خدماتي'}</h1><p className="mt-1 text-muted-foreground">{isEnglish ? 'Manage services published by your account.' : 'إدارة الخدمات المنشورة من حسابك.'}</p></div>
          <Button asChild><Link to="/services/create">{isEnglish ? 'Publish New Service' : 'نشر خدمة جديدة'}</Link></Button>
        </div>

        {feedback ? <Card className="border-primary/20 bg-primary/5"><CardContent className="pt-6 text-sm">{feedback}</CardContent></Card> : null}

        {editing ? (
          <Card>
            <CardHeader><CardTitle>{isEnglish ? 'Edit Service' : 'تعديل الخدمة'}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label>{isEnglish ? 'Title' : 'العنوان'}</Label><Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />{errors.title?.[0] ? <p className="text-xs text-destructive">{errors.title[0]}</p> : null}</div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2"><Label>{isEnglish ? 'Category' : 'التصنيف'}</Label><Select value={draft.category_id} onValueChange={(value) => setDraft({ ...draft, category_id: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{categories.map((category) => <SelectItem key={category.id} value={String(category.id)}>{categoryDisplayName(category.name, isEnglish)}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2"><Label>{isEnglish ? 'Price' : 'السعر'}</Label><Input type="number" min="0" value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value })} /></div>
                <div className="space-y-2"><Label>{isEnglish ? 'Delivery days' : 'مدة التسليم'}</Label><Input type="number" min="1" value={draft.delivery_days} onChange={(e) => setDraft({ ...draft, delivery_days: e.target.value })} /></div>
              </div>
              <div className="space-y-2"><Label>{isEnglish ? 'Description' : 'الوصف'}</Label><Textarea rows={4} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></div>
              <div className="flex gap-2"><Button onClick={save} disabled={busyId === editing.id}>{busyId === editing.id ? <LoaderCircle className="me-2 size-4 animate-spin" /> : null}{isEnglish ? 'Save' : 'حفظ'}</Button><Button variant="outline" onClick={() => setEditing(null)}>{isEnglish ? 'Cancel' : 'إلغاء'}</Button></div>
            </CardContent>
          </Card>
        ) : null}

        {loading ? <div className="h-48 animate-pulse rounded-lg bg-muted" /> : services.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">{isEnglish ? 'You have not published any services yet.' : 'لم تنشر أي خدمات حتى الآن.'}<div className="mt-4"><Button variant="outline" onClick={load}><RefreshCw className="me-2 size-4" />{isEnglish ? 'Refresh' : 'تحديث'}</Button></div></CardContent></Card>
        ) : (
          <div className="grid gap-4">
            {services.map((service) => (
              <Card key={service.id}><CardContent className="flex flex-col justify-between gap-4 pt-6 md:flex-row md:items-center">
                <div><h2 className="font-semibold">{service.title}</h2><p className="mt-1 text-sm text-muted-foreground">{categoryDisplayName(service.category?.name, isEnglish) || (isEnglish ? 'No category' : 'بدون تصنيف')} · {service.price} · {service.delivery_days} {isEnglish ? 'days' : 'يوم'}</p></div>
                <div className="flex gap-2"><Button variant="outline" onClick={() => beginEdit(service)}><Pencil className="me-2 size-4" />{isEnglish ? 'Edit' : 'تعديل'}</Button><Button variant="destructive" disabled={busyId === service.id} onClick={() => remove(service)}><Trash2 className="me-2 size-4" />{isEnglish ? 'Delete' : 'حذف'}</Button></div>
              </CardContent></Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
