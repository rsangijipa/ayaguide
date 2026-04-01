'use client';

/**
 * Logger utility for production observability.
 * Currently wraps console, but ready for Sentry/Axiom integration.
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private log(level: LogLevel, message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

    if (this.isDevelopment) {
      switch (level) {
        case 'info': console.log(formattedMessage, data ?? ''); break;
        case 'warn': console.warn(formattedMessage, data ?? ''); break;
        case 'error': console.error(formattedMessage, data ?? ''); break;
        case 'debug': console.debug(formattedMessage, data ?? ''); break;
      }
    } else {
      // In production, you would send this to a service like Sentry or Axiom
      if (level === 'error') {
        // Example: Sentry.captureException(data ?? new Error(message));
      }
      
      // Basic logging to console even in prod if needed for debugging build issues
      if (level === 'error' || level === 'warn') {
        console[level](formattedMessage, data ?? '');
      }
    }
  }

  info(message: string, data?: any) { this.log('info', message, data); }
  warn(message: string, data?: any) { this.log('warn', message, data); }
  error(message: string, data?: any) { this.log('error', message, data); }
  debug(message: string, data?: any) { this.log('debug', message, data); }
}

export const logger = new Logger();
