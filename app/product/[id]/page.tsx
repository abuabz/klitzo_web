"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Star, Minus, Plus, ShoppingCart, ShoppingBag, Heart, Share2, ArrowLeft, Clock, LucideFolderSync, Truck, X, ChevronDown, ChevronUp } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import PurchaseForm from "@/components/purchase-form"
import { AuthModal } from "@/components/auth-modal"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useCart } from "@/context/CartContext"


export default function ProductPage() {
  const params = useParams()
  const productId = Number.parseInt(params.id as string)

  const [isVisible, setIsVisible] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [showPurchaseForm, setShowPurchaseForm] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "prepaid">("cod")

  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedVariant, setSelectedVariant] = useState<any>(null)
  const [allProducts, setAllProducts] = useState<any[]>([])
  const [selectedSuggestion, setSelectedSuggestion] = useState<any>(null)
  const [isLongDescExpanded, setIsLongDescExpanded] = useState(false)
  const [isShortDescExpanded, setIsShortDescExpanded] = useState(false)

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setAllProducts(data)
      })
      .catch(err => console.error(err))
  }, [])

  useEffect(() => {
    setIsVisible(true)
    if (typeof window !== "undefined" && sessionStorage.getItem(`purchaseFormOpen_${productId}`) === 'true') {
      setShowPurchaseForm(true)
    }
    fetch(`/api/products?id=${productId}`)
      .then(res => {
        if (!res.ok) throw new Error("Not found")
        return res.json()
      })
      .then(data => {
        setProduct(data)
        if (data.variants && data.variants.length > 0) {
          setSelectedVariant(data.variants[0])
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [productId])

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (showPurchaseForm) {
        sessionStorage.setItem(`purchaseFormOpen_${productId}`, 'true')
      } else {
        sessionStorage.removeItem(`purchaseFormOpen_${productId}`)
      }
    }
  }, [showPurchaseForm, productId])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div></div>
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">Product Not Found</h1>
          <Link href="/products">
            <Button className="bg-gradient-to-r from-teal-500 to-blue-600 text-white">Back to Products</Button>
          </Link>
        </div>
      </div>
    )
  }


  const { addItem } = useCart()

  const handlePurchase = () => {
    setShowPurchaseForm(true)
  }

  const handleAddToCart = () => {
    if (!product) return;
    const currentPrice = Number.parseFloat(String(selectedVariant?.price || product.price).replace(/[^\d.]/g, ""));
    const currentOrigPrice = selectedVariant?.originalPrice || product.originalPrice 
      ? Number.parseFloat(String(selectedVariant?.originalPrice || product.originalPrice).replace(/[^\d.]/g, ""))
      : undefined;
    const currentImg = selectedVariant?.image || product.images?.[0] || product.image || "/placeholder.svg";
    const variantId = selectedVariant?.sku || selectedVariant?.size || "default";

    addItem({
      id: `${product.id}-${variantId}`,
      productId: product.id,
      name: product.name,
      variantSize: selectedVariant?.size || undefined,
      price: currentPrice,
      originalPrice: currentOrigPrice,
      image: currentImg,
    }, quantity);
  }

  const isCombo = product?.category === "combo-pack" || (product?.name || "").toLowerCase().includes("combo")

  const suggestedIndividualProducts = (() => {
    if (!product || !allProducts.length) return []

    // Completely dynamic: Use the suggested/included product IDs chosen by admin
    const ids = Array.isArray(product.suggestedProductIds) && product.suggestedProductIds.length > 0
      ? product.suggestedProductIds
      : Array.isArray(product.includedProductIds) && product.includedProductIds.length > 0
        ? product.includedProductIds
        : []

    return ids.map((id: number) => allProducts.find(p => p.id === id)).filter(Boolean)
  })()

  return (
    <div className="min-h-screen bg-white pb-20 lg:pb-0">
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          setShowAuthModal(false)
          setShowPurchaseForm(true)
        }}
      />

      {/* Suggestion Preview Modal */}
      {selectedSuggestion && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[99] p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedSuggestion(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative bg-slate-50 p-6 flex items-center justify-center border-b">
              <button
                onClick={() => setSelectedSuggestion(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-500 hover:text-slate-800 flex items-center justify-center shadow-sm transition-all"
              >
                <X className="w-5 h-5" />
              </button>
              <img
                src={selectedSuggestion.images?.[0] || selectedSuggestion.image || "/placeholder.svg"}
                alt={selectedSuggestion.name}
                className="max-h-52 max-w-full object-contain"
              />
              <Badge className="absolute bottom-4 left-4 bg-teal-600 text-white text-xs">
                {isCombo ? "Included in Combo" : "Recommended Combo"}
              </Badge>
            </div>

            <div className="p-6 overflow-y-auto">
              <h3 className="text-xl font-black text-slate-900 mb-1">
                {selectedSuggestion.name}
              </h3>
              <p className="text-xs text-slate-500 mb-4 line-clamp-2">
                {selectedSuggestion.description}
              </p>

              <div className="flex items-center gap-3 mb-6 p-3 bg-slate-50 rounded-xl">
                <span className="text-2xl font-black text-teal-600">
                  {String(selectedSuggestion.price).includes('₹') ? selectedSuggestion.price : `₹${selectedSuggestion.price}`}
                </span>
                {selectedSuggestion.originalPrice && (
                  <span className="text-sm text-slate-400 line-through">
                    {String(selectedSuggestion.originalPrice).includes('₹') ? selectedSuggestion.originalPrice : `₹${selectedSuggestion.originalPrice}`}
                  </span>
                )}
                {selectedSuggestion.inStock && (
                  <Badge variant="outline" className="ml-auto text-green-700 bg-green-50 border-green-200 text-[10px]">
                    In Stock
                  </Badge>
                )}
              </div>

              {selectedSuggestion.features && selectedSuggestion.features.length > 0 && (
                <div className="space-y-2 mb-6">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Highlights:</p>
                  {selectedSuggestion.features.slice(0, 3).map((feat: string, i: number) => (
                    <div key={i} className="flex items-center text-xs text-slate-700">
                      <Sparkles className="h-3.5 w-3.5 text-teal-500 mr-2 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <Link href={`/product/${selectedSuggestion.id}`} className="flex-1">
                  <Button className="w-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white rounded-full font-bold">
                    View Full Product Details
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={() => setSelectedSuggestion(null)}
                  className="rounded-full border-slate-200"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPurchaseForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99] p-4" onClick={() => setShowPurchaseForm(false)}>
          <div className="max-h-[90vh] overflow-y-auto w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <PurchaseForm
              product={{
                id: product.id,
                name: product.name + (selectedVariant ? ` - ${selectedVariant.size}` : ''),
                price: selectedVariant?.price || product.price,
                image: selectedVariant?.image || product.images?.[0] || product.image || "/placeholder.svg",
              }}
              quantity={quantity}
              onClose={() => setShowPurchaseForm(false)}
            />
          </div>
        </div>
      )}

      {/* Product Details Section */}
      <section className="pt-24 sm:pt-28 lg:pt-32 pb-2 sm:pb-3 px-3 sm:px-4 bg-slate-50 border-b border-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center space-x-1.5 sm:space-x-2 text-xs sm:text-sm text-slate-600 truncate">
            <Link href="/" className="hover:text-teal-600 transition-colors shrink-0">
              Home
            </Link>
            <span>/</span>
            <Link href="/products" className="hover:text-teal-600 transition-colors shrink-0">
              Products
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-medium truncate">{product.name}</span>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center mt-2 text-xs sm:text-sm text-teal-600 hover:text-teal-700 transition-colors font-semibold"
          >
            <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
            Back to Products
          </Link>
        </div>
      </section>

      <section className="py-3 sm:py-6 lg:py-10 px-3 sm:px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-10">
            <div
              className={`transform transition-all duration-700 ${isVisible ? "translate-x-0 opacity-100" : "-translate-x-6 opacity-0"}`}
            >
              <div className="w-full">
                {(() => {
                  const displayImages = (() => {
                    if (selectedVariant?.images && selectedVariant.images.length > 0) {
                      return selectedVariant.images;
                    }
                    if (product.images && product.images.length > 0) {
                      return product.images;
                    }
                    const fallback = selectedVariant?.image || product.image || "/placeholder.svg";
                    return [fallback];
                  })();

                  const activeImageSrc = (selectedImage === -1 ? selectedVariant?.image : displayImages[selectedImage]) 
                    || displayImages[0] 
                    || selectedVariant?.image 
                    || product.image 
                    || "/placeholder.svg";

                  return (
                    <div className="flex flex-row gap-2.5 sm:gap-3 lg:flex-col lg:space-y-3">
                      {/* Left: Big Main Image */}
                      <div className="flex-1 h-56 sm:h-72 lg:h-auto lg:aspect-square bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex items-center justify-center p-2.5 sm:p-6">
                        <img
                          src={activeImageSrc}
                          alt={product.name}
                          className="max-w-full max-h-full object-contain hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      {/* Right: List of Images (Thumbnails) - Only shown if more than one image */}
                      {displayImages.length > 1 && (
                        <div className="w-14 sm:w-16 lg:w-full flex flex-col lg:flex-row gap-2 lg:gap-3 overflow-y-auto lg:overflow-x-auto max-h-56 sm:max-h-72 lg:max-h-none scrollbar-hide shrink-0">
                          {displayImages.map((image: string, index: number) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => setSelectedImage(index)}
                              className={`flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 transition-all duration-200 p-1 bg-white flex items-center justify-center ${
                                selectedImage === index
                                  ? "border-teal-500 shadow-md ring-2 ring-teal-500/20"
                                  : "border-slate-200 hover:border-slate-300"
                              }`}
                            >
                              <img
                                src={image || "/placeholder.svg"}
                                alt={`${product.name} ${index + 1}`}
                                className="max-w-full max-h-full object-contain"
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>

            <div
              className={`transform transition-all duration-700 delay-150 ${isVisible ? "translate-x-0 opacity-100" : "translate-x-6 opacity-0"}`}
            >
              <div className="space-y-3.5 sm:space-y-4">


                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 leading-tight">
                  {product.name}
                </h1>

                <div className="flex items-baseline flex-wrap gap-2.5 sm:gap-3">
                  <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-teal-600">
                    ₹{Number.parseFloat(String(selectedVariant?.price || product.price).replace(/[^\d.]/g, "")).toFixed(2)}
                  </span>
                  {(selectedVariant?.originalPrice || product.originalPrice) && (
                    <span className="text-base sm:text-lg text-slate-400 line-through">
                      ₹{selectedVariant?.originalPrice || product.originalPrice}
                    </span>
                  )}
                  {(selectedVariant?.originalPrice || product.originalPrice) && (
                    <Badge className="bg-red-50 text-red-600 border border-red-200 font-extrabold text-xs px-2.5 py-0.5">
                      Save ₹
                      {(
                        Number.parseFloat(String(selectedVariant?.originalPrice || product.originalPrice).replace(/[^\d.]/g, "")) - Number.parseFloat(String(selectedVariant?.price || product.price).replace(/[^\d.]/g, ""))
                      ).toFixed(0)}
                    </Badge>
                  )}
                </div>

                {product.variants && product.variants.length > 0 && (
                  <div className="space-y-2 py-2 border-y border-slate-100">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-slate-600 font-medium">
                        Size: <span className="font-bold text-slate-900">{selectedVariant?.size || "Standard"}</span>
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {product.variants.map((variant: any, idx: number) => {
                        const isSelected = selectedVariant?.sku === variant.sku || selectedVariant?.size === variant.size
                        const varImg = variant.images?.[0] || variant.image || product.images?.[0] || product.image;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setSelectedVariant(variant)
                              if (variant.images && variant.images.length > 0) {
                                setSelectedImage(0);
                              } else if (variant.image) {
                                const imgIdx = product.images?.indexOf(variant.image)
                                if (imgIdx !== -1 && imgIdx !== undefined) {
                                  setSelectedImage(imgIdx)
                                } else {
                                  setSelectedImage(-1)
                                }
                              } else {
                                setSelectedImage(0);
                              }
                            }}
                            className={`border-2 rounded-xl px-3 py-2 cursor-pointer transition-all duration-200 flex items-center gap-2.5 text-left ${isSelected
                              ? "border-teal-500 bg-teal-50/40 shadow-sm ring-1 ring-teal-500/20"
                              : "border-slate-200 hover:border-slate-300 bg-white"
                              }`}
                          >
                            {varImg && (
                              <img
                                src={varImg}
                                alt={variant.size}
                                className="w-8 h-8 object-contain rounded shrink-0 bg-white"
                              />
                            )}
                            <div>
                              <div className="text-xs sm:text-sm font-bold text-slate-800 leading-tight">
                                {variant.size || variant.sku}
                              </div>
                              <div className="text-xs font-black text-teal-600 mt-0.5">
                                ₹{variant.price}
                              </div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                <div className="space-y-3 pt-1">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className="flex items-center border border-slate-300 rounded-xl bg-white overflow-hidden shadow-sm shrink-0">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-2.5 py-2 hover:bg-slate-100 transition-colors text-slate-700"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="px-3 py-1 text-sm sm:text-base font-bold text-slate-800 min-w-[28px] text-center">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity(quantity + 1)}
                        className="px-2.5 py-2 hover:bg-slate-100 transition-colors text-slate-700"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddToCart}
                      className="border-2 border-teal-600 text-teal-700 hover:bg-teal-50 h-11 sm:h-12 font-bold px-3.5 sm:px-5 rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs shrink-0"
                    >
                      <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="hidden sm:inline">Add to Cart</span>
                      <span className="sm:hidden">Add</span>
                    </Button>

                    <Button
                      onClick={handlePurchase}
                      size="lg"
                      className="flex-1 bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white h-11 sm:h-12 text-sm sm:text-base font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span>Buy Now &bull; ₹{(Number.parseFloat(String(selectedVariant?.price || product.price).replace(/[^\d.]/g, "")) * quantity).toFixed(0)}</span>
                    </Button>

                    <Button
                      onClick={() => {
                        if (navigator.share) {
                          navigator
                            .share({
                              title: product.name,
                              text: product.description,
                              url: window.location.href,
                            })
                            .catch((error) => console.log("Error sharing", error))
                        }
                      }}
                      variant="outline"
                      size="icon"
                      className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 shrink-0"
                      aria-label="Share product"
                    >
                      <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </div>

                  {product.freeShipping && (
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center text-teal-800 bg-teal-50/80 p-2 rounded-lg">
                        <Truck className="h-4 w-4 mr-1.5 shrink-0 text-teal-600" />
                        <span className="font-semibold truncate">All India Free Delivery</span>
                      </div>
                      <div className="flex items-center text-emerald-800 bg-emerald-50/80 p-2 rounded-lg">
                        <LucideFolderSync className="h-4 w-4 mr-1.5 shrink-0 text-emerald-600" />
                        <span className="font-semibold truncate">5-Day Guarantee</span>
                      </div>
                    </div>
                  )}

                  <div className="pt-1">
                    <p className={`text-xs sm:text-sm text-slate-600 leading-relaxed ${!isShortDescExpanded ? "line-clamp-5" : ""}`}>
                      {product.description}
                    </p>
                    {product.description && (product.description.length > 220 || product.description.split('\n').length > 5) && (
                      <button
                        type="button"
                        onClick={() => setIsShortDescExpanded(!isShortDescExpanded)}
                        className="text-xs font-semibold text-teal-600 hover:text-teal-700 mt-1 inline-flex items-center gap-0.5 cursor-pointer focus:outline-hidden"
                      >
                        <span>{isShortDescExpanded ? "Show Less" : "Read More"}</span>
                        {isShortDescExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      </button>
                    )}
                  </div>

                  {product.features && product.features.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-800">Key Features:</h4>
                      <div className="space-y-1">
                        {product.features.slice(0, 3).map((feature: string, index: number) => (
                          <div key={index} className="flex items-center text-xs sm:text-sm text-slate-700">
                            <Sparkles className="h-3.5 w-3.5 text-teal-500 mr-2 shrink-0" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Inline Individual Products / Combo Suggestions */}
                  {suggestedIndividualProducts.length > 0 && (
                    <div className="bg-gradient-to-br from-teal-50/80 via-white to-blue-50/50 p-4 sm:p-5 rounded-2xl border border-teal-100 shadow-sm mt-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-teal-600 text-white rounded-lg">
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">
                              {isCombo ? "Included in this Combo Pack" : "Suggested Products"}
                            </h4>
                            <p className="text-[11px] text-slate-500">
                              {isCombo
                                ? "Full-size individual products included in this pack"
                                : "Recommended products to go with this item"}
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-teal-100 text-teal-800 hover:bg-teal-100 border-0 text-[10px] font-bold">
                          {isCombo ? `${suggestedIndividualProducts.length} Items` : "Recommended"}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3">
                        {suggestedIndividualProducts.map((item: any) => (
                          <div
                            key={item.id}
                            className="bg-white p-2.5 rounded-xl border border-slate-200/80 hover:border-teal-400 hover:shadow-md transition-all flex items-center gap-3 group relative cursor-pointer"
                            onClick={() => setSelectedSuggestion(item)}
                          >
                            <div className="w-12 h-12 bg-slate-50 rounded-lg p-1 shrink-0 flex items-center justify-center">
                              <img
                                src={item.images?.[0] || item.image || "/placeholder.svg"}
                                alt={item.name}
                                className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-teal-600 transition-colors">
                                {item.name}
                              </h5>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-xs font-black text-slate-900">
                                  {String(item.price).includes('₹') ? item.price : `₹${item.price}`}
                                </span>
                                {item.originalPrice && (
                                  <span className="text-[10px] text-slate-400 line-through">
                                    {String(item.originalPrice).includes('₹') ? item.originalPrice : `₹${item.originalPrice}`}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-teal-600 font-semibold flex items-center gap-0.5 mt-0.5">
                                View details →
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Combo Individual Products Showcase Section */}
      {suggestedIndividualProducts.length > 0 && (
        <section className="py-12 px-4 bg-gradient-to-b from-teal-50/40 via-white to-slate-50 border-y border-teal-100/60">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-bold mb-2">
                  <Sparkles className="w-3.5 h-3.5" /> {isCombo ? "Products in this Combo" : "Suggested Products"}
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                  {isCombo ? "Prefer to Buy Individually?" : "Frequently Bought Together"}
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  {isCombo
                    ? "This combo brings together our best-selling individual care products. You can also explore and buy them individually."
                    : "Pair this product with these recommended items for the best cleaning experience."}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {suggestedIndividualProducts.map((item: any) => (
                <Card
                  key={item.id}
                  className="overflow-hidden border border-slate-200/80 hover:border-teal-400 hover:shadow-xl transition-all duration-300 rounded-2xl bg-white flex flex-col sm:flex-row group"
                >
                  <div className="sm:w-48 bg-slate-50 p-6 flex items-center justify-center shrink-0 relative overflow-hidden">
                    <img
                      src={item.images?.[0] || item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="max-h-40 max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge className="absolute top-3 left-3 bg-slate-900/80 text-white text-[10px]">
                      {isCombo ? "Individual Product" : "Suggested Product"}
                    </Badge>
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-600 transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1 mb-3">
                        {item.description}
                      </p>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-xl font-black text-teal-600">
                          {String(item.price).includes('₹') ? item.price : `₹${item.price}`}
                        </span>
                        {item.originalPrice && (
                          <span className="text-sm text-slate-400 line-through">
                            {String(item.originalPrice).includes('₹') ? item.originalPrice : `₹${item.originalPrice}`}
                          </span>
                        )}
                        {item.originalPrice && (
                          <Badge className="bg-red-100 text-red-800 text-[10px]">
                            Save ₹
                            {(
                              Number.parseFloat(String(item.originalPrice).replace(/[^\d.]/g, "")) -
                              Number.parseFloat(String(item.price).replace(/[^\d.]/g, ""))
                            ).toFixed(0)}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                      <Link href={`/product/${item.id}`} className="flex-1">
                        <Button
                          variant="outline"
                          className="w-full rounded-xl border-teal-500 text-teal-700 hover:bg-teal-50 text-xs font-bold h-9"
                        >
                          View Product
                        </Button>
                      </Link>
                      <Button
                        onClick={() => setSelectedSuggestion(item)}
                        className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold h-9 px-4"
                      >
                        Quick Preview
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-8 md:py-12 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <Card className="p-6">
              <h3 className="text-2xl font-bold text-slate-800 mb-4">Product Description</h3>
              <div className="mb-6">
                <p className={`text-slate-600 leading-relaxed text-justify whitespace-pre-line ${!isLongDescExpanded ? "line-clamp-5" : ""}`}>
                  {product.longDescription || product.description}
                </p>
                {((product.longDescription || product.description) && ((product.longDescription || product.description).length > 200 || (product.longDescription || product.description).split('\n').length > 5)) && (
                  <button
                    type="button"
                    onClick={() => setIsLongDescExpanded(!isLongDescExpanded)}
                    className="mt-2.5 text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors inline-flex items-center gap-1 cursor-pointer focus:outline-hidden hover:underline"
                  >
                    <span>{isLongDescExpanded ? "Read Less" : "Read More"}</span>
                    {isLongDescExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                )}
              </div>
              <div className="space-y-3">
                <h4 className="text-lg font-semibold text-slate-800">All Features:</h4>
                {(product.features || []).map((feature: string, index: number) => (
                  <div key={index} className="flex items-start">
                    <Sparkles className="h-5 w-5 text-teal-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700">{feature}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-2xl font-bold text-slate-800 mb-4">Specifications</h3>
              <div className="space-y-4">
                {(() => {
                  const parseSpecs = (specs: any): Record<string, string> => {
                    if (!specs) return {};
                    if (Array.isArray(specs)) {
                      return specs.reduce((acc, spec) => {
                        const key = spec.key || spec.name;
                        if (key) acc[key] = String(spec.value || '');
                        return acc;
                      }, {});
                    }
                    if (typeof specs === 'object') {
                      return Object.fromEntries(Object.entries(specs).map(([k, v]) => [k, String(v)]));
                    }
                    if (typeof specs === 'string') {
                      try {
                        const parsed = JSON.parse(specs);
                        return Object.fromEntries(Object.entries(parsed).map(([k, v]) => [k, String(v)]));
                      } catch (e) {
                        return { "Raw Data": specs };
                      }
                    }
                    return {};
                  };

                  const commonSpecs = parseSpecs(product.specifications);
                  const variantSpecs = parseSpecs(selectedVariant?.specifications);
                  const combinedSpecs = { ...commonSpecs, ...variantSpecs };
                  const entries = Object.entries(combinedSpecs);

                  if (entries.length === 0) {
                    return <div className="text-slate-500 italic">No specifications available.</div>;
                  }

                  return entries.map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b border-slate-200 last:border-b-0">
                      <span className="font-medium text-slate-700">{key}:</span>
                      <span className="text-teal-600">{String(value)}</span>
                    </div>
                  ));
                })()}
              </div>
            </Card>
            <Card className="p-6">
              <h3 className="text-2xl font-bold text-slate-800 mb-4">How to Use</h3>
              <div className="space-y-2 text-slate-600">
                {product.howToUse && Array.isArray(product.howToUse) && product.howToUse.length > 0 ? (
                  <ol className="list-decimal pl-5 space-y-2">
                    {product.howToUse.map((step: string, index: number) => (
                      <li key={index} className="leading-relaxed">{step}</li>
                    ))}
                  </ol>
                ) : (
                  <ol className="list-decimal pl-5 space-y-1">
                    <li>Shake the bottle well before use.</li>
                    <li>Spray or apply directly onto the surface to be cleaned.</li>
                    <li>Wait for 2-3 minutes to allow the formula to penetrate the stains.</li>
                    <li>Scrub gently if needed, then wipe clean with a cloth or rinse with water.</li>
                  </ol>
                )}
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mt-6 md:mt-8">
            <Card className="p-6">
              <h3 className="text-2xl font-bold text-slate-800 mb-4">Safety & Usage Notes</h3>
              <div className="space-y-2 text-slate-600">
                {product.safetyAndUsageNotes && Array.isArray(product.safetyAndUsageNotes) && product.safetyAndUsageNotes.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-2">
                    {product.safetyAndUsageNotes.map((note: string, index: number) => (
                      <li key={index} className="leading-relaxed">{note}</li>
                    ))}
                  </ul>
                ) : (
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Keep out of reach of children and pets.</li>
                    <li>Avoid contact with eyes. In case of contact, rinse thoroughly with plenty of water.</li>
                    <li>Do not mix with other cleaning chemicals or acids.</li>
                    <li>Store in a cool, dry place away from direct sunlight.</li>
                  </ul>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-2xl font-bold text-slate-800 mb-4">Application Guide</h3>
              <div className="space-y-2 text-slate-600">
                {product.applicationGuide && Array.isArray(product.applicationGuide) && product.applicationGuide.length > 0 ? (
                  <ul className="list-none space-y-2">
                    {product.applicationGuide.map((item: string, index: number) => (
                      <li key={index} className="leading-relaxed">
                        <span className="text-teal-500 mr-2">•</span> {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <ul className="list-none space-y-1">
                    <li><span className="text-teal-500 mr-2">•</span> Ideal for ceramic tiles, bathroom fittings, and floors.</li>
                    <li><span className="text-teal-500 mr-2">•</span> Safe to use on glass, stainless steel, and sealed surfaces.</li>
                    <li><span className="text-teal-500 mr-2">•</span> Always test on a small, inconspicuous area first.</li>
                    <li><span className="text-teal-500 mr-2">•</span> For tough stains, leave the solution on for up to 5 minutes before scrubbing.</li>
                  </ul>
                )}
              </div>
            </Card>


          </div>
        </div>
      </section>

      {/* Mobile Sticky Bottom Action Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-4 py-2.5 shadow-[0_-4px_25px_rgba(0,0,0,0.12)]">
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-semibold text-slate-500 truncate">
              {selectedVariant?.size ? `Size: ${selectedVariant.size}` : product.name}
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-teal-600">
                ₹{(Number.parseFloat(String(selectedVariant?.price || product.price).replace(/[^\d.]/g, "")) * quantity).toFixed(2)}
              </span>
              {(selectedVariant?.originalPrice || product.originalPrice) && (
                <span className="text-xs text-slate-400 line-through">
                  ₹{selectedVariant?.originalPrice || product.originalPrice}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleAddToCart}
              className="border-2 border-teal-500 text-teal-700 hover:bg-teal-50 font-bold text-xs px-3 py-2 h-10 rounded-xl flex items-center gap-1 shrink-0"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Add</span>
            </Button>
            <Button
              onClick={handlePurchase}
              className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white font-bold text-xs sm:text-sm px-4 py-2.5 h-10 rounded-xl shadow-md flex items-center gap-1.5 shrink-0"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>Buy Now</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}