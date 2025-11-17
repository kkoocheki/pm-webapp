import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Sparkles } from 'lucide-react';

export default function InsightsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Insights</h1>
          <p className="text-muted-foreground">
            AI-powered recommendations based on RDF reasoning
          </p>
        </div>
        <Button>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Insights
        </Button>
      </div>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <CardTitle className="text-blue-900 dark:text-blue-100">
              AI Reasoning Engine
            </CardTitle>
          </div>
          <CardDescription className="text-blue-700 dark:text-blue-300">
            Powered by OWL 2 RL reasoning on your RDF knowledge graph
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Insights will include:
            </h4>
            <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
              <li>• Risk analysis (delayed tasks, resource conflicts)</li>
              <li>• Critical path recommendations</li>
              <li>• Resource optimization suggestions</li>
              <li>• Dependency conflict detection</li>
              <li>• Timeline predictions using transitive reasoning</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Insights</CardTitle>
            <CardDescription>Latest AI recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              AI insights will be generated in Phase 4
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>SPARQL Queries</CardTitle>
            <CardDescription>Reasoning queries executed</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Query metrics and performance data will appear here
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
