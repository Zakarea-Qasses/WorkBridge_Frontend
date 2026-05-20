import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import DashboardLayout from '@/app/components/layout';
import { useLanguage } from '@/app/providers/LanguageProvider';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Separator, Switch, Tabs, TabsContent, TabsList, TabsTrigger, Textarea } from '@/app/components/ui';

function createStorageKeys(userType: 'user' | 'company' | 'admin') {
  return {
    profile: `workbridge-${userType}-profile-settings`,
    skills: `workbridge-${userType}-profile-skills`,
    account: `workbridge-${userType}-account-settings`,
    password: `workbridge-${userType}-account-password`,
  };
}

function getDefaults(userType: 'user' | 'company' | 'admin') {
  if (userType === 'company') {
    return {
      profile: {
        fullName: 'Work Bridge Labs',
        title: 'حساب شركة',
        bio: 'شركة متخصصة في المنتجات الرقمية والتوظيف التقني.',
        location: 'دمشق - سوريا',
        phone: '+963 11 123 4567',
      },
      skills: 'التوظيف, إدارة الموارد البشرية, المنتجات الرقمية',
      account: {
        email: 'company@workbridge.io',
      },
    };
  }

  if (userType === 'admin') {
    return {
      profile: {
        fullName: 'أدمن المنصة',
        title: 'إدارة النظام',
        bio: 'إدارة الحسابات والمشاريع والنزاعات والإشراف على تشغيل المنصة.',
        location: 'لوحة التحكم',
        phone: '+000 000 000',
      },
      skills: 'إدارة, مراجعة, دعم, تقارير',
      account: {
        email: 'admin@workbridge.io',
      },
    };
  }

  return {
    profile: {
      fullName: 'أحمد محمد',
      title: 'مطور Full Stack',
      bio: 'مطور Full Stack محترف مع خبرة 5 سنوات.',
      location: 'الرياض، السعودية',
      phone: '+966 50 123 4567',
    },
    skills: 'React, Node.js, TypeScript, MongoDB',
    account: {
      email: 'ahmed@example.com',
    },
  };
}

function readStorageValue<T>(key: string, fallback: T) {
  if (typeof window === 'undefined') {
    return fallback;
  }

  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function SettingsPage({ userType = 'user' }: { userType?: 'user' | 'company' | 'admin' }) {
  const navigate = useNavigate();
  const { isEnglish, language } = useLanguage();
  const keys = useMemo(() => createStorageKeys(userType), [userType]);
  const defaults = useMemo(() => getDefaults(userType), [userType]);

  const [profileSettings, setProfileSettings] = useState(defaults.profile);
  const [skills, setSkills] = useState(defaults.skills);
  const [accountSettings, setAccountSettings] = useState(defaults.account);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [profileMessage, setProfileMessage] = useState('');
  const [skillsMessage, setSkillsMessage] = useState('');
  const [accountMessage, setAccountMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [deleteMessage, setDeleteMessage] = useState('');

  useEffect(() => {
    setProfileSettings(readStorageValue(keys.profile, defaults.profile));
    setSkills(readStorageValue(keys.skills, defaults.skills));
    setAccountSettings(readStorageValue(keys.account, defaults.account));
  }, [defaults.account, defaults.profile, defaults.skills, keys.account, keys.profile, keys.skills]);

  const handleSaveProfileChanges = () => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(keys.profile, JSON.stringify(profileSettings));
    setProfileMessage(isEnglish ? 'Profile changes saved successfully.' : 'تم حفظ التغييرات الشخصية بنجاح.');
  };

  const handleUpdateSkills = () => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(keys.skills, JSON.stringify(skills));
    setSkillsMessage(isEnglish ? 'Skills updated successfully.' : 'تم تحديث المهارات بنجاح.');
  };

  const handleSaveAccountChanges = () => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(keys.account, JSON.stringify(accountSettings));
    setAccountMessage(isEnglish ? 'Account information saved successfully.' : 'تم حفظ معلومات الحساب بنجاح.');
  };

  const handleUpdatePassword = () => {
    if (typeof window === 'undefined') {
      return;
    }

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordMessage(isEnglish ? 'Please fill all password fields.' : 'يرجى تعبئة جميع حقول كلمة المرور.');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage(isEnglish ? 'New password and confirmation do not match.' : 'كلمة المرور الجديدة وتأكيدها غير متطابقين.');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordMessage(isEnglish ? 'The new password must be at least 6 characters.' : 'يجب أن تكون كلمة المرور الجديدة 6 أحرف على الأقل.');
      return;
    }

    window.localStorage.setItem(keys.password, JSON.stringify(passwordForm.newPassword));
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setPasswordMessage(isEnglish ? 'Password updated locally successfully.' : 'تم تحديث كلمة المرور محليًا بنجاح.');
  };

  const handleDeleteAccount = () => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.removeItem(keys.profile);
    window.localStorage.removeItem(keys.skills);
    window.localStorage.removeItem(keys.account);
    window.localStorage.removeItem(keys.password);
    setDeleteMessage(isEnglish ? 'Local data for this account was removed from the interface.' : 'تم حذف بيانات هذا الحساب المحلي من الواجهة.');
    navigate('/login');
  };

  return (
    <DashboardLayout userType={userType}>
      <div className="space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <div>
          <h1 className="text-3xl font-bold">
            {userType === 'company'
              ? isEnglish ? 'Company Settings' : 'إعدادات الشركة'
              : userType === 'admin'
                ? isEnglish ? 'Admin Settings' : 'إعدادات الأدمن'
                : isEnglish ? 'Settings' : 'الإعدادات'}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {isEnglish
              ? 'Manage the settings and preferences of this account independently.'
              : 'إدارة إعدادات هذا الحساب وتفضيلاته بشكل مستقل.'}
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">{isEnglish ? 'Profile' : 'الملف'}</TabsTrigger>
            <TabsTrigger value="account">{isEnglish ? 'Account' : 'الحساب'}</TabsTrigger>
            <TabsTrigger value="notifications">{isEnglish ? 'Notifications' : 'الإشعارات'}</TabsTrigger>
            <TabsTrigger value="privacy">{isEnglish ? 'Privacy' : 'الخصوصية'}</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{isEnglish ? 'Basic Information' : 'المعلومات الأساسية'}</CardTitle>
                <CardDescription>{isEnglish ? 'Update the visible data of this account.' : 'حدّث بيانات هذا الحساب الظاهرة في الواجهة.'}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullname">{isEnglish ? 'Name' : 'الاسم'}</Label>
                  <Input
                    id="fullname"
                    value={profileSettings.fullName}
                    onChange={(event) => setProfileSettings((current) => ({ ...current, fullName: event.target.value }))}
                    className="bg-input-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">{isEnglish ? 'Title' : 'الوصف'}</Label>
                  <Input
                    id="title"
                    value={profileSettings.title}
                    onChange={(event) => setProfileSettings((current) => ({ ...current, title: event.target.value }))}
                    className="bg-input-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">{isEnglish ? 'Bio' : 'نبذة'}</Label>
                  <Textarea
                    id="bio"
                    rows={4}
                    value={profileSettings.bio}
                    onChange={(event) => setProfileSettings((current) => ({ ...current, bio: event.target.value }))}
                    className="resize-none bg-input-background"
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="location">{isEnglish ? 'Location' : 'الموقع'}</Label>
                    <Input
                      id="location"
                      value={profileSettings.location}
                      onChange={(event) => setProfileSettings((current) => ({ ...current, location: event.target.value }))}
                      className="bg-input-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">{isEnglish ? 'Phone' : 'الهاتف'}</Label>
                    <Input
                      id="phone"
                      value={profileSettings.phone}
                      onChange={(event) => setProfileSettings((current) => ({ ...current, phone: event.target.value }))}
                      className="bg-input-background"
                    />
                  </div>
                </div>
                {profileMessage ? <p className="text-sm text-green-600">{profileMessage}</p> : null}
                <Button onClick={handleSaveProfileChanges}>{isEnglish ? 'Save Changes' : 'حفظ التغييرات'}</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{isEnglish ? 'Skills or Domains' : 'المهارات أو المجالات'}</CardTitle>
                <CardDescription>{isEnglish ? 'Add the fields or skills related to this account.' : 'أضف المجالات أو المهارات الخاصة بهذا الحساب.'}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="skills">{isEnglish ? 'Values separated by commas' : 'القيم مفصولة بفواصل'}</Label>
                  <Input
                    id="skills"
                    value={skills}
                    onChange={(event) => setSkills(event.target.value)}
                    className="bg-input-background"
                  />
                </div>
                {skillsMessage ? <p className="text-sm text-green-600">{skillsMessage}</p> : null}
                <Button onClick={handleUpdateSkills}>{isEnglish ? 'Update' : 'تحديث'}</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{isEnglish ? 'Account Information' : 'معلومات الحساب'}</CardTitle>
                <CardDescription>{isEnglish ? 'Basic independent data for this role.' : 'بيانات أساسية مستقلة لهذا الدور.'}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{isEnglish ? 'Email' : 'البريد الإلكتروني'}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={accountSettings.email}
                    onChange={(event) => setAccountSettings((current) => ({ ...current, email: event.target.value }))}
                    className="bg-input-background"
                  />
                </div>
                {accountMessage ? <p className="text-sm text-green-600">{accountMessage}</p> : null}
                <Button onClick={handleSaveAccountChanges}>{isEnglish ? 'Save Changes' : 'حفظ التغييرات'}</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{isEnglish ? 'Change Password' : 'تغيير كلمة المرور'}</CardTitle>
                <CardDescription>{isEnglish ? 'Update the password for this account.' : 'تحديث كلمة مرور هذا الحساب.'}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  type="password"
                  placeholder={isEnglish ? 'Current Password' : 'كلمة المرور الحالية'}
                  value={passwordForm.currentPassword}
                  onChange={(event) => setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))}
                  className="bg-input-background"
                />
                <Input
                  type="password"
                  placeholder={isEnglish ? 'New Password' : 'كلمة المرور الجديدة'}
                  value={passwordForm.newPassword}
                  onChange={(event) => setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))}
                  className="bg-input-background"
                />
                <Input
                  type="password"
                  placeholder={isEnglish ? 'Confirm Password' : 'تأكيد كلمة المرور'}
                  value={passwordForm.confirmPassword}
                  onChange={(event) => setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))}
                  className="bg-input-background"
                />
                {passwordMessage ? <p className="text-sm text-green-600">{passwordMessage}</p> : null}
                <Button onClick={handleUpdatePassword}>{isEnglish ? 'Update Password' : 'تحديث كلمة المرور'}</Button>
              </CardContent>
            </Card>

            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">{isEnglish ? 'Delete Account Data' : 'حذف بيانات الحساب'}</CardTitle>
                <CardDescription>{isEnglish ? 'Deletes only local data for this role.' : 'يحذف البيانات المحلية الخاصة بهذا الدور فقط.'}</CardDescription>
              </CardHeader>
              <CardContent>
                {deleteMessage ? <p className="mb-3 text-sm text-destructive">{deleteMessage}</p> : null}
                <Button variant="destructive" onClick={handleDeleteAccount}>
                  {isEnglish ? 'Delete Data' : 'حذف البيانات'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{isEnglish ? 'Notification Settings' : 'إعدادات الإشعارات'}</CardTitle>
                <CardDescription>{isEnglish ? 'Receive message notifications only.' : 'استقبال إشعارات الرسائل فقط.'}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{isEnglish ? 'Message Notifications' : 'إشعارات الرسائل'}</p>
                    <p className="text-sm text-muted-foreground">{isEnglish ? 'Receive alerts when new messages arrive' : 'تلقي تنبيهات عند وصول رسائل جديدة'}</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{isEnglish ? 'Privacy Settings' : 'إعدادات الخصوصية'}</CardTitle>
                <CardDescription>{isEnglish ? 'Control visibility and communication for this account.' : 'ضبط الرؤية والتواصل لهذا الحساب.'}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{isEnglish ? 'Show Profile' : 'إظهار الملف'}</p>
                    <p className="text-sm text-muted-foreground">{isEnglish ? 'Allow account information to be visible' : 'السماح بعرض بيانات الحساب'}</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>{isEnglish ? 'Who can contact you' : 'من يمكنه التواصل معك'}</Label>
                  <Select defaultValue="all">
                    <SelectTrigger className="bg-input-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{isEnglish ? 'Everyone' : 'الجميع'}</SelectItem>
                      <SelectItem value="verified">{isEnglish ? 'Verified Only' : 'الموثقون فقط'}</SelectItem>
                      <SelectItem value="none">{isEnglish ? 'No One' : 'لا أحد'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

export default function Settings() {
  return <SettingsPage />;
}
