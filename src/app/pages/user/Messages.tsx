import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import {
  AlertTriangle,
  ArrowRight,
  Circle,
  MoreVertical,
  Search,
  Send,
  ShieldAlert,
  User,
} from 'lucide-react';
import DashboardLayout from '@/app/components/layout';
import { useLanguage } from '@/app/providers/LanguageProvider';
import { Badge, Button, Card, Input, ScrollArea } from '@/app/components/ui';
import {
  getHiddenConversationIds,
  getMessagingData,
  reportConversationMessage,
  sendConversationMessage,
  setHiddenConversationIds as persistHiddenConversationIds,
} from '@/app/storage';

const REPORT_REASON = 'Inappropriate or abusive content';
const MESSAGES_CONSENT_KEY_PREFIX = 'workbridge-messages-consent';

function getConsentKey(userType: 'user' | 'company' | 'admin') {
  return `${MESSAGES_CONSENT_KEY_PREFIX}-${userType}`;
}

function hasAcceptedMessagesPolicy(userType: 'user' | 'company' | 'admin') {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.localStorage.getItem(getConsentKey(userType)) === 'accepted';
}

function acceptMessagesPolicy(userType: 'user' | 'company' | 'admin') {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(getConsentKey(userType), 'accepted');
}

function getViewerMessageSender(
  sender: 'me' | 'other',
  userType: 'user' | 'company' | 'admin',
) {
  if (userType === 'company') {
    return sender === 'me' ? 'other' : 'me';
  }

  return sender;
}

function getMessageOwnerLabel(
  sender: 'me' | 'other',
  userType: 'user' | 'company' | 'admin',
  isEnglish: boolean,
) {
  const viewerSender = getViewerMessageSender(sender, userType);

  if (viewerSender === 'me') {
    if (isEnglish) {
      return userType === 'company'
        ? 'You - Company'
        : userType === 'admin'
          ? 'Admin'
          : 'You';
    }

    return userType === 'company' ? 'أنتِ - الشركة' : userType === 'admin' ? 'الأدمن' : 'أنت';
  }

  return isEnglish ? 'Other party' : 'الطرف الآخر';
}

export function MessagesPage({
  userType = 'user',
}: {
  userType?: 'user' | 'company' | 'admin';
}) {
  const { language, isEnglish } = useLanguage();
  const isAdminView = userType === 'admin';
  const [selectedChat, setSelectedChat] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isChatOpenOnMobile, setIsChatOpenOnMobile] = useState(false);
  const [hasAcceptedPolicy, setHasAcceptedPolicy] = useState(false);
  const [mutedConversationIds, setMutedConversationIds] = useState<number[]>([]);
  const [hiddenConversationIds, setHiddenConversationIdsState] = useState<number[]>([]);
  const [isConversationMenuOpen, setIsConversationMenuOpen] = useState(false);
  const [messagingData, setMessagingData] = useState(getMessagingData());

  const hiddenPageLink =
    userType === 'company' ? '/company/messages/hidden' : '/messages/hidden';

  const moderationPageLink = '/admin/reports';
  const viewerProfileState =
    userType === 'company'
      ? { viewerType: 'company' as const, returnTo: '/company/messages' }
      : userType === 'admin'
        ? { viewerType: 'admin' as const, returnTo: '/admin/messages' }
        : { viewerType: 'user' as const, returnTo: '/messages' };

  const text = {
    hiddenConversations: isEnglish ? 'Hidden conversations' : 'المحادثات المخفية',
    consentTitle: isEnglish ? 'Consent to use messaging' : 'الموافقة على استخدام المحادثات',
    consentBody: isEnglish
      ? 'By using messaging, you agree that communication is for professional work only, and messages may be reviewed when there is a report, dispute, or legal obligation.'
      : 'باستخدامك للمحادثات فأنت توافق أن التواصل مخصص للعمل المهني فقط، وقد تتم مراجعة الرسائل عند وجود بلاغ أو نزاع أو التزام قانوني.',
    acceptAndContinue: isEnglish ? 'Accept and continue' : 'أوافق وأتابع',
    adminNoticeTitle: isEnglish ? 'Admin view notice' : 'تنبيه واجهة الأدمن',
    adminNoticeBody: isEnglish
      ? 'This view is intended for administrative follow-up only. The admin reviews and monitors conversations here without acting as a regular participant.'
      : 'هذه الواجهة مخصصة لمتابعة محادثات المنصة عند الحاجة الإدارية فقط. الأدمن هنا يراجع ويتابع، ولا يستخدم منطق الإبلاغ أو إخفاء المحادثة كطرف عادي داخل الحوار.',
    privacyNoticeTitle: isEnglish
      ? 'Privacy and review notice'
      : 'تنبيه الخصوصية والمراجعة',
    privacyNoticeBody: isEnglish
      ? 'Messaging on the platform is intended for professional communication and may only be reviewed when there is a report, dispute, or legal obligation.'
      : 'المحادثات داخل المنصة مخصصة للتواصل المهني، وقد تخضع للمراجعة فقط عند وجود بلاغ أو نزاع أو التزام قانوني.',
    messageSent: isEnglish ? 'The message was sent in the interface.' : 'تم إرسال الرسالة داخل الواجهة.',
    reportSent: isEnglish
      ? 'The report was sent to the admin reports center.'
      : 'تم إرسال البلاغ إلى مركز التقارير لدى الأدمن.',
    consentSaved: isEnglish
      ? 'Your messaging-policy approval has been saved.'
      : 'تم حفظ موافقتك على سياسة استخدام المحادثات.',
    muted: isEnglish
      ? 'Notifications were muted for this conversation.'
      : 'تم كتم إشعارات هذه المحادثة.',
    unmuted: isEnglish
      ? 'Notifications were unmuted for this conversation.'
      : 'تم إلغاء كتم إشعارات هذه المحادثة.',
    noReportableMessage: isEnglish
      ? 'There is no suitable message to report in this conversation.'
      : 'لا توجد رسالة مناسبة للإبلاغ داخل هذه المحادثة.',
    generalConversationReport: isEnglish
      ? 'General report about the conversation'
      : 'بلاغ عام على المحادثة',
    conversationDetails: (name: string, project: string) =>
      isEnglish
        ? `The current conversation with ${name} is linked to ${project}.`
        : `المحادثة الحالية مع ${name} مرتبطة بـ ${project}.`,
    conversationHidden: (name: string) =>
      isEnglish
        ? `${name}'s conversation was hidden from the list.`
        : `تم إخفاء محادثة ${name} من القائمة.`,
    searchPlaceholder: isEnglish ? 'Search by person name...' : 'ابحث باسم الشخص...',
    noSearchResults: isEnglish ? 'No matching results were found.' : 'لا توجد نتيجة مطابقة لهذا الاسم.',
    conversationOptions: isEnglish ? 'Conversation options' : 'خيارات المحادثة',
    showDetails: isEnglish ? 'Show conversation details' : 'عرض تفاصيل المحادثة',
    unmuteNotifications: isEnglish ? 'Unmute notifications' : 'إلغاء كتم الإشعارات',
    muteNotifications: isEnglish ? 'Mute notifications' : 'كتم الإشعارات',
    hideConversation: isEnglish ? 'Hide conversation from list' : 'إخفاء المحادثة من القائمة',
    reportConversation: isEnglish ? 'Report conversation' : 'الإبلاغ عن المحادثة',
    reported: isEnglish ? 'Reported' : 'تم الإبلاغ',
    report: isEnglish ? 'Report' : 'إبلاغ',
    noMessagesYet: isEnglish ? 'There are no messages in this conversation yet.' : 'لا توجد رسائل في هذه المحادثة بعد.',
    reportCenterIntro: isEnglish
      ? 'When you submit a report, it is sent to the admin'
      : 'عند تقديم بلاغ، يتم إرساله إلى صفحة',
    reportCenterLink: isEnglish ? 'Reports Center' : 'مركز التقارير',
    reportCenterEnd: isEnglish ? 'page.' : 'الخاصة بالأدمن.',
    adminMessageHint: isEnglish
      ? 'This conversation is visible to the admin for follow-up and review only, not for using report or conversation-management actions as a regular participant.'
      : 'هذه المحادثة ظاهرة للأدمن بغرض المتابعة والمراجعة فقط، وليس لاستخدام أزرار الإبلاغ أو إدارة المحادثة كطرف عادي.',
    sensitiveDataHint: isEnglish
      ? 'Do not share sensitive information in the conversation unless necessary.'
      : 'لا تشارك بيانات حساسة داخل المحادثة إلا عند الحاجة.',
    writeMessage: isEnglish ? 'Write your message...' : 'اكتب رسالتك...',
    noConversationSelected: isEnglish ? 'No conversation selected.' : 'لا توجد محادثة محددة.',
  };

  useEffect(() => {
    setMessagingData(getMessagingData());
    setHasAcceptedPolicy(hasAcceptedMessagesPolicy(userType));
    setHiddenConversationIdsState(getHiddenConversationIds());
  }, [userType]);

  const filteredConversations = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return messagingData.conversations.filter(
        (conversation) => !hiddenConversationIds.includes(conversation.id),
      );
    }

    return messagingData.conversations.filter(
      (conversation) =>
        !hiddenConversationIds.includes(conversation.id) &&
        conversation.name.toLowerCase().includes(normalizedSearch),
    );
  }, [hiddenConversationIds, messagingData.conversations, searchTerm]);

  const activeConversation =
    messagingData.conversations.find((conversation) => conversation.id === selectedChat) ??
    messagingData.conversations[0];

  const currentMessages = useMemo(() => {
    if (!activeConversation) {
      return [];
    }

    return messagingData.messages.filter(
      (message) => message.conversationId === activeConversation.id,
    );
  }, [activeConversation, messagingData.messages]);

  const handleSelectConversation = (conversationId: number) => {
    setSelectedChat(conversationId);
    setIsChatOpenOnMobile(true);
    setIsConversationMenuOpen(false);
    setStatusMessage('');
  };

  const handleSendMessage = () => {
    const trimmed = newMessage.trim();
    if (!activeConversation || !trimmed) {
      return;
    }

    const nextData = sendConversationMessage(activeConversation.id, trimmed, userType);
    setMessagingData(nextData);
    setNewMessage('');
    setStatusMessage(text.messageSent);
  };

  const handleReportMessage = (messageId: number) => {
    if (!activeConversation || isAdminView) {
      return;
    }

    const nextData = reportConversationMessage(activeConversation.id, messageId, REPORT_REASON);
    setMessagingData(nextData);
    setStatusMessage(text.reportSent);
  };

  const handleAcceptPolicy = () => {
    acceptMessagesPolicy(userType);
    setHasAcceptedPolicy(true);
    setStatusMessage(text.consentSaved);
  };

  const handleMuteConversation = () => {
    if (!activeConversation || isAdminView) {
      return;
    }

    setIsConversationMenuOpen(false);
    setMutedConversationIds((current) => {
      const isMuted = current.includes(activeConversation.id);
      const nextIds = isMuted
        ? current.filter((id) => id !== activeConversation.id)
        : [...current, activeConversation.id];

      setStatusMessage(isMuted ? text.unmuted : text.muted);

      return nextIds;
    });
  };

  const handleReportConversation = () => {
    if (!activeConversation || isAdminView) {
      return;
    }

    setIsConversationMenuOpen(false);

    const reportableMessage = [...currentMessages]
      .reverse()
      .find((message) => getViewerMessageSender(message.sender, userType) === 'other');

    if (!reportableMessage) {
      setStatusMessage(text.noReportableMessage);
      return;
    }

    const nextData = reportConversationMessage(
      activeConversation.id,
      reportableMessage.id,
      text.generalConversationReport,
    );
    setMessagingData(nextData);
    setStatusMessage(text.reportSent);
  };

  const handleShowConversationDetails = () => {
    if (!activeConversation) {
      return;
    }

    setIsConversationMenuOpen(false);
    setStatusMessage(text.conversationDetails(activeConversation.name, activeConversation.project));
  };

  const handleHideConversation = () => {
    if (!activeConversation || isAdminView) {
      return;
    }

    setIsConversationMenuOpen(false);
    const nextHiddenIds = [...hiddenConversationIds, activeConversation.id];
    setHiddenConversationIdsState(nextHiddenIds);
    persistHiddenConversationIds(nextHiddenIds);

    const nextVisibleConversation = messagingData.conversations.find(
      (conversation) =>
        conversation.id !== activeConversation.id && !nextHiddenIds.includes(conversation.id),
    );

    if (nextVisibleConversation) {
      setSelectedChat(nextVisibleConversation.id);
      setIsChatOpenOnMobile(false);
    }

    setStatusMessage(text.conversationHidden(activeConversation.name));
  };

  return (
    <DashboardLayout userType={userType}>
      <div className="space-y-4" dir={language === 'en' ? 'ltr' : 'rtl'}>
        {!isAdminView && (
          <div className="flex justify-end">
            <Button asChild variant="outline">
              <Link to={hiddenPageLink}>{text.hiddenConversations}</Link>
            </Button>
          </div>
        )}

        {!isAdminView && !hasAcceptedPolicy && (
          <Card className="border-blue-200 bg-blue-50 p-4">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <ShieldAlert className="mt-0.5 size-5 text-blue-700" />
                <div className="space-y-1 text-sm text-blue-900">
                  <p className="font-semibold">{text.consentTitle}</p>
                  <p>{text.consentBody}</p>
                </div>
              </div>
              <Button onClick={handleAcceptPolicy}>{text.acceptAndContinue}</Button>
            </div>
          </Card>
        )}

        <Card className="border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 size-5 text-amber-600" />
            <div className="space-y-1 text-sm">
              {isAdminView ? (
                <>
                  <p className="font-semibold text-amber-900">{text.adminNoticeTitle}</p>
                  <p className="text-amber-800">{text.adminNoticeBody}</p>
                </>
              ) : (
                <>
                  <p className="font-semibold text-amber-900">{text.privacyNoticeTitle}</p>
                  <p className="text-amber-800">{text.privacyNoticeBody}</p>
                </>
              )}
            </div>
          </div>
        </Card>

        {statusMessage && (
          <Card className="border-green-200 bg-green-50 p-3 text-sm text-green-700">
            {statusMessage}
          </Card>
        )}

        <div className="h-[calc(100vh-16rem)] min-h-0">
          <Card className="h-full overflow-hidden">
            <div className="flex h-full min-h-0">
              <div
                className={`${
                  isChatOpenOnMobile ? 'hidden md:flex' : 'flex'
                } w-full min-h-0 flex-col border-l border-border md:w-96`}
              >
                <div className="border-b border-border p-4">
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder={text.searchPlaceholder}
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      className="bg-input-background pr-10"
                    />
                  </div>
                </div>

                <ScrollArea className="flex-1 min-h-0">
                  {filteredConversations.length > 0 ? (
                    filteredConversations.map((conversation) => (
                      <button
                        key={conversation.id}
                        type="button"
                        onClick={() => handleSelectConversation(conversation.id)}
                        className={`w-full cursor-pointer border-b border-border px-4 py-4 text-right transition-colors hover:bg-accent ${
                          selectedChat === conversation.id ? 'bg-accent/80' : ''
                        }`}
                        title={conversation.name}
                      >
                        <div className="flex items-start gap-3">
                          <div className="relative shrink-0">
                            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                              <User className="size-6 text-primary" />
                            </div>
                            {conversation.online && (
                              <Circle className="absolute bottom-0 left-0 size-3 fill-green-500 text-green-500" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start gap-3">
                              <div className="min-w-0 flex-1">
                                <h4 className="truncate text-base font-semibold leading-6 text-foreground">
                                  <Link
                                    to={conversation.profilePath}
                                    state={viewerProfileState}
                                    onClick={(event) => event.stopPropagation()}
                                    className="hover:text-primary hover:underline"
                                  >
                                    {conversation.name}
                                  </Link>
                                </h4>
                                <p className="mt-1 line-clamp-1 text-sm leading-6 text-muted-foreground">
                                  {conversation.lastMessage}
                                </p>
                              </div>

                              <div className="flex w-14 shrink-0 flex-col items-end gap-2 pt-0.5">
                                <span className="text-xs leading-5 text-muted-foreground">
                                  {conversation.time}
                                </span>
                                {conversation.unread > 0 && (
                                  <Badge className="flex min-w-5 items-center justify-center rounded-full px-1.5 py-0 text-xs">
                                    {conversation.unread}
                                  </Badge>
                                )}
                              </div>
                            </div>

                            <p className="mt-2 truncate text-xs leading-5 text-primary">
                              {conversation.project}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-6 text-center text-sm text-muted-foreground">
                      {text.noSearchResults}
                    </div>
                  )}
                </ScrollArea>
              </div>

              <div
                className={`${
                  isChatOpenOnMobile ? 'flex' : 'hidden md:flex'
                } min-w-0 min-h-0 flex-1 flex-col`}
              >
                {activeConversation ? (
                  <>
                    <div className="relative flex items-center justify-between border-b border-border p-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="md:hidden"
                          onClick={() => setIsChatOpenOnMobile(false)}
                        >
                          <ArrowRight className="size-5" />
                        </Button>
                        <div className="relative shrink-0">
                          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                            <User className="size-5 text-primary" />
                          </div>
                          {activeConversation.online && (
                            <Circle className="absolute bottom-0 left-0 size-3 fill-green-500 text-green-500" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="truncate font-semibold">
                            <Link
                              to={activeConversation.profilePath}
                              state={viewerProfileState}
                              className="hover:text-primary hover:underline"
                            >
                              {activeConversation.name}
                            </Link>
                          </h3>
                          <p className="truncate text-xs text-muted-foreground">
                            {activeConversation.project}
                          </p>
                        </div>
                      </div>

                      <div className="relative shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setIsConversationMenuOpen((current) => !current)}
                        >
                          <MoreVertical className="size-5" />
                        </Button>

                        {isConversationMenuOpen && (
                          <div
                            className={`absolute top-12 z-50 w-56 rounded-md border border-border bg-white p-1 shadow-lg ${
                              language === 'en' ? 'right-0' : 'left-0'
                            }`}
                          >
                            <div className="px-2 py-2 text-sm font-medium">
                              {text.conversationOptions}
                            </div>
                            <div className="my-1 h-px bg-border" />
                            <button
                              type="button"
                              onClick={handleShowConversationDetails}
                              className={`w-full rounded-sm px-2 py-2 text-sm hover:bg-accent ${
                                language === 'en' ? 'text-left' : 'text-right'
                              }`}
                            >
                              {text.showDetails}
                            </button>
                            {!isAdminView && (
                              <>
                                <button
                                  type="button"
                                  onClick={handleMuteConversation}
                                  className={`w-full rounded-sm px-2 py-2 text-sm hover:bg-accent ${
                                    language === 'en' ? 'text-left' : 'text-right'
                                  }`}
                                >
                                  {activeConversation &&
                                  mutedConversationIds.includes(activeConversation.id)
                                    ? text.unmuteNotifications
                                    : text.muteNotifications}
                                </button>
                                <button
                                  type="button"
                                  onClick={handleHideConversation}
                                  className={`w-full rounded-sm px-2 py-2 text-sm hover:bg-accent ${
                                    language === 'en' ? 'text-left' : 'text-right'
                                  }`}
                                >
                                  {text.hideConversation}
                                </button>
                                <button
                                  type="button"
                                  onClick={handleReportConversation}
                                  className={`w-full rounded-sm px-2 py-2 text-sm text-destructive hover:bg-destructive/10 ${
                                    language === 'en' ? 'text-left' : 'text-right'
                                  }`}
                                >
                                  {text.reportConversation}
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <ScrollArea className="flex-1 min-h-0 p-4">
                      <div className="space-y-4">
                        {currentMessages.length > 0 ? (
                          currentMessages.map((message) => {
                            const viewerSender = getViewerMessageSender(message.sender, userType);
                            const ownerLabel = getMessageOwnerLabel(
                              message.sender,
                              userType,
                              isEnglish,
                            );

                            return (
                              <div
                                key={message.id}
                                className={`flex ${
                                  viewerSender === 'me' ? 'justify-start' : 'justify-end'
                                }`}
                              >
                                <div className="max-w-[75%] space-y-2">
                                  <p
                                    className={`text-[11px] font-medium ${
                                      viewerSender === 'me'
                                        ? 'text-primary'
                                        : 'text-muted-foreground'
                                    }`}
                                  >
                                    {ownerLabel}
                                  </p>
                                  <div
                                    className={`rounded-2xl px-4 py-2 ${
                                      viewerSender === 'me'
                                        ? 'bg-primary text-white'
                                        : 'bg-muted text-foreground'
                                    }`}
                                  >
                                    <p className="mb-1">{message.text}</p>
                                    <p
                                      className={`text-xs ${
                                        viewerSender === 'me'
                                          ? 'text-blue-100'
                                          : 'text-muted-foreground'
                                      }`}
                                    >
                                      {message.time}
                                    </p>
                                  </div>

                                  {!isAdminView && viewerSender === 'other' && (
                                    <div className="flex justify-end">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-auto gap-1 px-2 py-1 text-xs text-muted-foreground"
                                        onClick={() => handleReportMessage(message.id)}
                                        disabled={message.reported}
                                      >
                                        <AlertTriangle className="size-3.5" />
                                        {message.reported ? text.reported : text.report}
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="py-10 text-center text-muted-foreground">
                            {text.noMessagesYet}
                          </div>
                        )}
                      </div>
                    </ScrollArea>

                    <div className="border-t border-border p-4">
                      {!isAdminView && (
                        <div className="mb-2 text-xs text-muted-foreground">
                          {text.reportCenterIntro}{' '}
                          <Link
                            to={moderationPageLink}
                            className="font-medium text-primary underline-offset-2 hover:underline"
                          >
                            {text.reportCenterLink}
                          </Link>{' '}
                          {text.reportCenterEnd}
                        </div>
                      )}

                      <div className="mb-2 text-xs text-muted-foreground">
                        {isAdminView ? text.adminMessageHint : text.sensitiveDataHint}
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder={text.writeMessage}
                          value={newMessage}
                          onChange={(event) => setNewMessage(event.target.value)}
                          className="flex-1 bg-input-background"
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                              handleSendMessage();
                            }
                          }}
                        />
                        <Button size="icon" onClick={handleSendMessage}>
                          <Send className="size-5" />
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-1 items-center justify-center text-muted-foreground">
                    {text.noConversationSelected}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function Messages() {
  return <MessagesPage />;
}
