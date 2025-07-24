import { getAllKasIkataSummary, getAllKasIkataTransactions, getKeluargaUmatList } from './utils/kas-ikata-service';
import { KasIKATAContent } from './components/kas-ikata-content';
import { IKATATransaction } from './types';
import { format } from 'date-fns';

// Pastikan halaman selalu mengambil data terbaru
export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function KasIKATAPage() {
  // Mendapatkan SEMUA data dari server action tanpa filter periode
  const summary = await getAllKasIkataSummary();
  const kasIkataData = await getAllKasIkataTransactions();
  const keluargaUmatList = await getKeluargaUmatList();
  
  // Mapping data KasIkata ke format IKATATransaction
  const transactions: IKATATransaction[] = kasIkataData.map((transaction) => {
    // Format jenis transaksi
    const jenis = transaction.jenisTranasksi === 'UANG_MASUK' ? 'uang_masuk' : 'uang_keluar';
    
    // Format tipe transaksi
    const tipeMap: Record<string, string> = {
      'IURAN_ANGGOTA': 'iuran_anggota',
      'TRANSFER_DANA_DARI_LINGKUNGAN': 'transfer_dana_lingkungan',
      'SUMBANGAN_ANGGOTA': 'sumbangan_anggota',
      'PENERIMAAN_LAIN': 'penerimaan_lain',
      'UANG_DUKA_PAPAN_BUNGA': 'uang_duka',
      'KUNJUNGAN_KASIH': 'kunjungan_kasih',
      'CINDERAMATA_KELAHIRAN': 'cinderamata_kelahiran',
      'CINDERAMATA_PERNIKAHAN': 'cinderamata_pernikahan',
      'UANG_AKOMODASI': 'uang_akomodasi',
      'PEMBELIAN': 'pembelian',
      'LAIN_LAIN': 'lain_lain'
    };
    
    const tipeTransaksi = tipeMap[transaction.tipeTransaksi] as any;
    
    return {
      id: transaction.id,
      tanggal: format(transaction.tanggal, 'yyyy-MM-dd'),
      keterangan: transaction.keterangan || '',
      jumlah: transaction.debit > 0 ? transaction.debit : transaction.kredit,
      jenis,
      tipeTransaksi,
      debit: transaction.debit,
      kredit: transaction.kredit,
      createdAt: transaction.createdAt.toISOString(),
      updatedAt: transaction.updatedAt.toISOString(),
      createdBy: 'System',
      updatedBy: 'System',
      locked: Boolean(transaction.locked)
    };
  });
  
  return (
    <div className="container mx-auto py-6 px-4">
      <KasIKATAContent
        summary={summary}
        transactions={transactions}
        keluargaUmatList={keluargaUmatList}
      />
    </div>
  );
} 