import React, { useState, useMemo } from 'react';
import { LearningPlan, GoalDetails, Task } from '../types';
import GoalForm from './GoalForm';
import PlanDashboard from './PlanDashboard';
import LoadingSpinner from './LoadingSpinner';

interface PlanManagerProps {
    plans: LearningPlan[];
    onGoalSubmit: (details: GoalDetails) => Promise<void>;
    onUpdatePlan: (plan: LearningPlan) => void;
    onTaskToggle: (task: Task, isCompletion: boolean) => void;
    onDeletePlan: (planId: string) => void;
}

type ViewState = 'LIST' | 'FORM' | 'DETAILS';

const PlanCard: React.FC<{ plan: LearningPlan, onSelect: () => void }> = ({ plan, onSelect }) => {
    const { completed, total, percentage } = useMemo(() => {
        let completed = 0;
        let total = 0;
        plan.schedule.forEach(day => {
            day.tasks.forEach(task => {
                total++;
                if (task.isCompleted) completed++;
            });
        });
        return { completed, total, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
    }, [plan]);

    return (
        <div className="bg-slate-800 p-5 rounded-lg border border-slate-700 hover:border-sky-500 transition-all duration-300 flex flex-col justify-between">
            <div>
                <p className="text-sm text-slate-400">Created: {new Date(plan.createdAt).toLocaleDateString()}</p>
                <h3 className="text-lg font-bold text-slate-200 mt-2 truncate">{plan.goal}</h3>
            </div>
            <div className="mt-4">
                <div className="flex justify-between text-sm text-slate-300 mb-1">
                    <span>Progress</span>
                    <span>{percentage}%</span>
                </div>
                <div className="w-full bg-slate-600 rounded-full h-2.5">
                    <div className="bg-sky-500 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                </div>
                <button onClick={onSelect} className="mt-4 w-full text-center bg-slate-700 hover:bg-slate-600 font-semibold py-2 px-4 rounded-md transition-colors">
                    View Details
                </button>
            </div>
        </div>
    );
};

const PlanManager: React.FC<PlanManagerProps> = ({ plans, onGoalSubmit, onUpdatePlan, onTaskToggle, onDeletePlan }) => {
    const [view, setView] = useState<ViewState>('LIST');
    const [selectedPlan, setSelectedPlan] = useState<LearningPlan | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSelectPlan = (plan: LearningPlan) => {
        setSelectedPlan(plan);
        setView('DETAILS');
    };

    const handleBackToList = () => {
        setSelectedPlan(null);
        setView('LIST');
    };

    const handleStartNewPlan = () => {
        setView('FORM');
    };

    const handleSubmitGoal = async (details: GoalDetails) => {
        setIsSubmitting(true);
        setError(null);
        try {
            await onGoalSubmit(details);
            setView('LIST');
        } catch (err) {
            setError('Failed to generate learning plan. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (view === 'FORM') {
        if (isSubmitting) return <LoadingSpinner />;
        return (
             <div>
                <button onClick={handleBackToList} className="flex items-center text-sm text-sky-400 hover:text-sky-300 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    Back to All Plans
                </button>
                {error && <p className="text-red-400 mb-4">{error}</p>}
                <GoalForm onSubmit={handleSubmitGoal} />
             </div>
        );
    }
    
    if (view === 'DETAILS' && selectedPlan) {
        return <PlanDashboard 
                    plan={selectedPlan} 
                    onBack={handleBackToList} 
                    onUpdatePlan={onUpdatePlan}
                    onTaskToggle={onTaskToggle}
                    onDeletePlan={onDeletePlan}
                />;
    }

    return (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-2xl shadow-xl mt-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-sky-300">My Learning Plans</h2>
                <button onClick={handleStartNewPlan} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-5 rounded-lg transition-colors duration-300">
                    + New Plan
                </button>
            </div>
            {plans.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plans.map(plan => (
                        <PlanCard key={plan.id} plan={plan} onSelect={() => handleSelectPlan(plan)} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <h3 className="text-xl text-slate-300">No learning plans yet.</h3>
                    <p className="text-slate-400 mt-2">Ready to start a new journey? Create your first plan!</p>
                </div>
            )}
        </div>
    );
};

export default PlanManager;