'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Search,
  Bell,
  Plus,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  X,
  CreditCard,
  FilterIcon
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SetIuranDialog } from "./set-iuran-dialog";
import { SendNotificationDialog } from "./send-notification-dialog";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import { DelinquentPayment } from "../types";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

// Tipe data untuk props komponen
interface MonitoringClientProps {
  delinquentPayments: DelinquentPayment[];
}

export default function MonitoringClient({ delinquentPayments }: MonitoringClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<DelinquentPayment | null>(null);
  const [showSetIuranDialog, setShowSetIuranDialog] = useState(false);
  const [showNotificationDialog, setShowNotificationDialog] = useState(false);

  // State untuk paginasi
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Ambil tahun saat ini dari searchParams atau gunakan tahun sekarang
  const currentYear = searchParams.get('year') ? parseInt(searchParams.get('year')!) : new Date().getFullYear();

  // Generate opsi tahun (5 tahun terakhir sampai tahun sekarang)
  const yearOptions = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - 5 + i);

  // Handler untuk mengubah tahun
  const handleYearChange = (year: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('year', year);
    router.push(`?${params.toString()}`);
  };

  // Filter data berdasarkan pencarian
  const filteredData = delinquentPayments.filter(payment =>
    payment.kepalaKeluarga.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Perhitungan untuk paginasi
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  // Data untuk halaman saat ini
  const currentPageData = filteredData.slice(startIndex, endIndex);

  const goToFirstPage = () => {
    setCurrentPage(1);
  };

  const goToLastPage = () => {
    setCurrentPage(totalPages);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Handler untuk mengubah ukuran halaman
  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value));
    setCurrentPage(1); // Reset ke halaman pertama saat mengubah ukuran halaman
  };

  const handleSetIuran = (payment: DelinquentPayment) => {
    setSelectedPayment(payment);
    setShowSetIuranDialog(true);
  };

  const handleSendNotification = () => {
    setShowNotificationDialog(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPeriod = (payment: DelinquentPayment) => {
    // Gunakan periodeTunggakan yang sudah diformat jika tersedia
    if (payment.periodeTunggakan) {
      return payment.periodeTunggakan;
    }

    // Fallback ke format lama jika periodeTunggakan tidak tersedia
    const formatDate = (dateStr: string) => {
      const [year, month] = dateStr.split("-");
      return format(new Date(parseInt(year), parseInt(month) - 1), 'MMMM yyyy', { locale: id });
    };
    return `${formatDate(payment.periodeAwal)} - ${formatDate(payment.periodeAkhir)}`;
  };

  return (
    <div className="container mx-auto py-6 space-y-6 px-4">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
        <h1 className="text-2xl font-bold">Monitoring Penunggak IKATA</h1>
        <div className="flex items-center gap-2">
          <FilterIcon className="h-4 w-4 text-muted-foreground" />
          <Select value={currentYear.toString()} onValueChange={handleYearChange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Tahun" />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-between">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama kepala keluarga"
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <Button
              variant="ghost"
              className="absolute right-0 top-0 h-9 w-9 p-0"
              onClick={() => setSearchQuery("")}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear search</span>
            </Button>
          )}
        </div>
      </div>

      <Button onClick={handleSendNotification}>
        <Bell className="mr-2 h-4 w-4" />
        Kirim Notifikasi
      </Button>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Kepala Keluarga</TableHead>
              <TableHead>Periode Tunggakan</TableHead>
              <TableHead>Jumlah Tunggakan</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentPageData.length > 0 ? (
              currentPageData.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{payment.kepalaKeluarga}</TableCell>
                  <TableCell>{formatPeriod(payment)}</TableCell>
                  <TableCell>{formatCurrency(payment.jumlahTunggakan)}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${payment.status === "belum_lunas"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                      }`}>
                      {payment.status === "belum_lunas" ? "Belum Lunas" : "Sebagian Bulan"}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6">
                  {searchQuery ? "Tidak ada data yang sesuai dengan pencarian" : "Tidak ada data penunggak iuran"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Kontrol Paginasi */}
      {filteredData.length > 0 && (
        <div className="flex flex-col space-y-4 px-2">
          {/* Tampilan mobile */}
          <div className="md:hidden flex flex-col items-center justify-center text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Menampilkan {startIndex + 1}-{endIndex} dari {totalItems} penunggak
              {searchQuery && ` (difilter dari ${delinquentPayments.length} total)`}
            </p>
            <div className="flex items-center justify-center space-x-2">
              <p className="text-sm text-muted-foreground">Tampilkan</p>
              <Select
                value={pageSize.toString()}
                onValueChange={handlePageSizeChange}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={pageSize.toString()} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">per halaman</p>
            </div>
          </div>

          {/* Navigasi halaman untuk mobile */}
          <div className="md:hidden flex flex-col items-center justify-center space-y-2">
            <div className="flex items-center justify-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={goToFirstPage}
                disabled={currentPage === 1}
                className="h-8 w-8"
              >
                <ChevronsLeftIcon className="h-4 w-4" />
                <span className="sr-only">Halaman Pertama</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="h-8 w-8"
              >
                <ChevronLeftIcon className="h-4 w-4" />
                <span className="sr-only">Halaman Sebelumnya</span>
              </Button>

              <span className="text-sm mx-2">
                Halaman {currentPage} dari {totalPages}
              </span>

              <Button
                variant="outline"
                size="icon"
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="h-8 w-8"
              >
                <ChevronRightIcon className="h-4 w-4" />
                <span className="sr-only">Halaman Berikutnya</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={goToLastPage}
                disabled={currentPage === totalPages}
                className="h-8 w-8"
              >
                <ChevronsRightIcon className="h-4 w-4" />
                <span className="sr-only">Halaman Terakhir</span>
              </Button>
            </div>
          </div>

          {/* Tampilan desktop */}
          <div className="hidden md:flex md:items-center md:justify-between">
            <div className="flex items-center space-x-2">
              <p className="text-sm text-muted-foreground">
                Menampilkan {startIndex + 1}-{endIndex} dari {totalItems} penunggak
                {searchQuery && ` (difilter dari ${delinquentPayments.length} total)`}
              </p>
              <div className="flex items-center space-x-2">
                <p className="text-sm text-muted-foreground">Tampilkan</p>
                <Select
                  value={pageSize.toString()}
                  onValueChange={handlePageSizeChange}
                >
                  <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue placeholder={pageSize.toString()} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">per halaman</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={goToFirstPage}
                disabled={currentPage === 1}
                className="h-8 w-8"
              >
                <ChevronsLeftIcon className="h-4 w-4" />
                <span className="sr-only">Halaman Pertama</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="h-8 w-8"
              >
                <ChevronLeftIcon className="h-4 w-4" />
                <span className="sr-only">Halaman Sebelumnya</span>
              </Button>

              <span className="text-sm mx-2">
                Halaman {currentPage} dari {totalPages}
              </span>

              <Button
                variant="outline"
                size="icon"
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="h-8 w-8"
              >
                <ChevronRightIcon className="h-4 w-4" />
                <span className="sr-only">Halaman Berikutnya</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={goToLastPage}
                disabled={currentPage === totalPages}
                className="h-8 w-8"
              >
                <ChevronsRightIcon className="h-4 w-4" />
                <span className="sr-only">Halaman Terakhir</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {showSetIuranDialog && selectedPayment && (
        <SetIuranDialog
          payment={{
            id: selectedPayment.id,
            kepalaKeluarga: selectedPayment.kepalaKeluarga,
            keluargaId: selectedPayment.keluargaId,
            periodeAwal: selectedPayment.periodeAwal,
            periodeAkhir: selectedPayment.periodeAkhir,
            jumlahTunggakan: selectedPayment.jumlahTunggakan,
            status: selectedPayment.status,
            createdAt: selectedPayment.createdAt,
            updatedAt: selectedPayment.updatedAt
          }}
          open={showSetIuranDialog}
          onOpenChange={setShowSetIuranDialog}
        />
      )}

      {showNotificationDialog && (
        <SendNotificationDialog
          open={showNotificationDialog}
          onOpenChange={setShowNotificationDialog}
          delinquentPayments={filteredData.map(payment => ({
            id: payment.id,
            kepalaKeluarga: payment.kepalaKeluarga,
            keluargaId: payment.keluargaId,
            periodeAwal: payment.periodeAwal,
            periodeAkhir: payment.periodeAkhir,
            jumlahTunggakan: payment.jumlahTunggakan,
            status: payment.status,
            createdAt: payment.createdAt,
            updatedAt: payment.updatedAt
          }))}
        />
      )}
    </div>
  );
} 