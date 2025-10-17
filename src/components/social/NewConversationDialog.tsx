import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, MessageCircle, Loader2 } from 'lucide-react';
import { PrivateConversation } from '@/types/social';
import { usePrivateMessages } from '@/hooks/usePrivateMessages';
import { toast } from 'sonner';

interface User {
  id: string;
  full_name: string;
  avatar_url?: string;
}

interface NewConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConversationCreated: (conversation: PrivateConversation) => void;
}

export function NewConversationDialog({ 
  open, 
  onOpenChange, 
  onConversationCreated 
}: NewConversationDialogProps) {
  const { searchUsers, createConversation } = usePrivateMessages();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      handleSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const results = await searchUsers(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      toast.error('Erro ao buscar usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateConversation = async (user: User) => {
    setCreating(true);
    try {
      const conversation = await createConversation(user.id);
      
      if (conversation) {
        onConversationCreated(conversation);
        onOpenChange(false);
        setSearchQuery('');
        setSearchResults([]);
        toast.success(`Conversa iniciada com ${user.full_name}`);
      }
    } catch (error) {
      console.error('Erro ao criar conversa:', error);
      toast.error('Erro ao criar conversa');
    } finally {
      setCreating(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Nova Conversa
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar usuários pelo nome..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>

          {/* Search Results */}
          <div className="min-h-[200px]">
            {searchQuery.trim().length < 2 ? (
              <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                <Search className="h-8 w-8 mb-2" />
                <p className="text-sm">Digite pelo menos 2 caracteres para buscar</p>
              </div>
            ) : loading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : searchResults.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                <Search className="h-8 w-8 mb-2" />
                <p className="text-sm">Nenhum usuário encontrado</p>
                <p className="text-xs text-gray-400">Tente buscar por outro nome</p>
              </div>
            ) : (
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={user.avatar_url} />
                          <AvatarFallback>
                            {user.full_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div>
                          <p className="font-medium text-gray-900">
                            {user.full_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            Estudante
                          </p>
                        </div>
                      </div>
                      
                      <Button
                        size="sm"
                        onClick={() => handleCreateConversation(user)}
                        disabled={creating}
                      >
                        {creating ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Conversar'
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

          {/* Instructions */}
          <div className="text-xs text-gray-500 text-center">
            Selecione um usuário para iniciar uma nova conversa
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}