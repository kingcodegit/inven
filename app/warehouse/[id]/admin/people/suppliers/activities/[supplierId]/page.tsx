"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Truck, 
  ArrowLeft, 
  Calendar, 
  DollarSign, 
  Receipt, 
  ShoppingBag,
  Activity,
  Eye,
  CreditCard,
  AlertCircle,
  TrendingUp,
  Package,
  RefreshCw,
  Printer
} from "lucide-react"
import { useSession } from "next-auth/react"
import { getWareHouseId } from "@/hooks/get-werehouseId"
import { Loading } from "@/components/loading"
import { formatCurrency, formatDate } from "@/lib/utils"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { SupplierBalancePaymentDialog } from "@/components/supplier-balance-payment-dialog"

interface SupplierActivity {
  id: string
  referenceNo: string
  date: string
  type: string
  description: string
  amount: number
  paidAmount: number
  balance: number
  items: Array<{
    productName: string
    quantity: number
    price: number
    total: number
    customRetailPrice?: number
    customWholesalePrice?: number
  }>
}

interface SupplierBalancePayment {
  id: string
  receiptNo: string
  amount: number
  paymentMethod: string
  notes?: string
  createdAt: string
  purchase?: {
    referenceNo: string
  }
}

interface SupplierData {
  id: string
  name: string
  type: string
  email: string
  phone: string
  address: string
  companyName?: string
}

interface ActivityData {
  supplier: SupplierData
  activities: SupplierActivity[]
  summary: {
    totalPurchases: number
    totalAmount: number
    totalPaid: number
    totalBalance: number
  }
}

export default function SupplierActivitiesPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const warehouseId = getWareHouseId()
  const supplierId = params.supplierId as string

  const [data, setData] = useState<ActivityData | null>(null)
  const [balancePayments, setBalancePayments] = useState<SupplierBalancePayment[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingPayments, setLoadingPayments] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState<SupplierActivity | null>(null)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [selectedPaymentActivity, setSelectedPaymentActivity] = useState<SupplierActivity | null>(null)
  const [endPoint, setEndPoint] = useState("")

  useEffect(() => {
    setEndPoint(`/warehouse/${warehouseId}/${session?.user?.role}`)
  }, [session, warehouseId])

  const fetchActivities = async () => {
    try {
      const response = await fetch(`/api/supplier/${supplierId}/activities`)
      if (!response.ok) {
        throw new Error('Failed to fetch supplier activities')
      }
      const activityData = await response.json()
      setData(activityData)
    } catch (error) {
      console.error('Error fetching activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchBalancePayments = async () => {
    setLoadingPayments(true)
    try {
      const response = await fetch(`/api/balance-payment?supplierId=${supplierId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch balance payments')
      }
      const paymentData = await response.json()
      setBalancePayments(paymentData.balancePayments || [])
    } catch (error) {
      console.error('Error fetching balance payments:', error)
    } finally {
      setLoadingPayments(false)
    }
  }

  useEffect(() => {
    if (supplierId) {
      fetchActivities()
      fetchBalancePayments()
    }
  }, [supplierId])

  const handlePaymentSuccess = () => {
    fetchActivities()
    fetchBalancePayments()
  }

  const openPaymentDialog = (activity: SupplierActivity) => {
    setSelectedPaymentActivity(activity)
    setPaymentDialogOpen(true)
  }

  const handlePrintReceipt = (payment: SupplierBalancePayment) => {
    // Create a receipt with full supplier data
    const receiptData = {
      ...payment,
      supplier: data?.supplier || {
        name: "Unknown Supplier",
        phone: "N/A",
        email:""
      }
    }

    // Create a temporary element for printing
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Supplier Balance Payment Receipt</title>
            <style>
              body { 
                margin: 0; 
                padding: 20px; 
                font-family: Arial, sans-serif;
                max-width: 400px;
                margin: 0 auto;
              }
              .text-center { text-align: center; }
              .border-b { border-bottom: 1px solid #ddd; padding-bottom: 1rem; margin-bottom: 1rem; }
              .flex { display: flex; justify-content: space-between; }
              .font-bold { font-weight: bold; }
              .text-lg { font-size: 1.125rem; }
              .text-xl { font-size: 1.25rem; }
              .mb-2 { margin-bottom: 0.5rem; }
              .mb-4 { margin-bottom: 1rem; }
              .space-y-1 > * + * { margin-top: 0.25rem; }
              .space-y-2 > * + * { margin-top: 0.5rem; }
              .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
              .border-t { border-top: 1px solid #ddd; padding-top: 1rem; }
              .text-xs { font-size: 0.75rem; }
              .text-gray-600 { color: #666; }
              .text-gray-700 { color: #555; }
              @media print { 
                body { margin: 0; padding: 0; } 
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="text-center border-b">
              <h1 class="text-xl font-bold">Your Company Name</h1>
              <p class="text-gray-600">Company Address</p>
              <p class="text-gray-600">Tel: Company Phone</p>
              <p class="text-gray-600">Email: company@email.com</p>
            </div>
            
            <div class="text-center mb-4">
              <h2 class="text-lg font-bold">SUPPLIER PAYMENT RECEIPT</h2>
              <p class="text-gray-600">Receipt No: ${payment.receiptNo}</p>
            </div>
            
            <div class="space-y-2 mb-4">
              <div class="flex">
                <span class="font-bold">Date:</span>
                <span>${new Date(payment.createdAt).toLocaleDateString()}</span>
              </div>
              <div class="flex">
                <span class="font-bold">Time:</span>
                <span>${new Date(payment.createdAt).toLocaleTimeString()}</span>
              </div>
            </div>
            
            <div class="border-t border-b py-3 mb-4">
              <h3 class="font-bold mb-2">Supplier Information</h3>
              <div class="space-y-1">
                <div class="flex">
                  <span class="font-bold">Name:</span>
                  <span>${receiptData.supplier.name}</span>
                </div>
                <div class="flex">
                  <span class="font-bold">Phone:</span>
                  <span>${receiptData.supplier.phone}</span>
                </div>
                ${receiptData.supplier?.email ? `
                <div class="flex">
                  <span class="font-bold">Email:</span>
                  <span>${receiptData.supplier?.email}</span>
                </div>
                ` : ''}
              </div>
            </div>
            
            <div class="space-y-2 mb-4">
              <h3 class="font-bold">Payment Details</h3>
              ${payment.purchase ? `
              <div class="flex">
                <span class="font-bold">Purchase No:</span>
                <span>${payment.purchase.referenceNo}</span>
              </div>
              ` : ''}
              <div class="flex">
                <span class="font-bold">Payment Method:</span>
                <span style="text-transform: capitalize;">${payment.paymentMethod.replace('_', ' ')}</span>
              </div>
              <div class="flex text-lg font-bold">
                <span>Amount Paid:</span>
                <span>${formatCurrency(payment.amount)}</span>
              </div>
            </div>
            
            ${payment.notes ? `
            <div class="mb-4">
              <h3 class="font-bold mb-2">Notes</h3>
              <p class="text-gray-700">${payment.notes}</p>
            </div>
            ` : ''}
            
            <div class="border-t text-center text-gray-600">
              <p class="mb-2">Thank you for your business!</p>
              <p class="text-xs">
                This is a computer generated receipt and does not require signature.
              </p>
              <p class="text-xs mb-2">
                For any queries, please contact us at Company Phone
              </p>
            </div>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
      printWindow.close()
    }
  }

  const getActivityBadge = (type: string) => {
    switch (type) {
      case 'PURCHASE':
        return <Badge className="bg-blue-600">Purchase</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return "text-red-600"
    if (balance < 0) return "text-green-600"
    return "text-gray-600"
  }

  if (loading) {
    return <Loading />
  }

  if (!data) {
    return (
     <>
          <div className="flex flex-1 flex-col gap-4 p-4">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                <h2 className="text-2xl font-bold text-red-600">Error</h2>
                <p className="text-gray-600 mt-2">Failed to load supplier activities</p>
                <Button
                  onClick={() => router.back()}
                  className="mt-4"
                  variant="outline"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Go Back
                </Button>
              </CardContent>
            </Card>
          </div>
       </>
    )
  }

  return (
   <>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href={`${endPoint}/dashboard`}>Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href={`${endPoint}/people/suppliers`}>Suppliers</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Activities</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button
                onClick={() => router.back()}
                variant="outline"
                size="sm"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Activity className="h-5 w-5 text-orange-600" />
              <h1 className="text-xl sm:text-2xl font-semibold text-orange-600">Supplier Activities</h1>
            </div>
            <Button
              onClick={() => {
                fetchActivities()
                fetchBalancePayments()
              }}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>

          {/* Supplier Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Supplier Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Contact Person</label>
                  <p className="font-medium">{data.supplier.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Type</label>
                  <Badge variant="outline">{data.supplier.type}</Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="text-sm">{data.supplier.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-sm">{data.supplier.email}</p>
                </div>
                {data.supplier.companyName && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Company</label>
                    <p className="text-sm">{data.supplier.companyName}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-500">Address</label>
                  <p className="text-sm">{data.supplier.address}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.summary.totalPurchases}</div>
                <p className="text-xs text-muted-foreground">Total transactions</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(data.summary.totalAmount)}</div>
                <p className="text-xs text-muted-foreground">Total purchase value</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(data.summary.totalPaid)}
                </div>
                <p className="text-xs text-muted-foreground">Amount paid</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getBalanceColor(data.summary.totalBalance)}`}>
                  {formatCurrency(data.summary.totalBalance)}
                </div>
                <p className="text-xs text-muted-foreground">Amount due</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs for Activities and Balance Payments */}
          <Tabs defaultValue="activities" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
              <TabsTrigger value="activities">Transaction History</TabsTrigger>
              <TabsTrigger value="balance-payments">Balance Paid</TabsTrigger>
            </TabsList>

            {/* Transaction History Tab */}
            <TabsContent value="activities">
              <Card>
                <CardHeader>
                  <CardTitle>Purchase History</CardTitle>
                  <CardDescription>
                    Showing {data.activities.length} transaction(s)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {data.activities.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No activities found</h3>
                      <p className="text-muted-foreground">
                        No purchases have been made from this supplier yet.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Reference No.</TableHead>
                            <TableHead className="hidden sm:table-cell">Type</TableHead>
                            <TableHead className="hidden md:table-cell">Description</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-right hidden sm:table-cell">Paid</TableHead>
                            <TableHead className="text-right">Balance</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {data.activities.map((activity) => (
                            <TableRow key={activity.id}>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">{formatDate(activity.date)}</span>
                                </div>
                              </TableCell>
                              <TableCell className="font-medium">
                                {activity.referenceNo}
                              </TableCell>
                              <TableCell className="hidden sm:table-cell">
                                {getActivityBadge(activity.type)}
                              </TableCell>
                              <TableCell className="hidden md:table-cell">{activity.description}</TableCell>
                              <TableCell className="text-right font-medium">
                                {formatCurrency(activity.amount)}
                              </TableCell>
                              <TableCell className="text-right text-green-600 hidden sm:table-cell">
                                {formatCurrency(activity.paidAmount)}
                              </TableCell>
                              <TableCell className={`text-right font-medium ${getBalanceColor(activity.balance)}`}>
                                {formatCurrency(activity.balance)}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex gap-1 justify-end">
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => setSelectedActivity(activity)}
                                      >
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                      <DialogHeader>
                                        <DialogTitle>Purchase Details - {activity.referenceNo}</DialogTitle>
                                        <DialogDescription>
                                          View detailed information about this purchase
                                        </DialogDescription>
                                      </DialogHeader>
                                      {selectedActivity && (
                                        <div className="space-y-4">
                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                              <label className="text-sm font-medium text-gray-500">Date</label>
                                              <p>{formatDate(selectedActivity.date)}</p>
                                            </div>
                                            <div>
                                              <label className="text-sm font-medium text-gray-500">Reference No.</label>
                                              <p>{selectedActivity.referenceNo}</p>
                                            </div>
                                            <div>
                                              <label className="text-sm font-medium text-gray-500">Total Amount</label>
                                              <p className="font-medium">{formatCurrency(selectedActivity.amount)}</p>
                                            </div>
                                            <div>
                                              <label className="text-sm font-medium text-gray-500">Balance</label>
                                              <p className={getBalanceColor(selectedActivity.balance)}>
                                                {formatCurrency(selectedActivity.balance)}
                                              </p>
                                            </div>
                                          </div>
                                          
                                          <div>
                                            <label className="text-sm font-medium text-gray-500 mb-2 block">Items</label>
                                            <div className="border rounded-lg overflow-hidden">
                                              <div className="overflow-x-auto">
                                                <Table>
                                                  <TableHeader>
                                                    <TableRow>
                                                      <TableHead>Product</TableHead>
                                                      <TableHead>Qty</TableHead>
                                                      <TableHead>Cost Price</TableHead>
                                                      <TableHead>Total</TableHead>
                                                      <TableHead>Retail Price</TableHead>
                                                      <TableHead>Wholesale Price</TableHead>
                                                    </TableRow>
                                                  </TableHeader>
                                                  <TableBody>
                                                    {selectedActivity.items.map((item, index) => (
                                                      <TableRow key={index}>
                                                        <TableCell>{item.productName}</TableCell>
                                                        <TableCell>{item.quantity}</TableCell>
                                                        <TableCell>{formatCurrency(item.price)}</TableCell>
                                                        <TableCell>{formatCurrency(item.total)}</TableCell>
                                                        <TableCell>
                                                          {item.customRetailPrice ? formatCurrency(item.customRetailPrice) : '-'}
                                                        </TableCell>
                                                        <TableCell>
                                                          {item.customWholesalePrice ? formatCurrency(item.customWholesalePrice) : '-'}
                                                        </TableCell>
                                                      </TableRow>
                                                    ))}
                                                  </TableBody>
                                                </Table>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </DialogContent>
                                  </Dialog>
                                  
                                  {activity.balance > 0 && (
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => openPaymentDialog(activity)}
                                    >
                                      <CreditCard className="h-4 w-4" />
                                    </Button>
                                  )}
                                  
                                  <Button variant="outline" size="sm" asChild>
                                    <Link href={`${endPoint}/purchases/${activity.referenceNo}`}>
                                      <Receipt className="h-4 w-4" />
                                    </Link>
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Balance Payments Tab */}
            <TabsContent value="balance-payments">
              <Card>
                <CardHeader>
                  <CardTitle>Balance Payments</CardTitle>
                  <CardDescription>
                    Showing {balancePayments.length} balance payment(s)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingPayments ? (
                    <div className="text-center py-8">
                      <Loading />
                    </div>
                  ) : balancePayments.length === 0 ? (
                    <div className="text-center py-8">
                      <CreditCard className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No balance payments found</h3>
                      <p className="text-muted-foreground">
                        No balance payments have been made to this supplier yet.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Receipt No.</TableHead>
                            <TableHead className="hidden sm:table-cell">Purchase No.</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="hidden md:table-cell">Payment Method</TableHead>
                            <TableHead className="hidden lg:table-cell">Notes</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {balancePayments.map((payment) => (
                            <TableRow key={payment.id}>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">{formatDate(payment.createdAt)}</span>
                                </div>
                              </TableCell>
                              <TableCell className="font-medium">
                                {payment.receiptNo}
                              </TableCell>
                              <TableCell className="hidden sm:table-cell">
                                {payment.purchase?.referenceNo || "General Payment"}
                              </TableCell>
                              <TableCell className="text-right font-medium text-green-600">
                                {formatCurrency(payment.amount)}
                              </TableCell>
                              <TableCell className="hidden md:table-cell capitalize">
                                {payment.paymentMethod.replace('_', ' ')}
                              </TableCell>
                              <TableCell className="hidden lg:table-cell">
                                {payment.notes || "-"}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handlePrintReceipt(payment)}
                                >
                                  <Printer className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Supplier Balance Payment Dialog */}
        <SupplierBalancePaymentDialog
          open={paymentDialogOpen}
          onOpenChange={setPaymentDialogOpen}
          supplierId={supplierId}
          purchaseId={selectedPaymentActivity?.referenceNo}
          referenceNo={selectedPaymentActivity?.referenceNo}
          outstandingBalance={selectedPaymentActivity?.balance}
          supplierName={data.supplier.name}
          warehousesId={warehouseId}
          onPaymentSuccess={handlePaymentSuccess}
        />
     </>
  )
}