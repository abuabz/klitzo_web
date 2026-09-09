"use client"

import { Button } from "@/components/ui/button"
import { Menu, X, Truck, User, ShoppingBag, ShoppingCart } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { toast } from "sonner"
import { AuthModal } from "@/components/auth-modal"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  
  const [user, setUser] = useState<any>(null)
  const [hasActiveOrders, setHasActiveOrders] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "register">("login")

  useEffect(() => {
    let lastScrollY = window.scrollY
    
    const handleScroll = () => {
      if (window.scrollY > 40) {
        if (window.scrollY > lastScrollY) {
          // Scrolling down
          setIsScrolled(true)
        } else {
          // Scrolling up
          setIsScrolled(false)
        }
      } else {
        // At the top
        setIsScrolled(false)
      }
      lastScrollY = window.scrollY
    }
    window.addEventListener("scroll", handleScroll)
    
    // Auth logic
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser)
      setUser(parsedUser)
      
      fetch(`/api/orders?email=${parsedUser.email}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const active = data.some(order => 
              order.status && (order.status.toLowerCase() === "paid" || order.status.toLowerCase() === "shipping")
            )
            setHasActiveOrders(active)
          }
        })
        .catch(err => console.error("Error fetching orders status:", err))
    }
    
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("user")
    setUser(null)
    toast.success("Logged out successfully")
    router.refresh()
  }

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Products", href: "/products" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ]

  return (
    <>
      {/* Announcement Bar */}
      <div className={`print:hidden bg-gradient-to-r from-teal-600 via-blue-500 to-teal-600 bg-[length:200%_auto] animate-[gradient_3s_linear_infinite] text-white text-center py-2 px-4 fixed top-0 w-full z-[60] text-sm sm:text-base font-bold tracking-wide flex justify-center items-center shadow-md transition-transform duration-300 ${isScrolled ? "-translate-y-full" : "translate-y-0"}`}>
        <div className="flex items-center gap-2 animate-pulse drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
          <Truck className="h-4 w-4 sm:h-5 sm:w-5 animate-bounce" style={{ animationDuration: '2s' }} />
          <span className="uppercase tracking-widest text-xs sm:text-sm">All India Free Delivery</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className={`print:hidden fixed left-0 right-0 z-50 backdrop-blur-md bg-black/10 border-b border-white/20 shadow-lg m-4 rounded-sm md:rounded-full transition-all duration-300 ${isScrolled ? "top-0 mt-4" : "top-10 md:top-10 mt-2 sm:mt-4"}`}>
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
                    className={`px-3 py-2 text-sm font-medium transition-colors duration-300 ${(pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href)))
                        ? "text-teal-600 font-bold"
                        : "text-slate-700 hover:text-teal-600"
                      }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Desktop CTA Button & Auth */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <Link href="/my-orders" className="text-slate-700 hover:text-teal-600 text-sm font-medium transition-colors duration-300 relative flex items-center">
                  My Orders
                  {hasActiveOrders && (
                    <span className="absolute -top-1 -right-2 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                    </span>
                  )}
                </Link>
              ) : (
                <button 
                  onClick={() => {
                    setAuthMode("login")
                    setIsAuthModalOpen(true)
                  }}
                  className="text-slate-700 hover:text-teal-600 text-sm font-medium transition-colors duration-300 cursor-pointer"
                >
                  My Orders
                </button>
              )}


              <Link href="/products">
                <Button className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white px-6 py-2 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
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
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-teal-100 bg-teal-50/50 hover:bg-teal-50 transition-colors max-w-[150px]">
                      <Avatar className="h-7 w-7 border border-teal-200 shrink-0">
                        <AvatarFallback className="bg-teal-600 text-white text-[10px]">
                          {(user.username || user.identifier).charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-teal-700 text-xs font-semibold truncate">
                        {(user.username || user.identifier).split(' ')[0]}
                      </span>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 mt-2 rounded-xl shadow-2xl border-slate-100 p-2 overflow-hidden" align="end">
                    <DropdownMenuLabel className="px-2 py-1.5 text-xs text-slate-400 font-medium uppercase tracking-wider">My Account</DropdownMenuLabel>
                    <DropdownMenuItem className="rounded-lg focus:bg-teal-50 focus:text-teal-700 cursor-pointer py-2.5">
                      <Link href="/my-orders" className="flex items-center w-full justify-between">
                        <div className="flex items-center">
                          <ShoppingBag className="mr-3 h-4 w-4" />
                          <span>My Orders</span>
                        </div>
                        {hasActiveOrders && (
                          <span className="relative flex h-2 w-2 mr-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                          </span>
                        )}
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
                    className={`block px-3 py-2 text-base font-medium transition-colors duration-300 ${(pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href)))
                        ? "text-teal-600 font-bold bg-white/30 rounded-md"
                        : "text-slate-700 hover:text-teal-600 hover:bg-white/10 rounded-md"
                      }`}
                  >
                    {link.name}
                  </Link>
                ))}
                {user ? (
                  <Link
                    href="/my-orders"
                    className="text-slate-700 hover:text-teal-600 px-3 py-2 text-base font-medium transition-colors duration-300 flex items-center justify-between"
                  >
                    <span>My Orders</span>
                    {hasActiveOrders && (
                      <span className="relative flex h-2 w-2 mr-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                      </span>
                    )}
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      setAuthMode("login")
                      setIsAuthModalOpen(true)
                    }}
                    className="text-slate-700 hover:text-teal-600 block px-3 py-2 text-base font-medium transition-colors duration-300 w-full text-left cursor-pointer"
                  >
                    My Orders
                  </button>
                )}
                
                {user && (
                  <button
                    onClick={handleLogout}
                    className="text-red-500 hover:text-red-600 block px-3 py-2 text-base font-medium transition-colors duration-300 w-full text-left cursor-pointer"
                  >
                    Logout
                  </button>
                )}

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

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultMode={authMode}
        onSuccess={() => {
          setIsAuthModalOpen(false)
          router.refresh()
          window.location.reload()
        }}
      />
    </>
  )
}
