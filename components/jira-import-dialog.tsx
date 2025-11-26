'use client';

import { useState, useEffect } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { CheckCircle, AlertCircle, Loader2, ExternalLink } from 'lucide-react';
import { useListJiraProjects, useImportJira } from '@/lib/hooks/use-advanced-features';

interface JiraImportDialogProps {
  trigger?: React.ReactNode;
}

export function JiraImportDialog({ trigger }: JiraImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);

  // Step 1: Connection
  const [jiraUrl, setJiraUrl] = useState('');
  const [email, setEmail] = useState('');
  const [apiToken, setApiToken] = useState('');
  const [shouldFetchProjects, setShouldFetchProjects] = useState(false);

  // Step 2: Project Selection
  const [selectedProjectKey, setSelectedProjectKey] = useState('');

  // Step 3: Configuration
  const [projectName, setProjectName] = useState('');
  const [includeSubtasks, setIncludeSubtasks] = useState(true);
  const [includeEpics, setIncludeEpics] = useState(true);

  // React Query hooks
  const {
    data: projects = [],
    isLoading: loadingProjects,
    isError: projectsFetchError,
    error: projectsError,
    isSuccess: projectsFetchSuccess,
  } = useListJiraProjects({
    jiraUrl,
    email,
    apiToken,
    enabled: shouldFetchProjects,
  });

  const importMutation = useImportJira();

  const resetState = () => {
    setStep(1);
    setJiraUrl('');
    setEmail('');
    setApiToken('');
    setShouldFetchProjects(false);
    setSelectedProjectKey('');
    setProjectName('');
    setIncludeSubtasks(true);
    setIncludeEpics(true);
  };

  const handleTestConnection = () => {
    setShouldFetchProjects(true);
  };

  const handleNextToProjectSelection = () => {
    if (projectsFetchSuccess && projects.length > 0) {
      setStep(2);
    }
  };

  const handleNextToConfiguration = () => {
    if (selectedProjectKey) {
      const selectedProject = projects.find(p => p.key === selectedProjectKey);
      if (selectedProject && !projectName) {
        setProjectName(selectedProject.name);
      }
      setStep(3);
    }
  };

  const handleImport = async () => {
    try {
      await importMutation.mutateAsync({
        jira_url: jiraUrl,
        email,
        api_token: apiToken,
        project_key: selectedProjectKey,
        project_name: projectName || undefined,
        include_subtasks: includeSubtasks,
        include_epics: includeEpics,
      });
      setStep(4);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(resetState, 300); // Reset after dialog closes
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>Import from Jira</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            Import from Jira
            {step > 1 && <span className="text-muted-foreground ml-2">(Step {step}/3)</span>}
          </DialogTitle>
          <DialogDescription>
            {step === 1 && 'Connect to your Jira instance'}
            {step === 2 && 'Select a Jira project to import'}
            {step === 3 && 'Configure import options'}
            {step === 4 && 'Import complete!'}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Step 1: Connection */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="jira-url">Jira URL</Label>
                <Input
                  id="jira-url"
                  placeholder="https://your-domain.atlassian.net"
                  value={jiraUrl}
                  onChange={(e) => setJiraUrl(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your-email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="api-token">API Token</Label>
                <Input
                  id="api-token"
                  type="password"
                  placeholder="Your Jira API token"
                  value={apiToken}
                  onChange={(e) => setApiToken(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Generate an API token from{' '}
                  <a
                    href="https://id.atlassian.com/manage-profile/security/api-tokens"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center gap-1"
                  >
                    Atlassian Account Settings
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </p>
              </div>

              <Button
                onClick={handleTestConnection}
                disabled={!jiraUrl || !email || !apiToken || loadingProjects}
                className="w-full"
              >
                {loadingProjects ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing Connection...
                  </>
                ) : (
                  'Test Connection'
                )}
              </Button>

              {projectsFetchSuccess && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-green-900">Connection Successful!</p>
                    <p className="text-green-700">Found {projects.length} project(s)</p>
                  </div>
                </div>
              )}

              {projectsFetchError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-red-900">Connection Failed</p>
                    <p className="text-red-700">
                      {projectsError instanceof Error ? projectsError.message : 'Failed to connect to Jira'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Project Selection */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="project">Select Jira Project</Label>
                <Select value={selectedProjectKey} onValueChange={setSelectedProjectKey}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a project to import" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.key} value={project.key}>
                        <div className="flex flex-col">
                          <span className="font-medium">{project.name}</span>
                          <span className="text-xs text-muted-foreground">{project.key}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedProjectKey && (
                <Card className="p-3 bg-blue-50 border-blue-200">
                  <p className="text-sm text-blue-900">
                    <strong>Selected:</strong>{' '}
                    {projects.find(p => p.key === selectedProjectKey)?.name}
                  </p>
                  {projects.find(p => p.key === selectedProjectKey)?.description && (
                    <p className="text-xs text-blue-700 mt-1">
                      {projects.find(p => p.key === selectedProjectKey)?.description}
                    </p>
                  )}
                </Card>
              )}
            </div>
          )}

          {/* Step 3: Configuration */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="project-name">Project Name (Optional)</Label>
                <Input
                  id="project-name"
                  placeholder="Leave empty to use Jira project name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Default: {projects.find(p => p.key === selectedProjectKey)?.name}
                </p>
              </div>

              <div className="space-y-3">
                <Label>Import Options</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-epics"
                    checked={includeEpics}
                    onCheckedChange={(checked) => setIncludeEpics(checked as boolean)}
                  />
                  <Label htmlFor="include-epics" className="text-sm font-normal cursor-pointer">
                    Include Epics
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-subtasks"
                    checked={includeSubtasks}
                    onCheckedChange={(checked) => setIncludeSubtasks(checked as boolean)}
                  />
                  <Label htmlFor="include-subtasks" className="text-sm font-normal cursor-pointer">
                    Include Subtasks
                  </Label>
                </div>
              </div>

              {importMutation.isError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-red-900">Import Failed</p>
                    <p className="text-red-700">
                      {importMutation.error instanceof Error ? importMutation.error.message : 'Import failed'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Results */}
          {step === 4 && importMutation.data && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-green-900">Import Successful!</p>
                  <p className="text-green-700">Project "{importMutation.data.project_name}" created</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card className="p-3">
                  <p className="text-xs text-muted-foreground">Total Issues</p>
                  <p className="text-2xl font-bold">{importMutation.data.issues_imported}</p>
                </Card>
                <Card className="p-3">
                  <p className="text-xs text-muted-foreground">Epics</p>
                  <p className="text-2xl font-bold">{importMutation.data.epics_created}</p>
                </Card>
                <Card className="p-3">
                  <p className="text-xs text-muted-foreground">Stories</p>
                  <p className="text-2xl font-bold">{importMutation.data.stories_created}</p>
                </Card>
                <Card className="p-3">
                  <p className="text-xs text-muted-foreground">Tasks</p>
                  <p className="text-2xl font-bold">{importMutation.data.tasks_created}</p>
                </Card>
                <Card className="p-3">
                  <p className="text-xs text-muted-foreground">Subtasks</p>
                  <p className="text-2xl font-bold">{importMutation.data.subtasks_created}</p>
                </Card>
                <Card className="p-3">
                  <p className="text-xs text-muted-foreground">Dependencies</p>
                  <p className="text-2xl font-bold">{importMutation.data.dependencies_created}</p>
                </Card>
                <Card className="p-3">
                  <p className="text-xs text-muted-foreground">Sprints</p>
                  <p className="text-2xl font-bold">{importMutation.data.sprints_created}</p>
                </Card>
                <Card className="p-3">
                  <p className="text-xs text-muted-foreground">Users</p>
                  <p className="text-2xl font-bold">{importMutation.data.users_imported}</p>
                </Card>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {step === 1 && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleNextToProjectSelection} disabled={!projectsFetchSuccess}>
                Next
              </Button>
            </>
          )}
          {step === 2 && (
            <>
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={handleNextToConfiguration} disabled={!selectedProjectKey}>
                Next
              </Button>
            </>
          )}
          {step === 3 && (
            <>
              <Button variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button onClick={handleImport} disabled={importMutation.isPending}>
                {importMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  'Import'
                )}
              </Button>
            </>
          )}
          {step === 4 && (
            <Button onClick={handleClose} className="w-full">
              Done
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
