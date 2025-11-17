import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, ZoomIn, ZoomOut } from 'lucide-react';

export default function TimelinePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Timeline</h1>
          <p className="text-muted-foreground">
            Visualize project schedule with Gantt chart
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gantt Chart</CardTitle>
          <CardDescription>
            Interactive timeline showing task schedules and dependencies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed">
            <div className="text-center">
              <p className="text-sm font-medium">Gantt Chart Component</p>
              <p className="text-xs text-muted-foreground">
                Will be implemented in Phase 3 using react-gantt-chart
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
