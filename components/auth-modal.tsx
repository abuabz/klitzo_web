"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Mail, Phone, Lock, ArrowRight, Loader2, LogIn, Sparkles, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: "login" | "register"
  onSuccess?: (user: any) => void
}

export function AuthModal({ isOpen, onClose, initialMode = "login", onSuccess }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<string>(initialMode)
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setActiveTab(initialMode)
  }, [initialMode, isOpen])

  const [loginData, setLoginData] = useState({
    identifier: "",
    password: "",
  })

  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    mobile: "",
    password: "",
  })

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value })
  }

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value })
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsPending(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Invalid credentials")
      }

      const user = { ...data.user, isLoggedIn: true }
      localStorage.setItem("user", JSON.stringify(user))
      toast.success("Welcome back to KLITZO!")
      if (onSuccess) onSuccess(user)
      onClose()
      router.refresh()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsPending(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsPending(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Registration failed")
      }

      const user = { ...data.user, isLoggedIn: true }
      localStorage.setItem("user", JSON.stringify(user))
      toast.success("Account created successfully!")
      if (onSuccess) onSuccess(user)
      onClose()
      router.refresh()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[94%] sm:w-full sm:max-w-[480px] border-0 shadow-2xl bg-white p-0 overflow-hidden rounded-[1.5rem] sm:rounded-[2.5rem] focus:outline-none">
        <div className="flex flex-col h-full">
          {/* Top Banner Decor */}


          <div className="px-5 sm:px-8 pb-6 sm:pb-10 pt-10 sm:pt-10">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-slate-100/80 p-1 rounded-xl sm:rounded-2xl h-10 sm:h-12 mb-4 sm:mb-8">
                <TabsTrigger
                  value="login"
                  className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-teal-600 data-[state=active]:shadow-sm transition-all duration-300 font-semibold"
                >
                  <LogIn className="h-4 w-4 mr-2" /> Login
                </TabsTrigger>
                <TabsTrigger
                  value="register"
                  className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-teal-600 data-[state=active]:shadow-sm transition-all duration-300 font-semibold"
                >
                  <User className="h-4 w-4 mr-2" /> Register
                </TabsTrigger>
              </TabsList>

              <div className="mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-3xl font-black text-slate-800 tracking-tight">
                  {activeTab === "login" ? "Welcome Back!" : "Join KLITZO"}
                </h2>
                <p className="text-xs sm:text-base text-slate-500 mt-0.5 sm:mt-1">
                  {activeTab === "login" ? "Enter details to access account." : "Start your cleaning journey today."}
                </p>
              </div>

              <TabsContent value="login" className="mt-0">
                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="identifier" className="text-slate-700 font-bold ml-1 text-sm">Email or Mobile</Label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-3 h-4 w-4 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                      <Input
                        id="identifier"
                        name="identifier"
                        placeholder="Email or phone"
                        className="pl-12 h-10 sm:h-12 bg-slate-50 border-slate-200 rounded-xl sm:rounded-2xl focus:bg-white focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 transition-all text-sm sm:text-base"
                        required
                        value={loginData.identifier}
                        onChange={handleLoginChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 sm:space-y-2">
                    <div className="flex justify-between items-center ml-1">
                      <Label htmlFor="password" className="text-slate-700 font-bold text-[11px] sm:text-sm">Password</Label>
                      <button type="button" className="text-[10px] sm:text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors">Forgot?</button>
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-3 h-4 w-4 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-12 h-10 sm:h-12 bg-slate-50 border-slate-200 rounded-xl sm:rounded-2xl focus:bg-white focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 transition-all text-sm sm:text-base"
                        required
                        value={loginData.password}
                        onChange={handleLoginChange}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isPending}
                    className="w-full bg-gradient-to-r from-teal-500 to-teal-700 hover:from-teal-600 hover:to-teal-800 text-white h-12 sm:h-14 rounded-2xl mt-4 sm:mt-6 font-bold shadow-xl shadow-teal-500/20 hover:shadow-teal-500/30 transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.98]"
                  >
                    {isPending ? <Loader2 className="animate-spin mr-2" /> : <span className="flex items-center">Sign In Now <ArrowRight className="ml-2 h-5 w-5" /></span>}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register" className="mt-0">
                <form onSubmit={handleRegister} className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="username" className="text-slate-700 font-bold ml-1 text-[11px] sm:text-sm">Username</Label>
                      <div className="relative group">
                        <User className="absolute left-4 top-2.5 sm:top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                        <Input
                          id="username"
                          name="username"
                          placeholder="johndoe"
                          className="pl-12 h-9 sm:h-11 bg-slate-50 border-slate-200 rounded-xl sm:rounded-2xl focus:bg-white focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 transition-all text-sm"
                          required
                          value={registerData.username}
                          onChange={handleRegisterChange}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="email" className="text-slate-700 font-bold ml-1 text-[11px] sm:text-sm">Email</Label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-2.5 sm:top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="your@email.com"
                          className="pl-12 h-9 sm:h-11 bg-slate-50 border-slate-200 rounded-xl sm:rounded-2xl focus:bg-white focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 transition-all text-sm"
                          required
                          value={registerData.email}
                          onChange={handleRegisterChange}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="mobile" className="text-slate-700 font-bold ml-1 text-[11px] sm:text-sm">Mobile Number</Label>
                      <div className="relative group">
                        <Phone className="absolute left-4 top-2.5 sm:top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                        <Input
                          id="mobile"
                          name="mobile"
                          type="tel"
                          placeholder="9876543210"
                          className="pl-12 h-9 sm:h-11 bg-slate-50 border-slate-200 rounded-xl sm:rounded-2xl focus:bg-white focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 transition-all text-sm"
                          required
                          value={registerData.mobile}
                          onChange={handleRegisterChange}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="reg-password" className="text-slate-700 font-bold ml-1 text-[11px] sm:text-sm">Password</Label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-2.5 sm:top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                        <Input
                          id="reg-password"
                          name="password"
                          type="password"
                          placeholder="••••••••"
                          className="pl-12 h-9 sm:h-11 bg-slate-50 border-slate-200 rounded-xl sm:rounded-2xl focus:bg-white focus:ring-2 focus:ring-teal-500/10 focus:border-teal-500 transition-all text-sm"
                          required
                          value={registerData.password}
                          onChange={handleRegisterChange}
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isPending}
                    className="w-full bg-gradient-to-r from-teal-500 to-teal-700 hover:from-teal-600 hover:to-teal-800 text-white h-11 sm:h-13 rounded-xl sm:rounded-2xl mt-4 sm:mt-6 font-bold shadow-xl shadow-teal-500/20 hover:shadow-teal-500/30 transition-all duration-300 transform hover:scale-[1.01]"
                  >
                    {isPending ? <Loader2 className="animate-spin mr-2" /> : <span className="flex items-center justify-center">Create Account <CheckCircle2 className="ml-2 h-4 w-4" /></span>}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-4 sm:mt-10 hidden sm:flex items-center justify-center space-x-4 grayscale opacity-40">
              <div className="h-px w-10 bg-slate-200"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">KLITZO PREMIUM QUALITY</span>
              <div className="h-px w-10 bg-slate-200"></div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
