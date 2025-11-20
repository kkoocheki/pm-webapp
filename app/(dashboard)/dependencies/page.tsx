'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Maximize2, TrendingUp, AlertTriangle, Loader2 } from 'lucide-react';
import { useCriticalPath } from '@/lib/hooks/use-advanced-features';
import { DEFAULT_PROJECT_SLUG } from '@/lib/api/config';

export default function DependenciesPage() {
  const { data: criticalPath, isLoading, error, refetch } = useCriticalPath(DEFAULT_PROJECT_SLUG);

  const criticalTasks = criticalPath?.critical_path || [];
  const criticalCount = criticalTasks.filter(t => t.is_critical).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dependencies & Critical Path</h1>
          <p className="text-muted-foreground">
            Critical Path Method (CPM) analysis from RDF knowledge graph
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <TrendingUp className="mr-2 h-4 w-4" />
            Refresh Analysis
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {criticalPath?.total_duration ? `${criticalPath.total_duration.toFixed(1)} days` : '-'}
            </div>
            <p className="text-xs text-muted-foreground">Project length</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Critical Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalCount}</div>
            <p className="text-xs text-muted-foreground">Zero float tasks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Start Date</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {criticalPath?.project_start ? new Date(criticalPath.project_start).toLocaleDateString() : '-'}
            </div>
            <p className="text-xs text-muted-foreground">Project start</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">End Date</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {criticalPath?.project_end ? new Date(criticalPath.project_end).toLocaleDateString() : '-'}
            </div>
            <p className="text-xs text-muted-foreground">Project end</p>
          </CardContent>
        </Card>
      </div>

      {/* Critical Path Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Critical Path Tasks</CardTitle>
          <CardDescription>
            Tasks with zero float that directly impact project completion
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin" />
                <p>Calculating critical path...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-md">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-medium text-red-900">Failed to load critical path</p>
                <p className="text-sm text-red-700">
                  {error instanceof Error ? error.message : 'Unknown error'}
                </p>
              </div>
            </div>
          ) : criticalTasks.length > 0 ? (
            <div className="space-y-3">
              {criticalTasks.map((task) => (
                <div
                  key={task.iri}
                  className={`flex items-start gap-4 p-3 border rounded-lg ${
                    task.is_critical ? 'border-red-300 bg-red-50' : 'bg-white'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{task.name}</p>
                      {task.is_critical && (
                        <Badge variant="destructive" className="text-xs">
                          Critical
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">Duration:</span> {task.duration} days
                      </div>
                      <div>
                        <span className="font-medium">Early Start:</span> Day {task.early_start.toFixed(0)}
                      </div>
                      <div>
                        <span className="font-medium">Early Finish:</span> Day {task.early_finish.toFixed(0)}
                      </div>
                      <div>
                        <span className="font-medium">Total Float:</span>{' '}
                        <span className={task.total_float === 0 ? 'text-red-600 font-bold' : ''}>
                          {task.total_float.toFixed(1)} days
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm text-muted-foreground mt-1">
                      <div>
                        <span className="font-medium">Late Start:</span> Day {task.late_start.toFixed(0)}
                      </div>
                      <div>
                        <span className="font-medium">Late Finish:</span> Day {task.late_finish.toFixed(0)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>No critical path data available</p>
              <p className="text-sm">Make sure your project has tasks with dates and dependencies</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Understanding the Critical Path</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <strong>Critical Path:</strong> The sequence of tasks that determines the minimum project duration. Any delay in these tasks will delay the entire project.
          </p>
          <p>
            <strong>Total Float:</strong> The amount of time a task can be delayed without delaying the project. Critical tasks have zero float.
          </p>
          <p>
            <strong>Early Start/Finish:</strong> The earliest times a task can start and finish based on dependencies.
          </p>
          <p>
            <strong>Late Start/Finish:</strong> The latest times a task can start and finish without delaying the project.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
