import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/brands")({ component: Brands });

function Brands() {
  const { data } = useQuery({ queryKey: ["brands"], queryFn: async () => (await supabase.from("brands").select("*").order("name")).data ?? [] });
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gold mb-2 text-center">الماركات</h1>
      <p className="text-center text-muted-foreground mb-8">أبرز ماركات العطور لدينا</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(data ?? []).map((b) => (
          <Link to="/shop" key={b.id} className="aspect-square bg-card border border-border rounded-2xl flex flex-col items-center justify-center hover:shadow-luxury transition p-4">
            {b.logo_url ? <img src={b.logo_url} alt={b.name} className="max-h-20 object-contain mb-2" /> : <div className="w-16 h-16 rounded-full gradient-gold flex items-center justify-center text-2xl font-bold text-primary-foreground mb-2">{b.name[0]}</div>}
            <span className="font-bold text-sm text-center">{b.name}</span>
          </Link>
        ))}
        {(!data || data.length === 0) && <p className="col-span-full text-center text-muted-foreground py-12">لا توجد ماركات بعد</p>}
      </div>
    </div>
  );
}
