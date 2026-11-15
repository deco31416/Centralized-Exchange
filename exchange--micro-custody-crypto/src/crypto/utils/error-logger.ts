import { writeFileSync, appendFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

interface ErrorLogEntry {
  timestamp: string;
  service: string;
  method: string;
  blockchain?: string;
  blockNumber?: number;
  error: {
    message: string;
    stack?: string;
    name?: string;
  };
}

export class ErrorLogger {
  private static logDir = join(process.cwd(), 'logs');
  private static logFile = join(this.logDir, 'watchtower-errors.json');

  /**
   * Initialize the error logger (create logs directory if needed)
   */
  static initialize(): void {
    if (!existsSync(this.logDir)) {
      mkdirSync(this.logDir, { recursive: true });
    }

    // Create empty log file if it doesn't exist
    if (!existsSync(this.logFile)) {
      writeFileSync(this.logFile, JSON.stringify({ errors: [] }, null, 2));
    }
  }

  /**
   * Log an error to the file
   */
  static logError(params: {
    service: string;
    method: string;
    blockchain?: string;
    blockNumber?: number;
    error: any;
  }): void {
    try {
      this.initialize();

      const entry: ErrorLogEntry = {
        timestamp: new Date().toISOString(),
        service: params.service,
        method: params.method,
        ...(params.blockchain && { blockchain: params.blockchain }),
        ...(params.blockNumber && { blockNumber: params.blockNumber }),
        error: {
          message: params.error?.message || String(params.error),
          name: params.error?.name,
          stack: params.error?.stack,
        },
      };

      // Append to file (one entry per line for easier parsing)
      const logLine = JSON.stringify(entry) + '\n';
      appendFileSync(this.logFile, logLine);
    } catch (writeError) {
      // If we can't write to file, at least log to console
      console.error('Failed to write to error log file:', writeError);
    }
  }

  /**
   * Get the log file path
   */
  static getLogFilePath(): string {
    return this.logFile;
  }
}
