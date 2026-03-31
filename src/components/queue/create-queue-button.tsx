'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { createQueueAction } from '@/app/actions/queue';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function CreateQueueButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setPending(true);
    setError(null);

    try {
      const result = await createQueueAction(formData);
      if (result.success && result.queueId) {
        setOpen(false);
        router.push(`/admin/queue/${result.queueId}`);
        router.refresh();
      } else {
        setError(result.error || 'Failed to create queue');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create New Queue
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Queue</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Queue Name (optional)
              </label>
              <Input
                id="name"
                name="name"
                placeholder="e.g., Main Counter Queue"
                disabled={pending}
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={pending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? 'Creating...' : 'Create Queue'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
