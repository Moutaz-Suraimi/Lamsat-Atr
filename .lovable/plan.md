
# خطة بناء متجر "حديقة العطور" الإلكتروني

سأبني المشروع كاملاً بناءً على الملف المرفق، مع لوحة تحكم وقاعدة بيانات ومصادقة ودفع.

## الهوية البصرية الجديدة
- ألوان فاخرة: ذهبي دافئ (#b76e22 محوّل إلى oklch) + خلفية كريمي عاجي + أسود فحمي للنصوص
- خطوط عربية أنيقة (Cairo / Tajawal)
- اتجاه RTL كامل
- متجاوب جوال + ديسكتوب

## الصفحات (الواجهة الأمامية)

تطابق الملف بالكامل:
1. **الرئيسية** `/` - هيرو + شريط التصنيفات + الأكثر مبيعاً + عروض اليوم + أحدث المنتجات + عطور رجالية + بانر العروض + المميزات + الفوتر
2. **المتجر** `/shop` - كل المنتجات مع فلاتر التصنيفات
3. **تفاصيل المنتج** `/product/$id` - صورة + سعر + خصم + وصف + تركيبة + مميزات + استخدامات + زر السلة
4. **سلة المشتريات** `/cart` - قائمة المنتجات + الإجمالي + زر الدفع
5. **الدفع (Checkout)** `/checkout` - بيانات العميل + ملاحظات + طرق الدفع (محافظ، بنوك، صرافة، عند الاستلام) + إتمام الطلب
6. **حسابي** `/account` - معلومات المستخدم + طلباته
7. **تتبع الطلب** `/track-order` - بحث برقم الطلب
8. **تسجيل الدخول/إنشاء حساب** `/login` - بريد + كلمة مرور
9. **من نحن** `/about`
10. **تواصل معنا** `/contact`
11. **سياسة الخصوصية** `/privacy`
12. **البخور** `/incense` - قسم البخور
13. **الماركات** `/brands` - الماركات العالمية
14. **أقسام المتجر** `/categories` - تصفح سريع

## لوحة التحكم (Admin)

`/_authenticated/admin/*` محمية بدور admin:

1. **لوحة المعلومات** - إحصائيات المبيعات والطلبات
2. **المنتجات** - إضافة/تعديل/حذف + صور + خصومات + تصنيفات
3. **الطلبات** - عرض الكل + تغيير الحالة (جديد، قيد التجهيز، مشحون، مكتمل، ملغي)
4. **العملاء** - قائمة العملاء وطلباتهم
5. **التصنيفات والماركات** - إدارة
6. **طرق الدفع** - تعديل أرقام المحافظ/البنوك/الصرافة (فلوسك، جيب، الكريمي، إلخ)
7. **الإعدادات** - معلومات المتجر + الاتصال + الواتساب

## قاعدة البيانات

```text
profiles (id, full_name, phone, email, address, city)
user_roles (id, user_id, role: admin|customer)
categories (id, name, slug, image)
brands (id, name, slug, logo)
products (id, name, slug, description, short_description, composition,
          features, usage, price, sale_price, sku, stock,
          category_id, brand_id, images[], is_bestseller, is_featured,
          is_new, is_expert_pick, discount_percent)
orders (id, user_id, order_number, status, subtotal, shipping, total,
        customer_name, phone, address, city, notes, payment_method,
        created_at)
order_items (id, order_id, product_id, quantity, price, product_name)
payment_methods (id, name, type: wallet|bank|exchange|cod, account_number,
                 is_active, sort_order)
site_settings (id, key, value) — معلومات المتجر، أرقام التواصل، الواتساب
```

RLS: المنتجات/التصنيفات/الماركات/طرق الدفع عامة للقراءة، الكتابة للأدمن فقط. الطلبات: العميل يرى طلباته، الأدمن يرى الكل. دالة `has_role()` آمنة.

## المصادقة
- إيميل + كلمة مرور (Supabase Auth)
- صفحات: تسجيل دخول، إنشاء حساب، استعادة كلمة المرور
- Trigger يُنشئ profile + role=customer تلقائياً عند التسجيل
- أول مستخدم يسجل يصبح admin (أو يتم تعيينه يدوياً)

## الدفع
- بدون بوابة دفع حقيقية - عرض أرقام الحسابات الوهمية (فلوسك، جيب، الكريمي ريال يمني/سعودي، صرافة، عند الاستلام)
- كلها قابلة للتعديل من لوحة التحكم
- زر "نسخ الرقم" لكل وسيلة

## الهيكلة التقنية
- TanStack Start + TanStack Router (file-based)
- Tailwind v4 + design tokens في `src/styles.css`
- shadcn components + variants فاخرة
- Zustand للسلة (localStorage)
- Server functions للطلبات والإدارة
- Layout: Header + Footer مشترك، Admin layout منفصل

## ترتيب التنفيذ (سيتم على عدة رسائل متتالية)
1. Migration قاعدة البيانات + RLS + Trigger + دالة has_role
2. Design system + Layout + Header + Footer + RTL
3. Auth (login/signup/reset)
4. صفحات المتجر (Home, Shop, Product, Cart, Checkout, Account, Track, About, Contact, Privacy, Incense, Brands, Categories)
5. لوحة التحكم بكل أقسامها
6. Seed منتجات تجريبية مطابقة للملف
7. اختبار وتنسيق نهائي

هل أبدأ التنفيذ؟
