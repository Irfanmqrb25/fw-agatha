import { Suspense } from "react";
import { getTransactionsData, getTransactionSummary } from './providers';
import KasLingkunganContent from './kas-lingkungan-content';
import LoadingSkeleton from './loading-skeleton';

export default async function KasServer() {
  // Ambil data transaksi dari database
  const transactions = await getTransactionsData();
  
  // Ambil data ringkasan
  const summary = await getTransactionSummary();
  
  return (
    <div className="p-2 md:p-4">
      <h1 className="text-xl font-bold md:px-2 mb-4">Kas Lingkungan</h1>
      <Suspense fallback={<LoadingSkeleton />}>
        <KasLingkunganContent 
          initialTransactions={transactions} 
          initialSummary={summary} 
        />
      </Suspense>
    </div>
  );
} 