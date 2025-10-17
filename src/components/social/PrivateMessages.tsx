import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  MessageCircle, 
  Plus, 
  MoreVertical,
  Send,
  Paperclip,
  Smile,
  Phone,
  Video,
  Info
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PrivateMessage, PrivateConversation } from '@/types/social';
import { usePrivateMessages } from '@/hooks/usePrivateMessages';
import { useAuth } from '@/contexts/AuthContext';
import { NewConversationDialog } from './NewConversationDialog';

export function PrivateMessages() {
  const { user } = useAuth();
  const {
    conversations,
    messages,
    loading,
    sending,
    fetchConversations,
    fetchMessages,
    sendMessage,
    markAsRead
  } = usePrivateMessages();

  const [selectedConversation, setSelectedConversation] = useState<PrivateConversation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [showNewConversation, setShowNewConversation] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
      markAsRead(selectedConversation.id);
    }
  }, [selectedConversation]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedConversation || sending) return;

    const messageContent = newMessage.trim();
    setNewMessage('');

    try {
      await sendMessage(selectedConversation.id, messageContent);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      setNewMessage(messageContent); // Restaurar mensagem em caso de erro
    }
  };

  const handleConversationSelect = (conversation: PrivateConversation) => {
    setSelectedConversation(conversation);
  };

  const filteredConversations = conversations.filter(conversation => {
    const otherUser = conversation.user1_id === user?.id 
      ? conversation.user2 
      : conversation.user1;
    
    return otherUser?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const formatMessageTime = (date: string) => {
    const messageDate = new Date(date);
    const now = new Date();
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Agora';
    } else if (diffInHours < 24) {
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

  const getOtherUser = (conversation: PrivateConversation) => {
    return conversation.user1_id === user?.id 
      ? conversation.user2 
      : conversation.user1;
  };

  const groupMessagesByDate = (messages: PrivateMessage[]) => {
    const groups: { [key: string]: PrivateMessage[] } = {};
    
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
    <div className="flex h-[600px] bg-white rounded-lg border">
      {/* Conversations List */}
      <div className="w-1/3 border-r flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Mensagens</h3>
            <Button 
              size="sm" 
              onClick={() => setShowNewConversation(true)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar conversas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Conversations */}
        <ScrollArea className="flex-1">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-500">
              <MessageCircle className="h-8 w-8 mb-2" />
              <p className="text-sm">Nenhuma conversa encontrada</p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {filteredConversations.map((conversation) => {
                const otherUser = getOtherUser(conversation);
                const isSelected = selectedConversation?.id === conversation.id;
                
                return (
                  <div
                    key={conversation.id}
                    onClick={() => handleConversationSelect(conversation)}
                    className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      isSelected 
                        ? 'bg-blue-50 border border-blue-200' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <Avatar>
                      <AvatarImage src={otherUser?.avatar_url} />
                      <AvatarFallback>
                        {otherUser?.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {otherUser?.full_name || 'Usuário'}
                        </p>
                        <span className="text-xs text-gray-500">
                          {formatMessageTime(conversation.last_message_at)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 truncate">
                        {conversation.last_message || 'Nenhuma mensagem'}
                      </p>
                    </div>
                    
                    {conversation.unread_count > 0 && (
                      <Badge variant="default" className="bg-blue-600">
                        {conversation.unread_count}
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={getOtherUser(selectedConversation)?.avatar_url} />
                    <AvatarFallback>
                      {getOtherUser(selectedConversation)?.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">
                      {getOtherUser(selectedConversation)?.full_name || 'Usuário'}
                    </h4>
                    <p className="text-sm text-gray-500">Online</p>
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
                    <Info className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
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
                      {dateMessages.map((message) => {
                        const isOwnMessage = message.sender_id === user?.id;

                        return (
                          <div
                            key={message.id}
                            className={`flex ${
                              isOwnMessage ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            <div className={`max-w-[70%] ${
                              isOwnMessage ? 'order-2' : 'order-1'
                            }`}>
                              <div className={`rounded-lg px-3 py-2 ${
                                isOwnMessage
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 text-gray-900'
                              }`}>
                                <p className="text-sm whitespace-pre-wrap">
                                  {message.content}
                                </p>
                              </div>
                              
                              <div className={`text-xs text-gray-500 mt-1 ${
                                isOwnMessage ? 'text-right' : 'text-left'
                              }`}>
                                {formatMessageTime(message.created_at)}
                                {isOwnMessage && message.read_at && (
                                  <span className="ml-1">✓✓</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
                
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <MessageCircle className="h-12 w-12 mb-4" />
                    <p className="text-lg font-medium">Nenhuma mensagem ainda</p>
                    <p className="text-sm">Envie a primeira mensagem!</p>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="border-t p-4">
              <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                <Button type="button" variant="ghost" size="sm">
                  <Paperclip className="h-4 w-4" />
                </Button>
                
                <div className="flex-1 relative">
                  <Input
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
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Selecione uma conversa</h3>
              <p className="text-sm">Escolha uma conversa para começar a trocar mensagens</p>
            </div>
          </div>
        )}
      </div>

      {/* New Conversation Dialog */}
      <NewConversationDialog
        open={showNewConversation}
        onOpenChange={setShowNewConversation}
        onConversationCreated={(conversation) => {
          setSelectedConversation(conversation);
          fetchConversations();
        }}
      />
    </div>
  );
}