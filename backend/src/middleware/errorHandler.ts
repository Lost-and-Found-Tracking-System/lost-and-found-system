/**
 * @module middleware/errorHandler
 * @description Centralized error handling middleware for Express.
 * Catches all errors thrown in route handlers and returns a structured JSON response.
 * Includes stack traces in development mode.
 */

import type { Request, Response, NextFunction } from 'express'

/**
 * Extended Error interface with an HTTP status code.
 */
export interface ApiError extends Error {
  /** HTTP status code (e.g., 400, 404, 500) */
  statusCode: number
  /** Human-readable error message */
  message: string
}

/**
 * Factory function to create an {@link ApiError} with a specific status code.
 *
 * @param statusCode - The HTTP status code
 * @param message - The error message
 * @returns A new ApiError instance
 *
 * @example
 * ```typescript
 * throw createApiError(404, 'Item not found')
 * ```
 */
export function createApiError(statusCode: number, message: string): ApiError {
  const error = new Error(message) as ApiError
  error.statusCode = statusCode
  error.message = message
  return error
}

/**
 * Express error-handling middleware. Must be registered after all routes.
 * Logs the error and returns a JSON response with the status code and message.
 * In development, the stack trace is included in the response.
 *
 * @param err - The caught error (may be a plain Error or an {@link ApiError})
 * @param _req - The incoming request (unused)
 * @param res - The outgoing response
 * @param _next - The next middleware function (unused)
 */
export function errorHandler(err: Error | ApiError, _req: Request, res: Response, _next: NextFunction): void {
  const statusCode = 'statusCode' in err ? err.statusCode : 500
  const message = err.message || 'Internal server error'

  console.error(`[Error] ${statusCode}: ${message}`, err)

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}
