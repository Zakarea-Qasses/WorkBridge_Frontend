import { useMemo, useState } from 'react';
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
  Textarea,
} from '@/app/components/ui';
import { companyProfile, getDisplayStatusLabel, getStatusClasses } from '@/app/data';
import { getCitiesByGovernorate, getLocationLabel, governorates } from '@/app/data/locationsData';

const defaultGovernorateId = 1;
const defaultCityId = 101;

export default function CompanyProfile() {
  const { language, isEnglish } = useLanguage();
  const [profile, setProfile] = useState({
    ...companyProfile,
    governorateId: defaultGovernorateId,
    cityId: defaultCityId,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [newFocus, setNewFocus] = useState('');
  const [feedback, setFeedback] = useState(
    'You can edit company details and manage hiring areas from the same page.',
  );

  const availableCities = useMemo(
    () => getCitiesByGovernorate(profile.governorateId),
    [profile.governorateId],
  );

  const headquartersLabel = getLocationLabel(profile.governorateId, profile.cityId);

  const handleAddFocus = () => {
    const trimmed = newFocus.trim();
    if (!trimmed) {
      setFeedback(
        isEnglish
          ? 'Write the hiring area first, then click Add.'
          : 'اكتب اسم المجال أولًا ثم اضغط إضافة.',
      );
      return;
    }

    if (profile.hiringFocus.includes(trimmed)) {
      setFeedback(
        isEnglish ? 'This hiring area is already in the list.' : 'هذا المجال موجود بالفعل ضمن القائمة.',
      );
      return;
    }

    setProfile((current) => ({
      ...current,
      hiringFocus: [...current.hiringFocus, trimmed],
    }));
    setNewFocus('');
    setFeedback(
      isEnglish ? `Hiring area "${trimmed}" was added.` : `تمت إضافة مجال التوظيف "${trimmed}".`,
    );
  };

  const handleRemoveFocus = (focusToRemove: string) => {
    setProfile((current) => ({
      ...current,
      hiringFocus: current.hiringFocus.filter((focus) => focus !== focusToRemove),
    }));
    setFeedback(
      isEnglish
        ? `Hiring area "${focusToRemove}" was removed.`
        : `تم حذف مجال التوظيف "${focusToRemove}".`,
    );
  };

  return (
    <DashboardLayout userType="company">
      <div className="space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <section className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold">{isEnglish ? 'Company profile' : 'ملف الشركة'}</h2>
            <p className="mt-2 text-muted-foreground">
              {isEnglish
                ? 'Update company information, hiring areas, location details, and verification status.'
                : 'تحديث بيانات الشركة العامة، مجالات التوظيف، ومعلومات الموقع والتوثيق.'}
            </p>
          </div>
          <Badge className={getStatusClasses(profile.verification)}>
            {getDisplayStatusLabel(profile.verification, isEnglish)}
          </Badge>
        </section>

        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6 text-sm text-primary">{feedback}</CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{profile.name}</CardTitle>
                <CardDescription>{profile.industry}</CardDescription>
              </div>
              <Button
                variant={isEditing ? 'outline' : 'default'}
                onClick={() => {
                  setIsEditing((current) => !current);
                  setFeedback(
                    isEditing
                      ? isEnglish
                        ? 'Editing mode was cancelled.'
                        : 'تم إلغاء وضع التعديل.'
                      : isEnglish
                        ? 'You are now editing the profile.'
                        : 'أنت الآن في وضع تعديل الملف.',
                  );
                }}
              >
                {isEditing
                  ? isEnglish
                    ? 'Cancel editing'
                    : 'إلغاء التعديل'
                  : isEnglish
                    ? 'Edit profile'
                    : 'تعديل الملف'}
              </Button>
            </CardHeader>
            <CardContent className="space-y-5">
              {isEditing ? (
                <>
                  <Input
                    value={profile.name}
                    onChange={(event) =>
                      setProfile((current) => ({ ...current, name: event.target.value }))
                    }
                  />
                  <Input
                    value={profile.industry}
                    onChange={(event) =>
                      setProfile((current) => ({ ...current, industry: event.target.value }))
                    }
                  />
                  <div className="grid gap-4 md:grid-cols-2">
                    <Select
                      value={String(profile.governorateId)}
                      onValueChange={(value) =>
                        setProfile((current) => ({
                          ...current,
                          governorateId: Number(value),
                          cityId: getCitiesByGovernorate(Number(value))[0]?.id ?? current.cityId,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={isEnglish ? 'Select governorate' : 'اختر المحافظة'} />
                      </SelectTrigger>
                      <SelectContent>
                        {governorates.map((governorate) => (
                          <SelectItem key={governorate.id} value={String(governorate.id)}>
                            {governorate.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={String(profile.cityId)}
                      onValueChange={(value) =>
                        setProfile((current) => ({ ...current, cityId: Number(value) }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={isEnglish ? 'Select city' : 'اختر المدينة'} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCities.map((city) => (
                          <SelectItem key={city.id} value={String(city.id)}>
                            {city.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Input
                    value={profile.website}
                    onChange={(event) =>
                      setProfile((current) => ({ ...current, website: event.target.value }))
                    }
                  />
                  <Textarea
                    value={profile.about}
                    onChange={(event) =>
                      setProfile((current) => ({ ...current, about: event.target.value }))
                    }
                  />
                  <Button
                    onClick={() => {
                      setIsEditing(false);
                      setFeedback(
                        isEnglish
                          ? `Profile updates for ${profile.name} were saved.`
                          : `تم حفظ تحديثات ملف ${profile.name}.`,
                      );
                    }}
                  >
                    {isEnglish ? 'Save changes' : 'حفظ التغييرات'}
                  </Button>
                </>
              ) : (
                <>
                  <p className="leading-7 text-muted-foreground">{profile.about}</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl bg-muted p-4">
                      <p className="text-sm text-muted-foreground">
                        {isEnglish ? 'Headquarters' : 'المقر الرئيسي'}
                      </p>
                      <p className="mt-1 font-semibold">{headquartersLabel}</p>
                    </div>
                    <div className="rounded-2xl bg-muted p-4">
                      <p className="text-sm text-muted-foreground">
                        {isEnglish ? 'Company size' : 'حجم الشركة'}
                      </p>
                      <p className="mt-1 font-semibold">{profile.size}</p>
                    </div>
                    <div className="rounded-2xl bg-muted p-4 sm:col-span-2">
                      <p className="text-sm text-muted-foreground">
                        {isEnglish ? 'Website' : 'الموقع الإلكتروني'}
                      </p>
                      <p className="mt-1 font-semibold">{profile.website}</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{isEnglish ? 'Current hiring areas' : 'مجالات التوظيف الحالية'}</CardTitle>
              <CardDescription>
                {isEnglish
                  ? 'Add or remove hiring areas directly from this card.'
                  : 'أضف أو احذف المجالات من نفس البطاقة مباشرة.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder={isEnglish ? 'Write a new hiring area' : 'اكتب مجالًا جديدًا'}
                  value={newFocus}
                  onChange={(event) => setNewFocus(event.target.value)}
                />
                <Button onClick={handleAddFocus}>{isEnglish ? 'Add' : 'إضافة'}</Button>
              </div>

              {profile.hiringFocus.map((focus) => (
                <div
                  key={focus}
                  className="flex items-center justify-between rounded-2xl border border-border p-4"
                >
                  <span className="font-medium">{focus}</span>
                  <Button variant="outline" size="sm" onClick={() => handleRemoveFocus(focus)}>
                    {isEnglish ? 'Remove' : 'حذف'}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
