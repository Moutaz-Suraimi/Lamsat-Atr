import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/privacy")({ component: Privacy });
function Privacy() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-4xl font-bold text-gold mb-6">سياسة الخصوصية</h1>
      <div className="bg-card border border-border rounded-2xl p-6 leading-8 space-y-4 text-sm">
        <p>تحرص حديقة العطور على حماية خصوصيتك وأمان بياناتك. نلتزم بعدم مشاركة معلوماتك مع أي طرف ثالث دون إذنك.</p>
        <h3 className="font-bold text-base">البيانات التي نجمعها</h3>
        <p>الاسم، البريد، الجوال، العنوان — لاستخدامها فقط في تنفيذ طلباتك وتحسين تجربتك.</p>
        <h3 className="font-bold text-base">ملفات الكوكيز</h3>
        <p>نستخدم الكوكيز لحفظ سلة التسوق وتفضيلاتك.</p>
        <h3 className="font-bold text-base">الدفع</h3>
        <p>جميع عمليات الدفع تتم عبر قنوات آمنة. لا نحتفظ ببيانات بطاقات الائتمان.</p>
        <h3 className="font-bold text-base">حقوقك</h3>
        <p>يحقّ لك طلب تعديل أو حذف بياناتك في أي وقت عبر التواصل معنا.</p>
      </div>
    </div>
  );
}
