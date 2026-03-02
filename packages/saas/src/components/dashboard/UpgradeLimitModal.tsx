import { Link } from 'react-router-dom';
import { Sparkles, Rocket, ArrowRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface UpgradeLimitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlan: string;
  limit: number;
  resource: string;
}

export function UpgradeLimitModal({
  open,
  onOpenChange,
  currentPlan,
  limit,
  resource,
}: UpgradeLimitModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            Upgrade to Add More {resource}
          </DialogTitle>
          <DialogDescription>
            You've reached the {limit} {resource.toLowerCase()} limit on your {currentPlan} plan.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Rocket className="h-4 w-4 text-primary" />
              <span className="font-medium">Unlock more with a paid plan:</span>
            </div>
            <ul className="text-sm text-muted-foreground space-y-2 ml-6">
              <li>• <strong>Solo ($9/mo)</strong> — Up to 3 sites</li>
              <li>• <strong>Pro ($29/mo)</strong> — Up to 10 sites</li>
              <li>• <strong>Agency ($99/mo)</strong> — Up to 50 sites</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Maybe Later
          </Button>
          <Button asChild>
            <Link to="/pricing" className="gap-2">
              View Plans
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
