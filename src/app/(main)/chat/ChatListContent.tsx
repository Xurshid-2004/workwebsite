'use client';

import { PageHeader } from '@/components/ui/PageHeader';
import { ChatListItem } from '@/components/chat/ChatListItem';
import { ChatEmptyState } from '@/components/chat/ChatEmptyState';
import { ChatListSkeleton } from '@/components/ui/LoadingState';
import { QueryErrorBanner } from '@/components/ui/QueryErrorBanner';
import { useChats } from '@/context/ChatsContext';

export function ChatListContent() {
  const { chats, isHydrated, isLoading, error, refresh, totalUnread } = useChats();

  if (!isHydrated || isLoading) {
    return <ChatListSkeleton />;
  }

  return (
    <div className="page-container">
      <PageHeader
        title="Messages"
        subtitle={
          totalUnread > 0
            ? `${totalUnread} unread conversation${totalUnread === 1 ? '' : 's'}`
            : 'Chat with employers and applicants'
        }
      />

      <QueryErrorBanner message={error} onRetry={refresh} className="mb-4" />

      {chats.length > 0 ? (
        <div className="flex flex-col gap-2.5">
          {chats.map((chat) => (
            <ChatListItem key={chat.id} chat={chat} />
          ))}
        </div>
      ) : (
        <ChatEmptyState />
      )}
    </div>
  );
}
