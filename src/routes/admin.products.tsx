import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, getDocs, addDoc, doc, setDoc, deleteDoc } from "firebase/firestore";
import { formatPrice } from "@/lib/format";
import { Plus, Edit2, Trash2, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/products")({ component: ProductsAdmin });

const empty = { name: "", slug: "", short_description: "", description: "", price: 0, sale_price: null as any, stock: 0, category_id: null as any, brand_id: null as any, image_url: "", is_active: true, is_bestseller: false, is_new: false, is_today_offer: false, is_expert_pick: false };

function ProductsAdmin() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any | null>(null);

  const { data: products } = useQuery({ 
    queryKey: ["adm-products"], 
    queryFn: async () => {
      const q = query(collection(db, "products"), orderBy("created_at", "desc"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
    } 
  });
  const { data: cats } = useQuery({ 
    queryKey: ["adm-cats"], 
    queryFn: async () => {
      const snapshot = await getDocs(collection(db, "categories"));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
    } 
  });
  const { data: brands } = useQuery({ 
    queryKey: ["adm-brands"], 
    queryFn: async () => {
      const snapshot = await getDocs(collection(db, "brands"));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
    } 
  });

  const save = async () => {
    if (!editing.name || !editing.slug || !editing.price) return toast.error("اسم، رابط، سعر مطلوبة");
    const payload = { ...editing };
    delete payload.created_at; delete payload.updated_at;
    if (payload.sale_price === "" || payload.sale_price === null) payload.sale_price = null;
    else payload.sale_price = Number(payload.sale_price);
    payload.price = Number(payload.price);
    payload.stock = Number(payload.stock || 0);
    
    try {
      if (editing.id) {
        payload.updated_at = new Date().toISOString();
        await setDoc(doc(db, "products", editing.id), payload, { merge: true });
      } else {
        payload.created_at = new Date().toISOString();
        payload.updated_at = new Date().toISOString();
        await addDoc(collection(db, "products"), payload);
      }
      toast.success("تم الحفظ");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["adm-products"] });
    } catch (err: any) {
      toast.error(err.message || "فشل الحفظ");
    }
  };

  const del = async (id: string) => {
    if (!confirm("حذف المنتج؟")) return;
    try {
      await deleteDoc(doc(db, "products", id));
      toast.success("تم الحذف");
      qc.invalidateQueries({ queryKey: ["adm-products"] });
    } catch (error: any) {
      toast.error(error.message || "فشل الحذف");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">المنتجات ({products?.length ?? 0})</h1>
        <button onClick={() => setEditing({ ...empty })} className="gradient-gold text-primary-foreground px-4 py-2 rounded-lg font-bold flex items-center gap-2"><Plus className="w-4 h-4" /> منتج جديد</button>
      </div>
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr><th className="p-3 text-right">المنتج</th><th className="p-3">السعر</th><th className="p-3">المخزون</th><th className="p-3">حالة</th><th className="p-3"></th></tr>
            </thead>
            <tbody>
              {(products ?? []).map((p) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="p-3 flex items-center gap-2"><img src={p.image_url || "/placeholder.svg"} className="w-10 h-10 rounded object-cover" alt="" /><div><div className="font-bold">{p.name}</div><div className="text-xs text-muted-foreground">{p.slug}</div></div></td>
                  <td className="p-3 text-center">{formatPrice(p.sale_price ?? p.price)}</td>
                  <td className="p-3 text-center">{p.stock}</td>
                  <td className="p-3 text-center"><span className={`px-2 py-0.5 rounded-full text-xs ${p.is_active ? "bg-emerald-100 text-emerald-700" : "bg-muted"}`}>{p.is_active ? "نشط" : "متوقف"}</span></td>
                  <td className="p-3 flex gap-1 justify-center"><button onClick={() => setEditing(p)} className="p-2 hover:bg-accent rounded"><Edit2 className="w-4 h-4" /></button><button onClick={() => del(p.id)} className="p-2 hover:bg-destructive/10 text-destructive rounded"><Trash2 className="w-4 h-4" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-card border border-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center p-4 border-b border-border sticky top-0 bg-card">
              <h3 className="font-bold text-lg">{editing.id ? "تعديل منتج" : "منتج جديد"}</h3>
              <button onClick={() => setEditing(null)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 grid md:grid-cols-2 gap-3">
              <input placeholder="الاسم *" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="px-3 py-2 rounded-lg border border-input bg-background md:col-span-2" />
              <input placeholder="الرابط (slug) *" value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} className="px-3 py-2 rounded-lg border border-input bg-background md:col-span-2" />
              <input placeholder="رابط الصورة" value={editing.image_url ?? ""} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} className="px-3 py-2 rounded-lg border border-input bg-background md:col-span-2" />
              <input type="number" placeholder="السعر *" value={editing.price} onChange={(e) => setEditing({ ...editing, price: e.target.value })} className="px-3 py-2 rounded-lg border border-input bg-background" />
              <input type="number" placeholder="سعر التخفيض" value={editing.sale_price ?? ""} onChange={(e) => setEditing({ ...editing, sale_price: e.target.value })} className="px-3 py-2 rounded-lg border border-input bg-background" />
              <input type="number" placeholder="المخزون" value={editing.stock} onChange={(e) => setEditing({ ...editing, stock: e.target.value })} className="px-3 py-2 rounded-lg border border-input bg-background" />
              <select value={editing.category_id ?? ""} onChange={(e) => setEditing({ ...editing, category_id: e.target.value || null })} className="px-3 py-2 rounded-lg border border-input bg-background">
                <option value="">-- القسم --</option>
                {(cats ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <select value={editing.brand_id ?? ""} onChange={(e) => setEditing({ ...editing, brand_id: e.target.value || null })} className="px-3 py-2 rounded-lg border border-input bg-background md:col-span-2">
                <option value="">-- الماركة --</option>
                {(brands ?? []).map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              <textarea placeholder="وصف قصير" value={editing.short_description ?? ""} onChange={(e) => setEditing({ ...editing, short_description: e.target.value })} className="px-3 py-2 rounded-lg border border-input bg-background md:col-span-2" rows={2} />
              <textarea placeholder="الوصف الكامل" value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="px-3 py-2 rounded-lg border border-input bg-background md:col-span-2" rows={4} />
              <div className="md:col-span-2 flex flex-wrap gap-3 text-sm">
                {[
                  { k: "is_active", l: "نشط" },
                  { k: "is_bestseller", l: "الأكثر مبيعًا" },
                  { k: "is_new", l: "جديد" },
                  { k: "is_today_offer", l: "عرض اليوم" },
                  { k: "is_expert_pick", l: "ترشيح الخبراء" },
                ].map((f) => (
                  <label key={f.k} className="flex items-center gap-2"><input type="checkbox" checked={!!editing[f.k]} onChange={(e) => setEditing({ ...editing, [f.k]: e.target.checked })} /> {f.l}</label>
                ))}
              </div>
            </div>
            <div className="p-4 border-t border-border flex gap-2 sticky bottom-0 bg-card">
              <button onClick={save} className="flex-1 gradient-gold text-primary-foreground py-2 rounded-lg font-bold">حفظ</button>
              <button onClick={() => setEditing(null)} className="px-4 border border-border rounded-lg">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
