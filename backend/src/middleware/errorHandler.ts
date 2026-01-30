import type { Request, Response, NextFunction } from 'express'

export interface ApiError extends Error {
  statusCode: number
  message: string
}

export function createApiError(statusCode: number, message: string): ApiError {
  const error = new Error(message) as ApiError
  error.statusCode = statusCode
  error.message = message
  return error
}

export function errorHandler(err: Error | ApiError, _req: Request, res: Response, _next: NextFunction): void {
  const statusCode = 'statusCode' in err ? err.statusCode : 500
  const message = err.message || 'Internal server error'

  console.error(`[Error] ${statusCode}: ${message}`, err)

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}
