import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, getDocs, updateDoc, deleteDoc, doc, writeBatch } from "firebase/firestore";
import { formatPrice } from "@/lib/format";
import { Eye, Trash2, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/orders")({ component: OrdersAdmin });

const statusOptions = ["pending", "processing", "shipped", "delivered", "cancelled"];
const statusLabel: Record<string, string> = { pending: "قيد المراجعة", processing: "قيد التجهيز", shipped: "تم الشحن", delivered: "تم التوصيل", cancelled: "ملغي" };

function OrdersAdmin() {
  const qc = useQueryClient();
  const [view, setView] = useState<any | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");

  const { data: orders } = useQuery({
    queryKey: ["adm-orders", filter],
    queryFn: async () => {
      let q;
      if (filter !== "all") {
        q = query(collection(db, "orders"), where("status", "==", filter), orderBy("created_at", "desc"));
      } else {
        q = query(collection(db, "orders"), orderBy("created_at", "desc"));
      }
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
    },
  });

  const open = async (o: any) => {
    setView(o);
    const q = query(collection(db, "order_items"), where("order_id", "==", o.id));
    const snapshot = await getDocs(q);
    setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const changeStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, "orders", id), { status });
      toast.success("تم التحديث");
      qc.invalidateQueries({ queryKey: ["adm-orders"] });
      if (view?.id === id) setView({ ...view, status });
    } catch (err: any) {
      toast.error(err.message || "فشل التحديث");
    }
  };

  const del = async (id: string) => {
    if (!confirm("حذف الطلب؟")) return;
    try {
      const q = query(collection(db, "order_items"), where("order_id", "==", id));
      const itemsSnapshot = await getDocs(q);
      
      const batch = writeBatch(db);
      itemsSnapshot.forEach(docSnap => batch.delete(docSnap.ref));
      batch.delete(doc(db, "orders", id));
      await batch.commit();

      toast.success("تم الحذف");
      qc.invalidateQueries({ queryKey: ["adm-orders"] });
    } catch (err: any) {
      toast.error(err.message || "فشل الحذف");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold">الطلبات ({orders?.length ?? 0})</h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-input bg-background text-sm">
          <option value="all">جميع الحالات</option>
          {statusOptions.map((s) => <option key={s} value={s}>{statusLabel[s]}</option>)}
        </select>
      </div>
      <div className="bg-card border border-border rounded-2xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted"><tr><th className="p-3 text-right">الرقم</th><th className="p-3">العميل</th><th className="p-3">المبلغ</th><th className="p-3">الحالة</th><th className="p-3">التاريخ</th><th className="p-3"></th></tr></thead>
          <tbody>
            {(orders ?? []).map((o) => (
              <tr key={o.id} className="border-t border-border">
                <td className="p-3 font-bold">{o.order_number}</td>
                <td className="p-3">{o.customer_name}<div className="text-xs text-muted-foreground">{o.phone}</div></td>
                <td className="p-3 text-center text-gold font-bold">{formatPrice(o.total)}</td>
                <td className="p-3 text-center">
                  <select value={o.status} onChange={(e) => changeStatus(o.id, e.target.value)} className="px-2 py-1 rounded border border-input bg-background text-xs">
                    {statusOptions.map((s) => <option key={s} value={s}>{statusLabel[s]}</option>)}
                  </select>
                </td>
                <td className="p-3 text-center text-xs">{new Date(o.created_at).toLocaleDateString("ar")}</td>
                <td className="p-3 flex gap-1 justify-center"><button onClick={() => open(o)} className="p-2 hover:bg-accent rounded"><Eye className="w-4 h-4" /></button><button onClick={() => del(o.id)} className="p-2 hover:bg-destructive/10 text-destructive rounded"><Trash2 className="w-4 h-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {view && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setView(null)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-card border border-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center p-4 border-b border-border sticky top-0 bg-card">
              <h3 className="font-bold text-lg">طلب #{view.order_number}</h3>
              <button onClick={() => setView(null)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-muted-foreground">العميل: </span>{view.customer_name}</div>
                <div><span className="text-muted-foreground">الجوال: </span>{view.phone}</div>
                <div><span className="text-muted-foreground">المدينة: </span>{view.city}</div>
                <div><span className="text-muted-foreground">الدفع: </span>{view.payment_method}</div>
                <div className="col-span-2"><span className="text-muted-foreground">العنوان: </span>{view.address}</div>
                {view.notes && <div className="col-span-2"><span className="text-muted-foreground">ملاحظات: </span>{view.notes}</div>}
              </div>
              <div className="border-t border-border pt-3">
                <h4 className="font-bold mb-2">المنتجات</h4>
                {items.map((i) => (
                  <div key={i.id} className="flex justify-between py-1"><span>{i.product_name} × {i.quantity}</span><span>{formatPrice(i.line_total)}</span></div>
                ))}
              </div>
              <div className="border-t border-border pt-3 space-y-1">
                <div className="flex justify-between"><span>المجموع</span><span>{formatPrice(view.subtotal)}</span></div>
                <div className="flex justify-between"><span>الشحن</span><span>{formatPrice(view.shipping)}</span></div>
                <div className="flex justify-between font-bold text-gold text-lg"><span>الإجمالي</span><span>{formatPrice(view.total)}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
