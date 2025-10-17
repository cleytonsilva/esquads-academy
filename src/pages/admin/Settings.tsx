import React, { useState, useEffect } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Bell, 
  Shield, 
  Database, 
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SystemSettings {
  notifications_enabled: boolean;
  email_notifications: boolean;
  maintenance_mode: boolean;
  registration_enabled: boolean;
  max_users: number;
  session_timeout: number;
  backup_frequency: string;
}

interface SecuritySettings {
  password_min_length: number;
  require_email_verification: boolean;
  two_factor_enabled: boolean;
  login_attempts_limit: number;
  lockout_duration: number;
}

const AdminSettings: React.FC = () => {
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    notifications_enabled: true,
    email_notifications: true,
    maintenance_mode: false,
    registration_enabled: true,
    max_users: 1000,
    session_timeout: 30,
    backup_frequency: 'daily'
  });
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    password_min_length: 8,
    require_email_verification: true,
    two_factor_enabled: false,
    login_attempts_limit: 5,
    lockout_duration: 15
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      
      // Buscar configurações do sistema (simulado por enquanto)
      // Em uma implementação real, isso viria de uma tabela de configurações
      const { data: systemData } = await supabase
        .from('system_settings')
        .select('*')
        .single();

      const { data: securityData } = await supabase
        .from('security_settings')
        .select('*')
        .single();

      if (systemData) {
        setSystemSettings(systemData);
      }
      if (securityData) {
        setSecuritySettings(securityData);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      // Usar configurações padrão se não conseguir carregar
    } finally {
      setLoading(false);
    }
  };

  const handleSystemSettingsChange = (key: keyof SystemSettings, value: any) => {
    setSystemSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSecuritySettingsChange = (key: keyof SecuritySettings, value: any) => {
    setSecuritySettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSystemSettings = async () => {
    try {
      setSaving(true);
      
      // Salvar configurações do sistema
      const { error } = await supabase
        .from('system_settings')
        .upsert(systemSettings);

      if (error) throw error;

      addNotification({
        id: Date.now().toString(),
        type: 'success',
        title: 'Sucesso',
        message: 'Configurações do sistema salvas com sucesso!',
        read: false
      });
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Erro',
        message: 'Não foi possível salvar as configurações',
        read: false
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSecuritySettings = async () => {
    try {
      setSaving(true);
      
      // Salvar configurações de segurança
      const { error } = await supabase
        .from('security_settings')
        .upsert(securitySettings);

      if (error) throw error;

      addNotification({
        id: Date.now().toString(),
        type: 'success',
        title: 'Sucesso',
        message: 'Configurações de segurança salvas com sucesso!',
        read: false
      });
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Erro',
        message: 'Não foi possível salvar as configurações',
        read: false
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      const { error } = await supabase
        .from('users')
        .select('count')
        .limit(1);

      if (error) throw error;

      addNotification({
        id: Date.now().toString(),
        type: 'success',
        title: 'Conexão OK',
        message: 'Conexão com o banco de dados está funcionando!',
        read: false
      });
    } catch (error) {
      addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Erro de Conexão',
        message: 'Não foi possível conectar ao banco de dados',
        read: false
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configurações do Sistema</h1>
          <p className="text-gray-600">Gerencie as configurações gerais da plataforma</p>
        </div>
        <Button onClick={handleTestConnection} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Testar Conexão
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configurações do Sistema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Configurações do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Notificações Ativas</Label>
                  <p className="text-sm text-gray-600">Habilitar sistema de notificações</p>
                </div>
                <Switch
                  checked={systemSettings.notifications_enabled}
                  onCheckedChange={(checked) => handleSystemSettingsChange('notifications_enabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Notificações por Email</Label>
                  <p className="text-sm text-gray-600">Enviar notificações por email</p>
                </div>
                <Switch
                  checked={systemSettings.email_notifications}
                  onCheckedChange={(checked) => handleSystemSettingsChange('email_notifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Modo Manutenção</Label>
                  <p className="text-sm text-gray-600">Manter sistema em modo manutenção</p>
                </div>
                <Switch
                  checked={systemSettings.maintenance_mode}
                  onCheckedChange={(checked) => handleSystemSettingsChange('maintenance_mode', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Cadastros Abertos</Label>
                  <p className="text-sm text-gray-600">Permitir novos cadastros</p>
                </div>
                <Switch
                  checked={systemSettings.registration_enabled}
                  onCheckedChange={(checked) => handleSystemSettingsChange('registration_enabled', checked)}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="max_users">Máximo de Usuários</Label>
                <Input
                  id="max_users"
                  type="number"
                  value={systemSettings.max_users}
                  onChange={(e) => handleSystemSettingsChange('max_users', parseInt(e.target.value))}
                  min="1"
                  max="10000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="session_timeout">Timeout da Sessão (minutos)</Label>
                <Input
                  id="session_timeout"
                  type="number"
                  value={systemSettings.session_timeout}
                  onChange={(e) => handleSystemSettingsChange('session_timeout', parseInt(e.target.value))}
                  min="5"
                  max="480"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="backup_frequency">Frequência de Backup</Label>
                <select
                  id="backup_frequency"
                  value={systemSettings.backup_frequency}
                  onChange={(e) => handleSystemSettingsChange('backup_frequency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="hourly">A cada hora</option>
                  <option value="daily">Diariamente</option>
                  <option value="weekly">Semanalmente</option>
                  <option value="monthly">Mensalmente</option>
                </select>
              </div>
            </div>

            <Button onClick={handleSaveSystemSettings} disabled={saving} className="w-full">
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Configurações
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Configurações de Segurança */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Configurações de Segurança
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Verificação de Email</Label>
                  <p className="text-sm text-gray-600">Exigir verificação de email</p>
                </div>
                <Switch
                  checked={securitySettings.require_email_verification}
                  onCheckedChange={(checked) => handleSecuritySettingsChange('require_email_verification', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Autenticação de Dois Fatores</Label>
                  <p className="text-sm text-gray-600">Habilitar 2FA</p>
                </div>
                <Switch
                  checked={securitySettings.two_factor_enabled}
                  onCheckedChange={(checked) => handleSecuritySettingsChange('two_factor_enabled', checked)}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password_min_length">Tamanho Mínimo da Senha</Label>
                <Input
                  id="password_min_length"
                  type="number"
                  value={securitySettings.password_min_length}
                  onChange={(e) => handleSecuritySettingsChange('password_min_length', parseInt(e.target.value))}
                  min="6"
                  max="32"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="login_attempts_limit">Limite de Tentativas de Login</Label>
                <Input
                  id="login_attempts_limit"
                  type="number"
                  value={securitySettings.login_attempts_limit}
                  onChange={(e) => handleSecuritySettingsChange('login_attempts_limit', parseInt(e.target.value))}
                  min="3"
                  max="10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lockout_duration">Duração do Bloqueio (minutos)</Label>
                <Input
                  id="lockout_duration"
                  type="number"
                  value={securitySettings.lockout_duration}
                  onChange={(e) => handleSecuritySettingsChange('lockout_duration', parseInt(e.target.value))}
                  min="5"
                  max="60"
                />
              </div>
            </div>

            <Button onClick={handleSaveSecuritySettings} disabled={saving} className="w-full">
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Segurança
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Status do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="h-5 w-5 mr-2" />
            Status do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Banco de Dados</p>
                <p className="text-xs text-gray-600">Conectado</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Autenticação</p>
                <p className="text-xs text-gray-600">Ativo</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Notificações</p>
                <p className="text-xs text-gray-600">Funcionando</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Avisos Importantes */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800">Avisos Importantes</h4>
              <ul className="mt-2 text-sm text-yellow-700 space-y-1">
                <li>• Alterações nas configurações de segurança podem afetar todos os usuários</li>
                <li>• O modo de manutenção impede o acesso de usuários não administradores</li>
                <li>• Sempre teste as configurações antes de aplicá-las em produção</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;
