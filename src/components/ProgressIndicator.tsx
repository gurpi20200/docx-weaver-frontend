import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
  status: 'pending' | 'uploading' | 'converting' | 'completed' | 'error';
  progress?: number;
  className?: string;
}

export function ProgressIndicator({ status, progress = 0, className }: ProgressIndicatorProps) {
  const renderIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      case 'uploading':
      case 'converting':
        return <Loader2 className="h-5 w-5 text-primary animate-spin" />;
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-muted" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'pending':
        return 'Waiting to upload';
      case 'uploading':
        return `Uploading ${progress}%`;
      case 'converting':
        return `Converting ${progress}%`;
      case 'completed':
        return 'Conversion complete';
      case 'error':
        return 'Conversion failed';
    }
  };

  return (
    <div className={cn("flex items-center space-x-3", className)}>
      {renderIcon()}
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">
          {getStatusText()}
        </p>
        {(status === 'uploading' || status === 'converting') && (
          <div className="mt-1 w-full bg-secondary rounded-full h-1.5">
            <div
              className="bg-primary h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}