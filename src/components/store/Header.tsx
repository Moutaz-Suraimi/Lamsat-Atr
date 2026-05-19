import { Link } from "@tanstack/react-router";
import { ShoppingCart, User, Menu, X, Search } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cart-store";
import { useAuth } from "@/hooks/use-auth";

export function Header() {
  const count = useCart((s) => s.count());
  const { user, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const nav = [
    { to: "/", label: "الرئيسية" },
    { to: "/shop", label: "المتجر" },
    { to: "/categories", label: "الأقسام" },
    { to: "/brands", label: "الماركات" },
    { to: "/incense", label: "البخور" },
    { to: "/about", label: "من نحن" },
    { to: "/contact", label: "تواصل معنا" },
  ];
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="bg-gradient-to-r from-[var(--gold-dark)] to-[var(--gold)] text-primary-foreground text-xs py-2 text-center">
        توصيل سريع 🚚 • منتجات أصلية ✅ • الدفع عند الاستلام 💳
      </div>
      <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-extrabold text-gold"> </span>  لمسة عطر </span>
        </Link>
        <nav className="hidden lg:flex items-center gap-6">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} className="text-sm font-medium hover:text-gold transition" activeProps={{ className: "text-gold" }}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link to={user ? "/account" : "/login"} className="p-2 hover:bg-accent rounded-lg" aria-label="حسابي">
            <User className="w-5 h-5" />
          </Link>
          {isAdmin && (
            <Link to="/admin" className="hidden md:inline-flex text-xs px-3 py-2 rounded-lg bg-primary text-primary-foreground">لوحة التحكم</Link>
          )}
          <Link to="/cart" className="relative p-2 hover:bg-accent rounded-lg" aria-label="السلة">
            <ShoppingCart className="w-5 h-5" />
            {count > 0 && <span className="absolute -top-1 -left-1 bg-primary text-primary-foreground text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">{count}</span>}
          </Link>
          <button className="lg:hidden p-2" onClick={() => setOpen(!open)} aria-label="القائمة">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="lg:hidden border-t border-border bg-background">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-1">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} className="py-3 px-2 hover:bg-accent rounded-lg" onClick={() => setOpen(false)}>
                {n.label}
              </Link>
            ))}
            {isAdmin && <Link to="/admin" className="py-3 px-2 bg-primary text-primary-foreground rounded-lg text-center" onClick={() => setOpen(false)}>لوحة التحكم</Link>}
          </nav>
        </div>
      )}
    </header>
  );
}
