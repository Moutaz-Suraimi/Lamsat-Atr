import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup" | "magic-link">("login");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let email = window.localStorage.getItem('emailForSignIn');
      if (!email) {
        email = window.prompt("يرجى إدخال بريدك الإلكتروني للتأكيد:");
      }
      if (email) {
        setLoading(true);
        signInWithEmailLink(auth, email, window.location.href)
          .then(async (result) => {
            window.localStorage.removeItem('emailForSignIn');
            if (result.additionalUserInfo?.isNewUser) {
              await setDoc(doc(db, "profiles", result.user.uid), {
                id: result.user.uid,
                email: result.user.email,
                full_name: "",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
            }
            toast.success("تم تسجيل الدخول بنجاح");
            navigate({ to: "/account" });
          })
          .catch((error) => {
            toast.error(error.message || "الرابط غير صالح أو منتهي الصلاحية");
          })
          .finally(() => setLoading(false));
      }
    }
  }, [navigate]);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    setLoading(true);
    try {
      if (mode === "magic-link") {
        const actionCodeSettings = {
          url: window.location.href,
          handleCodeInApp: true,
        };
        await sendSignInLinkToEmail(auth, email, actionCodeSettings);
        window.localStorage.setItem('emailForSignIn', email);
        toast.success("تم إرسال رابط تسجيل الدخول إلى بريدك الإلكتروني");
        setMode("login");
      } else {
        if (mode === "login") {
          await signInWithEmailAndPassword(auth, email, password);
          toast.success("تم تسجيل الدخول");
          navigate({ to: "/account" });
        } else {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;
          await updateProfile(user, { displayName: name });
          
          await setDoc(doc(db, "profiles", user.uid), {
            id: user.uid,
            email: user.email,
            full_name: name,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

          toast.success("تم إنشاء الحساب بنجاح");
          navigate({ to: "/account" });
        }
      }
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-md">
      <div className="bg-card border border-border rounded-2xl p-6 shadow-luxury">
        <h1 className="text-2xl font-bold text-center text-gold mb-1">
          {mode === "login" ? "تسجيل الدخول" : mode === "signup" ? "إنشاء حساب" : "الدخول برابط"}
        </h1>
        <p className="text-center text-muted-foreground text-sm mb-6">
          {mode === "login" ? "أهلًا بعودتك" : mode === "signup" ? "انضم لعائلة حديقة العطور" : "سنرسل رابطاً سحرياً لبريدك"}
        </p>
        <form onSubmit={submit} className="space-y-4">
          {mode === "signup" && (
            <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="الاسم الكامل" autoComplete="off" spellCheck="false" className="w-full px-4 py-3 rounded-xl border border-input bg-background/50 focus:bg-background focus:ring-2 focus:ring-gold/50 outline-none transition" />
          )}
          <input value={email} onChange={(e) => setEmail(e.target.value)} required type="email" placeholder="البريد الإلكتروني" autoComplete="off" spellCheck="false" className="w-full px-4 py-3 rounded-xl border border-input bg-background/50 focus:bg-background focus:ring-2 focus:ring-gold/50 outline-none transition" />
          
          {mode !== "magic-link" && (
            <input value={password} onChange={(e) => setPassword(e.target.value)} required type="password" placeholder="كلمة المرور" autoComplete="new-password" spellCheck="false" className="w-full px-4 py-3 rounded-xl border border-input bg-background/50 focus:bg-background focus:ring-2 focus:ring-gold/50 outline-none transition" minLength={6} />
          )}
          
          <button disabled={loading} className="w-full gradient-gold text-primary-foreground py-3.5 rounded-xl font-bold disabled:opacity-50 shadow-lg shadow-gold/20 hover:shadow-gold/40 transition">
            {loading ? "جاري..." : mode === "login" ? "تسجيل دخول" : mode === "signup" ? "إنشاء حساب" : "إرسال رابط الدخول للإيميل"}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border"></span></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">أو</span></div>
        </div>

        <div className="flex flex-col gap-3">
          {mode === "login" ? (
            <>
              <button type="button" onClick={() => setMode("magic-link")} className="w-full bg-accent/50 hover:bg-accent text-foreground py-3 rounded-xl font-medium transition border border-border">
                الدخول برابط سحري للإيميل (بدون كلمة مرور)
              </button>
              <div className="text-center text-sm mt-2">
                ليس لديك حساب؟ <button onClick={() => setMode("signup")} className="text-gold font-bold hover:underline">إنشاء حساب جديد</button>
              </div>
            </>
          ) : mode === "signup" ? (
            <div className="text-center text-sm">
              لديك حساب بالفعل؟ <button onClick={() => setMode("login")} className="text-gold font-bold hover:underline">تسجيل دخول</button>
            </div>
          ) : (
            <div className="text-center text-sm">
              تذكرت كلمة المرور؟ <button onClick={() => setMode("login")} className="text-gold font-bold hover:underline">العودة لتسجيل الدخول</button>
            </div>
          )}
        </div>
        
        <Link to="/" className="block text-center text-sm text-muted-foreground mt-8 hover:text-gold transition">العودة للرئيسية</Link>
      </div>
    </div>
  );
}
