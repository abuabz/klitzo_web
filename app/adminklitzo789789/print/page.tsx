"use client"

import React, { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"

export default function PrintPage() {
  const searchParams = useSearchParams()
  const idsParam = searchParams.get("ids")
  const ids = idsParam ? idsParam.split(",") : []

  const [orders, setOrders] = useState<any[]>([])
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const user = JSON.parse(localStorage.getItem("user") || "{}")
      if (!user.isAdmin || ids.length === 0) {
        setLoading(false)
        return
      }

      try {
        const [ordersRes, settingsRes] = await Promise.all([
          fetch(`/api/orders?all=true&email=${user.email}`),
          fetch(`/api/admin/settings?adminEmail=${user.email}`)
        ])

        if (ordersRes.ok && settingsRes.ok) {
          const ordersData = await ordersRes.json()
          const settingsData = await settingsRes.json()

          const filteredOrders = ordersData.filter((o: any) => ids.includes(o._id))
          setOrders(filteredOrders)
          setSettings(settingsData)
        }
      } catch (error) {
        console.error("Error fetching print data:", error)
      } finally {
        setLoading(false)
        // Wait a beat for rendering, then trigger print
        setTimeout(() => {
          window.print()
        }, 500)
      }
    }

    fetchData()
  }, [idsParam])

  if (loading) {
    return <div className="p-10 font-mono text-center">Loading labels...</div>
  }

  if (orders.length === 0) {
    return <div className="p-10 font-mono text-center">No orders found or unauthorized.</div>
  }

  // Chunk orders into pages of 4 (2x2 grid)
  const pages = []
  for (let i = 0; i < orders.length; i += 4) {
    pages.push(orders.slice(i, i + 4))
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          @page { size: A4 portrait; margin: 0; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white; margin: 0; padding: 0; }
          .page-break { page-break-after: always; }
          .no-print { display: none; }
        }
        @media screen {
          body { background: #f1f5f9; padding: 20px; }
          .a4-page { background: white; margin: 0 auto 20px; box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1); }
        }
        .a4-page {
          width: 210mm;
          height: 297mm;
          overflow: hidden;
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-template-rows: 1fr 1fr;
          box-sizing: border-box;
        }
        .label-cell {
          border-right: 1px dashed rgba(0, 0, 0, 0.2);
          border-bottom: 1px dashed rgba(0, 0, 0, 0.2);
          padding: 8mm 12mm;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          font-family: Arial, sans-serif;
          color: black;
        }
        .label-cell:nth-child(2n) {
          border-right: none;
        }
        .label-cell:nth-child(n+3) {
          border-bottom: none;
        }
      `}} />

      <div className="no-print text-center mb-6">
        <button
          onClick={() => window.print()}
          className="bg-teal-600 text-white px-6 py-2 rounded-full font-bold shadow-lg cursor-pointer"
        >
          Print Now
        </button>
      </div>

      {pages.map((pageOrders, pageIndex) => (
        <div key={pageIndex} className={`a4-page ${pageIndex < pages.length - 1 ? 'page-break' : ''}`}>
          {pageOrders.map((order, index) => (
            <div key={order._id} className="label-cell">

              {/* Header */}
              <div className="flex items-center justify-center mb-3 mt-4 leading-none">
                <img src="/klitzo-logo.png" alt="Klitzo" className="h-12 w-auto object-contain grayscale" />
              </div>

              {/* COD / Amount */}
              <div className="text-center font-black text-[18px] text-black mb-5 uppercase leading-none">
                CASH ON DELIVERY :- RS {order.amount}
              </div>

              {/* IDs */}
              <div className="text-[14px] leading-tight mb-1">
                CUSTOMER ID :- <span className="font-bold">{settings?.customerId || 'N/A'}</span>
              </div>
              <div className="text-[14px] leading-tight mb-1">
                CONTRACT ID:- <span className="font-bold">{settings?.contractId || 'N/A'}</span>
              </div>

              {/* Product */}
              <div className="text-[14px] leading-tight mb-6 uppercase flex flex-col">
                <span>PRODUCT NAME:-</span>
                <span className="font-bold text-[12px] italic mt-1 truncate text-slate-700">{order.productName}</span>
              </div>

              <div className="flex flex-col gap-6 flex-grow pl-2">
                {/* From Block */}
                <div className="flex gap-4">
                  <div className="font-bold text-[15px] w-12">From</div>
                  <div className="flex-1 text-[15px] leading-[1.4] text-slate-900">
                    <div>{settings?.fromName || 'Klitzo'}</div>
                    <div className="whitespace-pre-line">{settings?.fromAddress?.replace(/, /g, ',\n')}</div>
                    <div>Mob: {settings?.fromMobile}</div>
                  </div>
                </div>

                {/* To Block */}
                <div className="flex gap-4 mt-2">
                  <div className="font-bold text-[15px] w-12">To</div>
                  <div className="flex-1 text-[15px] leading-[1.4] text-slate-900">
                    <div>{order.shippingAddress?.name || order.userName}</div>
                    <div className="whitespace-pre-wrap pr-8">{order.shippingAddress?.address}</div>
                    <div>
                      {order.shippingAddress?.place} {order.shippingAddress?.post}
                    </div>
                    <div>{order.shippingAddress?.district}</div>
                    <div>{order.shippingAddress?.pincode}</div>
                    <div>Phone: {order.shippingAddress?.phone || order.userMobile}</div>
                  </div>
                </div>
              </div>

            </div>
          ))}
          {/* Fill empty cells if page has less than 4 orders */}
          {Array.from({ length: 4 - pageOrders.length }).map((_, i) => (
            <div key={`empty-${i}`} className="label-cell border-none"></div>
          ))}
        </div>
      ))}
    </>
  )
}
