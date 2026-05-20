export interface JobItem {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  requirements: string[];
  verified: boolean;
  postedTime: string;
}

export const jobs: JobItem[] = [
  {
    id: 1,
    title: 'Full Stack Developer',
    company: 'Advanced Tech Company',
    location: 'Riyadh',
    type: 'Full-time',
    salary: '$8,000 - $12,000',
    description: 'We are looking for a skilled Full Stack Developer to join our engineering team.',
    requirements: ['3+ years of experience', 'React', 'Node.js'],
    verified: true,
    postedTime: '1 day ago',
  },
  {
    id: 2,
    title: 'UI/UX Designer',
    company: 'Digital Creativity Agency',
    location: 'Jeddah',
    type: 'Full-time',
    salary: '$6,000 - $9,000',
    description: 'Looking for a creative UI/UX designer to build modern and engaging user interfaces.',
    requirements: ['Figma', 'Adobe XD', 'Portfolio'],
    verified: true,
    postedTime: '2 days ago',
  },
  {
    id: 3,
    title: 'Project Manager',
    company: 'Success Foundation',
    location: 'Dammam',
    type: 'Full-time',
    salary: '$10,000 - $15,000',
    description: 'We need a professional project manager to oversee multiple technology initiatives.',
    requirements: ['5+ years of experience', 'PMP', 'Agile'],
    verified: false,
    postedTime: '3 days ago',
  },
  {
    id: 4,
    title: 'Mobile App Developer',
    company: 'Digital Innovation Company',
    location: 'Riyadh',
    type: 'Part-time',
    salary: '$7,000 - $10,000',
    description: 'Seeking a mobile developer to work on iOS and Android applications.',
    requirements: ['React Native', 'Flutter', 'Firebase'],
    verified: true,
    postedTime: '4 days ago',
  },
  {
    id: 5,
    title: 'Digital Marketing Specialist',
    company: 'Smart Marketing Agency',
    location: 'Remote',
    type: 'Remote',
    salary: '$5,000 - $8,000',
    description: 'We are hiring a digital marketing specialist to run campaigns and improve search visibility.',
    requirements: ['SEO', 'Google Ads', 'Analytics'],
    verified: true,
    postedTime: '1 week ago',
  },
];
