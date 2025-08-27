"use client"

import { forwardRef } from "react"
import { formatCurrency } from "@/lib/utils"

interface SupplierBalancePaymentReceiptProps {
  payment: {
    id: string
    receiptNo: string
    amount: number
    paymentMethod: string
    notes?: string
    createdAt: string
    supplier?: {
      name: string
      phone: string
      email?: string
      companyName?: string
      address?: string
    }
    purchase?: {
      referenceNo: string
    }
  }
}

export const SupplierBalancePaymentReceipt = forwardRef<
  HTMLDivElement,
  SupplierBalancePaymentReceiptProps
>(({ payment }, ref) => {
  return (
    <div ref={ref} className="max-w-md mx-auto bg-white p-6 text-sm">
      {/* Header */}
      <div className="text-center border-b border-gray-300 pb-4 mb-4">
        <h1 className="text-xl font-bold">Your Company Name</h1>
        <p className="text-gray-600">Company Address</p>
        <p className="text-gray-600">Tel: Company Phone</p>
        <p className="text-gray-600">Email: company@email.com</p>
      </div>
      
      {/* Receipt Title */}
      <div className="text-center mb-4">
        <h2 className="text-lg font-bold">SUPPLIER PAYMENT RECEIPT</h2>
        <p className="text-gray-600">Receipt No: {payment.receiptNo}</p>
      </div>
      
      {/* Date & Time */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between">
          <span className="font-bold">Date:</span>
          <span>{new Date(payment.createdAt).toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-bold">Time:</span>
          <span>{new Date(payment.createdAt).toLocaleTimeString()}</span>
        </div>
      </div>
      
      {/* Supplier Information */}
      <div className="border-t border-b border-gray-300 py-3 mb-4">
        <h3 className="font-bold mb-2">Supplier Information</h3>
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="font-bold">Name:</span>
            <span>{payment.supplier?.name || "Unknown Supplier"}</span>
          </div>
          {payment.supplier?.companyName && (
            <div className="flex justify-between">
              <span className="font-bold">Company:</span>
              <span>{payment.supplier.companyName}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="font-bold">Phone:</span>
            <span>{payment.supplier?.phone || "N/A"}</span>
          </div>
          {payment.supplier?.email && (
            <div className="flex justify-between">
              <span className="font-bold">Email:</span>
              <span>{payment.supplier.email}</span>
            </div>
          )}
          {payment.supplier?.address && (
            <div className="flex justify-between">
              <span className="font-bold">Address:</span>
              <span>{payment.supplier.address}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Payment Details */}
      <div className="space-y-2 mb-4">
        <h3 className="font-bold">Payment Details</h3>
        {payment.purchase && (
          <div className="flex justify-between">
            <span className="font-bold">Purchase No:</span>
            <span>{payment.purchase.referenceNo}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="font-bold">Payment Method:</span>
          <span style={{ textTransform: 'capitalize' }}>
            {payment.paymentMethod.replace('_', ' ')}
          </span>
        </div>
        <div className="flex justify-between text-lg font-bold">
          <span>Amount Paid:</span>
          <span>{formatCurrency(payment.amount)}</span>
        </div>
      </div>
      
      {/* Notes */}
      {payment.notes && (
        <div className="mb-4">
          <h3 className="font-bold mb-2">Notes</h3>
          <p className="text-gray-700">{payment.notes}</p>
        </div>
      )}
      
      {/* Footer */}
      <div className="border-t border-gray-300 pt-4 text-center text-gray-600">
        <p className="mb-2">Thank you for your business!</p>
        <p className="text-xs">
          This is a computer generated receipt and does not require signature.
        </p>
        <p className="text-xs mb-2">
          For any queries, please contact us at Company Phone
        </p>
      </div>
    </div>
  )
})

SupplierBalancePaymentReceipt.displayName = "SupplierBalancePaymentReceipt"