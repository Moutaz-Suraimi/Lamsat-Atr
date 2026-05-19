import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/format";
import { Package, ShoppingBag, Users, DollarSign } from "lucide-react";

export const Route = createFileRoute("/admin/")({ component: Dashboard });

function Dashboard() {
  const { data } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [products, orders, customers] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("total,status,created_at").order("created_at", { ascending: false }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
      ]);
      const totalRevenue = (orders.data ?? []).filter(o => o.status !== "cancelled").reduce((s, o) => s + Number(o.total), 0);
      return {
        products: products.count ?? 0,
        orders: orders.data?.length ?? 0,
        customers: customers.count ?? 0,
        revenue: totalRevenue,
        recent: (orders.data ?? []).slice(0, 8),
      };
    },
  });

  const cards = [
    { icon: Package, label: "المنتجات", value: data?.products ?? 0, color: "bg-blue-500" },
    { icon: ShoppingBag, label: "الطلبات", value: data?.orders ?? 0, color: "bg-emerald-500" },
    { icon: Users, label: "العملاء", value: data?.customers ?? 0, color: "bg-violet-500" },
    { icon: DollarSign, label: "الإيرادات", value: formatPrice(data?.revenue ?? 0), color: "bg-amber-500" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">نظرة عامة</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map((c, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-4">
            <div className={`w-10 h-10 rounded-xl ${c.color} text-white flex items-center justify-center mb-3`}><c.icon className="w-5 h-5" /></div>
            <div className="text-xs text-muted-foreground">{c.label}</div>
            <div className="text-xl font-bold mt-1">{c.value}</div>
          </div>
        ))}
      </div>
      <div className="bg-card border border-border rounded-2xl p-4">
        <h3 className="font-bold mb-3">آخر الطلبات</h3>
        <div className="space-y-2">
          {(data?.recent ?? []).map((o: any, i: number) => (
            <div key={i} className="flex justify-between items-center py-2 border-b border-border last:border-0 text-sm">
              <span>{new Date(o.created_at).toLocaleString("ar")}</span>
              <span className="px-2 py-0.5 rounded-full bg-accent text-xs">{o.status}</span>
              <span className="font-bold text-gold">{formatPrice(o.total)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
