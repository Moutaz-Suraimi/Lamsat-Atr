import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useCart } from "@/lib/cart-store";
import { formatPrice, discountPercent } from "@/lib/format";
import { useState } from "react";
import { toast } from "sonner";
import { ShoppingCart, Plus, Minus, Truck, Shield, RefreshCw } from "lucide-react";
import productPlaceholder from "@/assets/product-placeholder.jpg";

export const Route = createFileRoute("/product/$slug")({ component: ProductPage });

function ProductPage() {
  const { slug } = useParams({ from: "/product/$slug" });
  const add = useCart((s) => s.add);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<"desc" | "comp" | "use">("desc");

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const q = query(collection(db, "products"), where("slug", "==", slug));
      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as any;
    },
  });

  if (isLoading) return <div className="container mx-auto px-4 py-20 text-center">جاري التحميل...</div>;
  if (!product) return <div className="container mx-auto px-4 py-20 text-center">المنتج غير موجود <Link to="/shop" className="text-gold">العودة للمتجر</Link></div>;

  const finalPrice = product.sale_price ?? product.price;
  const disc = discountPercent(product.price, product.sale_price);

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="text-sm text-muted-foreground mb-6">
        <Link to="/" className="hover:text-gold">الرئيسية</Link> / <Link to="/shop" className="hover:text-gold">المتجر</Link> / <span className="text-foreground">{product.name}</span>
      </nav>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <img src={product.image_url || productPlaceholder} alt={product.name} className="w-full aspect-square object-cover" />
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          {product.short_description && <p className="text-muted-foreground mb-4">{product.short_description}</p>}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-bold text-gold">{formatPrice(finalPrice)}</span>
            {disc > 0 && <>
              <span className="text-lg text-muted-foreground line-through">{formatPrice(product.price)}</span>
              <span className="bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-md">خصم {disc}%</span>
            </>}
          </div>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center border border-border rounded-lg">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-2"><Minus className="w-4 h-4" /></button>
              <span className="w-12 text-center font-bold">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="p-2"><Plus className="w-4 h-4" /></button>
            </div>
            <button onClick={() => { add({ id: product.id, name: product.name, price: finalPrice, image: product.image_url }, qty); toast.success("تمت الإضافة للسلة"); }} className="flex-1 gradient-gold text-primary-foreground rounded-lg py-3 font-bold flex items-center justify-center gap-2">
              <ShoppingCart className="w-5 h-5" /> أضف للسلة
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-6 text-xs">
            <div className="flex flex-col items-center gap-1 p-3 bg-accent rounded-lg"><Truck className="w-5 h-5 text-gold" /><span>توصيل سريع</span></div>
            <div className="flex flex-col items-center gap-1 p-3 bg-accent rounded-lg"><Shield className="w-5 h-5 text-gold" /><span>منتج أصلي</span></div>
            <div className="flex flex-col items-center gap-1 p-3 bg-accent rounded-lg"><RefreshCw className="w-5 h-5 text-gold" /><span>إرجاع سهل</span></div>
          </div>
          <div className="border border-border rounded-2xl overflow-hidden">
            <div className="flex border-b border-border">
              {[{ k: "desc", l: "الوصف" }, { k: "comp", l: "المكونات" }, { k: "use", l: "طريقة الاستخدام" }].map((t) => (
                <button key={t.k} onClick={() => setTab(t.k as any)} className={`flex-1 py-3 text-sm font-bold ${tab === t.k ? "bg-accent text-gold" : ""}`}>{t.l}</button>
              ))}
            </div>
            <div className="p-4 text-sm leading-7 whitespace-pre-line">
              {tab === "desc" && (product.description || "لا يوجد وصف")}
              {tab === "comp" && (product.composition || "غير محدد")}
              {tab === "use" && (product.usage_text || "غير محدد")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
