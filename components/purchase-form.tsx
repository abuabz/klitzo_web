"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ShoppingCart, User, MapPin, MessageCircle, CreditCard, Loader2, ShoppingBag, X } from "lucide-react"
import { useState, useEffect } from "react"
import Script from "next/script"
import { toast } from "sonner"

interface PurchaseFormProps {
  product: {
    id: number
    name: string
    price: string
    image: string
  }
  quantity: number
  initialCashOnDelivery?: boolean
  onClose?: () => void
}

export default function PurchaseForm({ product, quantity, initialCashOnDelivery, onClose }: PurchaseFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    place: "",
    post: "",
    district: "",
    landmark: "",
    pincode: "",
    notes: "",
    isPrepaid: false,
  })
  const [postOffices, setPostOffices] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Auto-fill logged in user info
  useEffect(() => {
    try {
      const savedUserStr = localStorage.getItem("user");
      if (savedUserStr) {
        const savedUser = JSON.parse(savedUserStr);
        if (savedUser) {
          setFormData(prev => ({
            ...prev,
            name: savedUser.username || savedUser.name || prev.name,
            phone: savedUser.mobile || prev.phone,
          }));
        }
      }
    } catch (e) {
      console.error("Failed to parse user from local storage", e);
    }
  }, []);

  const handleInputChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handlePincodeChange = async (value: string) => {
    handleInputChange("pincode", value)
    if (value.length === 6) {
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${value}`)
        const data = await res.json()
        if (data && data[0] && data[0].Status === "Success" && data[0].PostOffice) {
          const fetchedPostOffices = data[0].PostOffice.map((po: any) => po.Name)
          setPostOffices(fetchedPostOffices)
          if (fetchedPostOffices.length > 0 && !fetchedPostOffices.includes(formData.post)) {
            handleInputChange("post", fetchedPostOffices[0])
          }
          if (data[0].PostOffice[0].District) {
            handleInputChange("district", data[0].PostOffice[0].District)
          }
        } else {
          setPostOffices([])
        }
      } catch (err) {
        console.error(err)
        setPostOffices([])
      }
    } else {
      setPostOffices([])
    }
  }


  const handlePurchase = async () => {
    setIsProcessing(true);
    try {
      const basePrice = Number.parseFloat(String(product.price).replace(/[^\d.]/g, "")) * quantity;
      const discount = formData.isPrepaid ? 50 : 0;
      const totalPrice = (basePrice - discount).toFixed(2);

      const user = JSON.parse(localStorage.getItem("user") || "{}");

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          productName: product.name,
          productImage: product.image,
          amount: Number(totalPrice),
          quantity: quantity,
          status: "pending",
          shippingAddress: { ...formData },
          notes: formData.notes,
          user: user
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save order to database");
      }

      toast.success("Order placed successfully!");
      setIsSuccess(true);
    } catch (error) {
      console.error(error);
      toast.error("Failed to process order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }

  const handleRazorpayPayment = async () => {
    setIsProcessing(true)
    try {
      const basePrice = Number.parseFloat(String(product.price).replace(/[^\d.]/g, "")) * quantity
      const totalPrice = basePrice // No COD fee for online payment

      // 1. Create order on server
      const response = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: totalPrice,
          currency: "INR",
        }),
      })

      if (!response.ok) throw new Error("Failed to create order")
      const order = await response.json()

      // 2. Open Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "KLITZO",
        description: `Purchase of ${product.name}`,
        image: "/klitzo-logo.png",
        order_id: order.id,
        handler: async function (response: any) {
          // 3. Verify payment on server
          const verifyRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderDetails: {
                productId: product.id,
                productName: product.name,
                productImage: product.image,
                amount: totalPrice,
                quantity: quantity,
                shippingAddress: { ...formData },
                user: JSON.parse(localStorage.getItem("user") || "{}")
              }
            }),
          })

          const verifyData = await verifyRes.json()

          if (verifyData.success) {
            toast.success("Payment successful!")
            setIsSuccess(true)
          } else {
            toast.error("Payment verification failed. Please contact support.")
          }
        },
        prefill: {
          name: formData.name,
          contact: formData.phone,
        },
        notes: {
          address: formData.address,
        },
        theme: {
          color: "#0d9488", // teal-600
        },
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.on("payment.failed", function (response: any) {
        toast.error(response.error.description)
      })
      rzp.open()
    } catch (error: any) {
      console.error(error)
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  // All new fields are required except landmark
  const isFormValid =
    formData.name.trim() !== "" &&
    formData.phone.trim() !== "" &&
    formData.address.trim() !== "" &&
    formData.place.trim() !== "" &&
    formData.post.trim() !== "" &&
    formData.district.trim() !== "" &&
    formData.pincode.trim() !== ""

  if (isSuccess) {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 6);
    const dateString = deliveryDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    
    return (
      <Card className="w-full max-w-2xl mx-auto overflow-hidden shadow-2xl">
        <CardHeader className="text-center relative bg-gradient-to-b from-teal-50 to-white pb-8 pt-12 border-b border-teal-100">
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose} className="absolute right-4 top-4 text-teal-700 hover:bg-teal-100">
              <X className="h-5 w-5" />
            </Button>
          )}
          <div className="mx-auto w-24 h-24 bg-teal-500 text-white flex items-center justify-center rounded-full mb-6 ring-8 ring-teal-50 shadow-lg shadow-teal-200">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <CardTitle className="text-4xl font-black text-slate-800 tracking-tight">
            Order Confirmed!
          </CardTitle>
          <p className="text-teal-700 font-medium mt-3 text-lg">Thank you for your purchase.</p>
        </CardHeader>
        <CardContent className="space-y-8 pt-10 pb-12 px-8 text-center bg-white">
          <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-blue-500"></div>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">Expected Delivery</h3>
            <p className="text-2xl font-black text-slate-800">{dateString}</p>
          </div>
          
          <Button 
            className="w-full bg-slate-900 hover:bg-slate-800 text-white py-7 rounded-2xl font-bold text-lg shadow-xl shadow-slate-200 transition-all active:scale-[0.98]"
            onClick={() => {
               window.open("/my-orders", "_blank");
               if (onClose) onClose();
            }}
          >
            Track My Order
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <CardHeader className="text-center relative">
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </Button>
        )}
        <CardTitle className="text-2xl font-bold text-slate-800 flex items-center justify-center gap-2">
          <ShoppingCart className="h-6 w-6 text-teal-600" />
          Complete Your Order
        </CardTitle>
        <p className="text-slate-600">Fill in your details to proceed with WhatsApp order</p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Order Summary */}
        <div className="bg-gradient-to-r from-teal-50 to-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-slate-800 mb-3">Order Summary</h3>
          <div className="flex items-center gap-4">
            <img
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              className="w-16 h-16 object-contain rounded-lg bg-white p-2 shadow-sm"
            />
            <div className="flex-1">
              <h4 className="font-medium text-slate-800">{product.name}</h4>
              <p className="text-slate-600">Quantity: {quantity}</p>
              {formData.isPrepaid && (
                <p className="text-sm text-green-600 font-semibold mt-0.5">Prepaid Discount: -₹50</p>
              )}
              <p className="text-lg font-bold text-teal-600 mt-1">
                Total: ₹{(Number.parseFloat(String(product.price).replace(/[^\d.]/g, "")) * quantity - (formData.isPrepaid ? 50 : 0)).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <User className="h-5 w-5 text-teal-600" />
            <h3 className="text-lg font-semibold text-slate-800">Customer Information</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter your full name"
                className="mt-1"
                autoComplete="name"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="+91 XXXXX XXXXX"
                className="mt-1"
                type="tel"
                autoComplete="tel"
              />
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="h-5 w-5 text-teal-600" />
            <h3 className="text-lg font-semibold text-slate-800">Delivery Address</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="Address"
                className="mt-1"
                autoComplete="street-address"
              />
            </div>

            <div>
              <Label htmlFor="pincode">Pin code *</Label>
              <Input
                id="pincode"
                value={formData.pincode}
                onChange={(e) => handlePincodeChange(e.target.value)}
                placeholder="e.g., 680001"
                className="mt-1"
                type="number"
                autoComplete="postal-code"
              />
            </div>

            <div>
              <Label htmlFor="place">Place *</Label>
              <Input
                id="place"
                autoComplete="address-level2"
                value={formData.place}
                onChange={(e) => handleInputChange("place", e.target.value)}
                placeholder="Village / Town / Area"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="post">Post Office *</Label>
              {postOffices.length > 0 ? (
                <select
                  id="post"
                  value={formData.post}
                  onChange={(e) => handleInputChange("post", e.target.value)}
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 mt-1"
                >
                  <option value="">Select Post Office</option>
                  {postOffices.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              ) : (
                <Input
                  id="post"
                  value={formData.post}
                  onChange={(e) => handleInputChange("post", e.target.value)}
                  placeholder="Post Office"
                  className="mt-1"
                />
              )}
            </div>

            <div>
              <Label htmlFor="district">District *</Label>
              <Input
                id="district"
                value={formData.district}
                onChange={(e) => handleInputChange("district", e.target.value)}
                placeholder="District"
                className="mt-1"
                autoComplete="address-level1"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="landmark">Landmark (Optional)</Label>
              <Input
                id="landmark"
                value={formData.landmark}
                onChange={(e) => handleInputChange("landmark", e.target.value)}
                placeholder="Nearby landmark"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Input
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Any special instructions, alternate phone, delivery time preference..."
              className="mt-1"
            />
          </div>
        </div>

        {/* Prepaid Option - Hidden per user request */}
        <div className={`hidden p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer items-start space-x-3 ${formData.isPrepaid ? "border-green-500 bg-green-50 shadow-md" : "border-slate-200 bg-white hover:border-green-300"}`} onClick={() => handleInputChange("isPrepaid", !formData.isPrepaid)}>
          <Checkbox
            id="isPrepaid"
            checked={formData.isPrepaid}
            onCheckedChange={(checked) => handleInputChange("isPrepaid", !!checked)}
            className="mt-1 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
          />
          <div className="flex-1">
            <Label htmlFor="isPrepaid" className="text-base font-bold text-green-700 cursor-pointer flex flex-wrap items-center gap-2">
              Pay Prepaid & Save ₹50!
              <span className="bg-green-100 text-green-800 text-[10px] uppercase px-2 py-0.5 rounded-full font-bold border border-green-200">Recommended</span>
            </Label>
            <p className="text-sm text-slate-600 mt-1 cursor-pointer">
              Get an instant ₹50 discount on your order by choosing to pay prepaid. We will contact you with payment details.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          {/* Razorpay Button - Hidden per user request */}
          <Button
            onClick={handleRazorpayPayment}
            disabled={!isFormValid || isProcessing}
            className="hidden flex-1 bg-gradient-to-r from-teal-500 to-teal-700 hover:from-teal-600 hover:to-teal-800 text-white py-3 text-lg rounded-full shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isProcessing ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <CreditCard className="mr-2 h-5 w-5" />
            )}
            Pay Online (Prepaid)
          </Button>

          <Button
            onClick={handlePurchase}
            disabled={!isFormValid || isProcessing}
            className="w-full bg-gradient-to-r from-teal-500 to-teal-700 hover:from-teal-600 hover:to-teal-800 text-white py-3 text-lg rounded-full shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:transform-none"
          >
            {isProcessing ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <ShoppingBag className="mr-2 h-5 w-5" />
            )}
            Complete Order
          </Button>
        </div>

        <div className="text-center text-sm text-slate-500 bg-slate-50 p-3 rounded-lg">
          <p>🔒 Your information is secure and will only be used to process your order.</p>
          <p>🚚 Payment will be collected upon delivery.</p>
        </div>
      </CardContent>
    </Card>
  )
}