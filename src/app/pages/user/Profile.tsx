import { useEffect, useState } from 'react';
import { AlertCircle, Briefcase, CheckCircle2, LoaderCircle, Mail, MapPin, Phone, User } from 'lucide-react';
import DashboardLayout from '@/app/components/layout';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Textarea,
} from '@/app/components/ui';
import { getApiErrorMessage, getValidationErrors } from '@/app/api/client';
import { getProfile, PersonalProfile, updateProfile } from '@/app/api/endpoints';
import { useAuth } from '@/app/providers/AuthProvider';
import { useLanguage } from '@/app/providers/LanguageProvider';

interface ProfileDraft {
  name: string;
  job_title: string;
  phone: string;
  address: string;
  description: string;
  bio: string;
  skills: string;
}

function createDraft(profile: PersonalProfile, name: string): ProfileDraft {
  return {
    name,
    job_title: profile.job_title || '',
    phone: profile.phone || '',
    address: profile.address || '',
    description: profile.description || '',
    bio: profile.bio || '',
    skills: profile.skills.map((skill) => skill.name).join(', '),
  };
}

export default function Profile() {
  const { isEnglish, language } = useLanguage();
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState<PersonalProfile | null>(null);
  const [draft, setDraft] = useState<ProfileDraft | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [statusMessage, setStatusMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let mounted = true;

    window.localStorage.removeItem('workbridge-user-profile');
    setIsLoading(true);
    getProfile()
      .then((loadedProfile) => {
        if (!mounted) {
          return;
        }

        setProfile(loadedProfile);
        setDraft(createDraft(loadedProfile, user?.name || ''));
        setStatusMessage('');
      })
      .catch((error) => {
        if (mounted) {
          setStatusMessage(getApiErrorMessage(error));
        }
      })
      .finally(() => {
        if (mounted) {
          setIsLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [user?.name]);

  const startEditing = () => {
    if (!profile) {
      return;
    }

    setDraft(createDraft(profile, user?.name || ''));
    setFieldErrors({});
    setStatusMessage('');
    setIsEditing(true);
  };

  const saveProfile = async () => {
    if (!draft?.name.trim()) {
      setFieldErrors({ name: [isEnglish ? 'Name is required.' : 'الاسم مطلوب.'] });
      return;
    }

    try {
      setIsSaving(true);
      setFieldErrors({});
      setStatusMessage('');

      const updatedProfile = await updateProfile({
        name: draft.name.trim(),
        job_title: draft.job_title.trim() || null,
        phone: draft.phone.trim() || null,
        address: draft.address.trim() || null,
        description: draft.description.trim() || null,
        bio: draft.bio.trim() || null,
        skills: draft.skills
          .split(',')
          .map((skill) => skill.trim())
          .filter(Boolean),
      });

      setProfile(updatedProfile);
      await refreshUser();
      setIsEditing(false);
      setStatusMessage(isEnglish ? 'Profile updated successfully.' : 'تم تحديث الملف الشخصي بنجاح.');
    } catch (error) {
      setFieldErrors(getValidationErrors(error));
      setStatusMessage(getApiErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const displayedName = user?.name || draft?.name || '';
  const joinedAt = profile?.created_at
    ? new Intl.DateTimeFormat(isEnglish ? 'en' : 'ar', {
        year: 'numeric',
        month: 'long',
      }).format(new Date(profile.created_at))
    : null;

  return (
    <DashboardLayout>
      <div className="space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        {isLoading ? (
          <div className="flex min-h-80 items-center justify-center">
            <LoaderCircle className="size-8 animate-spin text-primary" />
          </div>
        ) : !profile || !draft ? (
          <Card>
            <CardContent className="flex items-center gap-3 pt-6 text-destructive">
              <AlertCircle className="size-5 shrink-0" />
              <p>{statusMessage || (isEnglish ? 'Profile could not be loaded.' : 'تعذر تحميل الملف الشخصي.')}</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {statusMessage ? (
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="pt-6 text-sm text-primary">{statusMessage}</CardContent>
              </Card>
            ) : null}

            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-start gap-6 md:flex-row">
                  <div className="flex size-28 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <User className="size-14 text-primary" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h1 className="text-2xl font-bold">{displayedName}</h1>
                          {user?.email_verified_at ? (
                            <Badge className="bg-green-600">
                              <CheckCircle2 className="me-1 size-3" />
                              {isEnglish ? 'Verified' : 'موثق'}
                            </Badge>
                          ) : null}
                        </div>
                        <p className="mt-2 text-lg text-muted-foreground">
                          {profile.job_title || (isEnglish ? 'No job title added' : 'لم تتم إضافة مسمى وظيفي')}
                        </p>
                      </div>

                      {!isEditing ? (
                        <Button onClick={startEditing}>
                          {isEnglish ? 'Edit Profile' : 'تعديل الملف الشخصي'}
                        </Button>
                      ) : null}
                    </div>

                    <div className="mt-5 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2 lg:grid-cols-4">
                      <div className="flex items-center gap-2">
                        <Mail className="size-4 shrink-0" />
                        <span className="truncate">{user?.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="size-4 shrink-0" />
                        <span>{profile.phone || (isEnglish ? 'Not added' : 'غير مضاف')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="size-4 shrink-0" />
                        <span>{profile.address || (isEnglish ? 'Not added' : 'غير مضاف')}</span>
                      </div>
                      {joinedAt ? (
                        <div className="flex items-center gap-2">
                          <Briefcase className="size-4 shrink-0" />
                          <span>{isEnglish ? `Joined ${joinedAt}` : `انضم في ${joinedAt}`}</span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {isEditing ? (
              <Card>
                <CardHeader>
                  <CardTitle>{isEnglish ? 'Edit Profile' : 'تعديل الملف الشخصي'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="profile-name">{isEnglish ? 'Name' : 'الاسم'}</Label>
                      <Input
                        id="profile-name"
                        value={draft.name}
                        onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                      />
                      {fieldErrors.name?.[0] ? (
                        <p className="text-xs text-destructive">{fieldErrors.name[0]}</p>
                      ) : null}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="profile-title">{isEnglish ? 'Job title' : 'المسمى الوظيفي'}</Label>
                      <Input
                        id="profile-title"
                        value={draft.job_title}
                        onChange={(event) => setDraft({ ...draft, job_title: event.target.value })}
                      />
                      {fieldErrors.job_title?.[0] ? (
                        <p className="text-xs text-destructive">{fieldErrors.job_title[0]}</p>
                      ) : null}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="profile-phone">{isEnglish ? 'Phone' : 'رقم الهاتف'}</Label>
                      <Input
                        id="profile-phone"
                        value={draft.phone}
                        onChange={(event) => setDraft({ ...draft, phone: event.target.value })}
                      />
                      {fieldErrors.phone?.[0] ? (
                        <p className="text-xs text-destructive">{fieldErrors.phone[0]}</p>
                      ) : null}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="profile-address">{isEnglish ? 'Address' : 'العنوان'}</Label>
                      <Input
                        id="profile-address"
                        value={draft.address}
                        onChange={(event) => setDraft({ ...draft, address: event.target.value })}
                      />
                      {fieldErrors.address?.[0] ? (
                        <p className="text-xs text-destructive">{fieldErrors.address[0]}</p>
                      ) : null}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="profile-description">{isEnglish ? 'Professional summary' : 'الملخص المهني'}</Label>
                    <Textarea
                      id="profile-description"
                      rows={3}
                      value={draft.description}
                      onChange={(event) => setDraft({ ...draft, description: event.target.value })}
                    />
                    {fieldErrors.description?.[0] ? (
                      <p className="text-xs text-destructive">{fieldErrors.description[0]}</p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="profile-bio">{isEnglish ? 'About you' : 'نبذة عنك'}</Label>
                    <Textarea
                      id="profile-bio"
                      rows={4}
                      value={draft.bio}
                      onChange={(event) => setDraft({ ...draft, bio: event.target.value })}
                    />
                    {fieldErrors.bio?.[0] ? (
                      <p className="text-xs text-destructive">{fieldErrors.bio[0]}</p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="profile-skills">{isEnglish ? 'Skills' : 'المهارات'}</Label>
                    <Input
                      id="profile-skills"
                      value={draft.skills}
                      onChange={(event) => setDraft({ ...draft, skills: event.target.value })}
                      placeholder={isEnglish ? 'React, TypeScript, UI Design' : 'React, TypeScript, تصميم واجهات'}
                    />
                    <p className="text-xs text-muted-foreground">
                      {isEnglish ? 'Separate skills with commas.' : 'افصل بين المهارات بفواصل.'}
                    </p>
                    {fieldErrors.skills?.[0] ? (
                      <p className="text-xs text-destructive">{fieldErrors.skills[0]}</p>
                    ) : null}
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button
                      variant="outline"
                      disabled={isSaving}
                      onClick={() => {
                        setDraft(createDraft(profile, user?.name || ''));
                        setFieldErrors({});
                        setStatusMessage('');
                        setIsEditing(false);
                      }}
                    >
                      {isEnglish ? 'Cancel' : 'إلغاء'}
                    </Button>
                    <Button disabled={isSaving} onClick={saveProfile}>
                      {isSaving ? (
                        <LoaderCircle className="me-2 size-4 animate-spin" />
                      ) : null}
                      {isSaving ? (isEnglish ? 'Saving...' : 'جار الحفظ...') : isEnglish ? 'Save Changes' : 'حفظ التعديلات'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>{isEnglish ? 'Professional Summary' : 'الملخص المهني'}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap leading-7 text-muted-foreground">
                      {profile.description || (isEnglish ? 'No professional summary added yet.' : 'لم تتم إضافة ملخص مهني بعد.')}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>{isEnglish ? 'About Me' : 'نبذة عني'}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap leading-7 text-muted-foreground">
                      {profile.bio || (isEnglish ? 'No biography added yet.' : 'لم تتم إضافة نبذة بعد.')}
                    </p>
                  </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>{isEnglish ? 'Skills' : 'المهارات'}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {profile.skills.length ? (
                      <div className="flex flex-wrap gap-2">
                        {profile.skills.map((skill) => (
                          <Badge key={skill.id} variant="secondary">
                            {skill.name}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">
                        {isEnglish ? 'No skills added yet.' : 'لم تتم إضافة مهارات بعد.'}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
