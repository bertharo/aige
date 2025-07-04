const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAllUsers() {
  try {
    console.log('Checking all users in database...');
    
    // Get all users
    const allUsers = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdBy: true }
    });
    
    console.log('All users in database:', allUsers);
    
    // Group by role
    const usersByRole = {};
    allUsers.forEach(user => {
      if (!usersByRole[user.role]) {
        usersByRole[user.role] = [];
      }
      usersByRole[user.role].push(user);
    });
    
    console.log('\nUsers by role:');
    Object.keys(usersByRole).forEach(role => {
      console.log(`\n${role}:`);
      usersByRole[role].forEach(user => {
        console.log(`  - ${user.name} (${user.email}) - createdBy: ${user.createdBy || 'null'}`);
      });
    });
    
  } catch (error) {
    console.error('Error checking users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllUsers(); 