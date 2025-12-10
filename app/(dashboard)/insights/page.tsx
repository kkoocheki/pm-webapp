'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Sparkles, AlertTriangle, CheckCircle, Info, Loader2 } from 'lucide-react';
import {
  useApplyReasoning,
  useTaskStatus,
  useInferenceRules,
  useUserStoryStatus,
  useReasoningHealth
} from '@/lib/hooks/use-advanced-features';
import { useUIStore } from '@/lib/stores/app-store';
import { useState } from 'react';

export default function InsightsPage() {
  // Get current project from Zustand store
  const currentProjectSlug = useUIStore((state) => state.currentProjectSlug);
  
  const [reasonerType, setReasonerType] = useState<'rdfs' | 'owl_dl' | 'owl_full' | 'jena_rules' | 'combined'>('combined');

  const applyReasoningMutation = useApplyReasoning();
  const { data: taskStatus, isLoading: tasksLoading, refetch: refetchTasks } = useTaskStatus(currentProjectSlug);
  const { data: storyStatus, isLoading: storiesLoading, refetch: refetchStories } = useUserStoryStatus(currentProjectSlug);
  const { data: rules, isLoading: rulesLoading } = useInferenceRules();
  const { data: health } = useReasoningHealth();

  const handleRunReasoning = async () => {
    try {
      await applyReasoningMutation.mutateAsync({
        project_slug: currentProjectSlug,
        reasoner_type: reasonerType,
      });
      // Refetch insights after reasoning
      refetchTasks();
      refetchStories();
    } catch (error) {
      console.error('Reasoning failed:', error);
    }
  };

  const criticalTasks = taskStatus?.filter(t => t.is_critical) || [];
  const blockedTasks = taskStatus?.filter(t => t.is_blocked) || [];
  const doneStories = storyStatus?.filter(s => s.is_done) || [];
  const technicalDebtStories = storyStatus?.filter(s => s.has_technical_debt) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Insights</h1>
          <p className="text-muted-foreground">
            Semantic reasoning-powered recommendations
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleRunReasoning}
            disabled={applyReasoningMutation.isPending}
          >
            {applyReasoningMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Run Reasoning
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Reasoning Engine Status */}
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <CardTitle className="text-blue-900 dark:text-blue-100">
                Semantic Reasoning Engine
              </CardTitle>
            </div>
            {health && (
              <Badge variant={health.status === 'healthy' ? 'default' : 'destructive'}>
                {health.status}
              </Badge>
            )}
          </div>
          <CardDescription className="text-blue-700 dark:text-blue-300">
            OWL 2 RL + RDFS + Jena Rules reasoning on RDF knowledge graph
          </CardDescription>
        </CardHeader>
        <CardContent>
          {applyReasoningMutation.isSuccess && (
            <div className="space-y-2 p-3 bg-white dark:bg-blue-900 rounded-md">
              <p className="text-sm font-medium">Last Reasoning Run:</p>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Total Triples</p>
                  <p className="font-bold">{applyReasoningMutation.data.total_triples}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Inferred</p>
                  <p className="font-bold">{applyReasoningMutation.data.inferred_triples}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Reasoner</p>
                  <p className="font-bold capitalize">{applyReasoningMutation.data.reasoner_type}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Key Insights */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Critical Path Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{criticalTasks.length}</div>
            <p className="text-xs text-muted-foreground">
              Zero float, on critical path
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Blocked Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{blockedTasks.length}</div>
            <p className="text-xs text-muted-foreground">
              Waiting on dependencies
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Done Stories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{doneStories.length}</div>
            <p className="text-xs text-muted-foreground">
              Accepted deliverables
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Technical Debt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{technicalDebtStories.length}</div>
            <p className="text-xs text-muted-foreground">
              Stories with issues
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Blocked Tasks */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <CardTitle>Blocked Tasks</CardTitle>
            </div>
            <CardDescription>Tasks waiting on dependencies</CardDescription>
          </CardHeader>
          <CardContent>
            {tasksLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </div>
            ) : blockedTasks.length > 0 ? (
              <div className="space-y-3">
                {blockedTasks.slice(0, 5).map((task) => (
                  <div key={task.iri} className="flex items-start gap-2 p-2 border rounded">
                    <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{task.name || 'Unnamed Task'}</p>
                      <p className="text-xs text-muted-foreground">
                        Blocked by {task.blocked_by.length} task(s)
                      </p>
                    </div>
                  </div>
                ))}
                {blockedTasks.length > 5 && (
                  <p className="text-xs text-muted-foreground text-center">
                    +{blockedTasks.length - 5} more blocked tasks
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No blocked tasks detected</p>
            )}
          </CardContent>
        </Card>

        {/* Critical Path Tasks */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-600" />
              <CardTitle>Critical Path</CardTitle>
            </div>
            <CardDescription>Tasks with zero float</CardDescription>
          </CardHeader>
          <CardContent>
            {tasksLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </div>
            ) : criticalTasks.length > 0 ? (
              <div className="space-y-3">
                {criticalTasks.slice(0, 5).map((task) => (
                  <div key={task.iri} className="flex items-start gap-2 p-2 border rounded">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{task.name || 'Unnamed Task'}</p>
                      <p className="text-xs text-muted-foreground">
                        Float: {task.total_float?.toFixed(2) || '0.00'} days
                      </p>
                    </div>
                    <Badge variant="destructive" className="text-xs">Critical</Badge>
                  </div>
                ))}
                {criticalTasks.length > 5 && (
                  <p className="text-xs text-muted-foreground text-center">
                    +{criticalTasks.length - 5} more critical tasks
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No critical path tasks</p>
            )}
          </CardContent>
        </Card>

        {/* User Stories Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <CardTitle>Done User Stories</CardTitle>
            </div>
            <CardDescription>Stories with accepted deliverables</CardDescription>
          </CardHeader>
          <CardContent>
            {storiesLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </div>
            ) : doneStories.length > 0 ? (
              <div className="space-y-3">
                {doneStories.slice(0, 5).map((story) => (
                  <div key={story.iri} className="flex items-start gap-2 p-2 border rounded">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{story.name || 'Unnamed Story'}</p>
                      {story.story_points && (
                        <p className="text-xs text-muted-foreground">
                          {story.story_points} story points
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {doneStories.length > 5 && (
                  <p className="text-xs text-muted-foreground text-center">
                    +{doneStories.length - 5} more done stories
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No completed stories yet</p>
            )}
          </CardContent>
        </Card>

        {/* Inference Rules */}
        <Card>
          <CardHeader>
            <CardTitle>Inference Rules</CardTitle>
            <CardDescription>Active reasoning rules</CardDescription>
          </CardHeader>
          <CardContent>
            {rulesLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </div>
            ) : rules && rules.length > 0 ? (
              <div className="space-y-2">
                {rules.slice(0, 4).map((rule, idx) => (
                  <div key={idx} className="text-sm">
                    <p className="font-medium">{rule.name}</p>
                    <p className="text-xs text-muted-foreground">{rule.description}</p>
                  </div>
                ))}
                {rules.length > 4 && (
                  <p className="text-xs text-muted-foreground text-center">
                    +{rules.length - 4} more rules
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No rules configured</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
