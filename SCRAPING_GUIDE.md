# 🗺️ دليل كشط Google Maps للمطاعم

سكربت متقدم لكشط بيانات المطاعم من Google Maps باستخدام Puppeteer مع تطبيع شامل للبيانات وإزالة التكرارات.

## 🎯 الميزات المتقدمة

### 🔍 **كشط ذكي متعدد الاستعلامات**
```javascript
// استعلامات بالعربية والإنجليزية
const searchQueries = [
    'مطاعم الرياض',      // مطاعم عامة
    'restaurants Riyadh', // مطاعم إنجليزي
    'مقاهي الرياض',      // مقاهي
    'cafes Riyadh',       // مقاهي إنجليزي
    'مطاعم فاخرة الرياض', // مطاعم راقية
    'fine dining Riyadh', // مطاعم فاخرة
    'مطاعم شعبية الرياض', // مطاعم شعبية
    'fast food Riyadh'    // وجبات سريعة
];
```

### 📊 **تطبيع البيانات المتقدم**
- **استخراج نوع المطبخ**: من الفئات والأسماء
- **تقدير الأسعار**: تحويل رموز $ إلى مستويات سعر
- **حساب متوسط الفاتورة**: تقدير بالريال السعودي
- **استخراج الأحداث**: بناءً على نوع المطعم والسعر

### 🔄 **إزالة التكرارات الذكية**
```javascript
// مفتاح فريد: اسم + موقع (دقة 100 متر)
const key = `${name.toLowerCase()}_${Math.round(lat * 100)}_${Math.round(lng * 100)}`;
```

### 🚀 **تحسينات الأداء**
- **حجب الصور والخطوط**: تسريع التحميل
- **تمرير تلقائي**: تحميل المزيد من النتائج
- **تأخير ذكي**: تجنب الحظر
- **معالجة أخطاء شاملة**: استمرارية العمل

## 🛠️ التثبيت والإعداد

### 1. **تثبيت Node.js**
```bash
# تحميل من الموقع الرسمي
https://nodejs.org/

# أو باستخدام Homebrew (macOS)
brew install node

# التحقق من التثبيت
node --version
npm --version
```

### 2. **تثبيت المتطلبات**
```bash
# الانتقال لمجلد المشروع
cd Restaurant-Recommendations

# تشغيل سكربت التثبيت التلقائي
./scrape-maps.sh
```

### 3. **التثبيت اليدوي (اختياري)**
```bash
cd scraper
npm install puppeteer axios fs-extra uuid cheerio
```

## 🚀 الاستخدام

### **الطريقة السريعة**
```bash
# تشغيل الخدمات (اختياري للإرسال المباشر)
docker-compose up -d

# تشغيل الكاشط
./scrape-maps.sh
```

### **التشغيل المخصص**
```bash
cd scraper

# تشغيل مع إعدادات مخصصة
node scraper.js

# أو تعديل الإعدادات في الكود
const scraper = new GoogleMapsRestaurantScraper({
    headless: false,    // إظهار المتصفح
    maxResults: 50,     // عدد النتائج
    slowMo: 100,        // سرعة التنفيذ
    timeout: 30000      // مهلة الانتظار
});
```

## 📋 البيانات المستخرجة

### **الحقول الأساسية**
```json
{
  "id": "a1b2c3d4",
  "name": "مطعم النجد",
  "rating": 4.5,
  "cuisine": ["Middle Eastern", "Traditional"],
  "price_tier": "medium",
  "avg_bill_for_3": 200,
  "events": ["Family Friendly", "Traditional Music"],
  "location": {
    "latitude": 24.7136,
    "longitude": 46.6753
  },
  "description": "مطعم تراثي يقدم الأكلات السعودية الأصيلة",
  "image_url": "https://images.unsplash.com/photo-..."
}
```

### **مصادر البيانات**
- **الاسم**: من عنوان المكان
- **التقييم**: من نجوم Google
- **نوع المطبخ**: من فئة المكان + تحليل الاسم
- **مستوى السعر**: من رموز $ في Google Maps
- **الوصف**: من معلومات المكان أو مُولد تلقائياً
- **الإحداثيات**: من رابط Google Maps
- **الصورة**: صور افتراضية من Unsplash

## ⚙️ التكوين المتقدم

### **تخصيص الاستعلامات**
```javascript
// في ملف scraper.js
this.searchQueries = [
    'مطاعم شمال الرياض',
    'مطاعم جنوب الرياض', 
    'مطاعم شرق الرياض',
    'مطاعم غرب الرياض',
    'مطاعم وسط الرياض'
];
```

### **تخصيص المدينة**
```javascript
const scraper = new GoogleMapsRestaurantScraper({
    city: 'Jeddah',           // المدينة
    country: 'Saudi Arabia',  // البلد
    maxResults: 100,          // عدد النتائج
    outputFile: './jeddah_restaurants.json'
});
```

### **إعدادات المتصفح**
```javascript
const scraper = new GoogleMapsRestaurantScraper({
    headless: true,     // تشغيل خفي
    slowMo: 0,          // سرعة قصوى
    timeout: 60000,     // مهلة أطول
});
```

## 📊 تطبيع البيانات

### **مستويات الأسعار**
```javascript
// تحويل رموز Google إلى مستويات
'$'     → 'low'    → 90 SAR  (30/person)
'$$'    → 'medium' → 200 SAR (67/person)  
'$$$'   → 'high'   → 350 SAR (117/person)
'$$$$'  → 'high'   → 450 SAR (150/person)
```

### **أنواع المطبخ**
```javascript
// استخراج ذكي من الفئات والأسماء
'Italian restaurant' → ['Italian']
'Sushi bar'         → ['Japanese', 'Sushi']
'Fast food'         → ['Fast Food']
'Coffee shop'       → ['Cafe']
'مطعم شعبي'         → ['Traditional', 'Middle Eastern']
```

### **الفعاليات والأجواء**
```javascript
// بناءً على نوع المطعم ومستوى السعر
Cafe + any price     → ['Casual Dining', 'Work Friendly']
Fast Food + any      → ['Quick Service', 'Family Friendly']  
Any + high price     → ['Fine Dining', 'Date Night']
Any + medium/low     → ['Family Friendly', 'Casual Dining']
```

## 🔍 مراقبة العملية

### **إخراج مباشر**
```bash
🚀 بدء تشغيل Google Maps Restaurant Scraper
🔍 البحث عن: مطاعم الرياض
📍 تم العثور على 25 مكان
✅ تم كشط: مطعم النجد
✅ تم كشط: مقهى الكورنيش
❌ خطأ في كشط مطعم XYZ: timeout
🔍 البحث عن: restaurants Riyadh
📍 تم العثور على 30 مكان
💾 تم حفظ 45 مطعم في ../backend/data/scraped_restaurants.json
📤 إرسال البيانات إلى API...
✅ تم إرسال البيانات بنجاح

📊 إحصائيات الكشط:
⏱️  المدة: 8m 32s
🔍 أماكن تم البحث عنها: 120
📥 مطاعم تم كشطها: 45
🔄 تكرارات تم إزالتها: 15
❌ أخطاء: 3
📈 معدل النجاح: 87.5%
```

### **ملفات الإخراج**
```bash
# البيانات المكشوطة
backend/data/scraped_restaurants.json

# سجلات العملية (في وقت التشغيل)
console output with timestamps
```

## 🛡️ إدارة الأخطاء

### **أخطاء شائعة وحلولها**

#### 1. **خطأ في تحميل الصفحة**
```bash
❌ خطأ: Navigation timeout
💡 الحل: زيادة timeout أو تحسين الاتصال
```

#### 2. **عدم العثور على عناصر**
```bash
❌ خطأ: Element not found
💡 الحل: Google Maps غيّر التصميم، تحديث المحددات مطلوب
```

#### 3. **حظر من Google**
```bash
❌ خطأ: Rate limited
💡 الحل: زيادة التأخير بين الطلبات
```

### **استراتيجيات التعافي**
```javascript
// إعادة المحاولة التلقائية
try {
    await this.getPlaceDetails(place);
} catch (error) {
    console.log(`❌ خطأ: ${error.message}`);
    this.stats.errors++;
    continue; // المتابعة مع المكان التالي
}
```

## 🔧 التخصيص والتطوير

### **إضافة حقول جديدة**
```javascript
// في دالة extractPlaceDetails
const phoneEl = document.querySelector('[data-value="Phone"]');
if (phoneEl) result.phone = phoneEl.textContent?.trim();

const websiteEl = document.querySelector('[data-value="Website"]');
if (websiteEl) result.website = websiteEl.href;
```

### **تحسين استخراج المطبخ**
```javascript
const cuisineKeywords = {
    'برجر': 'Burgers',
    'بيتزا': 'Pizza', 
    'شاورما': 'Middle Eastern',
    'كباب': 'Grilled',
    'مندي': 'Traditional'
};
```

### **إضافة مدن جديدة**
```javascript
const cityConfigs = {
    'Riyadh': { lat: 24.7136, lng: 46.6753, radius: 50 },
    'Jeddah': { lat: 21.4858, lng: 39.1925, radius: 40 },
    'Dammam': { lat: 26.4207, lng: 50.0888, radius: 30 }
};
```

## 📈 تحسين الأداء

### **تسريع العملية**
```javascript
// تشغيل متوازي (احذر من Rate Limiting)
const promises = places.map(place => this.getPlaceDetails(place));
const results = await Promise.allSettled(promises);

// تقليل التأخير
await this.delay(50); // بدلاً من 1000ms
```

### **تقليل استهلاك الذاكرة**
```javascript
// حجب الموارد غير المطلوبة
await page.setRequestInterception(true);
page.on('request', (req) => {
    const resourceType = req.resourceType();
    if (['image', 'font', 'media'].includes(resourceType)) {
        req.abort();
    } else {
        req.continue();
    }
});
```

## 🔮 التطوير المستقبلي

### **ميزات مقترحة**
- [ ] **كشط المراجعات**: استخراج تعليقات المستخدمين
- [ ] **ساعات العمل**: جدولة أوقات فتح/إغلاق المطاعم
- [ ] **الصور الحقيقية**: تحميل صور المطاعم من Google
- [ ] **معلومات الاتصال**: أرقام الهاتف والمواقع الإلكترونية
- [ ] **كشط متوازي**: تسريع العملية بمعالجة متعددة
- [ ] **واجهة ويب**: لوحة تحكم لمراقبة العملية

### **تحسينات تقنية**
- [ ] **Proxy rotation**: تجنب الحظر
- [ ] **CAPTCHA solving**: حل التحديات التلقائية
- [ ] **Database integration**: حفظ مباشر في قاعدة البيانات
- [ ] **Incremental updates**: تحديثات تدريجية
- [ ] **Error recovery**: استئناف من نقطة التوقف

## ⚖️ الاعتبارات القانونية

### **الاستخدام المسؤول**
- ✅ **احترام robots.txt**: فحص سياسات الموقع
- ✅ **Rate limiting**: عدم إرهاق الخوادم
- ✅ **الاستخدام الشخصي**: لأغراض التطوير والتعلم
- ❌ **الاستخدام التجاري**: قد يتطلب إذن من Google

### **بدائل قانونية**
- **Google Places API**: الحل الرسمي المدفوع
- **Foursquare API**: بديل مجاني محدود
- **Yelp API**: للمراجعات والتقييمات

## 🆘 الدعم واستكشاف الأخطاء

### **مشاكل شائعة**

1. **المتصفح لا يفتح**
```bash
# تثبيت Chrome يدوياً
npm install puppeteer --unsafe-perm=true
```

2. **بطء في التحميل**
```bash
# زيادة timeout
timeout: 60000 // 60 ثانية
```

3. **نتائج قليلة**
```bash
# زيادة عدد النتائج
maxResults: 100
```

### **طلب المساعدة**
- 📧 **البريد الإلكتروني**: support@restaurant-recommendations.com
- 🐛 **تقرير الأخطاء**: GitHub Issues
- 💬 **المناقشات**: GitHub Discussions

---

**ملاحظة**: هذا السكربت مصمم لأغراض التطوير والتعلم. تأكد من احترام شروط خدمة Google Maps عند الاستخدام.
