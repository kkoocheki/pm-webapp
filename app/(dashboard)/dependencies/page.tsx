import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Maximize2 } from 'lucide-react';

export default function DependenciesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dependencies</h1>
          <p className="text-muted-foreground">
            Explore task relationships and critical paths
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Maximize2 className="mr-2 h-4 w-4" />
            Full Screen
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dependency Graph</CardTitle>
          <CardDescription>
            Interactive graph showing task dependencies using SPARQL reasoning
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-96 items-center justify-center rounded-lg border-2 border-dashed">
            <div className="text-center">
              <p className="text-sm font-medium">Dependency Graph Component</p>
              <p className="text-xs text-muted-foreground">
                Will be implemented in Phase 4 using reactflow
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Critical Path</CardTitle>
            <CardDescription>Tasks that directly impact project timeline</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Critical path analysis will be calculated using SPARQL reasoning
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Blocked Tasks</CardTitle>
            <CardDescription>Tasks waiting on dependencies</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Blocked tasks will be identified through dependency queries
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
