"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ShoppingCart, User, MapPin, MessageCircle, CreditCard, Loader2 } from "lucide-react"
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
  onClose?: () => void
}

export default function PurchaseForm({ product, quantity, onClose }: PurchaseFormProps) {
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
    cashOnDelivery: false,
  })

  const [isProcessing, setIsProcessing] = useState(false)

  const handleInputChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      const user = JSON.parse(storedUser)
      setFormData(prev => ({
        ...prev,
        name: user.username || "",
        phone: user.mobile || "",
      }))
    }
  }, [])

  const getNumericPrice = (priceStr: string) => {
    if (!priceStr) return 0
    return Number.parseFloat(priceStr.replace(/[^0-9.]/g, "")) || 0
  }

  const handlePurchase = () => {
    const basePrice = getNumericPrice(product.price) * quantity
    const totalPrice = (basePrice + (formData.cashOnDelivery ? 50 : 0)).toFixed(2)

    const message = `🛒 *KLITZO Product Order*

📦 *Product Details:*
• Product: ${product.name}
• Price: ${product.price} each
• Quantity: ${quantity}
• Cash on Delivery: ${formData.cashOnDelivery ? "Yes (+₹50)" : "No"}
• Total Amount: ₹${totalPrice}

👤 *Customer Details:*
• Name: ${formData.name}
• Phone: ${formData.phone}

📍 *Delivery Address:*
• Address: ${formData.address}
• Place: ${formData.place}
• Post: ${formData.post}
• District: ${formData.district}
• Landmark: ${formData.landmark}
• PIN Code: ${formData.pincode}

${formData.notes ? `📝 *Additional Notes:*\n${formData.notes}\n\n` : ""}Please confirm this order and let me know the payment details and delivery timeline.

Thank you! 🙏`

    const whatsappUrl = `https://wa.me/918111813853?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")

    if (onClose) {
      onClose()
    }
  }

  const handleRazorpayPayment = async () => {
    setIsProcessing(true)
    try {
      const basePrice = getNumericPrice(product.price) * quantity
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
            // Construct message for WhatsApp after successful payment
            const message = `🛒 *KLITZO Paid Order*

✅ *Payment Status: PAID*
🆔 *Payment ID: ${response.razorpay_payment_id}*

📦 *Product Details:*
• Product: ${product.name}
• Price: ${product.price} each
• Quantity: ${quantity}
• Total Amount: ₹${totalPrice.toFixed(2)}

👤 *Customer Details:*
• Name: ${formData.name}
• Phone: ${formData.phone}

📍 *Delivery Address:*
• Address: ${formData.address}
• Place: ${formData.place}
• Post: ${formData.post}
• District: ${formData.district}
• Landmark: ${formData.landmark}
• PIN Code: ${formData.pincode}

${formData.notes ? `📝 *Additional Notes:*\n${formData.notes}\n\n` : ""}Payment has been completed online. Please process the delivery.

Thank you! 🙏`

            const whatsappUrl = `https://wa.me/918111813853?text=${encodeURIComponent(message)}`
            window.open(whatsappUrl, "_blank")
            if (onClose) onClose()
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

  // All new fields are required
  const isFormValid =
    formData.name.trim() !== "" &&
    formData.phone.trim() !== "" &&
    formData.address.trim() !== "" &&
    formData.place.trim() !== "" &&
    formData.post.trim() !== "" &&
    formData.district.trim() !== "" &&
    formData.landmark.trim() !== "" &&
    formData.pincode.trim() !== ""

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-slate-800 flex items-center justify-center gap-2">
          <ShoppingCart className="h-6 w-6 text-teal-600" />
          Complete Your Order
        </CardTitle>
        <p className="text-slate-600">Choose your preferred payment method</p>
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
              <p className="text-lg font-bold text-teal-600">
                Total: ₹{(getNumericPrice(product.price) * quantity + (formData.cashOnDelivery ? 50 : 0)).toFixed(2)}
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
                type="number"
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
              />
            </div>

            <div>
              <Label htmlFor="place">Place *</Label>
              <Input
                id="place"
                value={formData.place}
                onChange={(e) => handleInputChange("place", e.target.value)}
                placeholder="Village / Town / Area"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="post">Post *</Label>
              <Input
                id="post"
                value={formData.post}
                onChange={(e) => handleInputChange("post", e.target.value)}
                placeholder="Post Office"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="district">District *</Label>
              <Input
                id="district"
                value={formData.district}
                onChange={(e) => handleInputChange("district", e.target.value)}
                placeholder="District"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="landmark">Landmark *</Label>
              <Input
                id="landmark"
                value={formData.landmark}
                onChange={(e) => handleInputChange("landmark", e.target.value)}
                placeholder="Nearby landmark"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="pincode">Pin code *</Label>
              <Input
                id="pincode"
                value={formData.pincode}
                onChange={(e) => handleInputChange("pincode", e.target.value)}
                placeholder="e.g., 680001"
                className="mt-1"
                type="number"
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

        {/* Cash on Delivery */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="cashOnDelivery"
            checked={formData.cashOnDelivery}
            onCheckedChange={(checked) => handleInputChange("cashOnDelivery", !!checked)}
          />
          <Label htmlFor="cashOnDelivery" className="text-sm font-medium">
            Cash on Delivery (+₹50)
          </Label>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button
            onClick={handleRazorpayPayment}
            disabled={!isFormValid || isProcessing}
            className="flex-1 bg-gradient-to-r from-teal-500 to-teal-700 hover:from-teal-600 hover:to-teal-800 text-white py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
            variant="outline"
            className="flex-1 border-2 border-slate-300 text-slate-700 hover:bg-slate-50 py-6 text-lg rounded-xl transition-all duration-300 disabled:opacity-50"
          >
            <MessageCircle className="mr-2 h-5 w-5" />
            Order on WhatsApp
          </Button>
        </div>

        {onClose && (
          <div className="flex justify-center">
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-700 text-sm font-medium underline"
            >
              Cancel Order
            </button>
          </div>
        )}

        <div className="text-center text-sm text-slate-500 bg-slate-50 p-3 rounded-lg">
          <p>🔒 Your information is secure and will only be used to process your order.</p>
          <p>📱 You'll be redirected to WhatsApp to complete your purchase.</p>
        </div>
      </CardContent>
    </Card>
  )
}