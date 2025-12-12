'use client';

import { useState } from 'react';
import { useImportTtl } from '@/lib/hooks/use-advanced-features';
import { useUIStore } from '@/lib/stores/app-store';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, FileUp, CheckCircle, AlertCircle } from 'lucide-react';

export function ImportDialog() {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [projectName, setProjectName] = useState('');
  const [overwrite, setOverwrite] = useState(false);

  const importMutation = useImportTtl();
  const setCurrentProjectSlug = useUIStore((state) => state.setCurrentProjectSlug);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.name.endsWith('.ttl')) {
      setFile(selectedFile);
      // Auto-fill project name from filename
      const name = selectedFile.name.replace('.ttl', '').replace(/-|_/g, ' ');
      setProjectName(name);
    }
  };

  const handleImport = async () => {
    if (!file || !projectName) return;

    try {
      const result = await importMutation.mutateAsync({ file, projectName, overwrite });
      // Switch to the newly imported project
      if (result.project_slug) {
        setCurrentProjectSlug(result.project_slug);
      }
      setOpen(false);
      setFile(null);
      setProjectName('');
      setOverwrite(false);
    } catch (error) {
      console.error('Import failed:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          Import Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Import Project from TTL File</DialogTitle>
          <DialogDescription>
            Upload a Turtle (.ttl) RDF file to create a new project with tasks and dependencies.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* File Upload */}
          <div className="grid gap-2">
            <Label htmlFor="file">TTL File</Label>
            <div className="flex items-center gap-2">
              <Input
                id="file"
                type="file"
                accept=".ttl"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
              {file && (
                <FileUp className="h-5 w-5 text-green-500" />
              )}
            </div>
            {file && (
              <p className="text-sm text-muted-foreground">
                Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>

          {/* Project Name */}
          <div className="grid gap-2">
            <Label htmlFor="project-name">Project Name</Label>
            <Input
              id="project-name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="My New Project"
            />
          </div>

          {/* Overwrite Option */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="overwrite"
              checked={overwrite}
              onCheckedChange={(checked) => setOverwrite(checked as boolean)}
            />
            <Label
              htmlFor="overwrite"
              className="text-sm font-normal cursor-pointer"
            >
              Overwrite existing project if it exists
            </Label>
          </div>

          {/* Status Messages */}
          {importMutation.isSuccess && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div className="text-sm">
                <p className="font-medium text-green-900">Import Successful!</p>
                <p className="text-green-700">
                  Created {importMutation.data.tasks_created} tasks and{' '}
                  {importMutation.data.dependencies_created} dependencies
                </p>
              </div>
            </div>
          )}

          {importMutation.isError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div className="text-sm">
                <p className="font-medium text-red-900">Import Failed</p>
                <p className="text-red-700">
                  {importMutation.error instanceof Error
                    ? importMutation.error.message
                    : 'Unknown error occurred'}
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setOpen(false);
              setFile(null);
              setProjectName('');
              setOverwrite(false);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={!file || !projectName || importMutation.isPending}
          >
            {importMutation.isPending ? 'Importing...' : 'Import'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
