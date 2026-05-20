export interface ProjectItem {
  id: number;
  title: string;
  description: string;
  budget: string;
  budgetValue: number;
  category: string;
  duration: string;
  proposals: number;
  postedTime: string;
  client: string;
  skills: string[];
  featured: boolean;
}

const PROJECTS_STORAGE_KEY = 'workbridge-projects';

const defaultProjects: ProjectItem[] = [
  {
    id: 1,
    title: 'Build a complete e-commerce platform',
    description:
      'We are looking for a Full Stack developer to build an online store with admin dashboard, payment gateways, and a fast purchase flow.',
    budget: '$15,000',
    budgetValue: 15000,
    category: 'Development',
    duration: '3 months',
    proposals: 12,
    postedTime: '2 hours ago',
    client: 'Advanced Tech Company',
    skills: ['React', 'Node.js', 'MongoDB'],
    featured: true,
  },
  {
    id: 2,
    title: 'Create a full visual identity for a startup brand',
    description:
      'Need a designer to create a logo, brand identity system, and a starter style guide for a new food brand.',
    budget: '$5,000',
    budgetValue: 5000,
    category: 'Design',
    duration: '1 month',
    proposals: 8,
    postedTime: '5 hours ago',
    client: 'Digital Creativity Agency',
    skills: ['Branding', 'Illustrator', 'Visual Identity'],
    featured: false,
  },
  {
    id: 3,
    title: 'Write landing page marketing copy',
    description:
      'We need a professional copywriter to prepare high-converting landing page content focused on acquisition and sales.',
    budget: '$3,000',
    budgetValue: 3000,
    category: 'Writing & Translation',
    duration: '2 weeks',
    proposals: 15,
    postedTime: '1 day ago',
    client: 'Success Foundation',
    skills: ['Copywriting', 'SEO', 'Marketing'],
    featured: false,
  },
  {
    id: 4,
    title: 'Manage digital campaigns for a fashion store',
    description:
      'Looking for a digital marketer to manage ads, analyze results, and improve acquisition cost over an eight-week period.',
    budget: '$4,500',
    budgetValue: 4500,
    category: 'Marketing',
    duration: '2 months',
    proposals: 10,
    postedTime: '2 days ago',
    client: 'House of Elegance',
    skills: ['Meta Ads', 'Analytics', 'Content Planning'],
    featured: true,
  },
  {
    id: 5,
    title: 'Mobile app for clinic bookings',
    description:
      'Seeking a mobile developer to build an iOS and Android app with scheduling, reminders, and an admin panel.',
    budget: '$20,000',
    budgetValue: 20000,
    category: 'Development',
    duration: '4 months',
    proposals: 19,
    postedTime: '3 days ago',
    client: 'Medical Care Network',
    skills: ['React Native', 'Firebase', 'UX'],
    featured: false,
  },
  {
    id: 6,
    title: 'Redesign an educational platform interface',
    description:
      'The goal is to improve user experience and redesign the student and instructor dashboards of an educational platform.',
    budget: '$7,500',
    budgetValue: 7500,
    category: 'Design',
    duration: '6 weeks',
    proposals: 14,
    postedTime: '4 days ago',
    client: 'Future Academy',
    skills: ['UI/UX', 'Figma', 'Design Systems'],
    featured: true,
  },
];

function canUseStorage() {
  return typeof window !== 'undefined';
}

function persistProjects(projects: ProjectItem[]) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
}

export function getProjects() {
  if (!canUseStorage()) {
    return defaultProjects;
  }

  const raw = window.localStorage.getItem(PROJECTS_STORAGE_KEY);
  if (!raw) {
    persistProjects(defaultProjects);
    return defaultProjects;
  }

  try {
    const parsed = JSON.parse(raw) as ProjectItem[];
    if (!Array.isArray(parsed)) {
      persistProjects(defaultProjects);
      return defaultProjects;
    }

    return parsed;
  } catch {
    persistProjects(defaultProjects);
    return defaultProjects;
  }
}

export function createProject(
  project: Omit<ProjectItem, 'id' | 'featured' | 'postedTime' | 'proposals'>,
) {
  const current = getProjects();
  const next: ProjectItem[] = [
    {
      ...project,
      id: Date.now(),
      featured: false,
      postedTime: 'Just now',
      proposals: 0,
    },
    ...current,
  ];

  persistProjects(next);
  return next;
}
