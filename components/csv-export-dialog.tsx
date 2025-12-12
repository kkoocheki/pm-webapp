'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api/services';
import { DEFAULT_PROJECT_SLUG } from '@/lib/api/config';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Download, CheckCircle, AlertCircle } from 'lucide-react';

interface CsvExportDialogProps {
  trigger?: React.ReactNode;
  projectSlug?: string;
}

export function CsvExportDialog({ trigger, projectSlug = DEFAULT_PROJECT_SLUG }: CsvExportDialogProps) {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<'linear' | 'jira'>('linear');

  const exportMutation = useMutation({
    mutationFn: async (params: { projectSlug: string; format: 'linear' | 'jira' }) => {
      return api.import.exportCsv(params.projectSlug, params.format);
    },
    onSuccess: (blob) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectSlug}_${format}_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setTimeout(() => {
        setOpen(false);
      }, 2000);
    },
  });

  const handleExport = async () => {
    try {
      await exportMutation.mutateAsync({ projectSlug, format });
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Export to CSV</DialogTitle>
          <DialogDescription>
            Export your project data to CSV format compatible with Linear or Jira.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Format Selection */}
          <div className="grid gap-3">
            <Label>Export Format</Label>
            <RadioGroup value={format} onValueChange={(value) => setFormat(value as 'linear' | 'jira')}>
              <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="linear" id="linear" />
                <Label htmlFor="linear" className="flex-1 cursor-pointer">
                  <div className="font-medium">Linear Format</div>
                  <div className="text-sm text-muted-foreground">
                    Export in Linear-compatible CSV format
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="jira" id="jira" />
                <Label htmlFor="jira" className="flex-1 cursor-pointer">
                  <div className="font-medium">Jira Format</div>
                  <div className="text-sm text-muted-foreground">
                    Export in Jira-compatible CSV format
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Column Compatibility Info */}
          <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-900 rounded-md">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              The export includes all compatible columns from your project data, mapped to the selected format.
              {format === 'linear' && ' Linear exports include: ID, Title, Description, Status, Priority, Assignee, Dates, Sprints, and more.'}
              {format === 'jira' && ' Jira exports include: Summary, Issue Type, Status, Priority, Sprint, Story Points, and all custom fields.'}
            </p>
          </div>

          {/* Status Messages */}
          {exportMutation.isSuccess && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div className="text-sm">
                <p className="font-medium text-green-900">Export Successful!</p>
                <p className="text-green-700">Your CSV file has been downloaded.</p>
              </div>
            </div>
          )}

          {exportMutation.isError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div className="text-sm">
                <p className="font-medium text-red-900">Export Failed</p>
                <p className="text-red-700">
                  {exportMutation.error instanceof Error
                    ? exportMutation.error.message
                    : 'Unknown error occurred'}
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={exportMutation.isPending}>
            <Download className="mr-2 h-4 w-4" />
            {exportMutation.isPending ? 'Exporting...' : 'Export CSV'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
