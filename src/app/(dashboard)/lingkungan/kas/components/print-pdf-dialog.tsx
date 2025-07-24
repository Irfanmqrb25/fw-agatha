"use client"

import { useState } from "react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, Printer } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { UseFormReturn } from "react-hook-form"
import { PrintPdfFormValues } from "../types"
import { TransactionData } from "../types"
import PDFViewerComponent from "./pdf-viewer"

interface PrintPdfDialogProps {
  form: UseFormReturn<PrintPdfFormValues>;
  onSubmit: (values: PrintPdfFormValues) => void;
  transactions: TransactionData[];
  summary: {
    initialBalance: number;
    totalIncome: number;
    totalExpense: number;
    finalBalance: number;
  };
}

export function PrintPdfDialog({ 
  form, 
  onSubmit, 
  transactions, 
  summary 
}: PrintPdfDialogProps) {
  const [isPdfViewOpen, setIsPdfViewOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Handler untuk menampilkan PDF viewer
  const handleViewPdf = (values: PrintPdfFormValues) => {
    onSubmit(values); // Panggil fungsi onSubmit asli untuk menandai transaksi
    setIsPdfViewOpen(true); // Tampilkan PDF viewer
  };
  
  // Handler untuk menutup PDF viewer
  const handleClosePdfView = () => {
    setIsPdfViewOpen(false);
    setDialogOpen(false);
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-max md:w-auto">
          <Printer className="mr-2 h-4 w-4" />
          Print PDF
        </Button>
      </DialogTrigger>
      <DialogContent className={isPdfViewOpen ? "max-w-[95vw] h-[90vh] max-h-[90vh] w-[90vw] p-0" : "max-w-[95vw] md:max-w-md"}>
        {!isPdfViewOpen ? (
          <>
            <DialogHeader>
              <DialogTitle>Cetak Laporan PDF</DialogTitle>
              <DialogDescription>
                Pilih rentang waktu untuk mencetak laporan kas lingkungan.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleViewPdf)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="dateRange"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Rentang Waktu</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value?.from ? (
                                field.value.to ? (
                                  <>
                                    {format(field.value.from, "dd MMMM yyyy", { locale: id })} -{" "}
                                    {format(field.value.to, "dd MMMM yyyy", { locale: id })}
                                  </>
                                ) : (
                                  format(field.value.from, "dd MMMM yyyy", { locale: id })
                                )
                              ) : (
                                <span>Pilih rentang tanggal</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={field.value?.from}
                            selected={field.value}
                            onSelect={field.onChange}
                            numberOfMonths={2}
                            locale={id}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="submit" className="w-full md:w-auto">Cetak PDF</Button>
                </DialogFooter>
              </form>
            </Form>
          </>
        ) : (
          <div className="w-full h-full">
            <PDFViewerComponent
              dateRange={form.getValues().dateRange}
              transactions={transactions}
              summary={summary}
              onClose={handleClosePdfView}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 