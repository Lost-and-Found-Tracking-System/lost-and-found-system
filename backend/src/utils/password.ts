/**
 * @module utils/password
 * @description Password hashing and verification using Argon2id.
 * Uses memory-hard hashing (64 MB) to resist brute-force attacks.
 */

import { hash, verify } from 'argon2'

/**
 * Hashes a plaintext password using Argon2id.
 *
 * @param password - The plaintext password to hash
 * @returns The hashed password string
 *
 * Configuration:
 * - Algorithm: Argon2id (type 2)
 * - Memory: 64 MB
 * - Iterations: 3
 * - Parallelism: 1
 */
export async function hashPassword(password: string): Promise<string> {
  return hash(password, {
    type: 2, // Argon2id
    memoryCost: 2 ** 16, // 64 MB
    timeCost: 3,
    parallelism: 1,
  })
}

/**
 * Verifies a plaintext password against an Argon2 hash.
 *
 * @param hash - The stored Argon2 hash
 * @param password - The plaintext password to verify
 * @returns `true` if the password matches the hash
 */
export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  return verify(hash, password)
}
