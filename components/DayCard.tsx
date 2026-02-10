import React, { useState } from 'react';
import { DailyPlan, Task } from '../types';
import TaskItem from './TaskItem';

interface DayCardProps {
  dayPlan: DailyPlan;
  onTaskToggle: (task: Task) => void;
}

const DayCard: React.FC<DayCardProps> = ({ dayPlan, onTaskToggle }) => {
  const [isExpanded, setIsExpanded] = useState(dayPlan.day === 1);

  const completedTasks = dayPlan.tasks.filter(t => t.isCompleted).length;
  const totalTasks = dayPlan.tasks.length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize today to the start of the day
  const dayDate = new Date(dayPlan.isoDate);
  dayDate.setHours(0, 0, 0, 0); // Normalize the plan's date

  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-xl shadow-lg transition-all duration-300">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 text-left flex justify-between items-center"
      >
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 bg-slate-700 text-sky-300 font-bold rounded-full h-12 w-12 flex items-center justify-center">
            {dayPlan.day}
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-200">{dayPlan.date}: <span className="text-sky-400">{dayPlan.theme}</span></h3>
            <p className="text-sm text-slate-400">{completedTasks} of {totalTasks} tasks completed</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
            <div className="w-24 bg-slate-600 rounded-full h-2.5 hidden sm:block">
              <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-6 w-6 text-slate-400 transform transition-transform duration-300 ${
                isExpanded ? 'rotate-180' : 'rotate-0'
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-slate-700 px-4 sm:px-6 py-4">
          <div className="space-y-4">
            {dayPlan.tasks.map(task => (
              <TaskItem key={task.id} task={task} onToggle={onTaskToggle} isOverdue={dayDate < today} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DayCard;
