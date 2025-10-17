import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { PrivateMessage, PrivateConversation } from '@/types/social';
import { toast } from 'sonner';

export function usePrivateMessages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<PrivateConversation[]>([]);
  const [messages, setMessages] = useState<PrivateMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  // Fetch user conversations
  const fetchConversations = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('private_conversations')
        .select(`
          *,
          user1:users!private_conversations_user1_id_fkey(
            id, full_name, avatar_url
          ),
          user2:users!private_conversations_user2_id_fkey(
            id, full_name, avatar_url
          )
        `)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      setConversations(data || []);
    } catch (error) {
      console.error('Erro ao buscar conversas:', error);
      toast.error('Erro ao carregar conversas');
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for a conversation
  const fetchMessages = async (conversationId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('private_messages')
        .select(`
          *,
          sender:users(id, full_name, avatar_url)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages(data || []);
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
      toast.error('Erro ao carregar mensagens');
    } finally {
      setLoading(false);
    }
  };

  // Send a new message
  const sendMessage = async (conversationId: string, content: string) => {
    if (!user || !content.trim()) return;

    setSending(true);
    try {
      // Insert new message
      const { data: messageData, error: messageError } = await supabase
        .from('private_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: content.trim(),
          message_status: 'sent'
        })
        .select(`
          *,
          sender:users(id, full_name, avatar_url)
        `)
        .single();

      if (messageError) throw messageError;

      // Update conversation last message
      const { error: conversationError } = await supabase
        .from('private_conversations')
        .update({
          last_message_at: new Date().toISOString()
        })
        .eq('id', conversationId);

      if (conversationError) throw conversationError;

      // Add message to local state
      setMessages(prev => [...prev, messageData]);

      // Update conversations list
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { 
                ...conv, 
                last_message_at: new Date().toISOString()
              }
            : conv
        )
      );

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Erro ao enviar mensagem');
      throw error;
    } finally {
      setSending(false);
    }
  };

  // Mark messages as read
  const markAsRead = async (conversationId: string) => {
    if (!user) return;

    try {
      // Mark unread messages as read
      const { error } = await supabase
        .from('private_messages')
        .update({ 
          read_at: new Date().toISOString(),
          message_status: 'read'
        })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id)
        .is('read_at', null);

      if (error) throw error;

    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    }
  };

  // Create new conversation
  const createConversation = async (participantId: string): Promise<PrivateConversation | null> => {
    if (!user || participantId === user.id) return null;

    try {
      // Check if conversation already exists
      const { data: existingConversation } = await supabase
        .from('private_conversations')
        .select('*')
        .or(`and(user1_id.eq.${user.id},user2_id.eq.${participantId}),and(user1_id.eq.${participantId},user2_id.eq.${user.id})`)
        .single();

      if (existingConversation) {
        // Fetch full conversation data
        const { data: fullConversation } = await supabase
          .from('private_conversations')
          .select(`
            *,
            user1:users!private_conversations_user1_id_fkey(
              id, full_name, avatar_url
            ),
            user2:users!private_conversations_user2_id_fkey(
              id, full_name, avatar_url
            )
          `)
          .eq('id', existingConversation.id)
          .single();

        return fullConversation;
      }

      // Create new conversation
      const { data: newConversation, error } = await supabase
        .from('private_conversations')
        .insert({
          user1_id: user.id,
          user2_id: participantId,
          last_message_at: new Date().toISOString()
        })
        .select(`
          *,
          user1:users!private_conversations_user1_id_fkey(
            id, full_name, avatar_url
          ),
          user2:users!private_conversations_user2_id_fkey(
            id, full_name, avatar_url
          )
        `)
        .single();

      if (error) throw error;

      return newConversation;

    } catch (error) {
      console.error('Erro ao criar conversa:', error);
      toast.error('Erro ao criar conversa');
      return null;
    }
  };

  // Search users for new conversations
  const searchUsers = async (query: string) => {
    if (!query.trim() || !user) return [];

    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, avatar_url')
        .neq('id', user.id)
        .ilike('full_name', `%${query}%`)
        .limit(10);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      return [];
    }
  };

  // Setup real-time subscriptions
  useEffect(() => {
    if (!user) return;

    // Subscribe to new messages
    const messagesSubscription = supabase
      .channel('private_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'private_messages'
        },
        async (payload) => {
          const newMessage = payload.new as PrivateMessage;
          
          // Fetch complete message data
          const { data } = await supabase
            .from('private_messages')
            .select(`
              *,
              sender:users(id, full_name, avatar_url)
            `)
            .eq('id', newMessage.id)
            .single();

          if (data) {
            setMessages(prev => [...prev, data]);
          }
        }
      )
      .subscribe();

    // Subscribe to conversation updates
    const conversationsSubscription = supabase
      .channel('private_conversations')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'private_conversations'
        },
        (payload) => {
          const updatedConversation = payload.new as PrivateConversation;
          
          setConversations(prev => 
            prev.map(conv => 
              conv.id === updatedConversation.id 
                ? { ...conv, ...updatedConversation }
                : conv
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesSubscription);
      supabase.removeChannel(conversationsSubscription);
    };
  }, [user]);

  return {
    conversations,
    messages,
    loading,
    sending,
    fetchConversations,
    fetchMessages,
    sendMessage,
    markAsRead,
    createConversation,
    searchUsers
  };
}