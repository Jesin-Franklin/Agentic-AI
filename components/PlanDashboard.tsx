import React, { useState, useMemo, useEffect } from 'react';
import { LearningPlan, Task, DailyPlan, Reflection } from '../types';
import DayCard from './DayCard';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import ConfirmationDialog from './ConfirmationDialog';
import ReflectionModal from './ReflectionModal';

interface PlanDashboardProps {
  plan: LearningPlan;
  onBack: () => void;
  onUpdatePlan: (plan: LearningPlan) => void;
  onTaskToggle: (task: Task, isCompletion: boolean) => void;
  onDeletePlan: (planId: string) => void;
}

const PlanDashboard: React.FC<PlanDashboardProps> = ({ plan, onBack, onUpdatePlan, onTaskToggle, onDeletePlan }) => {
  const [tasks, setTasks] = useState<Map<string, Task>>(() => new Map());
  const [taskToConfirm, setTaskToConfirm] = useState<Task | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [reflectingTask, setReflectingTask] = useState<Task | null>(null);

  useEffect(() => {
    const taskMap = new Map<string, Task>();
    plan.schedule.forEach(day => {
      day.tasks.forEach(task => {
        taskMap.set(task.id, task);
      });
    });
    setTasks(taskMap);
  }, [plan]);

  const handleRequestToggle = (task: Task) => {
    setTaskToConfirm(task);
  };

  const handleCancelToggle = () => {
    setTaskToConfirm(null);
  };

  const handleConfirmToggle = () => {
    if (!taskToConfirm) return;

    const isCompletion = !taskToConfirm.isCompleted;
    setTaskToConfirm(null); // Close confirmation dialog

    if (isCompletion) {
      setReflectingTask(taskToConfirm); // Open reflection modal
    } else {
      // If un-checking, process immediately without reflection
      onTaskToggle(taskToConfirm, false);
      const updatedPlan = {
          ...plan,
          schedule: plan.schedule.map(day => ({
              ...day,
              tasks: day.tasks.map(t => 
                  t.id === taskToConfirm.id 
                  ? { ...t, isCompleted: false, reflection: undefined } // Also clear reflection
                  : t
              )
          }))
      };
      onUpdatePlan(updatedPlan);
    }
  };

  const handleCompleteWithReflection = (task: Task, reflection: Reflection) => {
    onTaskToggle(task, true);
    
    const updatedPlan = {
        ...plan,
        schedule: plan.schedule.map(day => ({
            ...day,
            tasks: day.tasks.map(t => 
                t.id === task.id 
                ? { ...t, isCompleted: true, reflection }
                : t
            )
        }))
    };
    
    onUpdatePlan(updatedPlan);
    setReflectingTask(null);
  }

  const handleConfirmDelete = () => {
    onDeletePlan(plan.id);
    setIsDeleteConfirmOpen(false);
    onBack();
  };

  const { completedTasks, totalTasks, progress } = useMemo(() => {
    const allTasks = Array.from(tasks.values());
    const completed = allTasks.filter((task: Task) => task.isCompleted).length;
    const total = allTasks.length;
    return {
      completedTasks: completed,
      totalTasks: total,
      progress: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [tasks]);

  const chartData = [
    { name: 'Completed', value: completedTasks },
    { name: 'Remaining', value: totalTasks - completedTasks },
  ];

  const COLORS = ['#34d399', '#374151'];

  return (
    <div className="w-full">
      <header className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-2xl shadow-xl mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
             <button onClick={onBack} className="flex items-center text-sm text-sky-400 hover:text-sky-300 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Back to All Plans
            </button>
            <h2 className="text-3xl font-bold text-sky-300">Learning Plan Details</h2>
            <p className="text-slate-400 mt-1 max-w-2xl">
              <strong>Goal:</strong> {plan.goal}
            </p>
          </div>
          <button 
            onClick={() => setIsDeleteConfirmOpen(true)}
            className="bg-red-600/20 hover:bg-red-500/30 text-red-400 font-semibold py-2 px-4 rounded-lg border border-red-500/30 transition-colors text-sm flex items-center gap-2"
          >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
            </svg>
            Cancel Plan
          </button>
        </div>
        <div className="mt-6 flex flex-col md:flex-row items-center gap-8">
            <div className="w-full md:w-2/3">
                 <p className="text-lg text-slate-300 mb-2">Plan Progress: {completedTasks} / {totalTasks} tasks completed</p>
                <div className="w-full bg-slate-700 rounded-full h-4">
                <div
                    className="bg-gradient-to-r from-sky-500 to-emerald-500 h-4 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                ></div>
                </div>
                 <p className="text-right font-semibold text-lg mt-1 text-emerald-400">{progress}%</p>
            </div>
            <div className="w-full md:w-1/3 h-40">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} innerRadius={40}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1e2d3b',
                                border: '1px solid #334155'
                            }}
                        />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
      </header>

      <div className="space-y-6">
        {plan.schedule.map((dayPlan: DailyPlan) => (
          <DayCard key={dayPlan.day} dayPlan={dayPlan} onTaskToggle={handleRequestToggle} />
        ))}
      </div>

      <ConfirmationDialog 
        isOpen={!!taskToConfirm}
        onConfirm={handleConfirmToggle}
        onCancel={handleCancelToggle}
        title="Confirm Status Change"
        message="Are you sure you want to change the completion status of this task?"
      />
      <ConfirmationDialog 
        isOpen={isDeleteConfirmOpen}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteConfirmOpen(false)}
        title="Confirm Plan Cancellation"
        message="Are you sure you want to cancel this plan? This action cannot be undone."
      />
       <ReflectionModal 
        isOpen={!!reflectingTask}
        task={reflectingTask}
        onClose={() => setReflectingTask(null)}
        onComplete={handleCompleteWithReflection}
      />
    </div>
  );
};

export default PlanDashboard;