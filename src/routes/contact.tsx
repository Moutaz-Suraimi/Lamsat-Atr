import { createFileRoute } from "@tanstack/react-router";
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({ component: Contact });

function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const submit = (e: React.FormEvent) => { e.preventDefault(); toast.success("تم إرسال رسالتك، سنتواصل معك قريبًا"); setForm({ name: "", email: "", message: "" }); };

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <h1 className="text-4xl font-bold text-gold text-center mb-2">تواصل معنا</h1>
      <p className="text-center text-muted-foreground mb-10">نحن هنا لمساعدتك، لا تتردد بالتواصل معنا</p>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          {[
            { i: Phone, t: "الجوال", d: "+967 777 000 000" },
            { i: Mail, t: "البريد الإلكتروني", d: "info@perfume-garden.com" },
            { i: MapPin, t: "العنوان", d: "صنعاء - شارع حدة" },
            { i: MessageCircle, t: "واتساب", d: "+967 777 000 000" },
          ].map((c, i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl gradient-gold flex items-center justify-center"><c.i className="w-5 h-5 text-primary-foreground" /></div>
              <div><div className="font-bold">{c.t}</div><div className="text-sm text-muted-foreground">{c.d}</div></div>
            </div>
          ))}
        </div>
        <form onSubmit={submit} className="bg-card border border-border rounded-2xl p-5 space-y-3">
          <input required placeholder="الاسم" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-3 rounded-lg border border-input bg-background" />
          <input required type="email" placeholder="البريد الإلكتروني" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-3 rounded-lg border border-input bg-background" />
          <textarea required placeholder="رسالتك" rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full px-3 py-3 rounded-lg border border-input bg-background" />
          <button className="w-full gradient-gold text-primary-foreground py-3 rounded-lg font-bold">إرسال الرسالة</button>
        </form>
      </div>
    </div>
  );
}
