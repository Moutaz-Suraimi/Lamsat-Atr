import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo, useDeferredValue } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { ProductCard } from "@/components/store/ProductCard";
import { Search } from "lucide-react";

export const Route = createFileRoute("/shop")({ component: Shop });

function Shop() {
  const [cat, setCat] = useState<string>("all");
  const [sort, setSort] = useState("newest");
  const [q, setQ] = useState("");

  const { data: cats } = useQuery({ 
    queryKey: ["cats"], 
    queryFn: async () => {
      const q = query(collection(db, "categories"), orderBy("sort_order"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } 
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ["shop-products", cat, sort],
    queryFn: async () => {
      const productsRef = collection(db, "products");
      let conditions: any[] = [where("is_active", "==", true)];
      
      if (cat !== "all") conditions.push(where("category_id", "==", cat));
      
      if (sort === "price_asc") conditions.push(orderBy("price", "asc"));
      else if (sort === "price_desc") conditions.push(orderBy("price", "desc"));
      else conditions.push(orderBy("created_at", "desc"));

      const q = query(productsRef, ...conditions);
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
  });

  const filtered = useMemo(() => (products ?? []).filter((p) => p.name.toLowerCase().includes(q.toLowerCase())), [products, q]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gold mb-2">المتجر</h1>
        <p className="text-muted-foreground">تصفّح جميع منتجاتنا الفاخرة</p>
      </div>
      <div className="grid lg:grid-cols-[260px_1fr] gap-6">
        <aside className="bg-card border border-border rounded-2xl p-4 h-fit lg:sticky lg:top-24">
          <div className="relative mb-4">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              value={q}
              onChange={(e) => setQ(e.target.value)} 
              placeholder="ابحث عن منتج" 
              className="w-full pr-9 pl-3 py-2 rounded-lg border border-input bg-background text-sm" 
            />
          </div>
          <h3 className="font-bold mb-2 text-sm">الأقسام</h3>
          <div className="flex flex-col gap-1">
            <button onClick={() => setCat("all")} className={`text-right px-3 py-2 rounded-lg text-sm ${cat === "all" ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}>جميع المنتجات</button>
            {(cats ?? []).map((c) => (
              <button key={c.id} onClick={() => setCat(c.id)} className={`text-right px-3 py-2 rounded-lg text-sm ${cat === c.id ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}>{c.name}</button>
            ))}
          </div>
          <h3 className="font-bold mt-4 mb-2 text-sm">الترتيب</h3>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm">
            <option value="newest">الأحدث</option>
            <option value="price_asc">السعر: من الأقل</option>
            <option value="price_desc">السعر: من الأعلى</option>
          </select>
        </aside>
        <div>
          {isLoading ? (
            <div className="text-center py-20 text-muted-foreground">جاري التحميل...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">لا توجد منتجات</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((p) => <ProductCard key={p.id} p={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
