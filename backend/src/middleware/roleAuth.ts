import type { Response, NextFunction } from 'express'
import type { AuthRequest } from './auth.js'

export type UserRole = 'student' | 'faculty' | 'visitor' | 'admin' | 'delegated_admin'

export interface RoleConfig {
    allowedRoles: UserRole[]
    requireScopes?: string[]
}

/**
 * Middleware to check if user has required role(s)
 */
export function requireRole(...allowedRoles: UserRole[]) {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' })
            return
        }

        const userRole = req.user.role as UserRole

        if (!allowedRoles.includes(userRole)) {
            res.status(403).json({ error: 'Insufficient permissions' })
            return
        }

        next()
    }
}

/**
 * Middleware to require admin role
 */
export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
    if (!req.user) {
        res.status(401).json({ error: 'Authentication required' })
        return
    }

    if (!['admin', 'delegated_admin'].includes(req.user.role)) {
        res.status(403).json({ error: 'Admin access required' })
        return
    }

    next()
}

/**
 * Middleware to require full admin role (not delegated)
 */
export function requireFullAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
    if (!req.user) {
        res.status(401).json({ error: 'Authentication required' })
        return
    }

    if (req.user.role !== 'admin') {
        res.status(403).json({ error: 'Full admin access required' })
        return
    }

    next()
}

/**
 * Middleware to check delegated admin scopes
 */
export function requireScope(scope: string) {
    return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' })
            return
        }

        // Full admins have all scopes
        if (req.user.role === 'admin') {
            next()
            return
        }

        // Delegated admins need to have the specific scope
        if (req.user.role === 'delegated_admin') {
            // Note: Scopes would need to be fetched from the database
            // For now, we'll pass through and let the route handle scope validation
            next()
            return
        }

        res.status(403).json({ error: `Required scope: ${scope}` })
    }
}

/**
 * Middleware to restrict visitors from certain actions
 */
export function excludeVisitors(req: AuthRequest, res: Response, next: NextFunction): void {
    if (!req.user) {
        res.status(401).json({ error: 'Authentication required' })
        return
    }

    if (req.user.role === 'visitor') {
        res.status(403).json({ error: 'This action is not available for visitors' })
        return
    }

    next()
}

/**
 * Check if user is the owner of a resource or an admin
 */
export function requireOwnerOrAdmin(userIdExtractor: (req: AuthRequest) => string | undefined) {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' })
            return
        }

        const resourceUserId = userIdExtractor(req)

        if (!resourceUserId) {
            res.status(400).json({ error: 'Resource not found' })
            return
        }

        const isOwner = req.user.userId === resourceUserId
        const isAdmin = ['admin', 'delegated_admin'].includes(req.user.role)

        if (!isOwner && !isAdmin) {
            res.status(403).json({ error: 'Access denied' })
            return
        }

        next()
    }
}
