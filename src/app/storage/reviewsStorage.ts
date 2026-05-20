export interface ReviewCriterionScore {
  label: string;
  value: number;
}

export interface ContractReview {
  rating: number;
  comment: string;
  createdAt: string;
  reviewerRole: 'Service Provider' | 'Client';
  criteria: ReviewCriterionScore[];
}

export interface ReviewContract {
  id: number;
  title: string;
  category: string;
  agreementStatus: 'Agreed' | 'Pending Approval';
  workStatus: 'Completed' | 'In Progress';
  completedAt: string;
  currentUserRole: 'Service Provider' | 'Client';
  otherPartyName: string;
  otherPartyRole: 'Service Provider' | 'Client';
  myReview: ContractReview | null;
  otherPartyReview: ContractReview | null;
}

export interface ProfileReviewEntry {
  id: number;
  reviewerName: string;
  reviewerRole: 'Service Provider' | 'Client';
  rating: number;
  comment: string;
  project: string;
  date: string;
  criteria: ReviewCriterionScore[];
}

const REVIEW_CONTRACTS_STORAGE_KEY = 'workbridge-review-contracts';

const reviewTextMap: Record<string, string> = {
  'تطوير لوحة تحكم للطلبات': 'Order dashboard development',
  'تطوير صفحة هبوط لحملة إعلانية': 'Ad campaign landing page development',
  'تصميم هوية بصرية لمتجر ناشئ': 'Visual identity design for a startup store',
  'تصميم واجهة متجر إلكتروني': 'E-commerce interface design',
  'كتابة محتوى صفحات خدمة': 'Service page content writing',
  'شركة التقنية المتقدمة': 'Advanced Tech Company',
  'شركة حلول التسويق': 'Marketing Solutions Company',
  'فاطمة علي': 'Fatima Ali',
  'خالد سعيد': 'Khaled سعيد',
  'سريع في التسليم والنتيجة النهائية مرتبة جدًا والتعامل مريح.':
    'Fast delivery, polished final result, and very easy to work with.',
  'التسليم كان منظمًا والتعديلات سريعة جدًا والنتيجة ممتازة.':
    'Delivery was organized, revisions were very fast, and the final result was excellent.',
  'العميل واضح ومتعاون وملتزم بالملاحظات المطلوبة.':
    'The client was clear, cooperative, and committed to the requested feedback.',
  'السرعة': 'Speed',
  'النتيجة': 'Outcome',
  'التعامل': 'Communication',
  'الوضوح': 'Clarity',
  'الالتزام': 'Commitment',
  'مقدم خدمة': 'Service Provider',
  'عميل': 'Client',
  'تم الاتفاق': 'Agreed',
  'بانتظار الموافقة': 'Pending Approval',
  'مكتمل': 'Completed',
  'قيد التنفيذ': 'In Progress',
  'عميل المنصة': 'Platform Client',
  'مقدم خدمة المنصة': 'Platform Service Provider',
  'أحمد محمد': 'Ahmad Mohammad',
};

function translateReviewText(value: string) {
  return reviewTextMap[value] ?? value;
}

function normalizeCriteria(criteria: ReviewCriterionScore[]) {
  return criteria.map((criterion) => ({
    ...criterion,
    label: translateReviewText(criterion.label),
  }));
}

function normalizeReview(review: ContractReview | null): ContractReview | null {
  if (!review) {
    return null;
  }

  return {
    ...review,
    comment: translateReviewText(review.comment),
    reviewerRole: translateReviewText(review.reviewerRole) as ContractReview['reviewerRole'],
    criteria: normalizeCriteria(review.criteria),
  };
}

function normalizeContract(contract: ReviewContract): ReviewContract {
  return {
    ...contract,
    title: translateReviewText(contract.title),
    category: translateReviewText(contract.category),
    agreementStatus: translateReviewText(contract.agreementStatus) as ReviewContract['agreementStatus'],
    workStatus: translateReviewText(contract.workStatus) as ReviewContract['workStatus'],
    currentUserRole: translateReviewText(contract.currentUserRole) as ReviewContract['currentUserRole'],
    otherPartyName: translateReviewText(contract.otherPartyName),
    otherPartyRole: translateReviewText(contract.otherPartyRole) as ReviewContract['otherPartyRole'],
    myReview: normalizeReview(contract.myReview),
    otherPartyReview: normalizeReview(contract.otherPartyReview),
  };
}

const defaultContracts: ReviewContract[] = [
  {
    id: 1,
    title: 'Order dashboard development',
    category: 'Programming & Development',
    agreementStatus: 'Agreed',
    workStatus: 'Completed',
    completedAt: '2026-03-22',
    currentUserRole: 'Service Provider',
    otherPartyName: 'Advanced Tech Company',
    otherPartyRole: 'Client',
    myReview: null,
    otherPartyReview: {
      rating: 5,
      comment: 'Fast delivery, polished final result, and very easy to work with.',
      createdAt: '2026-03-23',
      reviewerRole: 'Client',
      criteria: [
        { label: 'Speed', value: 5 },
        { label: 'Outcome', value: 5 },
        { label: 'Communication', value: 5 },
      ],
    },
  },
  {
    id: 4,
    title: 'Ad campaign landing page development',
    category: 'Programming & Development',
    agreementStatus: 'Agreed',
    workStatus: 'Completed',
    completedAt: '2026-03-24',
    currentUserRole: 'Service Provider',
    otherPartyName: 'Marketing Solutions Company',
    otherPartyRole: 'Client',
    myReview: null,
    otherPartyReview: null,
  },
  {
    id: 2,
    title: 'Visual identity design for a startup store',
    category: 'Design',
    agreementStatus: 'Agreed',
    workStatus: 'Completed',
    completedAt: '2026-03-18',
    currentUserRole: 'Client',
    otherPartyName: 'Fatima Ali',
    otherPartyRole: 'Service Provider',
    myReview: {
      rating: 5,
      comment: 'Delivery was organized, revisions were very fast, and the final result was excellent.',
      createdAt: '2026-03-19',
      reviewerRole: 'Client',
      criteria: [
        { label: 'Speed', value: 5 },
        { label: 'Outcome', value: 5 },
        { label: 'Communication', value: 5 },
      ],
    },
    otherPartyReview: {
      rating: 4.67,
      comment: 'The client was clear, cooperative, and committed to the requested feedback.',
      createdAt: '2026-03-20',
      reviewerRole: 'Service Provider',
      criteria: [
        { label: 'Communication', value: 5 },
        { label: 'Clarity', value: 4 },
        { label: 'Commitment', value: 5 },
      ],
    },
  },
  {
    id: 5,
    title: 'E-commerce interface design',
    category: 'Design',
    agreementStatus: 'Agreed',
    workStatus: 'Completed',
    completedAt: '2026-03-26',
    currentUserRole: 'Client',
    otherPartyName: 'Fatima Ali',
    otherPartyRole: 'Service Provider',
    myReview: null,
    otherPartyReview: null,
  },
  {
    id: 3,
    title: 'Service page content writing',
    category: 'Writing & Translation',
    agreementStatus: 'Agreed',
    workStatus: 'In Progress',
    completedAt: '',
    currentUserRole: 'Client',
    otherPartyName: 'Khaled سعيد',
    otherPartyRole: 'Service Provider',
    myReview: null,
    otherPartyReview: null,
  },
];

function canUseStorage() {
  return typeof window !== 'undefined';
}

function persistContracts(contracts: ReviewContract[]) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(REVIEW_CONTRACTS_STORAGE_KEY, JSON.stringify(contracts));
}

function roundRating(value: number) {
  return Math.round(value * 100) / 100;
}

export function getReviewCriteriaByRole(role: 'Service Provider' | 'Client') {
  if (role === 'Client') {
    return ['Speed', 'Outcome', 'Communication'];
  }

  return ['Communication', 'Clarity', 'Commitment'];
}

export function getReviewContracts() {
  if (!canUseStorage()) {
    return defaultContracts;
  }

  const raw = window.localStorage.getItem(REVIEW_CONTRACTS_STORAGE_KEY);
  if (!raw) {
    persistContracts(defaultContracts);
    return defaultContracts;
  }

  try {
    const parsed = JSON.parse(raw) as ReviewContract[];
    if (!Array.isArray(parsed)) {
      persistContracts(defaultContracts);
      return defaultContracts;
    }

    const normalized = parsed.map(normalizeContract);
    persistContracts(normalized);
    return normalized;
  } catch {
    persistContracts(defaultContracts);
    return defaultContracts;
  }
}

export function submitMyContractReview(
  contractId: number,
  payload: {
    comment: string;
    criteria: ReviewCriterionScore[];
  },
) {
  const current = getReviewContracts();
  const next = current.map((contract) => {
    if (contract.id !== contractId) {
      return contract;
    }

    const rating =
      payload.criteria.reduce((sum, criterion) => sum + criterion.value, 0) /
      payload.criteria.length;

    return {
      ...contract,
      myReview: {
        rating: roundRating(rating),
        comment: payload.comment,
        criteria: payload.criteria,
        reviewerRole: contract.currentUserRole,
        createdAt: new Date().toISOString().slice(0, 10),
      },
    };
  });

  persistContracts(next);
  return next;
}

export function getReviewsForProfile(targetName: string) {
  const contracts = getReviewContracts();
  const normalizedTargetName = translateReviewText(targetName);

  return contracts
    .flatMap((contract) => {
      const reviews: ProfileReviewEntry[] = [];

      if (contract.otherPartyName === normalizedTargetName && contract.myReview) {
        reviews.push({
          id: Number(`${contract.id}1`),
          reviewerName:
            contract.currentUserRole === 'Client'
              ? 'Platform Client'
              : 'Platform Service Provider',
          reviewerRole: contract.currentUserRole,
          rating: contract.myReview.rating,
          comment: contract.myReview.comment,
          project: contract.title,
          date: contract.myReview.createdAt,
          criteria: contract.myReview.criteria,
        });
      }

      if (normalizedTargetName === 'Ahmad Mohammad' && contract.otherPartyReview) {
        reviews.push({
          id: Number(`${contract.id}2`),
          reviewerName: contract.otherPartyName,
          reviewerRole: contract.otherPartyRole,
          rating: contract.otherPartyReview.rating,
          comment: contract.otherPartyReview.comment,
          project: contract.title,
          date: contract.otherPartyReview.createdAt,
          criteria: contract.otherPartyReview.criteria,
        });
      }

      return reviews;
    })
    .sort((first, second) => second.date.localeCompare(first.date));
}

export function getAverageRatingFromReviews(reviews: Array<{ rating: number }>, fallback: number) {
  if (reviews.length === 0) {
    return fallback;
  }

  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  return roundRating(total / reviews.length);
}
