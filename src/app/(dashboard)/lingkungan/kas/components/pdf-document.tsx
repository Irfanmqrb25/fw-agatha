import React from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { TransactionData } from '../types';
import { JenisTransaksi, TipeTransaksiLingkungan } from "@prisma/client";

// Definisi properti untuk komponen PDFDocument
interface PDFDocumentProps {
  dateRange: {
    from: Date;
    to: Date;
  };
  transactions: TransactionData[];
  summary: {
    initialBalance: number;
    totalIncome: number;
    totalExpense: number;
    finalBalance: number;
  };
}

// Styles untuk PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 12,
    lineHeight: 1.5,
  },
  title: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  subTitle: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 20,
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableColHeader: {
    width: '33.33%',
    borderStyle: 'solid',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderColor: '#000',
    padding: 5,
    fontWeight: 'bold',
    backgroundColor: '#f0f0f0',
  },
  tableCol: {
    width: '33.33%',
    borderStyle: 'solid',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderColor: '#000',
    padding: 5,
  },
  tableColBold: {
    width: '33.33%',
    borderStyle: 'solid',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderColor: '#000',
    padding: 5,
    fontWeight: 'bold',
  },
  summaryContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  summaryLabel: {
    width: '60%',
  },
  summaryValue: {
    width: '40%',
  },
  bold: {
    fontWeight: 'bold',
  },
  signature: {
    marginTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureItem: {
    width: '45%',
  },
  signatureTitle: {
    marginBottom: 5,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  signatureName: {
    textAlign: 'center',
    marginTop: 50,
    paddingTop: 5,
    fontWeight: 'bold',
    borderTopWidth: 1,
    borderTopColor: '#000',
  },
});

// Komponen PDFDocument
const PDFDocument: React.FC<PDFDocumentProps> = ({ dateRange, transactions, summary }) => {
  // Kelompokkan transaksi berdasarkan tipe
  const debitBySubtype: Record<string, number> = {};
  const creditBySubtype: Record<string, number> = {};

  transactions.forEach(transaction => {
    const tipe = transaction.tipeTransaksi;
    if (transaction.jenisTransaksi === JenisTransaksi.UANG_MASUK) {
      debitBySubtype[tipe] = (debitBySubtype[tipe] || 0) + transaction.debit;
    } else if (transaction.jenisTransaksi === JenisTransaksi.UANG_KELUAR) {
      creditBySubtype[tipe] = (creditBySubtype[tipe] || 0) + transaction.kredit;
    }
  });

  // Fungsi untuk menampilkan label tipe transaksi
  const getSubtypeLabel = (tipe: TipeTransaksiLingkungan): string => {
    const subtypeLabels: Record<string, string> = {
      [TipeTransaksiLingkungan.KOLEKTE_I]: 'Kolekte I',
      [TipeTransaksiLingkungan.KOLEKTE_II]: 'Kolekte II',
      [TipeTransaksiLingkungan.SUMBANGAN_UMAT]: 'Sumbangan Umat',
      [TipeTransaksiLingkungan.PENERIMAAN_LAIN]: 'Penerimaan Lain-Lain',
      [TipeTransaksiLingkungan.BIAYA_OPERASIONAL]: 'Biaya Operasional',
      [TipeTransaksiLingkungan.PENYELENGGARAAN_KEGIATAN]: 'Penyelenggaraan Kegiatan',
      [TipeTransaksiLingkungan.PEMBELIAN]: 'Pembelian',
      [TipeTransaksiLingkungan.SOSIAL_DUKA]: 'Sosial-Duka',
      [TipeTransaksiLingkungan.TRANSFER_DANA_KE_IKATA]: 'Transfer Dana ke IKATA',
      [TipeTransaksiLingkungan.LAIN_LAIN]: 'Lain-Lain',
    };
    return subtypeLabels[tipe] || String(tipe);
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return `Rp. ${amount.toLocaleString('id-ID')}`;
  };

  // Format tanggal
  const fromDate = format(dateRange.from, 'dd MMMM yyyy', { locale: id });
  const toDate = format(dateRange.to, 'dd MMMM yyyy', { locale: id });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>LAPORAN KAS LINGKUNGAN ST. AGATHA</Text>
        <Text style={styles.subTitle}>{fromDate} s.d. {toDate}</Text>

        {/* Tabel Transaksi */}
        <View style={styles.table}>
          {/* Header */}
          <View style={styles.tableRow}>
            <View style={styles.tableColHeader}>
              <Text>Jenis Transaksi</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text>Tipe Transaksi</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text>Nominal</Text>
            </View>
          </View>

          {/* Uang Masuk */}
          <View style={styles.tableRow}>
            <View style={styles.tableColBold}>
              <Text>Uang Masuk</Text>
            </View>
            <View style={styles.tableCol}></View>
            <View style={styles.tableCol}></View>
          </View>

          {/* Detail Uang Masuk */}
          {Object.entries(debitBySubtype).map(([key, amount], index) => (
            <View style={styles.tableRow} key={`debit-${index}`}>
              <View style={styles.tableCol}></View>
              <View style={styles.tableCol}>
                <Text>{getSubtypeLabel(key as TipeTransaksiLingkungan)}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text>{formatCurrency(amount)}</Text>
              </View>
            </View>
          ))}

          {/* Subtotal Uang Masuk */}
          <View style={styles.tableRow}>
            <View style={styles.tableCol}></View>
            <View style={styles.tableColBold}>
              <Text>Total Uang Masuk</Text>
            </View>
            <View style={styles.tableColBold}>
              <Text>{formatCurrency(summary.totalIncome)}</Text>
            </View>
          </View>

          {/* Uang Keluar */}
          <View style={styles.tableRow}>
            <View style={styles.tableColBold}>
              <Text>Uang Keluar</Text>
            </View>
            <View style={styles.tableCol}></View>
            <View style={styles.tableCol}></View>
          </View>

          {/* Detail Uang Keluar */}
          {Object.entries(creditBySubtype).map(([key, amount], index) => (
            <View style={styles.tableRow} key={`credit-${index}`}>
              <View style={styles.tableCol}></View>
              <View style={styles.tableCol}>
                <Text>{getSubtypeLabel(key as TipeTransaksiLingkungan)}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text>{formatCurrency(amount)}</Text>
              </View>
            </View>
          ))}

          {/* Subtotal Uang Keluar */}
          <View style={styles.tableRow}>
            <View style={styles.tableCol}></View>
            <View style={styles.tableColBold}>
              <Text>Total Uang Keluar</Text>
            </View>
            <View style={styles.tableColBold}>
              <Text>{formatCurrency(summary.totalExpense)}</Text>
            </View>
          </View>
        </View>

        {/* Ringkasan */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Saldo Awal</Text>
            <Text style={styles.summaryValue}>{formatCurrency(summary.initialBalance)}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Pemasukan</Text>
            <Text style={styles.summaryValue}>{formatCurrency(summary.totalIncome)}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Pengeluaran</Text>
            <Text style={styles.summaryValue}>{formatCurrency(summary.totalExpense)}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, styles.bold]}>Saldo Akhir</Text>
            <Text style={[styles.summaryValue, styles.bold]}>{formatCurrency(summary.finalBalance)}</Text>
          </View>
        </View>

        {/* Tanda Tangan */}
        <View style={styles.signature}>
          <View style={styles.signatureItem}>
            <Text style={styles.signatureTitle}>Dibuat oleh,</Text>
            <View>
              <Text style={styles.signatureName}>Bendahara Lingkungan</Text>
            </View>
          </View>
          <View style={styles.signatureItem}>
            <Text style={styles.signatureTitle}>Disetujui oleh,</Text>
            <View>
              <Text style={styles.signatureName}>Ketua Lingkungan</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default PDFDocument; 