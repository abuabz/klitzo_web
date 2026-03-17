"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Menu, X, Search, User, ShoppingBag } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import Link from "next/link"
import { AuthModal } from "@/components/auth-modal"

export default function ProductsPage() {
  const router = useRouter()
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "register">("login")
  const [isVisible, setIsVisible] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [user, setUser] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setIsVisible(true)
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/products")
      const data = await res.json()
      if (Array.isArray(data)) {
        setProducts(data)
      }
    } catch (error) {
      console.error("Error fetching products:", error)
      toast.error("Failed to load products")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    setUser(null)
    toast.success("Logged out successfully")
    router.refresh()
  }

  const categories = [
    { id: "all", name: "All Products" },
    { id: "stain-remover", name: "Stain Removers" },
    { id: "hard-cleaner", name: "Hard Cleaners" },
    { id: "shoe-care", name: "Shoe Care" },
    { id: "helmet-care", name: "Helmet Care" },
  ]

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      (product.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description || "").toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
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
              <Button className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white px-6 py-2 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 whitespace-nowrap">
                Shop Now
              </Button>

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

      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-6xl mx-auto text-center">
          <div
            className={`transform transition-all duration-1000 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-800 mb-6">
              Our Products
            </h1>
            <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
              Discover our complete range of professional-grade cleaning solutions designed to tackle every cleaning
              challenge
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 px-4 bg-white border-b">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${selectedCategory === category.id
                    ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-lg"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => (
              <Card
                key={product.id}
                className={`group cursor-pointer border-0 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-2 bg-white overflow-hidden transform ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                  }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="relative overflow-hidden">
                  {/* {product.isNew && (
                    <Badge className="absolute top-2 left-2 bg-teal-500 text-white text-[8px] sm:text-[10px] uppercase font-bold tracking-wider z-20">
                      New Arrival
                    </Badge>
                  )} */}
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-48 object-contain group-hover:scale-110 transition-transform duration-500"
                  />
                  {product.originalPrice && (
                    <Badge className="absolute top-4 left-4 bg-red-500 text-white text-[10px]">
                      Save ₹
                      {(
                        Number.parseFloat(product.originalPrice.slice(1)) - Number.parseFloat(product.price.slice(1))
                      ).toFixed(2)}
                    </Badge>
                  )}
                  {/* @ts-ignore */}
                  {product.specialOffer && (
                    <Badge className="absolute top-4 right-4 bg-yellow-400 text-black text-[10px] font-bold shadow-md z-10">
                      PREPAID: {product.specialOffer}
                    </Badge>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Link href={`/product/${product.id}`}>
                    <Button className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 scale-75 group-hover:scale-90">
                      View Details
                    </Button>
                  </Link>
                </div>
                <CardContent className="p-4">
                  <h3 className="text-base font-bold text-slate-800 mb-1 group-hover:text-teal-600 transition-colors line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-slate-600 text-xs mb-3 line-clamp-2">{product.description}</p>

                  <div className="space-y-1 mb-3">
                    {(product.features || []).slice(0, 2).map((feature: string, idx: number) => (
                      <div key={idx} className="flex items-center text-[10px] text-slate-600">
                        <Sparkles className="h-3 w-3 text-teal-500 mr-2" />
                        {feature}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Badge className="bg-gradient-to-r from-teal-500 to-blue-600 text-white px-2 py-0.5 text-sm">
                        {product.price}
                      </Badge>
                      {product.originalPrice && (
                        <span className="text-slate-400 line-through text-[10px]">{product.originalPrice}</span>
                      )}
                    </div>
                    <Link href={`/product/${product.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 border-teal-500 text-teal-600 hover:bg-teal-500 hover:text-white transition-all duration-300 bg-transparent text-xs"
                      >
                        Buy
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">No products found</h3>
              <p className="text-slate-600">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 px-4 bg-gradient-to-r from-teal-600 to-blue-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Need Help Choosing?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Contact our cleaning experts for personalized product recommendations
          </p>
          <Link href="/contact">
            <Button
              size="lg"
              className="bg-white text-teal-600 hover:bg-slate-100 px-12 py-6 text-xl rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 hover:-translate-y-1 font-semibold"
            >
              Get Expert Advice
              <Sparkles className="ml-2 h-5 w-5" />
            </Button>
          </Link>
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
