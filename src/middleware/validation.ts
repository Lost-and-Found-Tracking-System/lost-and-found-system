import { Request, Response, NextFunction } from 'express'
import { ZodSchema } from 'zod'

export function validateRequest(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validated = schema.parse(req.body)
      req.body = validated
      next()
    } catch (error: unknown) {
      if (error instanceof Error && 'errors' in error) {
        const zodError = error as { errors: Array<{ message: string }> }
        res.status(400).json({
          error: 'Validation failed',
          details: zodError.errors.map((e) => e.message),
        })
      } else {
        res.status(400).json({ error: 'Invalid request' })
      }
    }
  }
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validated = schema.parse(req.query)
      req.query = validated as Record<string, unknown>
      next()
    } catch (error: unknown) {
      if (error instanceof Error && 'errors' in error) {
        const zodError = error as { errors: Array<{ message: string }> }
        res.status(400).json({
          error: 'Validation failed',
          details: zodError.errors.map((e) => e.message),
        })
      } else {
        res.status(400).json({ error: 'Invalid query' })
      }
    }
  }
}
