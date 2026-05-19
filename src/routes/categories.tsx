import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, getDocs } from "firebase/firestore";

export const Route = createFileRoute("/categories")({ component: Categories });

function Categories() {
  const { data } = useQuery({ 
    queryKey: ["all-cats"], 
    queryFn: async () => {
      const q = query(collection(db, "categories"), orderBy("sort_order"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
    } 
  });
  const colors = ["from-amber-500 to-yellow-600", "from-rose-500 to-pink-600", "from-emerald-500 to-teal-600", "from-violet-500 to-purple-600", "from-blue-500 to-cyan-600", "from-orange-500 to-red-600"];
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gold mb-2 text-center">الأقسام</h1>
      <p className="text-center text-muted-foreground mb-8">تصفّح حسب الفئة</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {(data ?? []).map((c, i) => (
          <Link to="/shop" key={c.id} className={`aspect-[4/3] rounded-2xl bg-gradient-to-br ${colors[i % colors.length]} flex items-center justify-center text-white font-bold text-2xl hover:scale-105 transition shadow-luxury`}>
            {c.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
