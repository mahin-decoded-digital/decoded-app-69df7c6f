import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Save, X } from "lucide-react";

export interface TaskFormData {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  isImaginary: boolean;
}

interface TaskFormProps {
  initialData?: Partial<TaskFormData>;
  onSubmit: (data: TaskFormData) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

const defaultData: TaskFormData = {
  title: '',
  description: '',
  priority: 'medium',
  isImaginary: false,
};

export default function TaskForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: TaskFormProps) {
  const [formData, setFormData] = useState<TaskFormData>(defaultData);
  const [errors, setErrors] = useState<Partial<Record<keyof TaskFormData, string>>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title ?? '',
        description: initialData.description ?? '',
        priority: initialData.priority ?? 'medium',
        isImaginary: initialData.isImaginary ?? false,
      });
    }
  }, [initialData]);

  const handleChange = (field: keyof TaskFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof TaskFormData, string>> = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
      if (!initialData) {
        // Reset form only if creating a new task
        setFormData(defaultData);
      }
    }
  };

  const isEditing = !!initialData?.title;

  return (
    <Card className="w-full max-w-lg mx-auto bg-card border-border shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          {isEditing ? (
            'Edit Task'
          ) : (
            <>
              Create New Task
              <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            </>
          )}
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              placeholder="E.g., Complete project proposal"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className={errors.title ? "border-destructive" : ""}
              autoFocus
            />
            {errors.title && (
              <p className="text-sm text-destructive font-medium">{errors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Add any relevant details or steps..."
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="min-h-[100px] resize-y"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority Level</Label>
            <Select
              value={formData.priority}
              onValueChange={(value) => handleChange('priority', value)}
            >
              <SelectTrigger id="priority" className="w-full">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between p-4 mt-4 border border-border rounded-lg bg-muted/50">
            <div className="space-y-0.5">
              <Label htmlFor="imaginary-feature" className="text-base font-medium">
                Imaginary Enhancement
              </Label>
              <p className="text-sm text-muted-foreground">
                Apply a subtle gradient to this task's card.
              </p>
            </div>
            <Switch
              id="imaginary-feature"
              checked={formData.isImaginary}
              onCheckedChange={(checked) => handleChange('isImaginary', checked)}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-3 pt-4 border-t border-border mt-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </Button>
          )}
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Task'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}