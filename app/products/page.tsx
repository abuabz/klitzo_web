"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Search } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"


export default function ProductsPage() {
  const [isVisible, setIsVisible] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [products, setProducts] = useState<any[]>([])

  useEffect(() => {
    setIsVisible(true)
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setProducts(data);
      })
      .catch(err => console.error("Error fetching products:", err))
  }, [])

  const dynamicCategoryIds = Array.from(new Set(products.map(p => p.category).filter(Boolean)))
  const categories = [
    { id: "all", name: "All Products" },
    ...dynamicCategoryIds.map(cat => ({
      id: cat,
      name: cat.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    }))
  ]


  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-white">

      {/* Hero Section */}
      <section className="pt-40 pb-12 px-4 bg-gradient-to-br from-slate-50 to-blue-50">
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
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-48 object-contain group-hover:scale-110 transition-transform duration-500"
                  />
                  {product.originalPrice && (
                    <Badge className="absolute top-4 left-4 bg-red-500 text-white text-[10px]">
                      Save ₹
                      {(
                        Number.parseFloat(String(product.originalPrice).replace(/[^\d.]/g, "")) - Number.parseFloat(String(product.price).replace(/[^\d.]/g, ""))
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
                    {product.features.slice(0, 2).map((feature, idx) => (
                      <div key={idx} className="flex items-center text-[10px] text-slate-600">
                        <Sparkles className="h-3 w-3 text-teal-500 mr-2" />
                        {feature}
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col gap-3 mt-auto pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge className="bg-slate-800 text-white px-3 py-1 text-sm shadow-sm">
                        {product.price}
                      </Badge>
                      {product.originalPrice && (
                        <span className="text-slate-400 line-through text-xs font-medium">{product.originalPrice}</span>
                      )}
                    </div>
                    <Link href={`/product/${product.id}`} className="block w-full">
                      <Button
                        className="w-full bg-gradient-to-r from-teal-400 to-blue-600 hover:from-teal-500 hover:to-blue-700 text-white rounded-full py-2 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 font-bold text-sm"
                      >
                        Buy Now
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
    </div>
  )
}
