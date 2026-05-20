export interface ChatConversation {
  id: number;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  project: string;
  profilePath: string;
}

export interface ChatMessage {
  id: number;
  conversationId: number;
  sender: 'me' | 'other';
  text: string;
  time: string;
  reported?: boolean;
}

export interface ReportedMessage {
  id: number;
  messageId: number;
  conversationId: number;
  reporter: string;
  reason: string;
  status: 'new' | 'reviewed' | 'resolved';
  createdAt: string;
}

interface MessagingData {
  conversations: ChatConversation[];
  messages: ChatMessage[];
  reports: ReportedMessage[];
}

const MESSAGES_STORAGE_KEY = 'workbridge-messages';
const HIDDEN_CONVERSATIONS_STORAGE_KEY = 'workbridge-hidden-conversations';

const defaultMessagingData: MessagingData = {
  conversations: [
    {
      id: 1,
      name: 'Ahmad Mohammad',
      lastMessage: 'Thank you, I will start working on the project now.',
      time: '14:30',
      unread: 0,
      online: true,
      project: 'E-commerce website development',
      profilePath: '/profile/1',
    },
    {
      id: 2,
      name: 'Fatima Ali',
      lastMessage: 'Can we discuss the project details?',
      time: '13:15',
      unread: 2,
      online: true,
      project: 'Visual identity design',
      profilePath: '/freelancers/2',
    },
    {
      id: 3,
      name: 'Advanced Tech Company',
      lastMessage: 'Your proposal has been accepted, congratulations!',
      time: 'Yesterday',
      unread: 0,
      online: false,
      project: 'Mobile app development',
      profilePath: '/company/profile',
    },
    {
      id: 4,
      name: 'Khaled Saeed',
      lastMessage: 'When can you start the project?',
      time: 'Yesterday',
      unread: 1,
      online: false,
      project: 'Marketing content writing',
      profilePath: '/freelancers/3',
    },
  ],
  messages: [
    {
      id: 1,
      conversationId: 1,
      sender: 'other',
      text: 'Hello, thank you for your proposal on the project.',
      time: '14:20',
    },
    {
      id: 2,
      conversationId: 1,
      sender: 'me',
      text: 'Hello, I would be happy to work with you.',
      time: '14:25',
    },
    {
      id: 3,
      conversationId: 1,
      sender: 'other',
      text: 'Can you start immediately?',
      time: '14:28',
    },
    {
      id: 4,
      conversationId: 1,
      sender: 'me',
      text: 'Yes, absolutely. I will start today.',
      time: '14:29',
    },
    {
      id: 5,
      conversationId: 1,
      sender: 'other',
      text: 'Thank you, I will start coordinating the project right away.',
      time: '14:30',
    },
    {
      id: 6,
      conversationId: 2,
      sender: 'other',
      text: 'I would like to discuss the visual identity details before we begin.',
      time: '13:05',
    },
    {
      id: 7,
      conversationId: 2,
      sender: 'me',
      text: 'Of course, send me your notes and I will review them.',
      time: '13:10',
    },
    {
      id: 8,
      conversationId: 2,
      sender: 'other',
      text: 'Can we discuss the project details?',
      time: '13:15',
    },
  ],
  reports: [],
};

function canUseStorage() {
  return typeof window !== 'undefined';
}

function persist(data: MessagingData) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(data));
}

function readNumberIds(key: string) {
  if (!canUseStorage()) {
    return [] as number[];
  }

  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return [] as number[];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'number') : [];
  } catch {
    return [] as number[];
  }
}

function writeNumberIds(key: string, ids: number[]) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(ids));
}

function nowParts() {
  const now = new Date();
  return {
    time: now.toTimeString().slice(0, 5),
    iso: now.toISOString(),
  };
}

function fallbackProfilePath(conversation: Pick<ChatConversation, 'id' | 'name'>) {
  if (conversation.name.includes('Company')) {
    return '/company/profile';
  }

  if (conversation.id === 1) {
    return '/profile/1';
  }

  return `/freelancers/${conversation.id}`;
}

function translateConversationProject(project: string) {
  const normalized = project.trim();

  const projectMap: Record<string, string> = {
    'تطوير موقع تجارة إلكترونية': 'E-commerce website development',
    'تصميم هوية بصرية': 'Visual identity design',
    'تطوير تطبيق موبايل': 'Mobile app development',
    'كتابة محتوى تسويقي': 'Marketing content writing',
    'تطوير موقع إلكتروني': 'Website development',
    'إعادة تصميم تجربة تطبيق مصرفي': 'Banking app experience redesign',
    'كتابة محتوى صفحات هبوط': 'Landing page content writing',
  };

  return projectMap[normalized] ?? project;
}

function hydrateConversationProfiles(conversations: ChatConversation[]) {
  return conversations.map((conversation) => ({
    ...conversation,
    project: translateConversationProject(conversation.project),
    profilePath: conversation.profilePath || fallbackProfilePath(conversation),
  }));
}

export function getMessagingData() {
  if (!canUseStorage()) {
    return {
      ...defaultMessagingData,
      conversations: hydrateConversationProfiles(defaultMessagingData.conversations),
    };
  }

  const raw = window.localStorage.getItem(MESSAGES_STORAGE_KEY);
  if (!raw) {
    persist(defaultMessagingData);
    return {
      ...defaultMessagingData,
      conversations: hydrateConversationProfiles(defaultMessagingData.conversations),
    };
  }

  try {
    const parsed = JSON.parse(raw) as MessagingData;
    if (
      !Array.isArray(parsed?.conversations) ||
      !Array.isArray(parsed?.messages) ||
      !Array.isArray(parsed?.reports)
    ) {
      persist(defaultMessagingData);
      return {
        ...defaultMessagingData,
        conversations: hydrateConversationProfiles(defaultMessagingData.conversations),
      };
    }

    return {
      ...parsed,
      conversations: hydrateConversationProfiles(parsed.conversations),
    };
  } catch {
    persist(defaultMessagingData);
    return {
      ...defaultMessagingData,
      conversations: hydrateConversationProfiles(defaultMessagingData.conversations),
    };
  }
}

export function sendConversationMessage(
  conversationId: number,
  text: string,
  userType: 'user' | 'company' | 'admin' = 'user',
) {
  const data = getMessagingData();
  const { time } = nowParts();
  const nextMessage: ChatMessage = {
    id: Date.now(),
    conversationId,
    sender: userType === 'company' ? 'other' : 'me',
    text,
    time,
  };

  const nextConversations = data.conversations.map((conversation) =>
    conversation.id === conversationId
      ? {
          ...conversation,
          lastMessage: text,
          time,
          unread: 0,
        }
      : conversation,
  );

  const nextData: MessagingData = {
    ...data,
    conversations: nextConversations,
    messages: [...data.messages, nextMessage],
  };

  persist(nextData);
  return nextData;
}

export function reportConversationMessage(
  conversationId: number,
  messageId: number,
  reason: string,
  reporter = 'Current user',
) {
  const data = getMessagingData();

  if (data.reports.some((report) => report.messageId === messageId && report.status !== 'resolved')) {
    return data;
  }

  const { iso } = nowParts();
  const nextData: MessagingData = {
    ...data,
    messages: data.messages.map((message) =>
      message.id === messageId ? { ...message, reported: true } : message,
    ),
    reports: [
      {
        id: Date.now(),
        messageId,
        conversationId,
        reporter,
        reason,
        status: 'new',
        createdAt: iso,
      },
      ...data.reports,
    ],
  };

  persist(nextData);
  return nextData;
}

export function updateReportedMessageStatus(
  reportId: number,
  status: ReportedMessage['status'],
) {
  const data = getMessagingData();
  const nextData: MessagingData = {
    ...data,
    reports: data.reports.map((report) =>
      report.id === reportId ? { ...report, status } : report,
    ),
  };

  persist(nextData);
  return nextData;
}

export function getHiddenConversationIds() {
  return readNumberIds(HIDDEN_CONVERSATIONS_STORAGE_KEY);
}

export function setHiddenConversationIds(ids: number[]) {
  writeNumberIds(HIDDEN_CONVERSATIONS_STORAGE_KEY, ids);
}
