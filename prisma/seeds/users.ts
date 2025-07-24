import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const password = bcrypt.hashSync('password123', 10);

export async function seedUsers(prisma: PrismaClient) {
  // Create super user
  await prisma.user.upsert({
    where: { username: 'superuser' },
    update: {},
    create: {
      username: 'superuser',
      password: password,
      passphrase: 'pengurus123',
      role: Role.SUPER_USER
    },
  });

  // Create other administrator users
  const adminUsers = [
    {
      username: 'ketua',
      password: password,
      passphrase: 'pengurus123',
      role: Role.KETUA
    },
    {
      username: 'wakilketua',
      password: password,
      passphrase: 'pengurus123',
      role: Role.WAKIL_KETUA
    },
    {
      username: 'bendahara',
      password: password,
      passphrase: 'pengurus123',
      role: Role.BENDAHARA
    },
    {
      username: 'wakilbendahara',
      password: password,
      passphrase: 'pengurus123',
      role: Role.WAKIL_BENDAHARA
    },
    {
      username: 'sekretaris',
      password: password,
      passphrase: 'pengurus123',
      role: Role.SEKRETARIS
    },
    {
      username: 'wakilsekretaris',
      password: password,
      passphrase: 'pengurus123',
      role: Role.WAKIL_SEKRETARIS
    }
  ];

  for (const user of adminUsers) {
    await prisma.user.upsert({
      where: { username: user.username },
      update: {},
      create: user,
    });
  }
} 