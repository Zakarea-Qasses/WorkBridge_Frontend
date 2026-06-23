import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, LoaderCircle, Trash2 } from 'lucide-react';
import DashboardLayout from '@/app/components/layout';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from '@/app/components/ui';
import { getApiErrorMessage, getValidationErrors } from '@/app/api/client';
import {
  AdminSettings,
  clearSettingsLocalData,
  CompanyProfile,
  ContactPermission,
  getAdminSettings,
  getCompany,
  getProfile,
  getUserSettings,
  PersonalProfileResponse,
  updateAdminSettings,
  updateCompany,
  updateNotificationSettings,
  updatePassword,
  updatePrivacySettings,
  updateProfile,
  UserSettings,
} from '@/app/api/endpoints';
import { useAuth } from '@/app/providers/AuthProvider';
import { useLanguage } from '@/app/providers/LanguageProvider';

type UserType = 'user' | 'company' | 'admin';
type Status = { type: 'success' | 'error'; message: string } | null;

interface ProfileDraft {
  name: string;
  title: string;
  description: string;
  location: string;
  phone: string;
  website: string;
  skills: string;
}

interface PasswordDraft {
  current_password: string;
  password: string;
  password_confirmation: string;
}

const emptyProfileDraft: ProfileDraft = {
  name: '',
  title: '',
  description: '',
  location: '',
  phone: '',
  website: '',
  skills: '',
};

const emptyPasswordDraft: PasswordDraft = {
  current_password: '',
  password: '',
  password_confirmation: '',
};

const defaultSettings: UserSettings = {
  privacy: {
    profile_visible: true,
    contact_permission: 'all',
  },
  notifications: {
    message_notifications: true,
  },
};

const defaultAdminSettings: AdminSettings = {
  critical_dispute_notifications: true,
  company_verification_notifications: true,
};

function profileDraftFromPersonal(response: PersonalProfileResponse, fallbackName: string): ProfileDraft {
  const profile = response.profile;

  return {
    name: profile.name || fallbackName || '',
    title: profile.job_title || '',
    description: profile.bio || profile.description || '',
    location: profile.address || '',
    phone: profile.phone || '',
    website: '',
    skills: profile.skills.map((skill) => skill.name).join(', '),
  };
}

function profileDraftFromCompany(company: CompanyProfile): ProfileDraft {
  return {
    name: company.company_name || '',
    title: '',
    description: company.description || '',
    location: company.location || '',
    phone: company.phone || '',
    website: company.website || '',
    skills: company.skills.map((skill) => skill.name).join(', '),
  };
}

function splitSkills(value: string) {
  return value
    .split(',')
    .map((skill) => skill.trim())
    .filter(Boolean);
}

function getTitle(userType: UserType, isEnglish: boolean) {
  if (userType === 'company') return isEnglish ? 'Company Settings' : 'إعدادات الشركة';
  if (userType === 'admin') return isEnglish ? 'Admin Settings' : 'إعدادات الإدارة';
  return isEnglish ? 'Settings' : 'الإعدادات';
}

function StatusMessage({ status }: { status: Status }) {
  if (!status) return null;

  return (
    <div
      className={`flex items-center gap-2 rounded-md border px-4 py-3 text-sm ${
        status.type === 'success'
          ? 'border-green-200 bg-green-50 text-green-700'
          : 'border-destructive/30 bg-destructive/5 text-destructive'
      }`}
    >
      {status.type === 'success' ? (
        <CheckCircle2 className="size-4 shrink-0" />
      ) : (
        <AlertCircle className="size-4 shrink-0" />
      )}
      {status.message}
    </div>
  );
}

export function SettingsPage({ userType = 'user' }: { userType?: UserType }) {
  const { isEnglish, language } = useLanguage();
  const { user, refreshUser } = useAuth();
  const [profileDraft, setProfileDraft] = useState<ProfileDraft>(emptyProfileDraft);
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [adminSettings, setAdminSettings] = useState<AdminSettings>(defaultAdminSettings);
  const [passwordDraft, setPasswordDraft] = useState<PasswordDraft>(emptyPasswordDraft);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [status, setStatus] = useState<Status>(null);
  const [loading, setLoading] = useState(true);
  const requestIdRef = useRef(0);
  const [savingSection, setSavingSection] = useState<
    'profile' | 'password' | 'privacy' | 'notifications' | 'admin' | 'clear' | null
  >(null);

  const dashboardType = userType;
  const isAdmin = userType === 'admin';
  const isCompany = userType === 'company';

  const loadSettings = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setLoading(true);
    setStatus(null);
    setFieldErrors({});
    setProfileDraft(emptyProfileDraft);
    setPasswordDraft(emptyPasswordDraft);

    try {
      if (isAdmin) {
        const adminResponse = await getAdminSettings();
        if (requestId !== requestIdRef.current) return;
        setAdminSettings(adminResponse);
        return;
      }

      const [settingsResponse, profileResponse] = await Promise.all([
        getUserSettings(),
        isCompany ? getCompany<CompanyProfile>() : getProfile(),
      ]);

      if (requestId !== requestIdRef.current) return;

      setSettings(settingsResponse);
      setProfileDraft(
        isCompany
          ? profileDraftFromCompany(profileResponse as CompanyProfile)
          : profileDraftFromPersonal(profileResponse as PersonalProfileResponse, user?.name || ''),
      );
    } catch (error) {
      if (requestId !== requestIdRef.current) return;
      setStatus({
        type: 'error',
        message:
          getApiErrorMessage(error) ||
          (isEnglish ? 'Could not load settings.' : 'تعذر تحميل الإعدادات'),
      });
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, [isAdmin, isCompany, isEnglish, user?.name]);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings, user?.id]);

  const updateProfileField = (field: keyof ProfileDraft, value: string) => {
    setProfileDraft((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: [] }));
  };

  const updatePasswordField = (field: keyof PasswordDraft, value: string) => {
    setPasswordDraft((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: [] }));
  };

  const saveProfile = async () => {
    if (!profileDraft.name.trim()) {
      setFieldErrors({ name: [isEnglish ? 'Name is required.' : 'الاسم مطلوب.'] });
      return;
    }

    try {
      setSavingSection('profile');
      setStatus(null);
      setFieldErrors({});

      if (isCompany) {
        const updated = await updateCompany({
          company_name: profileDraft.name.trim(),
          website: profileDraft.website.trim() || null,
          location: profileDraft.location.trim() || null,
          description: profileDraft.description.trim() || null,
          phone: profileDraft.phone.trim() || null,
          skills: splitSkills(profileDraft.skills),
        });
        setProfileDraft(profileDraftFromCompany(updated));
      } else {
        const updated = await updateProfile({
          name: profileDraft.name.trim(),
          job_title: profileDraft.title.trim() || null,
          phone: profileDraft.phone.trim() || null,
          address: profileDraft.location.trim() || null,
          description: profileDraft.description.trim() || null,
          bio: profileDraft.description.trim() || null,
          skills: splitSkills(profileDraft.skills),
        });
        setProfileDraft(
          profileDraftFromPersonal(
            { profile: updated, rating_avg: 0, reviews_count: 0 },
            profileDraft.name.trim(),
          ),
        );
      }

      await refreshUser();
      setStatus({
        type: 'success',
        message: isCompany
          ? isEnglish
            ? 'Company settings saved successfully.'
            : 'تم حفظ إعدادات الشركة بنجاح'
          : isEnglish
            ? 'Personal profile settings saved successfully.'
            : 'تم حفظ إعدادات الملف الشخصي بنجاح',
      });
    } catch (error) {
      setFieldErrors(getValidationErrors(error));
      setStatus({
        type: 'error',
        message: isCompany
          ? isEnglish
            ? 'Could not save company settings.'
            : 'تعذر حفظ إعدادات الشركة'
          : isEnglish
            ? 'Could not save personal profile settings.'
            : 'تعذر حفظ إعدادات الملف الشخصي',
      });
    } finally {
      setSavingSection(null);
    }
  };

  const savePassword = async () => {
    try {
      setSavingSection('password');
      setStatus(null);
      setFieldErrors({});
      await updatePassword(passwordDraft);
      setPasswordDraft(emptyPasswordDraft);
      setStatus({
        type: 'success',
        message: isEnglish
          ? 'Password updated successfully.'
          : 'تم تحديث كلمة المرور بنجاح',
      });
    } catch (error) {
      setFieldErrors(getValidationErrors(error));
      setStatus({
        type: 'error',
        message: getApiErrorMessage(error) || (isEnglish ? 'Could not update password.' : 'تعذر تحديث كلمة المرور'),
      });
    } finally {
      setSavingSection(null);
    }
  };

  const savePrivacy = async () => {
    try {
      setSavingSection('privacy');
      setStatus(null);
      setFieldErrors({});
      const updated = await updatePrivacySettings(settings.privacy);
      setSettings(updated);
      setStatus({
        type: 'success',
        message: isEnglish ? 'Privacy settings saved.' : 'تم حفظ إعدادات الخصوصية',
      });
    } catch (error) {
      setFieldErrors(getValidationErrors(error));
      setStatus({
        type: 'error',
        message: getApiErrorMessage(error) || (isEnglish ? 'Could not save privacy settings.' : 'تعذر حفظ إعدادات الخصوصية'),
      });
    } finally {
      setSavingSection(null);
    }
  };

  const saveNotifications = async () => {
    try {
      setSavingSection('notifications');
      setStatus(null);
      setFieldErrors({});
      const updated = await updateNotificationSettings(settings.notifications);
      setSettings(updated);
      setStatus({
        type: 'success',
        message: isEnglish
          ? 'Notification preferences saved.'
          : 'تم حفظ تفضيلات الإشعارات',
      });
    } catch (error) {
      setFieldErrors(getValidationErrors(error));
      setStatus({
        type: 'error',
        message: getApiErrorMessage(error) || (isEnglish ? 'Could not save notification preferences.' : 'تعذر حفظ تفضيلات الإشعارات'),
      });
    } finally {
      setSavingSection(null);
    }
  };

  const saveAdminSettings = async () => {
    try {
      setSavingSection('admin');
      setStatus(null);
      const updated = await updateAdminSettings(adminSettings);
      setAdminSettings(updated);
      setStatus({
        type: 'success',
        message: isEnglish ? 'Admin settings saved successfully.' : 'تم حفظ إعدادات الإدارة بنجاح.',
      });
    } catch (error) {
      setStatus({ type: 'error', message: getApiErrorMessage(error) });
    } finally {
      setSavingSection(null);
    }
  };

  const clearLocalData = async () => {
    const confirmed = window.confirm(
      isEnglish
        ? 'Are you sure you want to clear local data?'
        : 'هل أنت متأكد من مسح البيانات المحلية؟',
    );
    if (!confirmed) return;

    try {
      setSavingSection('clear');
      setStatus(null);
      const response = await clearSettingsLocalData();
      setStatus({
        type: 'success',
        message: `${isEnglish ? 'Data cleared successfully.' : 'تم مسح البيانات بنجاح'} (${response.deleted_notifications})`,
      });
    } catch (error) {
      setStatus({ type: 'error', message: getApiErrorMessage(error) });
    } finally {
      setSavingSection(null);
    }
  };

  const contactOptions = useMemo(
    () => [
      { value: 'all', label: isEnglish ? 'Everyone' : 'الجميع' },
      { value: 'verified', label: isEnglish ? 'Verified only' : 'الموثقون فقط' },
      { value: 'none', label: isEnglish ? 'No one' : 'لا أحد' },
    ],
    [isEnglish],
  );

  return (
    <DashboardLayout userType={dashboardType}>
      <div className="space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <div>
          <h1 className="text-3xl font-bold">{getTitle(userType, isEnglish)}</h1>
          <p className="mt-1 text-muted-foreground">
            {isEnglish
              ? 'Manage account settings through the backend.'
              : 'إدارة إعدادات الحساب من خلال الباك.'}
          </p>
        </div>

        <StatusMessage status={status} />

        {loading ? (
          <Card>
            <CardContent className="flex min-h-56 items-center justify-center gap-3 text-muted-foreground">
              <LoaderCircle className="size-6 animate-spin text-primary" />
              {isEnglish ? 'Loading settings...' : 'جاري تحميل الإعدادات...'}
            </CardContent>
          </Card>
        ) : isAdmin ? (
          <Card>
            <CardHeader>
              <CardTitle>{isEnglish ? 'Administrative alerts' : 'تنبيهات الإدارة'}</CardTitle>
              <CardDescription>
                {isEnglish
                  ? 'Saved through /admin/settings.'
                  : 'يتم حفظها عبر /admin/settings.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between gap-4 rounded-md border p-4">
                <div>
                  <p className="font-medium">
                    {isEnglish ? 'Critical dispute alerts' : 'تنبيهات النزاعات الحرجة'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isEnglish
                      ? 'Notify admins about high priority disputes.'
                      : 'إشعار الإدارة بالنزاعات عالية الأولوية.'}
                  </p>
                </div>
                <Switch
                  checked={adminSettings.critical_dispute_notifications}
                  onCheckedChange={(value) =>
                    setAdminSettings((current) => ({
                      ...current,
                      critical_dispute_notifications: value,
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between gap-4 rounded-md border p-4">
                <div>
                  <p className="font-medium">
                    {isEnglish ? 'Company verification alerts' : 'تنبيهات توثيق الشركات'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isEnglish
                      ? 'Notify admins about company verification requests.'
                      : 'إشعار الإدارة بطلبات توثيق الشركات.'}
                  </p>
                </div>
                <Switch
                  checked={adminSettings.company_verification_notifications}
                  onCheckedChange={(value) =>
                    setAdminSettings((current) => ({
                      ...current,
                      company_verification_notifications: value,
                    }))
                  }
                />
              </div>

              <Button disabled={savingSection === 'admin'} onClick={saveAdminSettings}>
                {savingSection === 'admin' ? (
                  <LoaderCircle className="me-2 size-4 animate-spin" />
                ) : null}
                {isEnglish ? 'Save settings' : 'حفظ الإعدادات'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList>
              <TabsTrigger value="profile">{isEnglish ? 'Profile' : 'الملف'}</TabsTrigger>
              <TabsTrigger value="password">
                {isEnglish ? 'Password' : 'كلمة المرور'}
              </TabsTrigger>
              <TabsTrigger value="privacy">{isEnglish ? 'Privacy' : 'الخصوصية'}</TabsTrigger>
              <TabsTrigger value="notifications">
                {isEnglish ? 'Notifications' : 'الإشعارات'}
              </TabsTrigger>
              <TabsTrigger value="local-data">
                {isEnglish ? 'Local Data' : 'البيانات المحلية'}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>{isEnglish ? 'Basic information' : 'المعلومات الأساسية'}</CardTitle>
                  <CardDescription>
                    {isCompany
                      ? isEnglish
                        ? 'Saved through PUT /company.'
                        : 'يتم حفظها عبر PUT /company.'
                      : isEnglish
                        ? 'Saved through PUT /profile.'
                        : 'يتم حفظها عبر PUT /profile.'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="settings-name">
                      {isCompany
                        ? isEnglish
                          ? 'Company name'
                          : 'اسم الشركة'
                        : isEnglish
                          ? 'Name'
                          : 'الاسم'}
                    </Label>
                    <Input
                      id="settings-name"
                      value={profileDraft.name}
                      onChange={(event) => updateProfileField('name', event.target.value)}
                    />
                    {(fieldErrors.name?.[0] || fieldErrors.company_name?.[0]) ? (
                      <p className="text-xs text-destructive">
                        {fieldErrors.name?.[0] || fieldErrors.company_name?.[0]}
                      </p>
                    ) : null}
                  </div>

                  {!isCompany ? (
                    <div className="space-y-2">
                      <Label htmlFor="settings-title">
                        {isEnglish ? 'Professional title' : 'المسمى المهني'}
                      </Label>
                      <Input
                        id="settings-title"
                        value={profileDraft.title}
                        onChange={(event) => updateProfileField('title', event.target.value)}
                      />
                    </div>
                  ) : null}

                  <div className="space-y-2">
                    <Label htmlFor="settings-description">
                      {isEnglish ? 'Description' : 'الوصف'}
                    </Label>
                    <Textarea
                      id="settings-description"
                      rows={4}
                      value={profileDraft.description}
                      onChange={(event) => updateProfileField('description', event.target.value)}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="settings-location">
                        {isCompany
                          ? isEnglish
                            ? 'Location'
                            : 'الموقع'
                          : isEnglish
                            ? 'Address'
                            : 'العنوان'}
                      </Label>
                      <Input
                        id="settings-location"
                        value={profileDraft.location}
                        onChange={(event) => updateProfileField('location', event.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="settings-phone">{isEnglish ? 'Phone' : 'الهاتف'}</Label>
                      <Input
                        id="settings-phone"
                        value={profileDraft.phone}
                        onChange={(event) => updateProfileField('phone', event.target.value)}
                      />
                    </div>
                  </div>

                  {isCompany ? (
                    <div className="space-y-2">
                      <Label htmlFor="settings-website">
                        {isEnglish ? 'Website' : 'الموقع الإلكتروني'}
                      </Label>
                      <Input
                        id="settings-website"
                        value={profileDraft.website}
                        onChange={(event) => updateProfileField('website', event.target.value)}
                      />
                      {fieldErrors.website?.[0] ? (
                        <p className="text-xs text-destructive">{fieldErrors.website[0]}</p>
                      ) : null}
                    </div>
                  ) : null}

                  <div className="space-y-2">
                    <Label htmlFor="settings-skills">
                      {isEnglish ? 'Skills separated by commas' : 'المهارات مفصولة بفواصل'}
                    </Label>
                    <Input
                      id="settings-skills"
                      value={profileDraft.skills}
                      onChange={(event) => updateProfileField('skills', event.target.value)}
                    />
                  </div>

                  <Button disabled={savingSection === 'profile'} onClick={saveProfile}>
                    {savingSection === 'profile' ? (
                      <LoaderCircle className="me-2 size-4 animate-spin" />
                    ) : null}
                    {isEnglish ? 'Save changes' : 'حفظ التغييرات'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="password">
              <Card>
                <CardHeader>
                  <CardTitle>{isEnglish ? 'Change password' : 'تغيير كلمة المرور'}</CardTitle>
                  <CardDescription>
                    {isEnglish
                      ? 'Saved through PUT /settings/password.'
                      : 'يتم حفظها عبر PUT /settings/password.'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    type="password"
                    autoComplete="current-password"
                    placeholder={isEnglish ? 'Current password' : 'كلمة المرور الحالية'}
                    value={passwordDraft.current_password}
                    onChange={(event) =>
                      updatePasswordField('current_password', event.target.value)
                    }
                  />
                  {fieldErrors.current_password?.[0] ? (
                    <p className="text-xs text-destructive">{fieldErrors.current_password[0]}</p>
                  ) : null}
                  <Input
                    type="password"
                    autoComplete="new-password"
                    placeholder={isEnglish ? 'New password' : 'كلمة المرور الجديدة'}
                    value={passwordDraft.password}
                    onChange={(event) => updatePasswordField('password', event.target.value)}
                  />
                  {fieldErrors.password?.[0] ? (
                    <p className="text-xs text-destructive">{fieldErrors.password[0]}</p>
                  ) : null}
                  <Input
                    type="password"
                    autoComplete="new-password"
                    placeholder={isEnglish ? 'Confirm new password' : 'تأكيد كلمة المرور'}
                    value={passwordDraft.password_confirmation}
                    onChange={(event) =>
                      updatePasswordField('password_confirmation', event.target.value)
                    }
                  />
                  {fieldErrors.password_confirmation?.[0] ? (
                    <p className="text-xs text-destructive">
                      {fieldErrors.password_confirmation[0]}
                    </p>
                  ) : null}
                  <Button disabled={savingSection === 'password'} onClick={savePassword}>
                    {savingSection === 'password' ? (
                      <LoaderCircle className="me-2 size-4 animate-spin" />
                    ) : null}
                    {isEnglish ? 'Update password' : 'تحديث كلمة المرور'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="privacy">
              <Card>
                <CardHeader>
                  <CardTitle>{isEnglish ? 'Privacy settings' : 'إعدادات الخصوصية'}</CardTitle>
                  <CardDescription>
                    {isEnglish
                      ? 'Loaded from GET /settings and saved through PUT /settings/privacy.'
                      : 'يتم تحميلها من GET /settings وحفظها عبر PUT /settings/privacy.'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex items-center justify-between gap-4 rounded-md border p-4">
                    <div>
                      <p className="font-medium">
                        {isEnglish ? 'Show profile' : 'إظهار الملف الشخصي'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {isEnglish
                          ? 'Allow your public profile to be visible.'
                          : 'السماح بظهور ملفك العام.'}
                      </p>
                    </div>
                    <Switch
                      checked={settings.privacy.profile_visible}
                      onCheckedChange={(value) =>
                        setSettings((current) => ({
                          ...current,
                          privacy: { ...current.privacy, profile_visible: value },
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{isEnglish ? 'Who can contact you' : 'من يمكنه التواصل معك'}</Label>
                    <Select
                      value={settings.privacy.contact_permission}
                      onValueChange={(value) =>
                        setSettings((current) => ({
                          ...current,
                          privacy: {
                            ...current.privacy,
                            contact_permission: value as ContactPermission,
                          },
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {contactOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldErrors.contact_permission?.[0] ? (
                      <p className="text-xs text-destructive">
                        {fieldErrors.contact_permission[0]}
                      </p>
                    ) : null}
                  </div>

                  <Button disabled={savingSection === 'privacy'} onClick={savePrivacy}>
                    {savingSection === 'privacy' ? (
                      <LoaderCircle className="me-2 size-4 animate-spin" />
                    ) : null}
                    {isEnglish ? 'Save privacy' : 'حفظ الخصوصية'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {isEnglish ? 'Notification preferences' : 'تفضيلات الإشعارات'}
                  </CardTitle>
                  <CardDescription>
                    {isEnglish
                      ? 'Loaded from GET /settings and saved through PUT /settings/notifications.'
                      : 'يتم تحميلها من GET /settings وحفظها عبر PUT /settings/notifications.'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex items-center justify-between gap-4 rounded-md border p-4">
                    <div>
                      <p className="font-medium">
                        {isEnglish ? 'Message notifications' : 'إشعارات الرسائل'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {isEnglish
                          ? 'Receive alerts when new messages arrive.'
                          : 'تلقي تنبيهات عند وصول رسائل جديدة.'}
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.message_notifications}
                      onCheckedChange={(value) =>
                        setSettings((current) => ({
                          ...current,
                          notifications: {
                            ...current.notifications,
                            message_notifications: value,
                          },
                        }))
                      }
                    />
                  </div>

                  <Button
                    disabled={savingSection === 'notifications'}
                    onClick={saveNotifications}
                  >
                    {savingSection === 'notifications' ? (
                      <LoaderCircle className="me-2 size-4 animate-spin" />
                    ) : null}
                    {isEnglish ? 'Save notifications' : 'حفظ الإشعارات'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="local-data">
              <Card className="border-destructive/30">
                <CardHeader>
                  <CardTitle className="text-destructive">
                    {isEnglish ? 'Clear local data' : 'مسح البيانات المحلية'}
                  </CardTitle>
                  <CardDescription>
                    {isEnglish
                      ? 'This backend endpoint currently deletes your notifications.'
                      : 'هذا endpoint في الباك يقوم حالياً بحذف إشعاراتك.'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="destructive"
                    disabled={savingSection === 'clear'}
                    onClick={clearLocalData}
                  >
                    {savingSection === 'clear' ? (
                      <LoaderCircle className="me-2 size-4 animate-spin" />
                    ) : (
                      <Trash2 className="me-2 size-4" />
                    )}
                    {isEnglish ? 'Clear data' : 'مسح البيانات'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function Settings() {
  return <SettingsPage />;
}
