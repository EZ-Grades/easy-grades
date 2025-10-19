/**
 * Centralized Error Tracking and Telemetry
 * 
 * This module provides error logging, user-friendly messages,
 * and integration hooks for error tracking services.
 */

export interface ErrorContext {
  userId?: string;
  page?: string;
  action?: string;
  metadata?: Record<string, any>;
}

export interface ErrorReport {
  message: string;
  stack?: string;
  timestamp: string;
  context?: ErrorContext;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Error severity levels
 */
export const ErrorSeverity = {
  LOW: 'low' as const,
  MEDIUM: 'medium' as const,
  HIGH: 'high' as const,
  CRITICAL: 'critical' as const,
};

/**
 * Known error patterns that can be suppressed or handled specially
 */
const KNOWN_ERRORS = [
  'getPage',
  'ambient_sounds',
  'ambience_modes',
  'Invalid login credentials',
  'Could not find the table',
  'table does not exist',
  'PGRST106', // PostgREST table not found
  'relation "public.ambient_sounds" does not exist',
  'relation "public.ambience_modes" does not exist',
  'Not authenticated',
  'permission denied for schema public',
  'Maximum update depth exceeded',
];

/**
 * User-friendly error messages for common errors
 */
const ERROR_MESSAGES: Record<string, string> = {
  // Authentication
  'Invalid login credentials': 'Invalid email or password. Please try again.',
  'Email not confirmed': 'Please verify your email address before signing in.',
  'User already registered': 'An account with this email already exists.',
  'Password too short': 'Password must be at least 6 characters long.',
  
  // Database
  'Could not find the table': 'This feature is not yet available. Please check back later.',
  'PGRST106': 'This feature is currently unavailable.',
  'relation does not exist': 'This feature is still being set up.',
  'permission denied': 'You don\'t have permission to access this resource.',
  
  // Network
  'Failed to fetch': 'Connection error. Please check your internet connection.',
  'NetworkError': 'Unable to connect. Please try again.',
  'timeout': 'Request timed out. Please try again.',
  
  // General
  'Not authenticated': 'Please sign in to access this feature.',
  'Session expired': 'Your session has expired. Please sign in again.',
};

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: Error | string): string {
  const errorMessage = typeof error === 'string' ? error : error.message;
  
  // Check for exact match
  if (ERROR_MESSAGES[errorMessage]) {
    return ERROR_MESSAGES[errorMessage];
  }
  
  // Check for partial match
  for (const [pattern, message] of Object.entries(ERROR_MESSAGES)) {
    if (errorMessage.includes(pattern)) {
      return message;
    }
  }
  
  // Default message
  return 'Something went wrong. Please try again.';
}

/**
 * Check if error should be suppressed from logging
 */
export function shouldSuppressError(error: Error | string): boolean {
  const errorMessage = typeof error === 'string' ? error : error.message;
  
  return KNOWN_ERRORS.some(pattern => errorMessage.includes(pattern));
}

/**
 * Determine error severity
 */
export function getErrorSeverity(error: Error | string): ErrorSeverity[keyof typeof ErrorSeverity] {
  const errorMessage = typeof error === 'string' ? error : error.message;
  
  // Critical errors
  if (errorMessage.includes('Maximum update depth') || 
      errorMessage.includes('Out of memory') ||
      errorMessage.includes('FATAL')) {
    return ErrorSeverity.CRITICAL;
  }
  
  // High severity
  if (errorMessage.includes('permission denied') ||
      errorMessage.includes('unauthorized') ||
      errorMessage.includes('Failed to fetch')) {
    return ErrorSeverity.HIGH;
  }
  
  // Medium severity
  if (errorMessage.includes('table does not exist') ||
      errorMessage.includes('Invalid') ||
      errorMessage.includes('timeout')) {
    return ErrorSeverity.MEDIUM;
  }
  
  // Low severity (default)
  return ErrorSeverity.LOW;
}

/**
 * Log error to console with formatting
 */
export function logError(
  error: Error | string,
  context?: ErrorContext,
  severity?: ErrorSeverity[keyof typeof ErrorSeverity]
): void {
  const errorMessage = typeof error === 'string' ? error : error.message;
  const errorStack = typeof error === 'string' ? undefined : error.stack;
  const errorSeverity = severity || getErrorSeverity(error);
  
  // Skip logging for suppressed errors
  if (shouldSuppressError(error)) {
    console.debug('Suppressed error:', errorMessage);
    return;
  }
  
  // Format log based on severity
  const timestamp = new Date().toISOString();
  const logPrefix = `[${timestamp}] [${errorSeverity.toUpperCase()}]`;
  
  switch (errorSeverity) {
    case ErrorSeverity.CRITICAL:
      console.error(`${logPrefix} 🔴 CRITICAL ERROR:`, errorMessage);
      if (errorStack) console.error('Stack:', errorStack);
      if (context) console.error('Context:', context);
      break;
      
    case ErrorSeverity.HIGH:
      console.error(`${logPrefix} 🟠 ERROR:`, errorMessage);
      if (context) console.error('Context:', context);
      break;
      
    case ErrorSeverity.MEDIUM:
      console.warn(`${logPrefix} 🟡 WARNING:`, errorMessage);
      if (context) console.warn('Context:', context);
      break;
      
    case ErrorSeverity.LOW:
      console.log(`${logPrefix} ℹ️ INFO:`, errorMessage);
      break;
  }
}

/**
 * Create error report for external tracking service
 */
export function createErrorReport(
  error: Error | string,
  context?: ErrorContext
): ErrorReport {
  const errorMessage = typeof error === 'string' ? error : error.message;
  const errorStack = typeof error === 'string' ? undefined : error.stack;
  
  return {
    message: errorMessage,
    stack: errorStack,
    timestamp: new Date().toISOString(),
    context,
    severity: getErrorSeverity(error),
  };
}

/**
 * Send error to tracking service (Sentry, etc.)
 * This is a placeholder - integrate with your preferred service
 */
export function trackError(
  error: Error | string,
  context?: ErrorContext
): void {
  // Skip suppressed errors
  if (shouldSuppressError(error)) {
    return;
  }
  
  const report = createErrorReport(error, context);
  
  // Log to console in development
  if (import.meta.env.DEV) {
    logError(error, context);
  }
  
  // In production, send to error tracking service
  if (import.meta.env.PROD) {
    // Example: Sentry integration
    // if (window.Sentry) {
    //   window.Sentry.captureException(error, {
    //     contexts: { custom: context },
    //     level: report.severity,
    //   });
    // }
    
    // Example: Custom API endpoint
    // fetch('/api/errors', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(report),
    // }).catch(console.error);
    
    // For now, just log to console
    console.error('Production error:', report);
  }
}

/**
 * Async error boundary handler
 */
export function handleAsyncError(
  promise: Promise<any>,
  context?: ErrorContext
): Promise<any> {
  return promise.catch((error) => {
    trackError(error, context);
    throw error; // Re-throw for caller to handle
  });
}

/**
 * Wrap async function with error tracking
 */
export function withErrorTracking<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: ErrorContext
): T {
  return ((...args: any[]) => {
    return handleAsyncError(fn(...args), context);
  }) as T;
}

/**
 * Performance monitoring
 */
export interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: string;
  metadata?: Record<string, any>;
}

export function measurePerformance<T>(
  name: string,
  fn: () => T,
  metadata?: Record<string, any>
): T {
  const startTime = performance.now();
  
  try {
    const result = fn();
    
    // If it's a promise, measure when it resolves
    if (result instanceof Promise) {
      return result.then((value) => {
        const duration = performance.now() - startTime;
        logPerformance({ name, duration, timestamp: new Date().toISOString(), metadata });
        return value;
      }) as T;
    }
    
    // Synchronous function
    const duration = performance.now() - startTime;
    logPerformance({ name, duration, timestamp: new Date().toISOString(), metadata });
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    logPerformance({ name, duration, timestamp: new Date().toISOString(), metadata });
    throw error;
  }
}

function logPerformance(metric: PerformanceMetric): void {
  if (metric.duration > 1000) {
    console.warn(`⚠️ Slow operation: ${metric.name} took ${metric.duration.toFixed(2)}ms`);
  } else if (import.meta.env.DEV) {
    console.log(`✅ ${metric.name}: ${metric.duration.toFixed(2)}ms`);
  }
  
  // Send to analytics service
  if (import.meta.env.PROD) {
    // Example: Send to analytics
    // analytics.track('performance', metric);
  }
}

/**
 * Initialize error tracking
 */
export function initializeErrorTracking(): void {
  // Global error handler
  window.addEventListener('error', (event) => {
    trackError(event.error || event.message, {
      page: window.location.pathname,
      action: 'global_error',
    });
  });
  
  // Unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason instanceof Error 
      ? event.reason 
      : new Error(String(event.reason));
      
    trackError(error, {
      page: window.location.pathname,
      action: 'unhandled_promise',
    });
  });
  
  console.log('✅ Error tracking initialized');
}

/**
 * Export singleton instance
 */
export const ErrorTracking = {
  log: logError,
  track: trackError,
  handle: handleAsyncError,
  wrap: withErrorTracking,
  measure: measurePerformance,
  init: initializeErrorTracking,
  getUserFriendlyMessage,
  shouldSuppress: shouldSuppressError,
};
