const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixRelationships() {
  try {
    console.log('Fixing relationships...');
    
    // Get James
    const james = await prisma.user.findUnique({
      where: { email: 'haro_bert@yahoo.com' }
    });
    
    if (!james) {
      console.log('James not found!');
      return;
    }
    
    // Get all current residents
    const residents = await prisma.resident.findMany({
      include: {
        family: true
      }
    });
    
    console.log('Current residents:', residents.map(r => r.name));
    
    // Convert residents to family members
    for (const resident of residents) {
      console.log(`Converting ${resident.name} from resident to family member...`);
      
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: `${resident.name.toLowerCase().replace(' ', '.')}@example.com` }
      });
      
      if (existingUser) {
        console.log(`User for ${resident.name} already exists, skipping...`);
        continue;
      }
      
      // Create family member user (using a simple hash for demo)
      const familyMember = await prisma.user.create({
        data: {
          name: resident.name,
          email: `${resident.name.toLowerCase().replace(' ', '.')}@example.com`,
          password: 'password123', // In production, this should be hashed
          role: 'family',
          createdBy: james.id
        }
      });
      
      console.log(`Created family member: ${familyMember.name} (${familyMember.email})`);
      
      // Create a new resident record for this person (they are now in care)
      const newResident = await prisma.resident.create({
        data: {
          name: resident.name,
          photo: resident.photo,
          room: resident.room,
          carePlan: resident.carePlan,
          medicalInfo: resident.medicalInfo,
          admittedAt: resident.admittedAt,
          family: {
            connect: { id: james.id } // James is the family member who wants notifications
          }
        }
      });
      
      console.log(`Created resident record for ${newResident.name}`);
      
      // Migrate all related data to the new resident
      await prisma.dailyReport.updateMany({
        where: { residentId: resident.id },
        data: { residentId: newResident.id }
      });
      await prisma.message.updateMany({
        where: { residentId: resident.id },
        data: { residentId: newResident.id }
      });
      await prisma.image.updateMany({
        where: { residentId: resident.id },
        data: { residentId: newResident.id }
      });
      await prisma.residentFacilityAssignment.updateMany({
        where: { residentId: resident.id },
        data: { residentId: newResident.id }
      });
      await prisma.visit.updateMany({
        where: { residentId: resident.id },
        data: { residentId: newResident.id }
      });
      await prisma.notification.updateMany({
        where: { residentId: resident.id },
        data: { residentId: newResident.id }
      });
      // Update _FamilyResidents join table
      // First, delete any join for the old resident and James
      await prisma.$executeRaw`DELETE FROM "_FamilyResidents" WHERE "A" = ${resident.id} AND "B" = ${james.id}`;
      // Then update any remaining joins for the old resident to the new resident
      await prisma.$executeRaw`UPDATE "_FamilyResidents" SET "A" = ${newResident.id} WHERE "A" = ${resident.id}`;
      
      // Delete the old resident record
      await prisma.resident.delete({
        where: { id: resident.id }
      });
      
      console.log(`Migrated and deleted old resident record for ${resident.name}`);
    }
    
    console.log('Done fixing relationships!');
    
    // Show the new structure
    const newUsers = await prisma.user.findMany({
      where: { role: 'family' },
      select: { id: true, name: true, email: true, createdBy: true }
    });
    
    console.log('\nNew family members:');
    newUsers.forEach(user => {
      const createdBy = newUsers.find(u => u.id === user.createdBy);
      console.log(`- ${user.name} (${user.email}) - created by: ${createdBy ? createdBy.name : 'none'}`);
    });
    
    const newResidents = await prisma.resident.findMany({
      include: {
        family: {
          select: { id: true, name: true, email: true }
        }
      }
    });
    
    console.log('\nNew residents:');
    newResidents.forEach(resident => {
      console.log(`- ${resident.name} (Room: ${resident.room || 'Not assigned'})`);
      console.log(`  Family members who want notifications:`);
      resident.family.forEach(familyMember => {
        console.log(`    - ${familyMember.name} (${familyMember.email})`);
      });
    });
    
  } catch (error) {
    console.error('Error fixing relationships:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixRelationships(); 