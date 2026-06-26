"use client"

import { Button } from "@/components/ui/button"
import { Menu, X, Truck } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Products", href: "/products" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ]

  return (
    <>
      {/* Announcement Bar */}
      <div className={`bg-gradient-to-r from-teal-600 to-blue-600 text-white text-center py-2 px-4 fixed top-0 w-full z-[60] text-sm sm:text-base font-bold tracking-wide flex justify-center items-center gap-2 shadow-md transition-transform duration-300 ${isScrolled ? "-translate-y-full" : "translate-y-0"}`}>
        <Truck className="h-4 w-4 sm:h-5 sm:w-5" />
        All India Free Delivery on Prepaid Orders!
      </div>

      {/* Navigation */}
      <nav className={`fixed left-0 right-0 z-50 backdrop-blur-md bg-black/10 border-b border-white/20 shadow-lg m-4 rounded-sm md:rounded-full transition-all duration-300 ${isScrolled ? "top-0 mt-4" : "top-10 md:top-10 mt-2 sm:mt-4"}`}>
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
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`px-3 py-2 text-sm font-medium transition-colors duration-300 ${
                      (pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href)))
                        ? "text-teal-600 font-bold"
                        : "text-slate-700 hover:text-teal-600"
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Desktop CTA Button */}
            <div className="hidden md:block">
              <Link href="/products">
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
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-3 py-2 text-base font-medium transition-colors duration-300 ${
                      (pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href)))
                        ? "text-teal-600 font-bold bg-white/30 rounded-md"
                        : "text-slate-700 hover:text-teal-600 hover:bg-white/10 rounded-md"
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
                <div className="px-3 py-2">
                  <Link href="/products" onClick={() => setIsMobileMenuOpen(false)}>
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
    </>
  )
}
