const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAssociation(userId, residentId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { residents: { where: { id: residentId } } }
  });
  if (user && user.residents.length > 0) {
    console.log('Association exists!');
  } else {
    console.log('No association found.');
  }
  await prisma.$disconnect();
}

checkAssociation('3b29c0a3-74a2-4f40-bb03-0bb1de4c76d8', '8fe4254f-0d20-40d8-9243-cc5dd3fce847'); 