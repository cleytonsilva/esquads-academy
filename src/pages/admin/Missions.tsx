import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Shield, Terminal, Fingerprint, GaugeCircle, Zap, Layers } from 'lucide-react'
import { MISSION_DELIVERY_MODES, MISSION_ENVIRONMENTS } from '@/utils/constants'

const environmentBlueprints = [
  {
    value: MISSION_ENVIRONMENTS.FIREWALL,
    label: 'Firewall Ops',
    description: 'Interface gráfica 8-bit para criar e testar regras de firewall.',
    Icon: Shield,
    suggestedCategory: 'firewall',
    suggestedDifficulty: 'medium' as const,
    preview: 'from-orange-500 via-amber-500 to-yellow-500'
  },
  {
    value: MISSION_ENVIRONMENTS.INCIDENT_RESPONSE,
    label: 'Terminal SOC',
    description: 'Console interativo com incidentes simulados e validação automática.',
    Icon: Terminal,
    suggestedCategory: 'incident-response',
    suggestedDifficulty: 'hard' as const,
    preview: 'from-indigo-600 via-blue-600 to-slate-900'
  },
  {
    value: MISSION_ENVIRONMENTS.FORENSICS,
    label: 'Forense Digital',
    description: 'Laboratório gamificado para análise de evidências e geração de relatórios.',
    Icon: Fingerprint,
    suggestedCategory: 'forense',
    suggestedDifficulty: 'medium' as const,
    preview: 'from-emerald-500 via-teal-500 to-slate-900'
  }
]

const deliveryOptions = [
  { value: MISSION_DELIVERY_MODES.CONFIG_PANEL, label: 'Painel de Configuração' },
  { value: MISSION_DELIVERY_MODES.TERMINAL, label: 'Shell Interativa' },
  { value: MISSION_DELIVERY_MODES.HYBRID, label: 'Experiência Híbrida' }
]

const difficultyOptions = [
  { value: 'easy', label: 'Fácil' },
  { value: 'medium', label: 'Médio' },
  { value: 'hard', label: 'Difícil' }
]

const categoryOptions = [
  { value: 'incident-response', label: 'Resposta a Incidentes' },
  { value: 'firewall', label: 'Firewall & Zero Trust' },
  { value: 'forense', label: 'Forense Digital' },
  { value: 'soc', label: 'Operações SOC' },
  { value: 'cloud', label: 'Cloud Security' }
]

export default function AdminMissions() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [objective, setObjective] = useState('')
  const [category, setCategory] = useState<string>('incident-response')
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [environment, setEnvironment] = useState<typeof MISSION_ENVIRONMENTS[keyof typeof MISSION_ENVIRONMENTS]>(MISSION_ENVIRONMENTS.INCIDENT_RESPONSE)
  const [deliveryMode, setDeliveryMode] = useState<typeof MISSION_DELIVERY_MODES[keyof typeof MISSION_DELIVERY_MODES]>(MISSION_DELIVERY_MODES.TERMINAL)
  const [xpReward, setXpReward] = useState<number>(120)
  const [estimatedTime, setEstimatedTime] = useState<number>(45)
  const [badgeReward, setBadgeReward] = useState('Incident Wrangler')
  const [livesRequired, setLivesRequired] = useState<number>(1)
  const [unlockRequirement, setUnlockRequirement] = useState('Completar 3 missões SOC')
  const [flagHint, setFlagHint] = useState('Capture o arquivo flag.txt após restaurar o serviço crítico')
  const [generateAI, setGenerateAI] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'form' | 'ai'>('form')

  const handlePreset = (value: typeof MISSION_ENVIRONMENTS[keyof typeof MISSION_ENVIRONMENTS]) => {
    const preset = environmentBlueprints.find((item) => item.value === value)
    if (!preset) return
    setEnvironment(value)
    setCategory(preset.suggestedCategory)
    setDifficulty(preset.suggestedDifficulty)
    setDeliveryMode(value === MISSION_ENVIRONMENTS.FIREWALL ? MISSION_DELIVERY_MODES.CONFIG_PANEL : value === MISSION_ENVIRONMENTS.FORENSICS ? MISSION_DELIVERY_MODES.HYBRID : MISSION_DELIVERY_MODES.TERMINAL)
    setTitle(`${preset.label} - Missão Avançada`)
    setObjective('Concluir o cenário seguindo a narrativa e capturar a flag final')
    setDescription(preset.description)
  }

  const createMission = async () => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(null)
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/missions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          objective,
          category,
          difficulty,
          environment,
          delivery_mode: deliveryMode,
          xp_reward: xpReward,
          estimated_time: estimatedTime,
          badge_reward: badgeReward || null,
          lives_required: livesRequired,
          unlock_requirement: unlockRequirement || null,
          flag_hint: flagHint || null,
          is_required: true,
          generate_with_ai: generateAI,
          metadata: {
            environment,
            delivery_mode: deliveryMode,
            blueprint: true,
            suggested_unlock: unlockRequirement,
            narrative: description
          }
        })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data?.error || 'Erro ao criar missão')
      setSuccess('Missão criada com sucesso!')
      setTitle('')
      setDescription('')
      setObjective('')
      setBadgeReward('')
      setUnlockRequirement('')
      setFlagHint('')
    } catch (err: any) {
      setError(err?.message || 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Orquestração de Missões</h1>
          <p className="text-sm text-slate-600">Projete experiências imersivas para firewall, terminal SOC e laboratórios forenses.</p>
        </div>
        {success && <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">{success}</Badge>}
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-sm text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-[2fr,1fr] gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Configuração da missão</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="form">Blueprint Manual</TabsTrigger>
                <TabsTrigger value="ai">Assistente IA</TabsTrigger>
              </TabsList>
              <TabsContent value="form" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Título</Label>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Firewall Sentinel - Ataques SSH" />
                  </div>
                  <div className="space-y-2">
                    <Label>Categoria</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryOptions.map((item) => (
                          <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Contexto narrativo do cenário" />
                </div>

                <div className="space-y-2">
                  <Label>Objetivo / Flag</Label>
                  <Textarea value={objective} onChange={(e) => setObjective(e.target.value)} rows={2} placeholder="Ex: Restaurar o serviço e capturar o arquivo flag.txt" />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Dificuldade</Label>
                    <Select value={difficulty} onValueChange={(value) => setDifficulty(value as typeof difficulty)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Dificuldade" />
                      </SelectTrigger>
                      <SelectContent>
                        {difficultyOptions.map((item) => (
                          <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Tempo estimado (min)</Label>
                    <Input type="number" min={5} value={estimatedTime} onChange={(e) => setEstimatedTime(Number(e.target.value))} />
                  </div>
                  <div className="space-y-2">
                    <Label>XP base</Label>
                    <Input type="number" min={10} value={xpReward} onChange={(e) => setXpReward(Number(e.target.value))} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Ambiente gamificado</Label>
                  <div className="grid md:grid-cols-3 gap-3">
                    {environmentBlueprints.map((preset) => {
                      const isActive = environment === preset.value
                      const Icon = preset.Icon
                      return (
                        <button
                          key={preset.value}
                          type="button"
                          onClick={() => handlePreset(preset.value)}
                          className={`rounded-xl border p-3 text-left transition ${isActive ? 'border-indigo-500 ring-2 ring-indigo-300 bg-white shadow-lg' : 'border-slate-200 bg-slate-100 hover:bg-white'}`}
                        >
                          <div className={`h-20 rounded-lg bg-gradient-to-br ${preset.preview} mb-3 flex items-center justify-center`}>
                            <Icon className="w-8 h-8 text-white" />
                          </div>
                          <div className="font-semibold text-slate-900">{preset.label}</div>
                          <p className="text-xs text-slate-600 mt-2">{preset.description}</p>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Modo de entrega</Label>
                    <Select value={deliveryMode} onValueChange={(value) => setDeliveryMode(value as typeof deliveryMode)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o modo" />
                      </SelectTrigger>
                      <SelectContent>
                        {deliveryOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Badge</Label>
                    <Input value={badgeReward} onChange={(e) => setBadgeReward(e.target.value)} placeholder="Ex: Firewall Sentinel" />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Vidas consumidas (Plano Free)</Label>
                    <Input type="number" min={0} value={livesRequired} onChange={(e) => setLivesRequired(Number(e.target.value))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Requisito de desbloqueio</Label>
                    <Input value={unlockRequirement} onChange={(e) => setUnlockRequirement(e.target.value)} placeholder="Ex: Score > 70% no simulado cloud" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Dica de flag / pista</Label>
                  <Textarea value={flagHint} onChange={(e) => setFlagHint(e.target.value)} rows={2} placeholder="Ex: busque no diretório /opt/flag" />
                </div>
              </TabsContent>

              <TabsContent value="ai" className="space-y-4">
                <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
                  <div className="flex items-center gap-2 text-indigo-900 font-semibold">
                    <Sparkles className="w-4 h-4" /> Assistente de geração com IA
                  </div>
                  <p className="text-sm text-indigo-800 mt-2">
                    O assistente gera narrativa, passos e validações automáticas com base no ambiente escolhido. Ajuste os campos acima após gerar para personalizar a missão.
                  </p>
                  <Button
                    type="button"
                    variant="secondary"
                    className="mt-4"
                    onClick={() => setGenerateAI((prev) => !prev)}
                  >
                    {generateAI ? 'IA ativada para esta missão' : 'Ativar geração por IA'}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end">
              <Button onClick={() => void createMission()} disabled={loading}>
                {loading ? 'Publicando...' : 'Criar missão'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preview Gamificado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <div className={`h-32 bg-gradient-to-br ${environmentBlueprints.find((preset) => preset.value === environment)?.preview || 'from-slate-900 to-slate-700'} flex items-center justify-center`}
              >
                <div className="text-white text-center space-y-1">
                  <Layers className="w-8 h-8 mx-auto" />
                  <div className="text-sm uppercase tracking-wide">{environmentBlueprints.find((preset) => preset.value === environment)?.label || 'Ambiente Dinâmico'}</div>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge variant="outline">{categoryOptions.find((item) => item.value === category)?.label || category}</Badge>
                  <Badge variant="outline">{difficultyOptions.find((item) => item.value === difficulty)?.label || difficulty}</Badge>
                  <Badge variant="outline">{deliveryOptions.find((item) => item.value === deliveryMode)?.label || deliveryMode}</Badge>
                  {badgeReward && <Badge variant="outline">Badge: {badgeReward}</Badge>}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{title || 'Título da missão'}</h3>
                  <p className="text-sm text-slate-600 mt-1">{description || 'A narrativa aparecerá aqui com contexto e objetivos.'}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
                  <div className="flex items-center gap-2"><GaugeCircle className="w-4 h-4 text-indigo-500" />{estimatedTime} min</div>
                  <div className="flex items-center gap-2"><Zap className="w-4 h-4 text-emerald-500" />{xpReward} XP</div>
                  <div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-amber-500" />{generateAI ? 'IA habilitada' : 'IA manual'}</div>
                  <div className="flex items-center gap-2"><Layers className="w-4 h-4 text-slate-500" />{formatUnlock(unlockRequirement)}</div>
                </div>
                <div className="rounded-lg bg-slate-100 border border-slate-200 p-3 text-xs text-slate-600">
                  <strong>Dica de flag:</strong> {flagHint || 'Defina uma pista para orientar o aluno durante o cenário.'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function formatUnlock(value?: string) {
  if (!value) return 'Disponível para todos'
  return value
}
