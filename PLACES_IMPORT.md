# 🍽️ Google Places Restaurant Importer

سكربت Go متقدم لجلب بيانات المطاعم من Google Places API وإدخالها في قاعدة بيانات Weaviate مع تطبيع شامل وإزالة التكرارات.

## 🎯 الميزات

### 🔍 البحث الذكي
- **بحث نصي متعدد**: استعلامات بالعربية والإنجليزية
- **بحث جغرافي**: نطاق 50 كم حول الرياض
- **تصفية نوع المكان**: مطاعم ومقاهي فقط

### 📊 تطبيع البيانات
- **مستويات الأسعار**: تحويل Google price_level إلى (low/medium/high)
- **تقدير الفاتورة**: حساب متوسط التكلفة لـ 3 أشخاص بالريال السعودي
- **أنواع المطبخ**: استخراج ذكي من الأسماء والأنواع
- **الفعاليات**: تحديد الأجواء والخدمات المتاحة

### 🔄 إزالة التكرارات
- **مطابقة الأسماء**: تطبيع الأسماء وإزالة المسافات
- **مطابقة المواقع**: دقة 3 خانات عشرية (حوالي 100 متر)
- **مفتاح فريد**: دمج الاسم + الموقع

### 📈 المراقبة والإحصائيات
- **تتبع التقدم**: عداد للبحث والجلب والاستيراد
- **معدل النجاح**: نسبة مئوية للعمليات الناجحة
- **إدارة الأخطاء**: تسجيل مفصل للأخطاء

## 🚀 الاستخدام

### 1. الحصول على API Key

```bash
# انتقل إلى Google Cloud Console
https://console.cloud.google.com/apis/credentials

# فعّل Places API (New)
# أنشئ API Key جديد
# قيّد الاستخدام للأمان
```

### 2. تشغيل الاستيراد

```bash
# تعيين المفتاح
export GOOGLE_PLACES_API_KEY="your-api-key-here"

# تشغيل الخدمات
docker-compose up -d

# تشغيل الاستيراد
./import-places.sh
```

### 3. مراقبة التقدم

```bash
# مثال على الإخراج
🚀 Starting Google Places import...
🔍 Searching for: restaurant riyadh
📍 Found 20 places for query: restaurant riyadh
✅ Imported: Al Baik Restaurant
✅ Imported: Najd Village Restaurant
🔍 Searching for: مطعم الرياض
📍 Found 15 places for query: مطعم الرياض
📊 Removed 5 duplicates, 30 unique restaurants remain

📊 Import Statistics:
⏱️  Duration: 2m30s
🔍 Places searched: 85
📥 Details fetched: 45
🔄 Duplicates removed: 15
✅ Successfully imported: 30
❌ Errors: 0
📈 Success rate: 100.0%
```

## ⚙️ التكوين

### استعلامات البحث
```go
SearchQueries: []string{
    "restaurant riyadh",
    "مطعم الرياض", 
    "cafe riyadh",
    "مقهى الرياض",
    "fast food riyadh",
}
```

### المنطقة الجغرافية
```go
Location: "24.7136,46.6753", // مركز الرياض
Radius:   50000,             // 50 كم
```

### حدود الاستيراد
```go
MaxResults: 200,  // أقصى عدد نتائج
BatchSize:  10,   // حجم الدفعة
```

## 📋 الحقول المستخرجة

### من Places API
- `place_id` - معرف فريد
- `name` - اسم المطعم
- `rating` - التقييم (1-5)
- `price_level` - مستوى السعر (1-4)
- `types` - أنواع المكان
- `geometry` - الموقع الجغرافي
- `formatted_address` - العنوان
- `photos` - الصور
- `opening_hours` - ساعات العمل

### التطبيع إلى Weaviate
```go
type Restaurant struct {
    ID           string    // place_id
    Name         string    // name
    Description  string    // generated from address + rating
    Rating       float64   // rating
    PriceTier    string    // "low"/"medium"/"high"
    AvgBillFor3  float64   // estimated in SAR
    Cuisine      []string  // extracted from types + name
    Events       []string  // extracted from types + hours
    Location     Location  // lat/lng
    ImageURL     string    // Google Photos API URL
}
```

## 🔧 تطبيع البيانات

### مستويات الأسعار
```go
Google Price Level → Our Price Tier → Avg Bill (SAR)
1                  → "low"        → 90  (30/person)
2                  → "medium"     → 180 (60/person) 
3-4                → "high"       → 300-450 (100-150/person)
```

### أنواع المطبخ
```go
// استخراج من الاسم والأنواع
"italian restaurant" → ["Italian"]
"sushi bar"         → ["Japanese", "Sushi"]
"cafe"              → ["Cafe"]
"meal_takeaway"     → ["Fast Food"]
```

### الفعاليات والأجواء
```go
// بناءً على الأنواع وساعات العمل
"cafe"              → ["Casual Dining"]
"night_club"        → ["Nightlife"] 
"open_now"          → ["Currently Open"]
// افتراضي للجميع  → ["Family Friendly", "Dine In"]
```

## 🛡️ إدارة الأخطاء

### Rate Limiting
- 100ms بين طلبات التفاصيل
- 500ms بين دفعات الاستيراد

### إعادة المحاولة
- تسجيل الأخطاء مع الاستمرار
- إحصائيات مفصلة للنجاح/الفشل

### التحقق من الصحة
- فلترة الأماكن غير المطاعم
- التحقق من وجود البيانات المطلوبة

## 💰 تحسين التكلفة

### تقليل استهلاك API
```go
// حقول محددة فقط في Place Details
fields := "place_id,name,formatted_address,rating,price_level,types,geometry,photos"

// إزالة التكرارات قبل جلب التفاصيل
if seenPlaces[place.PlaceID] {
    continue
}
```

### تقدير التكلفة
- Text Search: $0.032 لكل طلب
- Place Details: $0.017 لكل طلب  
- Photos: مجاني (مع الحقول)

**مثال**: 200 مطعم = ~$7 USD

## 🔍 استكشاف الأخطاء

### مشاكل شائعة

1. **API Key غير صالح**
```bash
❌ API error: REQUEST_DENIED
💡 تحقق من صحة المفتاح وتفعيل Places API
```

2. **تجاوز الحد المسموح**
```bash
❌ API error: OVER_QUERY_LIMIT  
💡 انتظر أو ارفع حد الاستخدام في Google Cloud
```

3. **خدمات غير متاحة**
```bash
❌ Backend API is not running
💡 تشغيل: docker-compose up -d
```

### فحص الحالة
```bash
# فحص الخدمات
curl http://localhost:8000/api/health
curl http://localhost:8080/v1/meta

# فحص البيانات المستوردة
curl "http://localhost:8000/api/search?limit=5"
```

## 📈 مراقبة الأداء

### مقاييس مهمة
- **معدل النجاح**: يجب أن يكون > 90%
- **التكرارات**: يجب أن تكون < 20%
- **الوقت**: ~2-5 دقائق لـ 200 مطعم
- **الأخطاء**: يجب أن تكون < 5%

### تحسين الأداء
```go
// زيادة حجم الدفعة للسرعة
BatchSize: 20

// تقليل التأخير للسرعة (احذر من Rate Limiting)
time.Sleep(50 * time.Millisecond)
```

## 🔮 التطوير المستقبلي

### ميزات مقترحة
- [ ] دعم مدن متعددة
- [ ] استيراد تدريجي (Delta updates)
- [ ] تصنيف أذكى للمطابخ
- [ ] دمج مع مراجعات المستخدمين
- [ ] واجهة ويب للمراقبة

### تحسينات تقنية
- [ ] Connection pooling
- [ ] Parallel processing
- [ ] Database transactions
- [ ] Metrics dashboard
