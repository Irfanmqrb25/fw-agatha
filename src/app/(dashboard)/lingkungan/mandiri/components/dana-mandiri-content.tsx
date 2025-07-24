"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { 
  DanaMandiriTransaction, 
  DanaMandiriArrears, 
  TransactionFormValues,
  PrintPdfFormValues,
  SetDuesValues,
  SendReminderValues
} from "../types"
import { formatCurrency } from "../utils"
import { SummaryCards } from "./summary-cards"
import { TransactionsTable } from "./transactions-table"
import { MonitoringTable } from "./monitoring-table"
import { TransactionFormDialog } from "./transaction-form-dialog"
import { PrintPdfDialog } from "./print-pdf-dialog"
import { PDFPreviewDialog } from "./pdf-preview-dialog"
import { SetDuesDialog } from "./set-dues-dialog"
import { ReminderDialog } from "./reminder-dialog"
import { SubmitToParokiDialog } from "./submit-to-paroki-dialog"
import { TransactionDetailDialog } from "./transaction-detail-dialog"
import SlipPenyetoranDialog from "./slip-penyetoran-dialog"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { 
  getDanaMandiriTransactions, 
  getDanaMandiriSummary, 
  getDanaMandiriArrears,
  addDanaMandiriTransaction,
  updateDanaMandiriTransaction,
  deleteDanaMandiriTransaction,
  submitToParoki,
  sendReminderNotifications,
  setDanaMandiriDues,
  getKeluargaList,
  getDanaMandiriSetting
} from "../actions"
import { checkInitialBalanceExists } from "../../kas/utils/actions"

interface KeluargaListItem {
  id: string;
  namaKepalaKeluarga: string;
  alamat: string | null;
  nomorTelepon: string | null;
}

export default function DanaMandiriContent() {
  const router = useRouter()
  const { userRole } = useAuth()
  
  // Cek apakah pengguna memiliki hak akses ke halaman
  const hasAccess = userRole ? [
    'SUPER_USER',
    'KETUA',
    'WAKIL_KETUA',
    'BENDAHARA'
  ].includes(userRole) : false

  // Cek apakah pengguna memiliki hak untuk memodifikasi data
  const canModifyData = userRole ? [
    'SUPER_USER',
    'BENDAHARA'
  ].includes(userRole) : false
  
  // State untuk tahun yang dipilih
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  
  // State untuk data
  const [transactions, setTransactions] = useState<DanaMandiriTransaction[]>([])
  const [arrears, setArrears] = useState<DanaMandiriArrears[]>([])
  const [keluargaList, setKeluargaList] = useState<KeluargaListItem[]>([])
  const [summaryData, setSummaryData] = useState({
    totalTerkumpul: 0,
    jumlahKKLunas: 0,
    jumlahKKBelumLunas: 0
  })
  
  // State untuk loading
  const [isLoading, setIsLoading] = useState(true)
  const [isMutating, setIsMutating] = useState(false)
  
  // State untuk selection
  const [selectedTransactionIds, setSelectedTransactionIds] = useState<string[]>([])
  const [selectedFamilyIds, setSelectedFamilyIds] = useState<string[]>([])
  
  // State untuk dialogs
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [printDialogOpen, setPrintDialogOpen] = useState(false)
  const [setDuesDialogOpen, setSetDuesDialogOpen] = useState(false)
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false)
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false)
  
  // State untuk PDF preview
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false)
  const [pdfPreviewData, setPdfPreviewData] = useState<{
    documentType: string;
    documentCategory: "bukti_terima_uang" | "setor_ke_paroki";
    month?: number;
    year: number;
  }>({
    documentType: "payment_receipt",
    documentCategory: "bukti_terima_uang",
    year: new Date().getFullYear()
  })
  
  // State untuk edit transaction
  const [editingTransaction, setEditingTransaction] = useState<DanaMandiriTransaction | null>(null)
  
  // State untuk dialog detail transaksi
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [selectedTransactionDetail, setSelectedTransactionDetail] = useState<DanaMandiriTransaction | null>(null)
  
  // State untuk dialog slip penyetoran
  const [slipPenyetoranDialogOpen, setSlipPenyetoranDialogOpen] = useState(false)
  
  // State untuk iuran saat ini
  const [currentDuesAmount, setCurrentDuesAmount] = useState<number>(0)
  
  // State untuk mengecek saldo awal kas lingkungan
  const [isInitialBalanceSet, setIsInitialBalanceSet] = useState(false)
  
  // Redirect jika tidak memiliki akses
  useEffect(() => {
    if (!hasAccess) {
      toast.error("Anda tidak memiliki akses ke halaman ini")
      router.push("/dashboard")
    }
  }, [hasAccess, router])
  
  // Cek status saldo awal saat komponen dimount
  useEffect(() => {
    const checkInitialBalance = async () => {
      const result = await checkInitialBalanceExists()
      setIsInitialBalanceSet(result.exists)
    }
    checkInitialBalance()
  }, [])
  
  // Fungsi untuk memuat data
  const loadData = async () => {
    setIsLoading(true)
    try {
      // Dapatkan data transaksi
      const transactionsResult = await getDanaMandiriTransactions(selectedYear)
      if (transactionsResult.success && transactionsResult.data) {
        // Konversi tanggal dalam respons ke objek Date
        const processedTransactions = transactionsResult.data.map(tx => ({
          ...tx,
          tanggal: new Date(tx.tanggal),
          tanggalSetor: tx.tanggalSetor ? new Date(tx.tanggalSetor) : undefined
        }))
        setTransactions(processedTransactions as DanaMandiriTransaction[])
      } else {
        toast.error(transactionsResult.error || "Gagal mengambil data transaksi")
      }
      
      // Dapatkan data ringkasan
      const summaryResult = await getDanaMandiriSummary(selectedYear)
      if (summaryResult.success && summaryResult.data) {
        setSummaryData(summaryResult.data)
      } else {
        toast.error(summaryResult.error || "Gagal mengambil data ringkasan")
      }
      
      // Dapatkan data tunggakan
      const arrearsResult = await getDanaMandiriArrears()
      setArrears(arrearsResult)
      
      // Dapatkan data keluarga
      const keluargaResult = await getKeluargaList()
      if (keluargaResult.success && keluargaResult.data) {
        setKeluargaList(keluargaResult.data)
      } else {
        toast.error(keluargaResult.error || "Gagal mengambil data keluarga")
      }
      
      // Dapatkan data pengaturan iuran dana mandiri
      const duesSettingResult = await getDanaMandiriSetting(selectedYear)
      if (duesSettingResult.success && duesSettingResult.data) {
        setCurrentDuesAmount(duesSettingResult.data.amount)
      }
    } catch (error) {
      console.error("Error saat memuat data:", error)
      toast.error("Terjadi kesalahan saat memuat data")
    } finally {
      setIsLoading(false)
    }
  }
  
  // Muat data saat komponen dimount atau tahun berubah
  useEffect(() => {
    loadData()
  }, [selectedYear])
  
  // Calculate total selected amount for submission to paroki
  const totalSelectedAmount = transactions
    .filter(tx => selectedTransactionIds.includes(tx.id))
    .reduce((sum, tx) => sum + tx.jumlahDibayar, 0)
  
  // Handle transaction selection
  const handleTransactionSelectChange = (idOrIds: string | string[], isChecked: boolean) => {
    if (Array.isArray(idOrIds)) {
      // Handle multiple IDs (for select all)
      setSelectedTransactionIds(idOrIds);
    } else {
      // Handle single ID
      if (isChecked) {
        setSelectedTransactionIds(prev => [...prev, idOrIds]);
      } else {
        setSelectedTransactionIds(prev => prev.filter(txId => txId !== idOrIds));
      }
    }
  }
  
  // Handle family selection for reminders
  const handleFamilySelectChange = (id: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedFamilyIds(prev => [...prev, id])
    } else {
      setSelectedFamilyIds(prev => prev.filter(fId => fId !== id))
    }
  }
  
  // Handle selecting all transactions
  const handleSelectAllTransactions = (transactionIds: string[]) => {
    setSelectedTransactionIds(transactionIds);
  }
  
  // Handle selecting all families for reminders
  const handleSelectAllFamilies = (familyIds: string[]) => {
    setSelectedFamilyIds(familyIds);
  }
  
  // Handle adding new transaction
  const handleAddTransaction = async (values: TransactionFormValues) => {
    // Validasi hak akses modifikasi
    if (!canModifyData && userRole !== 'SUPER_USER') {
      toast.error("Anda tidak memiliki izin untuk melakukan perubahan data")
      return
    }
    
    setIsMutating(true)
    
    try {
      // Buat form data
      const formData = new FormData()
      formData.append("familyHeadId", values.familyHeadId)
      formData.append("year", values.year.toString())
      formData.append("amount", values.amount.toString())
      formData.append("statusPembayaran", values.statusPembayaran)
      if (values.periodeBayar) formData.append("periodeBayar", values.periodeBayar.toString())
      
      // Tambahkan transaksi
      const result = await addDanaMandiriTransaction(formData)
      
      if (result.success) {
        toast.success("Transaksi berhasil ditambahkan")
        loadData() // Muat ulang data
      } else {
        toast.error(result.error || "Gagal menambahkan transaksi")
      }
    } catch (error) {
      console.error("Error saat menambahkan transaksi:", error)
      toast.error("Terjadi kesalahan saat menambahkan transaksi")
    } finally {
      setIsMutating(false)
      setAddDialogOpen(false)
    }
  }
  
  // Handle editing transaction
  const handleEditTransaction = async (values: TransactionFormValues) => {
    // Validasi hak akses modifikasi
    if (!canModifyData && userRole !== 'SUPER_USER') {
      toast.error("Anda tidak memiliki izin untuk melakukan perubahan data")
      return
    }
    
    if (!editingTransaction) return
    
    setIsMutating(true)
    
    try {
      // Buat form data
      const formData = new FormData()
      formData.append("id", editingTransaction.id)
      formData.append("familyHeadId", values.familyHeadId)
      formData.append("year", values.year.toString())
      formData.append("amount", values.amount.toString())
      formData.append("statusPembayaran", values.statusPembayaran)
      if (values.periodeBayar) formData.append("periodeBayar", values.periodeBayar.toString())
      
      // Update transaksi
      const result = await updateDanaMandiriTransaction(formData)
      
      if (result.success) {
        toast.success("Transaksi berhasil diperbarui")
        loadData() // Muat ulang data
      } else {
        toast.error(result.error || "Gagal memperbarui transaksi")
      }
    } catch (error) {
      console.error("Error saat memperbarui transaksi:", error)
      toast.error("Terjadi kesalahan saat memperbarui transaksi")
    } finally {
      setIsMutating(false)
      setEditDialogOpen(false)
      setEditingTransaction(null)
    }
  }
  
  // Begin edit transaction
  const startEditTransaction = (id: string) => {
    // Validasi hak akses modifikasi
    if (!canModifyData && userRole !== 'SUPER_USER') {
      toast.error("Anda tidak memiliki izin untuk melakukan perubahan data")
      return
    }
    
    const transaction = transactions.find(tx => tx.id === id)
    if (transaction) {
      setEditingTransaction(transaction)
      setEditDialogOpen(true)
    }
  }
  
  // Handle delete transaction
  const handleDeleteTransaction = async (id: string) => {
    // Validasi hak akses modifikasi
    if (!canModifyData && userRole !== 'SUPER_USER') {
      toast.error("Anda tidak memiliki izin untuk menghapus data")
      return
    }
    
    setIsMutating(true)
    
    try {
      // Hapus transaksi
      const result = await deleteDanaMandiriTransaction(id)
      
      if (result.success) {
        toast.success("Transaksi berhasil dihapus")
        loadData() // Muat ulang data
      } else {
        toast.error(result.error || "Gagal menghapus transaksi")
      }
    } catch (error) {
      console.error("Error saat menghapus transaksi:", error)
      toast.error("Terjadi kesalahan saat menghapus transaksi")
    } finally {
      setIsMutating(false)
    }
  }
  
  // Handle print PDF
  const handlePrintPdf = (values: PrintPdfFormValues) => {
    // Show PDF preview with selected data
    setPdfPreviewData({
      documentType: values.documentType,
      documentCategory: values.documentCategory,
      month: values.month,
      year: values.year
    })
    
    // Open PDF preview
    setPdfPreviewOpen(true)
    
    // Close dialog
    setPrintDialogOpen(false)
  }
  
  // Handle set dues
  const handleSetDues = async (values: SetDuesValues) => {
    // Validasi hak akses modifikasi
    if (!canModifyData && userRole !== 'SUPER_USER') {
      toast.error("Anda tidak memiliki izin untuk mengatur iuran")
      return
    }
    
    setIsMutating(true)
    
    try {
      // Buat form data
      const formData = new FormData()
      formData.append("year", values.year.toString())
      formData.append("amount", values.amount.toString())
      
      // Set iuran
      const result = await setDanaMandiriDues(formData)
      
      if (result.success) {
        toast.success(`Iuran Dana Mandiri tahun ${values.year} berhasil ditetapkan sebesar ${formatCurrency(values.amount)}`)
        // Refresh data untuk menampilkan perubahan tunggakan
        loadData()
      } else {
        toast.error(result.error || "Gagal mengatur iuran")
      }
    } catch (error) {
      console.error("Error saat mengatur iuran:", error)
      toast.error("Terjadi kesalahan saat mengatur iuran")
    } finally {
      setIsMutating(false)
      setSetDuesDialogOpen(false)
    }
  }
  
  // Handle submit to paroki
  const handleSubmitToParoki = async (values: { transactionIds: string[], submissionDate: Date, submissionNote?: string }) => {
    // Validasi hak akses modifikasi
    if (!canModifyData && userRole !== 'SUPER_USER') {
      toast.error("Anda tidak memiliki izin untuk menyetor dana")
      return
    }
    
    if (values.transactionIds.length === 0) {
      toast.error("Pilih transaksi yang akan disetor terlebih dahulu")
      return
    }
    
    setIsMutating(true)
    
    try {
      // Buat form data
      const formData = new FormData()
      formData.append("transactionIds", values.transactionIds.join(","))
      formData.append("submissionDate", values.submissionDate.toISOString())
      if (values.submissionNote) formData.append("submissionNote", values.submissionNote)
      
      // Setor ke paroki
      const result = await submitToParoki(formData)
      
      if (result.success) {
        toast.success("Transaksi berhasil disetor ke paroki")
        setSelectedTransactionIds([]) // Clear selection
        loadData() // Muat ulang data
      } else {
        toast.error(result.error || "Gagal menyetor ke paroki")
      }
    } catch (error) {
      console.error("Error saat menyetor ke paroki:", error)
      toast.error("Terjadi kesalahan saat menyetor ke paroki")
    } finally {
      setIsMutating(false)
      setSubmitDialogOpen(false)
    }
  }
  
  // Handle send reminder
  const handleSendReminder = async (values: SendReminderValues) => {
    // Validasi hak akses
    if (userRole !== 'SUPER_USER' && userRole !== 'KETUA' && userRole !== 'WAKIL_KETUA' && userRole !== 'BENDAHARA') {
      toast.error("Anda tidak memiliki izin untuk mengirim pengingat")
      return
    }
    
    setIsMutating(true)
    
    try {
      // Buat form data
      const formData = new FormData()
      formData.append("familyHeadIds", values.familyHeadIds.join(","))
      formData.append("message", values.message)
      
      // Kirim pengingat
      const result = await sendReminderNotifications(formData)
      
      if (result.success) {
        toast.success(`Berhasil mengirim pengingat kepada ${result.count || values.familyHeadIds.length} kepala keluarga`)
        setSelectedFamilyIds([]) // Clear selection
      } else {
        toast.error(result.error || "Gagal mengirim pengingat")
      }
    } catch (error) {
      console.error("Error saat mengirim pengingat:", error)
      toast.error("Terjadi kesalahan saat mengirim pengingat")
    } finally {
      setIsMutating(false)
      setReminderDialogOpen(false)
    }
  }

  // Handle view transaction detail
  const handleViewTransactionDetail = (transaction: DanaMandiriTransaction) => {
    setSelectedTransactionDetail(transaction)
    setDetailDialogOpen(true)
  }

  // Handle pemilihan tahun saat akan set dues
  const handleOpenSetDuesDialog = async () => {
    // Dapatkan setting iuran terbaru untuk tahun yang dipilih
    const duesSettingResult = await getDanaMandiriSetting(selectedYear)
    if (duesSettingResult.success && duesSettingResult.data) {
      setCurrentDuesAmount(duesSettingResult.data.amount)
    }
    
    // Buka dialog
    setSetDuesDialogOpen(true)
  }

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
    
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Dana Mandiri</h1>
        <div className="flex items-center gap-2">
          <div className="flex gap-2">
            <select
              className="border rounded p-1 text-sm"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="transactions">Transaksi Dana Mandiri</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring Penunggak</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <SummaryCards 
            totalCollected={summaryData.totalTerkumpul} 
            paidCount={summaryData.jumlahKKLunas} 
            unpaidCount={summaryData.jumlahKKBelumLunas} 
          />

          <div className="flex flex-wrap gap-2">
            {(canModifyData || userRole === 'SUPER_USER') && (
              <Button 
                onClick={() => setAddDialogOpen(true)} 
                disabled={isMutating || !isInitialBalanceSet}
                title={!isInitialBalanceSet ? "Saldo awal kas lingkungan harus diset terlebih dahulu" : "Input Transaksi"}
              >
                Input Transaksi
              </Button>
            )}
            
            <Button 
              onClick={() => setPrintDialogOpen(true)} 
              variant="outline"
              disabled={isMutating}
            >
              Print PDF
            </Button>
            
            {(canModifyData || userRole === 'SUPER_USER') && (
              <Button 
                onClick={() => setSubmitDialogOpen(true)} 
                variant="secondary" 
                disabled={selectedTransactionIds.length === 0 || isMutating}
              >
                Setor ke Paroki
                {selectedTransactionIds.length > 0 && ` (${selectedTransactionIds.length})`}
              </Button>
            )}
          </div>

          <TransactionsTable 
            transactions={transactions}
            keluargaList={keluargaList}
            isLoading={isLoading}
            selectedIds={selectedTransactionIds}
            onSelect={handleTransactionSelectChange}
            onSelectAll={handleSelectAllTransactions}
            onEdit={startEditTransaction}
            onDelete={handleDeleteTransaction}
            canModifyData={canModifyData || userRole === 'SUPER_USER'}
            onViewDetail={handleViewTransactionDetail}
          />
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {(canModifyData || userRole === 'SUPER_USER') && (
              <Button 
                onClick={handleOpenSetDuesDialog}
                disabled={isMutating}
              >
                Set Iuran Dana Mandiri
              </Button>
            )}
            
            <Button 
              onClick={() => setReminderDialogOpen(true)} 
              variant="secondary"
              disabled={isMutating}
            >
              Kirim Pengingat
              {selectedFamilyIds.length > 0 && ` (${selectedFamilyIds.length})`}
            </Button>
          </div>

          <MonitoringTable 
            arrears={arrears}
            isLoading={isLoading}
            selectedIds={selectedFamilyIds}
            onSelect={handleFamilySelectChange}
            onSelectAll={handleSelectAllFamilies}
          />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <TransactionFormDialog 
        open={addDialogOpen} 
        onOpenChange={setAddDialogOpen} 
        onSubmit={handleAddTransaction}
        keluargaList={keluargaList}
      />
      
      {editingTransaction && (
        <TransactionFormDialog 
          open={editDialogOpen} 
          onOpenChange={setEditDialogOpen} 
          onSubmit={handleEditTransaction}
          initialData={{
            familyHeadId: editingTransaction.keluargaId,
            year: editingTransaction.tahun,
            amount: editingTransaction.jumlahDibayar,
            statusPembayaran: editingTransaction.statusPembayaran || "lunas",
            periodeBayar: editingTransaction.periodeBayar,
          }}
          keluargaList={keluargaList}
        />
      )}
      
      <PrintPdfDialog 
        open={printDialogOpen} 
        onOpenChange={setPrintDialogOpen} 
        onSubmit={handlePrintPdf} 
      />
      
      <PDFPreviewDialog
        open={pdfPreviewOpen}
        onOpenChange={setPdfPreviewOpen}
        data={pdfPreviewData}
        transactions={transactions}
      />
      
      <SetDuesDialog
        open={setDuesDialogOpen}
        onOpenChange={setSetDuesDialogOpen}
        onSubmit={handleSetDues}
        currentAmount={currentDuesAmount}
      />
      
      <ReminderDialog
        open={reminderDialogOpen}
        onOpenChange={setReminderDialogOpen}
        onSubmit={handleSendReminder}
        familyHeadIds={selectedFamilyIds}
        familyList={arrears.filter(a => selectedFamilyIds.includes(a.keluargaId)).map(a => ({
          id: a.keluargaId,
          name: a.namaKepalaKeluarga,
          phoneNumber: a.nomorTelepon
        }))}
      />
      
      <SubmitToParokiDialog
        open={submitDialogOpen}
        onOpenChange={setSubmitDialogOpen}
        onSubmit={handleSubmitToParoki}
        selectedTransactions={transactions.filter(t => selectedTransactionIds.includes(t.id))}
        totalAmount={totalSelectedAmount}
      />
      
      <TransactionDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        transaction={selectedTransactionDetail}
      />
      
      <SlipPenyetoranDialog
        open={slipPenyetoranDialogOpen}
        onOpenChange={setSlipPenyetoranDialogOpen}
        year={selectedYear}
      />
    </div>
  )
} 