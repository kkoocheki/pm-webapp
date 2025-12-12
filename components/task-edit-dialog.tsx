'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Task, TaskStatus, TaskPriority } from '@/lib/api/types';
import { useCreateTask, useUpdateTask, useDeleteTask } from '@/lib/hooks/use-project-data';
import { DEFAULT_PROJECT_SLUG } from '@/lib/api/config';

interface TaskEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Partial<Task> | null;
  mode: 'create' | 'edit';
}

const statusOptions: { value: TaskStatus; label: string }[] = [
  { value: 'not-started', label: 'Not Started' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'blocked', label: 'Blocked' },
];

const priorityOptions: { value: TaskPriority; label: string }[] = [
  { value: 'urgent', label: 'Urgent' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
  { value: 'none', label: 'None' },
];

export function TaskEditDialog({
  open,
  onOpenChange,
  task,
  mode,
}: TaskEditDialogProps) {
  const [formData, setFormData] = useState<Partial<Task>>({
    title: '',
    description: '',
    status: 'not-started',
    priority: 'medium',
    startDate: '',
    endDate: '',
    assignee: '',
  });

  const createTaskMutation = useCreateTask(DEFAULT_PROJECT_SLUG);
  const updateTaskMutation = useUpdateTask(DEFAULT_PROJECT_SLUG);
  const deleteTaskMutation = useDeleteTask(DEFAULT_PROJECT_SLUG);

  // Reset form when dialog opens or task changes
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && task) {
        setFormData({
          title: task.title || '',
          description: task.description || '',
          status: task.status || 'not-started',
          priority: task.priority || 'medium',
          startDate: task.startDate || '',
          endDate: task.endDate || '',
          assignee: task.assignee || '',
        });
      } else {
        setFormData({
          title: '',
          description: '',
          status: 'not-started',
          priority: 'medium',
          startDate: new Date().toISOString().split('T')[0],
          endDate: '',
          assignee: '',
        });
      }
    }
  }, [open, task, mode]);

  const handleSave = async () => {
    try {
      if (mode === 'create') {
        await createTaskMutation.mutateAsync(formData);
      } else if (task?.id) {
        await updateTaskMutation.mutateAsync({
          taskId: task.id,
          updates: formData,
        });
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save task:', error);
    }
  };

  const handleDelete = async () => {
    if (task?.id && window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTaskMutation.mutateAsync(task.id);
        onOpenChange(false);
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  const isLoading = createTaskMutation.isPending || updateTaskMutation.isPending || deleteTaskMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create New Task' : 'Edit Task'}</DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Fill in the details to create a new task.' 
              : 'Make changes to the task details below.'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Title */}
          <div className="grid gap-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter task title"
            />
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter task description"
              rows={3}
            />
          </div>

          {/* Status and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: TaskStatus) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: TaskPriority) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Start Date and End Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>

          {/* Assignee */}
          <div className="grid gap-2">
            <Label htmlFor="assignee">Assignee</Label>
            <Input
              id="assignee"
              value={formData.assignee}
              onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
              placeholder="Enter assignee name"
            />
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <div>
            {mode === 'edit' && (
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isLoading}
              >
                Delete
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading || !formData.title}>
              {isLoading ? 'Saving...' : mode === 'create' ? 'Create' : 'Save Changes'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
