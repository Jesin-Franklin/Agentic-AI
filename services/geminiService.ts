
import { GoogleGenAI, Type } from "@google/genai";
import { GoalDetails, LearningPlan, DailyPlan, Task } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const generateLearningPlanSchema = {
  type: Type.OBJECT,
  properties: {
    goal: { type: Type.STRING },
    durationDays: { type: Type.INTEGER },
    schedule: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          day: { type: Type.INTEGER },
          date: { type: Type.STRING },
          theme: { type: Type.STRING },
          tasks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                isCompleted: { type: Type.BOOLEAN },
                skill: { type: Type.STRING, description: "A specific, fine-grained skill tag for this task, e.g., 'JavaScript Arrays', 'React Hooks', 'CSS Flexbox'." },
                resources: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      type: { type: Type.STRING, enum: ['video', 'notes', 'practice', 'coding_challenge', 'article'] },
                      title: { type: Type.STRING },
                      content: { type: Type.STRING, description: "URL for video/article, Markdown for notes/practice, or problem description for a coding challenge." },
                      testCases: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            input: { type: Type.STRING, description: "A JSON string representing the function arguments, e.g., '[1, 2]'" },
                            expected: { type: Type.STRING, description: "A JSON string of the expected output, e.g., '3'" }
                          },
                          required: ['input', 'expected']
                        }
                      },
                      solution: { type: Type.STRING, description: "The correct code solution for the challenge." }
                    },
                    required: ['type', 'title', 'content'],
                  },
                },
              },
              required: ['id', 'title', 'description', 'isCompleted', 'resources', 'skill'],
            },
          },
        },
        required: ['day', 'date', 'theme', 'tasks'],
      },
    },
  },
  required: ['goal', 'durationDays', 'schedule'],
};

export const generateLearningPlan = async (details: GoalDetails): Promise<LearningPlan> => {
  const { goal, deadline, dailyAvailability, level } = details;

  const prompt = `
    Based on the user's goal, create a detailed, day-by-day learning plan tailored to their skill level.

    **User Goal:** ${goal}
    **Deadline:** ${deadline}
    **Daily Availability:** ${dailyAvailability}
    **Current Skill Level:** ${level}

    **Instructions:**
    1.  Analyze the goal and create a logical, day-by-day learning plan.
    2.  For each task, provide a clear title, description, and set 'isCompleted' to false.
    3.  **Crucially, for each task, add a specific 'skill' tag.** This should be a fine-grained skill category (e.g., 'JavaScript Arrays', 'React Hooks', 'CSS Flexbox', 'Async/Await').
    4.  For each task, provide a rich set of learning resources:
        a. **External Links (Mandatory):** For every task, include 1-2 external resources of type 'video' or 'article'. For 'video', the 'content' MUST be a full, valid YouTube URL. For 'article', the 'content' MUST be a URL to a high-quality blog post, tutorial, or documentation page. Give them a descriptive title.
        b. **Interactive Content (When Applicable):** For topics that can be programmatically tested (e.g., algorithms, specific syntax, logic), ALSO include one resource of type 'coding_challenge'.
        c. **Generated Notes (Optional):** You can also include 'notes' or 'practice' resources with Markdown content if it adds significant value beyond the external links.
    5.  For a 'coding_challenge' resource:
        *   The 'content' must be a clear problem description in Markdown. The user will be expected to write a javascript function named 'solution'.
        *   Provide an array of at least 3 'testCases'. Each test case must have an 'input' (a JSON string representing arguments for the function) and an 'expected' output (a JSON string of the return value).
        *   Provide a 'solution' string containing the correct Javascript implementation.
    6.  Structure the output strictly according to the provided JSON schema.
    `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: generateLearningPlanSchema,
        temperature: 0.5,
      },
    });

    const jsonText = response.text.trim();
    const plan = JSON.parse(jsonText) as LearningPlan;

    const startDate = new Date();
    plan.schedule.forEach((day, index) => {
      const dayDate = new Date(startDate);
      dayDate.setDate(startDate.getDate() + index);
      (day as DailyPlan).isoDate = dayDate.toISOString();
    });

    return plan;
  } catch (error) {
    console.error("Error generating learning plan with Gemini:", error);
    throw new Error("Failed to parse or receive data from the AI model.");
  }
};

export const evaluateReflection = async (task: Task, userNotes: string): Promise<string> => {
    const prompt = `
    You are an AI learning mentor. A student has completed a task and written a reflection.
    
    The task was:
    - **Title:** "${task.title}"
    - **Description:** "${task.description}"

    The student's reflection is:
    "${userNotes}"

    Please evaluate their reflection. Your goal is to be encouraging and helpful.
    1.  Briefly acknowledge their work.
    2.  Assess their understanding of the topic based on their notes.
    3.  Provide one piece of concise, constructive feedback or an interesting insight.
    4.  Ask one follow-up question to encourage deeper thinking.
    5.  Keep your entire response under 100 words and format it as a single block of text.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: prompt,
            config: {
                temperature: 0.7,
            }
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error evaluating reflection with Gemini:", error);
        return "Sorry, I was unable to evaluate your reflection at this time. Great job on completing the task!";
    }
};