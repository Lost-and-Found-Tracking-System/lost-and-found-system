/**
 * @module middleware/roleAuth
 * @description Role-based access control (RBAC) middleware.
 * Provides composable middleware functions to restrict route access
 * based on user roles, admin status, scopes, and resource ownership.
 */

import type { Response, NextFunction } from 'express'
import type { AuthRequest } from './auth.js'

/**
 * Valid user roles in the system.
 * - `student` / `faculty` — Standard campus users
 * - `visitor` — Temporary OTP-authenticated users
 * - `admin` — Full system administrator
 * - `delegated_admin` — Admin with limited scoped permissions
 */
export type UserRole = 'student' | 'faculty' | 'visitor' | 'admin' | 'delegated_admin'

/**
 * Configuration object for role-based access rules.
 */
export interface RoleConfig {
    /** Roles that are allowed to access the route */
    allowedRoles: UserRole[]
    /** Optional scopes required for delegated admins */
    requireScopes?: string[]
}

/**
 * Creates middleware that restricts access to users with specific roles.
 *
 * @param allowedRoles - One or more {@link UserRole} values that are permitted
 * @returns Express middleware that responds with 403 if the user's role is not in the allowed list
 *
 * @example
 * ```typescript
 * router.post('/items', authMiddleware, requireRole('student', 'faculty'), handler)
 * ```
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
