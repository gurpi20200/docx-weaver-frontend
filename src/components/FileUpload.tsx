import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface UploadedFile {
  file: File;
  id: string;
  status: 'pending' | 'uploading' | 'converting' | 'completed' | 'error';
  progress: number;
  downloadUrl?: string;
  error?: string;
}

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  uploadedFiles: UploadedFile[];
  onRemoveFile: (id: string) => void;
  className?: string;
}

export function FileUpload({ 
  onFilesSelected, 
  uploadedFiles, 
  onRemoveFile, 
  className 
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const htmlFiles = acceptedFiles.filter(file => 
      file.type === 'text/html' || file.name.endsWith('.html')
    );
    
    if (htmlFiles.length > 0) {
      onFilesSelected(htmlFiles);
    }
  }, [onFilesSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/html': ['.html', '.htm']
    },
    multiple: true,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
  });

  return (
    <div className={cn("space-y-6", className)}>
      {/* Upload Zone */}
      <Card
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer",
          "p-8 text-center bg-card hover:bg-accent/20",
          (isDragActive || dragActive) && "border-primary bg-primary/5"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center space-y-4">
          <div className={cn(
            "h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center",
            (isDragActive || dragActive) && "bg-primary/20"
          )}>
            <Upload className={cn(
              "h-8 w-8 text-primary",
              (isDragActive || dragActive) && "text-primary animate-pulse"
            )} />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">
              {isDragActive ? 'Drop HTML files here' : 'Upload HTML Files'}
            </h3>
            <p className="text-sm text-muted-foreground">
              Drag and drop your HTML files here, or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              Supports multiple files • .html, .htm formats only
            </p>
          </div>
          
          <Button variant="outline" type="button" className="mt-4">
            Choose Files
          </Button>
        </div>
      </Card>

      {/* File List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">
            Files ({uploadedFiles.length})
          </h4>
          
          <div className="space-y-2">
            {uploadedFiles.map((uploadedFile) => (
              <Card key={uploadedFile.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <File className="h-5 w-5 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {uploadedFile.file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(uploadedFile.file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <StatusBadge status={uploadedFile.status} />
                    {uploadedFile.status === 'pending' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveFile(uploadedFile.id)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* Progress Bar */}
                {(uploadedFile.status === 'uploading' || uploadedFile.status === 'converting') && (
                  <div className="mt-3 w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadedFile.progress}%` }}
                    />
                  </div>
                )}
                
                {/* Error Message */}
                {uploadedFile.status === 'error' && uploadedFile.error && (
                  <p className="mt-2 text-xs text-destructive">
                    {uploadedFile.error}
                  </p>
                )}
                
                {/* Download Link */}
                {uploadedFile.status === 'completed' && uploadedFile.downloadUrl && (
                  <div className="mt-3">
                    <Button variant="outline" size="sm" asChild>
                      <a href={uploadedFile.downloadUrl} download>
                        Download DOCX
                      </a>
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: UploadedFile['status'] }) {
  const styles = {
    pending: 'bg-muted text-muted-foreground',
    uploading: 'bg-primary/10 text-primary',
    converting: 'bg-warning/10 text-warning',
    completed: 'bg-success/10 text-success',
    error: 'bg-destructive/10 text-destructive',
  };

  const labels = {
    pending: 'Pending',
    uploading: 'Uploading',
    converting: 'Converting',
    completed: 'Completed',
    error: 'Error',
  };

  return (
    <span className={cn(
      'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
      styles[status]
    )}>
      {labels[status]}
    </span>
  );
}