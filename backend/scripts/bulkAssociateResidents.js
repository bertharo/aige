const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Replace with your family user ID and the array of resident IDs to associate
const familyUserId = '3b29c0a3-74a2-4f40-bb03-0bb1de4c76d8';
const residentIds = [
  // Add resident IDs here as strings
  'RESIDENT_ID_1',
  'RESIDENT_ID_2',
  'RESIDENT_ID_3',
  'RESIDENT_ID_4'
];

async function bulkAssociateResidents(userId, residentIds) {
  for (const residentId of residentIds) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        residents: {
          connect: { id: residentId }
        }
      }
    });
    console.log(`Associated resident ${residentId} with user ${userId}`);
  }
  await prisma.$disconnect();
  console.log('Bulk association complete!');
}

bulkAssociateResidents(familyUserId, residentIds); 