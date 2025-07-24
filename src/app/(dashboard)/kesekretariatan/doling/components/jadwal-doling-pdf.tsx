"use client";

import { useState } from "react";
import { JadwalDoling } from "../types";
import { Document, Page, Text, View, StyleSheet, PDFViewer, PDFDownloadLink } from "@react-pdf/renderer";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { DownloadIcon } from "lucide-react";

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 30,
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 20,
  },
  templateLabel: {
    fontSize: 8,
    marginBottom: 20,
    textAlign: "left",
    color: "#888888",
  },
  table: {
    display: "flex",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableColHeader: {
    width: "25%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    backgroundColor: "#f0f0f0",
    padding: 5,
  },
  tableCol: {
    width: "25%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    padding: 5,
  },
  tableCellHeader: {
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
  },
  tableCell: {
    fontSize: 10,
    textAlign: "left",
  },
  signatureSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  signatureCol: {
    width: "45%",
  },
  signatureLabel: {
    fontSize: 10,
    marginBottom: 10,
    textAlign: "center",
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    borderBottomStyle: "solid",
    marginTop: 40,
    marginHorizontal: 20,
  },
  signatureText: {
    fontSize: 10,
    textAlign: "center",
    marginTop: 5,
  },
});

interface JadwalDolingPDFProps {
  jadwal: JadwalDoling[];
  startMonth: number;
  startYear: number;
  endMonth: number;
  endYear: number;
}

// Buat komponen PDF dokumen terpisah agar bisa dipakai di PDFViewer dan PDFDownloadLink
const PDFDocument = ({
  jadwal,
  startMonth,
  startYear,
  endMonth,
  endYear,
}: JadwalDolingPDFProps) => {
  // Filter jadwal berdasarkan rentang tanggal
  const filteredJadwal = jadwal.filter((item) => {
    const itemDate = item.tanggal;
    const startDate = new Date(startYear, startMonth - 1, 1);
    const endDate = new Date(endYear, endMonth - 1, 31);
    return itemDate >= startDate && itemDate <= endDate;
  });

  // Format bulan untuk judul
  const formatPeriode = () => {
    const startMonthName = format(new Date(startYear, startMonth - 1, 1), "MMMM", { locale: id });
    const endMonthName = format(new Date(endYear, endMonth - 1, 1), "MMMM", { locale: id });
    
    if (startYear === endYear && startMonth === endMonth) {
      return `${startMonthName} ${startYear}`;
    } else if (startYear === endYear) {
      return `${startMonthName} s.d. ${endMonthName} ${startYear}`;
    } else {
      return `${startMonthName} ${startYear} s.d. ${endMonthName} ${endYear}`;
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.templateLabel}>TEMPLATE JADWAL DOLING</Text>
        <Text style={styles.title}>JADWAL TUAN RUMAH DOA LINGKUNGAN ST. AGATHA</Text>
        <Text style={styles.subtitle}>
          {formatPeriode()}
        </Text>

        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Calon Tuan Rumah</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Tanggal Di Jadwalkan</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Alamat</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Keterangan</Text>
            </View>
          </View>

          {filteredJadwal.length > 0 ? (
            filteredJadwal.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{item.tuanRumah}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>
                    {format(item.tanggal, "dd MMMM yyyy", { locale: id })} {item.waktu} WIB
                  </Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{item.alamat}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{item.temaIbadat || "-"}</Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.tableRow}>
              <View style={[styles.tableCol, { width: "100%" }]}>
                <Text style={styles.tableCell}>Tidak ada jadwal di periode ini</Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.signatureSection}>
          <View style={styles.signatureCol}>
            <Text style={styles.signatureLabel}>Disusun Oleh,</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureText}>Ketua / Wakil Ketua Lingkungan</Text>
          </View>
          <View style={styles.signatureCol}>
            <Text style={styles.signatureLabel}>Dipublikasikan Oleh,</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureText}>Sekretaris/Wakil Sekretaris Lingkungan</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export function JadwalDolingPDF(props: JadwalDolingPDFProps) {
  const [isDownloadReady, setIsDownloadReady] = useState(false);

  // Format nama file download
  const getFileName = () => {
    const { startMonth, startYear, endMonth, endYear } = props;
    const startMonthName = format(new Date(startYear, startMonth - 1, 1), "MMM", { locale: id });
    const endMonthName = format(new Date(endYear, endMonth - 1, 1), "MMM", { locale: id });
    
    if (startYear === endYear && startMonth === endMonth) {
      return `Jadwal_Doling_${startMonthName}_${startYear}.pdf`;
    } else if (startYear === endYear) {
      return `Jadwal_Doling_${startMonthName}-${endMonthName}_${startYear}.pdf`;
    } else {
      return `Jadwal_Doling_${startMonthName}${startYear}-${endMonthName}${endYear}.pdf`;
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Tombol Download */}
      <div className="text-right">
        <PDFDownloadLink 
          document={<PDFDocument {...props} />} 
          fileName={getFileName()}
          className="inline-flex"
        >
          {({ loading, error }) => 
            <Button 
              variant="outline" 
              disabled={loading} 
              className="gap-2"
              onMouseEnter={() => setIsDownloadReady(true)}
            >
              <DownloadIcon className="h-4 w-4" />
              {loading ? "Menyiapkan..." : "Download PDF"}
            </Button>
          }
        </PDFDownloadLink>
      </div>

      {/* PDF Preview */}
      <PDFViewer style={{ width: "100%", height: "70vh", maxHeight: "600px" }}>
        <PDFDocument {...props} />
      </PDFViewer>
    </div>
  );
} 