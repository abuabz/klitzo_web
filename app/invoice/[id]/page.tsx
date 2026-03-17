"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Printer, ArrowLeft, Download, Mail, Phone, MapPin, Package, CreditCard } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export default function InvoicePage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders?id=${params.id}`)
        const data = await res.json()
        if (data && !data.error) {
          setOrder(data)
        }
      } catch (error) {
        console.error("Error fetching order:", error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchOrder()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="h-12 w-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">Invoice Not Found</h1>
          <Link href="/my-orders">
            <Button className="bg-teal-600 text-white">Back to Orders</Button>
          </Link>
        </div>
      </div>
    )
  }

  const handlePrint = () => {
    window.print()
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed": return "bg-emerald-100 text-emerald-700 border-emerald-200"
      case "shipping": return "bg-blue-100 text-blue-700 border-blue-200"
      case "paid": return "bg-teal-100 text-teal-700 border-teal-200"
      case "failed": return "bg-red-100 text-red-700 border-red-200"
      default: return "bg-slate-100 text-slate-700 border-slate-200"
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 print:p-0 print:bg-white print:min-h-0 printable-page">
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 5mm;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
            background-color: white !important;
          }
          /* Force hide common layout wrappers */
          header, footer:not(.invoice-footer), nav, aside {
            display: none !important;
          }
        }
      `}</style>

      <div className="max-w-4xl mx-auto print:max-w-none print:w-full">
        {/* Navigation - Hidden on Print */}
        <div className="flex items-center justify-between mb-8 print:hidden">
          <Link href="/my-orders" className="flex items-center text-slate-600 hover:text-teal-600 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Link>
          <div className="flex gap-4">
            <Button variant="outline" onClick={handlePrint} className="gap-2">
              <Printer className="h-4 w-4" /> Print Invoice
            </Button>
            <Button onClick={handlePrint} className="bg-teal-600 hover:bg-teal-700 text-white gap-2">
              <Download className="h-4 w-4" /> Download PDF
            </Button>
          </div>
        </div>

        {/* Invoice Card */}
        <div className="bg-white shadow-2xl rounded-3xl overflow-hidden print:shadow-none print:rounded-none border border-slate-100 print:border-0 print:border-transparent">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-8 md:p-12 text-white print:p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 print:gap-2">
              <div>
                <img src="/klitzo-logo.png" alt="KLITZO" className="h-12 w-auto mb-6 brightness-0 invert print:h-8 print:mb-2" />
                <h1 className="text-4xl font-black tracking-tighter mb-2 italic print:text-2xl print:mb-0">INVOICE</h1>
                <p className="text-slate-400 font-medium print:text-xs">#{order.razorpayOrderId?.slice(-8).toUpperCase() || "ORD-" + order._id.slice(-6).toUpperCase()}</p>
              </div>
              <div className="text-left md:text-right space-y-1 print:space-y-0 text-sm print:text-[10px]">
                <p className="text-xl font-bold print:text-base">Klitzo India</p>
                <p className="text-slate-400">Industrial Area, MG Road</p>
                <p className="text-slate-400">Thrissur, Kerala - 680001</p>
                <p className="text-slate-400">contact@klitzo.com</p>
                <p className="text-slate-400 font-bold mt-2 hover:text-white print:mt-1">+91 8111813853</p>
              </div>
            </div>
          </div>

          <div className="p-8 md:p-12 print:p-6 print:pb-0">
            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-16 print:grid-cols-3 print:gap-4 print:mb-6">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 print:mb-2 print:text-[9px]">Billed To</h3>
                <div className="space-y-1 print:space-y-0 print:text-xs">
                  <p className="font-bold text-slate-800 text-lg print:text-sm">{order.shippingAddress?.name}</p>
                  <p className="text-slate-600 flex items-center gap-2"><Phone className="h-3 w-3 print:h-2 print:w-2" /> {order.shippingAddress?.phone}</p>
                  <p className="text-slate-600 flex items-center gap-2 pr-4"><MapPin className="h-3 w-3 flex-shrink-0 print:h-2 print:w-2" /> {order.shippingAddress?.address}, {order.shippingAddress?.place}, {order.shippingAddress?.district}, {order.shippingAddress?.pincode}</p>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 print:mb-2 print:text-[9px]">Order Details</h3>
                <div className="space-y-3 print:space-y-1">
                  <div className="flex justify-between items-center py-2 border-b border-slate-50 print:py-1">
                    <span className="text-slate-500 text-sm print:text-[10px]">Order Date</span>
                    <span className="font-bold text-slate-800 print:text-[10px]">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-50 print:py-1">
                    <span className="text-slate-500 text-sm print:text-[10px]">Payment Status</span>
                    <Badge className={`${getStatusColor(order.status)} border rounded-full px-3 py-0.5 text-[10px] print:text-[8px] print:px-2 font-bold uppercase tracking-wider`}>
                      {order.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center py-2 print:py-1">
                    <span className="text-slate-500 text-sm print:text-[10px]">Payment ID</span>
                    <span className="font-mono text-[10px] text-slate-400 print:text-[8px]">{order.razorpayPaymentId || "N/A"}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl md:col-span-2 lg:col-span-1 border border-slate-100 print:col-span-1 print:p-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 print:mb-2 print:text-[9px]">Summary</h3>
                <div className="space-y-4 print:space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 print:text-[10px]">Subtotal</span>
                    <span className="font-bold text-slate-800 print:text-[10px]">₹{order.amount}</span>
                  </div>
                  <div className="flex justify-between items-center text-teal-600 font-bold text-xl pt-4 border-t border-slate-200 print:pt-2 print:text-sm">
                    <span>Grand Total</span>
                    <span>₹{order.amount}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-2xl border border-slate-100 mb-12 print:mb-6 print:rounded-lg">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 print:bg-slate-100">
                    <th className="text-left py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-widest print:py-2 print:px-3 print:text-[9px]">Product Description</th>
                    <th className="text-center py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-widest print:py-2 print:px-3 print:text-[9px]">Quantity</th>
                    <th className="text-right py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-widest print:py-2 print:px-3 print:text-[9px]">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 print:divide-slate-100">
                  <tr>
                    <td className="py-6 px-6 print:py-2 print:px-3">
                      <div className="flex items-center gap-4 print:gap-2">
                        <div className="w-12 h-12 bg-slate-50 rounded-lg p-2 border border-slate-100 flex items-center justify-center overflow-hidden print:w-8 print:h-8 print:p-1">
                          <img
                            src={order.productImage ? (order.productImage.startsWith('/') ? order.productImage : `/${order.productImage}`) : "/placeholder.svg"}
                            alt={order.productName}
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 print:text-xs">{order.productName}</p>
                          <p className="text-xs text-slate-400 print:text-[9px]">Professional Grade Solution</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-6 px-6 text-center font-bold text-slate-600 print:py-2 print:px-3 print:text-xs">
                      {order.quantity || 1}
                    </td>
                    <td className="py-6 px-6 text-right font-bold text-slate-800 print:py-2 print:px-3 print:text-xs">
                      ₹{order.amount}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-8 border-t border-slate-100 print:mt-4 print:pt-4 invoice-footer">
              
              {/* Terms and Conditions Section Moved to Bottom */}
              <div className="mb-8 print:mb-4">
                <h4 className="font-bold text-slate-800 text-sm mb-2 print:text-[10px] print:mb-1">Terms & Conditions</h4>
                <p className="text-xs text-slate-500 leading-relaxed print:text-[8px] print:leading-snug">
                  1. This is a computer-generated invoice and doesn't require a physical signature.<br />
                  2. Goods once sold cannot be returned unless they are defective.<br />
                  3. Please report any discrepancies within 24 hours of receipt.<br />
                  4. All disputes are subject to Thrissur jurisdiction only.
                </p>
              </div>

              {/* Signature Area */}
              <div className="flex flex-col items-center justify-center">
                <div className="w-32 h-12 bg-slate-50 rounded-lg flex items-center justify-center mb-2 border border-slate-100 border-dashed print:w-24 print:h-8 print:mb-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase italic print:text-[7px]">Authorized Sign</span>
                </div>
                <p className="text-sm font-bold text-slate-800 print:text-[9px]">For KLITZO INDIA</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-6 text-center print:p-2">
            <p className="text-slate-400 text-xs font-medium print:text-[8px]">Thank you for choosing KLITZO! We appreciate your business.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
