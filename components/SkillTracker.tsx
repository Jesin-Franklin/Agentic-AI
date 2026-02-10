
import React, { useState, useMemo } from 'react';
import { SkillProgress } from '../types';

interface SkillTrackerProps {
  skills: SkillProgress;
}

type SortKey = 'mastery_desc' | 'mastery_asc' | 'alpha';

const SkillTracker: React.FC<SkillTrackerProps> = ({ skills }) => {
  const [sortKey, setSortKey] = useState<SortKey>('mastery_desc');

  const processedSkills = useMemo(() => {
    // FIX: Replaced Object.entries with Object.keys to allow TypeScript to correctly infer the type of the skill data object.
    const data = Object.keys(skills).map((name) => {
      const value = skills[name];
      return {
        name,
        completed: value.completed,
        total: value.total,
        mastery: value.total > 0 ? Math.round((value.completed / value.total) * 100) : 0,
      };
    });
    
    switch(sortKey) {
        case 'mastery_desc':
            return data.sort((a, b) => b.mastery - a.mastery || a.name.localeCompare(b.name));
        case 'mastery_asc':
            return data.sort((a, b) => a.mastery - b.mastery || a.name.localeCompare(b.name));
        case 'alpha':
            return data.sort((a, b) => a.name.localeCompare(b.name));
    }
  }, [skills, sortKey]);

  if (processedSkills.length === 0) {
    return null;
  }

  const getProgressBarColor = (mastery: number) => {
    if (mastery >= 95) return 'bg-emerald-500';
    if (mastery >= 60) return 'bg-sky-500';
    return 'bg-indigo-500';
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-2xl shadow-xl mb-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
        <h3 className="text-2xl font-bold text-sky-300">Skill Mastery</h3>
        <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">Sort by:</span>
            <select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)} className="bg-slate-700 border border-slate-600 rounded-md text-sm p-1.5 focus:ring-sky-500 focus:border-sky-500">
                <option value="mastery_desc">Mastery (High-Low)</option>
                <option value="mastery_asc">Mastery (Low-High)</option>
                <option value="alpha">Alphabetical</option>
            </select>
        </div>
      </div>
      <div className="space-y-4">
        {processedSkills.map(skill => (
            <div key={skill.name}>
                <div className="flex justify-between items-baseline mb-1">
                    <span className="font-semibold text-slate-300">{skill.name}</span>
                    <span className="text-sm font-mono text-slate-400">{skill.completed}/{skill.total} tasks</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-4 relative">
                    <div 
                        className={`h-4 rounded-full transition-all duration-500 ${getProgressBarColor(skill.mastery)}`}
                        style={{ width: `${skill.mastery}%`}}
                    ></div>
                     <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white mix-blend-lighten">
                        {skill.mastery}%
                    </span>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default SkillTracker;
