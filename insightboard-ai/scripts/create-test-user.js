const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createTestUser() {
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash('demo123', 12)
    
    // Create test user
    const user = await prisma.user.create({
      data: {
        email: 'demo@example.com',
        password: hashedPassword,
        name: 'Demo User'
      }
    })
    
    console.log('✅ Test user created successfully:', user.email)
    console.log('📧 Email: demo@example.com')
    console.log('🔑 Password: demo123')
    
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('ℹ️  Test user already exists')
    } else {
      console.error('❌ Error creating test user:', error)
    }
  } finally {
    await prisma.$disconnect()
  }
}

createTestUser()
