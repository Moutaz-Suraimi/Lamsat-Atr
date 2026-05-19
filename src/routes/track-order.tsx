import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { formatPrice } from "@/lib/format";
import { Search } from "lucide-react";

export const Route = createFileRoute("/track-order")({
  validateSearch: (s: Record<string, unknown>) => ({ order: (s.order as string) || "" }),
  component: Track,
});

function Track() {
  const { order: initial } = Route.useSearch();
  const [num, setNum] = useState(initial);
  const [result, setResult] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);

  const search = async () => {
    setSearched(true);
    const q = query(collection(db, "orders"), where("order_number", "==", num));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const orderDoc = snapshot.docs[0];
      const data = { id: orderDoc.id, ...orderDoc.data() } as any;
      setResult(data);
      
      const itemsQ = query(collection(db, "order_items"), where("order_id", "==", orderDoc.id));
      const itemsSnapshot = await getDocs(itemsQ);
      setItems(itemsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } else {
      setResult(null);
      setItems([]);
    }
  };

  const statuses: Record<string, string> = { pending: "قيد المراجعة", processing: "قيد التجهيز", shipped: "تم الشحن", delivered: "تم التوصيل", cancelled: "ملغي" };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold text-gold mb-6 text-center">تتبّع الطلب</h1>
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex gap-2">
          <input value={num} onChange={(e) => setNum(e.target.value)} placeholder="رقم الطلب (مثال: ORD-260519-abc123)" className="flex-1 px-3 py-3 rounded-lg border border-input bg-background" />
          <button onClick={search} className="gradient-gold text-primary-foreground px-5 rounded-lg font-bold flex items-center gap-1"><Search className="w-4 h-4" /> بحث</button>
        </div>
      </div>
      {searched && !result && <p className="text-center text-muted-foreground mt-6">لم يتم العثور على الطلب</p>}
      {result && (
        <div className="mt-6 bg-card border border-border rounded-2xl p-5 space-y-3">
          <div className="flex justify-between"><span className="font-bold">{result.order_number}</span><span className="px-3 py-1 rounded-full bg-accent text-xs font-bold">{statuses[result.status] || result.status}</span></div>
          <div className="text-sm text-muted-foreground">{result.customer_name} • {result.phone}</div>
          <div className="text-sm">{result.city} - {result.address}</div>
          <div className="border-t border-border pt-3 space-y-1">
            {items.map((i) => (<div key={i.id} className="flex justify-between text-sm"><span>{i.product_name} × {i.quantity}</span><span>{formatPrice(i.line_total)}</span></div>))}
          </div>
          <div className="border-t border-border pt-3 flex justify-between font-bold text-gold text-lg"><span>الإجمالي</span><span>{formatPrice(result.total)}</span></div>
        </div>
      )}
    </div>
  );
}
