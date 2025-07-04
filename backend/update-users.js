const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateExistingUsers() {
  try {
    console.log('Updating existing users...');
    
    // Get all family users
    const familyUsers = await prisma.user.findMany({
      where: { role: 'family' },
      select: { id: true, name: true, email: true, createdBy: true }
    });
    
    console.log('Current family users:', familyUsers);
    
    // For now, let's set the first family user as the creator of all others
    // In a real scenario, you'd want to determine the actual relationships
    if (familyUsers.length > 0) {
      const firstUser = familyUsers[0];
      console.log(`Setting ${firstUser.name} (${firstUser.email}) as creator of other family members...`);
      
      // Update all other family users to be created by the first user
      const updateResult = await prisma.user.updateMany({
        where: {
          role: 'family',
          id: { not: firstUser.id },
          createdBy: null
        },
        data: {
          createdBy: firstUser.id
        }
      });
      
      console.log(`Updated ${updateResult.count} users`);
      
      // Show the updated users
      const updatedUsers = await prisma.user.findMany({
        where: { role: 'family' },
        select: { id: true, name: true, email: true, createdBy: true }
      });
      
      console.log('Updated family users:', updatedUsers);
    }
    
  } catch (error) {
    console.error('Error updating users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateExistingUsers(); 