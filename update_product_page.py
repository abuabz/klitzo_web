import re

with open("app/product/[id]/page.tsx", "r") as f:
    content = f.read()

# Remove data.json import
content = content.replace('import products from "@/lib/data.json"', '')

# Update state and fetch
new_state = """  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedVariant, setSelectedVariant] = useState<any>(null)

  useEffect(() => {
    setIsVisible(true)
    fetch(`/api/products?id=${productId}`)
      .then(res => {
        if (!res.ok) throw new Error("Not found")
        return res.json()
      })
      .then(data => {
        setProduct(data)
        if (data.variants && data.variants.length > 0) {
            setSelectedVariant(data.variants[0])
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [productId])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div></div>
  }
"""

content = re.sub(
    r'  const \[isVisible, setIsVisible\] = useState\(false\).*?const product = products.find\(\(p\) => p\.id === productId\)',
    '  const [isVisible, setIsVisible] = useState(false)\n' + new_state,
    content,
    flags=re.DOTALL
)

# Replace variants section
variants_section = """
                {product.variants && product.variants.length > 0 && (
                  <div className="space-y-3 pb-2 border-b border-slate-100 mb-4">
                    <h3 className="text-lg text-slate-800">
                      Size: <span className="font-bold">{selectedVariant?.size || "Standard"}</span>
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {product.variants.map((variant: any, idx: number) => {
                        const isSelected = selectedVariant?.sku === variant.sku || selectedVariant?.size === variant.size
                        return (
                          <div 
                            key={idx} 
                            onClick={() => {
                              setSelectedVariant(variant)
                              if (variant.image) {
                                // If variant has a specific image, try to find its index in product.images or just use it directly
                                const imgIdx = product.images?.indexOf(variant.image)
                                if (imgIdx !== -1 && imgIdx !== undefined) {
                                    setSelectedImage(imgIdx)
                                }
                              }
                            }}
                            className={`border-2 rounded-xl p-3 cursor-pointer transition-all duration-200 bg-white hover:shadow-md ${
                              isSelected ? "border-blue-600 shadow-sm" : "border-slate-200 hover:border-slate-300"
                            } flex flex-col min-w-[140px]`}
                          >
                            <div className="h-16 w-full mb-2 flex items-center justify-center bg-transparent rounded-lg">
                              <img
                                src={variant.image || product.images?.[0] || product.image || "/placeholder.svg"}
                                alt={variant.size}
                                className="max-h-full max-w-full object-contain"
                              />
                            </div>
                            <div className="text-sm font-semibold text-slate-800">
                              {variant.size || variant.sku}
                            </div>
                            <div className="text-sm font-bold text-slate-800 mt-1">₹{variant.price}</div>
                            {variant.originalPrice && (
                              <div className="text-xs text-slate-400 line-through">₹{variant.originalPrice}</div>
                            )}
                            {variant.stock > 0 ? (
                              <div className="text-xs text-green-600 font-medium mt-1">In stock</div>
                            ) : (
                              <div className="text-xs text-red-500 font-medium mt-1">Out of stock</div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
"""

content = re.sub(
    r'\{variants\.length > 1 && \(.*?\)\s*\}',
    variants_section.strip(),
    content,
    flags=re.DOTALL
)

# Fix variables
content = content.replace('const baseName = product.name.replace(/\s*\d+ml$/i, "")', '')
content = content.replace('const variants = products.filter((p) => p.name.replace(/\s*\d+ml$/i, "") === baseName)', '')

content = content.replace('product.images[selectedImage]', '((product.images && product.images[selectedImage]) || selectedVariant?.image || product.image)')
content = content.replace('product.images.map', '(product.images || []).map')

# Price display fix
price_block = """
                <div className="flex items-center flex-wrap gap-2 sm:gap-4">
                  <span className="text-3xl font-bold text-teal-600">
                    ₹{Number.parseFloat(String(selectedVariant?.price || product.price).replace(/[^\d.]/g, "")).toFixed(2)}
                  </span>
                  {(selectedVariant?.originalPrice || product.originalPrice) && (
                    <span className="text-xl text-slate-400 line-through">₹{selectedVariant?.originalPrice || product.originalPrice}</span>
                  )}
                  {(selectedVariant?.originalPrice || product.originalPrice) && (
                    <Badge className="bg-red-100 text-red-800">
                      Save ₹
                      {(
                        Number.parseFloat(String(selectedVariant?.originalPrice || product.originalPrice).replace(/[^\d.]/g, "")) - Number.parseFloat(String(selectedVariant?.price || product.price).replace(/[^\d.]/g, ""))
                      ).toFixed(2)}
                    </Badge>
                  )}
                  {product.specialOffer && (
                    <Badge className="bg-yellow-100 text-yellow-800 animate-pulse">
                      Special Offer: {product.specialOffer}
                    </Badge>
                  )}
                </div>
"""

content = re.sub(
    r'<div className="flex items-center flex-wrap gap-2 sm:gap-4">.*?</div>',
    price_block.strip(),
    content,
    flags=re.DOTALL
)

# Buy Now price fix
content = re.sub(
    r'Buy Now - ₹\s*\{\(Number\.parseFloat\(product\.price\.replace\(\/\[\^\\d\.\]\/g, ""\)\) \* quantity\)\.toFixed\(2\)\}',
    'Buy Now - ₹{(Number.parseFloat(String(selectedVariant?.price || product.price).replace(/[^\\d.]/g, "")) * quantity).toFixed(2)}',
    content
)


# Purchase form props fix
purchase_form = """<PurchaseForm
              product={{
                id: product.id,
                name: product.name + (selectedVariant ? ` - ${selectedVariant.size}` : ''),
                price: selectedVariant?.price || product.price,
                image: selectedVariant?.image || product.images?.[0] || product.image,
              }}"""
content = re.sub(
    r'<PurchaseForm\s*product=\{\{\s*id: product\.id,\s*name: product\.name,\s*price: product\.price,\s*image: product\.images\[0\],\s*\}\}',
    purchase_form,
    content
)


# Fallback for undefined properties (features, specifications, howToUse, safetyAndUsageNotes, applicationGuide)
content = content.replace('product.features.slice', '(product.features || []).slice')
content = content.replace('product.features.map', '(product.features || []).map')
content = content.replace('Object.entries(product.specifications)', 'Object.entries(product.specifications || {})')
content = content.replace('product.howToUse.map', '(product.howToUse || []).map')
content = content.replace('product.safetyAndUsageNotes.map', '(product.safetyAndUsageNotes || []).map')
content = content.replace('product.applicationGuide.map', '(product.applicationGuide || []).map')


with open("app/product/[id]/page.tsx", "w") as f:
    f.write(content)

