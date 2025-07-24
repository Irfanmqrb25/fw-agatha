"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { SubmitToParokiValues, submitToParokiSchema, DanaMandiriTransaction } from "../types"
import { formatCurrency } from "../utils"
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
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface SubmitToParokiDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: SubmitToParokiValues) => void
  selectedTransactions: DanaMandiriTransaction[]
  totalAmount: number
}

export function SubmitToParokiDialog({
  open,
  onOpenChange,
  onSubmit,
  selectedTransactions,
  totalAmount,
}: SubmitToParokiDialogProps) {
  // Ekstrak ID dari transaksi yang dipilih
  const transactionIds = selectedTransactions.map(t => t.id)
  
  // Form
  const form = useForm<SubmitToParokiValues>({
    resolver: zodResolver(submitToParokiSchema),
    defaultValues: {
      transactionIds: transactionIds,
      submissionDate: new Date(),
      submissionNote: "",
    },
  })
  
  // Handle form submission
  const handleSubmit = (values: SubmitToParokiValues) => {
    onSubmit({
      ...values,
      transactionIds: transactionIds, // Ensure we're using the selected IDs
    })
    onOpenChange(false)
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Setor Dana Mandiri ke Paroki</DialogTitle>
          <DialogDescription>
            Konfirmasi penyetoran Dana Mandiri ke paroki.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-2">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Jumlah Transaksi</p>
              <p className="text-lg font-semibold">{transactionIds.length} Transaksi</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Setoran</p>
              <p className="text-lg font-semibold">{formatCurrency(totalAmount)}</p>
            </div>
          </div>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="submissionDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Tanggal Setor</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "dd MMMM yyyy")
                          ) : (
                            <span>Pilih tanggal</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="submissionNote"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catatan Penyetoran</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Masukkan catatan (opsional)"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Batal
              </Button>
              <Button type="submit">Setor ke Paroki</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 