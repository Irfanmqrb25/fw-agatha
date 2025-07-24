'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PeriodFilter } from './period-filter';
import { SummaryCards } from './summary-cards';
import { TransactionsTable } from './transactions-table';
import { TransactionFormDialog } from './transaction-form-dialog';
import { PrintPDFDialog } from './print-pdf-dialog';
import { SaldoAwalFormDialog } from './saldo-awal-form-dialog';
import { SetIkataDuesDialog, SetIkataDuesValues } from './set-ikata-dues-dialog';
import { IKATASummary, IKATATransaction, PeriodFilter as PeriodFilterType, TransactionFormData, SaldoAwalFormData, JenisTransaksi as UIJenisTransaksi, TipeTransaksi as UITipeTransaksi } from '../types';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { AlertCircle, Printer, Settings } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import { setSaldoAwalIkata, getAllKasIkataSummary, getKasIkataSummaryByPeriod } from '../utils/kas-ikata-service';
import { createTransaction, updateTransaction, deleteTransaction, setIkataDues, getIkataSetting, getLatestTransactionData } from '../utils/actions';
import { JenisTransaksi, TipeTransaksiIkata } from '@prisma/client';
import { checkInitialBalanceIkataExists } from '../utils/kas-ikata-service';
import { format } from 'date-fns';
import { parseJakartaDateString } from '@/lib/timezone';

interface KasIKATAContentProps {
  summary: IKATASummary;
  transactions: IKATATransaction[];
  keluargaUmatList: { id: string; namaKepalaKeluarga: string }[];
  isLoading?: boolean;
}

export function KasIKATAContent({ summary, transactions: initialTransactions, keluargaUmatList, isLoading = false }: KasIKATAContentProps) {
  const { userRole } = useAuth();
  const router = useRouter();

  // Role definition
  const isAdmin = userRole === 'SUPER_USER' || userRole === 'KETUA';
  const isTreasurer = userRole === 'WAKIL_BENDAHARA';
  const canModifyData = isAdmin || isTreasurer;
  const hasAccess = userRole && ['SUPER_USER', 'KETUA', 'WAKIL_BENDAHARA'].includes(userRole);

  // States
  const [period, setPeriod] = useState<PeriodFilterType>({
    bulan: 0, // 0 = semua data dalam tahun
    tahun: new Date().getFullYear()
  });
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
  const [isSetDuesDialogOpen, setIsSetDuesDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<IKATATransaction | null>(null);
  const [skipConfirmation, setSkipConfirmation] = useState(false);
  const [transactions, setTransactions] = useState<IKATATransaction[]>(initialTransactions);
  const [currentDuesAmount, setCurrentDuesAmount] = useState<number>(0);
  const [currentBalance, setCurrentBalance] = useState<number>(summary.saldoAwal || 0);
  const [isInitialBalanceSet, setIsInitialBalanceSet] = useState(false);
  const [initialBalanceDate, setInitialBalanceDate] = useState<Date | undefined>(undefined);
  const [summaryData, setSummaryData] = useState<IKATASummary>(summary);
  const [periodSummary, setPeriodSummary] = useState<IKATASummary>(summary); // Summary berdasarkan periode yang dipilih
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  // Computed values - SEMUA useMemo HARUS di atas early return
  // Hitung filtered transactions berdasarkan periode
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      // Parse tanggal dengan timezone Jakarta yang benar
      const txDate = parseJakartaDateString(t.tanggal);
      const txYear = txDate.getFullYear();
      const txMonth = txDate.getMonth() + 1; // getMonth() returns 0-11, convert to 1-12
      
      // Jika bulan = 0, tampilkan semua transaksi dalam tahun tersebut
      if (period.bulan === 0) {
        return txYear === period.tahun;
      }
      
      // Jika bulan spesifik, filter berdasarkan bulan dan tahun
      return txMonth === period.bulan && txYear === period.tahun;
    });
  }, [transactions, period]);

  // Effects
  useEffect(() => {
    if (!hasAccess) {
      toast.error("Anda tidak memiliki akses ke halaman ini");
      router.push("/dashboard");
    }
  }, [hasAccess, router]);

  useEffect(() => {
    setSummaryData(summary);
  }, [summary]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const keluargaId = urlParams.get('keluargaId');
      if (keluargaId) {
        setIsAddTransactionOpen(true);
      }
    }
  }, []);

  useEffect(() => {
    const checkInitialBalance = async () => {
      const result = await checkInitialBalanceIkataExists();
      setIsInitialBalanceSet(result.exists);
      if (result.date) {
        setInitialBalanceDate(result.date);
      }
    };
    checkInitialBalance();
  }, []);

  // Effect untuk mengambil pengaturan iuran saat ini
  useEffect(() => {
    const fetchCurrentDues = async () => {
      try {
        const result = await getIkataSetting(period.tahun);
        if (result.success && result.data) {
          setCurrentDuesAmount((result.data as { year: number; amount: number }).amount);
        }
      } catch (error) {
        console.error("Error fetching current dues:", error);
      }
    };
    fetchCurrentDues();
  }, [period.tahun]);

  // Effect untuk menghitung summary berdasarkan periode yang dipilih
  useEffect(() => {
    const calculatePeriodSummary = async () => {
      setIsLoadingSummary(true);
      try {
        const newSummary = await getKasIkataSummaryByPeriod(period.bulan, period.tahun);
        setPeriodSummary(newSummary);
      } catch (error) {
        console.error("Error calculating period summary:", error);
        toast.error("Gagal menghitung ringkasan berdasarkan periode");
      } finally {
        setIsLoadingSummary(false);
      }
    };

    calculatePeriodSummary();
  }, [period, transactions]);

  // Early return SETELAH semua hooks
  if (!hasAccess) {
    return <div className="flex justify-center items-center h-64">Memeriksa akses...</div>;
  }

  // Handler untuk memfilter periode (untuk PDF dan Summary Cards)
  const handlePeriodChange = (newPeriod: PeriodFilterType) => {
    setPeriod(newPeriod);
  };

  const handleAddTransaction = async (data: TransactionFormData) => {
    if (!canModifyData) {
      toast.error("Anda tidak memiliki izin untuk menambah data");
      return;
    }

    try {
      // Validasi data yang diperlukan
      if (!data.tanggal || !data.jenis || !data.tipeTransaksi || !data.jumlah) {
        console.error("[handleAddTransaction] Data tidak lengkap:", data);
        toast.error("Data transaksi tidak lengkap", {
          description: "Mohon lengkapi semua field yang diperlukan"
        });
        return;
      }

      // Parse tanggal dengan timezone Jakarta yang benar
      const tanggalObj = parseJakartaDateString(data.tanggal);

      // Map jenis transaksi ke format yang diharapkan server
      const jenisTranasksi: JenisTransaksi =
        data.jenis === 'uang_masuk' ? JenisTransaksi.UANG_MASUK : JenisTransaksi.UANG_KELUAR;

      // Map tipe transaksi ke format yang diharapkan server
      const tipeTransaksiMap: Record<string, TipeTransaksiIkata> = {
        'iuran_anggota': TipeTransaksiIkata.IURAN_ANGGOTA,
        'transfer_dana_lingkungan': TipeTransaksiIkata.TRANSFER_DANA_DARI_LINGKUNGAN,
        'sumbangan_anggota': TipeTransaksiIkata.SUMBANGAN_ANGGOTA,
        'penerimaan_lain': TipeTransaksiIkata.PENERIMAAN_LAIN,
        'uang_duka': TipeTransaksiIkata.UANG_DUKA_PAPAN_BUNGA,
        'kunjungan_kasih': TipeTransaksiIkata.KUNJUNGAN_KASIH,
        'cinderamata_kelahiran': TipeTransaksiIkata.CINDERAMATA_KELAHIRAN,
        'cinderamata_pernikahan': TipeTransaksiIkata.CINDERAMATA_PERNIKAHAN,
        'uang_akomodasi': TipeTransaksiIkata.UANG_AKOMODASI,
        'pembelian': TipeTransaksiIkata.PEMBELIAN,
        'lain_lain': TipeTransaksiIkata.LAIN_LAIN
      };

      const tipeTransaksi = tipeTransaksiMap[data.tipeTransaksi];
      if (!tipeTransaksi) {
        console.error("[handleAddTransaction] Tipe transaksi tidak valid:", data.tipeTransaksi);
        toast.error("Tipe transaksi tidak valid");
        return;
      }

      // Siapkan keterangan berdasarkan tipe transaksi
      let keterangan = data.keterangan || '';
      if (data.tipeTransaksi === 'sumbangan_anggota' && data.anggotaId) {
        const anggota = keluargaUmatList.find(k => k.id === data.anggotaId);
        if (anggota) {
          keterangan = `Sumbangan dari ${anggota.namaKepalaKeluarga}`;
        }
      } else if (data.tipeTransaksi === 'iuran_anggota' && data.anggotaId) {
        const anggota = keluargaUmatList.find(k => k.id === data.anggotaId);
        if (anggota) {
          keterangan = `Iuran dari ${anggota.namaKepalaKeluarga}`;
          if (data.statusPembayaran) {
            keterangan += ` (${data.statusPembayaran === 'lunas' ? 'Lunas' : 
              data.statusPembayaran === 'sebagian_bulan' ? 'Sebagian Bulan' : 'Belum Ada Pembayaran'})`;
            if (data.statusPembayaran === 'sebagian_bulan' && data.periodeBayar && data.periodeBayar.length > 0) {
              const periodeBulan = data.periodeBayar.map(periode => {
                const [tahun, bulan] = periode.split('-');
                const namaBulan = new Date(parseInt(tahun), parseInt(bulan) - 1).toLocaleString('id-ID', { month: 'long' });
                return `${namaBulan} ${tahun}`;
              }).join(', ');
              keterangan += ` - ${periodeBulan}`;
            }
          }
        }
      }

      // Kirim data ke server
      const result = await createTransaction({
        tanggal: tanggalObj,
        jenisTranasksi,
        tipeTransaksi,
        keterangan,
        jumlah: data.jumlah,
        keluargaId: data.anggotaId,
        totalIuran: data.totalIuran,
        statusPembayaran: data.statusPembayaran,
        periodeBayar: data.periodeBayar
      });

      if (result) {
        // Fetch dan update data terbaru
        await fetchLatestData();
        toast.success("Transaksi berhasil ditambahkan");
        setIsAddTransactionOpen(false);
      } else {
        toast.error("Gagal menambahkan transaksi");
      }
    } catch (error) {
      console.error("[handleAddTransaction] Error:", error);
      toast.error("Terjadi kesalahan saat menambahkan transaksi");
    }
  };

  const handleEditTransaction = (id: string) => {
    if (!canModifyData) {
      toast.error("Anda tidak memiliki izin untuk mengubah data");
      return;
    }

    // Cari transaksi yang akan diedit
    const transaction = transactions.find(tx => tx.id === id);

    if (transaction) {
      if (transaction.locked) {
        toast.error("Transaksi terkunci tidak dapat diedit");
        return;
      }

      // Set transaksi yang sedang diedit
      setEditingTransaction(transaction);

      // Buka dialog edit
      setIsAddTransactionOpen(true);
    }
  };

  const handleUpdateTransaction = async (data: TransactionFormData) => {
    if (!editingTransaction) return;

    try {
      // Parse tanggal dengan timezone Jakarta yang benar
      const tanggalObj = parseJakartaDateString(data.tanggal);

      // Tentukan jenis dan tipe transaksi dalam format yang sesuai dengan server
      const jenisTranasksi: JenisTransaksi =
        data.jenis === 'uang_masuk' ? JenisTransaksi.UANG_MASUK : JenisTransaksi.UANG_KELUAR;

      // Map tipe transaksi dari UI ke enum database
      const tipeTransaksiMap: Record<string, TipeTransaksiIkata> = {
        'iuran_anggota': TipeTransaksiIkata.IURAN_ANGGOTA,
        'transfer_dana_lingkungan': TipeTransaksiIkata.TRANSFER_DANA_DARI_LINGKUNGAN,
        'sumbangan_anggota': TipeTransaksiIkata.SUMBANGAN_ANGGOTA,
        'penerimaan_lain': TipeTransaksiIkata.PENERIMAAN_LAIN,
        'uang_duka': TipeTransaksiIkata.UANG_DUKA_PAPAN_BUNGA,
        'kunjungan_kasih': TipeTransaksiIkata.KUNJUNGAN_KASIH,
        'cinderamata_kelahiran': TipeTransaksiIkata.CINDERAMATA_KELAHIRAN,
        'cinderamata_pernikahan': TipeTransaksiIkata.CINDERAMATA_PERNIKAHAN,
        'uang_akomodasi': TipeTransaksiIkata.UANG_AKOMODASI,
        'pembelian': TipeTransaksiIkata.PEMBELIAN,
        'lain_lain': TipeTransaksiIkata.LAIN_LAIN
      };

      const tipeTransaksi = tipeTransaksiMap[data.tipeTransaksi];

      // Kirim ke server action
      const result = await updateTransaction(editingTransaction.id, {
        tanggal: tanggalObj,
        jenisTranasksi,
        tipeTransaksi,
        keterangan: data.keterangan,
        jumlah: data.jumlah,
        keluargaId: data.anggotaId,
        totalIuran: data.totalIuran,
        statusPembayaran: data.statusPembayaran,
        periodeBayar: data.periodeBayar
      });

      if (result) {
        // Fetch dan update data terbaru
        await fetchLatestData();
        toast.success("Transaksi berhasil diperbarui");
        setEditingTransaction(null);
      } else {
        toast.error("Gagal memperbarui transaksi");
      }
    } catch (error) {
      console.error("[handleUpdateTransaction] Error:", error);
      toast.error("Terjadi kesalahan saat memperbarui transaksi");
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!canModifyData) {
      toast.error("Anda tidak memiliki izin untuk menghapus data");
      return;
    }

    try {
      const result = await deleteTransaction(id);

      if (result) {
        // Fetch dan update data terbaru
        await fetchLatestData();
        toast.success("Transaksi berhasil dihapus");
      } else {
        toast.error("Gagal menghapus transaksi");
      }
    } catch (error) {
      console.error("[handleDeleteTransaction] Error:", error);
      toast.error("Terjadi kesalahan saat menghapus transaksi");
    }
  };

  const handleToggleLock = (id: string) => {
    // TODO: Implementasi toggle lock status
    console.log(`Toggle lock status for transaction ${id}`);
  };

  const handleOpenPrintDialog = () => {
    setIsPrintDialogOpen(true);
  };

  const handlePrintPDF = (data: any) => {
    console.log("Print PDF with data:", data);
  };

  // Fungsi untuk menangani pengaturan saldo awal
  const handleSaveSaldoAwal = async (data: SaldoAwalFormData) => {
    if (!canModifyData) {
      toast.error("Anda tidak memiliki izin untuk mengubah saldo awal");
      return;
    }

    try {
      const result = await setSaldoAwalIkata(data.saldoAwal, data.tanggal);

      if (result.success) {
        toast.success("Saldo awal berhasil disimpan");
        setCurrentBalance(data.saldoAwal);
        setIsInitialBalanceSet(true);
        setInitialBalanceDate(data.tanggal);
        router.refresh();
      } else {
        toast.error(result.error || "Gagal menyimpan saldo awal");
      }
    } catch (error) {
      console.error("Error saving saldo awal:", error);
      toast.error("Terjadi kesalahan saat menyimpan saldo awal");
    }
  };

  // Handler untuk pengaturan iuran IKATA
  const handleSetDues = async (values: SetIkataDuesValues) => {
    if (!canModifyData) {
      toast.error("Anda tidak memiliki izin untuk mengatur iuran");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("year", values.year.toString());
      formData.append("amount", values.amount.toString());

      const result = await setIkataDues(formData);

      if (result.success) {
        toast.success(`Iuran IKATA tahun ${values.year} berhasil diatur: Rp ${values.amount.toLocaleString('id-ID')}`);
        setCurrentDuesAmount(values.amount);
        router.refresh();
      } else {
        toast.error(result.error || "Gagal mengatur iuran IKATA");
      }
    } catch (error) {
      console.error("Error setting IKATA dues:", error);
      toast.error("Terjadi kesalahan saat mengatur iuran IKATA");
    }
  };

  // Fungsi untuk mengambil data terbaru
  const fetchLatestData = async () => {
    try {
      const result = await getLatestTransactionData();
      
      if (result.success && result.data) {
        // Map data ke format yang sesuai
        const mappedTransactions: IKATATransaction[] = result.data.map(tx => ({
          id: tx.id,
          tanggal: format(tx.tanggal, 'yyyy-MM-dd'),
          keterangan: tx.keterangan || '',
          jumlah: tx.debit > 0 ? tx.debit : tx.kredit,
          jenis: tx.jenisTransaksi === 'UANG_MASUK' ? ('uang_masuk' as UIJenisTransaksi) : ('uang_keluar' as UIJenisTransaksi),
          tipeTransaksi: mapTipeTransaksi(tx.tipeTransaksi) as UITipeTransaksi,
          debit: tx.debit,
          kredit: tx.kredit,
          createdAt: tx.createdAt.toISOString(),
          updatedAt: tx.updatedAt.toISOString(),
          createdBy: 'System',
          updatedBy: 'System',
          locked: tx.locked
        }));

        // Update state transaksi
        setTransactions(mappedTransactions);

        // Hitung ulang summary
        const newSummary = await getAllKasIkataSummary();
        setSummaryData(newSummary);

      } else {
        toast.error("Gagal memperbarui data terbaru");
      }
    } catch (error) {
      console.error("[fetchLatestData] Error:", error);
      toast.error("Gagal memperbarui data terbaru");
    }
  };

  // Helper function untuk mapping tipe transaksi
  const mapTipeTransaksi = (dbTipe: string): string => {
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
    return tipeMap[dbTipe] || dbTipe.toLowerCase();
  };

  return (
    <div className="space-y-6">
      {!canModifyData && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Mode Hanya Baca</AlertTitle>
          <AlertDescription>
            Anda hanya dapat melihat data kas IKATA. Untuk menambah, mengubah, atau menghapus data, hubungi Wakil Bendahara atau Admin Lingkungan.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Kas IKATA</h1>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <PeriodFilter period={period} onPeriodChange={handlePeriodChange} />

          {/* Tombol Aksi */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleOpenPrintDialog}
              variant="outline"
              disabled={isLoading}
            >
              <Printer className="h-4 w-4 mr-2" />
              Print PDF
            </Button>

            {canModifyData && (
              <>
                <SaldoAwalFormDialog
                  onSubmit={handleSaveSaldoAwal}
                  currentBalance={currentBalance}
                  isInitialBalanceSet={isInitialBalanceSet}
                  initialBalanceDate={initialBalanceDate}
                />

                <Button
                  onClick={() => setIsSetDuesDialogOpen(true)}
                  variant="outline"
                  disabled={isLoading}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Atur Iuran
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <SummaryCards summary={isLoadingSummary ? summaryData : periodSummary} />

      {canModifyData && (
        <Button
          onClick={() => setIsAddTransactionOpen(true)}
          disabled={isLoading || !isInitialBalanceSet}
        >
          Tambah Transaksi
        </Button>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Transaksi</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionsTable
            transactions={filteredTransactions}
            onEdit={handleEditTransaction}
            onDelete={handleDeleteTransaction}
            onToggleLock={handleToggleLock}
            canModifyData={canModifyData}
            keluargaUmatList={keluargaUmatList}
          />
        </CardContent>
      </Card>

      <TransactionFormDialog
        open={isAddTransactionOpen}
        onOpenChange={(open) => {
          setIsAddTransactionOpen(open);
          if (!open) setEditingTransaction(null);
        }}
        onSubmit={(data) => {
          if (!canModifyData) {
            toast.error("Anda tidak memiliki izin untuk menambah data");
            return;
          }

          if (editingTransaction) {
            handleUpdateTransaction(data);
          } else {
            handleAddTransaction(data);
          }
        }}
        editTransaction={editingTransaction}
        keluargaUmatList={keluargaUmatList}
        currentDuesAmount={currentDuesAmount}
      />

      <PrintPDFDialog
        open={isPrintDialogOpen}
        onOpenChange={setIsPrintDialogOpen}
        period={period}
        summary={isLoadingSummary ? summaryData : periodSummary}
        skipConfirmation={skipConfirmation}
        transactions={filteredTransactions}
        onPrint={handlePrintPDF}
      />

      <SetIkataDuesDialog
        open={isSetDuesDialogOpen}
        onOpenChange={setIsSetDuesDialogOpen}
        onSubmit={handleSetDues}
        currentAmount={currentDuesAmount}
      />
    </div>
  );
} 