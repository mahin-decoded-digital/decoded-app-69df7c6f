import React, { useState, useMemo } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  CheckCircle2, 
  Circle, 
  Sparkles, 
  Zap, 
  LayoutDashboard, 
  Search,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

// --- Types ---

export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: string;
  isPlaceholder: boolean;
  isImaginary: boolean;
}

export interface TaskState {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
}

// --- Store ---

export const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({
      tasks: [],
      addTask: (task) => set((state) => ({
        tasks: [
          { 
            ...task, 
            id: crypto.randomUUID(), 
            createdAt: new Date().toISOString() 
          },
          ...state.tasks
        ]
      })),
      updateTask: (id, updates) => set((state) => ({
        tasks: state.tasks.map((t) => t.id === id ? { ...t, ...updates } : t)
      })),
      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id)
      })),
      toggleTask: (id) => set((state) => ({
        tasks: state.tasks.map((t) => t.id === id ? { ...t, completed: !t.completed } : t)
      }))
    }),
    { name: 'taskmaster-storage' }
  )
);

// --- Components ---

export default function Dashboard() {
  // Store actions
  const tasks = useTaskStore((s) => s.tasks);
  const addTask = useTaskStore((s) => s.addTask);
  const updateTask = useTaskStore((s) => s.updateTask);
  const deleteTask = useTaskStore((s) => s.deleteTask);
  const toggleTask = useTaskStore((s) => s.toggleTask);

  // Local state for Create Form
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newIsPlaceholder, setNewIsPlaceholder] = useState(false);
  const [newIsImaginary, setNewIsImaginary] = useState(false);

  // Local state for Search/Filter
  const [searchQuery, setSearchQuery] = useState('');

  // Local state for Edit Dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editIsPlaceholder, setEditIsPlaceholder] = useState(false);
  const [editIsImaginary, setEditIsImaginary] = useState(false);

  // Derived state
  const filteredTasks = useMemo(() => {
    return (tasks ?? []).filter((task) => 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      task.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tasks, searchQuery]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const active = total - completed;
    return { total, completed, active };
  }, [tasks]);

  // Handlers
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addTask({
      title: newTitle.trim(),
      description: newDescription.trim(),
      completed: false,
      isPlaceholder: newIsPlaceholder,
      isImaginary: newIsImaginary,
    });

    // Reset form
    setNewTitle('');
    setNewDescription('');
    setNewIsPlaceholder(false);
    setNewIsImaginary(false);
  };

  const openEditDialog = (task: Task) => {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description);
    setEditIsPlaceholder(task.isPlaceholder);
    setEditIsImaginary(task.isImaginary);
    setEditOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || !editTitle.trim()) return;

    updateTask(editingId, {
      title: editTitle.trim(),
      description: editDescription.trim(),
      isPlaceholder: editIsPlaceholder,
      isImaginary: editIsImaginary,
    });

    setEditOpen(false);
    setEditingId(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-30 w-full border-b border-border bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-lg text-primary-foreground">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">TaskMaster</h1>
          </div>
          
          <div className="relative w-full max-w-xs hidden md:flex items-center">
            <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search tasks..."
              className="w-full pl-9 bg-muted/50 border-none focus-visible:ring-1"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sidebar / Create Form */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-border/50 shadow-sm bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Create New Task</CardTitle>
              <CardDescription>Add a new task to your workspace.</CardDescription>
            </CardHeader>
            <form onSubmit={handleCreateTask}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Task Title</Label>
                  <Input 
                    id="title" 
                    placeholder="e.g., Review Q3 metrics" 
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    autoComplete="off"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description <span className="text-muted-foreground font-normal">(optional)</span></Label>
                  <Textarea 
                    id="description" 
                    placeholder="Add details about this task..." 
                    className="resize-none h-24"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                  />
                </div>

                <div className="pt-2 space-y-4">
                  <div className="flex items-center justify-between space-x-2">
                    <div className="flex flex-col space-y-1">
                      <Label htmlFor="placeholder-toggle" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Placeholder Feature
                      </Label>
                      <span className="text-[0.8rem] text-muted-foreground">Assign default placeholder template.</span>
                    </div>
                    <Switch 
                      id="placeholder-toggle" 
                      checked={newIsPlaceholder}
                      onCheckedChange={setNewIsPlaceholder}
                    />
                  </div>
                  
                  <Separator />

                  <div className="flex items-center justify-between space-x-2">
                    <div className="flex flex-col space-y-1">
                      <Label htmlFor="imaginary-toggle" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1">
                        Imaginary Feature <Sparkles className="h-3 w-3 text-amber-500" />
                      </Label>
                      <span className="text-[0.8rem] text-muted-foreground">Enable experimental enhancements.</span>
                    </div>
                    <Switch 
                      id="imaginary-toggle" 
                      checked={newIsImaginary}
                      onCheckedChange={setNewIsImaginary}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={!newTitle.trim()}>
                  <Plus className="mr-2 h-4 w-4" /> Add Task
                </Button>
              </CardFooter>
            </form>
          </Card>

          {/* Stats Widget */}
          <Card className="border-border/50 shadow-sm bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Workspace Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="space-y-1">
                  <p className="text-3xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
                <div className="space-y-1">
                  <p className="text-3xl font-bold text-primary">{stats.active}</p>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
                <div className="space-y-1">
                  <p className="text-3xl font-bold text-emerald-500">{stats.completed}</p>
                  <p className="text-xs text-muted-foreground">Done</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tasks List Area */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between md:hidden mb-4">
             <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search tasks..."
                className="w-full pl-9 bg-muted/50 border-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 px-4 text-center border-2 border-dashed border-border rounded-xl bg-muted/10">
              <div className="bg-muted p-4 rounded-full mb-4">
                <CheckCircle2 className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-1">No tasks found</h3>
              <p className="text-muted-foreground max-w-sm">
                {searchQuery 
                  ? "We couldn't find any tasks matching your search. Try a different keyword." 
                  : "You have no tasks yet. Add one using the form to get started!"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filteredTasks.map((task) => (
                <Card 
                  key={task.id} 
                  className={`group relative transition-all duration-200 border-border/50 hover:border-border hover:shadow-md ${task.completed ? 'bg-muted/30 opacity-75' : 'bg-card'}`}
                >
                  <div className="absolute inset-y-0 left-0 w-1 rounded-l-xl bg-primary scale-y-0 group-hover:scale-y-100 transition-transform origin-bottom" />
                  
                  <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    
                    <button 
                      onClick={() => toggleTask(task.id)}
                      className="flex-shrink-0 mt-1 sm:mt-0 text-muted-foreground hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded-full"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                      ) : (
                        <Circle className="h-6 w-6" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className={`text-base font-semibold truncate ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                          {task.title}
                        </h3>
                        {task.isPlaceholder && (
                          <Badge variant="secondary" className="text-[10px] uppercase px-1.5 py-0 h-4">
                            Placeholder
                          </Badge>
                        )}
                        {task.isImaginary && (
                          <Badge variant="default" className="text-[10px] uppercase px-1.5 py-0 h-4 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20 flex items-center gap-1">
                            <Zap className="h-2.5 w-2.5" /> Imaginary
                          </Badge>
                        )}
                      </div>
                      
                      {task.description && (
                        <p className={`text-sm line-clamp-2 ${task.completed ? 'text-muted-foreground/60' : 'text-muted-foreground'}`}>
                          {task.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto justify-end mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-border/50">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => openEditDialog(task)}
                      >
                        <Edit2 className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => deleteTask(task.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  autoComplete="off"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="resize-none"
                />
              </div>
              
              <div className="grid gap-4 mt-2">
                <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Placeholder Feature</Label>
                    <p className="text-xs text-muted-foreground">Keep placeholder active.</p>
                  </div>
                  <Switch
                    checked={editIsPlaceholder}
                    onCheckedChange={setEditIsPlaceholder}
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium flex items-center gap-1">
                      Imaginary Feature <Sparkles className="h-3 w-3 text-amber-500" />
                    </Label>
                    <p className="text-xs text-muted-foreground">Keep enhancement active.</p>
                  </div>
                  <Switch
                    checked={editIsImaginary}
                    onCheckedChange={setEditIsImaginary}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!editTitle.trim()}>
                <Check className="mr-2 h-4 w-4" /> Save changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}