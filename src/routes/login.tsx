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
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    
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
        const password = formData.get("password") as string;
        
        if (mode === "login") {
          await signInWithEmailAndPassword(auth, email, password);
          toast.success("تم تسجيل الدخول");
          navigate({ to: "/account" });
        } else {
          const name = formData.get("name") as string;
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
        <form onSubmit={submit} className="space-y-3">
          {mode === "signup" && (
            <input name="name" required placeholder="الاسم الكامل" className="w-full px-3 py-3 rounded-lg border border-input bg-background" />
          )}
          <input name="email" required type="email" placeholder="البريد الإلكتروني" className="w-full px-3 py-3 rounded-lg border border-input bg-background" />
          
          {mode !== "magic-link" && (
            <input name="password" required type="password" placeholder="كلمة المرور" className="w-full px-3 py-3 rounded-lg border border-input bg-background" minLength={6} />
          )}
          
          <button disabled={loading} className="w-full gradient-gold text-primary-foreground py-3 rounded-lg font-bold disabled:opacity-50">
            {loading ? "جاري..." : mode === "login" ? "دخول" : mode === "signup" ? "إنشاء حساب" : "إرسال الرابط"}
          </button>
        </form>
        <div className="text-center text-sm mt-4 flex flex-col gap-2">
          {mode === "login" && (
            <>
              <div>ليس لديك حساب؟ <button onClick={() => setMode("signup")} className="text-gold font-bold">إنشاء حساب</button></div>
              <div><button onClick={() => setMode("magic-link")} className="text-muted-foreground hover:text-gold transition">تسجيل الدخول برابط سحري بدلاً من ذلك</button></div>
            </>
          )}
          {mode === "signup" && (
            <div>لديك حساب؟ <button onClick={() => setMode("login")} className="text-gold font-bold">تسجيل دخول</button></div>
          )}
          {mode === "magic-link" && (
            <div>تذكرت كلمة المرور؟ <button onClick={() => setMode("login")} className="text-gold font-bold">العودة لتسجيل الدخول</button></div>
          )}
        </div>
        <Link to="/" className="block text-center text-xs text-muted-foreground mt-4 hover:text-gold">العودة للرئيسية</Link>
      </div>
    </div>
  );
}
