const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function addFamilyMembers() {
  try {
    console.log('Adding test family members...');
    
    // Get James as the creator
    const james = await prisma.user.findUnique({
      where: { email: 'haro_bert@yahoo.com' }
    });
    
    if (!james) {
      console.log('James not found!');
      return;
    }
    
    const familyMembers = [
      { name: 'Sarah Haro', email: 'sarah@example.com', password: 'password123' },
      { name: 'Mike Haro', email: 'mike@example.com', password: 'password123' },
      { name: 'Lisa Haro', email: 'lisa@example.com', password: 'password123' }
    ];
    
    for (const member of familyMembers) {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: member.email }
      });
      
      if (existingUser) {
        console.log(`User ${member.name} already exists, skipping...`);
        continue;
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(member.password, 12);
      
      // Create family member
      const newFamilyMember = await prisma.user.create({
        data: {
          name: member.name,
          email: member.email,
          password: hashedPassword,
          role: 'family',
          createdBy: james.id
        }
      });
      
      console.log(`Created family member: ${member.name} (${member.email})`);
      
      // Associate them with the same residents as James
      const residents = await prisma.resident.findMany({
        where: {
          family: {
            some: {
              id: james.id
            }
          }
        }
      });
      
      for (const resident of residents) {
        await prisma.resident.update({
          where: { id: resident.id },
          data: {
            family: {
              connect: { id: newFamilyMember.id }
            }
          }
        });
      }
      
      console.log(`Associated ${member.name} with ${residents.length} residents`);
    }
    
    console.log('Done adding family members!');
    
  } catch (error) {
    console.error('Error adding family members:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addFamilyMembers(); 