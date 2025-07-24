import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { DanaMandiriTransaction } from '../types';
import { getKeluargaName } from '../utils';

// Define styles for PDF document
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
  },
  title: {
    fontSize: 10,
    marginBottom: 5,
    textAlign: 'center',
  },
  mainTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
    marginTop: 10,
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableHeader: {
    backgroundColor: '#f0f0f0',
  },
  tableCell: {
    padding: 5,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
  },
  dateCell: {
    width: '20%',
  },
  nameCell: {
    width: '35%',
  },
  yearCell: {
    width: '20%',
  },
  amountCell: {
    width: '25%',
  },
  signature: {
    marginTop: 50,
    textAlign: 'right',
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
    alignSelf: 'flex-end',
  },
});

interface BuktiPenerimaanPDFProps {
  transaction: DanaMandiriTransaction;
}

const BuktiPenerimaanPDF: React.FC<BuktiPenerimaanPDFProps> = ({ transaction }) => {
  const familyHeadName = getKeluargaName(transaction);
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.mainTitle}>BUKTI PENERIMAAN DANA MANDIRI</Text>
        
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={[styles.tableCell, styles.dateCell]}>
              <Text>Tanggal</Text>
            </View>
            <View style={[styles.tableCell, styles.nameCell]}>
              <Text>Nama Kepala Keluarga</Text>
            </View>
            <View style={[styles.tableCell, styles.yearCell]}>
              <Text>Bulan / Tahun Pembayaran</Text>
            </View>
            <View style={[styles.tableCell, styles.amountCell]}>
              <Text>Nominal Diterima</Text>
            </View>
          </View>
          
          <View style={styles.tableRow}>
            <View style={[styles.tableCell, styles.dateCell]}>
              <Text>{format(transaction.tanggal, 'dd/MM/yyyy', { locale: id })}</Text>
            </View>
            <View style={[styles.tableCell, styles.nameCell]}>
              <Text>{familyHeadName}</Text>
            </View>
            <View style={[styles.tableCell, styles.yearCell]}>
              <Text>{transaction.tahun}</Text>
            </View>
            <View style={[styles.tableCell, styles.amountCell]}>
              <Text>
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(transaction.jumlahDibayar)}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.signature}>
          <Text style={styles.signatureText}>Telah Diterima Oleh,</Text>
          <Text style={styles.signatureName}>Bendahara Lingkungan</Text>
        </View>
      </Page>
    </Document>
  );
};

export default BuktiPenerimaanPDF; 