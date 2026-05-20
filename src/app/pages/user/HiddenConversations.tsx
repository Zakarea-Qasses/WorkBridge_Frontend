import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Eye, EyeOff, MessageSquare, User } from 'lucide-react';
import DashboardLayout from '@/app/components/layout';
import { useLanguage } from '@/app/providers/LanguageProvider';
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui';
import {
  getHiddenConversationIds,
  getMessagingData,
  setHiddenConversationIds,
} from '@/app/storage';

export function HiddenConversationsPage({ userType = 'user' }: { userType?: 'user' | 'company' }) {
  const { isEnglish, language } = useLanguage();
  const [hiddenIds, setHiddenIdsState] = useState<number[]>(getHiddenConversationIds());
  const messagingData = getMessagingData();
  const messagesLink = userType === 'company' ? '/company/messages' : '/messages';

  const hiddenConversations = useMemo(
    () => messagingData.conversations.filter((conversation) => hiddenIds.includes(conversation.id)),
    [hiddenIds, messagingData.conversations],
  );

  const handleRestoreConversation = (conversationId: number) => {
    const nextIds = hiddenIds.filter((id) => id !== conversationId);
    setHiddenIdsState(nextIds);
    setHiddenConversationIds(nextIds);
  };

  return (
    <DashboardLayout userType={userType}>
      <div className="space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold">{isEnglish ? 'Hidden Conversations' : 'المحادثات المخفية'}</h1>
            <p className="mt-1 text-muted-foreground">
              {isEnglish
                ? 'Here you can find the conversations you hid from your list and restore them anytime.'
                : 'هنا تجد المحادثات التي أخفيتها من قائمتك ويمكنك استعادتها في أي وقت.'}
            </p>
          </div>
          <Button asChild>
            <Link to={messagesLink}>{isEnglish ? 'Back to Messages' : 'العودة إلى المحادثات'}</Link>
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          {isEnglish ? 'Hidden conversations count:' : 'عدد المحادثات المخفية:'} {hiddenConversations.length}
        </div>

        {hiddenConversations.length > 0 ? (
          <div className="grid gap-4">
            {hiddenConversations.map((conversation) => (
              <Card key={conversation.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                        <User className="size-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{conversation.name}</CardTitle>
                        <CardDescription className="mt-1">{conversation.project}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="gap-1">
                      <EyeOff className="size-3.5" />
                      {isEnglish ? 'Hidden' : 'مخفية'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="text-sm text-muted-foreground">
                    {isEnglish ? 'Last message:' : 'آخر رسالة:'} {conversation.lastMessage}
                  </div>
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => handleRestoreConversation(conversation.id)}
                  >
                    <Eye className="size-4" />
                    {isEnglish ? 'Restore Conversation' : 'استعادة المحادثة'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-10 text-center">
              <MessageSquare className="mx-auto mb-3 size-8 text-muted-foreground" />
              <p className="text-lg font-medium">{isEnglish ? 'No Hidden Conversations' : 'لا توجد محادثات مخفية'}</p>
              <p className="mt-2 text-muted-foreground">
                {isEnglish
                  ? 'When you hide any conversation from the messages page, it will appear here so you can restore it later.'
                  : 'عندما تخفي أي محادثة من صفحة الرسائل ستظهر هنا لتستطيع استعادتها لاحقًا.'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function HiddenConversations() {
  return <HiddenConversationsPage />;
}
