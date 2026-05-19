import { createFileRoute, Link, Outlet, useNavigate, useLocation } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { LayoutDashboard, Package, ShoppingBag, Users, CreditCard, Settings, Home, LogOut } from "lucide-react";

export const Route = createFileRoute("/admin")({ component: AdminLayout });

function AdminLayout() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) navigate({ to: "/login" });
  }, [loading, user, isAdmin, navigate]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>;
  if (!user || !isAdmin) return null;

  const links = [
    { to: "/admin", icon: LayoutDashboard, label: "الرئيسية", exact: true },
    { to: "/admin/products", icon: Package, label: "المنتجات" },
    { to: "/admin/orders", icon: ShoppingBag, label: "الطلبات" },
    { to: "/admin/customers", icon: Users, label: "العملاء" },
    { to: "/admin/payments", icon: CreditCard, label: "وسائل الدفع" },
    { to: "/admin/settings", icon: Settings, label: "الإعدادات" },
  ];

  return (
    <div className="min-h-screen flex bg-muted/30">
      <aside className="w-64 bg-sidebar border-l border-border min-h-screen sticky top-0 hidden md:flex flex-col">
        <div className="p-5 border-b border-border">
          <h2 className="text-xl font-bold text-gold">لوحة التحكم</h2>
          <p className="text-xs text-muted-foreground mt-1">حديقة العطور</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {links.map((l) => {
            const active = l.exact ? location.pathname === l.to : location.pathname.startsWith(l.to);
            return (
              <Link key={l.to} to={l.to} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${active ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}>
                <l.icon className="w-4 h-4" /> {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border space-y-1">
          <Link to="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-accent"><Home className="w-4 h-4" /> العودة للمتجر</Link>
          <button onClick={() => { signOut(); navigate({ to: "/" }); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-accent text-destructive"><LogOut className="w-4 h-4" /> خروج</button>
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        {/* Mobile bar */}
        <div className="md:hidden bg-card border-b border-border p-3 flex gap-2 overflow-x-auto">
          {links.map((l) => <Link key={l.to} to={l.to} className="text-xs whitespace-nowrap px-3 py-1.5 rounded-lg bg-accent">{l.label}</Link>)}
        </div>
        <div className="p-4 md:p-6"><Outlet /></div>
      </main>
    </div>
  );
}
