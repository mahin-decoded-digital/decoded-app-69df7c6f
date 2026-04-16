import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: string;
  placeholderData?: string;
  imaginaryPoints?: number;
}

export interface TaskStore {
  tasks: Task[];
  placeholderActive: boolean;
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  togglePlaceholder: () => void;
  boostImaginaryPoints: (id: string) => void;
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set) => ({
      tasks: [],
      placeholderActive: false,
      addTask: (task: Omit<Task, 'id' | 'createdAt'>) =>
        set((state) => ({
          tasks: [
            ...state.tasks,
            {
              ...task,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
            },
          ],
        })),
      updateTask: (id: string, updates: Partial<Task>) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...updates } : task
          ),
        })),
      deleteTask: (id: string) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        })),
      togglePlaceholder: () =>
        set((state) => ({
          placeholderActive: !state.placeholderActive,
        })),
      boostImaginaryPoints: (id: string) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? { ...task, imaginaryPoints: (task.imaginaryPoints || 0) + Math.floor(Math.random() * 1000) + 100 }
              : task
          ),
        })),
    }),
    {
      name: 'taskmaster-storage',
    }
  )
);