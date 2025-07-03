const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createAssociation(userId, residentId) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      residents: {
        connect: { id: residentId }
      }
    }
  });
  console.log('Association created!');
  await prisma.$disconnect();
}

createAssociation('3b29c0a3-74a2-4f40-bb03-0bb1de4c76d8', '8fe4254f-0d20-40d8-9243-cc5dd3fce847'); 