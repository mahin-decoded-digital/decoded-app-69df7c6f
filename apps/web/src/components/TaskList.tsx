import React, { useState, useEffect } from 'react';
import { useTaskStore, Task } from '@/store/taskStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, CheckCircle, Zap, Clock } from 'lucide-react';

export default function TaskList() {
  const tasks = useTaskStore((s) => s.tasks);
  const updateTask = useTaskStore((s) => s.updateTask);
  const deleteTask = useTaskStore((s) => s.deleteTask);
  const boostImaginaryPoints = useTaskStore((s) => s.boostImaginaryPoints);

  if (!tasks || tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border rounded-xl bg-card/50 border-dashed">
        <div className="bg-muted p-4 rounded-full mb-4">
          <Clock className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground">No items yet. Add one!</h3>
        <p className="text-muted-foreground mt-2 max-w-sm">
          You haven't created any tasks. Add one to get started and boost your imaginary productivity!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {(tasks ?? []).map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onUpdate={updateTask}
          onDelete={deleteTask}
          onBoost={boostImaginaryPoints}
        />
      ))}
    </div>
  );
}

function TaskItem({ 
  task, 
  onUpdate, 
  onDelete, 
  onBoost 
}: { 
  task: Task; 
  onUpdate: (id: string, updates: Partial<Task>) => void; 
  onDelete: (id: string) => void;
  onBoost: (id: string) => void;
}) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || '');

  // Reset form when dialog opens with current task values
  useEffect(() => {
    if (isEditDialogOpen) {
      setEditTitle(task.title);
      setEditDescription(task.description || '');
    }
  }, [isEditDialogOpen, task]);

  const handleToggleComplete = () => {
    onUpdate(task.id, { completed: !task.completed });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim()) return;
    onUpdate(task.id, { title: editTitle, description: editDescription });
    setIsEditDialogOpen(false);
  };

  return (
    <Card className={`flex flex-col overflow-hidden transition-all duration-300 dark:bg-gradient-to-b dark:from-card dark:to-card/90 ${task.completed ? 'opacity-60 border-muted' : 'border-border hover:shadow-md'}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <div className="flex items-start gap-3 w-full">
            <button 
              onClick={handleToggleComplete}
              className={`mt-0.5 rounded-full hover:bg-muted p-0.5 transition-colors flex-shrink-0 ${task.completed ? 'text-primary' : 'text-muted-foreground'}`}
              aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
            >
              {task.completed ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/50 hover:border-muted-foreground transition-colors" />
              )}
            </button>
            <div className="w-full min-w-0">
              <CardTitle className={`text-base leading-tight break-words ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                {task.title}
              </CardTitle>
              {task.imaginaryPoints !== undefined && task.imaginaryPoints > 0 && (
                <Badge variant="secondary" className="mt-2 text-xs font-mono flex gap-1 w-fit bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 dark:text-yellow-400">
                  <Zap className="h-3 w-3" />
                  {task.imaginaryPoints.toLocaleString()} Pts
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <CardDescription className={`whitespace-pre-wrap break-words ${task.completed ? 'line-through' : ''}`}>
          {task.description || "No description provided."}
        </CardDescription>
        
        {task.placeholderData && (
          <div className="mt-4 p-2 bg-muted/50 rounded border border-border/50 text-xs text-muted-foreground font-mono truncate">
            Placeholder: {task.placeholderData}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-3 border-t bg-muted/10 flex justify-between gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onBoost(task.id)}
          className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-500/10 dark:text-yellow-500 dark:hover:text-yellow-400 dark:hover:bg-yellow-500/20"
          title="Boost Imaginary Power"
        >
          <Zap className="h-4 w-4 mr-2" />
          Boost
        </Button>

        <div className="flex gap-1">
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsEditDialogOpen(true)}
                className="h-8 w-8 p-0"
                title="Edit Task"
              >
                <Edit className="h-4 w-4" />
                <span className="sr-only">Edit</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit Task</DialogTitle>
                <DialogDescription>
                  Make changes to your task details here.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSaveEdit} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor={`edit-title-${task.id}`}>Title</Label>
                  <Input 
                    id={`edit-title-${task.id}`}
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Enter task title"
                    required
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`edit-description-${task.id}`}>Description</Label>
                  <Textarea 
                    id={`edit-description-${task.id}`}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Enter detailed description (optional)"
                    rows={4}
                    className="resize-none"
                  />
                </div>
                <DialogFooter className="pt-4">
                  <DialogClose asChild>
                    <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="submit" disabled={!editTitle.trim()}>Save changes</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onDelete(task.id)}
            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
            title="Delete Task"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}