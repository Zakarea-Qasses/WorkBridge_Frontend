import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { LoaderCircle } from 'lucide-react';
import DashboardLayout from '@/app/components/layout';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Textarea } from '@/app/components/ui';
import { ApiError, getApiErrorMessage, getValidationErrors } from '@/app/api/client';
import { getService, requestService, type Service } from '@/app/api/endpoints';
import { useAuth } from '@/app/providers/AuthProvider';
import { useLanguage } from '@/app/providers/LanguageProvider';

export default function RequestService() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isEnglish, language } = useLanguage();
  const [service, setService] = useState<Service | null>(null);
  const [form, setForm] = useState({ title: '', description: '', references: '', delivery_days: '' });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const numericId = Number(id);
    if (!Number.isInteger(numericId) || numericId <= 0) {
      setMessage(isEnglish ? 'Invalid service ID.' : 'رقم الخدمة غير صالح.');
      setLoading(false);
      return;
    }
    let mounted = true;
    getService(numericId).then((data) => { if (mounted) setService(data); }).catch((error) => {
      if (mounted) setMessage(error instanceof ApiError && error.status === 404 ? (isEnglish ? 'Service not found.' : 'الخدمة غير موجودة.') : (isEnglish ? 'Unable to load service.' : 'تعذر تحميل الخدمة.'));
    }).finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [id, isEnglish]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!service) return;
    try {
      setSubmitting(true);
      setMessage('');
      setErrors({});
      await requestService(service.id, {
        title: form.title.trim(),
        description: form.description.trim(),
        references: form.references.trim() || null,
        delivery_days: Number(form.delivery_days),
      });
      navigate('/services/requests', { replace: true });
    } catch (error) {
      setErrors(getValidationErrors(error));
      setMessage(getApiErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <div><h1 className="text-3xl font-bold">{isEnglish ? 'Request Service' : 'طلب خدمة'}</h1></div>
        {loading ? <div className="h-64 animate-pulse rounded-lg bg-muted" /> : !service ? (
          <Card><CardContent className="py-12 text-center"><p>{message}</p><Button asChild className="mt-4"><Link to="/services">{isEnglish ? 'Back to services' : 'العودة إلى الخدمات'}</Link></Button></CardContent></Card>
        ) : service.user_id === user?.id ? (
          <Card><CardContent className="py-12 text-center">{isEnglish ? 'You cannot request your own service.' : 'لا يمكنك طلب خدمتك أنت.'}</CardContent></Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_0.7fr]">
            <Card><CardHeader><CardTitle>{isEnglish ? 'Request details' : 'تفاصيل الطلب'}</CardTitle></CardHeader><CardContent>
              <form className="space-y-4" onSubmit={submit}>
                <div className="space-y-2"><Label>{isEnglish ? 'Title' : 'عنوان الطلب'}</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />{errors.title?.[0] ? <p className="text-xs text-destructive">{errors.title[0]}</p> : null}</div>
                <div className="space-y-2"><Label>{isEnglish ? 'Description' : 'تفاصيل الطلب'}</Label><Textarea rows={6} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />{errors.description?.[0] ? <p className="text-xs text-destructive">{errors.description[0]}</p> : null}</div>
                <div className="space-y-2"><Label>{isEnglish ? 'References' : 'روابط أو مراجع'}</Label><Textarea rows={3} value={form.references} onChange={(e) => setForm({ ...form, references: e.target.value })} /></div>
                <div className="space-y-2"><Label>{isEnglish ? 'Delivery days' : 'مدة التسليم المطلوبة بالأيام'}</Label><Input type="number" min="1" value={form.delivery_days} onChange={(e) => setForm({ ...form, delivery_days: e.target.value })} />{errors.delivery_days?.[0] ? <p className="text-xs text-destructive">{errors.delivery_days[0]}</p> : null}</div>
                {message ? <p className="text-sm text-destructive">{message}</p> : null}
                <Button className="w-full" disabled={submitting}>{submitting ? <LoaderCircle className="me-2 size-4 animate-spin" /> : null}{submitting ? (isEnglish ? 'Sending...' : 'جار الإرسال...') : (isEnglish ? 'Send Request' : 'إرسال الطلب')}</Button>
              </form>
            </CardContent></Card>
            <Card><CardHeader><CardTitle>{service.title}</CardTitle></CardHeader><CardContent className="space-y-3 text-sm"><p className="text-muted-foreground">{service.description || (isEnglish ? 'No description.' : 'لا يوجد وصف.')}</p><p>{isEnglish ? 'Provider:' : 'مقدم الخدمة:'} {service.user?.name}</p><p>{isEnglish ? 'Price:' : 'السعر:'} {service.price}</p><p>{isEnglish ? 'Default delivery:' : 'مدة التسليم:'} {service.delivery_days} {isEnglish ? 'days' : 'يوم'}</p></CardContent></Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
