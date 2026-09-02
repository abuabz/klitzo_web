"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Star, Minus, Plus, ShoppingCart, Heart, Share2, ArrowLeft, Clock, LucideFolderSync, Truck } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import PurchaseForm from "@/components/purchase-form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"


export default function ProductPage() {
  const params = useParams()
  const productId = Number.parseInt(params.id as string)

  const [isVisible, setIsVisible] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [showPurchaseForm, setShowPurchaseForm] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "prepaid">("cod")

  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedVariant, setSelectedVariant] = useState<any>(null)

  useEffect(() => {
    setIsVisible(true)
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

  return (
    <div className="min-h-screen bg-white">
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
                            className={`border-2 rounded-xl p-3 cursor-pointer transition-all duration-200 bg-white hover:shadow-md ${
                              isSelected ? "border-blue-600 shadow-sm" : "border-slate-200 hover:border-slate-300"
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
                  {product.specialOffer && (
                    <Badge className="bg-yellow-100 text-yellow-800 animate-pulse">
                      Special Offer: {product.specialOffer}
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
                        <span className="font-medium text-sm ">Delivery within 7 days</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Shake the bottle well before use.</li>
                  <li>Spray or apply directly onto the surface to be cleaned.</li>
                  <li>Wait for 2-3 minutes to allow the formula to penetrate the stains.</li>
                  <li>Scrub gently if needed, then wipe clean with a cloth or rinse with water.</li>
                </ol>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mt-6 md:mt-8">
            <Card className="p-6">
              <h3 className="text-2xl font-bold text-slate-800 mb-4">Safety & Usage Notes</h3>
              <div className="space-y-2 text-slate-600">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Keep out of reach of children and pets.</li>
                  <li>Avoid contact with eyes. In case of contact, rinse thoroughly with plenty of water.</li>
                  <li>Do not mix with other cleaning chemicals or acids.</li>
                  <li>Store in a cool, dry place away from direct sunlight.</li>
                </ul>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-2xl font-bold text-slate-800 mb-4">Application Guide</h3>
              <div className="space-y-2 text-slate-600">
                <ul className="list-none space-y-1">
                  <li><span className="text-teal-500 mr-2">•</span> Ideal for ceramic tiles, bathroom fittings, and floors.</li>
                  <li><span className="text-teal-500 mr-2">•</span> Safe to use on glass, stainless steel, and sealed surfaces.</li>
                  <li><span className="text-teal-500 mr-2">•</span> Always test on a small, inconspicuous area first.</li>
                  <li><span className="text-teal-500 mr-2">•</span> For tough stains, leave the solution on for up to 5 minutes before scrubbing.</li>
                </ul>
              </div>
            </Card>


          </div>
        </div>
      </section>
    </div>
  )
}