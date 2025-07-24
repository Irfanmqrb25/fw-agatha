import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { DanaMandiriTransaction } from '../types';
import { formatCurrency, getKeluargaName } from '../utils';

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
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 11,
    marginBottom: 15,
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
    width: '30%',
  },
  periodCell: {
    width: '25%',
  },
  amountCell: {
    width: '25%',
  },
  footer: {
    marginTop: 50,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  signature: {
    width: '40%',
    textAlign: 'center',
  },
  signatureText: {
    marginBottom: 50,
    textAlign: 'right',
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

interface BuktiTerimaUangPDFProps {
  transactions: DanaMandiriTransaction[];
  month?: number;
  year: number;
}

const BuktiTerimaUangPDF: React.FC<BuktiTerimaUangPDFProps> = ({ transactions, month, year }) => {
  const monthText = month ? 
    new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(new Date(year, month - 1, 1)) : 
    '';
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.subtitle}>Template Bukti Penerimaan Dana Mandiri</Text>
          <Text style={styles.title}>BUKTI PENERIMAAN DANA MANDIRI</Text>
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
              <Text>Bulan / Tahun Pembayaran</Text>
            </View>
            <View style={[styles.tableCell, styles.amountCell]}>
              <Text>Nominal Diterima</Text>
            </View>
          </View>
          
          {transactions.map((transaction) => (
            <View key={transaction.id} style={styles.tableRow}>
              <View style={[styles.tableCell, styles.dateCell]}>
                <Text>{format(transaction.tanggal, 'dd/MM/yyyy', { locale: id })}</Text>
              </View>
              <View style={[styles.tableCell, styles.nameCell]}>
                <Text>{getKeluargaName(transaction)}</Text>
              </View>
              <View style={[styles.tableCell, styles.periodCell]}>
                <Text>{monthText || format(transaction.tanggal, 'MMMM', { locale: id })} / {transaction.tahun}</Text>
              </View>
              <View style={[styles.tableCell, styles.amountCell]}>
                <Text>
                  {formatCurrency(transaction.jumlahDibayar)}
                </Text>
              </View>
            </View>
          ))}
        </View>
        
        <View style={styles.footer}>
          <View style={styles.signature}>
            <Text style={styles.signatureText}>Telah Diterima Oleh,</Text>
            <Text style={styles.signatureName}>Bendahara Lingkungan</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default BuktiTerimaUangPDF; 