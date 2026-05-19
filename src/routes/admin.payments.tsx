import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, getDocs, doc, setDoc, addDoc, deleteDoc } from "firebase/firestore";
import { Plus, Edit2, Trash2, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/payments")({ component: Payments });

const empty = { name: "", type: "wallet", account_number: "", account_holder: "", instructions: "", sort_order: 0, is_active: true };

function Payments() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any | null>(null);
  const { data } = useQuery({ 
    queryKey: ["adm-pay"], 
    queryFn: async () => {
      const q = query(collection(db, "payment_methods"), orderBy("sort_order"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
    } 
  });

  const save = async () => {
    if (!editing.name) return toast.error("الاسم مطلوب");
    const p = { ...editing };
    delete p.created_at;
    p.sort_order = Number(p.sort_order || 0);
    
    try {
      if (editing.id) {
        await setDoc(doc(db, "payment_methods", editing.id), p, { merge: true });
      } else {
        await addDoc(collection(db, "payment_methods"), p);
      }
      toast.success("تم الحفظ");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["adm-pay"] });
    } catch (err: any) {
      toast.error(err.message || "فشل الحفظ");
    }
  };

  const del = async (id: string) => {
    if (!confirm("حذف؟")) return;
    try {
      await deleteDoc(doc(db, "payment_methods", id));
      qc.invalidateQueries({ queryKey: ["adm-pay"] });
      toast.success("تم الحذف");
    } catch (err: any) {
      toast.error(err.message || "فشل الحذف");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">وسائل الدفع</h1>
        <button onClick={() => setEditing({ ...empty })} className="gradient-gold text-primary-foreground px-4 py-2 rounded-lg font-bold flex items-center gap-2"><Plus className="w-4 h-4" /> جديد</button>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        {(data ?? []).map((m) => (
          <div key={m.id} className="bg-card border border-border rounded-2xl p-4">
            <div className="flex justify-between items-start mb-2">
              <div><div className="font-bold">{m.name}</div><div className="text-xs text-muted-foreground">{m.type}</div></div>
              <div className="flex gap-1">
                <button onClick={() => setEditing(m)} className="p-2 hover:bg-accent rounded"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => del(m.id)} className="p-2 hover:bg-destructive/10 text-destructive rounded"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            {m.account_number && <div className="text-sm mt-2"><span className="text-muted-foreground">الرقم: </span><span className="font-bold">{m.account_number}</span></div>}
            {m.account_holder && <div className="text-xs text-muted-foreground">{m.account_holder}</div>}
            <div className="mt-2"><span className={`text-xs px-2 py-0.5 rounded-full ${m.is_active ? "bg-emerald-100 text-emerald-700" : "bg-muted"}`}>{m.is_active ? "مفعّل" : "معطل"}</span></div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-card rounded-2xl max-w-md w-full">
            <div className="flex justify-between items-center p-4 border-b border-border"><h3 className="font-bold">{editing.id ? "تعديل" : "جديد"}</h3><button onClick={() => setEditing(null)}><X className="w-5 h-5" /></button></div>
            <div className="p-4 space-y-3">
              <input placeholder="الاسم" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background" />
              <select value={editing.type} onChange={(e) => setEditing({ ...editing, type: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background">
                <option value="wallet">محفظة</option><option value="bank">بنك</option><option value="exchange">صرافة</option><option value="cod">عند الاستلام</option>
              </select>
              <input placeholder="رقم الحساب" value={editing.account_number ?? ""} onChange={(e) => setEditing({ ...editing, account_number: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background" />
              <input placeholder="اسم صاحب الحساب" value={editing.account_holder ?? ""} onChange={(e) => setEditing({ ...editing, account_holder: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background" />
              <textarea placeholder="تعليمات" value={editing.instructions ?? ""} onChange={(e) => setEditing({ ...editing, instructions: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background" rows={2} />
              <input type="number" placeholder="ترتيب" value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background" />
              <label className="flex items-center gap-2"><input type="checkbox" checked={editing.is_active} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} /> مفعّل</label>
              <button onClick={save} className="w-full gradient-gold text-primary-foreground py-2 rounded-lg font-bold">حفظ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
