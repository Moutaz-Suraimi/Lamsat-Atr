import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) return toast.error(error.message);
      toast.success("تم تسجيل الدخول");
      navigate({ to: "/account" });
    } else {
      const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin, data: { full_name: name } } });
      setLoading(false);
      if (error) return toast.error(error.message);
      toast.success("تم إنشاء الحساب، يرجى التحقق من بريدك");
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-md">
      <div className="bg-card border border-border rounded-2xl p-6 shadow-luxury">
        <h1 className="text-2xl font-bold text-center text-gold mb-1">{mode === "login" ? "تسجيل الدخول" : "إنشاء حساب"}</h1>
        <p className="text-center text-muted-foreground text-sm mb-6">{mode === "login" ? "أهلًا بعودتك" : "انضم لعائلة حديقة العطور"}</p>
        <form onSubmit={submit} className="space-y-3">
          {mode === "signup" && (
            <input required placeholder="الاسم الكامل" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-3 rounded-lg border border-input bg-background" />
          )}
          <input required type="email" placeholder="البريد الإلكتروني" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-3 rounded-lg border border-input bg-background" />
          <input required type="password" placeholder="كلمة المرور" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-3 rounded-lg border border-input bg-background" minLength={6} />
          <button disabled={loading} className="w-full gradient-gold text-primary-foreground py-3 rounded-lg font-bold disabled:opacity-50">
            {loading ? "جاري..." : mode === "login" ? "دخول" : "إنشاء حساب"}
          </button>
        </form>
        <div className="text-center text-sm mt-4">
          {mode === "login" ? (
            <>ليس لديك حساب؟ <button onClick={() => setMode("signup")} className="text-gold font-bold">إنشاء حساب</button></>
          ) : (
            <>لديك حساب؟ <button onClick={() => setMode("login")} className="text-gold font-bold">تسجيل دخول</button></>
          )}
        </div>
        <Link to="/" className="block text-center text-xs text-muted-foreground mt-4 hover:text-gold">العودة للرئيسية</Link>
      </div>
    </div>
  );
}
