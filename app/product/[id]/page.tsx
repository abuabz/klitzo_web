"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Star, Minus, Plus, ShoppingCart, Heart, Share2, ArrowLeft, Clock, LucideFolderSync, Truck, X } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import PurchaseForm from "@/components/purchase-form"
import { AuthModal } from "@/components/auth-modal"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"


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


  const handlePurchase = () => {
    setShowPurchaseForm(true)
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
    <div className="min-h-screen bg-white">
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
      <section className="pt-40 pb-6 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center space-x-2 text-sm text-slate-600">
            <Link href="/" className="hover:text-teal-600 transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/products" className="hover:text-teal-600 transition-colors">
              Products
            </Link>
            <span>/</span>
            <span className="text-slate-800">{product.name}</span>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center mt-4 text-teal-600 hover:text-teal-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Link>
        </div>
      </section>

      <section className="py-8 md:py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <div
              className={`transform transition-all duration-1000 ${isVisible ? "translate-x-0 opacity-100" : "-translate-x-10 opacity-0"}`}
            >
              <div className="space-y-4">
                {(() => {
                  const displayImages = selectedVariant?.images?.length > 0 ? selectedVariant.images : (product.images || []);

                  return (
                    <>
                      <div className="aspect-square bg-white rounded-2xl shadow-lg overflow-hidden flex items-center justify-center p-4">
                        <img
                          src={(selectedImage === -1 ? selectedVariant?.image : (displayImages[selectedImage])) || selectedVariant?.image || product.image || "/placeholder.svg"}
                          alt={product.name}
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
                        {displayImages.map((image: string, index: number) => (
                          <button
                            key={index}
                            onClick={() => setSelectedImage(index)}
                            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-300 ${selectedImage === index
                              ? "border-teal-500 shadow-lg"
                              : "border-slate-200 hover:border-slate-300"
                              }`}
                          >
                            <img
                              src={image || "/placeholder.svg"}
                              alt={`${product.name} ${index + 1}`}
                              className="w-full h-full object-contain p-2"
                            />
                          </button>
                        ))}
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            <div
              className={`transform transition-all duration-1000 delay-300 ${isVisible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"}`}
            >
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  {product.inStock && <Badge className="bg-green-100 text-green-800">In Stock</Badge>}
                </div>

                {product.variants && product.variants.length > 0 && (
                  <div className="space-y-3 pb-2 border-b border-slate-100 mb-4">
                    <h3 className="text-lg text-slate-800">
                      Size: <span className="font-bold">{selectedVariant?.size || "Standard"}</span>
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {product.variants.map((variant: any, idx: number) => {
                        const isSelected = selectedVariant?.sku === variant.sku || selectedVariant?.size === variant.size
                        return (
                          <div
                            key={idx}
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
                                setSelectedImage(0); // Default to global cover if no variant image
                              }
                            }}
                            className={`border-2 rounded-xl p-3 cursor-pointer transition-all duration-200 bg-white hover:shadow-md ${isSelected ? "border-blue-600 shadow-sm" : "border-slate-200 hover:border-slate-300"
                              } flex flex-col min-w-[140px]`}
                          >
                            <div className="h-16 w-full mb-2 flex items-center justify-center bg-transparent rounded-lg">
                              <img
                                src={variant.images?.[0] || variant.image || product.images?.[0] || product.image || "/placeholder.svg"}
                                alt={variant.size}
                                className="max-h-full max-w-full object-contain"
                              />
                            </div>
                            <div className="text-sm font-semibold text-slate-800">
                              {variant.size || variant.sku}
                            </div>
                            <div className="text-sm font-bold text-slate-800 mt-1">₹{variant.price}</div>
                            {variant.originalPrice && (
                              <div className="text-xs text-slate-400 line-through">₹{variant.originalPrice}</div>
                            )}
                            {variant.stock > 0 ? (
                              <div className="text-xs text-green-600 font-medium mt-1">In stock</div>
                            ) : (
                              <div className="text-xs text-red-500 font-medium mt-1">Out of stock</div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                <h1 className="text-3xl md:text-4xl font-bold text-slate-800">{product.name}</h1>

                <div className="flex items-center flex-wrap gap-2 sm:gap-4">
                  <span className="text-3xl font-bold text-teal-600">
                    ₹{Number.parseFloat(String(selectedVariant?.price || product.price).replace(/[^\d.]/g, "")).toFixed(2)}
                  </span>
                  {(selectedVariant?.originalPrice || product.originalPrice) && (
                    <span className="text-xl text-slate-400 line-through">₹{selectedVariant?.originalPrice || product.originalPrice}</span>
                  )}
                  {(selectedVariant?.originalPrice || product.originalPrice) && (
                    <Badge className="bg-red-100 text-red-800">
                      Save ₹
                      {(
                        Number.parseFloat(String(selectedVariant?.originalPrice || product.originalPrice).replace(/[^\d.]/g, "")) - Number.parseFloat(String(selectedVariant?.price || product.price).replace(/[^\d.]/g, ""))
                      ).toFixed(2)}
                    </Badge>
                  )}

                </div>

                <p className="text-lg text-slate-600 leading-relaxed pt-2">{product.description}</p>

                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-slate-800">Key Features:</h3>
                  <div className="space-y-2">
                    {(product.features || []).slice(0, 3).map((feature: string, index: number) => (
                      <div key={index} className="flex items-center">
                        <Sparkles className="h-5 w-5 text-teal-500 mr-3 flex-shrink-0" />
                        <span className="text-slate-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-semibold text-slate-800">Quantity:</span>
                    <div className="flex items-center border border-slate-300 rounded-lg">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-2 hover:bg-slate-100 transition-colors"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="px-4 py-2 text-lg font-semibold">{quantity}</span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="p-2 hover:bg-slate-100 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>



                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      onClick={handlePurchase}
                      size="lg"
                      className="flex-1 bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                    >
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Buy Now - ₹
                      {(Number.parseFloat(String(selectedVariant?.price || product.price).replace(/[^\d.]/g, "")) * quantity).toFixed(2)}
                    </Button>
                    {/* <Button
                      variant="outline"
                      size="lg"
                      className="border-2 border-teal-500 text-teal-600 hover:bg-teal-500 hover:text-white px-6 py-4 rounded-full transition-all duration-300 bg-transparent"
                    >
                      <Heart className="h-5 w-5" />
                    </Button> */}
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
                      size="lg"
                      className="border-2 border-slate-300 text-slate-600 hover:bg-slate-100 px-6 py-4 rounded-full transition-all duration-300 bg-transparent"
                    >
                      <Share2 className="h-5 w-5" />
                    </Button>
                  </div>

                  {product.freeShipping && (
                    <div className="space-y-2">
                      <div className="flex items-center text-teal-800 bg-green-50 p-3 rounded-lg">
                        <LucideFolderSync className="h-5 w-5 mr-2" />
                        <span className="font-medium  text-sm ">100% Money-Back Guarantee within 5-Days</span>
                      </div>
                      <div className="flex items-center text-teal-800 bg-blue-50 p-3 rounded-lg">
                        <Truck className="h-5 w-5 mr-2" />
                        <span className="font-medium text-sm ">All India Free Delivery</span>
                      </div>
                      <div className="flex items-center text-amber-800 bg-amber-50 p-3 rounded-lg">
                        <Clock className="h-5 w-5 mr-2" />
                        <span className="font-medium text-sm ">Delivery within 3 to 6 days</span>
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
              <p className="text-slate-600 leading-relaxed mb-6 text-justify">{product.longDescription}</p>
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
    </div>
  )
}