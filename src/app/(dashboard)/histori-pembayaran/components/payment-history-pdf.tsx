import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { PaymentHistory } from '../types';

interface PaymentHistoryPdfProps {
  data: PaymentHistory[];
  type: 'Dana Mandiri' | 'IKATA';
  year?: number;
}

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 12 },
  mainTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  table: {
    display: 'flex',
    width: 'auto',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#000',
    marginTop: 10,
    marginBottom: 20,
  },
  tableRow: { flexDirection: 'row' },
  tableHeader: { backgroundColor: '#f0f0f0' },
  tableCell: {
    padding: 5,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#000',
    fontSize: 10,
  },
  dateCell: { width: '20%' },
  nameCell: { width: '35%' },
  yearCell: { width: '20%' },
  amountCell: { width: '25%' },
  signature: { marginTop: 50, textAlign: 'right' },
  signatureText: { marginBottom: 50 },
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

export function PaymentHistoryPdf({ data, type, year }: PaymentHistoryPdfProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.mainTitle}>
          {`Histori Pembayaran ${type}${year ? ` Tahun ${year}` : ''}`}
        </Text>
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
          {data.map((item) => (
            <View style={styles.tableRow} key={item.id}>
              <View style={[styles.tableCell, styles.dateCell]}>
                <Text>{item.paymentDate ? new Date(item.paymentDate).toLocaleDateString('id-ID') : '-'}</Text>
              </View>
              <View style={[styles.tableCell, styles.nameCell]}>
                <Text>{item.familyHeadName || '-'}</Text>
              </View>
              <View style={[styles.tableCell, styles.yearCell]}>
                <Text>{item.paymentDate ? `${new Date(item.paymentDate).toLocaleString('id-ID', { month: 'long' })} / ${item.year}` : `- / ${item.year}`}</Text>
              </View>
              <View style={[styles.tableCell, styles.amountCell]}>
                <Text>{item.amount.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })}</Text>
              </View>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
} 