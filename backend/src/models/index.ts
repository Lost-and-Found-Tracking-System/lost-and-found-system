/**
 * @module models
 * @description Barrel export for all Mongoose models.
 * Re-exports models from identity, locations, items, claims, AI, notifications, and audit modules.
 */

export * from './ai.js'
export * from './audit.js'
export * from './claims.js'
export * from './embeddings.js'
export * from './identity.js'
export * from './items.js'
export * from './locations.js'
export * from './notifications.js'

