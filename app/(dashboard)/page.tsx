import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ListTodo, GanttChart, Network, Sparkles } from 'lucide-react';

export default function DashboardPage() {
  const stats = [
    {
      title: 'Total Tasks',
      value: '24',
      description: '8 in progress',
      icon: ListTodo,
    },
    {
      title: 'Timeline Health',
      value: '85%',
      description: 'On track',
      icon: GanttChart,
    },
    {
      title: 'Dependencies',
      value: '12',
      description: '2 blocked',
      icon: Network,
    },
    {
      title: 'AI Insights',
      value: '3',
      description: 'New recommendations',
      icon: Sparkles,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your RDF-powered project management system
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Start</CardTitle>
          <CardDescription>
            Get started with your RDF project management system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Navigate to <strong>Issues</strong> to view and manage tasks</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Check <strong>Timeline</strong> for Gantt chart visualization</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Explore <strong>Dependencies</strong> to see task relationships</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Visit <strong>Insights</strong> for AI-powered recommendations</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
