import { PrismaClient } from '@prisma/client';

export async function seedDanaMandiri(prisma: PrismaClient) {
  // Get all keluarga umat
  const keluargaUmatList = await prisma.keluargaUmat.findMany();
  const currentYear = new Date().getFullYear();
  const lastYear = currentYear - 1;

  // Create dana mandiri records for each keluarga
  for (const keluarga of keluargaUmatList) {
    // Last year (some with unpaid months to create variance)
    const lastYearMonths = keluarga.id.includes('5') ? 6 : 12; // Some families only paid 6 months last year
    
    for (let month = 1; month <= lastYearMonths; month++) {
      await prisma.danaMandiri.create({
        data: {
          tanggal: new Date(`${lastYear}-${month.toString().padStart(2, '0')}-15`),
          keluargaId: keluarga.id,
          jumlahDibayar: 50000, // Standard amount
          statusSetor: true,
          tanggalSetor: new Date(`${lastYear}-${month.toString().padStart(2, '0')}-25`),
          tahun: lastYear,
          bulan: month
        }
      });
    }

    // Current year (some with unpaid months to simulate reality)
    const currentYearMonths = new Date().getMonth() + 1; // Up to current month
    const paidMonths = keluarga.id.includes('3') || keluarga.id.includes('7') 
      ? Math.floor(currentYearMonths / 2) // Some families have paid only half the months
      : currentYearMonths;
    
    for (let month = 1; month <= paidMonths; month++) {
      // For some months, status is still not deposited to Paroki
      const isRecentMonth = month > currentYearMonths - 2;
      const statusSetor = !isRecentMonth;
      
      await prisma.danaMandiri.create({
        data: {
          tanggal: new Date(`${currentYear}-${month.toString().padStart(2, '0')}-15`),
          keluargaId: keluarga.id,
          jumlahDibayar: 50000, // Standard amount
          statusSetor,
          tanggalSetor: statusSetor ? new Date(`${currentYear}-${month.toString().padStart(2, '0')}-25`) : null,
          tahun: currentYear,
          bulan: month
        }
      });
    }
  }
} 