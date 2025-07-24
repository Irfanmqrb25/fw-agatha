"use client"

import * as React from "react"
import { useState, useEffect, useCallback, useMemo } from "react"
import { format } from "date-fns"
import { DateRange } from "react-day-picker"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { AlertCircle, BanknoteIcon } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { JenisTransaksi, TipeTransaksiLingkungan } from "@prisma/client"
import { Button } from "@/components/ui/button"

// Import types dan schemas baru
import {
  TransactionData,
  TransactionFormValues,
  InitialBalanceFormValues,
  PrintPdfFormValues,
  transactionFormSchema,
  printPdfSchema,
  initialBalanceFormSchema,
} from "../types"

// Import providers
import { getTransactionsData, getTransactionSummary } from "./providers"

// Import actions server
import {
  createTransaction,
  updateTransaction,
  deleteTransaction,
  approveTransaction,
  saveInitialBalance,
  checkInitialBalanceExists,
  getLatestTransactionData
} from "../utils/actions"

// Import utilities
import {
  getMonthDateRange,
  filterTransactionsByMonth,
  calculatePeriodSummary,
} from "../utils/date-utils"

// Import components
import { SummaryCards } from "./summary-cards"
import { PeriodFilter } from "./period-filter"
import { PrintPdfDialog } from "./print-pdf-dialog"
import { EditTransactionDialog, AddTransactionDialog } from "./transaction-form-dialog"
import { TransactionsTable } from "./transactions-table"
import { InitialBalanceDialog } from "./initial-balance-dialog"

// Definisikan props dari server component
interface KasLingkunganContentProps {
  initialTransactions: TransactionData[];
  initialSummary: {
    initialBalance: number;
    totalIncome: number;
    totalExpense: number;
    finalBalance: number;
  };
}

export default function KasLingkunganContent({
  initialTransactions,
  initialSummary
}: KasLingkunganContentProps) {
  const { userRole } = useAuth()
  const router = useRouter()
  const [transactions, setTransactions] = useState<TransactionData[]>(initialTransactions)
  const [isEditing, setIsEditing] = useState<string | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(undefined)
  const [summary, setSummary] = useState(initialSummary)
  const [isInitialBalanceSet, setIsInitialBalanceSet] = useState(false)
  const [initialBalanceDate, setInitialBalanceDate] = useState<Date | undefined>(undefined)
  const [isMutating, setIsMutating] = useState(false)

  // Cek status saldo awal saat komponen dimount
  useEffect(() => {
    const checkInitialBalance = async () => {
      const result = await checkInitialBalanceExists()
      setIsInitialBalanceSet(result.exists)
      if (result.date) {
        setInitialBalanceDate(result.date)
      }
    }
    checkInitialBalance()
  }, [])

  // Memoize filteredTransactions untuk mencegah re-renders yang tidak perlu
  const filteredTransactions = useMemo(() => {
    if (dateRange?.from && dateRange?.to) {
      const from = dateRange.from;
      const to = dateRange.to;

      return transactions.filter(tx =>
        tx.tanggal >= from &&
        tx.tanggal <= to
      );
    }
    // Jika tidak ada rentang tanggal, tampilkan semua transaksi
    return transactions;
  }, [transactions, dateRange]);

  // Memoize summary untuk mencegah re-renders
  useEffect(() => {
    // Gunakan fungsi calculatePeriodSummary untuk perhitungan yang benar
    const calculatedSummary = calculatePeriodSummary(
      transactions,
      dateRange,
      initialSummary.initialBalance
    );

    setSummary(calculatedSummary);
  }, [filteredTransactions, transactions, initialSummary.initialBalance, dateRange]);

  // Cek apakah pengguna memiliki hak akses ke halaman
  const hasAccess = userRole ? [
    'SUPER_USER',
    'KETUA',
    'BENDAHARA',
    'WAKIL_BENDAHARA'
  ].includes(userRole) : false

  // Cek apakah pengguna memiliki hak untuk memodifikasi data
  const canModifyData = userRole ? [
    'SUPER_USER',
    'BENDAHARA',
    'WAKIL_BENDAHARA'
  ].includes(userRole) : false

  // Redirect jika tidak memiliki akses
  useEffect(() => {
    if (!hasAccess) {
      toast.error("Anda tidak memiliki akses ke halaman ini")
      router.push("/dashboard")
    }
  }, [hasAccess, router])

  // Form untuk transaksi yang diedit
  const editForm = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      tanggal: new Date(),
      keterangan: "",
      jenisTransaksi: JenisTransaksi.UANG_MASUK,
      tipeTransaksi: TipeTransaksiLingkungan.KOLEKTE_I,
      jumlah: 0,
    },
  })

  // Form untuk PDF
  const pdfForm = useForm<PrintPdfFormValues>({
    resolver: zodResolver(printPdfSchema),
    defaultValues: {
      dateRange: getMonthDateRange(new Date()),
    },
  })

  // Form untuk saldo awal
  const initialBalanceForm = useForm<InitialBalanceFormValues>({
    resolver: zodResolver(initialBalanceFormSchema),
    defaultValues: {
      saldoAwal: initialSummary.initialBalance,
      tanggal: new Date(),
    },
  })

  // Form untuk transaksi baru
  const addForm = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      tanggal: new Date(),
      keterangan: "",
      jenisTransaksi: JenisTransaksi.UANG_MASUK,
      tipeTransaksi: TipeTransaksiLingkungan.KOLEKTE_I,
      jumlah: 0,
    },
  })

  // Tambahkan fungsi untuk fetch data terbaru
  const fetchLatestData = async () => {
    try {
      const result = await getLatestTransactionData();
      if (result.success) {
        setTransactions(result.data);
        
        // Hitung ulang summary berdasarkan data baru
        const calculatedSummary = calculatePeriodSummary(
          result.data,
          dateRange,
          initialSummary.initialBalance
        );
        setSummary(calculatedSummary);
      } else {
        toast.error(result.error || "Gagal memperbarui data terbaru");
      }
    } catch (error) {
      console.error("Error fetching latest data:", error);
      toast.error("Gagal memperbarui data terbaru");
    }
  };

  // Submit edit transaksi
  async function onEditTransactionSubmit(values: TransactionFormValues) {
    // Validasi hak akses modifikasi
    if (!canModifyData) {
      toast.error("Anda tidak memiliki izin untuk melakukan perubahan data")
      return
    }

    if (!isEditing) return;

    try {
      // Panggil server action untuk update transaksi
      const result = await updateTransaction(isEditing, {
        tanggal: values.tanggal,
        jenisTranasksi: values.jenisTransaksi,
        tipeTransaksi: values.tipeTransaksi,
        keterangan: values.keterangan,
        jumlah: values.jumlah
      });

      if (result.success) {
        // Fetch dan update data terbaru
        await fetchLatestData();
        
        toast.success("Transaksi berhasil diperbarui");
        setEditDialogOpen(false);
        setIsEditing(null);

        // Tetap panggil router.refresh() untuk memastikan konsistensi data
        router.refresh();
      } else {
        toast.error(result.error || "Gagal memperbarui transaksi");
      }
    } catch (error) {
      console.error("Error updating transaction:", error);
      toast.error("Terjadi kesalahan saat memperbarui transaksi");
    }
  }

  // Cetak PDF
  function onPrintPdf(values: PrintPdfFormValues) {
    // Implementasi cetak PDF tidak berubah
    toast.success("Cetak PDF berhasil");
  }

  // Submit saldo awal
  async function onInitialBalanceSubmit(values: InitialBalanceFormValues) {
    // Validasi hak akses modifikasi
    if (!canModifyData) {
      toast.error("Anda tidak memiliki izin untuk melakukan perubahan data")
      return
    }

    try {
      // Panggil server action untuk menyimpan saldo awal
      const result = await saveInitialBalance(values.saldoAwal, values.tanggal);

      if (result.success) {
        toast.success("Saldo awal berhasil diset");
        setIsInitialBalanceSet(true);
        setInitialBalanceDate(values.tanggal);

        // Refresh data dari server
        router.refresh();
      } else {
        toast.error(result.error || "Gagal menyimpan saldo awal");
      }
    } catch (error) {
      console.error("Error saving initial balance:", error);
      toast.error("Terjadi kesalahan saat menyimpan saldo awal");
    }
  }

  // Submit transaksi baru
  async function onAddTransactionSubmit(values: TransactionFormValues) {
    // Validasi hak akses modifikasi
    if (!canModifyData) {
      toast.error("Anda tidak memiliki izin untuk melakukan perubahan data")
      return
    }

    try {
      setIsMutating(true)
      // Panggil server action untuk create transaksi
      const result = await createTransaction({
        tanggal: values.tanggal,
        jenisTranasksi: values.jenisTransaksi,
        tipeTransaksi: values.tipeTransaksi,
        keterangan: values.keterangan,
        jumlah: values.jumlah
      });

      if (result.success) {
        // Fetch dan update data terbaru
        await fetchLatestData();
        
        toast.success("Transaksi berhasil ditambahkan");
        setAddDialogOpen(false);
        
        // Reset form
        addForm.reset({
          tanggal: new Date(),
          keterangan: "",
          jenisTransaksi: JenisTransaksi.UANG_MASUK,
          tipeTransaksi: TipeTransaksiLingkungan.KOLEKTE_I,
          jumlah: 0,
        });

        // Tetap panggil router.refresh() untuk memastikan konsistensi data
        router.refresh();
      } else {
        toast.error(result.error || "Gagal menambahkan transaksi");
      }
    } catch (error) {
      console.error("Error creating transaction:", error);
      toast.error("Terjadi kesalahan saat menambahkan transaksi");
    } finally {
      setIsMutating(false)
    }
  }

  // Handle functions dengan useCallback untuk mengurangi re-render
  const handleEditTransaction = useCallback((id: string) => {
    // Cari transaksi yang akan diedit
    const transaction = transactions.find(tx => tx.id === id);
    if (!transaction) {
      toast.error("Transaksi tidak ditemukan");
      return;
    }

    // Atur isEditing dan set form values
    setIsEditing(id);

    // Set form values
    editForm.reset({
      tanggal: transaction.tanggal,
      keterangan: transaction.keterangan || "",
      jenisTransaksi: transaction.jenisTransaksi,
      tipeTransaksi: transaction.tipeTransaksi,
      jumlah: transaction.jenisTransaksi === JenisTransaksi.UANG_MASUK
        ? transaction.debit
        : transaction.kredit,
    });

    setEditDialogOpen(true);
  }, [transactions, editForm]);

  const handleDeleteTransaction = useCallback(async (id: string) => {
    // Validasi hak akses modifikasi
    if (!canModifyData) {
      toast.error("Anda tidak memiliki izin untuk menghapus data");
      return;
    }

    try {
      const result = await deleteTransaction(id);

      if (result.success) {
        // Fetch dan update data terbaru
        await fetchLatestData();
        
        toast.success("Transaksi berhasil dihapus");

        // Tetap panggil router.refresh() untuk memastikan konsistensi data
        router.refresh();
      } else {
        toast.error(result.error || "Gagal menghapus transaksi");
      }
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast.error("Terjadi kesalahan saat menghapus transaksi");
    }
  }, [canModifyData, router, fetchLatestData]);

  const handleApproveTransaction = useCallback(async (id: string) => {
    try {
      const result = await approveTransaction(id, 'APPROVED');

      if (result.success) {
        toast.success("Transaksi berhasil disetujui");

        // Refresh data dari server
        router.refresh();
      } else {
        toast.error(result.error || "Gagal menyetujui transaksi");
      }
    } catch (error) {
      console.error("Error approving transaction:", error);
      toast.error("Terjadi kesalahan saat menyetujui transaksi");
    }
  }, [router]);

  const handleRejectTransaction = useCallback(async (id: string) => {
    try {
      const result = await approveTransaction(id, 'REJECTED');

      if (result.success) {
        toast.success("Transaksi berhasil ditolak");

        // Refresh data dari server
        router.refresh();
      } else {
        toast.error(result.error || "Gagal menolak transaksi");
      }
    } catch (error) {
      console.error("Error rejecting transaction:", error);
      toast.error("Terjadi kesalahan saat menolak transaksi");
    }
  }, [router]);

  // Fungsi untuk membuka kunci transaksi yang telah diapprove (untuk SuperUser)
  const handleUnlockTransaction = useCallback(async (id: string) => {
    try {
      const result = await approveTransaction(id, 'PENDING');

      if (result.success) {
        toast.success("Transaksi berhasil dibuka kuncinya");

        // Refresh data dari server
        router.refresh();
      } else {
        toast.error(result.error || "Gagal membuka kunci transaksi");
      }
    } catch (error) {
      console.error("Error unlocking transaction:", error);
      toast.error("Terjadi kesalahan saat membuka kunci transaksi");
    }
  }, [router]);

  // Filter by date range - useCallback untuk mencegah re-render
  const handleDateRangeChange = useCallback((date: DateRange | undefined) => {
    setDateRange(date);
  }, []);

  return (
    <div className="space-y-4">
      {!hasAccess && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Anda tidak memiliki akses ke halaman ini
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <SummaryCards
        initialBalance={summary.initialBalance}
        totalIncome={summary.totalIncome}
        totalExpense={summary.totalExpense}
        finalBalance={summary.finalBalance}
      />

      {/* Filter dan Actions */}
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="w-full md:w-auto">
          <PeriodFilter
            dateRange={dateRange}
            onDateRangeChange={handleDateRangeChange}
          />
        </div>

        <div className="flex flex-col md:flex-row gap-2">
          {dateRange && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDateRange(undefined)}
              className="h-10"
            >
              Tampilkan Semua Data
            </Button>
          )}

          

          {canModifyData && (
            <>
              <InitialBalanceDialog
                form={initialBalanceForm}
                onSubmit={onInitialBalanceSubmit}
                currentBalance={summary.initialBalance}
                isInitialBalanceSet={isInitialBalanceSet}
                initialBalanceDate={initialBalanceDate}
              />
              
              <Button 
                onClick={() => setAddDialogOpen(true)} 
                disabled={isMutating || !isInitialBalanceSet}
                title={!isInitialBalanceSet ? "Saldo awal kas lingkungan harus diset terlebih dahulu" : "Input Transaksi"}
                className="h-10"
              >
                <BanknoteIcon className="mr-2 h-4 w-4" />
                Input Transaksi
              </Button>
            </>
          )}

          <PrintPdfDialog
            form={pdfForm}
            onSubmit={onPrintPdf}
            transactions={filteredTransactions}
            summary={summary}
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="mt-6">
        <TransactionsTable
          transactions={filteredTransactions}
          onEdit={handleEditTransaction}
          onDelete={handleDeleteTransaction}
          onApprove={handleApproveTransaction}
          onReject={handleRejectTransaction}
          onUnlock={handleUnlockTransaction}
          canModifyData={canModifyData}
          canApprove={userRole === 'KETUA'}
          showPagination={true}
        />
      </div>

      {/* Edit Dialog */}
      {isEditing && (
        <EditTransactionDialog
          form={editForm}
          onSubmit={onEditTransactionSubmit}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
        />
      )}

      {/* Add Transaction Dialog */}
      <AddTransactionDialog
        form={addForm}
        onSubmit={onAddTransactionSubmit}
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        disabled={isMutating || !isInitialBalanceSet}
      />
    </div>
  )
} 