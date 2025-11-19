<<<<<<< HEAD
=======
import { GanttChart } from '@/components/gantt-chart';
>>>>>>> f829b6cdc5257b08e6fabe1bfe02eacfa1ed44fc
import { Button } from '@/components/ui/button';
import { Download, ZoomIn, ZoomOut } from 'lucide-react';
import { GanttChart } from '@/components/gantt-chart';

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

<<<<<<< HEAD
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Gantt Chart</h2>
          <p className="text-sm text-muted-foreground">
            Interactive timeline showing task schedules and dependencies
          </p>
        </div>
        <div className="rounded-lg border bg-card overflow-hidden">
          <GanttChart />
        </div>
      </div>
=======
      <GanttChart />
>>>>>>> f829b6cdc5257b08e6fabe1bfe02eacfa1ed44fc
    </div>
  );
}
