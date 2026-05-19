import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, getDocs, addDoc, doc, setDoc, deleteDoc } from "firebase/firestore";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/settings")({ component: Settings });

function Settings() {
  const qc = useQueryClient();
  const { data: cats } = useQuery({ 
    queryKey: ["adm-cats-s"], 
    queryFn: async () => {
      const q = query(collection(db, "categories"), orderBy("sort_order"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
    } 
  });
  const { data: brands } = useQuery({ 
    queryKey: ["adm-brands-s"], 
    queryFn: async () => {
      const q = query(collection(db, "brands"), orderBy("name"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
    } 
  });
  const { data: settings } = useQuery({ 
    queryKey: ["adm-settings"], 
    queryFn: async () => {
      const snapshot = await getDocs(collection(db, "site_settings"));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
    } 
  });

  const [newCat, setNewCat] = useState({ name: "", slug: "" });
  const [newBrand, setNewBrand] = useState({ name: "", slug: "", logo_url: "" });

  const addCat = async () => {
    if (!newCat.name || !newCat.slug) return;
    try {
      await addDoc(collection(db, "categories"), newCat);
      setNewCat({ name: "", slug: "" }); 
      qc.invalidateQueries({ queryKey: ["adm-cats-s"] });
    } catch (error: any) { toast.error(error.message); }
  };
  const delCat = async (id: string) => { 
    if (!confirm("حذف؟")) return; 
    await deleteDoc(doc(db, "categories", id)); 
    qc.invalidateQueries({ queryKey: ["adm-cats-s"] }); 
  };

  const addBrand = async () => {
    if (!newBrand.name || !newBrand.slug) return;
    try {
      await addDoc(collection(db, "brands"), newBrand);
      setNewBrand({ name: "", slug: "", logo_url: "" }); 
      qc.invalidateQueries({ queryKey: ["adm-brands-s"] });
    } catch (error: any) { toast.error(error.message); }
  };
  const delBrand = async (id: string) => { 
    if (!confirm("حذف؟")) return; 
    await deleteDoc(doc(db, "brands", id)); 
    qc.invalidateQueries({ queryKey: ["adm-brands-s"] }); 
  };

  const saveSetting = async (key: string, value: string) => {
    try {
      await setDoc(doc(db, "site_settings", key), { key, value });
      toast.success("تم الحفظ"); 
      qc.invalidateQueries({ queryKey: ["adm-settings"] });
    } catch (error: any) { toast.error(error.message); }
  };

  const getS = (k: string) => settings?.find((s: any) => s.key === k)?.value ?? "";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">الإعدادات</h1>

      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="font-bold mb-4">معلومات المتجر</h3>
        <div className="grid md:grid-cols-2 gap-3">
          {[
            { k: "store_name", l: "اسم المتجر" },
            { k: "store_phone", l: "الجوال" },
            { k: "store_email", l: "البريد" },
            { k: "store_address", l: "العنوان" },
            { k: "whatsapp", l: "واتساب" },
            { k: "free_shipping_min", l: "الشحن مجاني فوق" },
          ].map((f) => (
            <div key={f.k}>
              <label className="text-xs text-muted-foreground">{f.l}</label>
              <input defaultValue={getS(f.k)} onBlur={(e) => saveSetting(f.k, e.target.value)} className="w-full px-3 py-2 rounded-lg border border-input bg-background" />
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-bold mb-3">الأقسام</h3>
          <div className="space-y-2 mb-3 max-h-64 overflow-auto">
            {(cats ?? []).map((c) => (
              <div key={c.id} className="flex justify-between items-center py-2 border-b border-border text-sm">
                <span>{c.name} <span className="text-muted-foreground text-xs">({c.slug})</span></span>
                <button onClick={() => delCat(c.id)} className="text-destructive p-1"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input placeholder="الاسم" value={newCat.name} onChange={(e) => setNewCat({ ...newCat, name: e.target.value })} className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-sm" />
            <input placeholder="slug" value={newCat.slug} onChange={(e) => setNewCat({ ...newCat, slug: e.target.value })} className="w-24 px-3 py-2 rounded-lg border border-input bg-background text-sm" />
            <button onClick={addCat} className="gradient-gold text-primary-foreground px-3 rounded-lg"><Plus className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-bold mb-3">الماركات</h3>
          <div className="space-y-2 mb-3 max-h-64 overflow-auto">
            {(brands ?? []).map((b) => (
              <div key={b.id} className="flex justify-between items-center py-2 border-b border-border text-sm">
                <span>{b.name}</span>
                <button onClick={() => delBrand(b.id)} className="text-destructive p-1"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <div className="flex gap-2">
              <input placeholder="الاسم" value={newBrand.name} onChange={(e) => setNewBrand({ ...newBrand, name: e.target.value })} className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-sm" />
              <input placeholder="slug" value={newBrand.slug} onChange={(e) => setNewBrand({ ...newBrand, slug: e.target.value })} className="w-24 px-3 py-2 rounded-lg border border-input bg-background text-sm" />
              <button onClick={addBrand} className="gradient-gold text-primary-foreground px-3 rounded-lg"><Plus className="w-4 h-4" /></button>
            </div>
            <input placeholder="رابط الشعار (اختياري)" value={newBrand.logo_url} onChange={(e) => setNewBrand({ ...newBrand, logo_url: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm" />
          </div>
        </div>
      </div>
    </div>
  );
}
