import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/lib/cart-store";
import { useAuth } from "@/hooks/use-auth";
import { formatPrice } from "@/lib/format";
import { toast } from "sonner";
import { Copy, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/checkout")({ component: Checkout });

function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const items = useCart((s) => s.items);
  const total = useCart((s) => s.total());
  const clear = useCart((s) => s.clear);
  const shipping = total >= 500 ? 0 : 30;

  const { data: methods } = useQuery({
    queryKey: ["payment_methods"],
    queryFn: async () => (await supabase.from("payment_methods").select("*").eq("is_active", true).order("sort_order")).data ?? [],
  });

  const [form, setForm] = useState({ customer_name: "", phone: "", email: "", address: "", city: "", notes: "" });
  const [pay, setPay] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return toast.error("السلة فارغة");
    if (!pay) return toast.error("اختر طريقة الدفع");
    setLoading(true);
    const subtotal = total;
    const grand = subtotal + shipping;
    const { data: order, error } = await supabase.from("orders").insert({
      user_id: user?.id ?? null,
      ...form,
      payment_method: pay,
      subtotal, shipping, total: grand,
    }).select().single();
    if (error || !order) { setLoading(false); return toast.error("فشل إنشاء الطلب"); }
    const { error: e2 } = await supabase.from("order_items").insert(items.map((i) => ({
      order_id: order.id, product_id: i.id, product_name: i.name, product_image: i.image,
      quantity: i.quantity, unit_price: i.price, line_total: i.price * i.quantity,
    })));
    setLoading(false);
    if (e2) return toast.error("فشل إضافة المنتجات");
    clear();
    toast.success("تم إنشاء الطلب بنجاح: " + order.order_number);
    navigate({ to: "/track-order", search: { order: order.order_number } as any });
  };

  const copy = (txt: string) => { navigator.clipboard.writeText(txt); toast.success("تم النسخ"); };

  if (items.length === 0) {
    return <div className="container mx-auto px-4 py-20 text-center"><p>السلة فارغة</p></div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gold">إتمام الطلب</h1>
      <form onSubmit={submit} className="grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-bold mb-4">بيانات العميل</h3>
            <div className="grid md:grid-cols-2 gap-3">
              <input required placeholder="الاسم الكامل *" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} className="px-3 py-2 rounded-lg border border-input bg-background" />
              <input required placeholder="رقم الجوال *" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="px-3 py-2 rounded-lg border border-input bg-background" />
              <input type="email" placeholder="البريد الإلكتروني" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="px-3 py-2 rounded-lg border border-input bg-background md:col-span-2" />
              <input required placeholder="المدينة *" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="px-3 py-2 rounded-lg border border-input bg-background" />
              <input required placeholder="العنوان التفصيلي *" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="px-3 py-2 rounded-lg border border-input bg-background" />
              <textarea placeholder="ملاحظات إضافية" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="px-3 py-2 rounded-lg border border-input bg-background md:col-span-2" rows={3} />
            </div>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-bold mb-4">طريقة الدفع</h3>
            <div className="space-y-3">
              {(methods ?? []).map((m) => (
                <label key={m.id} className={`flex flex-col gap-2 p-4 rounded-xl border cursor-pointer transition ${pay === m.name ? "border-gold bg-accent" : "border-border"}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" name="pay" value={m.name} checked={pay === m.name} onChange={() => setPay(m.name)} className="accent-[var(--gold)]" />
                    <div className="flex-1">
                      <div className="font-bold">{m.name}</div>
                      {m.instructions && <div className="text-xs text-muted-foreground">{m.instructions}</div>}
                    </div>
                    {pay === m.name && <CheckCircle2 className="w-5 h-5 text-gold" />}
                  </div>
                  {pay === m.name && m.account_number && (
                    <div className="bg-background border border-border rounded-lg p-3 flex items-center justify-between">
                      <div>
                        <div className="text-xs text-muted-foreground">رقم الحساب{m.account_holder ? ` - ${m.account_holder}` : ""}</div>
                        <div className="font-bold text-lg tracking-wider">{m.account_number}</div>
                      </div>
                      <button type="button" onClick={() => copy(m.account_number!)} className="p-2 hover:bg-accent rounded-lg"><Copy className="w-4 h-4" /></button>
                    </div>
                  )}
                </label>
              ))}
            </div>
          </div>
        </div>
        <aside className="bg-card border border-border rounded-2xl p-5 h-fit lg:sticky lg:top-24">
          <h3 className="font-bold text-lg mb-4">ملخص الطلب</h3>
          <div className="space-y-2 mb-4 max-h-64 overflow-auto">
            {items.map((i) => (
              <div key={i.id} className="flex justify-between text-sm">
                <span className="line-clamp-1">{i.name} × {i.quantity}</span>
                <span className="font-bold">{formatPrice(i.price * i.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="space-y-2 text-sm border-t border-border pt-3">
            <div className="flex justify-between"><span>المجموع</span><span>{formatPrice(total)}</span></div>
            <div className="flex justify-between"><span>الشحن</span><span>{shipping === 0 ? "مجاني" : formatPrice(shipping)}</span></div>
            <div className="flex justify-between text-lg font-bold text-gold border-t border-border pt-2"><span>الإجمالي</span><span>{formatPrice(total + shipping)}</span></div>
          </div>
          <button disabled={loading} type="submit" className="mt-4 w-full gradient-gold text-primary-foreground py-3 rounded-lg font-bold disabled:opacity-50">
            {loading ? "جاري الإرسال..." : "تأكيد الطلب"}
          </button>
        </aside>
      </form>
    </div>
  );
}
