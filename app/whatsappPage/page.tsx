"use client"

import React from 'react'
import { ArrowRight } from 'lucide-react'
import { Button } from "@/components/ui/button"

const WhatsAppPage = () => {
    const phoneNumber = "918111813853"
    const message = "Hi please give me more about klitzo aluminium cleaner product"
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-blue-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 text-center transform transition-all duration-700 animate-in fade-in zoom-in slide-in-from-bottom-10">
                    {/* WhatsApp Icon with Pulse Effect */}
                    <div className="relative mb-8 flex justify-center">
                        <div className="absolute inset-0 bg-teal-500/20 rounded-full blur-2xl animate-pulse scale-150"></div>
                        <div className="relative bg-gradient-to-br from-[#25D366] to-[#1ebe57] p-6 rounded-full shadow-lg transform transition-transform hover:scale-110 duration-300">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="w-16 h-16 text-white" fill="currentColor">
                                <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157.1zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7 .9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
                            </svg>
                        </div>
                    </div>

                    <h1 className="text-3xl font-bold text-slate-800 mb-4 tracking-tight">
                        Order Klitzo Aluminium Cleaner
                    </h1>

                    <p className="text-slate-600 mb-8 leading-relaxed">
                        Connect with our team on WhatsApp to place your order or learn more about the
                        <span className="font-semibold text-teal-600"> Klitzo Aluminium Cleaner</span>.
                    </p>

                    <div className="space-y-4">
                        <Button
                            onClick={() => window.location.href = whatsappUrl}
                            className="w-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white py-6 text-lg rounded-2xl shadow-xl hover:shadow-teal-200 transition-all duration-300 flex items-center justify-center gap-2 group"
                        >
                            Order Now WhatsApp
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
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