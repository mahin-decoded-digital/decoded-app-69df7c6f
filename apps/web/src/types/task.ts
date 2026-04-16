export type TaskStatus = 'todo' | 'in-progress' | 'completed';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  
  // Custom features requested in requirements
  placeholderText?: string;
  imaginaryPowerLevel?: number;
  isImaginaryActive?: boolean;
}

export interface TaskStore {
  // State
  tasks: Task[];
  searchQuery: string;
  statusFilter: TaskStatus | 'all';
  
  // Core Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  
  // UI State Actions
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: TaskStatus | 'all') => void;
  
  // Special Feature Actions
  applyPlaceholderFeature: (id: string, text: string) => void;
  toggleImaginaryFeature: (id: string) => void;
}