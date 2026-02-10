import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { LearningPlan, GoalDetails, User, SkillProgress, Task, UserStats } from '../types';
import { generateLearningPlan } from '../services/geminiService';
import * as authService from '../services/authService';
import SkillTracker from './SkillTracker';
import StatsOverview from './StatsOverview';
import PlanManager from './PlanManager';

interface DashboardProps {
    user: User;
    onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [plans, setPlans] = useState<LearningPlan[]>([]);
  const [skills, setSkills] = useState<SkillProgress>({});
  const [stats, setStats] = useState<UserStats>({ streak: 0, lastCompletionDate: null});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const refreshUserData = useCallback(() => {
    setPlans(authService.getPlansForUser());
    setSkills(authService.getSkillsForUser());
    setStats(authService.getUserStats());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refreshUserData();
  }, [refreshUserData]);

  const handleGoalSubmit = useCallback(async (goalDetails: GoalDetails) => {
      const planData = await generateLearningPlan(goalDetails);
      authService.addPlanForUser(planData);
      refreshUserData();
  }, [refreshUserData]);

  const handleUpdatePlan = (updatedPlan: LearningPlan) => {
    authService.updatePlanForUser(updatedPlan);
    refreshUserData();
  };

  const handleDeletePlan = (planId: string) => {
    authService.deletePlanForUser(planId);
    refreshUserData();
  };
  
  const handleTaskToggle = (task: Task, isCompletion: boolean) => {
      authService.updateSkillAndStatsForUser(task, isCompletion);
      refreshUserData();
  }
  
  const overallProgress = useMemo(() => {
    if (plans.length === 0) return { completed: 0, total: 0, percentage: 0 };
    
    const skillKeys = Object.keys(skills);
    const totalCompleted = skillKeys.reduce((acc, key) => acc + skills[key].completed, 0);
    const totalTasks = skillKeys.reduce((acc, key) => acc + skills[key].total, 0);
    
    return {
        completed: totalCompleted,
        total: totalTasks,
        percentage: totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0,
    }
  }, [skills, plans]);

  if (isLoading) {
    return <div className="text-center p-8">Loading dashboard...</div>;
  }

  return (
    <div className="w-full">
         <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-300">Welcome, <span className="text-sky-400">{user.username}</span>!</h2>
            <button
                onClick={onLogout}
                className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
                Logout
            </button>
        </div>

        {plans.length > 0 && <StatsOverview stats={stats} progress={overallProgress} />}
        {Object.keys(skills).length > 0 && <SkillTracker skills={skills} />}

        <PlanManager 
            plans={plans}
            onGoalSubmit={handleGoalSubmit}
            onUpdatePlan={handleUpdatePlan}
            onTaskToggle={handleTaskToggle}
            onDeletePlan={handleDeletePlan}
        />
    </div>
  );
};

export default Dashboard;