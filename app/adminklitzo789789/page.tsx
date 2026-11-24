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
  MessageCircle,
  Upload,
  Settings as SettingsIcon,
  Printer,
  Calendar,
  Sparkles
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog"

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
  const [orderSubTab, setOrderSubTab] = useState<"new" | "printed" | "all">("new")
  const [orderCounts, setOrderCounts] = useState<{ new: number; printed: number }>({ new: 0, printed: 0 })
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMonth, setSelectedMonth] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null)
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({})
  const [showProductModal, setShowProductModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [uploadingExcel, setUploadingExcel] = useState(false)
  const [uploadSummary, setUploadSummary] = useState<any>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [globalSettings, setGlobalSettings] = useState<any>({
    fromName: "",
    fromAddress: "",
    fromMobile: "",
    customerId: "",
    contractId: ""
  })
  const [savingSettings, setSavingSettings] = useState(false)
  const [showIndiaPostModal, setShowIndiaPostModal] = useState(false)
  const [indiaPostServiceType, setIndiaPostServiceType] = useState<"SPEEDPOST" | "PARCEL">("SPEEDPOST")
  const [indiaPostWeight, setIndiaPostWeight] = useState(250)
  const [bookingIndiaPost, setBookingIndiaPost] = useState(false)
  const [bookingSuccessData, setBookingSuccessData] = useState<any>(null)

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
    howToUse: [] as string[],
    suggestedProductIds: [] as number[],
    includedProductIds: [] as number[],
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

  const fetchSettings = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}")
      if (user.email) {
        const res = await fetch(`/api/admin/settings?adminEmail=${user.email}`)
        if (res.ok) {
          const data = await res.json()
          setGlobalSettings(data)
        }
      }
    } catch (e) {
      console.error("Failed to fetch settings", e)
    }
  }

  const fetchData = async () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    if (!user.isAdmin) return

    try {
      setLoading(true)

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

  const fetchOrders = async (
    currentPage = page, 
    currentTab = activeTab, 
    currentSearch = searchQuery, 
    currentMonth = selectedMonth,
    currentSubTab = orderSubTab
  ) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    if (!user.isAdmin || !user.email) return

    try {
      setLoading(true)
      const printStatusParam = currentTab === 'orders' ? `&printStatus=${currentSubTab}` : ''
      const res = await fetch(`/api/orders?all=true&email=${user.email}&page=${currentPage}&limit=20&tab=${currentTab}${printStatusParam}&search=${encodeURIComponent(currentSearch)}&month=${currentMonth}`)
      const data = await res.json()
      if (data.orders) {
        setOrders(data.orders)
        setTotalPages(data.totalPages || 1)
        if (typeof data.newOrdersCount === 'number' && typeof data.printedOrdersCount === 'number') {
          setOrderCounts({ new: data.newOrdersCount, printed: data.printedOrdersCount })
        }
      } else if (Array.isArray(data)) {
        setOrders(data)
        setTotalPages(1)
      }
    } catch (e) {
      toast.error("Failed to fetch orders")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isAdmin) return;
    const timer = setTimeout(() => {
      fetchOrders(page, activeTab, searchQuery, selectedMonth, orderSubTab);
    }, 500);
    return () => clearTimeout(timer);
  }, [page, activeTab, searchQuery, selectedMonth, isAdmin, orderSubTab]);

  useEffect(() => {
    setPage(1);
    setSelectedOrders([]);
  }, [activeTab, orderSubTab]);

  useEffect(() => {
    setMounted(true)
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    if (user.isAdmin) {
      setIsAdmin(true)
      fetchData()
      fetchSettings()
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
        fetchOrders()
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingExcel(true)
    const toastId = toast.loading("Uploading and processing Excel file...")
    const user = JSON.parse(localStorage.getItem("user") || "{}")

    const formData = new FormData()
    formData.append("file", file)
    formData.append("adminEmail", user.email)

    try {
      const res = await fetch("/api/orders/import-tracking", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()
      if (res.ok) {
        setUploadSummary(data)
        fetchData()
        fetchOrders(page, activeTab, searchQuery, selectedMonth, orderSubTab)
        toast.success(`Successfully added tracking IDs to ${data.updatedCount} orders!`, { id: toastId })
      } else {
        toast.error(data.error || "Failed to upload file", { id: toastId })
      }
    } catch (error) {
      toast.error("Error processing file upload", { id: toastId })
    } finally {
      setUploadingExcel(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleSaveSettings = async () => {
    setSavingSettings(true)
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}")
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...globalSettings, adminEmail: user.email }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success("Settings saved successfully!")
      } else {
        toast.error(data.error || "Failed to save settings")
      }
    } catch (e) {
      toast.error("Error saving settings")
    } finally {
      setSavingSettings(false)
    }
  }

  const handleBulkBookIndiaPost = async () => {
    if (selectedOrders.length === 0) return
    setBookingIndiaPost(true)
    const toastId = toast.loading("Connecting to India Post CEPT API...")
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}")
      const res = await fetch("/api/shipping/indiapost/bulk-book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderIds: selectedOrders,
          adminEmail: user.email,
          serviceType: indiaPostServiceType,
          weightInGrams: indiaPostWeight,
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        toast.success(`Successfully generated barcodes for ${data.count} order(s)!`, { id: toastId })
        setBookingSuccessData(data)
        fetchOrders(page, activeTab, searchQuery, selectedMonth, orderSubTab)
      } else {
        toast.error(data.error || "Failed to generate barcodes with India Post", { id: toastId })
      }
    } catch (e: any) {
      toast.error(e.message || "Error calling India Post API", { id: toastId })
    } finally {
      setBookingIndiaPost(false)
    }
  }

  const handlePrintSelected = () => {
    if (selectedOrders.length === 0) return
    window.open(`/adminklitzo789789/print?ids=${selectedOrders.join(",")}`, "_blank")
    // Also mark them as printed
    markOrdersAsPrinted(selectedOrders)
  }

  const markOrdersAsPrinted = async (ids: string[], isPrinted = true) => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}")
      const res = await fetch("/api/orders/mark-printed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderIds: ids, adminEmail: user.email, isPrinted }),
      })
      if (res.ok) {
        setSelectedOrders([])
        fetchOrders(page, activeTab, searchQuery, selectedMonth, orderSubTab)
        toast.success(isPrinted ? "Orders marked as printed" : "Orders marked as unprinted")
      }
    } catch (e) {
      console.error("Failed to update print status", e)
    }
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
        fetchOrders(page, activeTab, searchQuery, selectedMonth, orderSubTab)
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
        fetchOrders(page, activeTab, searchQuery, selectedMonth, orderSubTab)
      } else {
        toast.error("Failed to update status")
      }
    } catch (error) {
      toast.error("Error updating status")
    }
  }

  const deleteOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to permanently delete this order? This action cannot be undone.")) return;
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    try {
      const res = await fetch(`/api/orders?id=${orderId}&adminEmail=${user.email}`, {
        method: "DELETE",
      })
      if (res.ok) {
        toast.success("Order deleted successfully")
        fetchOrders(page, activeTab, searchQuery, selectedMonth, orderSubTab)
      } else {
        toast.error("Failed to delete order")
      }
    } catch (error) {
      toast.error("Error deleting order")
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
        howToUse: (productForm.howToUse || []).map(s => s.trim()).filter(Boolean),
        suggestedProductIds: productForm.suggestedProductIds || [],
        includedProductIds: productForm.suggestedProductIds || [],
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
        howToUse: Array.isArray(product.howToUse)
          ? product.howToUse
          : typeof product.howToUse === 'string' && product.howToUse.trim()
          ? product.howToUse.split('\n').map((s: string) => s.trim()).filter(Boolean)
          : [],
        suggestedProductIds: Array.isArray(product.suggestedProductIds)
          ? product.suggestedProductIds
          : Array.isArray(product.includedProductIds)
          ? product.includedProductIds
          : [],
        includedProductIds: Array.isArray(product.includedProductIds) ? product.includedProductIds : [],
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
        howToUse: [],
        suggestedProductIds: [],
        includedProductIds: [],
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
          onClick={() => { setActiveTab("orders"); setOrderSubTab("new"); }}
          className={`flex flex-col items-center justify-center w-full py-2 rounded-xl transition-colors ${activeTab === 'orders' && orderSubTab === 'new' ? 'text-teal-600 bg-teal-50' : 'text-slate-400 hover:bg-slate-50'}`}
        >
          <ShoppingBag className="h-5 w-5 mb-1" />
          <span className="text-[10px] font-bold">New</span>
        </button>
        <button 
          onClick={() => { setActiveTab("orders"); setOrderSubTab("printed"); }}
          className={`flex flex-col items-center justify-center w-full py-2 rounded-xl transition-colors ${activeTab === 'orders' && orderSubTab === 'printed' ? 'text-teal-600 bg-teal-50' : 'text-slate-400 hover:bg-slate-50'}`}
        >
          <Printer className="h-5 w-5 mb-1" />
          <span className="text-[10px] font-bold">Printed</span>
        </button>
        <button 
          onClick={() => setActiveTab("cancelled-orders")}
          className={`flex flex-col items-center justify-center w-full py-2 rounded-xl transition-colors ${activeTab === 'cancelled-orders' ? 'text-teal-600 bg-teal-50' : 'text-slate-400 hover:bg-slate-50'}`}
        >
          <X className="h-5 w-5 mb-1" />
          <span className="text-[10px] font-bold">Cancelled</span>
        </button>
        <button 
          onClick={() => setActiveTab("abandoned-orders")}
          className={`flex flex-col items-center justify-center w-full py-2 rounded-xl transition-colors ${activeTab === 'abandoned-orders' ? 'text-teal-600 bg-teal-50' : 'text-slate-400 hover:bg-slate-50'}`}
        >
          <Clock className="h-5 w-5 mb-1" />
          <span className="text-[10px] font-bold">Failed</span>
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
          onClick={() => setActiveTab("settings")}
          className={`flex flex-col items-center justify-center w-full py-2 rounded-xl transition-colors ${activeTab === 'settings' ? 'text-teal-600 bg-teal-50' : 'text-slate-400 hover:bg-slate-50'}`}
        >
          <SettingsIcon className="h-5 w-5 mb-1" />
          <span className="text-[10px] font-bold">Settings</span>
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
            onClick={() => { setActiveTab("orders"); setOrderSubTab("new"); }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ${activeTab === 'orders' && orderSubTab === 'new' ? 'bg-teal-600 font-bold shadow-lg shadow-teal-900/20 text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            <div className="flex items-center gap-3">
              <ShoppingBag className="h-5 w-5" /> New Orders
            </div>
            {orderCounts.new > 0 && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${activeTab === 'orders' && orderSubTab === 'new' ? 'bg-white text-teal-800' : 'bg-teal-500/20 text-teal-300'}`}>
                {orderCounts.new}
              </span>
            )}
          </button>
          <button 
            onClick={() => { setActiveTab("orders"); setOrderSubTab("printed"); }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ${activeTab === 'orders' && orderSubTab === 'printed' ? 'bg-teal-600 font-bold shadow-lg shadow-teal-900/20 text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            <div className="flex items-center gap-3">
              <Printer className="h-5 w-5" /> Printed Orders
            </div>
            {orderCounts.printed > 0 && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${activeTab === 'orders' && orderSubTab === 'printed' ? 'bg-white text-teal-800' : 'bg-slate-800 text-slate-300'}`}>
                {orderCounts.printed}
              </span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab("cancelled-orders")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${activeTab === 'cancelled-orders' ? 'bg-teal-600 font-bold shadow-lg shadow-teal-900/20' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            <X className="h-5 w-5" /> Cancelled Orders
          </button>
          <button 
            onClick={() => setActiveTab("abandoned-orders")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${activeTab === 'abandoned-orders' ? 'bg-teal-600 font-bold shadow-lg shadow-teal-900/20' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            <Clock className="h-5 w-5" /> Failed Prepaid
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
          <button 
            onClick={() => setActiveTab("settings")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${activeTab === 'settings' ? 'bg-teal-600 font-bold shadow-lg shadow-teal-900/20' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            <SettingsIcon className="h-5 w-5" /> Print Settings
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
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              {activeTab === 'orders' 
                ? (orderSubTab === 'new' ? 'New Customer Orders' : orderSubTab === 'printed' ? 'Printed Orders' : 'All Customer Orders') 
                : activeTab === 'cancelled-orders' ? 'Cancelled Orders' 
                : activeTab === 'abandoned-orders' ? 'Failed Prepaid Orders' 
                : activeTab === 'products' ? 'Product Inventory' 
                : 'Customer Database'}
            </h1>
            <p className="text-slate-500">
              {activeTab === 'orders' && orderSubTab === 'new'
                ? 'Orders waiting to be printed and fulfilled'
                : activeTab === 'orders' && orderSubTab === 'printed'
                ? 'Orders with shipping labels already printed'
                : 'Manage your business operations and data'}
            </p>
          </div>
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full md:w-auto">
             <div className="relative group flex-grow sm:flex-grow-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                <Input 
                  placeholder="Search globally..." 
                  className="pl-10 h-10 w-full sm:w-64 bg-white border-slate-200 rounded-full focus:ring-teal-500"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setPage(1)
                  }}
                />
             </div>
             {(activeTab === 'orders' || activeTab === 'cancelled-orders' || activeTab === 'abandoned-orders') && (
               <div className="relative">
                 <select
                   value={selectedMonth}
                   onChange={(e) => {
                     setSelectedMonth(e.target.value)
                     setPage(1)
                   }}
                   className="h-10 pl-4 pr-10 rounded-full border-slate-200 text-slate-600 appearance-none bg-white hover:bg-teal-50 hover:border-teal-200 transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-teal-500/20"
                 >
                   <option value="">All Months</option>
                   {Array.from({ length: 12 }).map((_, i) => {
                     const d = new Date();
                     d.setMonth(d.getMonth() - i);
                     const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                     const label = d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
                     return <option key={value} value={value}>{label}</option>
                   })}
                 </select>
                 <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
               </div>
             )}
             <Button 
              onClick={() => {
                fetchData();
                fetchOrders();
              }} 
              variant="outline" 
              size="icon" 
              className="rounded-full hover:bg-teal-50"
             >
               <RefreshCw className={`h-4 w-4 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
             </Button>
             {(activeTab === 'orders' || activeTab === 'cancelled-orders' || activeTab === 'abandoned-orders') && (
               <>
                 <input 
                   type="file" 
                   accept=".xls,.xlsx" 
                   className="hidden" 
                   ref={fileInputRef} 
                   onChange={handleFileUpload} 
                 />
                 <Button 
                   onClick={() => fileInputRef.current?.click()} 
                   disabled={uploadingExcel}
                   className="rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                 >
                   {uploadingExcel ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                   {uploadingExcel ? "Uploading..." : "Upload Post Office Excel"}
                 </Button>
               </>
             )}
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

        {activeTab === 'orders' && (
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-1.5 p-1.5 bg-slate-200/70 rounded-2xl shadow-inner">
              <button
                onClick={() => { setOrderSubTab("new"); setPage(1); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  orderSubTab === 'new'
                    ? 'bg-white text-teal-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShoppingBag className="h-4 w-4 text-teal-600" />
                New Orders
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                  orderSubTab === 'new' ? 'bg-teal-100 text-teal-800' : 'bg-slate-300 text-slate-700'
                }`}>
                  {orderCounts.new}
                </span>
              </button>
              <button
                onClick={() => { setOrderSubTab("printed"); setPage(1); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  orderSubTab === 'printed'
                    ? 'bg-white text-teal-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Printer className="h-4 w-4 text-teal-600" />
                Printed Orders
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                  orderSubTab === 'printed' ? 'bg-teal-100 text-teal-800' : 'bg-slate-300 text-slate-700'
                }`}>
                  {orderCounts.printed}
                </span>
              </button>
              <button
                onClick={() => { setOrderSubTab("all"); setPage(1); }}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                  orderSubTab === 'all'
                    ? 'bg-white text-teal-700 shadow-sm font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                All Orders
              </button>
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Showing {orderSubTab === 'new' ? 'Unprinted New Orders' : orderSubTab === 'printed' ? 'Printed Orders' : 'All Orders'}
            </div>
          </div>
        )}

        {(activeTab === 'orders' || activeTab === 'cancelled-orders' || activeTab === 'abandoned-orders') ? (() => {
          const displayedOrders = orders;
          return (
          <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white overflow-hidden rounded-2xl flex flex-col">
            <CardContent className="p-0 flex-1 overflow-auto">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="hover:bg-transparent border-slate-100">
                    <TableHead className="w-[50px] py-6 px-4">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                        checked={displayedOrders.length > 0 && selectedOrders.length === displayedOrders.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedOrders(displayedOrders.map(o => o._id))
                          } else {
                            setSelectedOrders([])
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead className="font-bold text-slate-800">Order ID</TableHead>
                    <TableHead className="font-bold text-slate-800">Date</TableHead>
                    <TableHead className="font-bold text-slate-800">Customer</TableHead>
                    <TableHead className="font-bold text-slate-800">Product</TableHead>
                    <TableHead className="font-bold text-slate-800">Payment</TableHead>
                    <TableHead className="font-bold text-slate-800">Amount</TableHead>
                    <TableHead className="font-bold text-slate-800">Status</TableHead>
                    <TableHead className="font-bold text-slate-800 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedOrders.map((order) => (
                    <React.Fragment key={order._id}>
                    <TableRow 
                      className={`group border-slate-50 cursor-pointer transition-colors ${
                        order.status === 'completed' 
                          ? 'bg-green-50/60 hover:bg-green-100/60' 
                          : order.trackingId 
                            ? 'bg-blue-50/60 hover:bg-blue-100/60' 
                            : 'hover:bg-slate-50'
                      }`}
                      onClick={() => setExpandedOrderId(expandedOrderId === order._id ? null : order._id)}
                    >
                      <TableCell className="px-4" onClick={(e) => e.stopPropagation()}>
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                          checked={selectedOrders.includes(order._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedOrders([...selectedOrders, order._id])
                            } else {
                              setSelectedOrders(selectedOrders.filter(id => id !== order._id))
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell className="py-6">
                        <span className="flex flex-col gap-1">
                          <span className="font-mono text-xs text-slate-400 group-hover:text-teal-600 transition-colors font-bold tracking-tighter">
                            #{order.razorpayOrderId?.slice(-8) || order._id.slice(-6)}
                          </span>
                          {order.isPrinted && (
                            <Badge variant="outline" className="w-max px-1.5 py-0 text-[9px] bg-slate-100 text-slate-500 border-slate-200 uppercase flex items-center gap-1">
                              <Printer className="w-3 h-3" /> Printed
                            </Badge>
                          )}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                           <span className="font-medium text-slate-700">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                           <span className="text-xs text-slate-400">{new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                           <span className="font-bold text-slate-800">{order.shippingAddress?.name}</span>
                           <span className="text-xs text-slate-400">{order.shippingAddress?.phone || order.userMobile}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-slate-600">
                        {order.items && order.items.length > 1 ? (
                          <div>
                            <span className="font-bold text-slate-800">{order.items[0].productName}</span>
                            <span className="text-xs text-teal-600 block font-semibold">+{order.items.length - 1} more items ({order.quantity} total)</span>
                          </div>
                        ) : (
                          order.productName
                        )}
                      </TableCell>
                      <TableCell>
                        {order.razorpayPaymentId ? (
                          <Badge variant="outline" className="border-teal-200 text-teal-700 bg-teal-50">Prepaid</Badge>
                        ) : (
                          <Badge variant="outline" className="border-amber-200 text-amber-700 bg-amber-50">COD</Badge>
                        )}
                      </TableCell>
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
                          <DropdownMenuContent align="end" className="w-48 p-2 rounded-xl shadow-xl border-slate-100">
                            <DropdownMenuLabel className="text-xs font-black text-slate-400 uppercase tracking-wider px-2">Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-slate-100" />
                            {order.isPrinted ? (
                              <>
                                <DropdownMenuItem 
                                  onClick={() => {
                                    window.open(`/adminklitzo789789/print?ids=${order._id}`, "_blank")
                                  }}
                                  className="px-3 py-2.5 rounded-lg cursor-pointer hover:bg-slate-50 font-medium text-slate-600 flex items-center gap-2"
                                >
                                  <Printer className="h-4 w-4" /> Reprint Label
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => markOrdersAsPrinted([order._id], false)}
                                  className="px-3 py-2.5 rounded-lg cursor-pointer hover:bg-amber-50 font-medium text-amber-600 flex items-center gap-2"
                                >
                                  <RefreshCw className="h-4 w-4" /> Move to New Orders
                                </DropdownMenuItem>
                              </>
                            ) : (
                              <>
                                <DropdownMenuItem 
                                  onClick={() => {
                                    window.open(`/adminklitzo789789/print?ids=${order._id}`, "_blank")
                                    markOrdersAsPrinted([order._id], true)
                                  }}
                                  className="px-3 py-2.5 rounded-lg cursor-pointer hover:bg-slate-50 font-medium text-slate-600 flex items-center gap-2"
                                >
                                  <Printer className="h-4 w-4" /> Print Label
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => markOrdersAsPrinted([order._id], true)}
                                  className="px-3 py-2.5 rounded-lg cursor-pointer hover:bg-teal-50 font-medium text-teal-600 flex items-center gap-2"
                                >
                                  <CheckCircle className="h-4 w-4" /> Mark as Printed
                                </DropdownMenuItem>
                              </>
                            )}
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
                            {order.status !== 'Cancelled' && order.status !== 'cancelled' && (
                              <DropdownMenuItem 
                                onClick={() => setOrderToCancel(order._id)}
                                className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 focus:text-red-700 focus:bg-red-50 rounded-lg py-2 my-1"
                              >
                                <X className="mr-2 h-4 w-4" />
                                <span>Cancel Order</span>
                              </DropdownMenuItem>
                            )}
                            {(order.status === 'Cancelled' || order.status === 'cancelled') && (
                              <DropdownMenuItem 
                                onClick={() => deleteOrder(order._id)}
                                className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 focus:text-red-700 focus:bg-red-50 rounded-lg py-2 my-1 font-bold"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Delete Order</span>
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                    {expandedOrderId === order._id && (
                      <TableRow className="bg-slate-50/50">
                        <TableCell colSpan={8} className="p-0 border-b-0">
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
                                {order.items && order.items.length > 0 ? (
                                  <div className="space-y-2 mb-2 pb-2 border-b border-slate-100 divide-y divide-slate-50">
                                    {order.items.map((it: any, i: number) => (
                                      <div key={i} className="flex items-center gap-3 pt-2 first:pt-0">
                                        {it.productImage && (
                                          <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 p-1 shrink-0 flex items-center justify-center">
                                            <img src={it.productImage} className="w-full h-full object-contain" alt="" />
                                          </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                          <p className="font-bold text-xs truncate">{it.productName}</p>
                                          <div className="flex gap-2 text-[11px] text-slate-500">
                                            {it.variantSize && <span className="text-teal-600 font-medium">Size: {it.variantSize}</span>}
                                            <span>Qty: {it.quantity}</span>
                                            {it.price && <span className="font-bold text-slate-800">₹{it.price * it.quantity}</span>}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
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
                                )}
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
                  {displayedOrders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-20 bg-slate-50/20">
                         <div className="flex flex-col items-center gap-2">
                           <ShoppingBag className="h-10 w-10 text-slate-200" />
                           <p className="text-slate-400 font-medium">
                             {activeTab === 'orders' && orderSubTab === 'new'
                               ? 'No new unprinted orders found'
                               : activeTab === 'orders' && orderSubTab === 'printed'
                               ? 'No printed orders found'
                               : 'No orders found matching criteria'}
                           </p>
                         </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
            {totalPages > 1 && (
              <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                <span className="text-sm text-slate-500 font-medium">Page {page} of {totalPages}</span>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="h-8 border-slate-200"
                  >
                    Previous
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="h-8 border-slate-200"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </Card>
          );
        })() : activeTab === 'products' ? (
          <div className="space-y-12">
            {Object.entries(products.filter(p => !searchQuery || (p.name || '').toLowerCase().includes(searchQuery.toLowerCase())).reduce((acc, p) => {
              const cat = p.category || 'Uncategorized';
              if (!acc[cat]) acc[cat] = [];
              acc[cat].push(p);
              return acc;
            }, {} as Record<string, any[]>)).map(([category, catProducts]) => (
              <div key={category} className="space-y-6">
                <h2 className="text-2xl font-black text-slate-800 capitalize flex items-center gap-3">
                  <div className="h-8 w-2 bg-teal-500 rounded-full"></div>
                  {category.replace(/-/g, ' ')}
                  <Badge className="ml-2 bg-slate-100 text-slate-600 border-0">{(catProducts as any[]).length}</Badge>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(catProducts as any[]).map((product: any) => (
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
                  {users.filter(u => !searchQuery || (u.username || '').toLowerCase().includes(searchQuery.toLowerCase()) || (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) || (u.mobile || '').toLowerCase().includes(searchQuery.toLowerCase())).map((u) => (
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
        ) : activeTab === 'settings' ? (
          <div className="max-w-2xl mx-auto space-y-6">
            <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white rounded-2xl">
              <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Printer className="w-5 h-5 text-teal-600" />
                  Print Settings
                </CardTitle>
                <CardDescription>
                  Configure the default labels that will be printed for bulk orders.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">From Name</label>
                  <Input value={globalSettings.fromName} onChange={(e) => setGlobalSettings({...globalSettings, fromName: e.target.value})} placeholder="e.g. KLITZO" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">From Address</label>
                  <Input value={globalSettings.fromAddress} onChange={(e) => setGlobalSettings({...globalSettings, fromAddress: e.target.value})} placeholder="e.g. AL JASEERA TRADE CITY..." />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">From Mobile</label>
                  <Input value={globalSettings.fromMobile} onChange={(e) => setGlobalSettings({...globalSettings, fromMobile: e.target.value})} placeholder="Mobile Number" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Customer ID</label>
                    <Input value={globalSettings.customerId} onChange={(e) => setGlobalSettings({...globalSettings, customerId: e.target.value})} placeholder="e.g. 1683565443" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Contract ID</label>
                    <Input value={globalSettings.contractId} onChange={(e) => setGlobalSettings({...globalSettings, contractId: e.target.value})} placeholder="e.g. 41132043" />
                  </div>
                </div>
                <Button 
                  onClick={handleSaveSettings}
                  disabled={savingSettings}
                  className="w-full mt-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl"
                >
                  {savingSettings ? "Saving..." : "Save Settings"}
                </Button>
              </CardContent>
            </Card>
          </div>
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

                  {/* How to Use Section (Step-by-Step Points) */}
                  <div className="col-span-1 md:col-span-2 space-y-4 pt-4 border-t border-slate-100">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">How to Use (Step-by-Step Points)</h4>
                        <p className="text-xs text-slate-500">Add dynamic steps to display in the &quot;How to Use&quot; section on the product page</p>
                      </div>
                      <Button 
                        type="button" 
                        size="sm"
                        variant="outline"
                        className="h-8 gap-2 border-teal-200 text-teal-700 hover:bg-teal-50"
                        onClick={() => setProductForm({
                          ...productForm, 
                          howToUse: [...(productForm.howToUse || []), ""]
                        })}
                      >
                        <Plus className="h-4 w-4" /> Add Step
                      </Button>
                    </div>
                    
                    {(!productForm.howToUse || productForm.howToUse.length === 0) && (
                      <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <p className="text-sm text-slate-500 mb-2">No custom steps added yet.</p>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="text-xs text-teal-600 hover:text-teal-700 hover:bg-teal-50 font-bold"
                          onClick={() => setProductForm({
                            ...productForm,
                            howToUse: [""]
                          })}
                        >
                          <Plus className="h-3.5 w-3.5 mr-1" /> Add First Step
                        </Button>
                      </div>
                    )}

                    <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2">
                      {productForm.howToUse?.map((step, index) => (
                        <div key={index} className="flex gap-3 items-center group">
                          <span className="shrink-0 flex items-center justify-center w-7 h-7 rounded-lg bg-teal-50 text-teal-700 font-bold text-xs border border-teal-200">
                            {index + 1}
                          </span>
                          <Input 
                            value={step} 
                            onChange={(e) => {
                              const newSteps = [...productForm.howToUse];
                              newSteps[index] = e.target.value;
                              setProductForm({...productForm, howToUse: newSteps});
                            }}
                            placeholder={`Step ${index + 1} instructions (e.g. Shake the bottle well before use)`} 
                            className="h-10 text-sm bg-slate-50 flex-1" 
                          />
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-10 w-10 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-xl shrink-0"
                            onClick={() => {
                              const newSteps = [...productForm.howToUse];
                              newSteps.splice(index, 1);
                              setProductForm({...productForm, howToUse: newSteps});
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

                  {/* Suggested Products Section (At bottom of form) */}
                  <div className="col-span-1 md:col-span-2 space-y-4 pt-4 border-t border-slate-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-teal-600" />
                          Suggested Products
                        </h4>
                        <p className="text-xs text-slate-500">
                          Choose multiple products to show as recommendations / suggestions inside this product&apos;s page
                        </p>
                      </div>
                      {(productForm.suggestedProductIds || []).length > 0 && (
                        <Badge variant="outline" className="text-xs bg-teal-50 text-teal-700 border-teal-200 w-fit">
                          {(productForm.suggestedProductIds || []).length} Selected
                        </Badge>
                      )}
                    </div>

                    {/* Product Picker Dropdown */}
                    <div className="flex gap-2">
                      <select
                        value=""
                        onChange={(e) => {
                          const selectedId = Number(e.target.value);
                          if (selectedId && !(productForm.suggestedProductIds || []).includes(selectedId)) {
                            setProductForm({
                              ...productForm,
                              suggestedProductIds: [...(productForm.suggestedProductIds || []), selectedId]
                            });
                          }
                        }}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl h-11 px-4 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                      >
                        <option value="">-- Choose a product to add to suggestions --</option>
                        {products
                          .filter(p => (!editingProduct || p.id !== editingProduct.id) && !(productForm.suggestedProductIds || []).includes(p.id))
                          .map(p => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({String(p.price).includes('₹') ? p.price : `₹${p.price}`})
                            </option>
                          ))}
                      </select>
                    </div>

                    {/* Selected Suggested Products List */}
                    {productForm.suggestedProductIds && productForm.suggestedProductIds.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-1">
                        {productForm.suggestedProductIds.map((id: number) => {
                          const item = products.find(p => p.id === id);
                          if (!item) return null;
                          return (
                            <div 
                              key={id}
                              className="flex items-center justify-between p-3 rounded-xl border border-teal-200 bg-teal-50/40 shadow-sm"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <img 
                                  src={item.images?.[0] || item.image || "/placeholder.svg"} 
                                  alt={item.name} 
                                  className="w-10 h-10 object-contain rounded-lg bg-white p-1 border border-slate-200 shrink-0" 
                                />
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-slate-800 truncate">{item.name}</p>
                                  <p className="text-[11px] text-teal-600 font-semibold">{String(item.price).includes('₹') ? item.price : `₹${item.price}`}</p>
                                </div>
                              </div>
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg shrink-0 ml-2"
                                onClick={() => {
                                  setProductForm({
                                    ...productForm,
                                    suggestedProductIds: (productForm.suggestedProductIds || []).filter((pid: number) => pid !== id)
                                  });
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <p className="text-xs text-slate-500">No suggested products added. Use the dropdown above to choose products.</p>
                      </div>
                    )}
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

      {/* Upload Summary Dialog */}
      <Dialog open={!!uploadSummary} onOpenChange={(open) => !open && setUploadSummary(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Upload Summary</DialogTitle>
            <DialogDescription>
              {uploadSummary?.updatedCount} orders were successfully matched and updated.
            </DialogDescription>
          </DialogHeader>

          {uploadSummary?.pincodeMismatches?.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-bold uppercase text-amber-600 mb-2 tracking-wider flex items-center gap-2">
                <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                  {uploadSummary.pincodeMismatches.length}
                </Badge>
                Pincode Mismatches (Updated)
              </h3>
              <p className="text-xs text-slate-500 mb-2">These orders matched by name, but the pincode differed. The tracking ID was still applied, but please double-check them.</p>
              <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer Name</TableHead>
                      <TableHead>Tracking Code</TableHead>
                      <TableHead>File Pincode</TableHead>
                      <TableHead>DB Pincode</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {uploadSummary.pincodeMismatches.map((m: any, i: number) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium text-slate-800">{m.receiverName}</TableCell>
                        <TableCell className="font-mono text-xs">{m.trackingCode}</TableCell>
                        <TableCell className="text-red-500 line-through">{m.filePin}</TableCell>
                        <TableCell className="text-green-600">{m.dbPin}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {uploadSummary?.unmatched?.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-bold uppercase text-red-600 mb-2 tracking-wider flex items-center gap-2">
                <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                  {uploadSummary.unmatched.length}
                </Badge>
                Unmatched Rows (Skipped)
              </h3>
              <p className="text-xs text-slate-500 mb-2">These rows could not be matched with any active order and were skipped.</p>
              <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer Name</TableHead>
                      <TableHead>Tracking Code</TableHead>
                      <TableHead>Pincode</TableHead>
                      <TableHead>Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {uploadSummary.unmatched.map((u: any, i: number) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium text-slate-800">{u.receiverName}</TableCell>
                        <TableCell className="font-mono text-xs">{u.trackingCode}</TableCell>
                        <TableCell>{u.destPin}</TableCell>
                        <TableCell className="text-xs text-red-500">{u.reason}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
          
          <DialogFooter className="mt-6">
            <Button onClick={() => setUploadSummary(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sticky Bulk Action Bar */}
      {selectedOrders.length > 0 && activeTab === 'orders' && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-4 sm:gap-6 z-50 animate-in slide-in-from-bottom-10 border border-slate-700 max-w-[95vw] overflow-x-auto">
          <span className="font-medium text-sm whitespace-nowrap">
            <span className="text-teal-400 font-bold">{selectedOrders.length}</span> orders selected
          </span>
          <div className="w-px h-6 bg-slate-700 shrink-0" />
          <Button 
            onClick={() => {
              setBookingSuccessData(null)
              setShowIndiaPostModal(true)
            }}
            className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-full h-9 px-4 flex items-center gap-2 shrink-0 cursor-pointer shadow-md"
          >
            <Truck className="w-4 h-4" />
            Generate Post Office Barcode
          </Button>
          <Button 
            onClick={handlePrintSelected}
            className="bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold rounded-full h-9 px-5 flex items-center gap-2 shrink-0"
          >
            <Printer className="w-4 h-4" />
            {orderSubTab === 'printed' ? 'Reprint Selected' : 'Print Selected'}
          </Button>
          {orderSubTab === 'printed' ? (
            <Button 
              onClick={() => markOrdersAsPrinted(selectedOrders, false)}
              variant="outline"
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-600 rounded-full h-9 px-4 text-xs shrink-0"
            >
              Move to New Orders
            </Button>
          ) : (
            <Button 
              onClick={() => markOrdersAsPrinted(selectedOrders, true)}
              variant="outline"
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-600 rounded-full h-9 px-4 text-xs shrink-0"
            >
              Mark as Printed
            </Button>
          )}
        </div>
      )}
      </div>

      <Dialog open={!!orderToCancel} onOpenChange={(open) => !open && setOrderToCancel(null)}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">Cancel Order</DialogTitle>
            <DialogDescription className="text-slate-500 mt-2">
              Are you sure you want to cancel this order? This action will mark the order as cancelled and move it to the Cancelled Orders tab.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-3 sm:justify-start mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOrderToCancel(null)}
              className="flex-1"
            >
              Go Back
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="flex-1 bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (orderToCancel) {
                  updateOrderStatus(orderToCancel, "cancelled");
                  setOrderToCancel(null);
                }
              }}
            >
              Yes, Cancel Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* India Post CEPT Bulk Booking Dialog */}
      <Dialog open={showIndiaPostModal} onOpenChange={(open) => {
        if (!open) {
          setShowIndiaPostModal(false)
          setBookingSuccessData(null)
        }
      }}>
        <DialogContent className="sm:max-w-2xl bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-slate-900">
                  India Post (Speed Post) Barcode Generation
                </DialogTitle>
                <DialogDescription className="text-slate-500 text-xs mt-0.5">
                  Customer ID: <strong className="text-slate-800">1683565443</strong> &bull; CEPT API Gateway
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {!bookingSuccessData ? (
            <div className="space-y-4 py-2">
              {/* Selected Orders Summary */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-bold text-sm text-slate-800">Selected Orders ({selectedOrders.length})</span>
                  <Badge className="bg-amber-100 text-amber-800 font-bold border-amber-200">
                    {selectedOrders.length} Ready for Booking
                  </Badge>
                </div>
                
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-100">
                  {orders
                    .filter((o) => selectedOrders.includes(o._id))
                    .map((o) => (
                      <div key={o._id} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                        <div className="min-w-0 pr-3">
                          <p className="font-bold text-slate-800 truncate">{o.shippingAddress?.name || o.userName}</p>
                          <p className="text-slate-500 truncate text-[11px]">
                            {o.shippingAddress?.district || o.shippingAddress?.place || ""}, PIN: {o.shippingAddress?.pincode}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            o.paymentMethod === 'Prepaid' || o.razorpayPaymentId 
                              ? 'bg-teal-50 text-teal-700 border border-teal-200' 
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}>
                            {o.paymentMethod === 'Prepaid' || o.razorpayPaymentId ? 'PREPAID' : `COD ₹${o.amount}`}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Service & Weight Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">Service Type</label>
                  <select 
                    value={indiaPostServiceType} 
                    onChange={(e: any) => setIndiaPostServiceType(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm font-medium focus:ring-2 focus:ring-teal-500 outline-none"
                  >
                    <option value="SPEEDPOST">Speed Post (Domestic)</option>
                    <option value="PARCEL">Business Parcel</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">Parcel Weight (Grams)</label>
                  <Input 
                    type="number"
                    value={indiaPostWeight}
                    onChange={(e) => setIndiaPostWeight(Number(e.target.value) || 250)}
                    min={50}
                    step={50}
                    className="h-10 text-sm"
                  />
                </div>
              </div>

              <div className="bg-blue-50/70 border border-blue-200 p-3 rounded-xl text-xs text-blue-900 leading-relaxed">
                <strong>API Endpoint:</strong> Calling <code>/beextcustomer/v1/access/login</code> and generating official India Post 13-digit Article Barcodes (e.g. <code>EM...IN</code>) for Speed Post booking.
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                <h4 className="font-bold text-emerald-900 text-base">Barcodes Generated Successfully!</h4>
                <p className="text-xs text-emerald-700 mt-1">
                  Generated and linked barcodes for <strong>{bookingSuccessData.count}</strong> order(s).
                </p>
                {bookingSuccessData.errorNotice && (
                  <p className="text-[11px] text-amber-700 mt-2 bg-amber-50 p-2 rounded border border-amber-200">
                    Notice: {bookingSuccessData.errorNotice}
                  </p>
                )}
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1.5 divide-y divide-slate-100 bg-slate-50 p-3 rounded-xl border border-slate-200">
                {bookingSuccessData.results?.map((item: any, idx: number) => (
                  <div key={idx} className="pt-1.5 first:pt-0 flex items-center justify-between text-xs">
                    <span className="font-mono text-slate-600 text-[11px]">#{item.orderId.slice(-6).toUpperCase()}</span>
                    <span className="font-mono font-bold text-teal-700 bg-white px-2 py-0.5 rounded border border-teal-200">
                      {item.articleNumber}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4 pt-3 border-t border-slate-100">
            {!bookingSuccessData ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setShowIndiaPostModal(false)}
                  disabled={bookingIndiaPost}
                  className="rounded-full"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleBulkBookIndiaPost}
                  disabled={bookingIndiaPost}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-full gap-2"
                >
                  {bookingIndiaPost ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Connecting to CEPT...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate Barcodes
                    </>
                  )}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowIndiaPostModal(false)
                    setBookingSuccessData(null)
                  }}
                  className="rounded-full"
                >
                  Done
                </Button>
                <Button
                  onClick={() => {
                    setShowIndiaPostModal(false)
                    handlePrintSelected()
                  }}
                  className="bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-full gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Print Labels with Barcodes
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
