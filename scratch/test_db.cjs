require('dotenv/config');
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require('@prisma/client');

async function main() {
  const connectionString = process.env.DATABASE_URL;
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });
  try {
    await prisma.$connect();
    console.log('Successfully connected to the database');
    
    const birthCount = await prisma.birthRecord.count();
    const deathCount = await prisma.deathRecord.count();
    const certCount = await prisma.certificate.count();
    
    console.log(`Birth Records: ${birthCount}`);
    console.log(`Death Records: ${deathCount}`);
    console.log(`Certificates: ${certCount}`);
    
    const births = await prisma.birthRecord.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true, dateOfBirth: true, childName: true }
    });
    
    console.log('Sample Births:', JSON.stringify(births, null, 2));

    const certificates = await prisma.certificate.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
    });
    console.log('Sample Certificates:', JSON.stringify(certificates, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
