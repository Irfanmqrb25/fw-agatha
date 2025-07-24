"use client";

import { useState } from "react";
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
    marginBottom: 20,
  },
  pageLabel: {
    fontSize: 8,
    marginBottom: 10,
    textAlign: "left",
    color: "#666666",
  },
  formContainer: {
    marginTop: 20,
  },
  formRow: {
    marginBottom: 10,
    flexDirection: "row",
  },
  formNumber: {
    fontSize: 11,
    fontWeight: "bold",
    width: 20,
  },
  formLabel: {
    fontSize: 11,
    fontWeight: "bold",
    width: 140,
  },
  formValue: {
    fontSize: 11,
    flex: 1,
  },
  formSubRow: {
    marginBottom: 6,
    paddingLeft: 20,
    flexDirection: "row",
  },
  formSubLabel: {
    fontSize: 10,
    width: 140,
    marginRight: 5,
  },
  formSubValue: {
    fontSize: 10,
    flex: 1,
  },
  formSection: {
    marginBottom: 10,
  },
  signatureSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    position: "absolute",
    bottom: 40,
    left: 30,
    right: 30,
  },
  signatureCol: {
    width: "45%",
  },
  signatureLabel: {
    fontSize: 10,
    marginBottom: 10,
    textAlign: "center",
    fontWeight: "bold",
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
    marginTop: 10,
  },
  // Lampiran styles
  tableTitle: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
  },
  tableSubtitle: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  table: {
    display: "flex",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    marginTop: 30,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableColHeader: {
    flexGrow: 1,
    width: "50%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    backgroundColor: "#f0f0f0",
    padding: 8,
  },
  tableCol: {
    flexGrow: 1,
    width: "50%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    padding: 8,
  },
  tableCellHeader: {
    fontSize: 11,
    fontWeight: "bold",
    textAlign: "center",
  },
  tableCell: {
    fontSize: 10,
    textAlign: "center",
  },
});

interface KepalaKeluarga {
  nama: string;
  status: 'hadir' | 'hanya_suami' | 'hanya_istri' | 'tidak_hadir';
}

interface RiwayatDolingPDFProps {
  data: {
    tanggal: Date;
    jenisIbadat: string;
    subIbadat: string;
    temaIbadat: string;
    tuanRumah: string;
    // Statistik kehadiran
    jumlahKK: number;
    jumlahBapak: number;
    jumlahIbu: number;
    jumlahOMK: number;
    jumlahBIR: number;
    jumlahBIA: number;
    jumlahBIA713: number;
    // Penerimaan
    kolekte1: number;
    kolekte2: number;
    ucapanSyukur: number;
    // Kehadiran KK
    kepalaKeluarga: KepalaKeluarga[];
    pemimpinIbadat?: string;
    pemimpinRosario?: string;
    pembawaRenungan?: string;
    pembawaLagu?: string;
    doaUmat?: string;
    bacaan?: string;
    pemimpinMisa?: string;
    pemazmur?: string;
  };
}

// Komponen dokumen PDF
const PDFDocument = ({ data }: RiwayatDolingPDFProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return format(date, "dd MMMM yyyy", { locale: id });
  };

  // Fungsi untuk memformat tampilan jenis ibadat
  const formatJenisIbadat = (jenis: string) => {
    return jenis.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  // Fungsi untuk memformat tampilan sub ibadat
  const formatSubIbadat = (sub: string) => {
    return sub.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  return (
    <Document>
      {/* Halaman 1: Lembar Administrasi */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.pageLabel}>HALAMAN 1</Text>
        
        <Text style={styles.title}>LEMBAR ADMINISTRASI DOA LINGKUNGAN ST. AGATHA</Text>
        
        <View style={styles.formContainer}>
          <View style={styles.formRow}>
            <Text style={styles.formNumber}>1.</Text>
            <Text style={styles.formLabel}>Tanggal</Text>
            <Text style={styles.formValue}>: {formatDate(data.tanggal)}</Text>
          </View>
          <View style={styles.formRow}>
            <Text style={styles.formNumber}>2.</Text>
            <Text style={styles.formLabel}>Jenis Ibadat</Text>
            <Text style={styles.formValue}>: {formatJenisIbadat(data.jenisIbadat)}</Text>
          </View>
          <View style={styles.formRow}>
            <Text style={styles.formNumber}>3.</Text>
            <Text style={styles.formLabel}>Sub Ibadat</Text>
            <Text style={styles.formValue}>: {formatSubIbadat(data.subIbadat)}</Text>
          </View>
          <View style={styles.formRow}>
            <Text style={styles.formNumber}>4.</Text>
            <Text style={styles.formLabel}>Tema Ibadat</Text>
            <Text style={styles.formValue}>: {data.temaIbadat}</Text>
          </View>
          <View style={styles.formRow}>
            <Text style={styles.formNumber}>5.</Text>
            <Text style={styles.formLabel}>Tuan Rumah</Text>
            <Text style={styles.formValue}>: {data.tuanRumah}</Text>
          </View>
          
          <View style={styles.formSection}>
            <View style={styles.formRow}>
              <Text style={styles.formNumber}>6.</Text>
              <Text style={styles.formLabel}>Statistik Umat</Text>
            </View>
            <View style={styles.formSubRow}>
              <Text style={styles.formSubLabel}>a. Jumlah KK Hadir</Text>
              <Text style={styles.formSubValue}>: {data.jumlahKK}</Text>
            </View>
            <View style={styles.formSubRow}>
              <Text style={styles.formSubLabel}>b. Bapak</Text>
              <Text style={styles.formSubValue}>: {data.jumlahBapak}</Text>
            </View>
            <View style={styles.formSubRow}>
              <Text style={styles.formSubLabel}>c. Ibu</Text>
              <Text style={styles.formSubValue}>: {data.jumlahIbu}</Text>
            </View>
            <View style={styles.formSubRow}>
              <Text style={styles.formSubLabel}>d. OMK</Text>
              <Text style={styles.formSubValue}>: {data.jumlahOMK}</Text>
            </View>
            <View style={styles.formSubRow}>
              <Text style={styles.formSubLabel}>e. BIR</Text>
              <Text style={styles.formSubValue}>: {data.jumlahBIR}</Text>
            </View>
            <View style={styles.formSubRow}>
              <Text style={styles.formSubLabel}>f. BIA (0 s.d. 6 tahun)</Text>
              <Text style={styles.formSubValue}>: {data.jumlahBIA}</Text>
            </View>
            <View style={styles.formSubRow}>
              <Text style={styles.formSubLabel}>g. BIA (7-13 tahun)</Text>
              <Text style={styles.formSubValue}>: {data.jumlahBIA713}</Text>
            </View>
          </View>
          
          <View style={styles.formSection}>
            <View style={styles.formRow}>
              <Text style={styles.formNumber}>7.</Text>
              <Text style={styles.formLabel}>Penerimaan</Text>
            </View>
            <View style={styles.formSubRow}>
              <Text style={styles.formSubLabel}>a. Kolekte I</Text>
              <Text style={styles.formSubValue}>: {formatCurrency(data.kolekte1)}</Text>
            </View>
            <View style={styles.formSubRow}>
              <Text style={styles.formSubLabel}>b. Kolekte II</Text>
              <Text style={styles.formSubValue}>: {formatCurrency(data.kolekte2)}</Text>
            </View>
            <View style={styles.formSubRow}>
              <Text style={styles.formSubLabel}>c. Ucapan Syukur</Text>
              <Text style={styles.formSubValue}>: {formatCurrency(data.ucapanSyukur)}</Text>
            </View>
          </View>
          
          <View style={styles.formSection}>
            <View style={styles.formRow}>
              <Text style={styles.formNumber}>8.</Text>
              <Text style={styles.formLabel}>Keibadatan</Text>
            </View>
            {data.jenisIbadat === "DOA_LINGKUNGAN" && (
              <>
                <View style={styles.formSubRow}>
                  <Text style={styles.formSubLabel}>a. Pemimpin Ibadat</Text>
                  <Text style={styles.formSubValue}>: {data.pemimpinIbadat || "______________________"}</Text>
                </View>
                <View style={styles.formSubRow}>
                  <Text style={styles.formSubLabel}>b. Pemimpin Rosario</Text>
                  <Text style={styles.formSubValue}>: {data.pemimpinRosario || "______________________"}</Text>
                </View>
                <View style={styles.formSubRow}>
                  <Text style={styles.formSubLabel}>c. Pembawa Renungan</Text>
                  <Text style={styles.formSubValue}>: {data.pembawaRenungan || "______________________"}</Text>
                </View>
                <View style={styles.formSubRow}>
                  <Text style={styles.formSubLabel}>d. Pembawa Lagu</Text>
                  <Text style={styles.formSubValue}>: {data.pembawaLagu || "______________________"}</Text>
                </View>
                <View style={styles.formSubRow}>
                  <Text style={styles.formSubLabel}>e. Doa Umat</Text>
                  <Text style={styles.formSubValue}>: {data.doaUmat || "______________________"}</Text>
                </View>
                <View style={styles.formSubRow}>
                  <Text style={styles.formSubLabel}>f. Bacaan</Text>
                  <Text style={styles.formSubValue}>: {data.bacaan || "______________________"}</Text>
                </View>
              </>
            )}
            {data.jenisIbadat === "MISA" && (
              <>
                <View style={styles.formSubRow}>
                  <Text style={styles.formSubLabel}>a. Pemimpin Misa</Text>
                  <Text style={styles.formSubValue}>: {data.pemimpinMisa || "______________________"}</Text>
                </View>
                <View style={styles.formSubRow}>
                  <Text style={styles.formSubLabel}>b. Pemazmur</Text>
                  <Text style={styles.formSubValue}>: {data.pemazmur || "______________________"}</Text>
                </View>
              </>
            )}
          </View>
        </View>

        <View style={styles.signatureSection}>
          <View style={styles.signatureCol}>
            <Text style={styles.signatureLabel}>Disusun Oleh,</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureText}>Sekretaris / Wakil Sekretaris Lingkungan</Text>
          </View>
          <View style={styles.signatureCol}>
            <Text style={styles.signatureLabel}>Disetujui Oleh,</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureText}>Ketua/Wakil Ketua Lingkungan</Text>
          </View>
        </View>
      </Page>

      {/* Halaman 2: Lampiran Absensi */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.pageLabel}>HALAMAN 2</Text>
        
        <Text style={styles.tableTitle}>LAMPIRAN LEMBAR ADMINISTRASI</Text>
        <Text style={styles.tableSubtitle}>DOA LINGKUNGAN ST. AGATHA (ABSENSI)</Text>
        
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>NAMA KEPALA KELUARGA</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>KEHADIRAN (SUAMI + ISTRI)</Text>
            </View>
          </View>

          {data.kepalaKeluarga.map((kk, index) => (
            <View key={index} style={styles.tableRow}>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{kk.nama}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>
                  {kk.status === 'hadir' ? 'Suami + istri hadir' : 
                   kk.status === 'hanya_suami' ? 'Hanya Suami' : 
                   kk.status === 'hanya_istri' ? 'Hanya Istri' : 
                   'Tidak Hadir'}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
};

export function RiwayatDolingPDF({ data }: RiwayatDolingPDFProps) {
  const [isDownloadReady, setIsDownloadReady] = useState(false);
  
  const getFileName = () => {
    return `Administrasi_Doling_${format(data.tanggal, "ddMMyyyy")}.pdf`;
  };
  
  return (
    <div className="flex flex-col gap-4">
      {/* Tombol Download */}
      <div className="text-right">
        <PDFDownloadLink 
          document={<PDFDocument data={data} />} 
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
      
      {/* PDF Viewer */}
      <PDFViewer style={{ width: "100%", height: "70vh", maxHeight: "500px" }}>
        <PDFDocument data={data} />
      </PDFViewer>
    </div>
  );
} 