import { PrismaClient } from '@prisma/client';
import { seedUsers } from './seeds/users';
import { seedKeluargaUmat } from './seeds/keluarga-umat';
import { seedKasLingkungan } from './seeds/kas-lingkungan';
import { seedDanaMandiri } from './seeds/dana-mandiri';
import { seedKasIkata } from './seeds/kas-ikata';
import { seedDoaLingkungan } from './seeds/doa-lingkungan';
import { seedPengajuan } from './seeds/pengajuan';
import { seedPublikasi } from './seeds/publikasi';

const prisma = new PrismaClient();

async function main() {
  // Seed users first
  await seedUsers(prisma);
  
  // Seed keluarga umat
  // await seedKeluargaUmat(prisma);
  
  // // Seed kas lingkungan
  // await seedKasLingkungan(prisma);
  
  // // Seed dana mandiri
  // await seedDanaMandiri(prisma);
  
  // // Seed kas ikata
  // await seedKasIkata(prisma);
  
  // // Seed doa lingkungan
  // await seedDoaLingkungan(prisma);
  
  // // Seed pengajuan
  // await seedPengajuan(prisma);
  
  // // Seed publikasi
  // await seedPublikasi(prisma);

  console.log("Seed completed");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
