"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingBag, ArrowLeft, Package, Calendar, CreditCard, ChevronRight, Loader2, Truck, CheckCircle2, Copy, XCircle, MapPin } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import Link from "next/link"
import { toast } from "sonner"

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [isGuest, setIsGuest] = useState(false)
  const [guestMobile, setGuestMobile] = useState("")
  const [hasSearched, setHasSearched] = useState(false)
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null)
  const [trackingModalOrder, setTrackingModalOrder] = useState<any | null>(null)
  const [postalTrackingData, setPostalTrackingData] = useState<any | null>(null)
  const [loadingTracking, setLoadingTracking] = useState(false)
  const router = useRouter()

  const handleOpenPostalTracking = async (order: any) => {
    setTrackingModalOrder(order)
    setLoadingTracking(true)
    setPostalTrackingData(null)
    try {
      const res = await fetch(`/api/shipping/indiapost/track?orderId=${order._id}&articleNumber=${order.trackingId}`)
      const data = await res.json()
      if (res.ok && data.success) {
        setPostalTrackingData(data.tracking)
      } else {
        toast.error(data.error || "Unable to fetch live tracking details")
      }
    } catch (err) {
      toast.error("Failed to connect to tracking service")
    } finally {
      setLoadingTracking(false)
    }
  }

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (!storedUser) {
      setIsGuest(true)
      setLoading(false)
      return
    }
    const parsedUser = JSON.parse(storedUser)
    setUser(parsedUser)
    fetchOrders(parsedUser.email || parsedUser.mobile, parsedUser.email ? 'email' : 'mobile')
  }, [])

  const fetchOrders = async (query: string, type: 'email' | 'mobile' = 'email') => {
    setLoading(true)
    try {
      const res = await fetch(`/api/orders?${type}=${query}`)
      const data = await res.json()
      if (Array.isArray(data)) {
        setOrders(data)
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast.error("Failed to fetch orders.")
    } finally {
      setLoading(false)
      setHasSearched(true)
    }
  }

  const handleGuestSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!guestMobile || guestMobile.length < 10) {
      toast.error("Please enter a valid mobile number")
      return
    }
    fetchOrders(guestMobile, 'mobile')
  }

  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    
    setCancellingOrderId(orderId);
    try {
      const response = await fetch('/api/orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          customerCancel: true,
          customerEmail: user?.email,
          customerMobile: guestMobile || user?.mobile
        }),
      });
      
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error || "Failed to cancel order");
      } else {
        toast.success("Order cancelled successfully");
        if (isGuest && guestMobile) {
          fetchOrders(guestMobile, 'mobile');
        } else if (user?.email) {
          fetchOrders(user.email, 'email');
        }
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setCancellingOrderId(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    )
  }

  if (isGuest && !hasSearched) {
    return (
      <div className="min-h-screen bg-slate-50 pb-20 pt-32 md:pt-40">
        <div className="bg-white border-b border-slate-200 mb-8">
          <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center text-slate-600 hover:text-teal-600 transition-colors">
              <ArrowLeft className="h-5 w-5 mr-2" />
              <span className="font-medium">Back to Shop</span>
            </Link>
            <h1 className="text-xl font-bold text-slate-800">Track Order</h1>
            <div className="w-24"></div>
          </div>
        </div>
        <div className="max-w-md mx-auto px-4 py-8">
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-slate-800">Track Your Order</CardTitle>
              <CardDescription>Enter the mobile number you used during checkout</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGuestSearch} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile Number</Label>
                  <Input
                    id="mobile"
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={guestMobile}
                    onChange={(e) => setGuestMobile(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white">
                  Track Orders
                </Button>
                <div className="text-center mt-4 pt-4 border-t border-slate-100">
                  <p className="text-sm text-slate-500 mb-2">Have an account?</p>
                  <Link href="/login">
                    <Button variant="outline" className="w-full text-teal-600 border-teal-200 hover:bg-teal-50" type="button">
                      Login
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-32 md:pt-40">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 mb-8">
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
                          <p className="font-bold text-slate-800">#{order.razorpayOrderId?.slice(-8).toUpperCase() || "ORD-" + order._id.slice(-6).toUpperCase()}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <Badge className={`${
                          order.status.toLowerCase() === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                          order.status.toLowerCase() === 'shipping' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                          order.status.toLowerCase() === 'paid' ? 'bg-teal-50 text-teal-700 border-teal-100' :
                          ['failed', 'cancelled'].includes(order.status.toLowerCase()) ? 'bg-red-50 text-red-700 border-red-100' :
                          'bg-amber-50 text-amber-700 border-amber-100'
                        } px-3 py-1 flex items-center gap-1 border`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${
                             order.status.toLowerCase() === 'completed' ? 'bg-emerald-500' :
                             order.status.toLowerCase() === 'shipping' ? 'bg-blue-500' :
                             order.status.toLowerCase() === 'paid' ? 'bg-teal-500' :
                             ['failed', 'cancelled'].includes(order.status.toLowerCase()) ? 'bg-red-500' :
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
                        {['pending', 'paid'].includes(order.status.toLowerCase()) && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 h-8 rounded-full"
                            onClick={() => handleCancelOrder(order._id)}
                            disabled={cancellingOrderId === order._id}
                          >
                            {cancellingOrderId === order._id ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <XCircle className="h-4 w-4 mr-1" />}
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-100">
                      <div>
                        <p className="text-sm font-semibold text-slate-800 mb-3 flex items-center">
                          <Package className="h-4 w-4 mr-2 text-teal-600" /> Product Details
                        </p>
                        {order.items && order.items.length > 0 ? (
                          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                            {order.items.map((it: any, itIdx: number) => (
                              <div key={itIdx} className="bg-slate-50 p-3 rounded-xl flex items-center gap-3">
                                <div className="w-14 h-14 bg-white rounded-lg p-1.5 border border-slate-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
                                  <img
                                    src={it.productImage ? (it.productImage.startsWith('/') ? it.productImage : `/${it.productImage}`) : "/placeholder.svg"}
                                    alt={it.productName}
                                    className="max-w-full max-h-full object-contain"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-start gap-1">
                                    <span className="text-slate-800 font-bold text-xs sm:text-sm line-clamp-1">{it.productName}</span>
                                    <span className="text-slate-500 text-[11px] bg-white px-2 py-0.5 rounded border border-slate-100 shrink-0 font-medium">Qty: {it.quantity || 1}</span>
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    {it.variantSize && <span className="text-[11px] text-teal-700 font-semibold bg-teal-50 px-1.5 py-0.5 rounded">Size: {it.variantSize}</span>}
                                    <span className="text-xs font-bold text-teal-700">₹{it.price || ((order.amount || 0) / (order.items.length || 1)).toFixed(0)}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                            <div className="flex justify-between items-center p-2 bg-teal-50/50 rounded-lg text-xs font-bold text-teal-900">
                              <span>Total Amount</span>
                              <span className="text-sm text-teal-700">₹{order.amount}</span>
                            </div>
                          </div>
                        ) : (
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
                        )}
                      </div>

                      <div className="flex flex-col h-full">
                        <p className="text-sm font-semibold text-slate-800 mb-3 flex items-center">
                          <Truck className="h-4 w-4 mr-2 text-teal-600" /> Delivery To
                        </p>
                        <div className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl italic mb-3 flex-1">
                          {order.shippingAddress?.name}, {order.shippingAddress?.phone} <br />
                          {order.shippingAddress?.address}, {order.shippingAddress?.place} <br />
                          {order.shippingAddress?.district}, {order.shippingAddress?.pincode}
                        </div>
                        {order.status.toLowerCase() !== 'completed' && order.status.toLowerCase() !== 'failed' && order.status.toLowerCase() !== 'cancelled' && (
                          <div className="flex items-center gap-2 text-sm text-slate-700 bg-teal-50 p-3 rounded-xl border border-teal-100">
                            <Calendar className="h-4 w-4 text-teal-600 shrink-0" />
                            <span>Delivery within 3 to 6 days: <strong>
                              {(() => {
                                const startDate = new Date(order.createdAt);
                                startDate.setDate(startDate.getDate() + 3);
                                const endDate = new Date(order.createdAt);
                                endDate.setDate(endDate.getDate() + 6);
                                
                                const formatOpts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
                                return `${startDate.toLocaleDateString('en-IN', formatOpts)} to ${endDate.toLocaleDateString('en-IN', { ...formatOpts, year: 'numeric' })}`;
                              })()}
                            </strong></span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quick Progress Tracker */}
                    <div className="mt-10 px-6 pb-8 border-t border-slate-50 pt-8">
                       <div className="relative flex justify-between items-center max-w-2xl mx-auto">
                          {/* Progress Line Background */}
                          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0 hidden sm:block"></div>
                          
                          {/* Active Progress Line */}
                          {order.status.toLowerCase() !== 'failed' && order.status.toLowerCase() !== 'cancelled' && (
                            <div 
                              className="absolute top-1/2 left-0 h-0.5 bg-teal-500 -translate-y-1/2 z-0 transition-all duration-700 hidden sm:block"
                              style={{ 
                                width: `${
                                  order.status.toLowerCase() === 'completed' ? (order.razorpayPaymentId ? '100%' : '66%') :
                                  order.status.toLowerCase() === 'shipping' ? (order.razorpayPaymentId ? '66%' : '33%') :
                                  order.status.toLowerCase() === 'paid' ? (order.razorpayPaymentId ? '33%' : '100%') : '0%'
                                }` 
                              }}
                            ></div>
                          )}

                          {(order.razorpayPaymentId ? [
                            { label: 'Placed', icon: Package },
                            { label: 'Paid', icon: CreditCard },
                            { label: 'Shipping', icon: Truck },
                            { label: 'Delivered', icon: CheckCircle2 }
                          ] : [
                            { label: 'Placed', icon: Package },
                            { label: 'Shipping', icon: Truck },
                            { label: 'Delivered', icon: CheckCircle2 },
                            { label: 'Paid', icon: CreditCard }
                          ]).map((step, idx) => {
                            const Icon = step.icon;
                            const statusMap: Record<string, number> = order.razorpayPaymentId 
                              ? { 'pending': 0, 'paid': 1, 'shipping': 2, 'completed': 3, 'failed': -1, 'cancelled': -1 }
                              : { 'pending': 0, 'shipping': 1, 'completed': 2, 'paid': 3, 'failed': -1, 'cancelled': -1 };
                            
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

                  {order.trackingId && (
                    <div className="mx-6 mb-6 p-4 bg-teal-50 border border-teal-100 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 shrink-0">
                          <Truck className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-xs font-bold text-teal-800 uppercase tracking-wider">India Post Tracking ID</p>
                            <span className="text-[10px] bg-teal-200/60 text-teal-900 font-extrabold px-1.5 py-0.2 rounded">SPEED POST</span>
                          </div>
                          <p className="text-sm font-mono font-bold text-slate-800">{order.trackingId}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button 
                          size="sm" 
                          className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs h-9 px-4 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                          onClick={() => handleOpenPostalTracking(order)}
                        >
                          <MapPin className="h-3.5 w-3.5" />
                          <span>Track Live Status</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-teal-200 text-teal-700 hover:bg-teal-100 h-9 px-3 rounded-xl shrink-0"
                          onClick={() => {
                            navigator.clipboard.writeText(order.trackingId);
                            toast.success("Tracking ID copied to clipboard!");
                          }}
                          title="Copy tracking number"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <span className="text-xs text-slate-400 font-medium">{order.razorpayPaymentId ? `Payment ID: ${order.razorpayPaymentId}` : "Payment Mode: Cash on Delivery"}</span>
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

      {/* Post Office Level Live Tracking Modal */}
      <Dialog open={!!trackingModalOrder} onOpenChange={(open) => !open && setTrackingModalOrder(null)}>
        <DialogContent className="sm:max-w-2xl bg-white max-h-[90vh] overflow-y-auto p-0 border-0 rounded-2xl shadow-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-amber-600 p-6 text-white rounded-t-2xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-black tracking-widest uppercase bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-xs">
                    DEPARTMENT OF POSTS &bull; INDIA
                  </span>
                  <span className="bg-amber-300 text-slate-900 font-extrabold text-[10px] px-2 py-0.5 rounded-full">
                    SPEED POST
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight">Post Office Live Tracking</h3>
                <p className="text-white/80 text-xs mt-0.5">
                  Real-time consignment milestones from booking to doorstep delivery
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {loadingTracking ? (
              <div className="py-16 text-center space-y-3">
                <Loader2 className="w-8 h-8 text-teal-600 animate-spin mx-auto" />
                <p className="text-sm font-semibold text-slate-600">Connecting to Post Office tracking gateway...</p>
              </div>
            ) : postalTrackingData ? (
              <>
                {/* Consignment Overview Card */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Consignment Number</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-lg sm:text-xl font-mono font-black text-slate-900">
                          {postalTrackingData.articleNumber}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(postalTrackingData.articleNumber);
                            toast.success("Tracking number copied!");
                          }}
                          className="p-1 text-slate-400 hover:text-teal-600 hover:bg-white rounded transition-colors"
                          title="Copy Consignment Number"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="sm:text-right">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Current Status</p>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 mt-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        {postalTrackingData.currentStatus}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 text-xs">
                    <div>
                      <span className="text-slate-400 block font-medium">Booked At</span>
                      <span className="font-bold text-slate-800">{postalTrackingData.bookedAt}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Destination Office</span>
                      <span className="font-bold text-slate-800">{postalTrackingData.destinationOffice}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Destination PIN</span>
                      <span className="font-bold text-slate-800">{postalTrackingData.destinationPin}</span>
                    </div>
                  </div>
                </div>

                {/* Vertical Postal Journey Timeline */}
                <div>
                  <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-teal-600" />
                    Postal Transit History
                  </h4>

                  <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2.5 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                    {postalTrackingData.events?.map((ev: any, idx: number) => {
                      const isCompleted = ev.status === "completed";
                      const isCurrent = ev.status === "current";
                      return (
                        <div key={idx} className="relative group">
                          {/* Dot / Icon */}
                          <div
                            className={`absolute -left-6 sm:-left-8 top-0.5 w-5 h-5 sm:w-7 sm:h-7 rounded-full flex items-center justify-center border-2 transition-all ${
                              isCompleted
                                ? "bg-teal-600 border-teal-600 text-white shadow-sm"
                                : isCurrent
                                ? "bg-amber-500 border-amber-500 text-white ring-4 ring-amber-100"
                                : "bg-white border-slate-300 text-slate-300"
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4" />
                            ) : (
                              <div className="w-2 h-2 rounded-full bg-current" />
                            )}
                          </div>

                          {/* Event Content */}
                          <div
                            className={`p-3.5 rounded-xl border transition-all ${
                              isCurrent
                                ? "bg-amber-50/60 border-amber-200 shadow-xs"
                                : "bg-white border-slate-100 hover:border-slate-200"
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                              <span className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                                {ev.event}
                                {isCurrent && (
                                  <Badge className="bg-amber-200 text-amber-900 text-[10px] px-1.5 py-0 border-0">
                                    Latest Event
                                  </Badge>
                                )}
                              </span>
                              <span className="text-[11px] font-mono text-slate-400">
                                {ev.date} &bull; {ev.time}
                              </span>
                            </div>

                            <p className="text-xs font-semibold text-teal-800 mt-0.5">
                              📍 {ev.office}
                            </p>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                              {ev.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Footer fallback button */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-500">
                  <span>Data verified via India Post tracking gateway</span>
                  <a
                    href="https://www.indiapost.gov.in/#trackandtrace"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-600 hover:underline font-semibold flex items-center gap-1"
                  >
                    Open on indiapost.gov.in →
                  </a>
                </div>
              </>
            ) : (
              <div className="text-center py-10 text-slate-500 text-sm">
                No tracking events found for this consignment.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
