import fs from 'fs';
import path from 'path';
import { log } from './utils.js';

export class ErrorHandler {
  constructor(logFile = 'extraction_errors.log') {
    this.logFile = logFile;
    this.errors = [];
  }

  logError(context, error, metadata = {}) {
    const errorEntry = {
      timestamp: new Date().toISOString(),
      context,
      message: error.message,
      stack: error.stack,
      metadata
    };

    this.errors.push(errorEntry);

    const logMessage = `
[${errorEntry.timestamp}] ERROR in ${context}
Message: ${errorEntry.message}
Metadata: ${JSON.stringify(metadata, null, 2)}
Stack: ${errorEntry.stack}
${'='.repeat(80)}
`;

    try {
      fs.appendFileSync(this.logFile, logMessage, 'utf-8');
    } catch (err) {
      console.error('Failed to write to error log:', err.message);
    }

    log(`Error in ${context}: ${error.message}`, 'error');
  }

  async executeWithRetry(fn, context, maxAttempts = 3, delayMs = 2000) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        if (attempt === maxAttempts) {
          this.logError(context, error, { 
            attempt, 
            maxAttempts,
            finalAttempt: true 
          });
          throw error;
        }

        log(`${context} failed (attempt ${attempt}/${maxAttempts}), retrying...`, 'warning');
        this.logError(context, error, { 
          attempt, 
          maxAttempts,
          retrying: true 
        });

        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }

  getErrorSummary() {
    const errorsByContext = {};
    
    this.errors.forEach(error => {
      if (!errorsByContext[error.context]) {
        errorsByContext[error.context] = [];
      }
      errorsByContext[error.context].push(error);
    });

    return {
      totalErrors: this.errors.length,
      errorsByContext,
      uniqueContexts: Object.keys(errorsByContext).length
    };
  }

  exportErrorReport(outputPath = 'error_report.json') {
    const summary = this.getErrorSummary();
    
    const report = {
      generatedAt: new Date().toISOString(),
      summary,
      detailedErrors: this.errors
    };

    try {
      fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), 'utf-8');
      log(`Error report saved to: ${outputPath}`, 'info');
      return outputPath;
    } catch (error) {
      log(`Failed to save error report: ${error.message}`, 'error');
      return null;
    }
  }

  clearErrors() {
    this.errors = [];
  }

  hasErrors() {
    return this.errors.length > 0;
  }
}

export function handleUncaughtErrors() {
  process.on('uncaughtException', (error) => {
    console.error('\n❌ Uncaught Exception:');
    console.error(error);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('\n❌ Unhandled Promise Rejection:');
    console.error(reason);
    process.exit(1);
  });
}

export function setupGracefulShutdown(scraper) {
  const shutdown = async (signal) => {
    log(`\n${signal} received, cleaning up...`, 'warning');
    
    if (scraper && scraper.browser) {
      try {
        await scraper.close();
      } catch (error) {
        console.error('Error closing browser:', error.message);
      }
    }
    
    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}
