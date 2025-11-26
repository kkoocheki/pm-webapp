'use client';

/**
 * Data Loader Component
 * Fetches project data from the backend and populates the Zustand store
 * This ensures all views (Kanban, Task Table, Gantt) share the same data
 */

import { useEffect } from 'react';
import { useProjectData } from '@/lib/hooks/use-project-data';
import { DEFAULT_PROJECT_SLUG } from '@/lib/api/config';

interface DataLoaderProps {
  projectSlug?: string;
  children: React.ReactNode;
}

export function DataLoader({ projectSlug = DEFAULT_PROJECT_SLUG, children }: DataLoaderProps) {
  const { data, isLoading, error, refetch } = useProjectData(projectSlug);

  useEffect(() => {
    // Refetch on mount
    refetch();
  }, [refetch]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <p className="text-destructive">Failed to load project data</p>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : 'Unknown error'}
          </p>
          <p className="text-xs text-muted-foreground">
            Make sure the backend is running at {process.env.NEXT_PUBLIC_API_BASE_URL}
          </p>
        </div>
      </div>
    );
  }

  // Show loading state only on initial load, not on refetch
  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-sm text-muted-foreground">Loading project data...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
