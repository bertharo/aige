const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Replace with your family user ID and the array of resident IDs to associate
const familyUserId = '3b29c0a3-74a2-4f40-bb03-0bb1de4c76d8';
const residentIds = [
  '2bb3ddde-1aac-4d02-92d6-65acc45875e8', // Bob Marley
  '75303a53-c8fd-4d23-8cf1-3feaa20c0a2f', // Ziggy Marley
  '8fe4254f-0d20-40d8-9243-cc5dd3fce847', // John
  '82530663-f183-4aad-89ff-3324b5d2b67b'  // Tom
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