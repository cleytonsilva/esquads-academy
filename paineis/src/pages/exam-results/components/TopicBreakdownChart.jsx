import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Icon from '../../../components/AppIcon';

const TopicBreakdownChart = ({ 
  topicData = [
    { topic: "Network Security", score: 85, total: 10, correct: 8, benchmark: 75 },
    { topic: "Cryptography", score: 70, total: 8, correct: 6, benchmark: 70 },
    { topic: "Risk Management", score: 90, total: 12, correct: 11, benchmark: 80 },
    { topic: "Identity & Access", score: 65, total: 10, correct: 7, benchmark: 75 },
    { topic: "Incident Response", score: 95, total: 10, correct: 9, benchmark: 85 }
  ]
}) => {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      const data = payload?.[0]?.payload;
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground mb-2">{label}</p>
          <div className="space-y-1 text-sm">
            <p className="text-foreground">
              Pontuação: <span className="font-semibold">{data?.score}%</span>
            </p>
            <p className="text-muted-foreground">
              Acertos: {data?.correct}/{data?.total}
            </p>
            <p className="text-muted-foreground">
              Benchmark: {data?.benchmark}%
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Icon name="BarChart3" size={20} color="var(--color-primary)" />
          <div>
            <h3 className="text-lg font-heading font-semibold text-foreground">
              Desempenho por Tópico
            </h3>
            <p className="text-sm text-muted-foreground">
              Análise detalhada das áreas de conhecimento
            </p>
          </div>
        </div>
      </div>
      {/* Chart */}
      <div className="h-64 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={topicData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis 
              dataKey="topic" 
              tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }}
              domain={[0, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="score" 
              fill="var(--color-primary)"
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="benchmark" 
              fill="var(--color-muted)"
              radius={[4, 4, 0, 0]}
              opacity={0.5}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Topic Details */}
      <div className="space-y-3">
        {topicData?.map((topic, index) => {
          const isAboveBenchmark = topic?.score >= topic?.benchmark;
          const statusColor = isAboveBenchmark ? 'var(--color-success)' : 'var(--color-warning)';
          
          return (
            <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: statusColor }}
                />
                <div>
                  <p className="font-medium text-foreground">{topic?.topic}</p>
                  <p className="text-xs text-muted-foreground">
                    {topic?.correct}/{topic?.total} questões corretas
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-foreground">{topic?.score}%</p>
                <p className="text-xs text-muted-foreground">
                  {isAboveBenchmark ? 'Acima' : 'Abaixo'} do benchmark
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TopicBreakdownChart;