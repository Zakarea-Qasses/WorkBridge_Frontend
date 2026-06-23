import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import { LoaderCircle, MessageSquare, RefreshCw, Search, Send, User } from 'lucide-react';
import DashboardLayout from '@/app/components/layout';
import { Badge, Button, Card, CardContent, Input, ScrollArea } from '@/app/components/ui';
import { getApiErrorMessage } from '@/app/api/client';
import {
  getConversationMessagesPage,
  getConversations,
  markConversationAsRead,
  sendConversationMessage,
  type Conversation,
  type ConversationMessage,
} from '@/app/api/endpoints';
import { useAuth } from '@/app/providers/AuthProvider';
import { useLanguage } from '@/app/providers/LanguageProvider';

function mergeMessages(current: ConversationMessage[], incoming: ConversationMessage[]) {
  const byId = new Map(current.map((message) => [message.id, message]));
  incoming.forEach((message) => byId.set(message.id, message));
  return [...byId.values()].sort(
    (first, second) =>
      new Date(first.created_at).getTime() - new Date(second.created_at).getTime(),
  );
}

export function MessagesPage({
  userType = 'user',
}: {
  userType?: 'user' | 'company' | 'admin';
}) {
  const { user } = useAuth();
  const { isEnglish, language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [oldestPage, setOldestPage] = useState(1);
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const selectedIdRef = useRef<number | null>(null);

  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  const loadConversations = useCallback(async (silent = false) => {
    if (userType === 'admin') {
      setLoadingConversations(false);
      return;
    }

    if (!silent) setLoadingConversations(true);
    try {
      const items = await getConversations();
      setConversations(items);
      const requestedId = Number(searchParams.get('conversation'));
      const currentId = selectedIdRef.current;
      setSelectedId(
        items.find((item) => item.id === requestedId)?.id ||
          items.find((item) => item.id === currentId)?.id ||
          items[0]?.id ||
          null,
      );
      if (!silent) setError('');
    } catch (requestError) {
      if (!silent) setError(getApiErrorMessage(requestError));
    } finally {
      if (!silent) setLoadingConversations(false);
    }
  }, [searchParams, userType]);

  useEffect(() => {
    void loadConversations();
    if (userType === 'admin') return;
    const timer = window.setInterval(() => void loadConversations(true), 10000);
    return () => window.clearInterval(timer);
  }, [loadConversations, userType]);

  const loadLatestMessages = useCallback(async (conversationId: number, silent = false) => {
    if (!silent) setLoadingMessages(true);
    try {
      const firstPage = await getConversationMessagesPage(conversationId, 1);
      const targetPage = firstPage.last_page;
      const latest = targetPage === 1
        ? firstPage
        : await getConversationMessagesPage(conversationId, targetPage);
      if (selectedIdRef.current !== conversationId) return;
      setMessages((current) => silent ? mergeMessages(current, latest.data) : latest.data);
      setOldestPage(targetPage);
      await markConversationAsRead(conversationId);
      setConversations((current) =>
        current.map((item) =>
          item.id === conversationId ? { ...item, unread_count: 0 } : item,
        ),
      );
      if (!silent) setError('');
    } catch (requestError) {
      if (!silent) setError(getApiErrorMessage(requestError));
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    if (!selectedId || userType === 'admin') {
      setMessages([]);
      return;
    }
    setMessages([]);
    void loadLatestMessages(selectedId);
    const timer = window.setInterval(
      () => void loadLatestMessages(selectedId, true),
      5000,
    );
    return () => window.clearInterval(timer);
  }, [loadLatestMessages, selectedId, userType]);

  const loadOlderMessages = async () => {
    if (!selectedId || oldestPage <= 1 || loadingOlder) return;
    try {
      setLoadingOlder(true);
      const previousPage = oldestPage - 1;
      const page = await getConversationMessagesPage(selectedId, previousPage);
      setMessages((current) => mergeMessages(page.data, current));
      setOldestPage(previousPage);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoadingOlder(false);
    }
  };

  const filteredConversations = useMemo(() => {
    const term = search.trim().toLowerCase();
    return conversations.filter((conversation) => {
      const other = conversation.user1_id === user?.id ? conversation.user2 : conversation.user1;
      return !term || other.name.toLowerCase().includes(term);
    });
  }, [conversations, search, user?.id]);

  const selectedConversation = conversations.find((item) => item.id === selectedId) || null;
  const otherUser = selectedConversation
    ? selectedConversation.user1_id === user?.id
      ? selectedConversation.user2
      : selectedConversation.user1
    : null;

  const submitMessage = async (event: FormEvent) => {
    event.preventDefault();
    const content = draft.trim();
    if (!selectedId || !content || sending) return;

    try {
      setSending(true);
      setError('');
      const sent = await sendConversationMessage(selectedId, content);
      setMessages((current) => mergeMessages(current, [sent]));
      setDraft('');
      setConversations((current) =>
        current.map((item) =>
          item.id === selectedId
            ? { ...item, messages: [sent], last_message_at: sent.created_at }
            : item,
        ),
      );
      void loadConversations(true);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setSending(false);
    }
  };

  if (userType === 'admin') {
    return (
      <DashboardLayout userType="admin">
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {isEnglish
              ? 'Admin conversation monitoring is not supported by the backend.'
              : 'عرض جميع المحادثات للأدمن غير مدعوم من الباك حالياً.'}
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType={userType}>
      <div className="space-y-4" dir={language === 'en' ? 'ltr' : 'rtl'}>
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold">{isEnglish ? 'Messages' : 'المحادثات'}</h1>
          <Button
            variant="outline"
            size="icon"
            onClick={() => void loadConversations()}
            title={isEnglish ? 'Refresh' : 'تحديث'}
          >
            <RefreshCw className="size-4" />
          </Button>
        </div>

        {error ? (
          <Card className="border-destructive/30">
            <CardContent className="py-3 text-sm text-destructive">{error}</CardContent>
          </Card>
        ) : null}

        <Card className="h-[calc(100vh-15rem)] min-h-[520px] overflow-hidden">
          <div className="grid h-full min-h-0 md:grid-cols-[320px_1fr]">
            <div className="flex min-h-0 flex-col border-e">
              <div className="p-3">
                <div className="relative">
                  <Search className="absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="pe-10"
                    placeholder={isEnglish ? 'Search conversations...' : 'ابحث في المحادثات...'}
                  />
                </div>
              </div>
              <ScrollArea className="min-h-0 flex-1">
                {loadingConversations ? (
                  <div className="flex justify-center p-8"><LoaderCircle className="size-6 animate-spin" /></div>
                ) : filteredConversations.length === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    {isEnglish ? 'No conversations yet.' : 'لا توجد محادثات حتى الآن.'}
                  </div>
                ) : filteredConversations.map((conversation) => {
                  const other = conversation.user1_id === user?.id ? conversation.user2 : conversation.user1;
                  const latest = conversation.messages?.[0];
                  return (
                    <button
                      key={conversation.id}
                      type="button"
                      onClick={() => {
                        setSelectedId(conversation.id);
                        setSearchParams({ conversation: String(conversation.id) });
                      }}
                      className={`w-full border-b p-4 text-start hover:bg-accent ${
                        selectedId === conversation.id ? 'bg-accent' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                          <User className="size-5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{other.name}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {latest?.content || (isEnglish ? 'No messages yet' : 'لا توجد رسائل بعد')}
                          </p>
                        </div>
                        {conversation.unread_count ? <Badge>{conversation.unread_count}</Badge> : null}
                      </div>
                    </button>
                  );
                })}
              </ScrollArea>
            </div>

            <div className="flex min-h-0 flex-col">
              {!selectedConversation ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 text-muted-foreground">
                  <MessageSquare className="size-10" />
                  <p>{isEnglish ? 'Select a conversation.' : 'اختر محادثة.'}</p>
                </div>
              ) : (
                <>
                  <div className="border-b p-4"><h2 className="font-semibold">{otherUser?.name}</h2></div>
                  <ScrollArea className="min-h-0 flex-1 bg-muted/30 p-4">
                    {loadingMessages ? (
                      <div className="flex justify-center p-8"><LoaderCircle className="size-6 animate-spin" /></div>
                    ) : messages.length === 0 ? (
                      <div className="p-8 text-center text-sm text-muted-foreground">
                        {isEnglish ? 'Start the conversation with a message.' : 'ابدأ المحادثة بإرسال رسالة.'}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {oldestPage > 1 ? (
                          <div className="flex justify-center">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={loadingOlder}
                              onClick={() => void loadOlderMessages()}
                            >
                              {loadingOlder ? <LoaderCircle className="me-2 size-4 animate-spin" /> : null}
                              {isEnglish ? 'Load older messages' : 'تحميل رسائل أقدم'}
                            </Button>
                          </div>
                        ) : null}
                        {messages.map((message) => {
                          const mine = message.sender_id === user?.id;
                          const date = new Date(message.created_at);
                          return (
                            <div key={message.id} className={`flex ${mine ? 'justify-start' : 'justify-end'}`}>
                              <div className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${
                                mine ? 'bg-primary text-primary-foreground' : 'border bg-white'
                              }`}>
                                <p className="whitespace-pre-wrap break-words">{message.content}</p>
                                <p className="mt-1 text-[10px] opacity-70">
                                  {Number.isNaN(date.getTime())
                                    ? ''
                                    : date.toLocaleTimeString(isEnglish ? 'en' : 'ar', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </ScrollArea>
                  <form onSubmit={submitMessage} className="flex gap-2 border-t p-3">
                    <Input
                      value={draft}
                      maxLength={10000}
                      onChange={(event) => setDraft(event.target.value)}
                      placeholder={isEnglish ? 'Write a message...' : 'اكتب رسالة...'}
                      disabled={sending}
                    />
                    <Button
                      type="submit"
                      size="icon"
                      disabled={sending || !draft.trim()}
                      title={isEnglish ? 'Send' : 'إرسال'}
                    >
                      {sending ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4" />}
                    </Button>
                  </form>
                </>
              )}
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default function Messages() {
  return <MessagesPage />;
}
