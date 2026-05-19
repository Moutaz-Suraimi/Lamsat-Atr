import { Link } from "@tanstack/react-router";
import { ShoppingCart } from "lucide-react";
import productPlaceholder from "@/assets/product-placeholder.jpg";
import { formatPrice, discountPercent } from "@/lib/format";
import { useCart } from "@/lib/cart-store";
import { toast } from "sonner";

export interface ProductCardData {
  id: string;
  name: string;
  slug: string;
  price: number;
  sale_price: number | null;
  image_url: string | null;
  is_expert_pick?: boolean | null;
}

export function ProductCard({ p }: { p: ProductCardData }) {
  const add = useCart((s) => s.add);
  const finalPrice = p.sale_price ?? p.price;
  const disc = discountPercent(p.price, p.sale_price);
  return (
    <div className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-luxury transition flex flex-col">
      <Link to="/product/$slug" params={{ slug: p.slug }} className="block relative aspect-square overflow-hidden bg-muted">
        <img src={p.image_url || productPlaceholder} alt={p.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
        {disc > 0 && <span className="absolute top-2 right-2 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-md">خصم {disc}%</span>}
        {p.is_expert_pick && <span className="absolute top-2 left-2 gradient-gold text-primary-foreground text-xs font-bold px-2 py-1 rounded-md">ترشيح الخبراء</span>}
      </Link>
      <div className="p-3 flex-1 flex flex-col">
        <Link to="/product/$slug" params={{ slug: p.slug }} className="text-sm font-semibold line-clamp-2 min-h-[2.5rem] hover:text-gold">{p.name}</Link>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-base font-bold text-gold">{formatPrice(finalPrice)}</span>
          {disc > 0 && <span className="text-xs text-muted-foreground line-through">{formatPrice(p.price)}</span>}
        </div>
        <button
          onClick={() => { add({ id: p.id, name: p.name, price: finalPrice, image: p.image_url }); toast.success("تمت إضافة المنتج للسلة"); }}
          className="mt-3 w-full gradient-gold text-primary-foreground rounded-lg py-2 text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90"
        >
          <ShoppingCart className="w-4 h-4" /> أضف للسلة
        </button>
      </div>
    </div>
  );
}
