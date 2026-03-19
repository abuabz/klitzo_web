"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingBag, ArrowLeft, Package, Calendar, CreditCard, ChevronRight, Loader2, Truck, CheckCircle2 } from "lucide-react"
import Link from "next/link"

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (!storedUser) {
      router.push("/login")
      return
    }
    const parsedUser = JSON.parse(storedUser)
    setUser(parsedUser)
    fetchOrders(parsedUser.email)
  }, [])

  const fetchOrders = async (email: string) => {
    try {
      const res = await fetch(`/api/orders?email=${email}`)
      const data = await res.json()
      if (Array.isArray(data)) {
        setOrders(data)
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center text-slate-600 hover:text-teal-600 transition-colors">
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span className="font-medium">Back to Shop</span>
          </Link>
          <h1 className="text-xl font-bold text-slate-800">My Orders</h1>
          <div className="w-24"></div> {/* Spacer */}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {orders.length === 0 ? (
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-xl text-center py-16">
            <CardContent>
              <div className="mx-auto w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                <ShoppingBag className="h-10 w-10 text-slate-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">No orders found</h2>
              <p className="text-slate-500 mb-8 max-w-md mx-auto">
                Looks like you haven't made any purchases yet. Your future orders will appear here.
              </p>
              <Link href="/products">
                <Button className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white px-8 h-12 rounded-xl font-semibold shadow-lg transition-all transform hover:scale-105">
                  Start Shopping
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-700">Recent Transactions</h2>
              <span className="text-sm text-slate-500">{orders.length} Orders</span>
            </div>

            {orders.map((order) => (
              <Card key={order._id} className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white overflow-hidden group">
                <CardContent className="p-0">
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors duration-300">
                          <Package className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Order ID</p>
                          <p className="font-bold text-slate-800">#{order.razorpayOrderId?.slice(-8) || "N/A"}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <Badge className={`${
                          order.status.toLowerCase() === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                          order.status.toLowerCase() === 'shipping' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                          order.status.toLowerCase() === 'paid' ? 'bg-teal-50 text-teal-700 border-teal-100' :
                          order.status.toLowerCase() === 'failed' ? 'bg-red-50 text-red-700 border-red-100' :
                          'bg-amber-50 text-amber-700 border-amber-100'
                        } px-3 py-1 flex items-center gap-1 border`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${
                             order.status.toLowerCase() === 'completed' ? 'bg-emerald-500' :
                             order.status.toLowerCase() === 'shipping' ? 'bg-blue-500' :
                             order.status.toLowerCase() === 'paid' ? 'bg-teal-500' :
                             order.status.toLowerCase() === 'failed' ? 'bg-red-500' :
                             'bg-amber-500 animate-pulse'
                          }`}></div>
                          {order.status.toUpperCase()}
                        </Badge>
                        <div className="flex items-center text-sm text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                          <Calendar className="h-4 w-4 mr-2" />
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-100">
                      <div>
                        <p className="text-sm font-semibold text-slate-800 mb-3 flex items-center">
                          <Package className="h-4 w-4 mr-2 text-teal-600" /> Product Details
                        </p>
                        <div className="bg-slate-50 p-4 rounded-xl flex items-center gap-4">
                           <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-lg p-2 border border-slate-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
                             <img 
                               src={order.productImage ? (order.productImage.startsWith('/') ? order.productImage : `/${order.productImage}`) : "/placeholder.svg"} 
                               alt={order.productName}
                               className="max-w-full max-h-full object-contain"
                             />
                           </div>
                           <div className="flex-1">
                             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-1 gap-1">
                                <span className="text-slate-600 font-bold line-clamp-1">{order.productName}</span>
                                <span className="text-slate-400 text-xs bg-white px-2 py-0.5 rounded border border-slate-100">Qty: {order.quantity || 1}</span>
                             </div>
                             <div className="flex flex-col mt-2">
                               <span className="text-xs text-slate-400 font-medium uppercase tracking-tighter">Amount Paid</span>
                               <span className="text-xl font-bold text-teal-700">₹{order.amount}</span>
                             </div>
                           </div>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-slate-800 mb-3 flex items-center">
                          <CreditCard className="h-4 w-4 mr-2 text-teal-600" /> Delivery To
                        </p>
                        <div className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl italic">
                          {order.shippingAddress?.name}, {order.shippingAddress?.phone} <br />
                          {order.shippingAddress?.address}, {order.shippingAddress?.place} <br />
                          {order.shippingAddress?.district}, {order.shippingAddress?.pincode}
                        </div>
                      </div>
                    </div>

                    {/* Quick Progress Tracker */}
                    <div className="mt-10 px-6 pb-8 border-t border-slate-50 pt-8">
                       <div className="relative flex justify-between items-center max-w-2xl mx-auto">
                          {/* Progress Line Background */}
                          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0 hidden sm:block"></div>
                          
                          {/* Active Progress Line */}
                          {order.status.toLowerCase() !== 'failed' && (
                            <div 
                              className="absolute top-1/2 left-0 h-0.5 bg-teal-500 -translate-y-1/2 z-0 transition-all duration-700 hidden sm:block"
                              style={{ 
                                width: `${
                                  order.status.toLowerCase() === 'completed' ? '100%' :
                                  order.status.toLowerCase() === 'shipping' ? '66%' :
                                  order.status.toLowerCase() === 'paid' ? '33%' : '0%'
                                }` 
                              }}
                            ></div>
                          )}

                          {[
                            { label: 'Placed', icon: Package },
                            { label: 'Paid', icon: CreditCard },
                            { label: 'Shipping', icon: Truck },
                            { label: 'Delivered', icon: CheckCircle2 }
                          ].map((step, idx) => {
                            const Icon = step.icon;
                            const statusMap: Record<string, number> = { 'pending': 0, 'paid': 1, 'shipping': 2, 'completed': 3, 'failed': -1 };
                            const currentStatusIdx = statusMap[order.status.toLowerCase()] ?? 0;
                            const isActive = idx <= currentStatusIdx;

                            return (
                              <div key={step.label} className="relative z-10 flex flex-col items-center group">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                                  isActive 
                                    ? 'bg-teal-500 border-teal-500 text-white shadow-lg shadow-teal-200 scale-110' 
                                    : 'bg-white border-slate-200 text-slate-400'
                                }`}>
                                  <Icon className="h-5 w-5" />
                                </div>
                                <div className="mt-3 flex flex-col items-center">
                                  <span className={`text-[10px] font-black uppercase tracking-tighter transition-colors duration-300 ${
                                    isActive ? 'text-teal-600' : 'text-slate-400'
                                  }`}>
                                    {step.label}
                                  </span>
                                  {isActive && idx === currentStatusIdx && (
                                     <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1 animate-ping"></span>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                       </div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <span className="text-xs text-slate-400 font-medium">Payment ID: {order.razorpayPaymentId || "Processing"}</span>
                    <Link 
                      href={`/invoice/${order._id}`}
                      className="w-full sm:w-auto px-6 py-2 bg-white hover:bg-teal-50 text-teal-600 border border-teal-100 rounded-full text-sm font-bold flex items-center justify-center gap-2 transition-all hover:shadow-md"
                    >
                      View Invoice <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
