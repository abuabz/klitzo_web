"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  Truck, 
  Clock, 
  CreditCard,
  LogOut,
  ChevronRight,
  Search,
  RefreshCw,
  ChevronDown,
  X,
  Download,
  MapPin,
  Phone,
  MessageCircle
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function AdminPage() {
  const [mounted, setMounted] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [orders, setOrders] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("orders")
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({})
  const [showProductModal, setShowProductModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [productForm, setProductForm] = useState({
    name: "",
    price: "",
    originalPrice: "",
    category: "",
    image: "",
    stock: "",
    description: "",
    longDescription: "",
    features: "",
    images: [] as string[],
    specifications: [] as {key: string, value: string}[],
    variants: [] as any[]
  })
  const [dragItemIndex, setDragItemIndex] = useState<number | null>(null)
  const [dragOverItemIndex, setDragOverItemIndex] = useState<number | null>(null)
  const [variantDragItem, setVariantDragItem] = useState<{variantIndex: number, imageIndex: number} | null>(null)
  const [variantDragOverItem, setVariantDragOverItem] = useState<{variantIndex: number, imageIndex: number} | null>(null)
  const router = useRouter()

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          // Compress to WebP at 0.7 quality to save space
          const dataUrl = canvas.toDataURL("image/webp", 0.7);
          resolve(dataUrl);
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const uploadImageAndGetUrl = async (file: File): Promise<string> => {
    try {
      const base64Image = await compressImage(file);
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Image }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Upload failed");
      return data.url;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const handleSort = () => {
    if (dragItemIndex === null || dragOverItemIndex === null) return;
    const newImages = [...productForm.images];
    const draggedItem = newImages.splice(dragItemIndex, 1)[0];
    newImages.splice(dragOverItemIndex, 0, draggedItem);
    setProductForm({ ...productForm, images: newImages });
    setDragItemIndex(null);
    setDragOverItemIndex(null);
  };

  const handleVariantSort = (variantIndex: number) => {
    if (variantDragItem === null || variantDragOverItem === null || variantDragItem.variantIndex !== variantIndex || variantDragOverItem.variantIndex !== variantIndex) return;
    const newVariants = [...productForm.variants];
    const newImages = [...(newVariants[variantIndex].images || [])];
    const draggedItem = newImages.splice(variantDragItem.imageIndex, 1)[0];
    newImages.splice(variantDragOverItem.imageIndex, 0, draggedItem);
    newVariants[variantIndex].images = newImages;
    setProductForm({ ...productForm, variants: newVariants });
    setVariantDragItem(null);
    setVariantDragOverItem(null);
  };

  const fetchData = async () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    if (!user.isAdmin) return

    try {
      setLoading(true)
      // Fetch Orders
      const orderRes = await fetch(`/api/orders?all=true&email=${user.email}`)
      const orderData = await orderRes.json()
      if (Array.isArray(orderData)) setOrders(orderData)

      // Fetch Products
      const productRes = await fetch(`/api/products`)
      const productData = await productRes.json()
      if (Array.isArray(productData)) setProducts(productData)

      // Fetch Users
      const userRes = await fetch(`/api/admin/users?adminEmail=${user.email}`)
      const userData = await userRes.json()
      if (Array.isArray(userData)) setUsers(userData)
    } catch (error) {
      toast.error("Failed to fetch data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setMounted(true)
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    if (user.isAdmin) {
      setIsAdmin(true)
      fetchData()
    }
  }, [])

  if (!mounted) return null

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      })
      const data = await res.json()
      if (data.user?.isAdmin) {
        localStorage.setItem("user", JSON.stringify(data.user))
        setIsAdmin(true)
        toast.success("Welcome, Admin")
        fetchData()
      } else {
        toast.error("Invalid admin credentials")
      }
    } catch (error) {
      toast.error("Login failed")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    setIsAdmin(false)
    router.push("/")
  }

  const updateTrackingId = async (orderId: string, trackingId: string) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, trackingId, adminEmail: user.email }),
      })
      if (res.ok) {
        toast.success(`Tracking ID updated`)
        fetchData()
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to update tracking ID")
      }
    } catch (error) {
      toast.error("Error updating tracking ID")
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus, adminEmail: user.email }),
      })
      if (res.ok) {
        toast.success(`Order status updated to ${newStatus}`)
        fetchData()
      } else {
        toast.error("Failed to update status")
      }
    } catch (error) {
      toast.error("Error updating status")
    }
  }

  const deleteProduct = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    try {
      const res = await fetch(`/api/products?id=${id}&adminEmail=${user.email}`, {
        method: "DELETE",
      })
      if (res.ok) {
        toast.success("Product deleted")
        fetchData()
      } else {
        toast.error("Failed to delete product")
      }
    } catch (error) {
      toast.error("Error deleting product")
    }
  }

  const downloadOrdersExcel = () => {
    if (orders.length === 0) return;
  
    const headers = ["Order ID", "Date", "Customer Name", "Customer Phone", "Email", "Product", "Quantity", "Amount", "Status", "Address", "Place", "Post Office", "District", "PIN", "Landmark", "Notes"];
    
    const csvContent = [
      headers.join(","),
      ...orders.map(o => [
        o._id,
        new Date(o.createdAt).toLocaleDateString(),
        `"${o.shippingAddress?.name || ''}"`,
        `"${o.shippingAddress?.phone || ''}"`,
        `"${o.userEmail || ''}"`,
        `"${o.productName || ''}"`,
        o.quantity || 1,
        o.amount,
        o.status,
        `"${o.shippingAddress?.address || ''}"`,
        `"${o.shippingAddress?.place || ''}"`,
        `"${o.shippingAddress?.post || ''}"`,
        `"${o.shippingAddress?.district || ''}"`,
        `"${o.shippingAddress?.pincode || ''}"`,
        `"${o.shippingAddress?.landmark || ''}"`,
        `"${(o.notes || '').replace(/"/g, '""')}"`
      ].join(","))
    ].join("\n");
  
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Klitzo_Orders_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    setLoading(true)
    try {
      let globalSpecs: Record<string, string> = {};
      
      productForm.specifications.forEach(spec => {
        if (spec.key.trim() && spec.value.trim()) {
          globalSpecs[spec.key.trim()] = spec.value.trim();
        }
      });

      const finalProductData = {
        ...productForm,
        image: productForm.images[0] || "",
        id: editingProduct?.id,
        features: productForm.features.split(",").map(s => s.trim()).filter(Boolean),
        specifications: globalSpecs,
        variants: productForm.variants.map(v => {
          let parsedSpecs: Record<string, string> = {};
          if (v.specifications && Array.isArray(v.specifications)) {
            v.specifications.forEach((spec: any) => {
              if (spec.key.trim() && spec.value.trim()) {
                parsedSpecs[spec.key.trim()] = spec.value.trim();
              }
            });
          }
          return {
            ...v,
            image: v.images?.[0] || v.image || "",
            images: v.images || (v.image ? [v.image] : []),
            specifications: parsedSpecs
          };
        })
      }

      const url = "/api/products"
      const method = editingProduct ? "PUT" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          productData: finalProductData, 
          adminEmail: user.email 
        }),
      })

      if (res.ok) {
        toast.success(editingProduct ? "Product updated" : "Product added")
        setShowProductModal(false)
        fetchData()
      } else {
        toast.error("Error saving product")
      }
    } catch (error) {
      toast.error("Failed to save product")
    } finally {
      setLoading(false)
    }
  }

  const openProductModal = (product: any = null) => {
    if (product) {
      setEditingProduct(product)
      setProductForm({
        name: product.name,
        price: product.price?.toString() || "",
        originalPrice: product.originalPrice?.toString() || "",
        category: product.category || "",
        image: product.image || product.images?.[0] || "",
        images: product.images || [],
        stock: product.stock?.toString() || "",
        description: product.description || "",
        longDescription: product.longDescription || "",
        features: Array.isArray(product.features) ? product.features.join(", ") : "",
        specifications: product.specifications 
          ? Object.entries(product.specifications).map(([k,val]) => ({ key: k, value: String(val) }))
          : [],
        variants: (product.variants || []).map((v: any) => ({
          ...v,
          images: v.images || (v.image ? [v.image] : []),
          specifications: v.specifications 
            ? Object.entries(v.specifications).map(([k,val]) => ({ key: k, value: String(val) }))
            : []
        }))
      })
    } else {
      setEditingProduct(null)
      setProductForm({
        name: "",
        price: "",
        originalPrice: "",
        category: "",
        image: "",
        stock: "",
        description: "",
        longDescription: "",
        features: "",
        images: [],
        specifications: [],
        variants: []
      })
    }
    setShowProductModal(true)
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed": return "bg-emerald-100 text-emerald-700 border-emerald-200"
      case "shipping": return "bg-blue-100 text-blue-700 border-blue-200"
      case "paid": return "bg-teal-100 text-teal-700 border-teal-200"
      case "failed": return "bg-red-100 text-red-700 border-red-200"
      default: return "bg-slate-100 text-slate-700 border-slate-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed": return <CheckCircle className="mr-2 h-4 w-4" />
      case "shipping": return <Truck className="mr-2 h-4 w-4" />
      case "paid": return <CreditCard className="mr-2 h-4 w-4" />
      default: return <RefreshCw className="mr-2 h-4 w-4" />
    }
  }

  const seedAdminUser = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/auth/seed-admin")
      const data = await res.json()
      toast.success(data.message || "Admin seeded successfully")
    } catch (error) {
      toast.error("Seeding failed")
    } finally {
      setLoading(false)
    }
  }

  if (!isAdmin) {
    return (
      <>
        <style jsx global>{`
          footer.print\:hidden {
            display: none !important;
          }
        `}</style>

        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
        {/* Animated Background Gradients */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

        <Card className="w-full max-w-md bg-slate-900 border-slate-800 text-white relative z-10 shadow-2xl">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-teal-500/20 rounded-2xl flex items-center justify-center mb-2">
              <LayoutDashboard className="h-6 w-6 text-teal-400" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">Klitzo Admin Portal</CardTitle>
            <CardDescription className="text-slate-400">Enter your administrative credentials to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400 ml-1">Admin Email</label>
                <Input 
                  type="email" 
                  placeholder="admin@klitzo.com" 
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:ring-teal-500 focus:border-teal-500 h-12 rounded-xl"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400 ml-1">Password</label>
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:ring-teal-500 focus:border-teal-500 h-12 rounded-xl"
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl shadow-lg shadow-teal-900/20 transition-all font-sans relative overflow-hidden group"
                disabled={loading}
              >
                {loading ? (
                  <RefreshCw className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Sign In to Dashboard
                    <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>
            
            <div className="mt-8 pt-6 border-t border-slate-800 text-center">
              <p className="text-sm text-slate-500 mb-4 italic">First time setting up?</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={seedAdminUser}
                className="border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg text-xs"
              >
                Initialize Admin User
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
     </>
    )
  }

  return (
    <>
      <style jsx global>{`
        footer.print\:hidden {
          display: none !important;
        }
      `}</style>
      <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Mobile Bottom Nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] z-40 flex justify-around p-2 pb-safe">
        <button 
          onClick={() => setActiveTab("orders")}
          className={`flex flex-col items-center justify-center w-full py-2 rounded-xl transition-colors ${activeTab === 'orders' ? 'text-teal-600 bg-teal-50' : 'text-slate-400 hover:bg-slate-50'}`}
        >
          <ShoppingBag className="h-5 w-5 mb-1" />
          <span className="text-[10px] font-bold">Orders</span>
        </button>
        <button 
          onClick={() => setActiveTab("products")}
          className={`flex flex-col items-center justify-center w-full py-2 rounded-xl transition-colors ${activeTab === 'products' ? 'text-teal-600 bg-teal-50' : 'text-slate-400 hover:bg-slate-50'}`}
        >
          <Package className="h-5 w-5 mb-1" />
          <span className="text-[10px] font-bold">Products</span>
        </button>
        <button 
          onClick={() => setActiveTab("customers")}
          className={`flex flex-col items-center justify-center w-full py-2 rounded-xl transition-colors ${activeTab === 'customers' ? 'text-teal-600 bg-teal-50' : 'text-slate-400 hover:bg-slate-50'}`}
        >
          <Users className="h-5 w-5 mb-1" />
          <span className="text-[10px] font-bold">Customers</span>
        </button>
        <button 
          onClick={handleLogout}
          className="flex flex-col items-center justify-center w-full py-2 rounded-xl transition-colors text-red-400 hover:bg-red-50"
        >
          <LogOut className="h-5 w-5 mb-1" />
          <span className="text-[10px] font-bold">Logout</span>
        </button>
      </div>

      {/* Sidebar Nav */}
      <div className="fixed left-0 top-0 h-full w-64 bg-slate-900 text-white p-6 hidden lg:block border-r border-slate-800 shadow-xl z-30">
        <div className="flex items-center gap-3 mb-10 pb-6 border-b border-slate-800">
           <img src="/klitzo-logoletter.png" className="h-8 w-8" alt="" />
           <span className="font-black tracking-tighter text-xl italic text-teal-400">KLITZO ADMIN</span>
        </div>

        <nav className="space-y-1">
          <button 
            onClick={() => setActiveTab("orders")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${activeTab === 'orders' ? 'bg-teal-600 font-bold shadow-lg shadow-teal-900/20' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            <ShoppingBag className="h-5 w-5" /> Orders Management
          </button>
          <button 
            onClick={() => setActiveTab("products")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${activeTab === 'products' ? 'bg-teal-600 font-bold shadow-lg shadow-teal-900/20' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            <Package className="h-5 w-5" /> Product Catalog
          </button>
          <button 
            onClick={() => setActiveTab("customers")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${activeTab === 'customers' ? 'bg-teal-600 font-bold shadow-lg shadow-teal-900/20' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            <Users className="h-5 w-5" /> Customers List
          </button>
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
           <Button 
            variant="ghost" 
            onClick={handleLogout}
            className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl"
           >
             <LogOut className="h-5 w-5 mr-3" /> Logout
           </Button>
        </div>
      </div>

      <main className="lg:ml-64 p-4 md:p-8 min-h-screen pb-24 lg:pb-8 flex-1">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              {activeTab === 'orders' ? 'Customer Orders' : activeTab === 'products' ? 'Product Inventory' : 'Customer Database'}
            </h1>
            <p className="text-slate-500">Manage your business operations and data</p>
          </div>
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full md:w-auto">
             <div className="relative group flex-grow sm:flex-grow-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                <Input 
                  placeholder="Search globally..." 
                  className="pl-10 h-10 w-full sm:w-64 bg-white border-slate-200 rounded-full focus:ring-teal-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
             </div>
             <Button 
              onClick={fetchData} 
              variant="outline" 
      size="icon" 
              className="rounded-full hover:bg-teal-50"
             >
               <RefreshCw className={`h-4 w-4 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
             </Button>
             {activeTab === 'products' && (
               <Button 
                 onClick={() => openProductModal()}
                 className="bg-teal-600 hover:bg-teal-700 text-white gap-2 h-10 px-6 rounded-full shadow-lg shadow-teal-900/10"
               >
                 <Plus className="h-4 w-4" /> Add Product
               </Button>
             )}
             {activeTab === 'orders' && (
               <Button 
                 onClick={downloadOrdersExcel}
                 className="bg-green-600 hover:bg-green-700 text-white gap-2 h-10 px-6 rounded-full shadow-lg shadow-green-900/10"
               >
                 <Download className="h-4 w-4" /> Export CSV
               </Button>
             )}
          </div>
        </header>

        {activeTab === 'orders' ? (
          <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white overflow-hidden rounded-2xl">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="hover:bg-transparent border-slate-100">
                    <TableHead className="font-bold text-slate-800 py-6">Order ID</TableHead>
                    <TableHead className="font-bold text-slate-800">Customer</TableHead>
                    <TableHead className="font-bold text-slate-800">Product</TableHead>
                    <TableHead className="font-bold text-slate-800">Amount</TableHead>
                    <TableHead className="font-bold text-slate-800">Status</TableHead>
                    <TableHead className="font-bold text-slate-800 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <React.Fragment key={order._id}>
                    <TableRow 
                      className="group border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors"
                      onClick={() => setExpandedOrderId(expandedOrderId === order._id ? null : order._id)}
                    >
                      <TableCell className="py-6">
                        <span className="font-mono text-xs text-slate-400 group-hover:text-teal-600 transition-colors font-bold tracking-tighter">
                          #{order.razorpayOrderId?.slice(-8) || order._id.slice(-6)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                           <span className="font-bold text-slate-800">{order.shippingAddress?.name}</span>
                           <span className="text-xs text-slate-400">{order.userEmail}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-slate-600">{order.productName}</TableCell>
                      <TableCell className="font-black text-slate-900">₹{order.amount}</TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(order.status)} border rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider`}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-8 gap-1 rounded-lg text-slate-600 hover:text-slate-900 shadow-sm w-[110px] justify-between"
                            >
                              <span className="flex items-center capitalize">
                                {getStatusIcon(order.status)}
                                {order.status === 'Completed' ? 'Finished' : order.status}
                              </span>
                              <ChevronDown className="h-3 w-3 opacity-50" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-lg border-slate-100">
                            <DropdownMenuLabel className="text-xs text-slate-500 uppercase tracking-wider font-bold">Update Status</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-slate-100" />
                            <DropdownMenuItem 
                              onClick={() => updateOrderStatus(order._id, "Paid")}
                              className="cursor-pointer text-teal-600 hover:text-teal-700 hover:bg-teal-50 focus:text-teal-700 focus:bg-teal-50 rounded-lg py-2 my-1"
                            >
                              <CreditCard className="mr-2 h-4 w-4" />
                              <span>Mark Paid</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => updateOrderStatus(order._id, "Shipping")}
                              className="cursor-pointer text-blue-600 hover:text-blue-700 hover:bg-blue-50 focus:text-blue-700 focus:bg-blue-50 rounded-lg py-2 my-1"
                            >
                              <Truck className="mr-2 h-4 w-4" />
                              <span>Ship</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => updateOrderStatus(order._id, "Completed")}
                              className="cursor-pointer text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 focus:text-emerald-700 focus:bg-emerald-50 rounded-lg py-2 my-1"
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              <span>Finish</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                    {expandedOrderId === order._id && (
                      <TableRow className="bg-slate-50/50">
                        <TableCell colSpan={6} className="p-0 border-b-0">
                          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-top-2">
                            <div className="space-y-2">
                              <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-2"><MapPin className="h-3 w-3" /> Delivery Address</h4>
                              <div className="text-sm text-slate-700 bg-white p-3 rounded-xl border border-slate-200">
                                <p className="font-bold">{order.shippingAddress?.name}</p>
                                <p>{order.shippingAddress?.address}</p>
                                <p>{order.shippingAddress?.place}, {order.shippingAddress?.post}</p>
                                <p>{order.shippingAddress?.district} - {order.shippingAddress?.pincode}</p>
                                {order.shippingAddress?.landmark && <p className="text-xs text-slate-500 mt-1">Landmark: {order.shippingAddress.landmark}</p>}
                                <p className="font-medium mt-2 pt-2 border-t border-slate-100 flex items-center gap-2">
                                  <Phone className="h-3 w-3 text-slate-400" /> {order.shippingAddress?.phone}
                                </p>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-2"><ShoppingBag className="h-3 w-3" /> Order Details</h4>
                              <div className="text-sm text-slate-700 bg-white p-3 rounded-xl border border-slate-200">
                                <div className="flex gap-3 mb-2 pb-2 border-b border-slate-100">
                                  {order.productImage && (
                                    <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-100 p-1 flex-shrink-0">
                                      <img src={order.productImage} className="w-full h-full object-contain" alt="" />
                                    </div>
                                  )}
                                  <div>
                                    <p className="font-bold">{order.productName}</p>
                                    <p className="text-slate-500">Qty: {order.quantity || 1}</p>
                                  </div>
                                </div>
                                <p className="flex justify-between items-center text-xs mt-2"><span className="text-slate-500">Date</span> <span className="font-medium">{new Date(order.createdAt).toLocaleString()}</span></p>
                                <p className="flex justify-between items-center text-xs mt-1"><span className="text-slate-500">Total Amount</span> <span className="font-bold text-teal-600">₹{order.amount}</span></p>
                              </div>
                            </div>
                            {order.notes && (
                              <div className="space-y-2">
                                <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-2"><MessageCircle className="h-3 w-3" /> Additional Notes</h4>
                                <div className="text-sm text-slate-700 bg-amber-50 p-3 rounded-xl border border-amber-100">
                                  <p>{order.notes}</p>
                                </div>
                              </div>
                            )}
                            <div className="space-y-2">
                              <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-2"><Truck className="h-3 w-3" /> Tracking Information</h4>
                              <div className="text-sm text-slate-700 bg-blue-50 p-3 rounded-xl border border-blue-100 flex items-center gap-2">
                                <Input 
                                  placeholder="e.g. India Post XY123..." 
                                  value={trackingInputs[order._id] !== undefined ? trackingInputs[order._id] : (order.trackingId || '')}
                                  onChange={(e) => setTrackingInputs(prev => ({ ...prev, [order._id]: e.target.value }))}
                                  className="h-8 text-sm bg-white"
                                />
                                <Button 
                                  size="sm" 
                                  className="h-8 shrink-0 bg-blue-600 hover:bg-blue-700 text-white"
                                  onClick={() => updateTrackingId(order._id, trackingInputs[order._id] !== undefined ? trackingInputs[order._id] : (order.trackingId || ''))}
                                >
                                  Save
                                </Button>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                    </React.Fragment>
                  ))}
                  {orders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-20 bg-slate-50/20">
                         <div className="flex flex-col items-center gap-2">
                           <ShoppingBag className="h-10 w-10 text-slate-200" />
                           <p className="text-slate-400 font-medium">No orders found matching criteria</p>
                         </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : activeTab === 'products' ? (
          <div className="space-y-12">
            {Object.entries(products.reduce((acc, p) => {
              const cat = p.category || 'Uncategorized';
              if (!acc[cat]) acc[cat] = [];
              acc[cat].push(p);
              return acc;
            }, {} as Record<string, any[]>)).map(([category, catProducts]) => (
              <div key={category} className="space-y-6">
                <h2 className="text-2xl font-black text-slate-800 capitalize flex items-center gap-3">
                  <div className="h-8 w-2 bg-teal-500 rounded-full"></div>
                  {category.replace(/-/g, ' ')}
                  <Badge className="ml-2 bg-slate-100 text-slate-600 border-0">{catProducts.length}</Badge>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {catProducts.map((product) => (
                    <Card key={product.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden rounded-2xl bg-white flex flex-col">
                      <div className="h-48 bg-slate-50 relative overflow-hidden group-hover:bg-slate-100 transition-colors flex items-center justify-center p-8 shrink-0">
                        <img 
                          src={product.images?.[0] || product.image || "/placeholder.svg"} 
                          className="max-h-full max-w-full object-contain transform group-hover:scale-110 transition-transform duration-500" 
                          alt="" 
                        />
                        <div className="absolute top-4 right-4 flex gap-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                          <Button 
                            size="icon" 
                            variant="secondary" 
                            className="bg-white/80 backdrop-blur shadow-lg border-0 h-9 w-9 rounded-full hover:bg-white text-slate-800"
                            onClick={() => openProductModal(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="destructive" 
                            className="bg-red-500 shadow-lg border-0 h-9 w-9 rounded-full hover:bg-red-600 shadow-red-500/20"
                            onClick={() => deleteProduct(product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <CardContent className="p-6 flex-1 flex flex-col">
                        <h3 className="font-bold text-slate-900 text-lg mb-1 group-hover:text-teal-600 transition-colors">{product.name}</h3>
                        
                        {product.variants && product.variants.length > 0 ? (
                          <div className="mt-4 flex-1 flex flex-col">
                            <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">{product.variants.length} Variants Available</p>
                            <div className="space-y-2 mb-4">
                              {product.variants.slice(0, 3).map((v: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center bg-slate-50 p-2 rounded-lg">
                                  <span className="text-sm font-medium text-slate-700">{v.size || v.sku || `Variant ${idx + 1}`}</span>
                                  <span className="text-sm font-bold text-teal-600">₹{v.price}</span>
                                </div>
                              ))}
                              {product.variants.length > 3 && (
                                <p className="text-xs text-center text-slate-400 font-medium">+{product.variants.length - 3} more...</p>
                              )}
                            </div>
                            <div className="mt-auto pt-4 border-t border-slate-50 flex justify-between items-center">
                              <span className="text-xs text-slate-400 font-medium">Base Price</span>
                              <span className="text-lg font-black text-slate-400">₹{product.price}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-center mt-auto pt-4 border-t border-slate-50">
                            <div className="flex flex-col">
                              <span className="text-xs text-slate-400 font-medium tracking-tight">Price</span>
                              <span className="text-xl font-black text-slate-900 tracking-tighter">₹{product.price}</span>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="text-xs text-slate-400 font-medium tracking-tight whitespace-nowrap">Stock Status</span>
                              <span className={`text-xs font-bold ${product.stock > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                {product.stock > 0 ? `${product.stock} Units` : 'Out of Stock'}
                              </span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : activeTab === 'customers' ? (
          <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white overflow-hidden rounded-2xl">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="hover:bg-transparent border-slate-100">
                    <TableHead className="font-bold text-slate-800 py-6">Name</TableHead>
                    <TableHead className="font-bold text-slate-800">Email</TableHead>
                    <TableHead className="font-bold text-slate-800">Mobile</TableHead>
                    <TableHead className="font-bold text-slate-800">Role</TableHead>
                    <TableHead className="font-bold text-slate-800">Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u._id} className="border-slate-50">
                      <TableCell className="py-6 font-bold text-slate-800">{u.username}</TableCell>
                      <TableCell className="text-slate-600">{u.email}</TableCell>
                      <TableCell className="text-slate-600">{u.mobile}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={u.isAdmin ? "bg-purple-50 text-purple-700 border-purple-100" : "bg-slate-100 text-slate-600 border-slate-200"}>
                          {u.isAdmin ? "ADMIN" : "CUSTOMER"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-400 text-sm">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : null}

        {/* Product Modal */}
        {showProductModal && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setShowProductModal(false)}
          >
            <Card 
              className="w-full max-w-4xl max-h-[90vh] flex flex-col bg-white shadow-2xl rounded-3xl border-0"
              onClick={(e) => e.stopPropagation()}
            >
              <CardHeader className="bg-slate-900 text-white py-8 relative shrink-0">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-4 right-4 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full"
                  onClick={() => setShowProductModal(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
                <CardTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
                  <div className="bg-teal-500/20 p-2 rounded-xl">
                    <Package className="h-6 w-6 text-teal-400" />
                  </div>
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </CardTitle>
                <CardDescription className="text-slate-400">
                  {editingProduct ? `Updating ${editingProduct.name}` : 'Enter product details to add to catalog'}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 overflow-y-auto">
                <form onSubmit={handleProductSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="col-span-1 md:col-span-2 space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Product Name</label>
                    <Input 
                      value={productForm.name}
                      onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                      placeholder="e.g. KLITZO Stain Remover"
                      className="bg-slate-50 border-slate-200 rounded-xl h-12 focus:ring-teal-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Category</label>
                    <Input 
                      list="categories-list"
                      value={productForm.category}
                      onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                      placeholder="e.g. Cleaning"
                      className="bg-slate-50 border-slate-200 rounded-xl h-12"
                      required
                    />
                    <datalist id="categories-list">
                      {Array.from(new Set(products.map(p => p.category).filter(Boolean))).map(cat => (
                        <option key={cat} value={cat} />
                      ))}
                    </datalist>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Selling Price (Offer Price) ₹</label>
                    <Input 
                      type="number"
                      value={productForm.price}
                      onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                      placeholder="0.00"
                      className="bg-slate-50 border-slate-200 rounded-xl h-12"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">MRP (Actual Price) ₹</label>
                    <Input 
                      type="number"
                      value={productForm.originalPrice}
                      onChange={(e) => setProductForm({...productForm, originalPrice: e.target.value})}
                      placeholder="Optional"
                      className="bg-slate-50 border-slate-200 rounded-xl h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Base Stock</label>
                    <Input 
                      type="number"
                      value={productForm.stock}
                      onChange={(e) => setProductForm({...productForm, stock: e.target.value})}
                      placeholder="100"
                      className="bg-slate-50 border-slate-200 rounded-xl h-12"
                    />
                  </div>
                  <div className="col-span-1 md:col-span-2 space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Product Images (Drag to reorder - First image is cover)</label>
                    <div className="flex flex-col gap-4">
                      <Input 
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={async (e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            try {
                              const newImages = [...productForm.images];
                              for (let i = 0; i < e.target.files.length; i++) {
                                const uploadedUrl = await uploadImageAndGetUrl(e.target.files[i]);
                                newImages.push(uploadedUrl);
                              }
                              setProductForm({...productForm, images: newImages});
                            } catch (err) {
                              toast.error("Failed to process gallery images");
                            }
                          }
                        }}
                        className="bg-slate-50 border-slate-200 rounded-xl h-12 pt-2.5"
                      />
                      {productForm.images && productForm.images.length > 0 && (
                        <div className="flex gap-3 overflow-x-auto pb-2">
                          {productForm.images.map((img, idx) => (
                            <div 
                              key={idx} 
                              draggable
                              onDragStart={(e) => setDragItemIndex(idx)}
                              onDragEnter={(e) => setDragOverItemIndex(idx)}
                              onDragEnd={handleSort}
                              onDragOver={(e) => e.preventDefault()}
                              className={`relative w-20 h-20 rounded-lg bg-slate-100 flex-shrink-0 border-2 overflow-hidden group cursor-move ${idx === 0 ? "border-teal-500 shadow-sm" : "border-slate-200"}`}
                            >
                              <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-contain pointer-events-none" />
                              {idx === 0 && (
                                <div className="absolute bottom-0 left-0 right-0 bg-teal-500 text-white text-[9px] font-bold text-center py-0.5">COVER</div>
                              )}
                              <button 
                                type="button"
                                onClick={() => {
                                  const newImages = [...productForm.images];
                                  newImages.splice(idx, 1);
                                  setProductForm({...productForm, images: newImages});
                                }}
                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-span-1 md:col-span-2 space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Small Description (For Product Cards)</label>
                    <textarea 
                      value={productForm.description}
                      onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                      className="w-full bg-slate-50 border-slate-200 rounded-xl p-4 min-h-[80px] focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                      placeholder="Deep cleaning formula for..."
                    />
                  </div>
                  <div className="col-span-1 md:col-span-2 space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Long Description</label>
                    <textarea 
                      value={productForm.longDescription}
                      onChange={(e) => setProductForm({...productForm, longDescription: e.target.value})}
                      className="w-full bg-slate-50 border-slate-200 rounded-xl p-4 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                      placeholder="Full detailed product description..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Features (comma separated)</label>
                    <textarea 
                      value={productForm.features}
                      onChange={(e) => setProductForm({...productForm, features: e.target.value})}
                      className="w-full bg-slate-50 border-slate-200 rounded-xl p-4 min-h-[80px] focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                      placeholder="Instant stain removal, Safe on hands..."
                    />
                  </div>
                  {/* Specifications Section (Common) */}
                  <div className="col-span-1 md:col-span-2 space-y-4 pt-4 border-t border-slate-100">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-bold text-slate-800">Common Specifications (Applies to all variants)</h4>
                      <Button 
                        type="button" 
                        size="sm"
                        variant="outline"
                        className="h-8 gap-2 border-teal-200 text-teal-700 hover:bg-teal-50"
                        onClick={() => setProductForm({
                          ...productForm, 
                          specifications: [...(productForm.specifications || []), { key: "", value: "" }]
                        })}
                      >
                        <Plus className="h-4 w-4" /> Add Spec
                      </Button>
                    </div>
                    
                    {(!productForm.specifications || productForm.specifications.length === 0) && (
                      <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <p className="text-sm text-slate-500">No common specifications added.</p>
                      </div>
                    )}

                    <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2">
                      {productForm.specifications?.map((spec, index) => (
                        <div key={index} className="flex gap-3 items-start relative group">
                          <div className="flex-1 space-y-1">
                            <Input 
                              value={spec.key} 
                              onChange={(e) => {
                                const newSpecs = [...productForm.specifications];
                                newSpecs[index].key = e.target.value;
                                setProductForm({...productForm, specifications: newSpecs});
                              }}
                              placeholder="Name (e.g. Brand)" className="h-10 text-sm bg-slate-50" 
                            />
                          </div>
                          <div className="flex-1 space-y-1">
                            <Input 
                              value={spec.value} 
                              onChange={(e) => {
                                const newSpecs = [...productForm.specifications];
                                newSpecs[index].value = e.target.value;
                                setProductForm({...productForm, specifications: newSpecs});
                              }}
                              placeholder="Value (e.g. Klitzo)" className="h-10 text-sm bg-slate-50" 
                            />
                          </div>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-10 w-10 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-xl"
                            onClick={() => {
                              const newSpecs = [...productForm.specifications];
                              newSpecs.splice(index, 1);
                              setProductForm({...productForm, specifications: newSpecs});
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Variants Section */}
                  <div className="col-span-1 md:col-span-2 space-y-4 pt-4 border-t border-slate-100">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-bold text-slate-800">Product Variants (SKUs)</h4>
                      <Button 
                        type="button" 
                        size="sm"
                        variant="outline"
                        className="h-8 gap-2 border-teal-200 text-teal-700 hover:bg-teal-50"
                        onClick={() => setProductForm({
                          ...productForm, 
                          variants: [...(productForm.variants || []), { sku: "", size: "", price: "", images: [], stock: 0, specifications: [] }]
                        })}
                      >
                        <Plus className="h-4 w-4" /> Add Variant
                      </Button>
                    </div>
                    
                    {(!productForm.variants || productForm.variants.length === 0) && (
                      <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <p className="text-sm text-slate-500">No variants added. The base product details will be used.</p>
                      </div>
                    )}

                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                      {productForm.variants?.map((variant, index) => (
                        <div key={index} className="bg-slate-50 p-4 rounded-xl relative group border border-slate-100">
                          <Button
                            type="button"
                            size="icon"
                            variant="destructive"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                            onClick={() => {
                              const newVariants = [...productForm.variants];
                              newVariants.splice(index, 1);
                              setProductForm({...productForm, variants: newVariants});
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold uppercase text-slate-500">SKU Code</label>
                              <Input 
                                value={variant.sku} 
                                onChange={(e) => {
                                  const newVariants = [...productForm.variants];
                                  newVariants[index].sku = e.target.value;
                                  setProductForm({...productForm, variants: newVariants});
                                }}
                                placeholder="e.g. KSR-300" className="h-9 text-sm bg-white" 
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold uppercase text-slate-500">Size / Volume *</label>
                              <Input 
                                value={variant.size} 
                                onChange={(e) => {
                                  const newVariants = [...productForm.variants];
                                  newVariants[index].size = e.target.value;
                                  setProductForm({...productForm, variants: newVariants});
                                }}
                                placeholder="e.g. 300ml" className="h-9 text-sm bg-white" required
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold uppercase text-slate-500">Price (₹) *</label>
                              <Input 
                                type="number"
                                value={variant.price} 
                                onChange={(e) => {
                                  const newVariants = [...productForm.variants];
                                  newVariants[index].price = e.target.value;
                                  setProductForm({...productForm, variants: newVariants});
                                }}
                                placeholder="0.00" className="h-9 text-sm bg-white" required
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold uppercase text-slate-500">Stock</label>
                              <Input 
                                type="number"
                                value={variant.stock} 
                                onChange={(e) => {
                                  const newVariants = [...productForm.variants];
                                  newVariants[index].stock = parseInt(e.target.value) || 0;
                                  setProductForm({...productForm, variants: newVariants});
                                }}
                                placeholder="100" className="h-9 text-sm bg-white" 
                              />
                            </div>
                            <div className="col-span-1 md:col-span-2 space-y-1">
                              <label className="text-[10px] font-bold uppercase text-slate-500">Variant Images (Multiple) - First is cover</label>
                              <div className="flex flex-col gap-3">
                                <Input 
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  onChange={async (e) => {
                                    if (e.target.files && e.target.files.length > 0) {
                                      try {
                                        const newVariants = [...productForm.variants];
                                        const newImages = [...(newVariants[index].images || [])];
                                        for (let i = 0; i < e.target.files.length; i++) {
                                          const uploadedUrl = await uploadImageAndGetUrl(e.target.files[i]);
                                          newImages.push(uploadedUrl);
                                        }
                                        newVariants[index].images = newImages;
                                        setProductForm({...productForm, variants: newVariants});
                                      } catch (err) {
                                        toast.error("Failed to process image");
                                      }
                                    }
                                  }}
                                  className="h-9 text-sm bg-white pt-1.5"
                                />
                                {variant.images && variant.images.length > 0 && (
                                  <div className="flex gap-2 overflow-x-auto pb-1">
                                    {variant.images.map((img: string, imgIdx: number) => (
                                      <div 
                                        key={imgIdx} 
                                        draggable
                                        onDragStart={(e) => setVariantDragItem({variantIndex: index, imageIndex: imgIdx})}
                                        onDragEnter={(e) => setVariantDragOverItem({variantIndex: index, imageIndex: imgIdx})}
                                        onDragEnd={() => handleVariantSort(index)}
                                        onDragOver={(e) => e.preventDefault()}
                                        className={`relative w-12 h-12 rounded-md bg-white flex-shrink-0 border-2 overflow-hidden group cursor-move ${imgIdx === 0 ? "border-teal-500 shadow-sm" : "border-slate-200"}`}
                                      >
                                        <img src={img} alt={`Var ${imgIdx}`} className="w-full h-full object-contain pointer-events-none" />
                                        {imgIdx === 0 && (
                                          <div className="absolute bottom-0 left-0 right-0 bg-teal-500 text-white text-[7px] font-bold text-center py-[1px]">COVER</div>
                                        )}
                                        <button 
                                          type="button"
                                          onClick={() => {
                                            const newVariants = [...productForm.variants];
                                            newVariants[index].images.splice(imgIdx, 1);
                                            setProductForm({...productForm, variants: newVariants});
                                          }}
                                          className="absolute top-0.5 right-0.5 bg-red-500 text-white p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                        >
                                          <Trash2 className="w-2.5 h-2.5" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-4 pt-4 border-t border-slate-200">
                            <div className="flex justify-between items-center mb-2">
                              <h5 className="text-[10px] font-bold uppercase text-slate-500">Variant Specifications</h5>
                              <Button 
                                type="button" 
                                size="sm"
                                variant="ghost"
                                className="h-6 px-2 text-teal-600 text-[10px] hover:bg-teal-50"
                                onClick={() => {
                                  const newVariants = [...productForm.variants];
                                  newVariants[index].specifications = [...(newVariants[index].specifications || []), { key: "", value: "" }];
                                  setProductForm({...productForm, variants: newVariants});
                                }}
                              >
                                <Plus className="h-3 w-3 mr-1" /> Add Spec
                              </Button>
                            </div>
                            <div className="space-y-2">
                              {variant.specifications?.map((spec: any, specIdx: number) => (
                                <div key={specIdx} className="flex gap-2 items-center">
                                  <Input 
                                    value={spec.key} 
                                    onChange={(e) => {
                                      const newVariants = [...productForm.variants];
                                      newVariants[index].specifications[specIdx].key = e.target.value;
                                      setProductForm({...productForm, variants: newVariants});
                                    }}
                                    placeholder="Name (e.g. Weight)" className="h-8 text-xs bg-white" 
                                  />
                                  <Input 
                                    value={spec.value} 
                                    onChange={(e) => {
                                      const newVariants = [...productForm.variants];
                                      newVariants[index].specifications[specIdx].value = e.target.value;
                                      setProductForm({...productForm, variants: newVariants});
                                    }}
                                    placeholder="Value (e.g. 500g)" className="h-8 text-xs bg-white" 
                                  />
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg shrink-0"
                                    onClick={() => {
                                      const newVariants = [...productForm.variants];
                                      newVariants[index].specifications.splice(specIdx, 1);
                                      setProductForm({...productForm, variants: newVariants});
                                    }}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                              {(!variant.specifications || variant.specifications.length === 0) && (
                                <p className="text-[10px] text-slate-400 italic">No specifications added for this variant.</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="col-span-1 md:col-span-2 flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-100">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex-1 rounded-xl h-12"
                      onClick={() => setShowProductModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1 bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-12 font-bold shadow-lg shadow-teal-900/10"
                      disabled={loading}
                    >
                      {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : editingProduct ? 'Update Product' : 'Create Product'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
      </div>
    </>
  )
}
