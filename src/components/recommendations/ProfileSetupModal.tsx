import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import {
  User,
  Target,
  Clock,
  DollarSign,
  BookOpen,
  Star,
  Plus,
  X,
  Save,
  Sparkles,
  Brain,
  TrendingUp,
  Award,
  Lightbulb,
  Zap
} from 'lucide-react';
import { UserProfile } from '@/services/recommendationService';
import { useRecommendations } from '@/hooks/useRecommendations';
import { useNotifications } from '@/contexts/NotificationContext';

interface ProfileSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile | null;
}

const SKILL_SUGGESTIONS = [
  'JavaScript', 'Python', 'React', 'Node.js', 'TypeScript', 'HTML/CSS',
  'Design Gráfico', 'UI/UX', 'Figma', 'Photoshop', 'Illustrator',
  'Marketing Digital', 'SEO', 'Google Ads', 'Facebook Ads', 'Email Marketing',
  'Gestão de Projetos', 'Liderança', 'Vendas', 'Empreendedorismo', 'Finanças',
  'Data Science', 'Machine Learning', 'SQL', 'Excel', 'Power BI',
  'Mobile Development', 'Flutter', 'React Native', 'Swift', 'Kotlin'
];

const INTEREST_CATEGORIES = [
  'Programação', 'Design', 'Marketing', 'Negócios', 'Data Science',
  'Mobile', 'DevOps', 'Segurança', 'IA/ML', 'Blockchain'
];

const LEARNING_GOALS = [
  'Mudança de carreira',
  'Promoção no trabalho',
  'Freelancing',
  'Empreendedorismo',
  'Hobby/Interesse pessoal',
  'Certificação profissional',
  'Atualização de habilidades',
  'Preparação para entrevistas'
];

export const ProfileSetupModal: React.FC<ProfileSetupModalProps> = ({
  isOpen,
  onClose,
  userProfile
}) => {
  const { updateUserProfile } = useRecommendations();
  const { showReward } = useNotifications();

  // Estados do formulário
  const [currentSkills, setCurrentSkills] = useState<string[]>([]);
  const [desiredSkills, setDesiredSkills] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [learningGoals, setLearningGoals] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState<string>('');
  const [availableTime, setAvailableTime] = useState<number>(5);
  const [budget, setBudget] = useState<number>(200);
  const [preferredDifficulty, setPreferredDifficulty] = useState<string>('');
  const [learningStyle, setLearningStyle] = useState<string>('');
  const [careerStage, setCareerStage] = useState<string>('');
  const [industryExperience, setIndustryExperience] = useState<number>(0);
  const [certificationGoals, setCertificationGoals] = useState<boolean>(false);
  const [projectBasedLearning, setProjectBasedLearning] = useState<boolean>(false);
  
  // Estados para adicionar habilidades customizadas
  const [newSkill, setNewSkill] = useState('');
  const [newDesiredSkill, setNewDesiredSkill] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  // Carregar dados do perfil existente
  useEffect(() => {
    if (userProfile) {
      setCurrentSkills(userProfile.current_skills || []);
      setDesiredSkills(userProfile.desired_skills || []);
      setInterests(userProfile.interests || []);
      setLearningGoals(userProfile.learning_goals || []);
      setExperienceLevel(userProfile.experience_level || '');
      setAvailableTime(userProfile.available_time_hours || 5);
      setBudget(userProfile.budget_range || 200);
      setPreferredDifficulty(userProfile.preferred_difficulty || '');
      setLearningStyle(userProfile.learning_style || '');
      setCareerStage(userProfile.career_stage || '');
      setIndustryExperience(userProfile.industry_experience_years || 0);
      setCertificationGoals(userProfile.certification_goals || false);
      setProjectBasedLearning(userProfile.project_based_learning || false);
    }
  }, [userProfile]);

  const handleAddSkill = (skill: string, type: 'current' | 'desired') => {
    if (!skill.trim()) return;
    
    if (type === 'current') {
      if (!currentSkills.includes(skill)) {
        setCurrentSkills([...currentSkills, skill]);
      }
      setNewSkill('');
    } else {
      if (!desiredSkills.includes(skill)) {
        setDesiredSkills([...desiredSkills, skill]);
      }
      setNewDesiredSkill('');
    }
  };

  const handleRemoveSkill = (skill: string, type: 'current' | 'desired') => {
    if (type === 'current') {
      setCurrentSkills(currentSkills.filter(s => s !== skill));
    } else {
      setDesiredSkills(desiredSkills.filter(s => s !== skill));
    }
  };

  const handleToggleInterest = (interest: string) => {
    setInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleToggleLearningGoal = (goal: string) => {
    setLearningGoals(prev => 
      prev.includes(goal) 
        ? prev.filter(g => g !== goal)
        : [...prev, goal]
    );
  };

  const handleSave = async () => {
    setLoading(true);
    
    try {
      const profileData: Partial<UserProfile> = {
        current_skills: currentSkills,
        desired_skills: desiredSkills,
        interests,
        learning_goals: learningGoals,
        experience_level: experienceLevel,
        available_time_hours: availableTime,
        budget_range: budget,
        preferred_difficulty: preferredDifficulty,
        learning_style: learningStyle as 'visual' | 'auditory' | 'kinesthetic' | 'reading',
        career_stage: careerStage,
        industry_experience_years: industryExperience,
        certification_goals: certificationGoals,
        project_based_learning: projectBasedLearning
      };

      await updateUserProfile(profileData);
      await updateUserProfile(profileData);
      
      showReward({
        type: 'points',
        title: 'Perfil Completo!',
        points: 50
      });
      
      onClose();
    } catch (error) {
      showReward({
        type: 'points',
        title: 'Erro ao salvar',
        points: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const getStepProgress = () => (step / totalSteps) * 100;

  const canProceed = () => {
    switch (step) {
      case 1:
        return currentSkills.length > 0 && experienceLevel;
      case 2:
        return desiredSkills.length > 0 && interests.length > 0;
      case 3:
        return learningGoals.length > 0 && preferredDifficulty;
      case 4:
        return availableTime > 0 && budget > 0;
      case 5:
        return learningStyle && careerStage;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <User className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Suas Habilidades Atuais</h3>
              <p className="text-gray-600">Conte-nos sobre suas habilidades e experiência atual</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="experience-level">Nível de Experiência Geral</Label>
                <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione seu nível" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Iniciante (0-1 anos)</SelectItem>
                    <SelectItem value="intermediate">Intermediário (2-5 anos)</SelectItem>
                    <SelectItem value="advanced">Avançado (5+ anos)</SelectItem>
                    <SelectItem value="expert">Especialista (10+ anos)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Anos de Experiência na Área</Label>
                <div className="mt-2">
                  <Slider
                    value={[industryExperience]}
                    onValueChange={(value) => setIndustryExperience(value[0])}
                    max={20}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>0 anos</span>
                    <span className="font-medium">{industryExperience} anos</span>
                    <span>20+ anos</span>
                  </div>
                </div>
              </div>

              <div>
                <Label>Habilidades Atuais</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Digite uma habilidade..."
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddSkill(newSkill, 'current')}
                  />
                  <Button 
                    type="button" 
                    onClick={() => handleAddSkill(newSkill, 'current')}
                    disabled={!newSkill.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-3">
                  {SKILL_SUGGESTIONS.slice(0, 12).map((skill) => (
                    <Badge
                      key={skill}
                      variant={currentSkills.includes(skill) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleAddSkill(skill, 'current')}
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>

                {currentSkills.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-2">Suas habilidades:</p>
                    <div className="flex flex-wrap gap-2">
                      {currentSkills.map((skill) => (
                        <Badge key={skill} className="bg-blue-100 text-blue-800">
                          {skill}
                          <X 
                            className="h-3 w-3 ml-1 cursor-pointer" 
                            onClick={() => handleRemoveSkill(skill, 'current')}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Target className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Seus Objetivos</h3>
              <p className="text-gray-600">Que habilidades você quer desenvolver?</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Habilidades que Deseja Aprender</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Digite uma habilidade..."
                    value={newDesiredSkill}
                    onChange={(e) => setNewDesiredSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddSkill(newDesiredSkill, 'desired')}
                  />
                  <Button 
                    type="button" 
                    onClick={() => handleAddSkill(newDesiredSkill, 'desired')}
                    disabled={!newDesiredSkill.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-3">
                  {SKILL_SUGGESTIONS.slice(0, 12).map((skill) => (
                    <Badge
                      key={skill}
                      variant={desiredSkills.includes(skill) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleAddSkill(skill, 'desired')}
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>

                {desiredSkills.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-2">Habilidades desejadas:</p>
                    <div className="flex flex-wrap gap-2">
                      {desiredSkills.map((skill) => (
                        <Badge key={skill} className="bg-green-100 text-green-800">
                          {skill}
                          <X 
                            className="h-3 w-3 ml-1 cursor-pointer" 
                            onClick={() => handleRemoveSkill(skill, 'desired')}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <Label>Áreas de Interesse</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {INTEREST_CATEGORIES.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={category}
                        checked={interests.includes(category)}
                        onCheckedChange={() => handleToggleInterest(category)}
                      />
                      <Label htmlFor={category} className="text-sm">{category}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Lightbulb className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Objetivos de Aprendizado</h3>
              <p className="text-gray-600">O que você espera alcançar?</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Seus Objetivos (selecione todos que se aplicam)</Label>
                <div className="grid grid-cols-1 gap-2 mt-2">
                  {LEARNING_GOALS.map((goal) => (
                    <div key={goal} className="flex items-center space-x-2">
                      <Checkbox
                        id={goal}
                        checked={learningGoals.includes(goal)}
                        onCheckedChange={() => handleToggleLearningGoal(goal)}
                      />
                      <Label htmlFor={goal} className="text-sm">{goal}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="preferred-difficulty">Dificuldade Preferida</Label>
                <Select value={preferredDifficulty} onValueChange={setPreferredDifficulty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a dificuldade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Iniciante - Conceitos básicos</SelectItem>
                    <SelectItem value="intermediate">Intermediário - Aplicação prática</SelectItem>
                    <SelectItem value="advanced">Avançado - Tópicos complexos</SelectItem>
                    <SelectItem value="mixed">Misto - Vários níveis</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="certification"
                    checked={certificationGoals}
                    onCheckedChange={(checked) => setCertificationGoals(checked === true)}
                  />
                  <Label htmlFor="certification">Interesse em certificações</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="project-based"
                    checked={projectBasedLearning}
                    onCheckedChange={(checked) => setProjectBasedLearning(checked === true)}
                  />
                  <Label htmlFor="project-based">Prefiro aprendizado baseado em projetos</Label>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Clock className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Tempo e Orçamento</h3>
              <p className="text-gray-600">Quanto tempo e dinheiro você pode investir?</p>
            </div>

            <div className="space-y-6">
              <div>
                <Label>Tempo Disponível por Semana</Label>
                <div className="mt-2">
                  <Slider
                    value={[availableTime]}
                    onValueChange={(value) => setAvailableTime(value[0])}
                    max={40}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>1h</span>
                    <span className="font-medium">{availableTime}h por semana</span>
                    <span>40h+</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {availableTime <= 5 && "Ritmo tranquilo - cursos mais curtos"}
                  {availableTime > 5 && availableTime <= 15 && "Ritmo moderado - cursos variados"}
                  {availableTime > 15 && "Ritmo intensivo - cursos completos"}
                </p>
              </div>

              <div>
                <Label>Orçamento Mensal (R$)</Label>
                <div className="mt-2">
                  <Slider
                    value={[budget]}
                    onValueChange={(value) => setBudget(value[0])}
                    max={1000}
                    step={50}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>R$ 0</span>
                    <span className="font-medium">R$ {budget}/mês</span>
                    <span>R$ 1000+</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {budget === 0 && "Apenas cursos gratuitos"}
                  {budget > 0 && budget <= 100 && "Cursos básicos e promoções"}
                  {budget > 100 && budget <= 300 && "Boa variedade de cursos"}
                  {budget > 300 && "Acesso a cursos premium"}
                </p>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Brain className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Estilo de Aprendizado</h3>
              <p className="text-gray-600">Como você aprende melhor?</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="learning-style">Estilo de Aprendizado</Label>
                <Select value={learningStyle} onValueChange={setLearningStyle}>
                  <SelectTrigger>
                    <SelectValue placeholder="Como você prefere aprender?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="visual">Visual - Vídeos e diagramas</SelectItem>
                    <SelectItem value="hands-on">Prático - Exercícios e projetos</SelectItem>
                    <SelectItem value="reading">Leitura - Textos e documentação</SelectItem>
                    <SelectItem value="mixed">Misto - Combinação de métodos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="career-stage">Estágio da Carreira</Label>
                <Select value={careerStage} onValueChange={setCareerStage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Onde você está na sua carreira?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Estudante</SelectItem>
                    <SelectItem value="entry-level">Início de carreira</SelectItem>
                    <SelectItem value="mid-level">Meio de carreira</SelectItem>
                    <SelectItem value="senior-level">Nível sênior</SelectItem>
                    <SelectItem value="executive">Executivo/Liderança</SelectItem>
                    <SelectItem value="entrepreneur">Empreendedor</SelectItem>
                    <SelectItem value="freelancer">Freelancer</SelectItem>
                    <SelectItem value="career-change">Mudança de carreira</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Quase pronto!</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Com base nas suas respostas, vamos criar recomendações personalizadas 
                      que se alinham perfeitamente com seus objetivos e estilo de aprendizado.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Configurar Perfil de Aprendizado
          </DialogTitle>
          <DialogDescription>
            Personalize suas recomendações respondendo algumas perguntas sobre seus objetivos e preferências.
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Etapa {step} de {totalSteps}</span>
            <span>{Math.round(getStepProgress())}% completo</span>
          </div>
          <Progress value={getStepProgress()} className="w-full" />
        </div>

        <Separator />

        {/* Step Content */}
        <div className="py-4">
          {renderStep()}
        </div>

        <Separator />

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
          >
            Anterior
          </Button>

          <div className="flex gap-2">
            {step < totalSteps ? (
              <Button
                onClick={() => setStep(Math.min(totalSteps, step + 1))}
                disabled={!canProceed()}
              >
                Próximo
              </Button>
            ) : (
              <Button
                onClick={handleSave}
                disabled={!canProceed() || loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Perfil
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
