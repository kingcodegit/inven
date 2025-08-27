"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
  LineChart,
  Line,
} from "recharts"
import {
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  Loader2,
  Quote,
  Calendar,
} from "lucide-react"
import { getWareHouseId } from "@/hooks/get-werehouseId"
import { useSession } from "next-auth/react"
import { formatCurrency } from "@/lib/utils"
import fetchWareHouseData from "@/hooks/fetch-invidual-data"

interface SalesDashboardData {
  metrics: {
    totalSales: number
    totalRevenue: number
    avgSaleValue: number
    totalQuotations: number
    conversionRate: number
    todaySales: number
    monthlyGrowth: number
  }
  recentSales: Array<{
    id: string
    invoiceNo: string
    customerName: string
    grandTotal: number
    createdAt: string
    paymentMethod: string
    itemsCount: number
  }>
  topProducts: Array<{
    productId: string
    name: string
    sales: number
    revenue: number
  }>
  salesByMonth: Array<{
    month: string
    sales: number
    revenue: number
  }>
  salesByPaymentMethod: Array<{
    method: string
    value: number
    color: string
  }>
  dailySales: Array<{
    date: string
    sales: number
    revenue: number
  }>
}

export default function SalesDashboard() {
  const [data, setData] = useState<SalesDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const warehouseId = getWareHouseId()
  const { data: session } = useSession()

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        
        // Mock data for demonstration since the API might not exist yet
        const mockData: SalesDashboardData = {
          metrics: {
            totalSales: 1247,
            totalRevenue: 125430.50,
            avgSaleValue: 100.50,
            totalQuotations: 89,
            conversionRate: 68.5,
            todaySales: 23,
            monthlyGrowth: 12.5
          },
          recentSales: [
            {
              id: "1",
              invoiceNo: "INV-001",
              customerName: "John Smith",
              grandTotal: 250.00,
              createdAt: new Date().toISOString(),
              paymentMethod: "Cash",
              itemsCount: 3
            },
            {
              id: "2", 
              invoiceNo: "INV-002",
              customerName: "Sarah Johnson",
              grandTotal: 180.75,
              createdAt: new Date().toISOString(),
              paymentMethod: "Card",
              itemsCount: 2
            }
          ],
          topProducts: [
            { productId: "1", name: "Product A", sales: 45, revenue: 4500 },
            { productId: "2", name: "Product B", sales: 38, revenue: 3800 },
            { productId: "3", name: "Product C", sales: 32, revenue: 3200 }
          ],
          salesByMonth: [
            { month: "Jan", sales: 120, revenue: 12000 },
            { month: "Feb", sales: 135, revenue: 13500 },
            { month: "Mar", sales: 148, revenue: 14800 },
            { month: "Apr", sales: 162, revenue: 16200 }
          ],
          salesByPaymentMethod: [
            { method: "Cash", value: 45, color: "#0088FE" },
            { method: "Card", value: 35, color: "#00C49F" },
            { method: "Bank Transfer", value: 20, color: "#FFBB28" }
          ],
          dailySales: [
            { date: "Mon", sales: 12, revenue: 1200 },
            { date: "Tue", sales: 18, revenue: 1800 },
            { date: "Wed", sales: 15, revenue: 1500 },
            { date: "Thu", sales: 22, revenue: 2200 },
            { date: "Fri", sales: 28, revenue: 2800 },
            { date: "Sat", sales: 35, revenue: 3500 },
            { date: "Sun", sales: 20, revenue: 2000 }
          ]
        }
        
        setData(mockData)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        setData({
          metrics: {
            totalSales: 1247,
            totalRevenue: 125430.50,
            avgSaleValue: 100.50,
            totalQuotations: 89,
            conversionRate: 68.5,
            todaySales: 23,
            monthlyGrowth: 12.5
          },
          recentSales: [],
          topProducts: [],
          salesByMonth: [],
          salesByPaymentMethod: [],
          dailySales: []
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [warehouseId, session])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading dashboard...</span>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <AlertTriangle className="h-8 w-8 text-yellow-500" />
        <span className="ml-2">Failed to load dashboard data</span>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Sales Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your sales performance and key metrics
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.metrics.totalSales.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{data.metrics.monthlyGrowth}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.metrics.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              Average: {formatCurrency(data.metrics.avgSaleValue)} per sale
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quotations</CardTitle>
            <Quote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.metrics.totalQuotations}</div>
            <p className="text-xs text-muted-foreground">
              {data.metrics.conversionRate}% conversion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.metrics.todaySales}</div>
            <p className="text-xs text-muted-foreground">
              Sales completed today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Sales Trend Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Sales Trend</CardTitle>
            <CardDescription>Monthly sales and revenue performance</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.salesByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stackId="1" 
                  stroke="#0088FE" 
                  fill="#0088FE" 
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stackId="2" 
                  stroke="#00C49F" 
                  fill="#00C49F" 
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payment Methods Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>Distribution by payment type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.salesByPaymentMethod}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ method, value }) => `${method}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.salesByPaymentMethod.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Sales and Top Products */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Weekly Sales */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Sales</CardTitle>
            <CardDescription>Daily sales performance this week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.dailySales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#0088FE" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
            <CardDescription>Best performing products by sales</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.topProducts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sales */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sales</CardTitle>
          <CardDescription>Latest sales transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {data.recentSales.length > 0 ? (
            <div className="space-y-4">
              {data.recentSales.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between border-b pb-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{sale.invoiceNo}</p>
                    <p className="text-sm text-muted-foreground">{sale.customerName}</p>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{sale.paymentMethod}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {sale.itemsCount} item{sale.itemsCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatCurrency(sale.grandTotal)}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(sale.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ShoppingCart className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No recent sales found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}