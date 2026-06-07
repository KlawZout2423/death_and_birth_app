import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from '../generated/client';

async function main() {
  const connectionString = `${process.env.DATABASE_URL}`;
  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });
  try {
    await prisma.$connect();
    console.log('Successfully connected to the database');
    
    const birthCount = await prisma.birthRecord.count();
    const deathCount = await prisma.deathRecord.count();
    const userCount = await prisma.user.count();
    const certCount = await prisma.certificate.count();
    
    console.log(`Birth Records: ${birthCount}`);
    console.log(`Death Records: ${deathCount}`);
    console.log(`Users: ${userCount}`);
    console.log(`Certificates: ${certCount}`);
    
    const latestBirths = await prisma.birthRecord.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true, dateOfBirth: true, childName: true }
    });
    
    console.log('Latest Births:', JSON.stringify(latestBirths, null, 2));

    const certificates = await prisma.certificate.findMany({
      take: 5,
      orderBy: { issueDate: 'desc' },
    });
    console.log('Certificates:', JSON.stringify(certificates, null, 2));
    
  } catch (error) {
    console.error('Database connection error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
