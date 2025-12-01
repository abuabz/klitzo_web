"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Zap, Shield, Car, Home, Shirt, Menu, X, Phone, Mail, MapPin, Clock, Send, Timer } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"

export default function KlitzoLanding() {
  const [isVisible, setIsVisible] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [openFeature, setOpenFeature] = useState<number | null>(null)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const features = [
    { icon: Zap, text: "Works on Multiple Surfaces", content: "Cleans steel, plastic, ceramics, glass, vehicle bodies, tiles, and more.", delay: "0ms" },
    { icon: Sparkles, text: "Instant Stain Removal", content: "Removes old & new stains instantly, including oil, grease, ink, rust, food stains, toilet yellow stains, and hard-water spots.", delay: "200ms" },
    { icon: Shield, text: "Brightening Formula", content: "Leaves surfaces looking brighter and refreshed after cleaning.", delay: "400ms" },
    { icon: Shirt, text: "Safe to Use", content: "Formulated to be safe for a wide range of surfaces and materials.", delay: "600ms" },
    { icon: Home, text: "Export Quality", content: "Manufactured to meet international quality standards.", delay: "800ms" },
    { icon: Timer, text: "Long Shelf Life", content: "Stays effective for a long time, ensuring lasting performance.", delay: "800ms" },
  ]

  const products = [
    {
      id: 1,
      name: "KLITZO Stain Remover 300ml",
      image: "/assets/productmainimg.jpeg",
      price: "₹599.00",
      originalPrice: "₹1199.00",
      description: "Ultimate stain fighting power for the toughest stains",
      category: "stain-remover",
      features: [
        "Instant removal of old & new stains",
        "Fresh orange fragrance",
        "Effective on oil, grease, ink, rust, food stains, toilet yellow stains, and hard-water spots",
        "Safe for steel, plastic, ceramics, glass, vehicle bodies, tiles, and more",
        "Streak-free finish for glass and shiny surfaces",

      ],
      reviews: 156,
    },
    {
      id: 2,
      name: "KLITZO Stain Remover 130ml",
      image: "/assets/product_130ml.jpeg",
      price: "₹299.00",
      originalPrice: "₹599.00",
      description: "Ultimate stain fighting power for the toughest stains",
      category: "stain-remover",
      features: [
        "Instant removal of old & new stains",
        "Fresh orange fragrance",
        "Effective on oil, grease, ink, rust, food stains, toilet yellow stains, and hard-water spots",
        "Safe for steel, plastic, ceramics, glass, vehicle bodies, tiles, and more",
        "Streak-free finish for glass and shiny surfaces",

      ],
      reviews: 156,
    },

  ]

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/10 border-b border-white/20 shadow-lg m-4 rounded-sm md:rounded-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/">
                <img src="/klitzo-logo.png" alt="KLITZO Logo" className="h-10 w-auto cursor-pointer" />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <Link
                  href="/"
                  className="text-slate-700 hover:text-teal-600 px-3 py-2 text-sm font-medium transition-colors duration-300"
                >
                  Home
                </Link>
                <Link
                  href="/products"
                  className="text-slate-700 hover:text-teal-600 px-3 py-2 text-sm font-medium transition-colors duration-300"
                >
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

            {/* Desktop CTA Button */}
            <div className="hidden md:block">
              <Link href="/product/1">
                <Button className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white px-6 py-2 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                  Shop Now
                </Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-slate-700 hover:text-teal-600 p-2 rounded-md transition-colors duration-300"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden backdrop-blur-md bg-white/20 border-t border-white/20 rounded-b-lg mt-2">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <Link
                  href="/"
                  className="text-slate-700 hover:text-teal-600 block px-3 py-2 text-base font-medium transition-colors duration-300"
                >
                  Home
                </Link>
                <Link
                  href="/products"
                  className="text-slate-700 hover:text-teal-600 block px-3 py-2 text-base font-medium transition-colors duration-300"
                >
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
                <div className="px-3 py-2">
                  <Link href="/products">
                    <Button className="w-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white rounded-full shadow-lg">
                      Shop Now
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-teal-200/20 to-teal-400/20 rounded-full animate-pulse"></div>
        <div
          className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-blue-200/20 to-blue-400/20 rounded-full animate-bounce"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-40 left-1/4 w-20 h-20 bg-gradient-to-br from-teal-300/20 to-blue-300/20 rounded-full animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute bottom-20 right-1/3 w-28 h-28 bg-gradient-to-br from-blue-300/20 to-teal-300/20 rounded-full animate-bounce"
          style={{ animationDelay: "0.5s" }}
        ></div>
        <div
          className="absolute bottom-20 left-1/4 w-64 h-1 bg-gradient-to-r from-transparent via-teal-500/30 to-transparent rotate-45 animate-pulse"
          style={{ animationDelay: "1.5s" }}
        ></div>

        {/* Vertical animated lines */}
        <div
          className="absolute top-0 left-1/4 w-1 h-full bg-gradient-to-b from-transparent via-teal-400/20 to-transparent animate-pulse"
          style={{ animationDelay: "3s" }}
        ></div>
        <div
          className="absolute top-0 right-1/3 w-1 h-full bg-gradient-to-b from-transparent via-blue-400/20 to-transparent animate-pulse"
          style={{ animationDelay: "2.5s" }}
        ></div>

        {/* Moving lines animation */}
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-teal-400/40 to-transparent animate-slide-right"></div>
        <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent animate-slide-left"></div>
      </div>

      {/* Hero Section */}
      {/* Hero Section - 2 Products Side-by-Side on ALL Devices (including Mobile) */}
      <section className="relative min-h-screen flex items-center px-4 pt-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100/80 via-blue-50/60 to-teal-50/80 backdrop-blur-sm"></div>

        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">

            {/* Left: Hero Text */}
            <div className="space-y-8 text-center lg:text-left order-2 lg:order-1">
              <div className={`transform transition-all duration-1000 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}>
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-800 leading-tight">
                  Cleaning Made Simple
                </h1>
              </div>

              <div className={`transform transition-all duration-1000 delay-200 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}>
                <p className="text-lg sm:text-xl lg:text-2xl text-slate-700 font-light max-w-2xl mx-auto lg:mx-0">
                  Remove toughest stains instantly — oil, grease, rust, ink, toilet stains & more.
                  Just spray, wipe, and watch the magic!
                </p>
              </div>

              <div className={`transform transition-all duration-1000 delay-500 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link href="/product/1">
                    <Button size="lg" className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white px-10 py-6 text-lg rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300">
                      Shop Now <Sparkles className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/about">
                    <Button variant="outline" size="lg" className="border-2 border-teal-500 text-teal-600 hover:bg-teal-500 hover:text-white px-10 py-6 text-lg rounded-full backdrop-blur-sm">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Right: Two Product Cards - Always Side by Side (Even on Mobile) */}
            <div className="order-1 lg:order-2">
              <div className="grid grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                {products.map((product, index) => (
                  <div
                    key={product.id}
                    className={`transform transition-all duration-1000 delay-${700 + index * 200} ${isVisible ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0"
                      }`}
                  >
                    <Card className="group bg-white/95 backdrop-blur-xl border-0 py-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 rounded-3xl overflow-hidden">
                      {/* Product Image */}
                      <div className="relative bg-gradient-to-b from-teal-50/50 to-blue-50/30">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full  object-contain  group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>

                      {/* Product Info */}
                      <CardContent className="p-1 sm:p-2 text-center space-y-3">
                        <h3 className="text-sm sm:text-md font-bold text-slate-800 line-clamp-2">
                          {product.name}
                        </h3>

                        <div className="flex items-center justify-center gap-2">
                          <span className="text-xl sm:text-xl font-bold text-teal-600">{product.price}</span>
                          <span className="text-xs sm:text-md text-slate-400 line-through">{product.originalPrice}</span>
                        </div>

                        <Link href={`/product/${product.id}`}>
                          <Button className="w-full bg-gradient-to-r cursor-pointer from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white rounded-full text-sm sm:text-base py-1 sm:py-4 font-medium transform hover:scale-105 transition-all duration-300">
                            Buy Now
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Highlights Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-slate-800 mb-16">
            Why Choose{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">KLITZO</span>?
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`transform transition-all duration-700 ${isVisible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"}`}
                style={{ transitionDelay: feature.delay }}
              >
                <Card onClick={() => setOpenFeature(openFeature === index ? null : index)} className=" p-6 pb-0  cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 bg-gradient-to-br from-slate-50 to-blue-50 group ">
                  <CardContent className="flex items-center space-x-4 p-0">
                    <div className="p-3 rounded-full bg-gradient-to-r from-teal-500 to-blue-600 group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-lg font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                      {feature.text}
                    </p>
                  </CardContent>
                  {/* Feature content collapsible with smooth transition */}
                  <div
                    className={`overflow-hidden transition-all duration-500 ${openFeature === index ? "max-h-40 opacity-100 " : "max-h-0 opacity-0 mt-0 "}`}
                  >
                    <p className="text-xs pb-6 font-semibold text-slate-700 group-hover:text-slate-900 transition-colors duration-300">
                      {feature.content}
                    </p>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-slate-800 mb-16">
            Our{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">Products</span>
          </h2>

          {/* <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"> */}
          <div className="flex flex-row sm:flex-wrap justify-center gap-2 sm:gap-8 ">
            {products.map((product, index) => (
              <Card
                key={product.id}
                className={`group gap-0 cursor-pointer py-0 sm:py-7 border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-4 bg-white overflow-hidden transform ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                  }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="relative overflow-hidden ">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="w-60  place-self-center    object-fit group-hover:scale-110 transition-transform duration-500"
                  />
                  {product.originalPrice && (
                    <Badge className="absolute    top-4 left-4 bg-red-500 text-white">
                      {/* Save ₹
                      {(
                        Number.parseFloat(product.originalPrice.slice(1)) - Number.parseFloat(product.price.slice(1))
                      ).toFixed(2)} */}
                      <span className="text-[8px] sm:text-xs">50% OFF</span>
                    </Badge>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Link href={`/product/${product.id}`}>
                    <Button className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 scale-90 group-hover:scale-100">
                      View Details
                    </Button>
                  </Link>
                </div>

                <CardContent className="p-2 pt-0 sm:p-3">
                  <h3 className="text-md sm:text-xl leading-4 font-bold text-slate-800 mb-2 group-hover:text-teal-600 transition-colors">
                    {product.name}
                  </h3>
                  <p title={product.description} className="text-slate-600 mb-4 truncate md:whitespace-normal md:overflow-visible">
                    {product.description}
                  </p>

                  <div className="space-y-2 mb-4 hidden sm:block">
                    {product.features.slice(0, 2).map((feature, idx) => (
                      <div key={idx} className="flex items-center text-sm text-slate-600">
                        <Sparkles className="h-4 w-4 text-teal-500 mr-2" />
                        {feature}
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2  items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-gradient-to-r from-teal-500 to-blue-600 text-white px-1 sm:px-3 text-xs sm:text-md py-1 ">
                        {product.price}
                      </Badge>
                      {product.originalPrice && (
                        <span className="text-slate-400 line-through text-[10px] sm:text-sm">{product.originalPrice}</span>
                      )}
                    </div>
                    <Link href={`/product/${product.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-teal-500 sm:block hidden text-teal-600 hover:bg-teal-500 hover:text-white transition-all duration-300 bg-transparent"
                      >
                        View Product
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">Get in Touch</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Have questions about our products? Need bulk orders? We're here to help you find the perfect cleaning
              solution.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="space-y-8">
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl">
                <h3 className="text-2xl font-bold text-slate-800 mb-6">Contact Information</h3>
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-r from-teal-500 to-blue-600 rounded-full">
                      <Phone className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">Phone</p>
                      <p className="text-slate-600">+91 8111813853</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-r from-teal-500 to-blue-600 rounded-full">
                      <Mail className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">Email</p>
                      <p className="text-slate-600"> klitzo.info@gmail.com</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-r from-teal-500 to-blue-600 rounded-full">
                      <MapPin className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">Address</p>
                      <p className="text-slate-600">Inkel City, Malappuram – 676519, Kerala, India</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-r from-teal-500 to-blue-600 rounded-full">
                      <Clock className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">Business Hours</p>
                      <p className="text-slate-600">
                        Mon - Fri: 9AM - 6PM
                        <br />
                        Sat: 10AM - 4PM
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl">
              <h3 className="text-2xl font-bold text-slate-800 mb-6">Send us a Message</h3>
              <form
                className="space-y-6"
                onSubmit={(e) => {
                  e.preventDefault()
                  const form = new FormData(e.currentTarget as HTMLFormElement)
                  const first = (form.get("first") || "").toString().trim()
                  const last = (form.get("last") || "").toString().trim()
                  const email = (form.get("email") || "").toString().trim()
                  const phone = (form.get("phone") || "").toString().trim()
                  const subject = (form.get("subject") || "").toString().trim()
                  const message = (form.get("message") || "").toString().trim()

                  const text = [
                    "New message from KLITZO website:",
                    `First Name: ${first}`,
                    `Last Name: ${last}`,
                    `Email: ${email}`,
                    `Phone: ${phone}`,
                    `Subject: ${subject}`,
                    `Message: ${message}`,
                  ].join("\n")

                  // WhatsApp number in international format without plus: 918111813853
                  const waNumber = "918111813853"
                  const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`

                  window.open(waUrl, "_blank")
                }}
              >
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">First Name</label>
                    <input
                      name="first"
                      type="text"
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Last Name</label>
                    <input
                      name="last"
                      type="text"
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                  <input
                    name="email"
                    type="email"
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
                  <input
                    name="phone"
                    type="tel"
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300"
                    placeholder="+91 9876543210"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Subject</label>
                  <input
                    name="subject"
                    type="text"
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300"
                    placeholder="Product Inquiry"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Message</label>
                  <textarea
                    name="message"
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300"
                    placeholder="Tell us about your cleaning needs..."
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-teal-600 to-blue-700 hover:from-teal-700 hover:to-blue-800 text-white py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
                >
                  Send Message
                  <Send className="ml-2 h-5 w-5" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>


    </div>
  )
}
