
const { PrismaClient } = require('../node_modules/@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv/config');

async function main() {
  const connectionString = process.env.DATABASE_URL;
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });
  
  try {
    const regions = await prisma.region.findMany();
    console.log('Regions:', JSON.stringify(regions, null, 2));
    
    const birthsWithRegion = await prisma.birthRecord.count({ where: { NOT: { birthRegionId: null } } });
    const birthsWithoutRegion = await prisma.birthRecord.count({ where: { birthRegionId: null } });
    
    console.log(`Births with Region: ${birthsWithRegion}`);
    console.log(`Births without Region: ${birthsWithoutRegion}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
