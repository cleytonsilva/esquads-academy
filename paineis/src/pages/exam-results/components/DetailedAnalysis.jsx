import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const DetailedAnalysis = ({ 
  questions = [
    {
      id: 1,
      question: "Qual é o principal objetivo de um firewall de aplicação web (WAF)?",
      userAnswer: "Filtrar tráfego HTTP/HTTPS malicioso",
      correctAnswer: "Filtrar tráfego HTTP/HTTPS malicioso",
      isCorrect: true,
      topic: "Network Security",
      difficulty: "Médio",
      explanation: `Um WAF (Web Application Firewall) é projetado especificamente para filtrar, monitorar e bloquear tráfego HTTP/HTTPS malicioso de e para uma aplicação web.\n\nEle atua como uma barreira entre a aplicação web e a internet, analisando todas as requisições HTTP antes que cheguem ao servidor.`,
      timeSpent: 45
    },
    {
      id: 2,
      question: "Em criptografia, o que significa 'salt' em hash de senhas?",
      userAnswer: "Um valor aleatório adicionado à senha",
      correctAnswer: "Um valor aleatório adicionado à senha antes do hash",
      isCorrect: false,
      topic: "Cryptography",
      difficulty: "Difícil",
      explanation: `Salt é um valor aleatório que é adicionado à senha antes de aplicar a função hash.\n\nIsso previne ataques de rainbow table e torna cada hash único, mesmo para senhas idênticas.\n\nO salt deve ser único para cada senha e armazenado junto com o hash.`,
      timeSpent: 67
    }
  ],
  averageTime = 56
}) => {
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [filterTopic, setFilterTopic] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const topics = [...new Set(questions.map(q => q.topic))];
  
  const filteredQuestions = questions?.filter(q => {
    const topicMatch = filterTopic === 'all' || q?.topic === filterTopic;
    const statusMatch = filterStatus === 'all' || 
      (filterStatus === 'correct' && q?.isCorrect) ||
      (filterStatus === 'incorrect' && !q?.isCorrect);
    return topicMatch && statusMatch;
  });

  const correctCount = questions?.filter(q => q?.isCorrect)?.length;
  const incorrectCount = questions?.length - correctCount;

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Icon name="FileSearch" size={20} color="var(--color-primary)" />
          <div>
            <h3 className="text-lg font-heading font-semibold text-foreground">
              Análise Detalhada
            </h3>
            <p className="text-sm text-muted-foreground">
              Revisão questão por questão com explicações
            </p>
          </div>
        </div>
      </div>
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-muted/30 rounded-lg">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-1">
            <Icon name="CheckCircle" size={16} color="var(--color-success)" />
            <span className="text-sm font-medium text-foreground">Corretas</span>
          </div>
          <p className="text-xl font-bold text-success">{correctCount}</p>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-1">
            <Icon name="XCircle" size={16} color="var(--color-error)" />
            <span className="text-sm font-medium text-foreground">Incorretas</span>
          </div>
          <p className="text-xl font-bold text-error">{incorrectCount}</p>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-1">
            <Icon name="Clock" size={16} color="var(--color-accent)" />
            <span className="text-sm font-medium text-foreground">Tempo Médio</span>
          </div>
          <p className="text-xl font-bold text-foreground">{averageTime}s</p>
        </div>
      </div>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-foreground">Tópico:</span>
          <select
            value={filterTopic}
            onChange={(e) => setFilterTopic(e?.target?.value)}
            className="px-3 py-1 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Todos</option>
            {topics?.map(topic => (
              <option key={topic} value={topic}>{topic}</option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-foreground">Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e?.target?.value)}
            className="px-3 py-1 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Todas</option>
            <option value="correct">Corretas</option>
            <option value="incorrect">Incorretas</option>
          </select>
        </div>
      </div>
      {/* Questions List */}
      <div className="space-y-3">
        {filteredQuestions?.map((question, index) => (
          <div key={question?.id} className="border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setSelectedQuestion(selectedQuestion === question?.id ? null : question?.id)}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-left"
            >
              <div className="flex items-center space-x-4 flex-1">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center
                  ${question?.isCorrect 
                    ? 'bg-success/10 text-success border border-success/20' :'bg-error/10 text-error border border-error/20'
                  }
                `}>
                  <Icon 
                    name={question?.isCorrect ? "Check" : "X"} 
                    size={16} 
                  />
                </div>
                
                <div className="flex-1">
                  <p className="font-medium text-foreground line-clamp-2">
                    Questão {index + 1}: {question?.question}
                  </p>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                      {question?.topic}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {question?.difficulty}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {question?.timeSpent}s
                    </span>
                  </div>
                </div>
              </div>
              
              <Icon 
                name={selectedQuestion === question?.id ? "ChevronUp" : "ChevronDown"} 
                size={16} 
                className="text-muted-foreground" 
              />
            </button>

            {/* Expanded Content */}
            {selectedQuestion === question?.id && (
              <div className="px-4 pb-4 border-t border-border bg-muted/20">
                <div className="pt-4 space-y-4">
                  {/* User Answer vs Correct Answer */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-sm font-medium text-foreground mb-2">Sua Resposta:</h5>
                      <p className={`text-sm p-3 rounded-lg ${
                        question?.isCorrect 
                          ? 'bg-success/10 text-success border border-success/20' :'bg-error/10 text-error border border-error/20'
                      }`}>
                        {question?.userAnswer}
                      </p>
                    </div>
                    
                    <div>
                      <h5 className="text-sm font-medium text-foreground mb-2">Resposta Correta:</h5>
                      <p className="text-sm p-3 bg-success/10 text-success border border-success/20 rounded-lg">
                        {question?.correctAnswer}
                      </p>
                    </div>
                  </div>

                  {/* Explanation */}
                  <div>
                    <h5 className="text-sm font-medium text-foreground mb-2 flex items-center space-x-2">
                      <Icon name="BookOpen" size={16} />
                      <span>Explicação:</span>
                    </h5>
                    <div className="text-sm text-muted-foreground p-3 bg-card border border-border rounded-lg whitespace-pre-line">
                      {question?.explanation}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      {filteredQuestions?.length === 0 && (
        <div className="text-center py-8">
          <Icon name="Search" size={48} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Nenhuma questão encontrada com os filtros selecionados.
          </p>
        </div>
      )}
    </div>
  );
};

export default DetailedAnalysis;