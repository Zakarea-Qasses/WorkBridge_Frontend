import { useMemo, useState } from 'react';
import DashboardLayout from '@/app/components/layout';
import { useLanguage } from '@/app/providers/LanguageProvider';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Progress,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Textarea,
} from '@/app/components/ui';
import {
  Award,
  Briefcase,
  Calendar,
  CheckCircle2,
  Mail,
  MapPin,
  Phone,
  Star,
  User,
} from 'lucide-react';
import { getAverageRatingFromReviews, getReviewsForProfile } from '@/app/storage';
import { getCitiesByGovernorate, getLocationLabel, governorates } from '@/app/data/locationsData';

const PROFILE_STORAGE_KEY = 'workbridge-user-profile';
const defaultGovernorateId = 1;
const defaultCityId = 101;

const defaultProfile = {
  name: 'أحمد محمد',
  title: 'مطور Full Stack',
  rating: 4.9,
  totalProjects: 45,
  completionRate: 98,
  email: 'ahmed@example.com',
  phone: '+966 50 123 4567',
  joinDate: 'يناير 2024',
  verified: true,
  bio: 'مطور Full Stack محترف مع خبرة 5 سنوات في بناء تطبيقات ويب حديثة باستخدام React وNode.js. متخصص في تطوير منصات التجارة الإلكترونية وأنظمة إدارة المحتوى.',
  skills: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'Express', 'Next.js', 'Tailwind CSS'],
  experience: [
    {
      title: 'مطور Full Stack Senior',
      company: 'شركة التقنية المتقدمة',
      period: '2023 - حاليًا',
      description: 'تطوير وإدارة منصات تجارة إلكترونية متعددة.',
    },
    {
      title: 'مطور Full Stack',
      company: 'وكالة الإبداع الرقمي',
      period: '2021 - 2023',
      description: 'بناء تطبيقات ويب للعملاء وإدارة المشاريع التقنية.',
    },
  ],
  governorateId: defaultGovernorateId,
  cityId: defaultCityId,
};

function getStoredProfile() {
  if (typeof window === 'undefined') {
    return defaultProfile;
  }

  const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
  if (!raw) {
    return defaultProfile;
  }

  try {
    return {
      ...defaultProfile,
      ...JSON.parse(raw),
    };
  } catch {
    return defaultProfile;
  }
}

export default function Profile() {
  const { isEnglish, language } = useLanguage();
  const [profile, setProfile] = useState(() => getStoredProfile());
  const [isEditing, setIsEditing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [draft, setDraft] = useState(() => ({
    name: getStoredProfile().name,
    title: getStoredProfile().title,
    email: getStoredProfile().email,
    phone: getStoredProfile().phone,
    bio: getStoredProfile().bio,
    skills: getStoredProfile().skills.join(', '),
    governorateId: getStoredProfile().governorateId ?? defaultGovernorateId,
    cityId: getStoredProfile().cityId ?? defaultCityId,
  }));
  const availableCities = useMemo(() => getCitiesByGovernorate(draft.governorateId), [draft.governorateId]);
  const profileLocationLabel = getLocationLabel(profile.governorateId, profile.cityId);

  const staticReviews = [
    {
      id: 1,
      client: isEnglish ? 'Advanced Technology Company' : 'شركة التقنية المتقدمة',
      rating: 5,
      project: isEnglish ? 'E-commerce Website Development' : 'تطوير موقع تجارة إلكترونية',
      comment: isEnglish
        ? 'Excellent professional work, on-time delivery, and high quality execution.'
        : 'عمل احترافي ممتاز، التزام بالمواعيد وجودة عالية في التنفيذ.',
      date: '2026-02-20',
      criteria: [],
    },
    {
      id: 2,
      client: isEnglish ? 'Success Foundation' : 'مؤسسة النجاح',
      rating: 5,
      project: isEnglish ? 'CMS Development' : 'تطوير نظام إدارة محتوى',
      comment: isEnglish
        ? 'Very professional developer, excellent communication, and results beyond expectations.'
        : 'مطور محترف جدًا، التواصل ممتاز والنتيجة فاقت التوقعات.',
      date: '2026-02-15',
      criteria: [],
    },
  ];

  const dynamicReviews = getReviewsForProfile(profile.name).map((review) => ({
    id: review.id,
    client: review.reviewerName,
    rating: review.rating,
    project: review.project,
    comment: review.comment,
    date: review.date,
    criteria: review.criteria,
  }));

  const reviews = [...dynamicReviews, ...staticReviews].sort((first, second) => second.date.localeCompare(first.date));
  const visibleRating = getAverageRatingFromReviews(reviews, profile.rating);

  const handleStartEditing = () => {
    setDraft({
      name: profile.name,
      title: profile.title,
      email: profile.email,
      phone: profile.phone,
      bio: profile.bio,
      skills: profile.skills.join(', '),
      governorateId: profile.governorateId ?? defaultGovernorateId,
      cityId: profile.cityId ?? defaultCityId,
    });
    setIsEditing(true);
    setStatusMessage('');
  };

  const handleCancelEditing = () => {
    setIsEditing(false);
    setStatusMessage(isEnglish ? 'Changes were canceled.' : 'تم إلغاء التعديلات.');
  };

  const handleSaveProfile = () => {
    if (!draft.name.trim() || !draft.title.trim() || !draft.email.trim()) {
      setStatusMessage(
        isEnglish
          ? 'Complete the name, title, and email before saving.'
          : 'أكمل الاسم والمسمى والبريد الإلكتروني قبل الحفظ.',
      );
      return;
    }

    const nextProfile = {
      ...profile,
      name: draft.name.trim(),
      title: draft.title.trim(),
      email: draft.email.trim(),
      phone: draft.phone.trim(),
      bio: draft.bio.trim(),
      governorateId: draft.governorateId,
      cityId: draft.cityId,
      skills: draft.skills
        .split(',')
        .map((skill) => skill.trim())
        .filter(Boolean),
    };
    setProfile(nextProfile);
    setIsEditing(false);
    setStatusMessage(isEnglish ? 'Profile updated successfully.' : 'تم تحديث الملف الشخصي بنجاح.');

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(nextProfile));
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        {statusMessage ? (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6 text-sm text-primary">{statusMessage}</CardContent>
          </Card>
        ) : null}

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-start gap-6 md:flex-row">
              <div className="flex size-32 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <User className="size-16 text-primary" />
              </div>
              <div className="flex-1">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {isEditing ? (
                      <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <Input
                            value={draft.name}
                            onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
                            placeholder={isEnglish ? 'Name' : 'الاسم'}
                          />
                          <Input
                            value={draft.title}
                            onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
                            placeholder={isEnglish ? 'Title' : 'المسمى'}
                          />
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <Select
                            value={String(draft.governorateId)}
                            onValueChange={(value) =>
                              setDraft((current) => ({
                                ...current,
                                governorateId: Number(value),
                                cityId: getCitiesByGovernorate(Number(value))[0]?.id ?? current.cityId,
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={isEnglish ? 'Choose governorate' : 'اختر المحافظة'} />
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
                            value={String(draft.cityId)}
                            onValueChange={(value) => setDraft((current) => ({ ...current, cityId: Number(value) }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={isEnglish ? 'Choose city' : 'اختر المدينة'} />
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
                        <div className="grid gap-4 md:grid-cols-2">
                          <Input
                            value={draft.phone}
                            onChange={(event) => setDraft((current) => ({ ...current, phone: event.target.value }))}
                            placeholder={isEnglish ? 'Phone Number' : 'رقم الهاتف'}
                          />
                        </div>
                        <Input
                          value={draft.email}
                          onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))}
                          placeholder={isEnglish ? 'Email' : 'البريد الإلكتروني'}
                        />
                        <Textarea
                          rows={4}
                          value={draft.bio}
                          onChange={(event) => setDraft((current) => ({ ...current, bio: event.target.value }))}
                          placeholder={isEnglish ? 'About You' : 'نبذة عنك'}
                        />
                        <Input
                          value={draft.skills}
                          onChange={(event) => setDraft((current) => ({ ...current, skills: event.target.value }))}
                          placeholder={isEnglish ? 'Skills separated by commas' : 'المهارات مفصولة بفواصل'}
                        />
                      </div>
                    ) : (
                      <>
                        <div className="mb-2 flex items-center gap-3">
                          <h1 className="text-3xl font-bold">{profile.name}</h1>
                          {profile.verified ? (
                            <Badge className="bg-green-500">
                              <CheckCircle2 className="ml-1 size-3" />
                              {isEnglish ? 'Verified' : 'موثق'}
                            </Badge>
                          ) : null}
                        </div>
                        <p className="mb-3 text-xl text-muted-foreground">{profile.title}</p>
                        <div className="mb-2 flex items-center gap-1">
                          {[...Array(5)].map((_, index) => (
                            <Star
                              key={index}
                              className={`size-5 ${
                                index < Math.round(visibleRating)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                          <span className="mr-2 font-semibold">{visibleRating}</span>
                          <span className="text-muted-foreground">
                            ({reviews.length} {isEnglish ? 'reviews' : 'تقييم'})
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex shrink-0 gap-2">
                    {isEditing ? (
                      <>
                        <Button variant="outline" onClick={handleCancelEditing}>
                          {isEnglish ? 'Cancel' : 'إلغاء'}
                        </Button>
                        <Button onClick={handleSaveProfile}>{isEnglish ? 'Save Changes' : 'حفظ التعديلات'}</Button>
                      </>
                    ) : (
                      <Button onClick={handleStartEditing}>{isEnglish ? 'Edit Profile' : 'تعديل الملف الشخصي'}</Button>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="size-4" />
                    <span>{profileLocationLabel}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="size-4" />
                    <span>{profile.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="size-4" />
                    <span>{profile.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="size-4" />
                    <span>{isEnglish ? 'Member since' : 'عضو منذ'} {profile.joinDate}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-3">
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm text-muted-foreground">{isEnglish ? 'Completed Projects' : 'المشاريع المكتملة'}</CardTitle>
                  <Briefcase className="size-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{profile.totalProjects}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm text-muted-foreground">{isEnglish ? 'Completion Rate' : 'معدل الإنجاز'}</CardTitle>
                  <Award className="size-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{profile.completionRate}%</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm text-muted-foreground">{isEnglish ? 'Rating' : 'التقييم'}</CardTitle>
                  <Star className="size-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-600">{visibleRating}</div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{isEnglish ? 'About Me' : 'نبذة عني'}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="leading-relaxed text-muted-foreground">{profile.bio}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{isEnglish ? 'Work Experience' : 'الخبرات العملية'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profile.experience.map((item, index) => (
                    <div key={item.title}>
                      <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-primary/10 p-2">
                          <Briefcase className="size-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{item.title}</h4>
                          <p className="mb-1 text-sm text-muted-foreground">{item.company}</p>
                          <p className="mb-2 text-xs text-muted-foreground">{item.period}</p>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                      {index < profile.experience.length - 1 ? <Separator className="mt-4" /> : null}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{isEnglish ? 'Reviews & Ratings' : 'التقييمات والمراجعات'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="rounded-lg border border-border p-4">
                      <div className="mb-2 flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{review.client}</h4>
                          <p className="text-sm text-muted-foreground">{review.project}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="size-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">{review.rating}</span>
                        </div>
                      </div>
                      <p className="mb-2 text-muted-foreground">{review.comment}</p>
                      {review.criteria.length > 0 ? (
                        <div className="mb-2 flex flex-wrap gap-2">
                          {review.criteria.map((criterion) => (
                            <Badge key={`${review.id}-${criterion.label}`} variant="outline">
                              {criterion.label}: {criterion.value}/5
                            </Badge>
                          ))}
                        </div>
                      ) : null}
                      <p className="text-xs text-muted-foreground">{review.date}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{isEnglish ? 'Skills' : 'المهارات'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-sm">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{isEnglish ? 'Statistics' : 'الإحصائيات'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{isEnglish ? 'Completion Rate' : 'معدل الإنجاز'}</span>
                    <span className="font-semibold">{profile.completionRate}%</span>
                  </div>
                  <Progress value={profile.completionRate} className="h-2" />
                </div>
                <Separator />
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{isEnglish ? 'Response Rate' : 'معدل الاستجابة'}</span>
                    <span className="font-semibold">95%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{isEnglish ? 'Response Time' : 'وقت الاستجابة'}</span>
                    <span className="font-semibold">{isEnglish ? '1 hour' : 'ساعة واحدة'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{isEnglish ? 'On-time Delivery' : 'التسليم في الوقت'}</span>
                    <span className="font-semibold">97%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
