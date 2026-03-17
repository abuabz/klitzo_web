"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Menu, X, Star, Minus, Plus, ShoppingCart, Heart, Share2, ArrowLeft, Clock, LucideFolderSync, User, ShoppingBag } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import PurchaseForm from "@/components/purchase-form"
import { toast } from "sonner"
import { AuthModal } from "@/components/auth-modal"

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "register">("login")
  const productId = Number.parseInt(params.id as string)

  const [isVisible, setIsVisible] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [showPurchaseForm, setShowPurchaseForm] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    setIsVisible(true)
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("user")
    setUser(null)
    toast.success("Logged out successfully")
    router.refresh()
  }

  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/products?id=${productId}`)
        const data = await res.json()
        if (data && !data.error) {
          setProduct(data)
        }
      } catch (error) {
        console.error("Error fetching product:", error)
        toast.error("Failed to load product details")
      } finally {
        setLoading(false)
      }
    }

    if (!isNaN(productId)) {
      fetchProduct()
    } else {
      setLoading(false)
    }
  }, [productId])
  
  const getNumericPrice = (priceStr: string) => {
    if (!priceStr) return 0
    return Number.parseFloat(priceStr.replace(/[^0-9.]/g, "")) || 0
  }
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium">Loading product details...</p>
        </div>
      </div>
    )
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
    if (!user) {
      setAuthMode("login")
      setIsAuthModalOpen(true)
      return
    }
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
                image: (product.images && product.images.length > 0) ? product.images[0] : (product.image || "/placeholder.svg"),
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

            <div className="hidden md:flex items-center space-x-4">
              <Link href="/products">
                <Button className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white px-6 py-2 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 whitespace-nowrap">
                  Shop Now
                </Button>
              </Link>

              {!user ? (
                <button
                  onClick={() => {
                    setAuthMode("login")
                    setIsAuthModalOpen(true)
                  }}
                  className="text-slate-700 hover:text-teal-600 px-3 py-2 transition-colors duration-300 cursor-pointer"
                  title="Login"
                >
                  <User className="h-5 w-5" />
                </button>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger className="focus:outline-none">
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-teal-100 bg-teal-50/50 hover:bg-teal-50 transition-colors">
                      <Avatar className="h-7 w-7 border border-teal-200">
                        <AvatarFallback className="bg-teal-600 text-white text-[10px]">
                          {(user.username || user.identifier).charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-teal-700 text-xs font-semibold">{user.username || user.identifier}</span>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 mt-2 rounded-xl shadow-2xl border-slate-100 p-2 overflow-hidden" align="end">
                    <DropdownMenuLabel className="px-2 py-1.5 text-xs text-slate-400 font-medium uppercase tracking-wider">My Account</DropdownMenuLabel>
                    <DropdownMenuItem className="rounded-lg focus:bg-teal-50 focus:text-teal-700 cursor-pointer py-2.5">
                      <Link href="/my-orders" className="flex items-center w-full">
                        <ShoppingBag className="mr-3 h-4 w-4" />
                        <span>My Orders</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-slate-100 my-1" />
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      className="rounded-lg focus:bg-red-50 focus:text-red-600 text-red-500 cursor-pointer py-2.5"
                    >
                      <div className="flex items-center w-full">
                        <X className="mr-3 h-4 w-4" />
                        <span>Log out</span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
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
                {!user ? (
                  <button
                    onClick={() => {
                      setAuthMode("login")
                      setIsAuthModalOpen(true)
                    }}
                    className="text-slate-700 hover:text-teal-600 block px-3 py-2 text-base font-medium transition-colors duration-300 w-full text-left flex items-center gap-2 cursor-pointer"
                  >
                    <User className="h-5 w-5" /> Login
                  </button>
                ) : (
                  <>
                    <Link
                      href="/my-orders"
                      className="text-teal-600 block px-3 py-2 text-base font-medium transition-colors duration-300"
                    >
                      My Orders
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="text-red-500 block px-3 py-2 text-base font-medium transition-colors duration-300 w-full text-left"
                    >
                      Log out
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      <section className="pt-24 pb-6 px-4 bg-slate-50">
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
                <div className="aspect-square bg-white rounded-2xl shadow-lg overflow-hidden flex items-center justify-center p-4">
                  <img
                    src={(product.images && product.images[selectedImage]) || (product.image || "/placeholder.svg")}
                    alt={product.name}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
                  {(product.images || []).map((image: string, index: number) => (
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

                  <div className="flex items-center flex-wrap gap-2 sm:gap-4">
                    <span className="text-3xl font-bold text-teal-600">{product.price}</span>
                    {product.originalPrice && (
                      <span className="text-xl text-slate-400 line-through">{product.originalPrice}</span>
                    )}
                    {product.originalPrice && (
                      <Badge className="bg-red-100 text-red-800">
                        Save ₹
                        {(
                          getNumericPrice(product.originalPrice) - getNumericPrice(product.price)
                        ).toFixed(2)}
                      </Badge>
                    )}
                    {/* @ts-ignore */}
                    {product.specialOffer && (
                      <Badge className="bg-yellow-100 text-yellow-800 animate-pulse">
                        Special Offer: {product.specialOffer}
                      </Badge>
                    )}
                  </div>

                <p className="text-lg text-slate-600 leading-relaxed">{product.description}</p>

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
                      Buy Now - ₹{(getNumericPrice(product.price) * quantity).toFixed(2)}
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

      <section className="py-8 md:py-12 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          {/* Full Width Description Section */}
          <div className="mb-8">
            <Card className="p-6 md:p-10 border-0 shadow-sm bg-white overflow-hidden relative">
              <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-teal-500 to-blue-600"></div>
              <h3 className="text-2xl md:text-3xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                Product Description
              </h3>
              <div className="grid md:grid-cols-3 gap-8 md:gap-12">
                <div className="md:col-span-2">
                  <p className="text-slate-600 leading-relaxed text-lg text-justify mb-8">
                    {product.longDescription}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-2xl p-6">
                  <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-teal-600" />
                    Key Highlights
                  </h4>
                  <div className="space-y-3">
                    {(product.features || []).map((feature: string, index: number) => (
                      <div key={index} className="flex items-start">
                        <div className="mt-1.5 mr-3">
                           <div className="h-1.5 w-1.5 rounded-full bg-teal-500"></div>
                        </div>
                        <span className="text-slate-700 text-sm font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Secondary Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-8">
            <Card className="p-6 border-0 shadow-sm bg-white">
              <h3 className="text-xl font-bold text-slate-800 mb-6 pb-2 border-b border-slate-100 flex items-center gap-2">
                Specifications
              </h3>
              <div className="space-y-4">
                {Object.entries(product.specifications || {}).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-b-0 group">
                    <span className="text-sm font-semibold text-slate-500 group-hover:text-teal-600 transition-colors uppercase tracking-wider text-[10px]">{key}</span>
                    <span className="text-sm font-bold text-slate-700">{String(value)}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 border-0 shadow-sm bg-white">
              <h3 className="text-xl font-bold text-slate-800 mb-6 pb-2 border-b border-slate-100">How to Use</h3>
              <div className="space-y-4">
                {(product.howToUse || []).map((step: string, index: number) => (
                  <div key={index} className="flex gap-4 items-start group">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center text-xs font-bold group-hover:bg-teal-600 group-hover:text-white transition-all duration-300">
                      {index + 1}
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 border-0 shadow-sm bg-white">
              <h3 className="text-xl font-bold text-slate-800 mb-6 pb-2 border-b border-slate-100">Safety & Usage</h3>
              <div className="space-y-3">
                {(product.safetyAndUsageNotes || []).map((note: string, index: number) => (
                  <div key={index} className="flex items-start gap-3 bg-red-50/30 p-3 rounded-xl border border-red-100/20">
                    <div className="h-1.5 w-1.5 rounded-full bg-red-400 mt-2 flex-shrink-0"></div>
                    <p className="text-slate-600 text-sm italic">{note}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <Card className="p-6 md:p-8 bg-gradient-to-br from-slate-800 to-slate-900 border-0 text-white shadow-xl lg:col-span-1">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                Application Guide
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(product.applicationGuide || []).map((app: string, index: number) => (
                  <div key={index} className="flex items-center gap-3 bg-white/5 p-3 rounded-xl hover:bg-white/10 transition-colors border border-white/5">
                    <div className="p-2 rounded-lg bg-teal-500/20">
                      <Sparkles className="h-4 w-4 text-teal-400" />
                    </div>
                    <span className="text-slate-200 text-sm font-medium">{app}</span>
                  </div>
                ))}
              </div>
            </Card>
            
            {/* Trust Badges in the remaining slot */}
            <div className="flex flex-col gap-4">
                <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm flex items-center gap-6 border border-slate-100">
                    <div className="p-4 bg-green-50 rounded-2xl">
                        <LucideFolderSync className="h-8 w-8 text-green-600" />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-800 text-lg">Money-Back Guarantee</h4>
                        <p className="text-slate-500 text-sm">Full refund if you are not satisfied within 5 days.</p>
                    </div>
                </div>
                <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm flex items-center gap-6 border border-slate-100">
                    <div className="p-4 bg-blue-50 rounded-2xl">
                        <Clock className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-800 text-lg">Fast Free Shipping</h4>
                        <p className="text-slate-500 text-sm">On all prepaid orders across India.</p>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </section>
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        initialMode={authMode}
        onSuccess={(newUser) => setUser(newUser)}
      />
    </div>
  )
}