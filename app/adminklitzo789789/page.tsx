"use client"

import { useState, useEffect } from "react"
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
  RefreshCw
} from "lucide-react"

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
  const [showProductModal, setShowProductModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [productForm, setProductForm] = useState({
    name: "",
    price: "",
    category: "",
    image: "",
    stock: "",
    description: ""
  })
  const router = useRouter()

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

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    setLoading(true)
    try {
      const url = "/api/products"
      const method = editingProduct ? "PUT" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          productData: { ...productForm, id: editingProduct?.id }, 
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
        price: product.price.toString(),
        category: product.category,
        image: product.image || "",
        stock: product.stock.toString(),
        description: product.description || ""
      })
    } else {
      setEditingProduct(null)
      setProductForm({
        name: "",
        price: "",
        category: "",
        image: "",
        stock: "",
        description: ""
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
      <div className="min-h-screen bg-slate-50">
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

      <main className="lg:ml-64 p-4 md:p-8 min-h-screen">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              {activeTab === 'orders' ? 'Customer Orders' : activeTab === 'products' ? 'Product Inventory' : 'Customer Database'}
            </h1>
            <p className="text-slate-500">Manage your business operations and data</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                <Input 
                  placeholder="Search globally..." 
                  className="pl-10 h-10 w-64 bg-white border-slate-200 rounded-full focus:ring-teal-500"
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
                    <TableRow key={order._id} className="group border-slate-50">
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
                        <div className="flex justify-end gap-1 opacity-10 md:opacity-10 group-hover:opacity-100 transition-opacity">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-teal-600 hover:bg-teal-50 rounded-lg px-3"
                            onClick={() => updateOrderStatus(order._id, "Paid")}
                          >
                            Mark Paid
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-blue-600 hover:bg-blue-50 rounded-lg px-3"
                            onClick={() => updateOrderStatus(order._id, "Shipping")}
                          >
                            Ship
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-emerald-600 hover:bg-emerald-50 rounded-lg px-3"
                            onClick={() => updateOrderStatus(order._id, "Completed")}
                          >
                            Finish
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {products.map((product) => (
               <Card key={product.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden rounded-2xl bg-white">
                 <div className="h-48 bg-slate-50 relative overflow-hidden group-hover:bg-slate-100 transition-colors flex items-center justify-center p-8">
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
                 <CardContent className="p-6">
                   <Badge className="bg-slate-100 text-slate-500 hover:bg-slate-100 border-0 rounded-full mb-3 px-2 py-0 text-[10px] font-bold uppercase tracking-tighter">
                     {product.category}
                   </Badge>
                   <h3 className="font-bold text-slate-900 text-lg mb-1 group-hover:text-teal-600 transition-colors">{product.name}</h3>
                   <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-50">
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
                 </CardContent>
               </Card>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <Card className="w-full max-w-lg bg-white shadow-2xl rounded-3xl overflow-hidden border-0">
              <CardHeader className="bg-slate-900 text-white py-8">
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
              <CardContent className="p-8">
                <form onSubmit={handleProductSubmit} className="grid grid-cols-2 gap-6">
                  <div className="col-span-2 space-y-2">
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
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Price (₹)</label>
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
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Category</label>
                    <Input 
                      value={productForm.category}
                      onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                      placeholder="e.g. Cleaning"
                      className="bg-slate-50 border-slate-200 rounded-xl h-12"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Stock Amount</label>
                    <Input 
                      type="number"
                      value={productForm.stock}
                      onChange={(e) => setProductForm({...productForm, stock: e.target.value})}
                      placeholder="100"
                      className="bg-slate-50 border-slate-200 rounded-xl h-12"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Image URL</label>
                    <Input 
                      value={productForm.image}
                      onChange={(e) => setProductForm({...productForm, image: e.target.value})}
                      placeholder="https://..."
                      className="bg-slate-50 border-slate-200 rounded-xl h-12"
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Description</label>
                    <textarea 
                      value={productForm.description}
                      onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                      className="w-full bg-slate-50 border-slate-200 rounded-xl p-4 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                      placeholder="Deep cleaning formula for..."
                    />
                  </div>
                  <div className="col-span-2 flex gap-3 pt-4">
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
