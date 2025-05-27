import { PrismaClient } from '@prisma/client'

// Global variable to store the Prisma client instance
// This prevents multiple instances in development due to hot reloading
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

/**
 * Prisma client instance for database operations
 * Uses a global variable in development to prevent multiple instances
 * Creates a new instance in production
 */
const prisma = globalThis.prisma || new PrismaClient()

// In development, store the client globally to prevent multiple instances
if (process.env.NODE_ENV === 'development') {
  globalThis.prisma = prisma
}

export default prisma

/**
 * Helper function to safely disconnect from the database
 * Useful for cleanup in serverless environments
 */
export async function disconnectPrisma() {
  await prisma.$disconnect()
} 