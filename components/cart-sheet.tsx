"use client";

import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  Truck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import PurchaseForm from "@/components/purchase-form";

export default function CartSheet() {
  const {
    items,
    totalCount,
    subtotal,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  const [showCheckoutForm, setShowCheckoutForm] = useState(false);

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setShowCheckoutForm(true);
  };

  return (
    <>
      <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md p-0 flex flex-col bg-white border-l border-slate-200 z-[90]"
        >
          {/* Header */}
          <SheetHeader className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-gradient-to-tr from-teal-500 to-blue-600 text-white rounded-xl shadow-sm">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <SheetTitle className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                    Your Cart
                    {totalCount > 0 && (
                      <Badge className="bg-teal-100 text-teal-800 border-0 text-xs font-bold">
                        {totalCount} {totalCount === 1 ? "item" : "items"}
                      </Badge>
                    )}
                  </SheetTitle>
                  <p className="text-xs text-slate-500">Free delivery on all orders</p>
                </div>
              </div>
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-xs font-semibold text-slate-400 hover:text-red-600 transition-colors mr-6"
                >
                  Clear all
                </button>
              )}
            </div>
          </SheetHeader>

          {/* Body */}
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-teal-50 flex items-center justify-center mb-4 text-teal-600">
                <ShoppingCart className="w-10 h-10 opacity-70 stroke-[1.5]" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">Your cart is empty</h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-xs mb-6">
                Looks like you haven&apos;t added any items to your cart yet. Explore our cleaning solutions!
              </p>
              <Link href="/products" onClick={() => setIsCartOpen(false)}>
                <Button className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white rounded-full font-bold px-6 py-2 shadow-md hover:shadow-lg transition-all">
                  Browse Products
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 divide-y divide-slate-100">
                {items.map((item) => (
                  <div key={item.id} className="pt-3.5 first:pt-0 flex gap-3.5 group">
                    {/* Item Thumbnail */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 rounded-xl p-1.5 border border-slate-100 flex items-center justify-center shrink-0">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-2 leading-tight">
                            {item.name}
                          </h4>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="text-slate-400 hover:text-red-500 p-1 transition-colors shrink-0"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                        {item.variantSize && (
                          <div className="mt-1">
                            <span className="inline-block text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
                              Size: {item.variantSize}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Pricing and Stepper */}
                      <div className="flex items-center justify-between mt-2 pt-1">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-sm sm:text-base font-black text-slate-900">
                            ₹{(item.price * item.quantity).toFixed(0)}
                          </span>
                          {item.quantity > 1 && (
                            <span className="text-[11px] text-slate-400">
                              (₹{item.price} each)
                            </span>
                          )}
                        </div>

                        {/* Quantity Stepper */}
                        <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden shadow-xs">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 sm:p-1.5 hover:bg-slate-100 text-slate-600 transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2.5 text-xs font-bold text-slate-800 min-w-[20px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 sm:p-1.5 hover:bg-slate-100 text-slate-600 transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Free delivery badge */}
              <div className="px-4 sm:px-5 py-2 bg-gradient-to-r from-teal-50/80 to-blue-50/80 border-t border-b border-teal-100/60 flex items-center justify-between text-xs text-teal-900 font-semibold">
                <span className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-teal-600" /> All India Free Delivery
                </span>
                <span className="text-teal-700 font-bold">FREE</span>
              </div>

              {/* Footer Summary & Checkout */}
              <div className="p-4 sm:p-5 border-t border-slate-100 bg-white space-y-3">
                <div className="space-y-1.5 text-xs sm:text-sm">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal</span>
                    <span className="font-semibold text-slate-800">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Delivery</span>
                    <span className="font-bold text-emerald-600">FREE</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-100">
                    <span>Total Amount</span>
                    <span className="text-teal-600">₹{subtotal.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  onClick={handleProceedToCheckout}
                  className="w-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Multi-item Checkout Form Modal */}
      {showCheckoutForm && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99] p-4"
          onClick={() => setShowCheckoutForm(false)}
        >
          <div
            className="max-h-[90vh] overflow-y-auto w-full max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <PurchaseForm
              items={items}
              onClose={() => setShowCheckoutForm(false)}
              onSuccess={() => {
                clearCart();
                setShowCheckoutForm(false);
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
