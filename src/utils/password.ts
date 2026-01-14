import { hash, verify } from 'argon2'

export async function hashPassword(password: string): Promise<string> {
  return hash(password, {
    type: 2, // Argon2id
    memoryCost: 2 ** 16, // 64 MB
    timeCost: 3,
    parallelism: 1,
  })
}

export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  return verify(hash, password)
}
