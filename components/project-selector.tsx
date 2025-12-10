'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useProjectList } from '@/lib/hooks/use-project-data';
import { useUIStore } from '@/lib/stores/app-store';

interface ProjectSelectorProps {
  value?: string;
  onChange?: (slug: string) => void;
  className?: string;
}

export function ProjectSelector({ value, onChange, className }: ProjectSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  const { data: projects, isLoading } = useProjectList();
  
  // Get current project from Zustand store
  const currentProjectSlug = useUIStore((state) => state.currentProjectSlug);
  const setCurrentProjectSlug = useUIStore((state) => state.setCurrentProjectSlug);
  
  // Use prop value if provided, otherwise use store
  const effectiveProjectSlug = value || currentProjectSlug;
  const currentProject = projects?.find((p) => p.slug === effectiveProjectSlug);

  const handleSelect = (slug: string) => {
    setOpen(false);

    if (onChange) {
      onChange(slug);
    } else {
      // Update Zustand store - this will trigger re-renders in all pages using the current project
      setCurrentProjectSlug(slug);
      router.refresh();
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between', className)}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : currentProject ? (
            <span className="truncate">{currentProject.name}</span>
          ) : (
            <span className="text-muted-foreground">Select project...</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search projects..." />
          <CommandList>
            <CommandEmpty>No project found.</CommandEmpty>
            <CommandGroup>
              {projects?.map((project) => (
                <CommandItem
                  key={project.slug}
                  value={project.slug}
                  onSelect={() => handleSelect(project.slug)}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      effectiveProjectSlug === project.slug ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{project.name}</span>
                    <span className="text-xs text-muted-foreground">{project.slug}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
