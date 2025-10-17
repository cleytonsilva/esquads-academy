import React from 'react';

interface InstructorAnalyticsDashboardProps {
  courseId: string;
  courseName?: string;
}

export const InstructorAnalyticsDashboard: React.FC<InstructorAnalyticsDashboardProps> = ({
  courseId,
  courseName
}) => {
  // TODO: Implementar hook useCourseAnalytics
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Analytics do Curso</h1>
      <div className="text-center py-12">
        <p className="text-gray-500">Dashboard de analytics do curso em desenvolvimento</p>
        <p className="text-sm text-gray-400 mt-2">Course ID: {courseId}</p>
        {courseName && <p className="text-sm text-gray-400">Course: {courseName}</p>}
      </div>
    </div>
  );
};