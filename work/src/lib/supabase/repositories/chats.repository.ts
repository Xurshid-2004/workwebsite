import type { Chat, Message } from '@/types';
import { getSupabaseClient } from '@/lib/supabase/client';
import { mapChatRow, mapMessageRow } from '@/lib/supabase/mappers';
import type { ChatParticipantRow, ChatRow, MessageRow } from '@/lib/supabase/database.types';

async function loadParticipantIds(chatId: string): Promise<string[]> {
  const { data, error } = await getSupabaseClient()
    .from('chat_participants')
    .select('*')
    .eq('chat_id', chatId);
  if (error) throw error;
  const rows = (data ?? []) as ChatParticipantRow[];
  return rows.map((r) => r.user_id);
}

export const supabaseChatsRepository = {
  async getChatsForUser(userId: string): Promise<Chat[]> {
    const { data: memberships, error } = await getSupabaseClient()
      .from('chat_participants')
      .select('*')
      .eq('user_id', userId);
    if (error) throw error;

    const membershipRows = (memberships ?? []) as ChatParticipantRow[];
    const chatIds = membershipRows.map((m) => m.chat_id);
    if (chatIds.length === 0) return [];

    const { data: chats, error: chatError } = await getSupabaseClient()
      .from('chats')
      .select('*')
      .in('id', chatIds)
      .order('updated_at', { ascending: false });
    if (chatError) throw chatError;

    const chatRows = (chats ?? []) as ChatRow[];
    const result: Chat[] = [];
    for (const row of chatRows) {
      const participantIds = await loadParticipantIds(row.id);
      result.push(mapChatRow(row, participantIds));
    }
    return result;
  },

  async getChatById(chatId: string): Promise<Chat | undefined> {
    const { data, error } = await getSupabaseClient().from('chats').select('*').eq('id', chatId).maybeSingle();
    if (error) throw error;
    const row = data as ChatRow | null;
    if (!row) return undefined;
    const participantIds = await loadParticipantIds(chatId);
    return mapChatRow(row, participantIds);
  },

  async getMessages(chatId: string): Promise<Message[]> {
    const { data, error } = await getSupabaseClient()
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return ((data ?? []) as MessageRow[]).map(mapMessageRow);
  },

  async sendMessage(message: Message): Promise<Message> {
    const { data, error } = await getSupabaseClient()
      .from('messages')
      .insert({
        id: message.id,
        chat_id: message.chatId,
        sender_id: message.senderId,
        body: message.body,
        read: message.read,
        created_at: message.createdAt,
      })
      .select()
      .single();
    if (error) throw error;

    await getSupabaseClient()
      .from('chats')
      .update({ last_message_id: message.id, updated_at: message.createdAt })
      .eq('id', message.chatId);

    return mapMessageRow(data as MessageRow);
  },

  async markAsRead(chatId: string, readerId: string): Promise<void> {
    const { error } = await getSupabaseClient()
      .from('messages')
      .update({ read: true })
      .eq('chat_id', chatId)
      .neq('sender_id', readerId)
      .eq('read', false);
    if (error) throw error;
  },

  async createChat(chat: Chat): Promise<Chat> {
    const supabase = getSupabaseClient();
    const { error: chatError } = await supabase.from('chats').insert({
      id: chat.id,
      job_id: chat.jobId ?? null,
      last_message_id: chat.lastMessageId || null,
      updated_at: chat.updatedAt,
      created_at: chat.updatedAt,
    });
    if (chatError) throw chatError;

    const rows = chat.participantIds.map((userId) => ({
      chat_id: chat.id,
      user_id: userId,
    }));
    const { error: partError } = await supabase.from('chat_participants').insert(rows);
    if (partError) throw partError;

    return chat;
  },

  subscribeToMessages(chatId: string, onInsert: (message: Message) => void): () => void {
    const channel = getSupabaseClient()
      .channel(`messages:${chatId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${chatId}` },
        (payload) => {
          onInsert(mapMessageRow(payload.new as Parameters<typeof mapMessageRow>[0]));
        }
      )
      .subscribe();

    return () => {
      void getSupabaseClient().removeChannel(channel);
    };
  },
};
