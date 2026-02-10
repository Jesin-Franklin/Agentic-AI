import React, { useState } from 'react';
import { Task, Resource } from '../types';
import ResourceModal from './ResourceModal';
import CodeEditorModal from './CodeEditorModal';

interface TaskItemProps {
  task: Task;
  onToggle: (task: Task) => void;
  isOverdue: boolean;
}

const ResourceIcon: React.FC<{ type: Resource['type'] }> = ({ type }) => {
    switch (type) {
      case 'video':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm14.553 1.106A1 1 0 0016 8v4a1 1 0 00.553.894l2 1A1 1 0 0020 13V7a1 1 0 00-1.447-.894l-2 1z" />
          </svg>
        );
      case 'article':
        return (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" />
            </svg>
        );
      case 'notes':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-sky-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        );
      case 'practice':
         return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        );
      case 'coding_challenge':
        return (
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 2a2 2 0 00-2 2v12a2 2 0 002 2h5a2 2 0 002-2V4a2 2 0 00-2-2h-5zM9 4a1 1 0 011-1h5a1 1 0 011 1v12a1 1 0 01-1 1h-5a1 1 0 01-1-1V4z" clipRule="evenodd" />
                <path d="M3 6a1 1 0 011-1h1a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h1a1 1 0 110 2H4a1 1 0 01-1-1zM3 14a1 1 0 011-1h1a1 1 0 110 2H4a1 1 0 01-1-1z" />
            </svg>
        );
      default:
        return null;
    }
};


const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, isOverdue }) => {
  const [activeResource, setActiveResource] = useState<Resource | null>(null);

  const handleResourceClick = (resource: Resource) => {
    if(resource.type === 'video' || resource.type === 'article') {
        window.open(resource.content, '_blank', 'noopener,noreferrer');
    } else {
        setActiveResource(resource);
    }
  }

  const closeModal = () => setActiveResource(null);
  
  const isTaskOverdueAndIncomplete = isOverdue && !task.isCompleted;

  return (
    <div className={`p-4 rounded-lg flex items-start gap-4 transition-all duration-300 ${task.isCompleted ? 'bg-slate-700/50 text-slate-500' : 'bg-slate-700'} ${isTaskOverdueAndIncomplete ? 'ring-2 ring-inset ring-amber-500/50' : ''}`}>
      <div className="relative flex-shrink-0 mt-1 w-5 h-5">
        <input
          type="checkbox"
          checked={task.isCompleted}
          onChange={() => onToggle(task)}
          aria-labelledby={`task-title-${task.id}`}
          className="appearance-none h-5 w-5 rounded-md border-2 border-slate-500 bg-slate-800 checked:bg-emerald-500 checked:border-transparent focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-700 cursor-pointer transition-colors"
        />
        {task.isCompleted && (
          <svg className="h-4 w-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>

      <div className="flex-1">
        <p id={`task-title-${task.id}`} className={`font-semibold ${task.isCompleted ? 'line-through' : 'text-slate-200'}`}>{task.title}</p>
        <p className="text-sm mt-1">{task.description}</p>
        {task.skill && (
            <span className="mt-2 inline-block bg-sky-500/10 text-sky-400 text-xs font-medium px-2 py-1 rounded-full">
                Skill: {task.skill}
            </span>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          {task.resources.map((resource, index) => (
            <button
              key={index}
              onClick={() => handleResourceClick(resource)}
              className="flex items-center bg-slate-600/50 hover:bg-slate-600 text-slate-300 text-xs font-medium px-2 py-1 rounded-md transition-colors"
            >
                <ResourceIcon type={resource.type} />
              {resource.title}
            </button>
          ))}
        </div>
      </div>
      {activeResource?.type === 'coding_challenge' && (
        <CodeEditorModal resource={activeResource} onClose={closeModal} />
      )}
      {(activeResource?.type === 'notes' || activeResource?.type === 'practice') && (
        <ResourceModal resource={activeResource} onClose={closeModal} />
      )}
    </div>
  );
};

export default TaskItem;