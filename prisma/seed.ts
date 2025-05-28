/**
 * Prisma database seed script
 * Provides optional sample LeetCode problems for users who want example data
 * 
 * Run with: npx prisma db seed
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database with sample LeetCode problems...')

  // Sample Problem 1: Two Sum (Solved)
  const twoSum = await prisma.problem.create({
    data: {
      name: 'Two Sum',
      description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.',
      trickSummary: 'Use a hash map to store numbers and their indices. For each number, check if target minus that number exists in the map.',
      notes: 'This is a classic problem that teaches the hash map technique. Time complexity O(n), space complexity O(n).',
      solved: true,
      attempts: {
        create: [
          {
            commitHash: 'a1b2c3d4e5f6',
            note: 'First attempt using brute force O(n²)',
            filePath: 'attempts/problem-1/attempt.py'
          },
          {
            commitHash: 'f6e5d4c3b2a1',
            note: 'Optimized with hash map approach O(n)',
            filePath: 'attempts/problem-1/attempt.py'
          }
        ]
      }
    }
  })

  // Sample Problem 2: Valid Parentheses (Solved)
  const validParentheses = await prisma.problem.create({
    data: {
      name: 'Valid Parentheses',
      description: 'Given a string s containing just the characters "(", ")", "{", "}", "[" and "]", determine if the input string is valid. An input string is valid if: Open brackets must be closed by the same type of brackets. Open brackets must be closed in the correct order.',
      trickSummary: 'Use a stack data structure. Push opening brackets onto stack, pop and match when encountering closing brackets.',
      notes: 'Perfect example of when to use a stack. Remember to check if stack is empty when trying to pop.',
      solved: true,
      attempts: {
        create: [
          {
            commitHash: 'b2c3d4e5f6a1',
            note: 'Clean stack implementation',
            filePath: 'attempts/problem-2/attempt.py'
          }
        ]
      }
    }
  })

  // Sample Problem 3: Longest Substring Without Repeating Characters (Unsolved)
  const longestSubstring = await prisma.problem.create({
    data: {
      name: 'Longest Substring Without Repeating Characters',
      description: 'Given a string s, find the length of the longest substring without repeating characters.',
      trickSummary: null, // User hasn't figured out the trick yet
      notes: 'Need to review sliding window technique. Current approach is too slow.',
      solved: false,
      attempts: {
        create: [
          {
            commitHash: 'c3d4e5f6a1b2',
            note: 'Brute force attempt - getting TLE',
            filePath: 'attempts/problem-3/attempt.py'
          }
        ]
      }
    }
  })

  console.log('✅ Sample problems created:')
  console.log(`   📝 ${twoSum.name} (solved)`)
  console.log(`   📝 ${validParentheses.name} (solved)`)
  console.log(`   📝 ${longestSubstring.name} (unsolved)`)
  console.log('')
  console.log('🎉 Seed data complete! You can now:')
  console.log('   • View these sample problems in the app')
  console.log('   • Edit or delete them as needed')
  console.log('   • Create your own problems')
  console.log('')
  console.log('💡 Note: These are just examples to get you started')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error seeding database:', e)
    await prisma.$disconnect()
    process.exit(1)
  }) 