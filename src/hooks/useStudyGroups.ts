import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { StudyGroup, GroupMessage } from '@/types/social';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function useStudyGroups() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [myGroups, setMyGroups] = useState<StudyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('study_groups')
        .select(`
          *,
          creator:users!study_groups_created_by_fkey(id, full_name, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Processar os dados para incluir informações de membro
      const processedGroups = await Promise.all(
        (data || []).map(async (group) => {
          // Verificar se o usuário é membro
          const { data: memberData } = await supabase
            .from('group_members')
            .select('role')
            .eq('group_id', group.id)
            .eq('user_id', user?.id)
            .eq('status', 'active')
            .maybeSingle();

          // Buscar contagem real de membros
          const { count: memberCount } = await supabase
            .from('group_members')
            .select('*', { count: 'exact', head: true })
            .eq('group_id', group.id)
            .eq('status', 'active');

          // Buscar membros recentes
          const { data: recentMembers } = await supabase
            .from('group_members')
            .select(`
              user:users!group_members_user_id_fkey(id, full_name, avatar_url)
            `)
            .eq('group_id', group.id)
            .eq('status', 'active')
            .order('joined_at', { ascending: false })
            .limit(5);

          return {
            ...group,
            member_count: memberCount || 0,
            is_member: !!memberData,
            is_admin: memberData?.role === 'admin',
            recent_members: recentMembers?.map(m => m.user).filter(Boolean) || []
          };
        })
      );

      setGroups(processedGroups);
      
      // Filtrar grupos do usuário
      const userGroups = processedGroups.filter(group => group.is_member);
      setMyGroups(userGroups);
    } catch (error) {
      console.error('Erro ao buscar grupos:', error);
      setError('Erro ao carregar grupos');
      // Falha silenciosa - não quebra a UI
      setGroups([]);
      setMyGroups([]);
    }
  };

  const refreshGroups = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await fetchGroups();
    } catch (error) {
      console.error('Erro ao atualizar grupos:', error);
      setError('Erro ao carregar grupos');
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async (groupData: {
    name: string;
    description?: string;
    group_type: 'public' | 'private';
    subject?: string;
    max_members?: number;
    tags?: string[];
  }) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('study_groups')
        .insert({
          ...groupData,
          created_by: user.id,
          invite_code: Math.random().toString(36).substring(2, 8).toUpperCase()
        })
        .select()
        .single();

      if (error) throw error;

      // Adicionar o criador como admin do grupo
      await supabase
        .from('group_members')
        .insert({
          group_id: data.id,
          user_id: user.id,
          role: 'admin',
          status: 'active'
        });

      toast.success('Grupo criado com sucesso!');
      await refreshGroups();
      return data;
    } catch (error) {
      console.error('Erro ao criar grupo:', error);
      toast.error('Erro ao criar grupo');
      throw error;
    }
  };

  const joinGroup = async (groupId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          user_id: user.id,
          role: 'member',
          status: 'active'
        });

      if (error) throw error;

      toast.success('Você entrou no grupo!');
      await refreshGroups();
    } catch (error) {
      console.error('Erro ao entrar no grupo:', error);
      toast.error('Erro ao entrar no grupo');
      throw error;
    }
  };

  const leaveGroup = async (groupId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('group_members')
        .update({ status: 'left' })
        .eq('group_id', groupId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Você saiu do grupo');
      await refreshGroups();
    } catch (error) {
      console.error('Erro ao sair do grupo:', error);
      toast.error('Erro ao sair do grupo');
      throw error;
    }
  };

  const sendMessage = async (groupId: string, content: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('group_messages')
        .insert({
          group_id: groupId,
          user_id: user.id,
          content: content.trim(),
          message_type: 'text'
        })
        .select(`
          *,
          user:users(id, full_name, avatar_url)
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      throw error;
    }
  };

  const fetchGroupMessages = async (groupId: string, limit = 50) => {
    try {
      const { data, error } = await supabase
        .from('group_messages')
        .select(`
          *,
          user:users(id, full_name, avatar_url)
        `)
        .eq('group_id', groupId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []).reverse(); // Reverter para ordem cronológica
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
      return [];
    }
  };

  useEffect(() => {
    if (user) {
      refreshGroups();
    }
  }, [user]);

  // Configurar real-time subscriptions
  useEffect(() => {
    if (!user) return;

    const groupsSubscription = supabase
      .channel('study_groups_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'study_groups'
        },
        () => {
          fetchGroups();
        }
      )
      .subscribe();

    const membersSubscription = supabase
      .channel('group_members_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'group_members'
        },
        () => {
          fetchGroups();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(groupsSubscription);
      supabase.removeChannel(membersSubscription);
    };
  }, [user]);

  return {
    groups,
    myGroups,
    loading,
    error,
    refreshGroups,
    createGroup,
    joinGroup,
    leaveGroup,
    sendMessage,
    fetchGroupMessages
  };
}