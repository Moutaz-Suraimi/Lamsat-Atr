import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { ProductCard } from "@/components/store/ProductCard";
import incense from "@/assets/incense-banner.jpg";

export const Route = createFileRoute("/incense")({ component: Incense });

function Incense() {
  const { data: cat } = useQuery({ 
    queryKey: ["incense-cat"], 
    queryFn: async () => {
      const q = query(collection(db, "categories"), where("slug", "==", "incense"));
      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;
      return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as any;
    } 
  });
  
  const { data: products } = useQuery({
    queryKey: ["incense-products", cat?.id],
    enabled: !!cat?.id,
    queryFn: async () => {
      const q = query(collection(db, "products"), where("category_id", "==", cat!.id), where("is_active", "==", true));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
    }
  });
  return (
    <div>
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img src={incense} alt="بخور" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-l from-black/70 to-transparent flex items-center">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-white">البخور والعود</h1>
            <p className="text-white/80 mt-2">أجود أنواع البخور والعود من مصادرها الأصلية</p>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {(products ?? []).map((p) => <ProductCard key={p.id} p={p} />)}
          {(!products || products.length === 0) && <p className="col-span-full text-center text-muted-foreground py-12">لا توجد منتجات حاليًا</p>}
        </div>
      </div>
    </div>
  );
}
