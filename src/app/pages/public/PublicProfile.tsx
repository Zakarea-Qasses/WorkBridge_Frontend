import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import {
  AlertCircle,
  ArrowRight,
  Briefcase,
  Calendar,
  CheckCircle2,
  LoaderCircle,
  MapPin,
  Star,
  User,
} from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/app/components/ui';
import { getApiErrorMessage } from '@/app/api/client';
import {
  getPublicProfile,
  getProfile,
  getUserReviews,
  PersonalProfile,
  ProfileReview,
} from '@/app/api/endpoints';
import { useAuth } from '@/app/providers/AuthProvider';
import { useLanguage } from '@/app/providers/LanguageProvider';

interface PublicProfileData {
  profile: PersonalProfile;
  rating: number;
  reviewsCount: number;
  reviews: ProfileReview[];
}

export default function PublicProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const { isEnglish, language } = useLanguage();
  const [data, setData] = useState<PublicProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const isOwnProfile = Boolean(id && user?.role === 'personal' && String(user.id) === id);

  useEffect(() => {
    let mounted = true;

    if (!id) {
      setData(null);
      setError(isEnglish ? 'Profile id is missing.' : 'معرف الملف الشخصي غير موجود.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');

    const profileRequest = isOwnProfile
      ? Promise.all([getProfile(), getUserReviews(id)]).then(([profileResponse, reviewsResponse]) => ({
          profile: profileResponse.profile,
          rating: reviewsResponse.rating_avg || profileResponse.rating_avg,
          reviewsCount: reviewsResponse.reviews_count,
          reviews: reviewsResponse.reviews,
        }))
      : getPublicProfile(id).then((profileResponse) => ({
          profile: profileResponse.profile,
          rating: profileResponse.rating_avg,
          reviewsCount: profileResponse.reviews_count,
          reviews: profileResponse.reviews,
        }));

    profileRequest
      .then((profileData) => {
        if (!mounted) {
          return;
        }

        setData(profileData);
      })
      .catch((requestError) => {
        if (mounted) {
          setError(
            getApiErrorMessage(requestError) ||
              (isEnglish
                ? 'Public profile could not be loaded.'
                : 'تعذر تحميل الملف الشخصي العام.'),
          );
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
  }, [id, isEnglish, isOwnProfile]);

  const joinedAt = data?.profile.created_at
    ? new Intl.DateTimeFormat(isEnglish ? 'en' : 'ar', {
        year: 'numeric',
        month: 'long',
      }).format(new Date(data.profile.created_at))
    : null;

  return (
    <div className="min-h-screen bg-muted" dir={language === 'en' ? 'ltr' : 'rtl'}>
      <header className="border-b bg-white">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link to="/dashboard" className="flex items-center gap-2 font-bold text-primary">
            <Briefcase className="size-7" />
            <span>Work Bridge</span>
          </Link>
          <Button asChild variant="outline">
            <Link to="/dashboard">
              <ArrowRight className="me-2 size-4" />
              {isEnglish ? 'Back to dashboard' : 'العودة إلى لوحة التحكم'}
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex min-h-96 items-center justify-center">
            <LoaderCircle className="size-9 animate-spin text-primary" />
          </div>
        ) : error || !data ? (
          <Card className="mx-auto max-w-2xl">
            <CardContent className="flex min-h-72 flex-col items-center justify-center gap-4 text-center">
              <AlertCircle className="size-10 text-destructive" />
              <p className="text-destructive">
                {error ||
                  (isEnglish
                    ? 'Profile could not be loaded.'
                    : 'تعذر تحميل الملف الشخصي.')}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col gap-6 md:flex-row">
                  <div className="flex size-28 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <User className="size-14 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h1 className="text-3xl font-bold">
                            {data.profile.name || user?.name}
                          </h1>
                          {user?.email_verified_at ? (
                            <Badge className="bg-green-600">
                              <CheckCircle2 className="me-1 size-3" />
                              {isEnglish ? 'Verified' : 'موثق'}
                            </Badge>
                          ) : null}
                        </div>
                        <p className="mt-2 text-lg text-muted-foreground">
                          {data.profile.job_title ||
                            (isEnglish ? 'No job title added' : 'لم تتم إضافة مسمى وظيفي')}
                        </p>
                      </div>
                      {isOwnProfile ? (
                        <Button asChild>
                          <Link to="/profile">
                            {isEnglish ? 'Edit profile' : 'تعديل الملف الشخصي'}
                          </Link>
                        </Button>
                      ) : null}
                    </div>

                    <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
                      {data.profile.governorate || data.profile.city ? (
                        <span className="flex items-center gap-2">
                          <MapPin className="size-4" />
                          {[data.profile.city?.name, data.profile.governorate?.name]
                            .filter(Boolean)
                            .join('، ')}
                        </span>
                      ) : null}
                      {joinedAt ? (
                        <span className="flex items-center gap-2">
                          <Calendar className="size-4" />
                          {isEnglish ? `Joined ${joinedAt}` : `انضم في ${joinedAt}`}
                        </span>
                      ) : null}
                      <span className="flex items-center gap-2">
                        <Star className="size-4 fill-yellow-400 text-yellow-400" />
                        {data.reviewsCount
                          ? `${data.rating} (${data.reviewsCount})`
                          : isEnglish
                            ? 'No reviews yet'
                            : 'لا توجد تقييمات حتى الآن'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{isEnglish ? 'About' : 'نبذة عنه'}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap leading-8 text-muted-foreground">
                      {data.profile.bio ||
                        data.profile.description ||
                        (isEnglish ? 'No biography added yet.' : 'لم تتم إضافة نبذة بعد.')}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>{isEnglish ? 'Reviews' : 'آراء العملاء'}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {data.reviews.length ? (
                      <div className="space-y-4">
                        {data.reviews.map((review) => (
                          <div key={review.id} className="rounded-md border p-4">
                            <div className="flex items-center justify-between gap-4">
                              <h3 className="font-semibold">
                                {review.reviewer?.name ||
                                  (isEnglish ? 'WorkBridge user' : 'مستخدم WorkBridge')}
                              </h3>
                              <span className="flex items-center gap-1 font-semibold">
                                <Star className="size-4 fill-yellow-400 text-yellow-400" />
                                {review.rating}
                              </span>
                            </div>
                            {review.comment ? (
                              <p className="mt-3 whitespace-pre-wrap text-muted-foreground">
                                {review.comment}
                              </p>
                            ) : null}
                            <p className="mt-3 text-xs text-muted-foreground">
                              {new Intl.DateTimeFormat(isEnglish ? 'en' : 'ar', {
                                dateStyle: 'medium',
                              }).format(new Date(review.created_at))}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">
                        {isEnglish ? 'No reviews yet.' : 'لا توجد تقييمات حتى الآن.'}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card className="h-fit">
                <CardHeader>
                  <CardTitle>{isEnglish ? 'Skills' : 'المهارات'}</CardTitle>
                </CardHeader>
                <CardContent>
                  {data.profile.skills.length ? (
                    <div className="flex flex-wrap gap-2">
                      {data.profile.skills.map((skill) => (
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
          </div>
        )}
      </main>
    </div>
  );
}
