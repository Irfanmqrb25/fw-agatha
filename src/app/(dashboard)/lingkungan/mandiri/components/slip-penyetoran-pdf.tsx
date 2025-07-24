import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

// Define styles for PDF document
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  templateTitle: {
    fontSize: 11,
    marginBottom: 5,
    textAlign: 'center',
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
    marginBottom: 30,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableHeader: {
    backgroundColor: '#f0f0f0',
  },
  tableCell: {
    padding: 8,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
  },
  dateCell: {
    width: '25%',
  },
  nameCell: {
    width: '25%',
  },
  periodCell: {
    width: '25%',
  },
  amountCell: {
    width: '25%',
  },
  emptyCell: {
    height: 30,
  },
  footer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signature: {
    width: '40%',
    textAlign: 'center',
  },
  signatureText: {
    marginBottom: 50,
  },
  signatureName: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#000',
    paddingTop: 5,
    width: 150,
    textAlign: 'center',
  },
});

interface SlipPenyetoranPDFProps {
  date?: Date;
  familyHeadName?: string;
  period?: string;
  amount?: number;
}

const SlipPenyetoranPDF: React.FC<SlipPenyetoranPDFProps> = ({ 
  date = new Date(),
  familyHeadName = "",
  period = "",
  amount = 0
}) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.templateTitle}>Template Surat Setor Dana Mandiri</Text>
        <View style={styles.header}>
          <Text style={styles.title}>SLIP PENYETORAN DANA MANDIRI</Text>
        </View>
        
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={[styles.tableCell, styles.dateCell]}>
              <Text>Tanggal</Text>
            </View>
            <View style={[styles.tableCell, styles.nameCell]}>
              <Text>Nama Kepala Keluarga</Text>
            </View>
            <View style={[styles.tableCell, styles.periodCell]}>
              <Text>Bulan / Tahun Disetor</Text>
            </View>
            <View style={[styles.tableCell, styles.amountCell]}>
              <Text>Nominal Disetorkan</Text>
            </View>
          </View>
          
          {/* Data row */}
          <View style={styles.tableRow}>
            <View style={[styles.tableCell, styles.dateCell]}>
              <Text>{familyHeadName ? format(date, 'dd/MM/yyyy', { locale: id }) : 'xxxx'}</Text>
            </View>
            <View style={[styles.tableCell, styles.nameCell]}>
              <Text>{familyHeadName || 'xxxx'}</Text>
            </View>
            <View style={[styles.tableCell, styles.periodCell]}>
              <Text>{period || 'xxx'}</Text>
            </View>
            <View style={[styles.tableCell, styles.amountCell]}>
              <Text>
                {familyHeadName ? 
                  new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(amount) : 
                  'xxx'
                }
              </Text>
            </View>
          </View>
          
          {/* Empty row */}
          <View style={styles.tableRow}>
            <View style={[styles.tableCell, styles.dateCell, styles.emptyCell]}>
              <Text></Text>
            </View>
            <View style={[styles.tableCell, styles.nameCell, styles.emptyCell]}>
              <Text></Text>
            </View>
            <View style={[styles.tableCell, styles.periodCell, styles.emptyCell]}>
              <Text></Text>
            </View>
            <View style={[styles.tableCell, styles.amountCell, styles.emptyCell]}>
              <Text></Text>
            </View>
          </View>
        </View>
        
        <View style={styles.footer}>
          <View style={styles.signature}>
            <Text style={styles.signatureText}>Disetorkan Oleh,</Text>
            <Text style={styles.signatureName}>Bendahara Lingkungan</Text>
          </View>
          
          <View style={styles.signature}>
            <Text style={styles.signatureText}>Telah Diterima Oleh,</Text>
            <Text style={styles.signatureName}>an. Paroki</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default SlipPenyetoranPDF; 