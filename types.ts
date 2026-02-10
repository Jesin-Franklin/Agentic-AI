
export interface GoalDetails {
  goal: string;
  deadline: string;
  dailyAvailability: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | '';
}

export interface TestCase {
  input: string; // JSON string of arguments, e.g., "[1, 2, 3]"
  expected: string; // JSON string of the expected output, e.g., "6"
}

export interface Resource {
  type: 'video' | 'notes' | 'practice' | 'coding_challenge' | 'article';
  title: string;
  content: string; // For challenges, this is the problem description
  testCases?: TestCase[];
  solution?: string;
}

export interface Reflection {
  notes: string;
  feedback: string;
}

export interface Task {
  id: string;
  title:string;
  description: string;
  isCompleted: boolean;
  resources: Resource[];
  skill?: string;
  reflection?: Reflection;
}

export interface DailyPlan {
  day: number;
  date: string;
  isoDate: string; // Added for precise date checking for notifications
  theme: string;
  tasks: Task[];
}

export interface LearningPlan {
  id: string;
  createdAt: string;
  status: 'active' | 'completed';
  goal: string;
  durationDays: number;
  schedule: DailyPlan[];
}

export interface User {
  username: string;
}

export interface UserStats {
  streak: number;
  lastCompletionDate: string | null;
}

export interface SkillProgress {
    [skillName: string]: {
        completed: number;
        total: number;
    };
}