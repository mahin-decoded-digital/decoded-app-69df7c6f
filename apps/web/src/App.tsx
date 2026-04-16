import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Plus, Trash2, Edit, CheckCircle, Circle, Sparkles, Wand2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  placeholderNote?: string;
  isImaginary?: boolean;
}

export interface TaskState {
  tasks: Task[];
  addTask: (title: string, placeholderNote?: string, isImaginary?: boolean) => void;
  updateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => void;
  deleteTask: (id: string) => void;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({
      tasks: [],
      addTask: (title, placeholderNote, isImaginary) => set((state) => ({
        tasks: [
          ...state.tasks,
          {
            id: crypto.randomUUID(),
            title,
            completed: false,
            createdAt: new Date().toISOString(),
            placeholderNote,
            isImaginary
          }
        ]
      })),
      updateTask: (id, updates) => set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t))
      })),
      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id)
      }))
    }),
    { name: 'taskmaster-storage' }
  )
);

export function TaskForm() {
  const addTask = useTaskStore((s) => s.addTask);
  const [title, setTitle] = useState('');
  const [useImaginary, setUseImaginary] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    const placeholder = useImaginary ? "Enhanced with imaginary potential" : undefined;
    addTask(title.trim(), placeholder, useImaginary);
    
    setTitle('');
    setUseImaginary(false);
  };

  const handlePlaceholderFeature = () => {
    setTitle(`Placeholder Task - ${Math.floor(Math.random() * 9000) + 1000}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          className="bg-slate-950/50 border-slate-700/60 text-slate-50 focus-visible:ring-indigo-500 h-12 text-lg shadow-inner shadow-black/20"
        />
        <Button 
          type="submit" 
          className="h-12 px-6 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-lg shadow-indigo-900/20 border-0"
        >
          <Plus className="w-5 h-5 mr-2" /> Add
        </Button>
      </div>
      
      <div className="flex items-center gap-6 text-sm text-slate-400 pl-1">
        <label className="flex items-center gap-2 cursor-pointer hover:text-slate-200 transition-colors group">
          <div className="relative flex items-center justify-center">
            <input 
              type="checkbox" 
              checked={useImaginary} 
              onChange={(e) => setUseImaginary(e.target.checked)} 
              className="peer appearance-none w-4 h-4 rounded border border-slate-600 bg-slate-900 checked:bg-indigo-500 checked:border-indigo-500 transition-all cursor-pointer" 
            />
            <Sparkles className="w-2.5 h-2.5 text-white absolute opacity-0 peer-checked:opacity-100 pointer-events-none" />
          </div>
          <Wand2 className="w-4 h-4 group-hover:text-indigo-400 transition-colors" /> 
          Imaginary Mode
        </label>
        
        <button 
          type="button" 
          onClick={handlePlaceholderFeature} 
          className="flex items-center gap-2 hover:text-slate-200 transition-colors group"
        >
          <Info className="w-4 h-4 group-hover:text-cyan-400 transition-colors" /> 
          Use Placeholder
        </button>
      </div>
    </form>
  );
}

export function TaskItem({ task }: { task: Task }) {
  const updateTask = useTaskStore((s) => s.updateTask);
  const deleteTask = useTaskStore((s) => s.deleteTask);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);

  const handleSave = () => {
    if (!editTitle.trim()) return;
    updateTask(task.id, { title: editTitle.trim() });
    setIsEditing(false);
  };

  return (
    <div className={`group flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 ${
      task.completed 
        ? 'bg-slate-900/20 border-slate-800/30 shadow-sm' 
        : 'bg-slate-800/40 border-slate-700/50 shadow-md hover:border-indigo-500/30 hover:bg-slate-800/60'
    }`}>
      <button 
        onClick={() => updateTask(task.id, { completed: !task.completed })} 
        className={`flex-shrink-0 transition-colors ${task.completed ? 'text-indigo-400 hover:text-indigo-300' : 'text-slate-500 hover:text-indigo-400'}`}
      >
        {task.completed ? <CheckCircle className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
      </button>
      
      <div className={`flex-1 overflow-hidden ${task.completed ? 'opacity-50' : 'opacity-100'}`}>
        <p className={`truncate text-base transition-all ${task.completed ? 'line-through text-slate-400' : 'text-slate-100'}`}>
          {task.title}
        </p>
        {(task.placeholderNote || task.isImaginary) && (
          <div className="flex items-center gap-3 mt-1.5">
            {task.placeholderNote && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 bg-slate-900/50 px-2 py-0.5 rounded-full border border-slate-700/50">
                <Info className="w-3 h-3" /> {task.placeholderNote}
              </span>
            )}
            {task.isImaginary && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-300 bg-indigo-900/20 px-2 py-0.5 rounded-full border border-indigo-700/30">
                <Sparkles className="w-3 h-3" /> Imaginary
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Dialog open={isEditing} onOpenChange={(open) => {
          setIsEditing(open);
          if (open) setEditTitle(task.title);
        }}>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setIsEditing(true)}
              className="h-8 w-8 text-slate-400 hover:text-indigo-300 hover:bg-indigo-950/50 rounded-lg"
            >
              <Edit className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-800 text-slate-50 shadow-2xl shadow-black/50 sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">Edit Task</DialogTitle>
              <DialogDescription className="text-slate-400">
                Update the title of your task below.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input 
                value={editTitle} 
                onChange={(e) => setEditTitle(e.target.value)} 
                className="bg-slate-950 border-slate-700 text-slate-50 focus-visible:ring-indigo-500" 
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                autoFocus 
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsEditing(false)}
                  className="text-slate-300 hover:text-white hover:bg-slate-800"
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-500 text-white">
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => deleteTask(task.id)} 
          className="h-8 w-8 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export function Home() {
  const tasks = useTaskStore((s) => s.tasks);
  
  const activeTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <header className="mb-12 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-indigo-500/10 rounded-2xl mb-4 border border-indigo-500/20 shadow-inner">
          <Sparkles className="w-8 h-8 text-indigo-400" />
        </div>
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-white to-cyan-300 tracking-tight">
          TaskMaster
        </h1>
        <p className="text-indigo-200/60 mt-3 text-sm uppercase tracking-[0.2em] font-semibold">
          Organize • Achieve • Enhance
        </p>
      </header>

      <Card className="bg-slate-900/60 border-slate-800/80 backdrop-blur-xl shadow-2xl shadow-black/40 rounded-3xl overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500"></div>
        <CardContent className="p-6 sm:p-8">
          <TaskForm />
          
          <div className="mt-10 space-y-3">
            {tasks.length === 0 ? (
              <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-slate-700/50 bg-slate-800/20">
                <Wand2 className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                <h3 className="text-lg font-medium text-slate-300 mb-1">Your space is clear</h3>
                <p className="text-slate-500 text-sm">Add a task above to begin your journey.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {activeTasks.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">Active Tasks</h4>
                    {activeTasks.map((task) => (
                      <TaskItem key={task.id} task={task} />
                    ))}
                  </div>
                )}
                
                {completedTasks.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">Completed</h4>
                    {completedTasks.map((task) => (
                      <TaskItem key={task.id} task={task} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 bg-gradient-to-br from-slate-950 via-[#0a0f1d] to-indigo-950/20 text-slate-50 font-sans selection:bg-indigo-500/30 selection:text-white">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </div>
  );
}