import { User, LearningPlan, SkillProgress, Task, UserStats } from '../types';

const DB_KEY = 'ai_task_agent_users';
const SESSION_KEY = 'ai_task_agent_session';

const getDb = (): Record<string, any> => {
    const db = localStorage.getItem(DB_KEY);
    return db ? JSON.parse(db) : {};
};

const saveDb = (db: Record<string, any>) => {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
};

export const signUp = (username: string, password: string):User | null => {
    if (!username || !password) throw new Error("Username and password are required.");
    const db = getDb();
    if (db[username]) {
        throw new Error("User already exists.");
    }
    db[username] = { password, plans: [], skills: {}, stats: { streak: 0, lastCompletionDate: null } };
    saveDb(db);
    const user = { username };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
};

export const login = (username: string, password: string): User | null => {
    const db = getDb();
    const userData = db[username];
    if (!userData || userData.password !== password) {
        throw new Error("Invalid username or password.");
    }
    const user = { username };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
};

export const logout = () => {
    sessionStorage.removeItem(SESSION_KEY);
};

export const getCurrentUser = (): User | null => {
    const userJson = sessionStorage.getItem(SESSION_KEY);
    return userJson ? JSON.parse(userJson) : null;
};

export const addPlanForUser = (newPlan: Omit<LearningPlan, 'id' | 'createdAt' | 'status'>) => {
    const user = getCurrentUser();
    if (!user) return;
    const db = getDb();
    const userData = db[user.username];
    if (userData) {
        const fullPlan: LearningPlan = {
            ...newPlan,
            id: `plan_${Date.now()}`,
            createdAt: new Date().toISOString(),
            status: 'active'
        };
        
        if (!userData.plans) userData.plans = [];
        userData.plans.push(fullPlan);

        // Update skill totals from the new plan
        if (!userData.skills) userData.skills = {};
        fullPlan.schedule.forEach(day => {
            day.tasks.forEach(task => {
                if (task.skill) {
                    if (!userData.skills[task.skill]) {
                        userData.skills[task.skill] = { completed: 0, total: 0 };
                    }
                    userData.skills[task.skill].total += 1;
                }
            });
        });
        
        saveDb(db);
    }
};

export const updatePlanForUser = (updatedPlan: LearningPlan) => {
    const user = getCurrentUser();
    if (!user) return;
    const db = getDb();
    const userData = db[user.username];
    if (userData && userData.plans) {
        const planIndex = userData.plans.findIndex((p: LearningPlan) => p.id === updatedPlan.id);
        if (planIndex > -1) {
            userData.plans[planIndex] = updatedPlan;
            saveDb(db);
        }
    }
};

export const deletePlanForUser = (planId: string) => {
    const user = getCurrentUser();
    if (!user) return;
    const db = getDb();
    const userData = db[user.username];
    if (userData && userData.plans) {
        const planIndex = userData.plans.findIndex((p: LearningPlan) => p.id === planId);
        if (planIndex > -1) {
            const planToDelete = userData.plans[planIndex];
            
            // Adjust skill totals before deleting the plan
            if (userData.skills) {
                planToDelete.schedule.forEach((day: any) => {
                    day.tasks.forEach((task: Task) => {
                        if (task.skill && userData.skills[task.skill]) {
                            const skill = userData.skills[task.skill];
                            skill.total = Math.max(0, skill.total - 1);
                            if (task.isCompleted) {
                                skill.completed = Math.max(0, skill.completed - 1);
                            }
                            // Clean up skill if it has no tasks left
                            if (skill.total === 0) {
                                delete userData.skills[task.skill];
                            }
                        }
                    });
                });
            }

            userData.plans.splice(planIndex, 1);
            saveDb(db);
        }
    }
};

export const getPlansForUser = (): LearningPlan[] => {
    const user = getCurrentUser();
    if (!user) return [];
    const db = getDb();
    return db[user.username]?.plans || [];
};

export const getSkillsForUser = (): SkillProgress => {
    const user = getCurrentUser();
    if (!user) return {};
    const db = getDb();
    return db[user.username]?.skills || {};
};

export const getUserStats = (): UserStats => {
    const user = getCurrentUser();
    if (!user) return { streak: 0, lastCompletionDate: null };
    const db = getDb();
    return db[user.username]?.stats || { streak: 0, lastCompletionDate: null };
};

export const updateSkillAndStatsForUser = (task: Task, isCompletion: boolean) => {
    const user = getCurrentUser();
    if (!user) return;

    const db = getDb();
    if (!db[user.username]) return;

    // Update Skills
    if (task.skill) {
        const skillData = db[user.username].skills[task.skill];
        if (skillData) {
             skillData.completed += isCompletion ? 1 : -1;
             // Clamp the value to prevent it from going below 0 or above the total.
             // This fixes race conditions from rapidly clicking the checkbox.
             skillData.completed = Math.max(0, Math.min(skillData.completed, skillData.total));
        }
    }

    // Update Streak only on task completion
    if (isCompletion) {
        const stats: UserStats = db[user.username].stats || { streak: 0, lastCompletionDate: null };
        const today = new Date().toISOString().split('T')[0];

        if (stats.lastCompletionDate !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            if (stats.lastCompletionDate === yesterdayStr) {
                stats.streak += 1;
            } else {
                stats.streak = 1;
            }
            stats.lastCompletionDate = today;
            db[user.username].stats = stats;
        }
    }
    
    saveDb(db);
};