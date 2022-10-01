import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  
  try {
    await prisma.$connect();
    await prisma.user.deleteMany();
    await prisma.user.create({
      data: {
        name: 'Kev',
        posts: {
          create: [
            { title: 'Learn Next.js' },
            { title: 'Learn tRPC' }
          ]
        }
      }
    })

    const user = await prisma.user.findMany();
    console.log({ user });
  } catch (err) {
    console.log(err)
    await prisma.$disconnect()
    process.exit(1);
  } finally {
    prisma.$disconnect();
  }
}

seed()