import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, getDocs } from "firebase/firestore";

export const Route = createFileRoute("/admin/customers")({ component: Customers });

function Customers() {
  const { data } = useQuery({ 
    queryKey: ["adm-customers"], 
    queryFn: async () => {
      const q = query(collection(db, "profiles"), orderBy("created_at", "desc"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
    } 
  });
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">العملاء ({data?.length ?? 0})</h1>
      <div className="bg-card border border-border rounded-2xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted"><tr><th className="p-3 text-right">الاسم</th><th className="p-3">البريد</th><th className="p-3">الجوال</th><th className="p-3">المدينة</th><th className="p-3">تاريخ التسجيل</th></tr></thead>
          <tbody>
            {(data ?? []).map((c) => (
              <tr key={c.id} className="border-t border-border">
                <td className="p-3 font-bold">{c.full_name || "—"}</td>
                <td className="p-3">{c.email}</td>
                <td className="p-3">{c.phone || "—"}</td>
                <td className="p-3">{c.city || "—"}</td>
                <td className="p-3 text-xs">{new Date(c.created_at).toLocaleDateString("ar")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
