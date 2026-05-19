import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { db } from "@/lib/firebase";
import { collection, query, where, limit, getDocs } from "firebase/firestore";
import { ProductCard } from "@/components/store/ProductCard";
import { Truck, Shield, Headphones, Tag } from "lucide-react";
import heroImg from "@/assets/hero-perfume.jpg";
import incenseImg from "@/assets/incense-banner.jpg";
import giftsImg from "@/assets/gifts-banner.jpg";

export const Route = createFileRoute("/")({ component: Home });

function useProducts(filter: string) {
  return useQuery({
    queryKey: ["products", filter],
    queryFn: async () => {
      const productsRef = collection(db, "products");
      let conditions = [where("is_active", "==", true)];
      
      if (filter === "bestseller") conditions.push(where("is_bestseller", "==", true));
      if (filter === "today") conditions.push(where("is_today_offer", "==", true));
      if (filter === "new") conditions.push(where("is_new", "==", true));
      if (filter === "men") conditions.push(where("is_featured", "==", true));
      if (filter === "expert") conditions.push(where("is_expert_pick", "==", true));
      
      const q = query(productsRef, ...conditions, limit(8));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
  });
}

function Section({ title, filter, link }: { title: string; filter: string; link?: string }) {
  const { data } = useProducts(filter);
  return (
    <section className="container mx-auto px-4 py-10">
      <div className="flex items-end justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
        {link && <Link to={link} className="text-sm text-gold font-semibold">عرض الكل ←</Link>}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {(data ?? []).map((p) => <ProductCard key={p.id} p={p as any} />)}
      </div>
    </section>
  );
}

function Home() {
  const cats = [
    { label: "عرض الكل", to: "/shop" }, { label: "عروض اليوم", to: "/shop?filter=today" },
    { label: "البخور", to: "/incense" }, { label: "للجنسين", to: "/shop?cat=unisex" },
    { label: "جميع العطور", to: "/shop" }, { label: "عطور للنساء", to: "/shop?cat=women" },
    { label: "عطور للرجال", to: "/shop?cat=men" },
  ];
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-l from-[oklch(0.97_0.015_80)] to-[oklch(0.93_0.04_75)]">
        <div className="container mx-auto px-4 py-16 md:py-24 grid md:grid-cols-2 gap-8 items-center">
          <div className="text-center md:text-right">
            <h1 className="text-4xl md:text-6xl font-extrabold text-gold mb-4">حديقة العطور</h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-6">حيث تلتقي الجودة العالية بالذوق الرفيع لتمنحك حضوراً لا يُنسى</p>
            <Link to="/shop" className="inline-block gradient-gold text-primary-foreground px-8 py-3 rounded-full font-bold shadow-luxury">تسوق الآن</Link>
          </div>
          <img src={heroImg} alt="عطر فاخر" width={800} height={450} className="rounded-2xl shadow-luxury w-full" />
        </div>
      </section>

      <div className="bg-card border-y border-border overflow-x-auto">
        <div className="container mx-auto px-4 py-3 flex gap-3 whitespace-nowrap">
          {cats.map((c) => <Link key={c.label} to={c.to} className="px-4 py-2 rounded-full bg-muted hover:bg-accent text-sm font-medium">{c.label}</Link>)}
        </div>
      </div>

      <Section title="الأكثر مبيعاً" filter="bestseller" link="/shop" />

      <section className="container mx-auto px-4 py-10">
        <div className="rounded-3xl gradient-gold text-primary-foreground p-8 md:p-12 text-center shadow-luxury">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">عروض وخصومات مميزة</h2>
          <p className="opacity-90 mb-6">اكتشف أجمل العطور الأصلية بأسعار خاصة لفترة محدودة</p>
          <Link to="/shop" className="inline-block bg-white text-[var(--gold-dark)] px-8 py-3 rounded-full font-bold">تسوق العروض</Link>
        </div>
      </section>

      <Section title="عروض اليوم" filter="today" link="/shop" />
      <Section title="أحدث المنتجات" filter="new" link="/shop" />
      <Section title="عطور رجالية" filter="men" link="/shop" />

      <section className="container mx-auto px-4 py-10 grid md:grid-cols-2 gap-6">
        <Link to="/incense" className="relative rounded-3xl overflow-hidden h-64 group">
          <img src={incenseImg} alt="البخور" width={1400} height={600} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition" />
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white text-center p-6">
            <h3 className="text-3xl font-bold mb-2">عالم البخور الفاخر</h3>
            <p className="opacity-90 mb-4">روائح شرقية أصيلة تضيف لمسة فخامة</p>
            <span className="bg-white/20 backdrop-blur px-6 py-2 rounded-full">تسوق البخور</span>
          </div>
        </Link>
        <Link to="/shop?cat=gifts" className="relative rounded-3xl overflow-hidden h-64 group">
          <img src={giftsImg} alt="الهدايا" width={1400} height={600} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition" />
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white text-center p-6">
            <h3 className="text-3xl font-bold mb-2">باقات الهدايا العطرية</h3>
            <p className="opacity-90 mb-4">اختر الهدية المثالية لمن تحب</p>
            <span className="bg-white/20 backdrop-blur px-6 py-2 rounded-full">تسوق الآن</span>
          </div>
        </Link>
      </section>

      <Section title="ترشيح الخبراء" filter="expert" link="/shop" />

      <section className="container mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Headphones, t: "خدمة عملاء سريعة" },
          { icon: Tag, t: "أسعار مميزة" },
          { icon: Truck, t: "توصيل لجميع المدن" },
          { icon: Shield, t: "منتجات أصلية" },
        ].map((f) => (
          <div key={f.t} className="text-center bg-card border border-border rounded-2xl p-6">
            <f.icon className="w-10 h-10 mx-auto text-gold mb-2" />
            <div className="font-bold">{f.t}</div>
          </div>
        ))}
      </section>
    </>
  );
}
