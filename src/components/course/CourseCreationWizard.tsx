import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileUpload } from '@/components/ui/file-upload';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ChevronLeft, 
  ChevronRight, 
  Upload, 
  Eye, 
  Save, 
  CheckCircle, 
  AlertCircle,
  Plus,
  Trash2,
  Edit,
  Play,
  FileText,
  Image,
  Video
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { supabase as supa } from '@/integrations/supabase/client';

interface CourseData {
  title: string;
  description: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  price: number;
  thumbnail?: File;
  thumbnailUrl?: string;
  tags: string[];
  modules: Module[];
  requirements: string[];
  learningObjectives: string[];
}

interface Module {
  id: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'text' | 'quiz' | 'assignment';
  content: string;
  duration: number;
  order: number;
  videoFile?: File;
  videoUrl?: string;
  attachments: Attachment[];
}

interface Attachment {
  id: string;
  name: string;
  type: string;
  file?: File;
  url?: string;
}

const STEPS = [
  { id: 'basic', title: 'Informações Básicas', description: 'Título, descrição e categoria' },
  { id: 'content', title: 'Conteúdo', description: 'Módulos e lições' },
  { id: 'media', title: 'Mídia', description: 'Imagens e vídeos' },
  { id: 'preview', title: 'Preview', description: 'Revisar e publicar' }
];

const CATEGORIES = [
  'Tecnologia',
  'Design',
  'Marketing',
  'Negócios',
  'Desenvolvimento Pessoal',
  'Idiomas',
  'Ciências',
  'Arte'
];

export const CourseCreationWizard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showReward } = useNotifications();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [courseData, setCourseData] = useState<CourseData>({
    title: '',
    description: '',
    category: '',
    level: 'beginner',
    duration: 0,
    price: 0,
    tags: [],
    modules: [],
    requirements: [],
    learningObjectives: []
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newTag, setNewTag] = useState('');
  const [newRequirement, setNewRequirement] = useState('');
  const [newObjective, setNewObjective] = useState('');
  // Certificate + Badge
  const [certTemplateName, setCertTemplateName] = useState('Modelo do Curso');
  const [certBackground, setCertBackground] = useState<File | null>(null);
  const [badgeFile, setBadgeFile] = useState<File | null>(null);

  const progress = ((currentStep + 1) / STEPS.length) * 100;
  const [aiLoading, setAiLoading] = useState(false);
  const [aiProgress, setAiProgress] = useState(0);
  const [operationStatus, setOperationStatus] = useState('');
  const [saveTimeoutRef, setSaveTimeoutRef] = useState(null);
  const [aiTimeoutRef, setAiTimeoutRef] = useState(null);
  const [abortControllerRef, setAbortControllerRef] = useState(null);

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 0: // Informações Básicas
        if (!courseData.title.trim()) newErrors.title = 'Título é obrigatório';
        if (!courseData.description.trim()) newErrors.description = 'Descrição é obrigatória';
        if (!courseData.category) newErrors.category = 'Categoria é obrigatória';
        if (courseData.duration <= 0) newErrors.duration = 'Duração deve ser maior que 0';
        break;
      case 1: // Conteúdo
        if (courseData.modules.length === 0) newErrors.modules = 'Pelo menos um módulo é obrigatório';
        courseData.modules.forEach((module, moduleIndex) => {
          if (!module.title.trim()) newErrors[`module_${moduleIndex}_title`] = 'Título do módulo é obrigatório';
          if (module.lessons.length === 0) newErrors[`module_${moduleIndex}_lessons`] = 'Pelo menos uma lição é obrigatória';
        });
        break;
      case 2: // Mídia
        if (!courseData.thumbnail && !courseData.thumbnailUrl) {
          newErrors.thumbnail = 'Thumbnail é obrigatória';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  // Fallback para geração local quando Edge Function não está disponível
  const generateFallbackCourse = (topic: string, level: string, duration: number) => {
    const modules = [0, 1, 2].map((i) => ({
      title: `${topic} - Módulo ${i + 1}`,
      description: `Conceitos do módulo ${i + 1} para ${topic}.`,
      order: i,
      lessons: [
        {
          title: `Introdução ${i + 1}`,
          description: 'Conceitos fundamentais',
          type: 'text',
          content: `<h2>${topic} - Introdução ${i + 1}</h2><p>Conteúdo introdutório gerado localmente.</p>`,
          duration: 10,
          order: 0,
        },
        {
          title: `Exercícios Práticos ${i + 1}`,
          description: 'Exemplos e práticas',
          type: 'video',
          content: '',
          duration: 15,
          order: 1,
          videoUrl: ''
        },
        {
          title: `Quiz do Módulo ${i + 1}`,
          description: 'Avaliação do módulo',
          type: 'quiz',
          content: JSON.stringify({
            questions: [
              { q: 'Pergunta 1?', type: 'multiple_choice', options: ['A', 'B', 'C', 'D'], answer: 'A' },
              { q: 'Pergunta 2?', type: 'true_false', answer: 'true' },
            ]
          }),
          duration: 5,
          order: 2,
        }
      ]
    }));

    return {
      title: topic,
      level,
      duration,
      modules,
      finalExam: {
        title: 'Prova Final',
        description: 'Avaliação final do curso',
        duration: 30,
        questions: [
          { q: 'Pergunta final 1?', type: 'multiple_choice', options: ['A', 'B', 'C', 'D'], answer: 'B' },
          { q: 'Pergunta final 2?', type: 'text', answer: '' },
        ]
      }
    };
  };

  const generateWithAI = async () => {
    try {
      const topic = courseData.title || window.prompt('Tópico do curso para gerar?', 'Curso de Exemplo') || 'Curso de Exemplo';
      const level = courseData.level;
      const duration = courseData.duration || 120;
      setAiLoading(true);
      
      let course = null;
      
      try {
        // Tentar usar a Edge Function primeiro
        const { data, error } = await supa.functions.invoke('ai_generate_course_structure', {
          body: { topic, level, duration },
        });
        
        if (error) {
          console.warn('Edge Function não disponível, usando fallback local:', error.message);
          throw new Error('Edge Function failed');
        }
        
        course = (data as any)?.course;
        
        if (!course) {
          throw new Error('No course data returned');
        }
        
        console.log('Estrutura gerada com Edge Function');
      } catch (edgeError) {
        // Fallback para geração local
        console.warn('Usando fallback local para geração de curso:', edgeError);
        course = generateFallbackCourse(topic, level, duration);
        console.log('Estrutura gerada com fallback local');
      }
      
      if (course) {
        setCourseData(prev => ({
          ...prev,
          title: prev.title || course.title,
          duration: prev.duration || course.duration || 120,
          modules: (course.modules || []).map((m: any, idx: number) => ({
            id: `m_${Date.now()}_${idx}`,
            title: m.title,
            description: m.description || '',
            order: m.order ?? idx,
            lessons: (m.lessons || []).map((l: any, j: number) => ({
              id: `l_${Date.now()}_${idx}_${j}`,
              title: l.title,
              description: l.description || '',
              type: (l.type || 'text'),
              content: l.content || '',
              duration: l.duration || 5,
              order: l.order ?? j,
              videoUrl: l.videoUrl || '',
              attachments: [],
            })),
          })),
        }));
        showReward({
          id: `ai-course-${Date.now()}`,
          type: 'points',
          title: 'Conteúdo gerado com IA',
          description: 'Estrutura inicial de módulos e lições criada.',
          value: 100
        });
        setCurrentStep(1); // Avançar para conteúdo
      }
    } catch (e) {
      console.error('AI generation error:', e);
      // Último recurso: mostrar mensagem de erro mas não quebrar a UI
      alert('Erro ao gerar estrutura do curso. Tente novamente ou crie manualmente.');
    } finally {
      // Limpar recursos apenas se não foi cancelado
      if (!abortControllerRef.current?.signal.aborted) {
        setAiLoading(false);
        setAiProgress(0);
        setOperationStatus('');
      }
      
      // Limpar timeout
      if (aiTimeoutRef.current) {
        clearTimeout(aiTimeoutRef.current);
        aiTimeoutRef.current = null;
      }
      
      abortControllerRef.current = null;
    }
  };

  const addTag = () => {
    if (newTag.trim() && !courseData.tags.includes(newTag.trim())) {
      setCourseData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setCourseData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setCourseData(prev => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()]
      }));
      setNewRequirement('');
    }
  };

  const addObjective = () => {
    if (newObjective.trim()) {
      setCourseData(prev => ({
        ...prev,
        learningObjectives: [...prev.learningObjectives, newObjective.trim()]
      }));
      setNewObjective('');
    }
  };

  const addModule = () => {
    const newModule: Module = {
      id: `module_${Date.now()}`,
      title: '',
      description: '',
      order: courseData.modules.length + 1,
      lessons: []
    };
    setCourseData(prev => ({
      ...prev,
      modules: [...prev.modules, newModule]
    }));
  };

  const updateModule = (moduleId: string, updates: Partial<Module>) => {
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.map(module =>
        module.id === moduleId ? { ...module, ...updates } : module
      )
    }));
  };

  const removeModule = (moduleId: string) => {
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.filter(module => module.id !== moduleId)
    }));
  };

  const addLesson = (moduleId: string) => {
    const newLesson: Lesson = {
      id: `lesson_${Date.now()}`,
      title: '',
      description: '',
      type: 'text',
      content: '',
      duration: 0,
      order: 1,
      attachments: []
    };

    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.map(module =>
        module.id === moduleId
          ? {
              ...module,
              lessons: [...module.lessons, { ...newLesson, order: module.lessons.length + 1 }]
            }
          : module
      )
    }));
  };

  const updateLesson = (moduleId: string, lessonId: string, updates: Partial<Lesson>) => {
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.map(module =>
        module.id === moduleId
          ? {
              ...module,
              lessons: module.lessons.map(lesson =>
                lesson.id === lessonId ? { ...lesson, ...updates } : lesson
              )
            }
          : module
      )
    }));
  };

  const removeLesson = (moduleId: string, lessonId: string) => {
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.map(module =>
        module.id === moduleId
          ? {
              ...module,
              lessons: module.lessons.filter(lesson => lesson.id !== lessonId)
            }
          : module
      )
    }));
  };

  const handleThumbnailUpload = (file: File) => {
    setCourseData(prev => ({ ...prev, thumbnail: file }));
    
    // Criar preview URL
    const previewUrl = URL.createObjectURL(file);
    setCourseData(prev => ({ ...prev, thumbnailUrl: previewUrl }));
  };

  const handleVideoUpload = (moduleId: string, lessonId: string, file: File) => {
    updateLesson(moduleId, lessonId, { 
      videoFile: file,
      videoUrl: URL.createObjectURL(file)
    });
  };

  const saveCourse = async () => {
    if (loading) {
      console.warn('⚠️ Save operation already in progress');
      return;
    }

    try {
      setLoading(true);
      setOperationStatus('Salvando curso...');
      
      // Configurar timeout para salvamento (60 segundos)
      saveTimeoutRef.current = setTimeout(() => {
        console.warn('⏰ Save operation timeout (60s)');
        setLoading(false);
        setOperationStatus('');
        alert('Timeout ao salvar curso. Tente novamente.');
      }, 60000);

      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Validação final
      if (!courseData.title.trim()) {
        throw new Error('Título do curso é obrigatório');
      }

      if (courseData.modules.length === 0) {
        throw new Error('Pelo menos um módulo é obrigatório');
      }

      // Upload da thumbnail se existir
      let thumbnailUrl = courseData.thumbnailUrl;
      if (courseData.thumbnail) {
        setOperationStatus('Fazendo upload da thumbnail...');
        const thumbnailPath = `courses/${Date.now()}_${courseData.thumbnail.name}`;
        const { error: uploadError } = await supabase.storage
          .from('course-assets')
          .upload(thumbnailPath, courseData.thumbnail);

        if (uploadError) {
          console.warn('Erro no upload da thumbnail:', uploadError);
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('course-assets')
            .getPublicUrl(thumbnailPath);
          thumbnailUrl = publicUrl;
        }
      }

      setOperationStatus('Criando curso...');
      
      // Criar o curso
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .insert({
          title: courseData.title,
          description: courseData.description,
          instructor_id: user.id,
          category: courseData.category,
          level: courseData.level,
          duration_hours: Math.ceil(courseData.duration / 60),
          price: courseData.price,
          thumbnail: thumbnailUrl,
          tags: courseData.tags,
          requirements: courseData.requirements,
          learning_objectives: courseData.learningObjectives,
          status: 'draft'
        })
        .select()
        .single();

      if (courseError) {
        throw new Error(`Erro ao criar curso: ${courseError.message}`);
      }

      setOperationStatus('Criando módulos...');

      // Criar módulos e lições
      for (const [moduleIndex, module] of courseData.modules.entries()) {
        const { data: moduleData, error: moduleError } = await supabase
          .from('course_modules')
          .insert({
            course_id: course.id,
            title: module.title,
            description: module.description,
            order_index: module.order
          })
          .select()
          .single();

        if (moduleError) {
          throw new Error(`Erro ao criar módulo: ${moduleError.message}`);
        }

        // Criar lições do módulo
        for (const lesson of module.lessons) {
          let videoUrl = lesson.videoUrl;
          
          // Upload do vídeo se existir
          if (lesson.videoFile) {
            setOperationStatus(`Fazendo upload do vídeo: ${lesson.title}...`);
            const videoPath = `courses/${course.id}/videos/${Date.now()}_${lesson.videoFile.name}`;
            const { error: videoUploadError } = await supabase.storage
              .from('course-assets')
              .upload(videoPath, lesson.videoFile);

            if (videoUploadError) {
              console.warn('Erro no upload do vídeo:', videoUploadError);
            } else {
              const { data: { publicUrl } } = supabase.storage
                .from('course-assets')
                .getPublicUrl(videoPath);
              videoUrl = publicUrl;
            }
          }

          const { error: lessonError } = await supabase
            .from('module_lessons')
            .insert({
              module_id: moduleData.id,
              title: lesson.title,
              description: lesson.description,
              type: lesson.type,
              content: lesson.content,
              duration: lesson.duration,
              order_index: lesson.order,
              video_url: videoUrl,
              points_reward: 0
            });

          if (lessonError) {
            throw new Error(`Erro ao criar lição: ${lessonError.message}`);
          }
        }

        // Auto-generate quiz for this module (com timeout)
        try {
          setOperationStatus(`Gerando quiz para: ${module.title}...`);
          const authHeader = { 'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}` };
          
          await Promise.race([
            fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/courses/modules/${moduleData.id}/quiz/generate`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', ...authHeader },
              body: JSON.stringify({ moduleTitle: module.title, difficulty: courseData.level, n: 5, provider: 'openai' })
            }),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Quiz generation timeout')), 15000)
            )
          ]);
        } catch (quizError) {
          console.warn('Erro ao gerar quiz:', quizError);
          // Não falhar o salvamento por causa do quiz
        }
      }

      // Auto-generate final exam for the course (com timeout)
      try {
        setOperationStatus('Gerando exame final...');
        const authHeader = { 'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}` };
        
        await Promise.race([
          fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/courses/${course.id}/exams/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeader },
            body: JSON.stringify({ courseTitle: courseData.title, level: courseData.level })
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Exam generation timeout')), 15000)
          )
        ]);
      } catch (examError) {
        console.warn('Erro ao gerar exame final:', examError);
        // Não falhar o salvamento por causa do exame
      }

      showReward({
        id: `course-created-${Date.now()}`,
        type: 'points',
        title: 'Curso Criado!',
        description: `Seu curso "${courseData.title}" foi criado com sucesso!`,
        value: 500
      });

      setOperationStatus('Curso salvo com sucesso!');
      
      // Aguardar um pouco antes de navegar
      setTimeout(() => {
        navigate('/admin/courses');
      }, 1500);

    } catch (error: any) {
      console.error('❌ Erro ao salvar curso:', error);
      setOperationStatus('');
      alert(`Erro ao salvar curso: ${error.message}`);
    } finally {
      setLoading(false);
      setOperationStatus('');
      
      // Limpar timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
    }
  };

  const renderBasicInfoStep = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="title">Título do Curso *</Label>
          <Input
            id="title"
            value={courseData.title}
            onChange={(e) => setCourseData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Ex: Introdução ao React"
            className={errors.title ? 'border-red-500' : ''}
          />
          {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Categoria *</Label>
          <Select
            value={courseData.category}
            onValueChange={(value) => setCourseData(prev => ({ ...prev, category: value }))}
          >
            <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição *</Label>
        <Textarea
          id="description"
          value={courseData.description}
          onChange={(e) => setCourseData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Descreva o que os alunos aprenderão neste curso..."
          rows={4}
          className={errors.description ? 'border-red-500' : ''}
        />
        {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="level">Nível</Label>
          <Select
            value={courseData.level}
            onValueChange={(value: 'beginner' | 'intermediate' | 'advanced') => 
              setCourseData(prev => ({ ...prev, level: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Iniciante</SelectItem>
              <SelectItem value="intermediate">Intermediário</SelectItem>
              <SelectItem value="advanced">Avançado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="duration">Duração (horas) *</Label>
          <Input
            id="duration"
            type="number"
            value={courseData.duration}
            onChange={(e) => setCourseData(prev => ({ ...prev, duration: Number(e.target.value) }))}
            min="1"
            className={errors.duration ? 'border-red-500' : ''}
          />
          {errors.duration && <p className="text-sm text-red-500">{errors.duration}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Preço (R$)</Label>
          <Input
            id="price"
            type="number"
            value={courseData.price}
            onChange={(e) => setCourseData(prev => ({ ...prev, price: Number(e.target.value) }))}
            min="0"
            step="0.01"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Tags</Label>
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Adicionar tag..."
              onKeyPress={(e) => e.key === 'Enter' && addTag()}
            />
            <Button type="button" onClick={addTag} variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {courseData.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                {tag} ×
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Pré-requisitos</Label>
          <div className="flex gap-2">
            <Input
              value={newRequirement}
              onChange={(e) => setNewRequirement(e.target.value)}
              placeholder="Adicionar pré-requisito..."
              onKeyPress={(e) => e.key === 'Enter' && addRequirement()}
            />
            <Button type="button" onClick={addRequirement} variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <ul className="space-y-1">
            {courseData.requirements.map((req, index) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                {req}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          <Label>Objetivos de Aprendizagem</Label>
          <div className="flex gap-2">
            <Input
              value={newObjective}
              onChange={(e) => setNewObjective(e.target.value)}
              placeholder="Adicionar objetivo..."
              onKeyPress={(e) => e.key === 'Enter' && addObjective()}
            />
            <Button type="button" onClick={addObjective} variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <ul className="space-y-1">
            {courseData.learningObjectives.map((obj, index) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-blue-500" />
                {obj}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Certificado & Badge */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Nome do Modelo de Certificado</Label>
          <Input value={certTemplateName} onChange={(e)=>setCertTemplateName(e.target.value)} />
          <Label>Background do Certificado</Label>
          <Input type="file" accept="image/*" onChange={(e)=> setCertBackground(e.target.files?.[0] || null)} />
        </div>
        <div className="space-y-2">
          <Label>Badge (imagem) do Certificado</Label>
          <Input type="file" accept="image/*" onChange={(e)=> setBadgeFile(e.target.files?.[0] || null)} />
        </div>
      </div>
    </div>
  );

  const renderContentStep = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Módulos do Curso</h3>
        <Button onClick={addModule} variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Módulo
        </Button>
      </div>

      {errors.modules && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.modules}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {courseData.modules.map((module, moduleIndex) => (
          <Card key={module.id} className="p-4">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Título do Módulo *</Label>
                      <Input
                        value={module.title}
                        onChange={(e) => updateModule(module.id, { title: e.target.value })}
                        placeholder="Ex: Fundamentos do React"
                        className={errors[`module_${moduleIndex}_title`] ? 'border-red-500' : ''}
                      />
                      {errors[`module_${moduleIndex}_title`] && (
                        <p className="text-sm text-red-500">{errors[`module_${moduleIndex}_title`]}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Ordem</Label>
                      <Input
                        type="number"
                        value={module.order}
                        onChange={(e) => updateModule(module.id, { order: Number(e.target.value) })}
                        min="1"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Descrição</Label>
                    <Textarea
                      value={module.description}
                      onChange={(e) => updateModule(module.id, { description: e.target.value })}
                      placeholder="Descreva o que será abordado neste módulo..."
                      rows={2}
                    />
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeModule(module.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Lições</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addLesson(module.id)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Lição
                  </Button>
                </div>

                {errors[`module_${moduleIndex}_lessons`] && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors[`module_${moduleIndex}_lessons`]}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-3">
                  {module.lessons.map((lesson) => (
                    <Card key={lesson.id} className="p-3 bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="space-y-2">
                          <Label>Título da Lição</Label>
                          <Input
                            value={lesson.title}
                            onChange={(e) => updateLesson(module.id, lesson.id, { title: e.target.value })}
                            placeholder="Ex: Componentes React"
                            className="w-full"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Tipo</Label>
                          <Select
                            value={lesson.type}
                            onValueChange={(value: 'video' | 'text' | 'quiz' | 'assignment') =>
                              updateLesson(module.id, lesson.id, { type: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="video">Vídeo</SelectItem>
                              <SelectItem value="text">Texto</SelectItem>
                              <SelectItem value="quiz">Quiz</SelectItem>
                              <SelectItem value="assignment">Atividade</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="flex items-end gap-2">
                          <div className="flex-1 space-y-2">
                            <Label>Duração (min)</Label>
                            <Input
                              type="number"
                              value={lesson.duration}
                              onChange={(e) => updateLesson(module.id, lesson.id, { duration: Number(e.target.value) })}
                              min="1"
                              className="w-full"
                            />
                          </div>
                          <Button
                            variant="ghost"
                            className="w-full text-red-500 hover:text-red-700"
                            onClick={() => removeLesson(module.id, lesson.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="mt-3 space-y-2">
                        <Label>Conteúdo</Label>
                        <Textarea
                          value={lesson.content}
                          onChange={(e) => updateLesson(module.id, lesson.id, { content: e.target.value })}
                          placeholder="Conteúdo da lição..."
                          rows={3}
                        />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderMediaStep = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Thumbnail do Curso</h3>
        
        {errors.thumbnail && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errors.thumbnail}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <FileUpload
              onFileSelect={handleThumbnailUpload}
              accept="image/*"
              maxSize={5 * 1024 * 1024} // 5MB
            >
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">
                  Clique para fazer upload da thumbnail
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG até 5MB
                </p>
              </div>
            </FileUpload>
          </div>
          
          <div className="space-y-4">
            {courseData.thumbnailUrl && (
              <div className="space-y-2">
                <Label>Preview</Label>
                <div className="border rounded-lg overflow-hidden">
                  <img
                    src={courseData.thumbnailUrl}
                    alt="Thumbnail preview"
                    className="w-full h-32 object-cover"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Vídeos das Lições</h3>
        
        <div className="space-y-4">
          {courseData.modules.map((module) => (
            <Card key={module.id} className="p-4">
              <h4 className="font-medium mb-3">{module.title || 'Módulo sem título'}</h4>
              
              <div className="space-y-3">
                {module.lessons
                  .filter(lesson => lesson.type === 'video')
                  .map((lesson) => (
                    <div key={lesson.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{lesson.title || 'Lição sem título'}</p>
                        <p className="text-xs text-gray-500">Duração: {lesson.duration} min</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {lesson.videoUrl ? (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm">Vídeo carregado</span>
                          </div>
                        ) : (
                          <FileUpload
                            onFileSelect={(file) => handleVideoUpload(module.id, lesson.id, file)}
                            accept="video/*"
                            maxSize={100 * 1024 * 1024} // 100MB
                          >
                            <Button variant="outline" size="sm">
                              <Video className="h-4 w-4 mr-2" />
                              Upload Vídeo
                            </Button>
                          </FileUpload>
                        )}
                      </div>
                    </div>
                  ))}
                
                {module.lessons.filter(lesson => lesson.type === 'video').length === 0 && (
                  <p className="text-sm text-gray-500 italic">Nenhuma lição de vídeo neste módulo</p>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPreviewStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-2">Preview do Curso</h3>
        <p className="text-gray-600">Revise todas as informações antes de publicar</p>
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div>
              <h4 className="text-xl font-bold">{courseData.title}</h4>
              <p className="text-gray-600 mt-2">{courseData.description}</p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{courseData.category}</Badge>
              <Badge variant="outline">{courseData.level}</Badge>
              <Badge variant="outline">{courseData.duration}h</Badge>
              {courseData.price > 0 && (
                <Badge variant="outline">R$ {courseData.price.toFixed(2)}</Badge>
              )}
            </div>
            
            <div className="flex flex-wrap gap-1">
              {courseData.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          
          <div>
            {courseData.thumbnailUrl && (
              <img
                src={courseData.thumbnailUrl}
                alt="Course thumbnail"
                className="w-full h-40 object-cover rounded-lg"
              />
            )}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4">
          <h4 className="font-semibold mb-3">Pré-requisitos</h4>
          <ul className="space-y-1">
            {courseData.requirements.map((req, index) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                {req}
              </li>
            ))}
          </ul>
          {courseData.requirements.length === 0 && (
            <p className="text-sm text-gray-500 italic">Nenhum pré-requisito</p>
          )}
        </Card>
        
        <Card className="p-4">
          <h4 className="font-semibold mb-3">Objetivos de Aprendizagem</h4>
          <ul className="space-y-1">
            {courseData.learningObjectives.map((obj, index) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-blue-500" />
                {obj}
              </li>
            ))}
          </ul>
          {courseData.learningObjectives.length === 0 && (
            <p className="text-sm text-gray-500 italic">Nenhum objetivo definido</p>
          )}
        </Card>
      </div>

      <Card className="p-4">
        <h4 className="font-semibold mb-3">Estrutura do Curso</h4>
        <div className="space-y-3">
          {courseData.modules.map((module, moduleIndex) => (
            <div key={module.id} className="border-l-4 border-blue-500 pl-4">
              <h5 className="font-medium">
                Módulo {moduleIndex + 1}: {module.title}
              </h5>
              <p className="text-sm text-gray-600 mb-2">{module.description}</p>
              <div className="space-y-1">
                {module.lessons.map((lesson, lessonIndex) => (
                  <div key={lesson.id} className="flex items-center gap-2 text-sm">
                    {lesson.type === 'video' && <Video className="h-4 w-4" />}
                    {lesson.type === 'text' && <FileText className="h-4 w-4" />}
                    {lesson.type === 'quiz' && <CheckCircle className="h-4 w-4" />}
                    {lesson.type === 'assignment' && <Edit className="h-4 w-4" />}
                    <span>
                      Lição {lessonIndex + 1}: {lesson.title} ({lesson.duration} min)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {errors.general && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.general}</AlertDescription>
        </Alert>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Criar Novo Curso</h1>
        <p className="text-gray-600">
          Use este assistente para criar seu curso passo a passo
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Progresso</span>
          <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Steps Navigation */}
      <div className="mb-8">
        <div className="flex justify-between">
          {STEPS.map((step, index) => (
            <div
              key={step.id}
              className={`flex flex-col items-center text-center ${
                index <= currentStep ? 'text-blue-600' : 'text-gray-400'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mb-2 ${
                  index < currentStep
                    ? 'bg-blue-600 text-white'
                    : index === currentStep
                    ? 'bg-blue-100 text-blue-600 border-2 border-blue-600'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {index < currentStep ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  index + 1
                )}
              </div>
              <div className="hidden md:block">
                <p className="font-medium text-sm">{step.title}</p>
                <p className="text-xs">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{STEPS[currentStep].title}</CardTitle>
              <CardDescription>{STEPS[currentStep].description}</CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={generateWithAI}
              disabled={aiLoading}
              className="relative"
            >
              {aiLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  Gerando... {aiProgress > 0 && `${aiProgress}%`}
                </>
              ) : (
                'Gerar estrutura com IA'
              )}
            </Button>
            {aiLoading && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={cancelAIOperation}
                className="px-2"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {currentStep === 0 && renderBasicInfoStep()}
          {currentStep === 1 && renderContentStep()}
          {currentStep === 2 && renderMediaStep()}
          {currentStep === 3 && renderPreviewStep()}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Anterior
        </Button>

        <div className="flex gap-2">
          {currentStep < STEPS.length - 1 ? (
            <Button onClick={nextStep}>
              Próximo
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={saveCourse} disabled={loading}>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Publicar Curso
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
