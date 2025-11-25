"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Menu, X, Star, Minus, Plus, ShoppingCart, Heart, Share2, ArrowLeft, Clock, LucideFolderSync } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import PurchaseForm from "@/components/purchase-form"

export default function ProductPage() {
  const params = useParams()
  const productId = Number.parseInt(params.id as string)

  const [isVisible, setIsVisible] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [showPurchaseForm, setShowPurchaseForm] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const products = [
    {
      id: 1,
      name: "Klitzo Multi Surface (All In One) Stain Remover 300ml",
      images: ["/assets/productmainimg.jpeg", "/assets/imgproduct03.jpeg ", "/assets/imgproduct04.jpeg", "/assets/imgproduct05.jpeg", "/assets/imgproduct06.jpeg", "/assets/imgproduct07.jpeg", "/assets/imgproduct08.jpeg"],
      price: "₹599.00",
      originalPrice: "₹1199.00",
      description:
        "Ultimate stain fighting power for the toughest stains. Our advanced formula works in just 30 seconds to break down even the most stubborn stains.",
      longDescription:
        "Klitzo Stain Remover is your go-to solution for tackling the toughest stains on all washable fabrics. Whether it's oil, grease, ink, rust, food stains, toilet yellow stains, or hard-water spots, our powerful formula works in just 30 seconds to break down and lift away even the most stubborn stains. Safe for use on a variety of surfaces including steel, plastic, ceramics, glass, vehicle bodies, tiles, and more, Klitzo Stain Remover ensures a streak-free finish every time. Plus, it leaves behind a fresh orange fragrance that keeps your fabrics smelling clean and revitalized.",
      category: "stain-remover",
      features: [
        "Instant removal of old & new stains",
        "Effective on oil, grease, ink, rust, food stains, toilet yellow stains, and hard-water spots",
        "Safe for steel, plastic, ceramics, glass, vehicle bodies, tiles, and more",
        "Streak-free finish for glass and shiny surfaces",
        "Fresh orange fragrance"
      ],
      specifications: {
        Volume: "300ml",
        Type: "Liquid Spray",
        // "Suitable for": "All washable fabrics",
        Fragrance: "Fresh Clean",
        // "pH Level": "7.0 (Neutral)",
      },
      safetyAndUsageNotes: [
        "Store in a cool, dry place, away from sunlight.",
        "Keep out of reach of children and pets.",
        "Avoid contact with eyes; rinse with water if exposed.",
        "Wear gloves if you have sensitive skin.",
        "Not for silk, wool, or delicate fabrics.",
        "Do not use on ceramic-coated, waxed, or polished vehicles.",
        "Do not use on polished/varnished wood.",
        "Test on a hidden area first.",
        "Use only as directed; misuse may damage surfaces.",
        "Do not ingest; seek medical help if swallowed.",
        "Use in a well-ventilated area."
      ],
      applicationGuide: [
        "Kitchen: Burnt pans, chimneys, crockery, tea/coffee stains",
        "Bathroom: Toilet yellow stains, tiles, hard-water spots, rust removal",
        "Vehicle: Body stains, watermarks, shine restoration",
        "Household: Plastics, buckets, glass surfaces, steel pipes",
        "Industrial/Commercial: Oil, grease, ink stains"
      ],
      howToUse: [
        "Shake well before use.",
        "Spray directly onto the stained area.",
        "Leave for 30–60 seconds.",
        "Wipe with a microfiber cloth or scrubber (for tough stains).",
        "Rinse if required."
      ],
      rating: 4.8,
      reviews: 156,
      inStock: true,
      freeShipping: true,
    },
    {
      id: 2,
      name: "Klitzo Multi Surface (All In One) Stain Remover 130ml",
      images: ["/assets/product_130ml.jpeg", "/assets/imgproduct03.jpeg ", "/assets/productdetailed_130ml.jpeg", "/assets/imgproduct05.jpeg", "/assets/imgproduct06.jpeg", "/assets/imgproduct07.jpeg", "/assets/imgproduct08.jpeg"],
      price: "₹299.00",
      originalPrice: "₹599.00",
      description:
        "Ultimate stain fighting power for the toughest stains. Our advanced formula works in just 30 seconds to break down even the most stubborn stains.",
      longDescription:
        "Klitzo Stain Remover is your go-to solution for tackling the toughest stains on all washable fabrics. Whether it's oil, grease, ink, rust, food stains, toilet yellow stains, or hard-water spots, our powerful formula works in just 30 seconds to break down and lift away even the most stubborn stains. Safe for use on a variety of surfaces including steel, plastic, ceramics, glass, vehicle bodies, tiles, and more, Klitzo Stain Remover ensures a streak-free finish every time. Plus, it leaves behind a fresh orange fragrance that keeps your fabrics smelling clean and revitalized.",
      category: "stain-remover",
      features: [
        "Instant removal of old & new stains",
        "Effective on oil, grease, ink, rust, food stains, toilet yellow stains, and hard-water spots",
        "Safe for steel, plastic, ceramics, glass, vehicle bodies, tiles, and more",
        "Streak-free finish for glass and shiny surfaces",
        "Fresh orange fragrance"
      ],
      specifications: {
        Volume: "130ml",
        Type: "Liquid Spray",
        // "Suitable for": "All washable fabrics",
        Fragrance: "Fresh Clean",
        // "pH Level": "7.0 (Neutral)",
      },
      safetyAndUsageNotes: [
        "Store in a cool, dry place, away from sunlight.",
        "Keep out of reach of children and pets.",
        "Avoid contact with eyes; rinse with water if exposed.",
        "Wear gloves if you have sensitive skin.",
        "Not for silk, wool, or delicate fabrics.",
        "Do not use on ceramic-coated, waxed, or polished vehicles.",
        "Do not use on polished/varnished wood.",
        "Test on a hidden area first.",
        "Use only as directed; misuse may damage surfaces.",
        "Do not ingest; seek medical help if swallowed.",
        "Use in a well-ventilated area."
      ],
      applicationGuide: [
        "Kitchen: Burnt pans, chimneys, crockery, tea/coffee stains",
        "Bathroom: Toilet yellow stains, tiles, hard-water spots, rust removal",
        "Vehicle: Body stains, watermarks, shine restoration",
        "Household: Plastics, buckets, glass surfaces, steel pipes",
        "Industrial/Commercial: Oil, grease, ink stains"
      ],
      howToUse: [
        "Shake well before use.",
        "Spray directly onto the stained area.",
        "Leave for 30–60 seconds.",
        "Wipe with a microfiber cloth or scrubber (for tough stains).",
        "Rinse if required."
      ],
      rating: 4.7,
      reviews: 156,
      inStock: true,
      freeShipping: true,
    },
  ]

  const product = products.find((p) => p.id === productId)

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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99] p-4">
          <div className="max-h-[90vh] overflow-y-auto ">
            <PurchaseForm
              product={{
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.images[0],
              }}
              quantity={quantity}
              onClose={() => setShowPurchaseForm(false)}
            />
          </div>
        </div>
      )}

      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/10 border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/">
                <img src="/klitzo-logo.png" alt="KLITZO Logo" className="h-10 w-auto cursor-pointer" />
              </Link>
            </div>

            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <Link
                  href="/"
                  className="text-slate-700 hover:text-teal-600 px-3 py-2 text-sm font-medium transition-colors duration-300"
                >
                  Home
                </Link>
                <Link href="/products" className="text-teal-600 px-3 py-2 text-sm font-medium">
                  Products
                </Link>
                <Link
                  href="/about"
                  className="text-slate-700 hover:text-teal-600 px-3 py-2 text-sm font-medium transition-colors duration-300"
                >
                  About
                </Link>
                <Link
                  href="/contact"
                  className="text-slate-700 hover:text-teal-600 px-3 py-2 text-sm font-medium transition-colors duration-300"
                >
                  Contact
                </Link>
              </div>
            </div>

            <div className="hidden md:block">
              <Link href="/products">
                <Button className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white px-6 py-2 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                  Shop Now
                </Button>
              </Link>
            </div>

            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-slate-700 hover:text-teal-600 p-2 rounded-md transition-colors duration-300"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {isMobileMenuOpen && (
            <div className="md:hidden backdrop-blur-md bg-white/20 border-t border-white/20 rounded-b-lg mt-2">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <Link
                  href="/"
                  className="text-slate-700 hover:text-teal-600 block px-3 py-2 text-base font-medium transition-colors duration-300"
                >
                  Home
                </Link>
                <Link href="/products" className="text-teal-600 block px-3 py-2 text-base font-medium">
                  Products
                </Link>
                <Link
                  href="/about"
                  className="text-slate-700 hover:text-teal-600 block px-3 py-2 text-base font-medium transition-colors duration-300"
                >
                  About
                </Link>
                <Link
                  href="/contact"
                  className="text-slate-700 hover:text-teal-600 block px-3 py-2 text-base font-medium transition-colors duration-300"
                >
                  Contact
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      <section className="pt-20 pb-4 px-4 bg-slate-50">
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

      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            <div
              className={`transform transition-all duration-1000 ${isVisible ? "translate-x-0 opacity-100" : "-translate-x-10 opacity-0"}`}
            >
              <div className="space-y-4">
                <div className="aspect-square bg-white rounded-2xl shadow-lg overflow-hidden">
                  <img
                    src={product.images[selectedImage] || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-full object-contain p-8"
                  />
                </div>
                <div className="flex space-x-4 overflow-scroll overflow-y-hidden   md:overflow-x-auto max-w-[90vw] py-2">
                  {product.images.map((image, index) => (
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
              </div>
            </div>

            <div
              className={`transform transition-all duration-1000 delay-300 ${isVisible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"}`}
            >
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  {product.inStock && <Badge className="bg-green-100 text-green-800">In Stock</Badge>}
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-slate-800">{product.name}</h1>

                <div className="flex items-center gap-4">
                  <span className="text-3xl font-bold text-teal-600">{product.price}</span>
                  {product.originalPrice && (
                    <span className="text-xl text-slate-400 line-through">{product.originalPrice}</span>
                  )}
                  {product.originalPrice && (
                    <Badge className="bg-red-100 text-red-800">
                      Save ₹
                      {(
                        Number.parseFloat(product.originalPrice.slice(1)) - Number.parseFloat(product.price.slice(1))
                      ).toFixed(2)}
                    </Badge>
                  )}
                </div>

                <p className="text-lg text-slate-600 leading-relaxed">{product.description}</p>

                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-slate-800">Key Features:</h3>
                  <div className="space-y-2">
                    {product.features.slice(0, 3).map((feature, index) => (
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
                      Buy Now - ₹{(Number.parseFloat(product.price.slice(1)) * quantity).toFixed(2)}
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
                        <Clock className="h-5 w-5 mr-2" />
                        <span className="font-medium text-sm ">Free Shipping on prepaid orders</span>
                      </div>
                      <div className="flex items-center text-teal-800 bg-yellow-50 p-3 rounded-lg">
                        <ShoppingCart className="h-5 w-5 mr-2" />
                        <span className="font-medium text-sm ">₹50 COD Fee for Cash on Delivery</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cfols-2 gap-8">
            <Card className="p-6">
              <h3 className="text-2xl font-bold text-slate-800 mb-4">Product Description</h3>
              <p className="text-slate-600 leading-relaxed mb-6 text-justify">{product.longDescription}</p>
              <div className="space-y-3">
                <h4 className="text-lg font-semibold text-slate-800">All Features:</h4>
                {product.features.map((feature, index) => (
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
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-2 border-b border-slate-200 last:border-b-0">
                    <span className="font-medium text-slate-700">{key}:</span>
                    <span className="text-teal-600">{value}</span>
                  </div>
                ))}
              </div>
            </Card>
             <Card className="p-6">
              <h3 className="text-2xl font-bold text-slate-800 mb-4">How to Use</h3>
              <div className="space-y-2 text-slate-600">
                <ol className="list-decimal pl-5 space-y-1">
                  {product.howToUse.map((step, index) => (
                    <li key={index}>  {step}</li>
                  ))}
                </ol>
              </div>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mt-8">
            <Card className="p-6">
              <h3 className="text-2xl font-bold text-slate-800 mb-4">Safety & Usage Notes</h3>
              <div className="space-y-2 text-slate-600">
                <ul className="list-disc pl-5 space-y-1">
                  {product.safetyAndUsageNotes.map((note, index) => (
                    <li key={index}>{note}</li>
                  ))}
                </ul>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-2xl font-bold text-slate-800 mb-4">Application Guide</h3>
              <div className="space-y-2 text-slate-600">
                <ul className="list-none space-y-1">
                  {product.applicationGuide.map((app, index) => (
                    <li key={index}>
                      <span className="text-teal-500 mr-2">•</span>
                      {app}
                    </li>
                  ))}
                </ul>
              </div>
            </Card>

           
          </div>
        </div>
      </section>
    </div>
  )
}