"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, ShoppingCart, Plus, Minus, Check } from "lucide-react";
import { useCart } from "@/context/CartContext";

export interface ProductVariantModalProps {
  product: any | null;
  isOpen: boolean;
  onClose: () => void;
  onBuyNow?: (product: any, variant: any, quantity: number) => void;
}

export default function ProductVariantModal({
  product,
  isOpen,
  onClose,
  onBuyNow,
}: ProductVariantModalProps) {
  const { addItem, openCart } = useCart();
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);

  // When product changes or opens, set initial variant
  useEffect(() => {
    if (product && Array.isArray(product.variants) && product.variants.length > 0) {
      setSelectedVariant(product.variants[0]);
    } else {
      setSelectedVariant(null);
    }
    setQuantity(1);
  }, [product, isOpen]);

  if (!product) return null;

  const variants: any[] = Array.isArray(product.variants) ? product.variants : [];
  const currentVariant = selectedVariant || variants[0] || null;

  const currentPriceNum = currentVariant
    ? Number.parseFloat(String(currentVariant.price).replace(/[^\d.]/g, ""))
    : Number.parseFloat(String(product.price).replace(/[^\d.]/g, ""));

  const currentOrigPriceNum = currentVariant?.originalPrice || product.originalPrice
    ? Number.parseFloat(String(currentVariant?.originalPrice || product.originalPrice).replace(/[^\d.]/g, ""))
    : undefined;

  const currentImage =
    currentVariant?.images?.[0] ||
    currentVariant?.image ||
    product.images?.[0] ||
    product.image ||
    "/placeholder.svg";

  const handleAddToCart = () => {
    const variantKey = currentVariant?.sku || currentVariant?.size || "default";
    const variantSize = currentVariant?.size || undefined;

    addItem(
      {
        id: `${product.id}-${variantKey}`,
        productId: product.id,
        name: product.name,
        variantSize: variantSize,
        price: currentPriceNum,
        originalPrice: currentOrigPriceNum,
        image: currentImage,
      },
      quantity
    );

    onClose();
    openCart();
  };

  const handleBuyNow = () => {
    if (onBuyNow) {
      onBuyNow(product, currentVariant, quantity);
    } else {
      handleAddToCart();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-2xl">
        {/* Header */}
        <DialogHeader className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-xl bg-white border border-slate-200/80 p-1 flex items-center justify-center shrink-0 shadow-xs">
              <img
                src={currentImage}
                alt={product.name}
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-1">
                <Badge className="bg-teal-50 text-teal-700 border border-teal-200 text-[10px] font-bold px-2 py-0">
                  Select Size
                </Badge>
              </div>
              <DialogTitle className="text-sm sm:text-base font-bold text-slate-900 leading-snug line-clamp-2">
                {product.name}
              </DialogTitle>
              <DialogDescription className="sr-only">
                Choose variant size and quantity for {product.name}
              </DialogDescription>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-base sm:text-lg font-black text-teal-600">
                  ₹{currentPriceNum}
                </span>
                {currentOrigPriceNum && currentOrigPriceNum > currentPriceNum && (
                  <>
                    <span className="text-xs text-slate-400 line-through">
                      ₹{currentOrigPriceNum}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                      Save ₹{(currentOrigPriceNum - currentPriceNum).toFixed(0)}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="p-4 sm:p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Size / Variant Options */}
          {variants.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Choose Size / Attribute:
                </label>
                {currentVariant?.size && (
                  <span className="text-xs font-semibold text-teal-700">
                    Selected: <strong className="font-bold">{currentVariant.size}</strong>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {variants.map((v: any, idx: number) => {
                  const isSelected =
                    (currentVariant?.sku && currentVariant.sku === v.sku) ||
                    (currentVariant?.size && currentVariant.size === v.size) ||
                    (idx === 0 && !currentVariant);
                  const vPrice = Number.parseFloat(String(v.price).replace(/[^\d.]/g, ""));
                  const vOrigPrice = v.originalPrice
                    ? Number.parseFloat(String(v.originalPrice).replace(/[^\d.]/g, ""))
                    : undefined;

                  return (
                    <button
                      key={v.sku || v.size || idx}
                      type="button"
                      onClick={() => setSelectedVariant(v)}
                      className={`relative flex flex-col p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? "border-teal-500 bg-teal-50/60 ring-2 ring-teal-500/20 shadow-xs"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold text-slate-900">
                          {v.size || `Option ${idx + 1}`}
                        </span>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-teal-600 text-white flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-sm font-extrabold text-teal-700">
                          ₹{vPrice}
                        </span>
                        {vOrigPrice && vOrigPrice > vPrice && (
                          <span className="text-[10px] text-slate-400 line-through">
                            ₹{vOrigPrice}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Quantity:
            </span>
            <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 overflow-hidden shadow-xs">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="px-3.5 text-sm font-bold text-slate-800 min-w-[32px] text-center">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="p-2 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-slate-50 rounded-xl p-3 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">
              Subtotal ({quantity} {quantity === 1 ? "item" : "items"} &bull; {currentVariant?.size || "Standard"}):
            </span>
            <span className="text-base font-black text-slate-900">
              ₹{(currentPriceNum * quantity).toFixed(0)}
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50 flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={handleAddToCart}
            className="flex-1 border-2 border-teal-600 text-teal-700 hover:bg-teal-50 h-11 font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Add to Cart</span>
          </Button>

          <Button
            type="button"
            onClick={handleBuyNow}
            className="flex-1 bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white h-11 font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Buy Now</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
