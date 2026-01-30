// Seed script to create test users with properly hashed passwords
// Run with: npx tsx src/scripts/seed-users.ts

import { connectToDatabase } from '../config/database.js'
import { UserModel } from '../models/index.js'
import { hashPassword } from '../utils/password.js'

const testUsers = [
    {
        institutionalId: 'STU001',
        role: 'student',
        profile: {
            fullName: 'Test Student',
            email: 'student@example.com',
            phone: '+1234567890',
        },
        password: 'Student@123', // Plain password - will be hashed
    },
    {
        institutionalId: 'FAC001',
        role: 'faculty',
        profile: {
            fullName: 'Test Faculty',
            email: 'faculty@example.com',
            phone: '+1234567891',
        },
        password: 'Faculty@123',
    },
    {
        institutionalId: 'ADM001',
        role: 'admin',
        profile: {
            fullName: 'Test Admin',
            email: 'admin@example.com',
            phone: '+1234567892',
        },
        password: 'Admin@123',
    },
]

async function seedUsers() {
    try {
        await connectToDatabase()
        console.log('Connected to database')

        for (const userData of testUsers) {
            // Check if user already exists
            const existing = await UserModel.findOne({ 'profile.email': userData.profile.email })
            if (existing) {
                console.log(`⏭️ User ${userData.profile.email} already exists, skipping`)
                continue
            }

            // Hash the password
            const passwordHash = await hashPassword(userData.password)

            // Create user
            const user = new UserModel({
                institutionalId: userData.institutionalId,
                role: userData.role,
                credentials: {
                    passwordHash,
                    passwordUpdatedAt: new Date(),
                    failedLoginAttempts: 0,
                },
                profile: userData.profile,
                status: 'active',
            })

            await user.save()
            console.log(`✅ Created user: ${userData.profile.email} (password: ${userData.password})`)
        }

        console.log('\n🎉 Seeding complete!')
        console.log('\nTest credentials:')
        console.log('  student@example.com / Student@123')
        console.log('  faculty@example.com / Faculty@123')
        console.log('  admin@example.com / Admin@123')

        process.exit(0)
    } catch (error) {
        console.error('Seeding failed:', error)
        process.exit(1)
    }
}

seedUsers()
