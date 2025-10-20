import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../components/ui/Header';
import ExamHeader from './components/ExamHeader';
import ExamSidebar from './components/ExamSidebar';
import QuestionDisplay from './components/QuestionDisplay';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

const ExamInterface = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get exam configuration from navigation state
  const examConfig = location?.state || {
    certification: 'CISSP',
    difficulty: 'medium',
    questionCount: 50,
    duration: 90
  };

  // Mock exam data
  const mockExamData = {
    id: 'exam_001',
    title: `Certificação ${examConfig?.certification}`,
    code: `${examConfig?.certification}-001`,
    duration: examConfig?.duration,
    totalQuestions: examConfig?.questionCount,
    questions: Array.from({ length: examConfig?.questionCount }, (_, index) => ({
      id: index + 1,
      number: index + 1,
      total: examConfig?.questionCount,
      type: index % 4 === 0 ? 'scenario' : index % 4 === 1 ? 'code' : 'multiple',
      category: ['Segurança de Rede', 'Criptografia', 'Gestão de Riscos', 'Compliance']?.[index % 4],
      difficulty: ['easy', 'medium', 'hard']?.[index % 3],
      points: [1, 2, 3]?.[index % 3],
      text: index % 4 === 0 
        ? `Baseado no cenário apresentado, qual é a melhor abordagem para mitigar os riscos identificados?`
        : index % 4 === 1
        ? `Analise o código de segurança abaixo e identifique a vulnerabilidade:`
        : `Qual das seguintes opções melhor descreve o conceito de ${['autenticação multifator', 'criptografia simétrica', 'análise de vulnerabilidades', 'gestão de incidentes']?.[index % 4]}?`,
      scenario: index % 4 === 0 ? `Uma empresa de médio porte descobriu que seus sistemas foram comprometidos por um ataque de ransomware. Os atacantes conseguiram acesso através de credenciais fracas de um funcionário remoto.\n\nA empresa possui:\n- 200 funcionários, 50% trabalhando remotamente\n- Infraestrutura híbrida (on-premise e cloud)\n- Dados sensíveis de clientes\n- Backup semanal dos dados críticos\n- Política de segurança básica implementada há 2 anos` : null,
      code: index % 4 === 1 ? `function validateUser(username, password) {\n    if (username === "admin" && password === "123456") {\n        return true;\n    }\n    return false;\n}\n\nfunction loginUser(req, res) {\n    const { username, password } = req.body;\n    if (validateUser(username, password)) {\n        res.cookie('auth', 'true');\n        res.redirect('/dashboard');\n    } else {\n        res.status(401).send('Invalid credentials');\n    }\n}` : null,
      options: [
        {
          id: `q${index + 1}_a`,
          text: index % 4 === 0 
            ? 'Implementar imediatamente um programa de conscientização em segurança e autenticação multifator'
            : index % 4 === 1
            ? 'Credenciais hardcoded e ausência de hash na senha' :'Um processo que requer múltiplos fatores de verificação para autenticar um usuário',
          isCorrect: true
        },
        {
          id: `q${index + 1}_b`,
          text: index % 4 === 0
            ? 'Contratar uma empresa de segurança externa para investigar o incidente'
            : index % 4 === 1
            ? 'Falta de validação de entrada nos parâmetros' :'Um método de criptografia que usa a mesma chave para cifrar e decifrar',
          isCorrect: false
        },
        {
          id: `q${index + 1}_c`,
          text: index % 4 === 0
            ? 'Restaurar os backups e continuar as operações normalmente'
            : index % 4 === 1
            ? 'Uso de cookies inseguros para autenticação' :'Um processo automatizado para identificar falhas de segurança',
          isCorrect: false
        },
        {
          id: `q${index + 1}_d`,
          text: index % 4 === 0
            ? 'Desconectar todos os sistemas da internet temporariamente'
            : index % 4 === 1
            ? 'Ausência de rate limiting nas tentativas de login' :'Um conjunto de procedimentos para responder a incidentes de segurança',
          isCorrect: false
        }
      ]?.sort(() => Math.random() - 0.5), // Randomize options
      explanation: `Esta questão avalia o conhecimento sobre ${['resposta a incidentes e implementação de controles preventivos', 'identificação de vulnerabilidades em código', 'conceitos fundamentais de segurança']?.[index % 3]}. A resposta correta demonstra compreensão das melhores práticas de segurança cibernética.`
    }))
  };

  // State management
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [answers, setAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);

  // Get current question data
  const getCurrentQuestion = () => {
    return mockExamData?.questions?.find(q => q?.number === currentQuestion);
  };

  const getAnsweredQuestions = () => {
    return Object.keys(answers)?.map(Number);
  };

  // Navigation handlers
  const handleNavigateToQuestion = (questionNumber) => {
    setCurrentQuestion(questionNumber);
  };

  const handlePrevious = () => {
    if (currentQuestion > 1) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < mockExamData?.totalQuestions) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  // Answer handling
  const handleAnswerSelect = (optionId) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: optionId
    }));
  };

  // Flag handling
  const handleToggleFlag = () => {
    setFlaggedQuestions(prev => {
      if (prev?.includes(currentQuestion)) {
        return prev?.filter(q => q !== currentQuestion);
      } else {
        return [...prev, currentQuestion];
      }
    });
  };

  // Exam control handlers
  const handlePauseExam = () => {
    setIsPaused(!isPaused);
  };

  const handleExitExam = () => {
    setShowExitConfirm(true);
  };

  const handleFinishExam = () => {
    setShowFinishConfirm(true);
  };

  const handleTimeUp = () => {
    // Auto-submit exam when time runs out
    submitExam();
  };

  const submitExam = () => {
    const examResults = {
      examId: mockExamData?.id,
      examTitle: mockExamData?.title,
      totalQuestions: mockExamData?.totalQuestions,
      answeredQuestions: getAnsweredQuestions()?.length,
      answers: answers,
      flaggedQuestions: flaggedQuestions,
      completedAt: new Date()?.toISOString()
    };

    navigate('/exam-results', { 
      state: { 
        examResults,
        examData: mockExamData 
      } 
    });
  };

  const confirmExit = () => {
    navigate('/certification-selector');
  };

  const confirmFinish = () => {
    submitExam();
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (isPaused) return;

      switch (e?.key) {
        case 'ArrowLeft':
          e?.preventDefault();
          handlePrevious();
          break;
        case 'ArrowRight':
          e?.preventDefault();
          handleNext();
          break;
        case 'f': case'F':
          if (e?.ctrlKey || e?.metaKey) {
            e?.preventDefault();
            handleToggleFlag();
          }
          break;
        case '1': case'2': case'3': case'4':
          if (!e?.ctrlKey && !e?.metaKey) {
            const optionIndex = parseInt(e?.key) - 1;
            const currentQ = getCurrentQuestion();
            if (currentQ && currentQ?.options?.[optionIndex]) {
              handleAnswerSelect(currentQ?.options?.[optionIndex]?.id);
            }
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentQuestion, isPaused]);

  // Prevent page refresh/close without confirmation
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e?.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const currentQuestionData = getCurrentQuestion();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-nav">
        <ExamHeader
          examTitle={mockExamData?.title}
          examCode={mockExamData?.code}
          totalQuestions={mockExamData?.totalQuestions}
          currentQuestion={currentQuestion}
          onPauseExam={handlePauseExam}
          onExitExam={handleExitExam}
          isPaused={isPaused}
        />

        <div className="flex h-[calc(100vh-120px)]">
          {/* Sidebar */}
          <ExamSidebar
            examData={mockExamData}
            currentQuestion={currentQuestion}
            totalQuestions={mockExamData?.totalQuestions}
            answeredQuestions={getAnsweredQuestions()}
            flaggedQuestions={flaggedQuestions}
            isPaused={isPaused}
            timeRemaining={mockExamData?.duration * 60} // Add missing timeRemaining prop in seconds
            onNavigateToQuestion={handleNavigateToQuestion}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onToggleFlag={handleToggleFlag}
            onFinishExam={handleFinishExam}
            onTimeUp={handleTimeUp}
          />

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {isPaused ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon name="Pause" size={32} className="text-warning" />
                    </div>
                    <h2 className="text-xl font-semibold text-foreground mb-2">
                      Exame Pausado
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      Clique em "Retomar" para continuar o exame
                    </p>
                    <Button
                      variant="primary"
                      onClick={handlePauseExam}
                      iconName="Play"
                      iconPosition="left"
                    >
                      Retomar Exame
                    </Button>
                  </div>
                </div>
              ) : (
                <QuestionDisplay
                  question={currentQuestionData}
                  selectedAnswer={answers?.[currentQuestion]}
                  onAnswerSelect={handleAnswerSelect}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-100">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-warning/10 rounded-full flex items-center justify-center">
                <Icon name="AlertTriangle" size={20} className="text-warning" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                Sair do Exame?
              </h3>
            </div>
            <p className="text-muted-foreground mb-6">
              Tem certeza que deseja sair do exame? Todo o progresso será perdido e você precisará começar novamente.
            </p>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowExitConfirm(false)}
                fullWidth
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={confirmExit}
                fullWidth
              >
                Sair do Exame
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Finish Confirmation Modal */}
      {showFinishConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-100">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
                <Icon name="CheckCircle" size={20} className="text-success" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                Finalizar Exame?
              </h3>
            </div>
            <div className="space-y-3 mb-6">
              <p className="text-muted-foreground">
                Você está prestes a finalizar o exame. Verifique seu progresso:
              </p>
              <div className="bg-muted p-3 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Questões respondidas:</span>
                  <span className="font-medium">{getAnsweredQuestions()?.length}/{mockExamData?.totalQuestions}</span>
                </div>
                <div className="flex justify-between">
                  <span>Questões marcadas:</span>
                  <span className="font-medium">{flaggedQuestions?.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Progresso:</span>
                  <span className="font-medium">{Math.round((getAnsweredQuestions()?.length / mockExamData?.totalQuestions) * 100)}%</span>
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowFinishConfirm(false)}
                fullWidth
              >
                Continuar Exame
              </Button>
              <Button
                variant="success"
                onClick={confirmFinish}
                fullWidth
              >
                Finalizar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamInterface;