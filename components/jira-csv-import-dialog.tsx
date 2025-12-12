'use client';

import { useState } from 'react';
import { useImportCsvJira } from '@/lib/hooks/use-advanced-features';
import { useProjectList } from '@/lib/hooks/use-project-data';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ProjectSelector } from '@/components/project-selector';
import { FileUp, CheckCircle, AlertCircle } from 'lucide-react';

interface JiraCsvImportDialogProps {
  trigger?: React.ReactNode;
}

export function JiraCsvImportDialog({ trigger }: JiraCsvImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [importMode, setImportMode] = useState<'new' | 'existing'>('new');
  const [newProjectName, setNewProjectName] = useState('');
  const [selectedProjectSlug, setSelectedProjectSlug] = useState('');
  const [overwrite, setOverwrite] = useState(false);

  const importMutation = useImportCsvJira();
  const { data: projects } = useProjectList();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.name.endsWith('.csv')) {
      setFile(selectedFile);
      if (!newProjectName && importMode === 'new') {
        const name = selectedFile.name.replace('.csv', '').replace(/-|_/g, ' ');
        setNewProjectName(name);
      }
    }
  };

  const handleImport = async () => {
    if (!file) return;

    const projectName = importMode === 'new' ? newProjectName : selectedProjectSlug;
    if (!projectName) return;

    // If importing to existing project, always set overwrite to true
    const shouldOverwrite = importMode === 'existing' ? true : overwrite;

    try {
      await importMutation.mutateAsync({ file, projectName, overwrite: shouldOverwrite });
      setTimeout(() => {
        setOpen(false);
        setFile(null);
        setNewProjectName('');
        setSelectedProjectSlug('');
        setOverwrite(false);
        setImportMode('new');
      }, 2000);
    } catch (error) {
      console.error('Import failed:', error);
    }
  };

  const isFormValid = file && (
    (importMode === 'new' && newProjectName) ||
    (importMode === 'existing' && selectedProjectSlug)
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Import from Jira CSV</DialogTitle>
          <DialogDescription>
            Upload a Jira-exported CSV file to create a new project with issues, epics, and sprints.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* File Upload */}
          <div className="grid gap-2">
            <Label htmlFor="jira-csv-file">CSV File</Label>
            <div className="flex items-center gap-2">
              <Input
                id="jira-csv-file"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
              {file && <FileUp className="h-5 w-5 text-green-500" />}
            </div>
            {file && (
              <p className="text-sm text-muted-foreground">
                Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>

          {/* Import Mode Selection */}
          <div className="grid gap-3">
            <Label>Import Destination</Label>
            <RadioGroup value={importMode} onValueChange={(value) => setImportMode(value as 'new' | 'existing')}>
              <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="new" id="jira-new-project" />
                <Label htmlFor="jira-new-project" className="flex-1 cursor-pointer">
                  <div className="font-medium">Create New Project</div>
                  <div className="text-sm text-muted-foreground">
                    Import data into a new project
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="existing" id="jira-existing-project" />
                <Label htmlFor="jira-existing-project" className="flex-1 cursor-pointer">
                  <div className="font-medium">Import to Existing Project</div>
                  <div className="text-sm text-muted-foreground">
                    Replace data in an existing project
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* New Project Name (shown when creating new) */}
          {importMode === 'new' && (
            <div className="grid gap-2">
              <Label htmlFor="jira-project-name">New Project Name</Label>
              <Input
                id="jira-project-name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="My Jira Project"
              />
              {newProjectName && projects?.some(p => p.name === newProjectName) && (
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="jira-overwrite"
                    checked={overwrite}
                    onCheckedChange={(checked) => setOverwrite(checked as boolean)}
                  />
                  <Label htmlFor="jira-overwrite" className="text-sm font-normal cursor-pointer">
                    Overwrite existing project with same name
                  </Label>
                </div>
              )}
            </div>
          )}

          {/* Existing Project Selector (shown when importing to existing) */}
          {importMode === 'existing' && (
            <div className="grid gap-2">
              <Label>Select Project to Replace</Label>
              <ProjectSelector value={selectedProjectSlug} onChange={setSelectedProjectSlug} />
              <p className="text-sm text-yellow-600 dark:text-yellow-500">
                Warning: All data in the selected project will be replaced
              </p>
            </div>
          )}

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
              setNewProjectName('');
              setSelectedProjectSlug('');
              setOverwrite(false);
              setImportMode('new');
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={!isFormValid || importMutation.isPending}
          >
            {importMutation.isPending ? 'Importing...' : 'Import'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
