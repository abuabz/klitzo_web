"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 3);
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 6);

  const formatOpts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
  const dateString = `${startDate.toLocaleDateString('en-IN', formatOpts)} to ${endDate.toLocaleDateString('en-IN', { ...formatOpts, year: 'numeric' })}`;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl mx-auto overflow-hidden shadow-2xl">
        <CardHeader className="text-center relative bg-gradient-to-b from-teal-50 to-white pb-8 pt-12 border-b border-teal-100">
          <Button variant="ghost" size="icon" onClick={() => router.push("/")} className="absolute right-4 top-4 text-teal-700 hover:bg-teal-100">
            <X className="h-5 w-5" />
          </Button>
          <div className="mx-auto w-24 h-24 bg-teal-500 text-white flex items-center justify-center rounded-full mb-6 ring-8 ring-teal-50 shadow-lg shadow-teal-200">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <CardTitle className="text-4xl font-black text-slate-800 tracking-tight">
            Order Confirmed!
          </CardTitle>
          <p className="text-teal-700 font-medium mt-3 text-lg">Thank you for your purchase.</p>
          {orderId && (
            <p className="text-slate-500 font-bold mt-2">Order ID: #{orderId.slice(-6).toUpperCase()}</p>
          )}
        </CardHeader>
        <CardContent className="space-y-8 pt-10 pb-12 px-8 text-center bg-white">
          <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-blue-500"></div>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">Delivery within 3 to 6 days</h3>
            <p className="text-2xl font-black text-slate-800">{dateString}</p>
          </div>

          <Button
            className="w-full bg-slate-900 hover:bg-slate-800 text-white py-7 rounded-2xl font-bold text-lg shadow-xl shadow-slate-200 transition-all active:scale-[0.98]"
            onClick={() => {
              router.push("/my-orders");
            }}
          >
            Track My Order
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
