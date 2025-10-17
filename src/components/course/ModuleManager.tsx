// Esquads Academy - Gerenciador de Módulos

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LessonEditor } from './LessonEditor';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Plus,
  Edit,
  Trash2,
  GripVertical,
  Video,
  FileText,
  CheckCircle,
  Upload,
  MoreVertical,
  Clock,
  Users,
  Eye,
  Lock,
  Unlock
} from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  description: string;
  content_type: 'video' | 'text' | 'quiz' | 'assignment';
  content_url?: string;
  content_text?: string;
  duration: number;
  order_index: number;
  is_free: boolean;
  quiz_questions?: any[];
}

interface Module {
  id: string;
  title: string;
  description: string;
  order_index: number;
  lessons: Lesson[];
}

interface ModuleManagerProps {
  modules: Module[];
  onUpdateModules: (modules: Module[]) => void;
  loading?: boolean;
}

export const ModuleManager: React.FC<ModuleManagerProps> = ({
  modules,
  onUpdateModules,
  loading = false
}) => {
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [editingLesson, setEditingLesson] = useState<{ moduleId: string; lesson?: Lesson } | null>(null);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [newModuleDescription, setNewModuleDescription] = useState('');
  const [showNewModuleForm, setShowNewModuleForm] = useState(false);

  const addModule = () => {
    if (!newModuleTitle.trim()) return;

    const newModule: Module = {
      id: `module_${Date.now()}`,
      title: newModuleTitle,
      description: newModuleDescription,
      order_index: modules.length,
      lessons: []
    };

    onUpdateModules([...modules, newModule]);
    setNewModuleTitle('');
    setNewModuleDescription('');
    setShowNewModuleForm(false);
  };

  const updateModule = (moduleId: string, updates: Partial<Module>) => {
    const updatedModules = modules.map(module =>
      module.id === moduleId ? { ...module, ...updates } : module
    );
    onUpdateModules(updatedModules);
  };

  const deleteModule = (moduleId: string) => {
    const updatedModules = modules.filter(module => module.id !== moduleId);
    onUpdateModules(updatedModules);
  };

  const addLesson = (moduleId: string, lesson: Lesson) => {
    const updatedModules = modules.map(module => {
      if (module.id === moduleId) {
        const newLesson = {
          ...lesson,
          id: `lesson_${Date.now()}`,
          order_index: module.lessons.length
        };
        return {
          ...module,
          lessons: [...module.lessons, newLesson]
        };
      }
      return module;
    });
    onUpdateModules(updatedModules);
    setEditingLesson(null);
  };

  const updateLesson = (moduleId: string, lessonId: string, updates: Partial<Lesson>) => {
    const updatedModules = modules.map(module => {
      if (module.id === moduleId) {
        return {
          ...module,
          lessons: module.lessons.map(lesson =>
            lesson.id === lessonId ? { ...lesson, ...updates } : lesson
          )
        };
      }
      return module;
    });
    onUpdateModules(updatedModules);
    setEditingLesson(null);
  };

  const deleteLesson = (moduleId: string, lessonId: string) => {
    const updatedModules = modules.map(module => {
      if (module.id === moduleId) {
        return {
          ...module,
          lessons: module.lessons.filter(lesson => lesson.id !== lessonId)
        };
      }
      return module;
    });
    onUpdateModules(updatedModules);
  };

  const moveModule = (fromIndex: number, toIndex: number) => {
    const newModules = [...modules];
    const [movedModule] = newModules.splice(fromIndex, 1);
    newModules.splice(toIndex, 0, movedModule);
    
    // Atualizar order_index
    const updatedModules = newModules.map((module, index) => ({
      ...module,
      order_index: index
    }));
    
    onUpdateModules(updatedModules);
  };

  const moveLesson = (moduleId: string, fromIndex: number, toIndex: number) => {
    const updatedModules = modules.map(module => {
      if (module.id === moduleId) {
        const newLessons = [...module.lessons];
        const [movedLesson] = newLessons.splice(fromIndex, 1);
        newLessons.splice(toIndex, 0, movedLesson);
        
        // Atualizar order_index
        const updatedLessons = newLessons.map((lesson, index) => ({
          ...lesson,
          order_index: index
        }));
        
        return {
          ...module,
          lessons: updatedLessons
        };
      }
      return module;
    });
    onUpdateModules(updatedModules);
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'text':
        return <FileText className="h-4 w-4" />;
      case 'quiz':
        return <CheckCircle className="h-4 w-4" />;
      case 'assignment':
        return <Upload className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getContentTypeColor = (type: string) => {
    switch (type) {
      case 'video':
        return 'bg-blue-100 text-blue-800';
      case 'text':
        return 'bg-green-100 text-green-800';
      case 'quiz':
        return 'bg-purple-100 text-purple-800';
      case 'assignment':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTotalDuration = (lessons: Lesson[]) => {
    return lessons.reduce((total, lesson) => total + lesson.duration, 0);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-lg font-semibold">Módulos do Curso</h3>
        <Button
          onClick={() => setShowNewModuleForm(true)}
          disabled={loading}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Módulo
        </Button>
      </div>

      {showNewModuleForm && (
        <Card>
          <CardHeader>
            <CardTitle>Novo Módulo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="module_title">Título do Módulo</Label>
              <Input
                id="module_title"
                placeholder="Ex: Fundamentos do React"
                value={newModuleTitle}
                onChange={(e) => setNewModuleTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="module_description">Descrição</Label>
              <Textarea
                id="module_description"
                placeholder="Descreva o que será abordado neste módulo..."
                value={newModuleDescription}
                onChange={(e) => setNewModuleDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={addModule} disabled={!newModuleTitle.trim()} className="w-full sm:w-auto">
                Criar Módulo
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowNewModuleForm(false);
                  setNewModuleTitle('');
                  setNewModuleDescription('');
                }}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {modules.map((module, moduleIndex) => (
          <Card key={module.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <GripVertical className="h-5 w-5 text-gray-400 cursor-move flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-lg truncate">{module.title}</CardTitle>
                    {module.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{module.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                    <Clock className="h-3 w-3" />
                    {formatDuration(getTotalDuration(module.lessons))}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1 text-xs">
                    <Users className="h-3 w-3" />
                    {module.lessons.length} lições
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingModule(module)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar Módulo
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => deleteModule(module.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir Módulo
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {module.lessons.map((lesson, lessonIndex) => (
                  <div
                    key={lesson.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <GripVertical className="h-4 w-4 text-gray-400 cursor-move flex-shrink-0" />
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {getContentTypeIcon(lesson.content_type)}
                        <span className="font-medium truncate">{lesson.title}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <Badge
                          variant="secondary"
                          className={`text-xs ${getContentTypeColor(lesson.content_type)}`}
                        >
                          {lesson.content_type}
                        </Badge>
                        {lesson.is_free && (
                          <Badge variant="outline" className="text-xs">
                            <Unlock className="h-3 w-3 mr-1" />
                            Gratuita
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-2">
                      <span className="text-sm text-gray-600 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {lesson.duration}min
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => setEditingLesson({ moduleId: module.id, lesson })}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Editar Lição
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            Visualizar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => deleteLesson(module.id, lesson.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir Lição
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
                
                {module.lessons.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma lição adicionada ainda</p>
                  </div>
                )}
                
                <Button
                  variant="outline"
                  className="w-full mt-2"
                  onClick={() => setEditingLesson({ moduleId: module.id })}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Lição
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {modules.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum módulo criado ainda
            </h3>
            <p className="text-gray-600 mb-4">
              Comece criando o primeiro módulo do seu curso
            </p>
            <Button onClick={() => setShowNewModuleForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Módulo
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Dialog para editar módulo */}
      <Dialog open={!!editingModule} onOpenChange={() => setEditingModule(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Módulo</DialogTitle>
          </DialogHeader>
          {editingModule && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit_module_title">Título do Módulo</Label>
                <Input
                  id="edit_module_title"
                  value={editingModule.title}
                  onChange={(e) => setEditingModule({
                    ...editingModule,
                    title: e.target.value
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_module_description">Descrição</Label>
                <Textarea
                  id="edit_module_description"
                  value={editingModule.description}
                  onChange={(e) => setEditingModule({
                    ...editingModule,
                    description: e.target.value
                  })}
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    updateModule(editingModule.id, {
                      title: editingModule.title,
                      description: editingModule.description
                    });
                    setEditingModule(null);
                  }}
                >
                  Salvar Alterações
                </Button>
                <Button variant="outline" onClick={() => setEditingModule(null)}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog para editar/criar lição */}
      <Dialog open={!!editingLesson} onOpenChange={() => setEditingLesson(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingLesson?.lesson ? 'Editar Lição' : 'Nova Lição'}
            </DialogTitle>
          </DialogHeader>
          {editingLesson && (
            <LessonEditor
              lesson={editingLesson.lesson}
              onSave={(lesson) => {
                if (editingLesson.lesson) {
                  updateLesson(editingLesson.moduleId, editingLesson.lesson.id, lesson);
                } else {
                  addLesson(editingLesson.moduleId, lesson as Lesson);
                }
              }}
              onCancel={() => setEditingLesson(null)}
              loading={loading}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
