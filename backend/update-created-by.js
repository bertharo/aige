const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateCreatedBy() {
  try {
    console.log('Updating createdBy field for family members...');
    
    // Get James Haro
    const james = await prisma.user.findUnique({
      where: { email: 'haro_bert@yahoo.com' }
    });
    
    if (!james) {
      console.log('James Haro not found!');
      return;
    }
    
    console.log(`Found James Haro: ${james.name} (${james.id})`);
    
    // List of family members to update
    const familyMembers = [
      'John',
      'Bob Marley', 
      'Ziggy Marley',
      'Tom'
    ];
    
    // Update each family member
    for (const name of familyMembers) {
      console.log(`Updating ${name}...`);
      
      // Find user by name (since we know the exact names)
      const user = await prisma.user.findFirst({
        where: { name: name }
      });
      
      if (!user) {
        console.log(`User ${name} not found, skipping...`);
        continue;
      }
      
      // Update the createdBy field
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { createdBy: james.id }
      });
      
      console.log(`Updated ${updatedUser.name} (${updatedUser.email}) - createdBy: ${updatedUser.createdBy}`);
    }
    
    console.log('Done updating createdBy fields!');
    
    // Show the updated users
    const updatedUsers = await prisma.user.findMany({
      where: { 
        name: { in: familyMembers }
      },
      select: { 
        id: true, 
        name: true, 
        email: true, 
        createdBy: true 
      }
    });
    
    console.log('\nUpdated family members:');
    updatedUsers.forEach(user => {
      const creator = updatedUsers.find(u => u.id === user.createdBy);
      console.log(`- ${user.name} (${user.email}) - created by: ${creator ? creator.name : 'none'}`);
    });
    
  } catch (error) {
    console.error('Error updating createdBy:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateCreatedBy(); 