'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileUp, Settings, ExternalLink, Upload } from 'lucide-react';
import { ImportDialog } from '@/components/import-dialog';
import { JiraImportDialog } from '@/components/jira-import-dialog';
import { GitHubImportDialog } from '@/components/github-import-dialog';
import { AsanaImportDialog } from '@/components/asana-import-dialog';
import { useState } from 'react';

export default function ImportPage() {
  const [ttlDialogOpen, setTtlDialogOpen] = useState(false);
  const [jiraDialogOpen, setJiraDialogOpen] = useState(false);
  const [githubDialogOpen, setGithubDialogOpen] = useState(false);
  const [asanaDialogOpen, setAsanaDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Import Projects</h1>
        <p className="text-muted-foreground">
          Import projects from various sources into your RDF knowledge graph
        </p>
      </div>

      {/* Import Options */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* TTL File Import */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                  <FileUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle>RDF Turtle File</CardTitle>
                  <CardDescription>Import from .ttl file</CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Upload a Turtle (.ttl) RDF file containing your project structure, tasks, and
              dependencies. Perfect for migrating existing RDF data or restoring backups.
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                Supports PM Ontology + Scrum Reference Ontology
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                Preserves all RDF triples and relationships
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                Instant import with validation
              </li>
            </ul>
            <ImportDialog
              trigger={
                <Button className="w-full">
                  <Upload className="mr-2 h-4 w-4" />
                  Import TTL File
                </Button>
              }
            />
          </CardContent>
        </Card>

        {/* Jira Import */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer group border-orange-200 dark:border-orange-900">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg group-hover:bg-orange-200 dark:group-hover:bg-orange-800 transition-colors">
                  <svg
                    className="h-6 w-6 text-orange-600 dark:text-orange-400"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M11.5 0L0 11.5l3.5 3.5 8-8 8 8 3.5-3.5L11.5 0zM11.5 9L7 13.5l4.5 4.5 4.5-4.5L11.5 9z" />
                  </svg>
                </div>
                <div>
                  <CardTitle>Jira</CardTitle>
                  <CardDescription>Import from Atlassian Jira</CardDescription>
                </div>
              </div>
              <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900 px-2 py-1 rounded">
                Active
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Connect to your Jira instance and import projects, epics, stories, tasks, and
              sprints. Preserves all relationships and metadata.
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-600" />
                Import epics, stories, tasks, and subtasks
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-600" />
                Preserve sprints and dependencies
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-600" />
                Automatic SRO ontology mapping
              </li>
            </ul>
            <JiraImportDialog
              trigger={
                <Button className="w-full" variant="default">
                  <Settings className="mr-2 h-4 w-4" />
                  Connect to Jira
                </Button>
              }
            />
          </CardContent>
        </Card>

        {/* GitHub Import */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer group opacity-75">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors">
                  <svg
                    className="h-6 w-6 text-gray-700 dark:text-gray-400"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </div>
                <div>
                  <CardTitle>GitHub</CardTitle>
                  <CardDescription>Import from GitHub</CardDescription>
                </div>
              </div>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                Coming Soon
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Import issues and pull requests from GitHub repositories. Convert milestones to
              sprints and track development progress.
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                Import issues as tasks
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                Track pull requests as work items
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                Sync milestones and labels
              </li>
            </ul>
            <GitHubImportDialog
              trigger={
                <Button className="w-full" variant="outline" disabled>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Coming Soon
                </Button>
              }
            />
          </CardContent>
        </Card>

        {/* Asana Import */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer group opacity-75">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-pink-100 dark:bg-pink-900 rounded-lg group-hover:bg-pink-200 dark:group-hover:bg-pink-800 transition-colors">
                  <svg
                    className="h-6 w-6 text-pink-600 dark:text-pink-400"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                </div>
                <div>
                  <CardTitle>Asana</CardTitle>
                  <CardDescription>Import from Asana</CardDescription>
                </div>
              </div>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                Coming Soon
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Import projects and tasks from Asana workspaces. Preserve custom fields, sections,
              and team assignments.
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                Import projects and sections
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                Sync custom fields and metadata
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                Preserve task dependencies
              </li>
            </ul>
            <AsanaImportDialog
              trigger={
                <Button className="w-full" variant="outline" disabled>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Coming Soon
                </Button>
              }
            />
          </CardContent>
        </Card>
      </div>

      {/* Information Card */}
      <Card className="border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-100">
            About RDF Import
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-900 dark:text-blue-100 space-y-2">
          <p>
            All imported data is stored as RDF triples in Apache Jena Fuseki, enabling powerful
            semantic queries and reasoning capabilities.
          </p>
          <p>
            The import process automatically maps external data formats to the PM Ontology and
            Scrum Reference Ontology (SRO), preserving relationships and enabling advanced
            analytics.
          </p>
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs font-medium bg-blue-200 dark:bg-blue-900 px-2 py-1 rounded">
              PM Ontology
            </span>
            <span className="text-xs font-medium bg-blue-200 dark:bg-blue-900 px-2 py-1 rounded">
              Scrum Reference Ontology
            </span>
            <span className="text-xs font-medium bg-blue-200 dark:bg-blue-900 px-2 py-1 rounded">
              OWL 2 RL Reasoning
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
