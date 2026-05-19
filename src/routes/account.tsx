import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { formatPrice } from "@/lib/format";
import { LogOut, User, Package } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/account")({ component: Account });

function Account() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>({ full_name: "", phone: "", address: "", city: "" });

  useEffect(() => { if (!loading && !user) navigate({ to: "/login" }); }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (data) setProfile({ full_name: data.full_name ?? "", phone: data.phone ?? "", address: data.address ?? "", city: data.city ?? "" });
    });
  }, [user]);

  const { data: orders } = useQuery({
    queryKey: ["my-orders", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("orders").select("*").eq("user_id", user!.id).order("created_at", { ascending: false })).data ?? [],
  });

  const save = async () => {
    if (!user) return;
    const { error } = await supabase.from("profiles").update({ ...profile, email: user.email }).eq("id", user.id);
    if (error) toast.error("فشل الحفظ"); else toast.success("تم الحفظ");
  };

  if (loading || !user) return <div className="container mx-auto px-4 py-20 text-center">جاري التحميل...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gold flex items-center gap-2"><User className="w-7 h-7" /> حسابي</h1>
        <button onClick={() => { signOut(); navigate({ to: "/" }); }} className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-accent text-sm">
          <LogOut className="w-4 h-4" /> خروج
        </button>
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-bold mb-4">البيانات الشخصية</h3>
          <div className="space-y-3">
            <input placeholder="الاسم الكامل" value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background" />
            <input value={user.email ?? ""} disabled className="w-full px-3 py-2 rounded-lg border border-input bg-muted" />
            <input placeholder="الجوال" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background" />
            <input placeholder="المدينة" value={profile.city} onChange={(e) => setProfile({ ...profile, city: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background" />
            <input placeholder="العنوان" value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background" />
            <button onClick={save} className="gradient-gold text-primary-foreground py-2 px-4 rounded-lg font-bold">حفظ</button>
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-bold mb-4 flex items-center gap-2"><Package className="w-5 h-5" /> طلباتي</h3>
          {(orders ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">لا توجد طلبات بعد</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-auto">
              {orders!.map((o) => (
                <div key={o.id} className="border border-border rounded-lg p-3 text-sm">
                  <div className="flex justify-between mb-1"><span className="font-bold">{o.order_number}</span><span className="text-gold font-bold">{formatPrice(o.total)}</span></div>
                  <div className="text-xs text-muted-foreground">{o.status} • {new Date(o.created_at).toLocaleDateString("ar")}</div>
                </div>
              ))}
            </div>
          )}
          <Link to="/track-order" className="block mt-4 text-center text-sm text-gold">تتبّع طلب</Link>
        </div>
      </div>
    </div>
  );
}
