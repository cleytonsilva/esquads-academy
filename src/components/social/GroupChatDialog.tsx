import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Send, 
  Users, 
  Settings, 
  MoreVertical,
  Smile,
  Paperclip,
  Phone,
  Video
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { StudyGroup, GroupMessage } from '@/types/social';
import { useStudyGroups } from '@/hooks/useStudyGroups';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface GroupChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: StudyGroup;
}

export function GroupChatDialog({ 
  open, 
  onOpenChange, 
  group 
}: GroupChatDialogProps) {
  const { user } = useAuth();
  const { sendMessage, fetchGroupMessages } = useStudyGroups();
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && group) {
      loadMessages();
      setupRealtimeSubscription();
    }
  }, [open, group]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const groupMessages = await fetchGroupMessages(group.id);
      setMessages(groupMessages);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
      toast.error('Erro ao carregar mensagens');
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const subscription = supabase
      .channel(`group_messages_${group.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'group_messages',
          filter: `group_id=eq.${group.id}`
        },
        async (payload) => {
          // Buscar dados completos da nova mensagem
          const { data } = await supabase
            .from('group_messages')
            .select(`
              *,
              user:users(id, full_name, avatar_url)
            `)
            .eq('id', payload.new.id)
            .single();

          if (data) {
            setMessages(prev => [...prev, data]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending) return;

    setSending(true);
    const messageContent = newMessage.trim();
    setNewMessage('');

    try {
      await sendMessage(group.id, messageContent);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Erro ao enviar mensagem');
      setNewMessage(messageContent); // Restaurar mensagem em caso de erro
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatMessageTime = (date: string) => {
    const messageDate = new Date(date);
    const now = new Date();
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return formatDistanceToNow(messageDate, { 
        addSuffix: true, 
        locale: ptBR 
      });
    }
  };

  const groupMessagesByDate = (messages: GroupMessage[]) => {
    const groups: { [key: string]: GroupMessage[] } = {};
    
    messages.forEach(message => {
      const date = new Date(message.created_at).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });

    return groups;
  };

  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (dateString === today) return 'Hoje';
    if (dateString === yesterday) return 'Ontem';
    
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] h-[600px] flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src={group.avatar_url} />
                <AvatarFallback>
                  <Users className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-lg">{group.name}</DialogTitle>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Users className="h-3 w-3" />
                  <span>{group.member_count} membros</span>
                  {group.group_type === 'private' && (
                    <Badge variant="secondary" className="text-xs">Privado</Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Phone className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Video className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Messages Area */}
        <ScrollArea className="flex-1 px-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              {Object.entries(groupedMessages).map(([date, dateMessages]) => (
                <div key={date}>
                  {/* Date Header */}
                  <div className="flex items-center justify-center my-4">
                    <div className="bg-gray-100 px-3 py-1 rounded-full text-xs text-gray-600">
                      {formatDateHeader(date)}
                    </div>
                  </div>

                  {/* Messages for this date */}
                  <div className="space-y-3">
                    {dateMessages.map((message, index) => {
                      const isOwnMessage = message.user_id === user?.id;
                      const showAvatar = index === 0 || 
                        dateMessages[index - 1].user_id !== message.user_id;

                      return (
                        <div
                          key={message.id}
                          className={`flex items-end space-x-2 ${
                            isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''
                          }`}
                        >
                          {/* Avatar */}
                          <div className="flex-shrink-0">
                            {showAvatar ? (
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={message.user?.avatar_url} />
                                <AvatarFallback className="text-xs">
                                  {message.user?.full_name?.charAt(0) || 'U'}
                                </AvatarFallback>
                              </Avatar>
                            ) : (
                              <div className="h-8 w-8"></div>
                            )}
                          </div>

                          {/* Message Content */}
                          <div className={`flex flex-col max-w-[70%] ${
                            isOwnMessage ? 'items-end' : 'items-start'
                          }`}>
                            {showAvatar && !isOwnMessage && (
                              <span className="text-xs text-gray-600 mb-1 px-3">
                                {message.user?.full_name}
                              </span>
                            )}
                            
                            <div className={`rounded-lg px-3 py-2 ${
                              isOwnMessage
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}>
                              <p className="text-sm whitespace-pre-wrap">
                                {message.content}
                              </p>
                            </div>
                            
                            <span className="text-xs text-gray-500 mt-1 px-1">
                              {formatMessageTime(message.created_at)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              
              {messages.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <Users className="h-12 w-12 mb-4" />
                  <p className="text-lg font-medium">Nenhuma mensagem ainda</p>
                  <p className="text-sm">Seja o primeiro a enviar uma mensagem!</p>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {/* Message Input */}
        <div className="border-t p-4">
          <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
            <Button type="button" variant="ghost" size="sm">
              <Paperclip className="h-4 w-4" />
            </Button>
            
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
                disabled={sending}
                className="pr-10"
                maxLength={1000}
              />
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
              >
                <Smile className="h-4 w-4" />
              </Button>
            </div>
            
            <Button 
              type="submit" 
              disabled={!newMessage.trim() || sending}
              size="sm"
            >
              {sending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
          
          <div className="text-xs text-gray-500 mt-2 text-center">
            {newMessage.length}/1000 caracteres
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}