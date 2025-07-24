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
  date: {
    fontSize: 12,
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
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    marginBottom: 20,
  },
  totalLabel: {
    width: '75%',
    textAlign: 'right',
    paddingRight: 10,
    fontWeight: 'bold',
  },
  totalAmount: {
    width: '25%',
    fontWeight: 'bold',
  },
});

interface SetorKeParokiPDFProps {
  transactions: DanaMandiriTransaction[];
  month?: number;
  year: number;
}

const SetorKeParokiPDF: React.FC<SetorKeParokiPDFProps> = ({ transactions, month, year }) => {
  const today = new Date();
  const totalAmount = transactions.reduce((sum, tx) => sum + tx.jumlahDibayar, 0);
  const monthText = month ? 
    new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(new Date(year, month - 1, 1)) : 
    '';
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>SURAT SETOR DANA MANDIRI</Text>
          <Text style={styles.subtitle}>Lingkungan St. Agatha</Text>
          {month && <Text style={styles.subtitle}>Bulan: {monthText} {year}</Text>}
        </View>
        
        <Text style={styles.date}>Tanggal: {format(today, 'dd MMMM yyyy', { locale: id })}</Text>
        
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
              <Text>Nominal</Text>
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
                <Text>{formatCurrency(transaction.jumlahDibayar)}</Text>
              </View>
            </View>
          ))}
        </View>
        
        <View style={styles.totalRow}>
          <View style={styles.totalLabel}>
            <Text>Total Setoran:</Text>
          </View>
          <View style={styles.totalAmount}>
            <Text>{formatCurrency(totalAmount)}</Text>
          </View>
        </View>
        
        <View style={styles.footer}>
          <View style={styles.signature}>
            <Text style={styles.signatureText}>Bendahara Lingkungan,</Text>
            <Text style={styles.signatureName}>Bendahara Lingkungan</Text>
          </View>
          
          <View style={styles.signature}>
            <Text style={styles.signatureText}>Penerima Setoran,</Text>
            <Text style={styles.signatureName}>Bendahara Paroki</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default SetorKeParokiPDF; 