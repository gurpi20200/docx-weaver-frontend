// API service for handling file conversion
export interface ConversionJob {
  jobId: string;
  status: 'pending' | 'uploading' | 'converting' | 'completed' | 'error';
  progress: number;
  downloadUrl?: string;
  error?: string;
}

const API_BASE_URL = 'http://localhost:5000'; // Adjust based on your Flask backend

export class ConversionService {
  static async uploadFile(file: File): Promise<{ jobId: string }> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      return { jobId: data.jobId };
    } catch (error) {
      throw new Error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getJobStatus(jobId: string): Promise<ConversionJob> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/status/${jobId}`);

      if (!response.ok) {
        throw new Error(`Status check failed: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        jobId,
        status: data.status,
        progress: data.progress || 0,
        downloadUrl: data.downloadUrl,
        error: data.error,
      };
    } catch (error) {
      throw new Error(`Status check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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

  static getDownloadUrl(filename: string): string {
    return `${API_BASE_URL}/api/download/${filename}`;
  }
}