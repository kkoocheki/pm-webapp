'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';

interface GitHubImportDialogProps {
  trigger?: React.ReactNode;
}

export function GitHubImportDialog({ trigger }: GitHubImportDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>Import from GitHub</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Import from GitHub</DialogTitle>
          <DialogDescription>
            Import issues and pull requests from a GitHub repository
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900">Coming Soon</p>
              <p className="text-blue-700 mt-1">
                GitHub integration is currently under development. This feature will allow you to:
              </p>
              <ul className="list-disc list-inside text-blue-700 mt-2 space-y-1">
                <li>Import issues as tasks</li>
                <li>Import pull requests as work items</li>
                <li>Sync milestones and labels</li>
                <li>Track issue dependencies</li>
              </ul>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
