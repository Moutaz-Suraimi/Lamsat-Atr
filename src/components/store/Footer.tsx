import { Link } from "@tanstack/react-router";
import { Phone, MapPin, MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[oklch(0.22_0.03_60)] text-[oklch(0.95_0.02_80)] mt-20">
      <div className="container mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-xl font-bold text-gold mb-4">حديقة العطور</h3>
          <p className="text-sm opacity-80 leading-relaxed">
            عطور أصلية وبدائل فاخرة بأسعار منافسة وتوصيل سريع إلى جميع المدن اليمنية، بتجربة شراء آمنة وأنيقة.
          </p>
          <a href="https://wa.me/967779160009" className="inline-flex items-center gap-2 mt-4 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm">
            <MessageCircle className="w-4 h-4" /> واتساب
          </a>
        </div>
        <div>
          <h4 className="font-bold mb-4">المتجر</h4>
          <ul className="space-y-2 text-sm opacity-80">
            <li><Link to="/cart" className="hover:text-gold">سلة المشتريات</Link></li>
            <li><Link to="/checkout" className="hover:text-gold">الدفع</Link></li>
            <li><Link to="/account" className="hover:text-gold">حسابي</Link></li>
            <li><Link to="/track-order" className="hover:text-gold">تتبع الطلب</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4">معلومات</h4>
          <ul className="space-y-2 text-sm opacity-80">
            <li><Link to="/about" className="hover:text-gold">من نحن</Link></li>
            <li><Link to="/contact" className="hover:text-gold">تواصل معنا</Link></li>
            <li><Link to="/privacy" className="hover:text-gold">الخصوصية</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4">تواصل معنا</h4>
          <ul className="space-y-2 text-sm opacity-80">
            <li className="flex items-center gap-2"><Phone className="w-4 h-4" /> 967-779160009</li>
            <li className="flex items-center gap-2"><Phone className="w-4 h-4" /> 967-733160009</li>
            <li className="flex items-center gap-2"><MapPin className="w-4 h-4" /> اليمن - صنعاء</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs opacity-70">
        © 2026 حديقة العطور · جميع الحقوق محفوظة
      </div>
    </footer>
  );
}
