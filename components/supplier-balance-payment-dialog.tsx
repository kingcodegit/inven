"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatCurrency } from "@/lib/utils"
import { CreditCard, Loader2, Printer } from "lucide-react"
import toast from "react-hot-toast"
import { SupplierBalancePaymentReceipt } from "@/components/supplier-balance-payment-receipt"

interface SupplierBalancePaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  supplierId: string
  purchaseId?: string
  referenceNo?: string
  outstandingBalance?: number
  supplierName: string
  warehousesId?: string
  onPaymentSuccess?: () => void
}

const paymentMethods = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "mobile_money", label: "Mobile Money" },
  { value: "check", label: "Check" }
]

export function SupplierBalancePaymentDialog({
  open,
  onOpenChange,
  supplierId,
  purchaseId,
  referenceNo,
  outstandingBalance,
  supplierName,
  warehousesId,
  onPaymentSuccess
}: SupplierBalancePaymentDialogProps) {
  const [amount, setAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [showReceipt, setShowReceipt] = useState(false)
  const [lastPayment, setLastPayment] = useState<any>(null)
  const receiptRef = useRef<HTMLDivElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!amount || !paymentMethod) {
      toast.error("Please fill in all required fields")
      return
    }

    const amountNum = parseFloat(amount)
    if (amountNum <= 0) {
      toast.error("Amount must be greater than 0")
      return
    }

    if (outstandingBalance && amountNum > outstandingBalance) {
      toast.error("Amount cannot exceed outstanding balance")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/balance-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          supplierId,
          purchaseId,
          amount: amountNum,
          paymentMethod,
          notes: notes.trim() || null,
          warehousesId
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to process payment")
      }

      toast.success(`Payment of ${formatCurrency(amountNum)} processed successfully`)

      // Store payment data for receipt
      setLastPayment(data.balancePayment)
      setShowReceipt(true)

      // Reset form
      setAmount("")
      setPaymentMethod("")
      setNotes("")
      
      // Trigger refresh if callback provided
      if (onPaymentSuccess) {
        onPaymentSuccess()
      }

    } catch (error) {
      console.error("Payment error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to process payment")
    } finally {
      setLoading(false)
    }
  }

  const handleAmountChange = (value: string) => {
    // Allow only numbers and decimal point
    const regex = /^\d*\.?\d*$/
    if (regex.test(value)) {
      setAmount(value)
    }
  }

  const handlePrintReceipt = () => {
    if (receiptRef.current) {
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Supplier Balance Payment Receipt</title>
              <style>
                body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
                @media print { body { margin: 0; padding: 0; } }
              </style>
            </head>
            <body>
              ${receiptRef.current.innerHTML}
            </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.print()
        printWindow.close()
      }
    }
  }

  const handleCloseReceipt = () => {
    setShowReceipt(false)
    setLastPayment(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={showReceipt ? handleCloseReceipt : onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
      {showReceipt && lastPayment ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Receipt
              </DialogTitle>
              <DialogDescription>
                Payment processed successfully! You can print this receipt.
              </DialogDescription>
            </DialogHeader>
            
            <div className="max-h-[60vh] overflow-y-auto">
              <SupplierBalancePaymentReceipt ref={receiptRef} payment={lastPayment} />
            </div>
            
            <DialogFooter className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseReceipt}
              >
                Close
              </Button>
              <Button type="button" onClick={handlePrintReceipt}>
                <Printer className="mr-2 h-4 w-4" />
                Print Receipt
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Update Balance Payment
          </DialogTitle>
          <DialogDescription>
            Process a balance payment for {supplierName}
            {referenceNo && ` - Purchase ${referenceNo}`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {outstandingBalance !== undefined && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <Label className="text-sm font-medium text-red-800">
                Outstanding Balance: {formatCurrency(outstandingBalance)}
              </Label>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-medium">
              Payment Amount *
            </Label>
            <Input
              id="amount"
              type="text"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="0.00"
              className="text-lg font-medium"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-method" className="text-sm font-medium">
              Payment Method *
            </Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod} required>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">
              Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes..."
              rows={3}
            />
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Process Payment
            </Button>
          </DialogFooter>
        </form>
        </>
        )}
      </DialogContent>
    </Dialog>
  )
}