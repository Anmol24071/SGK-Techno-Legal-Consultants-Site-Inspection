const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'tarachandanianmol41@gmail.com';

  console.log('Seeding database for SGK Techno-Legal Consultants...');

  // 1. Create Initial Chief Admin Account
  const admin = await prisma.user.upsert({
    where: { email: adminEmail.toLowerCase() },
    update: {
      role: 'ADMIN',
      status: 'APPROVED',
    },
    create: {
      name: 'Anmol Tarachandani (Admin)',
      email: adminEmail.toLowerCase(),
      role: 'ADMIN',
      status: 'APPROVED',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    },
  });
  console.log('Admin user verified:', admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
