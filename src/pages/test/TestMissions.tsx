import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Mission {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  type: string;
  created_at: string;
}

const TestMissions: React.FC = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMissions = async () => {
      try {
        const { data, error } = await supabase
          .from('missions')
          .select('id, title, category, difficulty, type, created_at')
          .order('created_at', { ascending: false });

        if (error) {
          setError(error.message);
        } else {
          setMissions(data || []);
        }
      } catch (err) {
        setError('Erro ao carregar missões');
      } finally {
        setLoading(false);
      }
    };

    fetchMissions();
  }, []);

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;

  const cybersecurityMissions = missions.filter(m => m.category === 'cybersecurity');
  const categories = [...new Set(missions.map(m => m.category))];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Teste de Missões</h1>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Estatísticas</h2>
        <p>Total de missões: {missions.length}</p>
        <p>Missões de cybersegurança: {cybersecurityMissions.length}</p>
        <p>Categorias encontradas: {categories.join(', ')}</p>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Missões de Cybersegurança</h2>
        {cybersecurityMissions.length === 0 ? (
          <p>Nenhuma missão de cybersegurança encontrada</p>
        ) : (
          <div className="space-y-2">
            {cybersecurityMissions.map(mission => (
              <div key={mission.id} className="border p-3 rounded">
                <h3 className="font-medium">{mission.title}</h3>
                <p className="text-sm text-gray-600">
                  Categoria: {mission.category} | Dificuldade: {mission.difficulty} | Tipo: {mission.type}
                </p>
                <p className="text-xs text-gray-500">Criado em: {new Date(mission.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">Todas as Missões</h2>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {missions.map(mission => (
            <div key={mission.id} className="border p-2 rounded text-sm">
              <strong>{mission.title}</strong> - {mission.category} ({mission.difficulty})
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestMissions;