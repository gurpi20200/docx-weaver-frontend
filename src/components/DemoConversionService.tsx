// Demo/Mock service for demonstration purposes when backend is not available
import { ConversionJob } from './ConversionService';

export class DemoConversionService {
  private static jobs = new Map<string, ConversionJob>();

  static async uploadFile(file: File): Promise<{ jobId: string }> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    
    const jobId = `demo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create initial job
    const job: ConversionJob = {
      jobId,
      status: 'uploading',
      progress: 0,
    };
    
    this.jobs.set(jobId, job);
    
    // Simulate conversion process
    this.simulateConversion(jobId, file);
    
    return { jobId };
  }

  static async getJobStatus(jobId: string): Promise<ConversionJob> {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error('Job not found');
    }
    return { ...job };
  }

  private static async simulateConversion(jobId: string, file: File) {
    const job = this.jobs.get(jobId);
    if (!job) return;

    // Simulate upload progress
    for (let i = 10; i <= 60; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      job.progress = i;
      if (i === 60) {
        job.status = 'converting';
      }
    }

    // Simulate conversion progress
    for (let i = 70; i <= 90; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 300));
      job.progress = i;
    }

    // Final step - simulate success or occasional failure
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 95% success rate for demo
    const isSuccess = Math.random() > 0.05;
    
    if (isSuccess) {
      job.status = 'completed';
      job.progress = 100;
      job.downloadUrl = this.generateDemoDownloadUrl(file.name);
    } else {
      job.status = 'error';
      job.error = 'Demo conversion failed (simulated error)';
    }
  }

  private static generateDemoDownloadUrl(fileName: string): string {
    // Generate a blob URL for demo download
    const docxFileName = fileName.replace(/\.html?$/i, '.docx');
    const demoContent = `Demo DOCX file generated from ${fileName}`;
    const blob = new Blob([demoContent], { type: 'application/octet-stream' });
    return URL.createObjectURL(blob);
  }

  static async pollJobStatus(
    jobId: string,
    onUpdate: (job: ConversionJob) => void,
    intervalMs = 1000
  ): Promise<ConversionJob> {
    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          const job = await this.getJobStatus(jobId);
          onUpdate(job);

          if (job.status === 'completed' || job.status === 'error') {
            resolve(job);
          } else {
            setTimeout(poll, intervalMs);
          }
        } catch (error) {
          reject(error);
        }
      };

      poll();
    });
  }
}