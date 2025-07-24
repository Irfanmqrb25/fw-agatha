"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { PrintPdfFormValues, printPdfSchema } from "../types"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"

interface PrintPdfDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: PrintPdfFormValues) => void;
}

export function PrintPdfDialog({
  open,
  onOpenChange,
  onSubmit,
}: PrintPdfDialogProps) {
  // Get current year and month
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // 1-12
  
  // Create year options (current year +/- 10 years)
  const yearOptions = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);
  
  // Month options (1-12)
  const monthOptions = [
    { value: 1, label: "Januari" },
    { value: 2, label: "Februari" },
    { value: 3, label: "Maret" },
    { value: 4, label: "April" },
    { value: 5, label: "Mei" },
    { value: 6, label: "Juni" },
    { value: 7, label: "Juli" },
    { value: 8, label: "Agustus" },
    { value: 9, label: "September" },
    { value: 10, label: "Oktober" },
    { value: 11, label: "November" },
    { value: 12, label: "Desember" },
  ];
  
  // Form
  const form = useForm<PrintPdfFormValues>({
    resolver: zodResolver(printPdfSchema),
    defaultValues: {
      documentType: "payment_receipt",
      documentCategory: "bukti_terima_uang",
      month: currentMonth,
      year: currentYear,
      fileFormat: "pdf",
    },
  });
  
  // Document category options
  const documentCategories = [
    { value: "bukti_terima_uang", label: "Bukti Terima Uang" },
    { value: "setor_ke_paroki", label: "Setor ke Paroki" },
  ];
  
  // Watch form fields to conditionally show elements and provide info
  const documentCategory = form.watch("documentCategory");
  const selectedYear = form.watch("year");
  const selectedMonth = form.watch("month");
  
  // Generate info message based on selections
  const getInfoMessage = () => {
    const monthName = selectedMonth 
      ? monthOptions.find(m => m.value === selectedMonth)?.label 
      : "";
    
    const categoryName = documentCategories.find(c => c.value === documentCategory)?.label || "";
    
    return `Anda akan melihat Bukti Pembayaran ${categoryName} untuk bulan ${monthName} ${selectedYear}.`;
  };
  
  // Handle form submission
  const handleSubmit = (values: PrintPdfFormValues) => {
    values.fileFormat = "pdf";
    values.documentType = "payment_receipt";
    onSubmit(values);
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Print PDF Bukti Pembayaran</DialogTitle>
          <DialogDescription>
            Pilih kategori, bulan dan tahun untuk meminimalkan data sebelum mencetak.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="documentCategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jenis Data</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih jenis data" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {documentCategories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="month"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bulan</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih bulan" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {monthOptions.map((month) => (
                        <SelectItem key={month.value} value={month.value.toString()}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tahun</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    defaultValue={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih tahun" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {yearOptions.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {getInfoMessage() && (
              <Alert variant="default" className="bg-muted">
                <InfoIcon className="h-4 w-4 mr-2" />
                <AlertDescription>{getInfoMessage()}</AlertDescription>
              </Alert>
            )}
            
            <DialogFooter>
              <Button type="submit" className="w-full">Print PDF</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 