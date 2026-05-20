export type AccountStatus = 'نشط' | 'معلق' | 'محظور';
export type VerificationStatus = 'موثق' | 'قيد المراجعة' | 'مرفوض';
export type WorkflowStatus =
  | 'نشط'
  | 'مغلق'
  | 'قيد المراجعة'
  | 'بانتظار القرار'
  | 'قيد التنفيذ'
  | 'تم التسليم'
  | 'مكتمل'
  | 'نزاع';

export const adminStats = [
  {
    title: 'Total users',
    value: '12,543',
    change: '+12%',
    tone: 'blue',
  },
  {
    title: 'Active companies',
    value: '384',
    change: '+9%',
    tone: 'emerald',
  },
  {
    title: 'Open disputes',
    value: '23',
    change: '-15%',
    tone: 'amber',
  },
  {
    title: 'Platform profit',
    value: '$487,500',
    change: '+23%',
    tone: 'violet',
  },
];

export const companyStats = [
  {
    title: 'Published jobs',
    value: '12',
    change: '+2 this week',
    tone: 'blue',
  },
  {
    title: 'New applicants',
    value: '48',
    change: '9 applications today',
    tone: 'emerald',
  },
  {
    title: 'Scheduled interviews',
    value: '6',
    change: '3 this week',
    tone: 'amber',
  },
  {
    title: 'Acceptance rate',
    value: '32%',
    change: '+4% this month',
    tone: 'violet',
  },
];

export const adminUsers = [
  {
    id: 1,
    name: 'Mohammad Ahmad',
    role: 'Freelancer',
    email: 'm.ahmad@workbridge.io',
    status: 'نشط' as AccountStatus,
    verification: 'موثق' as VerificationStatus,
    wallet: '$3,200',
    joinedAt: '2026-03-18',
  },
  {
    id: 2,
    name: 'Fatima Ali',
    role: 'Client',
    email: 'fatima@brandhub.co',
    status: 'نشط' as AccountStatus,
    verification: 'قيد المراجعة' as VerificationStatus,
    wallet: '$1,180',
    joinedAt: '2026-03-15',
  },
  {
    id: 3,
    name: 'Advanced Tech Company',
    role: 'Company',
    email: 'hr@advanced-tech.com',
    status: 'معلق' as AccountStatus,
    verification: 'موثق' as VerificationStatus,
    wallet: '$12,540',
    joinedAt: '2026-03-11',
  },
  {
    id: 4,
    name: 'Noura Hasan',
    role: 'Job Seeker',
    email: 'noura.resume@gmail.com',
    status: 'محظور' as AccountStatus,
    verification: 'مرفوض' as VerificationStatus,
    wallet: '$0',
    joinedAt: '2026-03-08',
  },
];

export const companyVerificationQueue = [
  {
    id: 101,
    company: 'Solutions Build',
    sector: 'Software and Integrations',
    contact: 'Reem Saleem',
    email: 'ops@solutions-build.com',
    employees: '51 - 200',
    submittedAt: '2026-03-21',
    status: 'قيد المراجعة' as VerificationStatus,
  },
  {
    id: 102,
    company: 'Masar Logistics',
    sector: 'Logistics Services',
    contact: 'Omar Khalil',
    email: 'careers@masarlogistics.com',
    employees: '11 - 50',
    submittedAt: '2026-03-19',
    status: 'موثق' as VerificationStatus,
  },
  {
    id: 103,
    company: 'Oxygen Studio',
    sector: 'Design and Content Production',
    contact: 'Layan Sharif',
    email: 'hello@oxygenstudio.io',
    employees: '1 - 10',
    submittedAt: '2026-03-17',
    status: 'مرفوض' as VerificationStatus,
  },
];

export const adminProjects = [
  {
    id: 301,
    title: 'Redesign a banking app experience',
    type: 'Freelance project',
    owner: 'Alpha Company',
    assignee: 'Sarah Khaled',
    budget: '$18,000',
    status: 'قيد التنفيذ' as WorkflowStatus,
  },
  {
    id: 302,
    title: 'Senior Frontend Engineer',
    type: 'Job posting',
    owner: 'Advanced Tech Company',
    assignee: '27 applicants',
    budget: '$2,200 / month',
    status: 'نشط' as WorkflowStatus,
  },
  {
    id: 303,
    title: 'Landing page content writing service',
    type: 'Freelance service',
    owner: 'Khaled Saeed',
    assignee: '14 purchase requests',
    budget: '$350 / service',
    status: 'قيد المراجعة' as WorkflowStatus,
  },
];

export const disputes = [
  {
    id: 401,
    subject: 'Delay in delivering the dashboard',
    parties: 'Ibdaa Company / Ahmad Mohammad',
    amount: '$4,500',
    priority: 'High',
    status: 'بانتظار القرار' as WorkflowStatus,
    updatedAt: '2026-03-24',
  },
  {
    id: 402,
    subject: 'Objection to visual identity quality',
    parties: 'Success Foundation / Fatima Ali',
    amount: '$1,800',
    priority: 'Medium',
    status: 'قيد المراجعة' as WorkflowStatus,
    updatedAt: '2026-03-23',
  },
  {
    id: 403,
    subject: 'Refund for an incomplete service',
    parties: 'Marketing Agency / Khaled Saeed',
    amount: '$950',
    priority: 'Low',
    status: 'مكتمل' as WorkflowStatus,
    updatedAt: '2026-03-20',
  },
];

export const financeSummary = [
  { label: 'Total wallet balance', value: '$1.2M', note: 'Across 12,543 wallets' },
  { label: 'Collected commissions', value: '$87,200', note: 'Last 30 days' },
  { label: 'Pending withdrawal requests', value: '18', note: 'Needs financial review' },
  { label: 'Reserved funds', value: '$214,000', note: 'Projects in progress' },
];

export const companyJobs = [
  {
    id: 1,
    title: 'UX/UI Designer',
    department: 'Product',
    location: 'Remote',
    applicants: 19,
    publishedAt: '2026-03-20',
    status: 'نشط' as WorkflowStatus,
  },
  {
    id: 2,
    title: 'HR Operations Manager',
    department: 'Human Resources',
    location: 'Damascus',
    applicants: 8,
    publishedAt: '2026-03-14',
    status: 'قيد المراجعة' as WorkflowStatus,
  },
  {
    id: 3,
    title: 'Backend Developer',
    department: 'Engineering',
    location: 'Hybrid',
    applicants: 27,
    publishedAt: '2026-03-05',
    status: 'مغلق' as WorkflowStatus,
  },
];

export const applicants = [
  {
    id: 501,
    name: 'Laith Samer',
    role: 'Interface Designer',
    matchScore: '92%',
    appliedFor: 'UX/UI Designer',
    stage: 'Initial interview',
    status: 'قيد المراجعة' as WorkflowStatus,
    experience: '4 years',
  },
  {
    id: 502,
    name: 'Sarah Khaled',
    role: 'Product Designer',
    matchScore: '88%',
    appliedFor: 'UX/UI Designer',
    stage: 'Practical test',
    status: 'قيد التنفيذ' as WorkflowStatus,
    experience: '6 years',
  },
  {
    id: 503,
    name: 'Mohammad Al Ali',
    role: 'UI Designer',
    matchScore: '80%',
    appliedFor: 'HR Operations Manager',
    stage: 'Rejected',
    status: 'مكتمل' as WorkflowStatus,
    experience: '3 years',
  },
];

export const companyActivity = [
  {
    title: '9 new applications received',
    description: 'The UX/UI Designer posting received new applications during the last 24 hours.',
  },
  {
    title: 'Interview scheduled for tomorrow',
    description: 'Interview with Laith Samer on March 28, 2026 at 11:00 AM.',
  },
  {
    title: 'Company account verified',
    description: 'The company verification was approved and you can now publish unlimited openings.',
  },
];

export const companyProfile = {
  name: 'Work Bridge Labs',
  verification: 'موثق' as VerificationStatus,
  industry: 'Software and Digital Products',
  size: '51 - 200 employees',
  headquarters: 'Damascus - Syria',
  website: 'www.workbridgelabs.com',
  about:
    'A company specialized in building digital products, technical hiring, and managing distributed teams. It focuses on smooth experiences and clear operations across product, engineering, and operations.',
  hiringFocus: ['Development', 'Design', 'Product Management', 'Technical Sales'],
};

export function getStatusClasses(status: string) {
  switch (status) {
    case 'نشط':
    case 'موثق':
    case 'مكتمل':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'قيد المراجعة':
    case 'معلق':
    case 'بانتظار القرار':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'محظور':
    case 'مرفوض':
    case 'نزاع':
      return 'bg-rose-100 text-rose-700 border-rose-200';
    case 'قيد التنفيذ':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'مغلق':
      return 'bg-slate-100 text-slate-700 border-slate-200';
    case 'تم التسليم':
      return 'bg-violet-100 text-violet-700 border-violet-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}

export function getDisplayStatusLabel(status: string, isEnglish: boolean) {
  if (!isEnglish) {
    return status;
  }

  switch (status) {
    case 'نشط':
      return 'Active';
    case 'معلق':
      return 'Suspended';
    case 'محظور':
      return 'Banned';
    case 'موثق':
      return 'Verified';
    case 'قيد المراجعة':
      return 'Under Review';
    case 'مرفوض':
      return 'Rejected';
    case 'مغلق':
      return 'Closed';
    case 'بانتظار القرار':
      return 'Awaiting Decision';
    case 'بانتظار البدء':
      return 'Awaiting Start';
    case 'بانتظار التسليم':
      return 'Awaiting Delivery';
    case 'قيد التنفيذ':
      return 'In Progress';
    case 'تم التسليم':
      return 'Delivered';
    case 'مكتمل':
      return 'Completed';
    case 'نزاع':
      return 'Dispute';
    case 'موقوف':
      return 'Paused';
    case 'مقبول':
      return 'Accepted';
    case 'مؤجل':
      return 'Postponed';
    default:
      return status;
  }
}

export function getDisplayTypeLabel(type: string, isEnglish: boolean) {
  if (!isEnglish) {
    return type;
  }

  switch (type) {
    case 'مشروع':
    case 'Freelance project':
      return 'Project';
    case 'خدمة':
    case 'Freelance service':
    case 'Published service':
      return 'Service';
    case 'وظيفة':
    case 'Job posting':
      return 'Job';
    default:
      return type;
  }
}

export function getDisplayCategoryLabel(category: string, isEnglish: boolean) {
  if (!isEnglish) {
    return category;
  }

  switch (category) {
    case 'تصميم':
    case 'Design':
      return 'Design';
    case 'برمجة وتطوير':
    case 'Programming & Development':
    case 'Development':
      return 'Programming & Development';
    case 'كتابة وترجمة':
    case 'Writing & Translation':
      return 'Writing & Translation';
    case 'تسويق':
    case 'Marketing':
      return 'Marketing';
    case 'عام':
    case 'General':
      return 'General';
    default:
      return category;
  }
}

export function getCategorySearchTerms(category: string) {
  const normalizedCategory = category.trim().toLowerCase();

  switch (normalizedCategory) {
    case 'تصميم':
    case 'design':
      return ['تصميم', 'design'];
    case 'برمجة وتطوير':
    case 'programming & development':
    case 'development':
      return ['برمجة وتطوير', 'programming & development', 'development', 'programming'];
    case 'كتابة وترجمة':
    case 'writing & translation':
      return ['كتابة وترجمة', 'writing & translation', 'writing', 'translation'];
    case 'تسويق':
    case 'marketing':
      return ['تسويق', 'marketing'];
    case 'عام':
    case 'general':
      return ['عام', 'general'];
    default:
      return [category];
  }
}

export function getDisplayRelativeTimeLabel(value: string, isEnglish: boolean) {
  if (!isEnglish) {
    return value;
  }

  const normalizedValue = value.trim();

  const withinDaysMatch = normalizedValue.match(/^خلال\s+(\d+)\s+(يوم|أيام)$/);
  if (withinDaysMatch) {
    const count = withinDaysMatch[1];
    return `Within ${count} ${count === '1' ? 'day' : 'days'}`;
  }

  const withinWeeksMatch = normalizedValue.match(/^خلال\s+(\d+)\s+(أسبوع|أسابيع)$/);
  if (withinWeeksMatch) {
    const count = withinWeeksMatch[1];
    return `Within ${count} ${count === '1' ? 'week' : 'weeks'}`;
  }

  const withinMonthsMatch = normalizedValue.match(/^خلال\s+(\d+)\s+(شهر|أشهر)$/);
  if (withinMonthsMatch) {
    const count = withinMonthsMatch[1];
    return `Within ${count} ${count === '1' ? 'month' : 'months'}`;
  }

  const minutesMatch = normalizedValue.match(/^منذ\s+(\d+)\s+(دقيقة|دقائق)$/);
  if (minutesMatch) {
    const count = minutesMatch[1];
    return `${count} ${count === '1' ? 'minute' : 'minutes'} ago`;
  }

  const hoursMatch = normalizedValue.match(/^منذ\s+(\d+)\s+(ساعة|ساعات)$/);
  if (hoursMatch) {
    const count = hoursMatch[1];
    return `${count} ${count === '1' ? 'hour' : 'hours'} ago`;
  }

  const daysMatch = normalizedValue.match(/^منذ\s+(\d+)\s+(يوم|أيام)$/);
  if (daysMatch) {
    const count = daysMatch[1];
    return `${count} ${count === '1' ? 'day' : 'days'} ago`;
  }

  const weeksAgoMatch = normalizedValue.match(/^منذ\s+(\d+)\s+(أسبوع|أسابيع)$/);
  if (weeksAgoMatch) {
    const count = weeksAgoMatch[1];
    return `${count} ${count === '1' ? 'week' : 'weeks'} ago`;
  }

  const monthsAgoMatch = normalizedValue.match(/^منذ\s+(\d+)\s+(شهر|أشهر)$/);
  if (monthsAgoMatch) {
    const count = monthsAgoMatch[1];
    return `${count} ${count === '1' ? 'month' : 'months'} ago`;
  }

  switch (normalizedValue) {
    case 'الآن':
    case 'الآن فقط':
    case 'Just now':
      return 'Just now';
    case 'منذ دقيقة':
      return '1 minute ago';
    case 'منذ 10 دقائق':
      return '10 minutes ago';
    case 'منذ 20 دقيقة':
      return '20 minutes ago';
    case 'منذ ساعة':
    case '1 hour ago':
      return '1 hour ago';
    case 'منذ ساعتين':
    case '2 hours ago':
      return '2 hours ago';
    case 'منذ 3 ساعات':
    case '3 hours ago':
      return '3 hours ago';
    case 'منذ 4 ساعات':
    case '4 hours ago':
      return '4 hours ago';
    case 'منذ 5 ساعات':
    case '5 hours ago':
      return '5 hours ago';
    case 'منذ يوم':
    case '1 day ago':
      return '1 day ago';
    case 'منذ يومين':
    case '2 days ago':
      return '2 days ago';
    case 'منذ 3 أيام':
    case '3 days ago':
      return '3 days ago';
    case 'منذ 4 أيام':
    case '4 days ago':
      return '4 days ago';
    case 'منذ 5 أيام':
    case '5 days ago':
      return '5 days ago';
    case 'منذ أسبوع':
    case '1 week ago':
      return '1 week ago';
    case 'منذ أسبوعين':
    case '2 weeks ago':
      return '2 weeks ago';
    default:
      return normalizedValue;
  }
}

export function getDisplayDurationLabel(value: string, isEnglish: boolean) {
  if (!isEnglish) {
    return value;
  }

  const normalizedValue = value.trim();

  const daysMatch = normalizedValue.match(/^(\d+)\s+(يوم|أيام|day|days)$/);
  if (daysMatch) {
    const count = daysMatch[1];
    return `${count} ${count === '1' ? 'day' : 'days'}`;
  }

  const weeksMatch = normalizedValue.match(/^(\d+)\s+(أسبوع|أسابيع|week|weeks)$/);
  if (weeksMatch) {
    const count = weeksMatch[1];
    return `${count} ${count === '1' ? 'week' : 'weeks'}`;
  }

  const monthsMatch = normalizedValue.match(/^(\d+)\s+(شهر|أشهر|month|months)$/);
  if (monthsMatch) {
    const count = monthsMatch[1];
    return `${count} ${count === '1' ? 'month' : 'months'}`;
  }

  switch (normalizedValue) {
    case 'يوم':
      return '1 day';
    case 'يومان':
    case 'يومين':
      return '2 days';
    case 'أسبوع واحد':
      return '1 week';
    case 'أسبوع':
    case '1 week':
      return '1 week';
    case 'أسبوعان':
    case 'أسبوعين':
    case '2 weeks':
      return '2 weeks';
    case 'شهر واحد':
      return '1 month';
    case '3 أسابيع':
    case '3 weeks':
      return '3 weeks';
    case '4 أسابيع':
    case '4 weeks':
      return '4 weeks';
    case 'شهر':
    case '1 month':
      return '1 month';
    case 'شهران':
    case 'شهرين':
    case '2 months':
      return '2 months';
    case '3 أشهر':
    case '3 months':
      return '3 months';
    case '4 أشهر':
    case '4 months':
      return '4 months';
    case '5 أشهر':
    case '5 months':
      return '5 months';
    case '6 أشهر':
    case '6 months':
      return '6 months';
    default:
      return normalizedValue;
  }
}

export function getToneClasses(tone: string) {
  switch (tone) {
    case 'blue':
      return 'bg-blue-50 text-blue-700 border-blue-100';
    case 'emerald':
      return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    case 'amber':
      return 'bg-amber-50 text-amber-700 border-amber-100';
    case 'violet':
      return 'bg-violet-50 text-violet-700 border-violet-100';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-100';
  }
}
