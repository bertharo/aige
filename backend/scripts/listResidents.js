const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listResidents() {
  const residents = await prisma.resident.findMany();
  residents.forEach(r => {
    console.log(`Name: ${r.name}, ID: ${r.id}`);
  });
  await prisma.$disconnect();
}

listResidents(); 