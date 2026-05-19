import { createFileRoute, Link } from "@tanstack/react-router";
import { useCart } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import productPlaceholder from "@/assets/product-placeholder.jpg";

export const Route = createFileRoute("/cart")({ component: Cart });

function Cart() {
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const total = useCart((s) => s.total());

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <ShoppingBag className="w-20 h-20 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">سلة التسوق فارغة</h2>
        <p className="text-muted-foreground mb-6">أضف بعض المنتجات لتبدأ التسوق</p>
        <Link to="/shop" className="inline-block gradient-gold text-primary-foreground px-6 py-3 rounded-lg font-bold">تصفّح المتجر</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gold">سلة التسوق</h1>
      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-3">
          {items.map((i) => (
            <div key={i.id} className="flex gap-4 bg-card border border-border rounded-2xl p-3">
              <img src={i.image || productPlaceholder} alt={i.name} className="w-24 h-24 object-cover rounded-lg" />
              <div className="flex-1">
                <h3 className="font-bold mb-1">{i.name}</h3>
                <p className="text-gold font-bold">{formatPrice(i.price)}</p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center border border-border rounded-lg">
                    <button onClick={() => setQty(i.id, i.quantity - 1)} className="p-1.5"><Minus className="w-3 h-3" /></button>
                    <span className="w-10 text-center text-sm font-bold">{i.quantity}</span>
                    <button onClick={() => setQty(i.id, i.quantity + 1)} className="p-1.5"><Plus className="w-3 h-3" /></button>
                  </div>
                  <button onClick={() => remove(i.id)} className="text-destructive p-2"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <aside className="bg-card border border-border rounded-2xl p-5 h-fit lg:sticky lg:top-24">
          <h3 className="font-bold text-lg mb-4">ملخص الطلب</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>المجموع الفرعي</span><span className="font-bold">{formatPrice(total)}</span></div>
            <div className="flex justify-between text-muted-foreground"><span>الشحن</span><span>يحسب لاحقًا</span></div>
            <div className="border-t border-border pt-2 flex justify-between text-lg font-bold"><span>الإجمالي</span><span className="text-gold">{formatPrice(total)}</span></div>
          </div>
          <Link to="/checkout" className="mt-4 block text-center gradient-gold text-primary-foreground py-3 rounded-lg font-bold">إتمام الشراء</Link>
          <Link to="/shop" className="mt-2 block text-center border border-border py-2 rounded-lg text-sm">متابعة التسوق</Link>
        </aside>
      </div>
    </div>
  );
}
