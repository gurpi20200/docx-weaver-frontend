import { useState, useCallback } from 'react';
import { FileUpload, UploadedFile } from '@/components/FileUpload';
import { ConversionService } from '@/components/ConversionService';
import { DemoConversionService } from '@/components/DemoConversionService';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, Download, RefreshCw, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(true); // Use demo mode by default
  const { toast } = useToast();

  const handleFilesSelected = useCallback((files: File[]) => {
    const newFiles: UploadedFile[] = files.map(file => ({
      file,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending',
      progress: 0,
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
  }, []);

  const handleRemoveFile = useCallback((id: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== id));
  }, []);

  const updateFileStatus = useCallback((id: string, updates: Partial<UploadedFile>) => {
    setUploadedFiles(prev => prev.map(file => 
      file.id === id ? { ...file, ...updates } : file
    ));
  }, []);

  const handleConvertFiles = useCallback(async () => {
    const pendingFiles = uploadedFiles.filter(file => file.status === 'pending');
    
    if (pendingFiles.length === 0) {
      toast({
        title: "No files to convert",
        description: "Please add some HTML files first.",
        variant: "destructive",
      });
      return;
    }

    setIsConverting(true);

    try {
      // Process files sequentially for better user experience
      for (const uploadedFile of pendingFiles) {
        try {
          // Update status to uploading
          updateFileStatus(uploadedFile.id, { status: 'uploading', progress: 0 });

          // Simulate upload progress
          for (let i = 0; i <= 50; i += 10) {
            updateFileStatus(uploadedFile.id, { progress: i });
            await new Promise(resolve => setTimeout(resolve, 100));
          }

          // Choose service based on mode
          const service = isDemoMode ? DemoConversionService : ConversionService;
          
          // Upload file
          const { jobId } = await service.uploadFile(uploadedFile.file);
          
          // Update status to converting
          updateFileStatus(uploadedFile.id, { status: 'converting', progress: 60 });

          // Poll for status updates
          await service.pollJobStatus(
            jobId,
            (job) => {
              updateFileStatus(uploadedFile.id, {
                status: job.status,
                progress: job.progress,
                downloadUrl: job.downloadUrl,
                error: job.error,
              });
            }
          );

        } catch (error) {
          updateFileStatus(uploadedFile.id, {
            status: 'error',
            error: error instanceof Error ? error.message : 'Conversion failed',
          });
          
          toast({
            title: "Conversion failed",
            description: `Failed to convert ${uploadedFile.file.name}`,
            variant: "destructive",
          });
        }
      }

      const successCount = uploadedFiles.filter(f => f.status === 'completed').length;
      if (successCount > 0) {
        toast({
          title: "Conversion complete!",
          description: `Successfully converted ${successCount} file(s) to DOCX format.`,
        });
      }

    } finally {
      setIsConverting(false);
    }
  }, [uploadedFiles, updateFileStatus, toast, isDemoMode]);

  const handleClearAll = useCallback(() => {
    setUploadedFiles([]);
  }, []);

  const completedFiles = uploadedFiles.filter(file => file.status === 'completed');
  const hasErrors = uploadedFiles.some(file => file.status === 'error');
  const canConvert = uploadedFiles.some(file => file.status === 'pending') && !isConverting;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Demo Mode Alert */}
      {isDemoMode && (
        <Card className="p-4 bg-warning/5 border-warning/20">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-warning mt-0.5 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-foreground">Demo Mode Active</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDemoMode(false)}
                  className="text-xs"
                >
                  Use Real API
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Currently running in demo mode with simulated conversions. 
                To use the actual Flask backend, click "Use Real API" and ensure your backend is running on localhost:5000.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">
          HTML to DOCX Converter
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Convert your HTML files to professional DOCX documents instantly. 
          Upload multiple files and download them as Word-compatible documents.
        </p>
      </div>

      {/* Main Upload Section */}
      <FileUpload
        onFilesSelected={handleFilesSelected}
        uploadedFiles={uploadedFiles}
        onRemoveFile={handleRemoveFile}
      />

      {/* Action Buttons */}
      {uploadedFiles.length > 0 && (
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="space-y-1">
              <h3 className="font-medium text-foreground">Ready to convert</h3>
              <p className="text-sm text-muted-foreground">
                {uploadedFiles.length} file(s) • {completedFiles.length} completed
                {hasErrors && ` • Some files failed`}
              </p>
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto">
              <Button 
                variant="outline" 
                onClick={handleClearAll}
                disabled={isConverting}
                className="flex-1 sm:flex-none"
              >
                Clear All
              </Button>
              
              <Button
                onClick={handleConvertFiles}
                disabled={!canConvert}
                className="flex-1 sm:flex-none"
              >
                {isConverting ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Converting...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Convert to DOCX
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Status Summary */}
      {uploadedFiles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                <span className="text-lg font-semibold text-muted-foreground">
                  {uploadedFiles.length}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Total Files</p>
                <p className="text-xs text-muted-foreground">Uploaded for conversion</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Completed</p>
                <p className="text-xs text-muted-foreground">
                  {completedFiles.length} successful conversions
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Errors</p>
                <p className="text-xs text-muted-foreground">
                  {uploadedFiles.filter(f => f.status === 'error').length} failed conversions
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Getting Started Guide */}
      {uploadedFiles.length === 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">How it works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <span className="text-lg font-semibold text-primary">1</span>
              </div>
              <h4 className="font-medium text-foreground">Upload HTML Files</h4>
              <p className="text-sm text-muted-foreground">
                Drag and drop or select your HTML files to upload
              </p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <span className="text-lg font-semibold text-primary">2</span>
              </div>
              <h4 className="font-medium text-foreground">Convert to DOCX</h4>
              <p className="text-sm text-muted-foreground">
                Click convert and watch the progress in real-time
              </p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <span className="text-lg font-semibold text-primary">3</span>
              </div>
              <h4 className="font-medium text-foreground">Download Results</h4>
              <p className="text-sm text-muted-foreground">
                Download your converted DOCX files instantly
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Index;
