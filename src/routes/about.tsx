import { createFileRoute } from "@tanstack/react-router";
import { Award, Heart, Sparkles } from "lucide-react";

export const Route = createFileRoute("/about")({ component: About });

function About() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold text-gold text-center mb-4">من نحن</h1>
      <p className="text-center text-muted-foreground mb-10">حديقة العطور — وجهتك الأولى للعطور والبخور الفاخر</p>
      <div className="bg-card border border-border rounded-2xl p-6 leading-8 mb-8">
        تأسّست حديقة العطور بشغف العطر الأصيل وتقديم تجربة فريدة لعملائنا الكرام، نوفّر لكم تشكيلة واسعة من أرقى العطور الشرقية والعالمية، وأجود أنواع البخور والعود من مصادرها الأصلية. حرصنا منذ البداية على أن نكون شريككم في كل مناسبة، بمنتجات أصلية 100% وتوصيل سريع وخدمة عملاء على مدار الساعة.
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { i: Award, t: "جودة عالية", d: "منتجات أصلية مختارة بعناية" },
          { i: Heart, t: "خدمة مميزة", d: "فريق متخصص لخدمتكم" },
          { i: Sparkles, t: "تشكيلة واسعة", d: "أكثر من 100 منتج فاخر" },
        ].map((x, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-5 text-center">
            <x.i className="w-10 h-10 mx-auto text-gold mb-3" />
            <h3 className="font-bold mb-1">{x.t}</h3>
            <p className="text-sm text-muted-foreground">{x.d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
