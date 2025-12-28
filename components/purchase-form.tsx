"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ShoppingCart, User, MapPin, MessageCircle } from "lucide-react"
import { useState } from "react"

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
    houseDetails: "",
    pincode: "",
    notes: "",
    cashOnDelivery: false,
  })

  const handleInputChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handlePurchase = () => {
    const basePrice = Number.parseFloat(product.price.slice(1)) * quantity
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
• Address: ${formData.houseDetails}
• PIN Code: ${formData.pincode}

${formData.notes ? `📝 *Additional Notes:*\n${formData.notes}\n\n` : ""}Please confirm this order and let me know the payment details and delivery timeline.

Thank you! 🙏`

    const whatsappUrl = `https://wa.me/918111813853?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")

    if (onClose) {
      onClose()
    }
  }

  // Required fields for validation
  const isFormValid =
    formData.name.trim() !== "" &&
    formData.phone.trim() !== "" &&
    formData.houseDetails.trim() !== "" &&
    formData.pincode.trim() !== ""

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
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
              <p className="text-lg font-bold text-teal-600">
                Total: ₹{(Number.parseFloat(product.price.slice(1)) * quantity + (formData.cashOnDelivery ? 50 : 0)).toFixed(2)}
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
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter your full name"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="phone">Mobile Number *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="+91 XXXXX XXXXX"
                className="mt-1"
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

          <div>
            <Label htmlFor="houseDetails">Address*</Label>
            <Input
              id="houseDetails"
              value={formData.houseDetails}
              onChange={(e) => handleInputChange("houseDetails", e.target.value)}
              placeholder="e.g., Flat 101, Sunrise Apartments, near ABC School"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="pincode">PIN Code *</Label>
            <Input
              id="pincode"
              value={formData.pincode}
              onChange={(e) => handleInputChange("pincode", e.target.value)}
              placeholder="e.g., 680001"
              className="mt-1"
            />
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
            onClick={handlePurchase}
            disabled={!isFormValid}
            className="flex-1 bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white py-3 text-lg rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <MessageCircle className="mr-2 h-5 w-5" />
            Order via WhatsApp
          </Button>
          {onClose && (
            <Button
              onClick={onClose}
              variant="outline"
              className="border-slate-300 text-slate-600 hover:bg-slate-100 py-3 rounded-full transition-all duration-300"
            >
              Cancel
            </Button>
          )}
        </div>

        <div className="text-center text-sm text-slate-500 bg-slate-50 p-3 rounded-lg">
          <p>🔒 Your information is secure and will only be used to process your order.</p>
          <p>📱 You'll be redirected to WhatsApp to complete your purchase.</p>
        </div>
      </CardContent>
    </Card>
  )
}