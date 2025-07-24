import { addDays, nextSunday, setHours, setMinutes, isAfter, isSunday } from "date-fns"
import { DateRange } from "react-day-picker"
import { TransactionData } from "../types"

/**
 * Calculates the next notification time (Sundays at 12:00)
 * @returns The date for the next notification
 */
export function calculateNextNotificationTime(): Date {
  const now = new Date();
  let nextTime: Date;
  
  if (isSunday(now) && isAfter(now, setHours(setMinutes(now, 0), 12))) {
    // If it's Sunday after 12:00, set for next Sunday
    nextTime = setHours(setMinutes(nextSunday(addDays(now, 1)), 0), 12);
  } else {
    // Otherwise set for this Sunday (or next if today is not Sunday)
    nextTime = setHours(setMinutes(nextSunday(now), 0), 12);
  }
  
  return nextTime;
}

/**
 * Gets the default date range for the current month
 * @param date Current date
 * @returns DateRange object for the full month containing the date
 */
export function getMonthDateRange(date: Date): DateRange {
  return {
    from: new Date(date.getFullYear(), date.getMonth(), 1),
    to: new Date(date.getFullYear(), date.getMonth() + 1, 0),
  }
}

/**
 * Filters transactions for a specific month
 * @param transactions List of transactions
 * @param targetMonth The month to filter for
 * @returns Filtered transactions
 */
export function filterTransactionsByMonth(transactions: TransactionData[], targetMonth: Date) {
  return transactions.filter(tx => 
    tx.tanggal.getMonth() === targetMonth.getMonth() && 
    tx.tanggal.getFullYear() === targetMonth.getFullYear()
  )
}

/**
 * Filters transactions for a specific date range
 * @param transactions List of transactions
 * @param from Start date
 * @param to End date
 * @returns Filtered transactions
 */
export function filterTransactionsByDateRange(transactions: TransactionData[], from: Date, to: Date) {
  return transactions.filter(tx => 
    tx.tanggal >= from && tx.tanggal <= to
  )
}

/**
 * Calculates the initial balance for a specific period based on previous transactions
 * @param transactions All transactions
 * @param periodStart Start date of the period
 * @param globalInitialBalance The global initial balance from database
 * @returns Initial balance for the period
 */
export function calculatePeriodInitialBalance(
  transactions: TransactionData[], 
  periodStart: Date, 
  globalInitialBalance: number
): number {
  // Filter transaksi sebelum periode yang diminta (tidak termasuk saldo awal global)
  const transactionsBeforePeriod = transactions.filter(tx => {
    // Exclude global initial balance transaction
    const isGlobalInitialBalance = tx.tipeTransaksi === 'LAIN_LAIN' && tx.keterangan === 'SALDO AWAL';
    return !isGlobalInitialBalance && tx.tanggal < periodStart;
  });

  // Hitung total pemasukan dan pengeluaran sebelum periode
  const totalIncomeBeforePeriod = transactionsBeforePeriod.reduce((sum, tx) => sum + tx.debit, 0);
  const totalExpenseBeforePeriod = transactionsBeforePeriod.reduce((sum, tx) => sum + tx.kredit, 0);

  // Saldo awal periode = saldo awal global + semua transaksi sebelum periode
  return globalInitialBalance + totalIncomeBeforePeriod - totalExpenseBeforePeriod;
}

/**
 * Calculates summary for a specific period with correct initial balance
 * @param transactions All transactions
 * @param dateRange Period range (optional, if null calculates for all time)
 * @param globalInitialBalance The global initial balance from database
 * @returns Summary with correct period-based calculations
 */
export function calculatePeriodSummary(
  transactions: TransactionData[],
  dateRange: DateRange | undefined,
  globalInitialBalance: number
) {
  if (!dateRange?.from || !dateRange?.to) {
    // Jika tidak ada filter, gunakan perhitungan global
    const filteredTransactions = transactions.filter(tx => 
      !(tx.tipeTransaksi === 'LAIN_LAIN' && tx.keterangan === 'SALDO AWAL')
    );
    
    const totalIncome = filteredTransactions.reduce((sum, tx) => sum + tx.debit, 0);
    const totalExpense = filteredTransactions.reduce((sum, tx) => sum + tx.kredit, 0);
    const finalBalance = globalInitialBalance + totalIncome - totalExpense;
    
    return {
      initialBalance: globalInitialBalance,
      totalIncome,
      totalExpense,
      finalBalance
    };
  }

  // Hitung saldo awal untuk periode ini
  const periodInitialBalance = calculatePeriodInitialBalance(
    transactions, 
    dateRange.from, 
    globalInitialBalance
  );

  // Filter transaksi dalam periode (tidak termasuk saldo awal global)
  const periodTransactions = transactions.filter(tx => {
    const isGlobalInitialBalance = tx.tipeTransaksi === 'LAIN_LAIN' && tx.keterangan === 'SALDO AWAL';
    return !isGlobalInitialBalance && tx.tanggal >= dateRange.from! && tx.tanggal <= dateRange.to!;
  });

  // Hitung pemasukan dan pengeluaran dalam periode
  const totalIncome = periodTransactions.reduce((sum, tx) => sum + tx.debit, 0);
  const totalExpense = periodTransactions.reduce((sum, tx) => sum + tx.kredit, 0);
  const finalBalance = periodInitialBalance + totalIncome - totalExpense;

  return {
    initialBalance: periodInitialBalance,
    totalIncome,
    totalExpense,
    finalBalance
  };
} 