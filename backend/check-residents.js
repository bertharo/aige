const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAllResidents() {
  try {
    console.log('Checking all residents in database...');
    
    // Get all residents
    const allResidents = await prisma.resident.findMany({
      include: {
        family: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    });
    
    console.log('All residents in database:', allResidents);
    
    console.log('\nResidents with their family members:');
    allResidents.forEach(resident => {
      console.log(`\n${resident.name} (${resident.id}):`);
      console.log(`  Room: ${resident.room || 'Not assigned'}`);
      console.log(`  Admitted: ${resident.admittedAt}`);
      console.log(`  Family members:`);
      if (resident.family.length === 0) {
        console.log(`    - No family members assigned`);
      } else {
        resident.family.forEach(familyMember => {
          console.log(`    - ${familyMember.name} (${familyMember.email}) - ${familyMember.role}`);
        });
      }
    });
    
  } catch (error) {
    console.error('Error checking residents:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllResidents(); 