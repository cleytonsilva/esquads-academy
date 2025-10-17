import React, { useState } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { AlertTriangle, User as UserIcon, Trash2, Loader2 } from 'lucide-react';
import { userManagementService, User } from '@/services/userManagementService';

interface DeleteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: User | null;
}

export const DeleteUserModal: React.FC<DeleteUserModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  user
}) => {
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!user) return;

    try {
      setLoading(true);

      await userManagementService.deleteUser(user.id);

      addNotification({
        id: Date.now().toString(),
        type: 'success',
        title: 'Sucesso',
        message: 'Usuário excluído com sucesso!',
        read: false
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Erro',
        message: error instanceof Error ? error.message : 'Não foi possível excluir o usuário',
        read: false
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-red-600">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Confirmar Exclusão
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-lg">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <UserIcon className="h-5 w-5 text-red-600" />
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-900">{user.full_name}</h4>
              <p className="text-sm text-gray-600">{user.email}</p>
              <p className="text-xs text-gray-500 capitalize">
                {user.role === 'admin' ? 'Administrador' : 'Estudante'}
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800">
                  Esta ação não pode ser desfeita!
                </h4>
                <ul className="mt-2 text-sm text-yellow-700 space-y-1">
                  <li>• O usuário será removido permanentemente</li>
                  <li>• Todos os dados associados serão perdidos</li>
                  <li>• O usuário não conseguirá mais fazer login</li>
                  {user.role === 'admin' && (
                    <li>• <strong>ATENÇÃO:</strong> Este é um usuário administrador!</li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            <p>
              Tem certeza que deseja excluir permanentemente o usuário{' '}
              <strong>{user.full_name}</strong>?
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Excluindo...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir Usuário
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
