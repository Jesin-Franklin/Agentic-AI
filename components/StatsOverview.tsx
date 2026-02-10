import React from 'react';
import { UserStats } from '../types';

interface StatsOverviewProps {
    stats: UserStats;
    progress: {
        completed: number;
        total: number;
        percentage: number;
    }
}

// FIX: Changed icon type from JSX.Element to React.ReactNode to resolve namespace issue.
const StatCard: React.FC<{ icon: React.ReactNode, value: string | number, label: string }> = ({ icon, value, label }) => (
    <div className="bg-slate-800 p-4 rounded-lg flex items-center gap-4">
        <div className="text-sky-400">{icon}</div>
        <div>
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="text-sm text-slate-400">{label}</div>
        </div>
    </div>
);

const StatsOverview: React.FC<StatsOverviewProps> = ({ stats, progress }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <StatCard 
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.934l-6.5 11.5a1 1 0 001.64 1.144l6.5-11.5a1 1 0 00-.368-1.734z" clipRule="evenodd" /><path d="M4.854 15.146a1 1 0 010-1.414l4.5-4.5a1 1 0 011.414 0l4.5 4.5a1 1 0 01-1.414 1.414L10 11.414l-3.72 3.73a1 1 0 01-1.426 0z" /></svg>}
                value={`${progress.percentage}%`}
                label="Overall Progress"
            />
            <StatCard 
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>}
                value={progress.completed}
                label="Tasks Completed"
            />
            <StatCard 
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.293 4.293a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L13 6.414V16.5a1 1 0 11-2 0V6.414L7.707 9.707a1 1 0 01-1.414-1.414l4-4z" clipRule="evenodd" /></svg>}
                value={`${stats.streak} ${stats.streak === 1 ? 'Day' : 'Days'}`}
                label="Daily Streak"
            />
        </div>
    )
};

export default StatsOverview;