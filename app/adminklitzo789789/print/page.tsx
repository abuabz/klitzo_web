"use client"

import React, { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { generateBarcodeSvg } from "@/lib/barcode"

function PrintContent() {
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
        const ordersPromises = ids.map(id => fetch(`/api/orders?id=${id}`).then(r => r.json()))
        
        const [ordersData, settingsRes] = await Promise.all([
          Promise.all(ordersPromises),
          fetch(`/api/admin/settings?adminEmail=${user.email}`)
        ])

        if (settingsRes.ok) {
          const settingsData = await settingsRes.json()
          setOrders(ordersData.filter(o => o && !o.error))
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
          padding: 3mm 4mm;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          font-family: Arial, Helvetica, sans-serif;
          color: black;
          height: 148.5mm;
          overflow: hidden;
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
              <div className="border-2 border-black w-full h-full flex flex-col justify-between bg-white text-black font-sans box-border overflow-hidden">
                {/* 1. Header: Logo & Barcode */}
                <div className="flex items-center justify-between p-2 min-h-[72px]">
                  <div className="flex items-center pl-1 shrink-0 mr-2">
                    <img src="/klitzo-logo.png" alt="KLITZO" className="h-8 w-auto max-w-[110px] object-contain" />
                  </div>
                  {order.trackingId ? (
                    <div className="flex items-center justify-end overflow-hidden">
                      <div 
                        dangerouslySetInnerHTML={{ __html: generateBarcodeSvg(order.trackingId, 50, 1.6) }}
                        className="flex justify-end"
                      />
                    </div>
                  ) : (
                    <div className="text-[11px] font-bold text-black border border-black px-2 py-1 mr-1 uppercase">
                      India Post
                    </div>
                  )}
                </div>

                {/* 2. Customer ID, Contract ID & Payment Status */}
                <div className="border-t-2 border-black px-2.5 py-2 flex items-center justify-between">
                  <div className="shrink-0">
                    <div className="font-extrabold text-[12.5px] text-black leading-tight">
                      Customer ID: <span className="font-black">{settings?.customerId || '1683565443'}</span>
                    </div>
                    <div className="font-bold text-[10.5px] text-black leading-tight mt-0.5">
                      CONTRACT ID:{settings?.contractId || '41132043'}
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-center text-right pl-2">
                    {(order.paymentMethod === 'Prepaid' || order.razorpayPaymentId) ? (
                      <span className="font-black text-[17px] text-black uppercase tracking-wider">
                        PRE PAID
                      </span>
                    ) : (
                      <>
                        <span className="font-black text-[14.5px] text-black uppercase tracking-wider leading-tight whitespace-nowrap">
                          CASH ON DELIVERY
                        </span>
                        <span className="font-black text-[21px] text-black uppercase tracking-tight leading-none mt-1 whitespace-nowrap">
                          RS. {order.amount}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* 3. Ship To Section */}
                <div className="border-t-2 border-black p-2.5 text-[11.5px] leading-[1.35] text-black">
                  <div className="font-extrabold text-[12px] mb-0.5 text-black">
                    Ship To:
                  </div>
                  <div className="font-black text-[13px] text-black">
                    {order.shippingAddress?.name || order.userName}
                  </div>
                  <div className="text-black font-medium">
                    {order.shippingAddress?.address}
                  </div>
                  {(order.shippingAddress?.place || order.shippingAddress?.post) && (
                    <div className="text-black font-medium">
                      {order.shippingAddress?.place} {order.shippingAddress?.post ? `PO: ${order.shippingAddress.post}` : ''}
                    </div>
                  )}
                  {order.shippingAddress?.district && (
                    <div className="text-black font-medium">
                      {order.shippingAddress?.district}, {order.shippingAddress?.state || "Kerala"}
                    </div>
                  )}
                  <div className="font-black text-black mt-0.5">
                    {order.shippingAddress?.pincode}, India, Mobile: {order.shippingAddress?.phone || order.userMobile}
                  </div>
                </div>

                {/* 4. From/ Return Address Section */}
                <div className="border-t-2 border-black p-2.5 text-[11px] leading-[1.3] text-black">
                  <div className="font-extrabold text-[12px] mb-0.5 text-black">
                    From/ Return Address
                  </div>
                  <div className="font-black text-black">
                    {settings?.fromName || 'Klitzo'}
                  </div>
                  <div className="font-bold text-black">
                    Klitzo
                  </div>
                  <div className="text-black font-medium whitespace-pre-line">
                    {settings?.fromAddress || 'Al jaseera trade city\nInkel city, Melmuri\nMALAPPURAM, Kerala, 676519, India'}
                  </div>
                  <div className="text-black font-bold">
                    Ph: {settings?.fromMobile || '+91 81118 13853'}
                  </div>
                </div>

                {/* 5. Product Items Table */}
                <div className="border-t-2 border-black mt-auto">
                  {(() => {
                    const formatFullProductName = (name: string, variant?: string) => {
                      let n = (name || "").trim();
                      if (variant && variant !== "Standard") {
                        if (!n.toLowerCase().includes(variant.toLowerCase())) {
                          n = `${n} (${variant})`;
                        }
                      }
                      return n;
                    };

                    const getPrintItems = (ord: any) => {
                      if (ord.items && Array.isArray(ord.items) && ord.items.length > 0) {
                        return ord.items.map((it: any) => ({
                          name: formatFullProductName(it.productName || it.name, it.variantSize),
                          quantity: it.quantity || 1,
                          price: it.price || (ord.amount ? Math.round(ord.amount / ord.items.length) : undefined),
                          weight: it.weight || 220,
                        }));
                      }
                      if ((ord.productName || "").includes(",")) {
                        const parts = ord.productName.split(",");
                        return parts.map((pStr: string) => {
                          const match = pStr.trim().match(/^(.*?)(?:\s*(?:x|×|QTY:?)\s*(\d+))?$/i);
                          return {
                            name: formatFullProductName(match ? match[1].trim() : pStr.trim()),
                            quantity: match && match[2] ? parseInt(match[2], 10) : 1,
                            price: ord.amount ? Math.round(ord.amount / parts.length) : undefined,
                            weight: 220,
                          };
                        });
                      }
                      const match = (ord.productName || "").trim().match(/^(.*?)(?:\s*(?:x|×|QTY:?)\s*(\d+))?$/i);
                      return [{
                        name: formatFullProductName(match && match[2] ? match[1].trim() : (ord.productName || "Product")),
                        quantity: match && match[2] ? parseInt(match[2], 10) : (ord.quantity || 1),
                        price: ord.amount || undefined,
                        weight: 220,
                      }];
                    };

                    const itemsList = getPrintItems(order);

                    return (
                      <table className="w-full border-collapse text-left text-[10px]">
                        <thead>
                          <tr className="border-b border-black bg-slate-50">
                            <th className="font-bold text-black py-1 px-2 text-left">Product name</th>
                            <th className="font-bold text-black py-1 px-1 text-center w-10">Qty</th>
                            <th className="font-bold text-black py-1 px-1 text-center w-16">Weight (g)</th>
                            <th className="font-bold text-black py-1 px-2 text-right w-20">Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          {itemsList.map((it: any, itIdx: number) => (
                            <tr key={itIdx} className="border-b border-slate-200 last:border-b-0">
                              <td className="py-1 px-2 font-medium text-black uppercase break-words leading-tight">
                                {it.name}
                              </td>
                              <td className="py-1 px-1 text-center font-bold text-black align-top">
                                {it.quantity || 1}
                              </td>
                              <td className="py-1 px-1 text-center font-medium text-black align-top">
                                {it.weight ? `${it.weight}g` : '220g'}
                              </td>
                              <td className="py-1 px-2 text-right font-bold text-black align-top whitespace-nowrap">
                                Rs. {it.price ? (it.price * (it.quantity || 1)).toFixed(2) : ((order.amount || 0) / (itemsList.length || 1)).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    );
                  })()}
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

export default function PrintPage() {
  return (
    <Suspense fallback={<div className="p-10 font-mono text-center">Loading printing interface...</div>}>
      <PrintContent />
    </Suspense>
  )
}
