-- Corrigir políticas RLS com recursão infinita

-- Remover políticas problemáticas existentes
DROP POLICY IF EXISTS "study_group_members_policy" ON study_group_members;
DROP POLICY IF EXISTS "study_groups_policy" ON study_groups;

-- Criar políticas RLS simples e seguras para study_group_members
CREATE POLICY "study_group_members_select" ON study_group_members
  FOR SELECT USING (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM study_groups sg 
      WHERE sg.id = group_id AND sg.creator_id = auth.uid()
    )
  );

CREATE POLICY "study_group_members_insert" ON study_group_members
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "study_group_members_delete" ON study_group_members
  FOR DELETE USING (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM study_groups sg 
      WHERE sg.id = group_id AND sg.creator_id = auth.uid()
    )
  );

-- Criar políticas RLS simples e seguras para study_groups
CREATE POLICY "study_groups_select" ON study_groups
  FOR SELECT USING (
    NOT is_private OR 
    creator_id = auth.uid() OR
    id IN (
      SELECT group_id FROM study_group_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "study_groups_insert" ON study_groups
  FOR INSERT WITH CHECK (creator_id = auth.uid());

CREATE POLICY "study_groups_update" ON study_groups
  FOR UPDATE USING (creator_id = auth.uid());

CREATE POLICY "study_groups_delete" ON study_groups
  FOR DELETE USING (creator_id = auth.uid());
