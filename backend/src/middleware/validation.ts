/**
 * @module middleware/validation
 * @description Request validation middleware using Zod schemas.
 * Validates request bodies and query parameters against defined schemas,
 * returning 400 errors with detailed validation messages on failure.
 */

import type { Request, Response, NextFunction } from 'express'
import type { ZodSchema } from 'zod'

/**
 * Creates middleware that validates `req.body` against a Zod schema.
 * On success, replaces `req.body` with the parsed (and potentially transformed) data.
 * On failure, responds with 400 and an array of validation error messages.
 *
 * @param schema - The Zod schema to validate against
 * @returns Express middleware function
 *
 * @example
 * ```typescript
 * router.post('/items', validateRequest(createItemSchema), handler)
 * ```
 */
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

/**
 * Creates middleware that validates `req.query` against a Zod schema.
 * On success, replaces `req.query` with the parsed data.
 * On failure, responds with 400 and an array of validation error messages.
 *
 * @param schema - The Zod schema to validate query parameters against
 * @returns Express middleware function
 */
export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validated = schema.parse(req.query)
      req.query = validated as typeof req.query
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
