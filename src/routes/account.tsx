import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { useAuth } from "@/hooks/use-auth";
import { formatPrice } from "@/lib/format";
import { LogOut, User, Package, Settings, LayoutDashboard } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/account")({ component: Account });

function Account() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"overview" | "orders" | "settings">("overview");
  const [profile, setProfile] = useState<any>({ full_name: "", phone: "", address: "", city: "" });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { if (!loading && !user) navigate({ to: "/login" }); }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const docRef = doc(db, "profiles", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfile({ full_name: data.full_name ?? "", phone: data.phone ?? "", address: data.address ?? "", city: data.city ?? "" });
      }
    };
    fetchProfile();
  }, [user]);

  const { data: orders } = useQuery({
    queryKey: ["my-orders", user?.uid],
    enabled: !!user,
    queryFn: async () => {
      const q = query(collection(db, "orders"), where("user_id", "==", user!.uid), orderBy("created_at", "desc"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
    },
  });

  const saveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await setDoc(doc(db, "profiles", user.uid), { ...profile, email: user.email }, { merge: true });
      toast.success("تم تحديث البيانات بنجاح");
    } catch (error) {
      console.error(error);
      toast.error("فشل حفظ البيانات");
    } finally {
      setIsSaving(false);
    }
  };

  const logout = () => {
    signOut();
    navigate({ to: "/" });
  };

  if (loading || !user) return <div className="container mx-auto px-4 py-32 text-center text-muted-foreground">جاري التحميل...</div>;

  return (
    <div className="bg-muted/30 min-h-[calc(100vh-80px)] py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <aside className="w-full md:w-64 shrink-0">
            <div className="bg-card border border-border rounded-2xl overflow-hidden sticky top-24">
              <div className="p-6 text-center border-b border-border bg-gradient-to-b from-accent/50 to-transparent">
                <div className="w-20 h-20 mx-auto bg-primary/10 text-primary rounded-full flex items-center justify-center mb-3">
                  <User className="w-10 h-10" />
                </div>
                <h2 className="font-bold text-lg truncate">{profile.full_name || "مستخدم جديد"}</h2>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
              <nav className="p-2 flex flex-col gap-1">
                <button 
                  onClick={() => setActiveTab("overview")} 
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === "overview" ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}
                >
                  <LayoutDashboard className="w-4 h-4" /> لوحة التحكم
                </button>
                <button 
                  onClick={() => setActiveTab("orders")} 
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === "orders" ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}
                >
                  <Package className="w-4 h-4" /> سجل الطلبات
                </button>
                <button 
                  onClick={() => setActiveTab("settings")} 
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === "settings" ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}
                >
                  <Settings className="w-4 h-4" /> إعدادات الحساب
                </button>
                <button 
                  onClick={logout} 
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition mt-2"
                >
                  <LogOut className="w-4 h-4" /> تسجيل الخروج
                </button>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {activeTab === "overview" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h1 className="text-2xl font-bold text-gold">مرحباً بك، {profile.full_name?.split(' ')[0] || 'عزيزنا العميل'}</h1>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-muted-foreground">إجمالي طلباتك</h3>
                      <Package className="w-5 h-5 text-gold" />
                    </div>
                    <p className="text-3xl font-bold">{(orders ?? []).length}</p>
                  </div>
                  <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-muted-foreground">إجمالي المشتريات</h3>
                      <span className="text-xl font-bold text-gold">SAR</span>
                    </div>
                    <p className="text-3xl font-bold">
                      {formatPrice((orders ?? []).reduce((acc, curr) => acc + (curr.total || 0), 0)).replace('ر.س', '').trim()}
                    </p>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg">أحدث الطلبات</h3>
                    <button onClick={() => setActiveTab("orders")} className="text-sm text-gold hover:underline">عرض الكل</button>
                  </div>
                  {(orders ?? []).length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground bg-accent/30 rounded-xl">لا توجد طلبات بعد. ابدأ التسوق الآن!</div>
                  ) : (
                    <div className="space-y-3">
                      {orders?.slice(0, 3).map((o) => (
                        <div key={o.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-border rounded-xl bg-background gap-3">
                          <div>
                            <div className="font-bold mb-1">طلب #{o.order_number}</div>
                            <div className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString("ar")}</div>
                          </div>
                          <div className="flex items-center gap-4 justify-between sm:justify-end">
                            <span className="font-bold text-gold">{formatPrice(o.total)}</span>
                            <span className="px-3 py-1 bg-accent rounded-full text-xs font-medium">{o.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "orders" && (
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gold">سجل الطلبات</h2>
                  <Link to="/track-order" className="text-sm border border-border px-4 py-2 rounded-lg hover:bg-accent transition">تتبّع طلب</Link>
                </div>
                
                {(orders ?? []).length === 0 ? (
                  <div className="text-center py-20 text-muted-foreground border-2 border-dashed border-border rounded-xl">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    لا توجد طلبات سابقة
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders!.map((o) => (
                      <div key={o.id} className="border border-border rounded-xl p-5 bg-background hover:border-gold/30 transition">
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-4 border-b border-border pb-4">
                          <div>
                            <div className="text-sm text-muted-foreground mb-1">رقم الطلب</div>
                            <div className="font-bold text-lg">#{o.order_number}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground mb-1">التاريخ</div>
                            <div className="font-bold">{new Date(o.created_at).toLocaleDateString("ar-SA", { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground mb-1">الإجمالي</div>
                            <div className="font-bold text-gold">{formatPrice(o.total)}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground mb-1">الحالة</div>
                            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">{o.status}</span>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          تم الدفع عبر: {o.payment_method === "cod" ? "الدفع عند الاستلام" : "البطاقة الائتمانية"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "settings" && (
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-2xl font-bold text-gold mb-6">إعدادات الحساب</h2>
                
                <div className="max-w-xl space-y-5">
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-muted-foreground">الاسم الكامل</label>
                    <input placeholder="أدخل اسمك الكامل" value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:ring-2 focus:ring-gold/50 outline-none transition" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-muted-foreground">البريد الإلكتروني</label>
                    <input value={user.email ?? ""} disabled className="w-full px-4 py-3 rounded-xl border border-input bg-muted/50 cursor-not-allowed opacity-70" />
                    <p className="text-xs text-muted-foreground mt-1">لا يمكن تغيير البريد الإلكتروني حالياً.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-muted-foreground">رقم الجوال</label>
                    <input placeholder="05XXXXXXXX" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:ring-2 focus:ring-gold/50 outline-none transition" dir="ltr" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-sm font-medium mb-1.5 text-muted-foreground">المدينة</label>
                      <input placeholder="الرياض" value={profile.city} onChange={(e) => setProfile({ ...profile, city: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:ring-2 focus:ring-gold/50 outline-none transition" />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-sm font-medium mb-1.5 text-muted-foreground">العنوان بالتفصيل</label>
                      <input placeholder="اسم الشارع، الحي" value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:ring-2 focus:ring-gold/50 outline-none transition" />
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-border mt-6">
                    <button onClick={saveProfile} disabled={isSaving} className="w-full sm:w-auto min-w-[150px] gradient-gold text-primary-foreground py-3 px-8 rounded-xl font-bold shadow-lg shadow-gold/20 disabled:opacity-50 transition">
                      {isSaving ? "جاري الحفظ..." : "حفظ التعديلات"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
