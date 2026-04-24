"use client"

import React, { useEffect, useState } from 'react'
import { MessageCircle, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from "@/components/ui/button"

const WhatsAppPage = () => {
    const [countdown, setCountdown] = useState(2)
    const phoneNumber = "918111813853"
    const message = "Hi please give me more about klitzo aluminium cleaner product"
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => (prev > 0 ? prev - 1 : 0))
        }, 1000)

        const redirectTimer = setTimeout(() => {
            window.location.href = whatsappUrl
        }, 2000)

        return () => {
            clearInterval(timer)
            clearTimeout(redirectTimer)
        }
    }, [whatsappUrl])

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-blue-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 text-center transform transition-all duration-700 animate-in fade-in zoom-in slide-in-from-bottom-10">
                    {/* WhatsApp Icon with Pulse Effect */}
                    <div className="relative mb-8 flex justify-center">
                        <div className="absolute inset-0 bg-teal-500/20 rounded-full blur-2xl animate-pulse scale-150"></div>
                        <div className="relative bg-gradient-to-br from-teal-400 to-teal-600 p-6 rounded-full shadow-lg transform transition-transform hover:scale-110 duration-300">
                            <MessageCircle className="w-16 h-16 text-white" />
                        </div>
                    </div>

                    <h1 className="text-3xl font-bold text-slate-800 mb-4 tracking-tight">
                        Connecting to WhatsApp
                    </h1>
                    
                    <p className="text-slate-600 mb-8 leading-relaxed">
                        Redirecting you to our team to learn more about the 
                        <span className="font-semibold text-teal-600"> Klitzo Aluminium Cleaner</span>.
                    </p>

                    <div className="space-y-4">
                        <div className="flex items-center justify-center gap-2 text-teal-600 font-medium">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Redirecting in {countdown}s...</span>
                        </div>

                        <Button 
                            onClick={() => window.location.href = whatsappUrl}
                            className="w-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white py-6 text-lg rounded-2xl shadow-xl hover:shadow-teal-200 transition-all duration-300 flex items-center justify-center gap-2 group"
                        >
                            Chat Now
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Button>

                        <p className="text-xs text-slate-400 mt-6">
                            If the app doesn't open automatically, click the button above.
                        </p>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="mt-12 flex justify-center gap-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
                    <img src="/klitzo-logo.png" alt="Klitzo" className="h-8 w-auto" />
                </div>
            </div>
        </div>
    )
}

export default WhatsAppPage