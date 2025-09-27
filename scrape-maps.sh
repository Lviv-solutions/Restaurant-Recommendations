#!/bin/bash

# Google Maps Restaurant Scraper
# يكشط بيانات المطاعم من Google Maps باستخدام Puppeteer

set -e

echo "🗺️  Google Maps Restaurant Scraper"
echo "=================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js غير مثبت"
    echo "💡 قم بتثبيت Node.js من: https://nodejs.org/"
    exit 1
fi

# Check if services are running
echo "🔍 فحص الخدمات..."

if ! curl -s http://localhost:8000/api/health > /dev/null; then
    echo "⚠️  Backend API غير متاح على المنفذ 8000"
    echo "💡 سيتم حفظ البيانات في ملف JSON فقط"
    echo "💡 لإرسال البيانات للـ API، شغّل: docker-compose up -d"
else
    echo "✅ Backend API متاح"
fi

# Setup scraper directory
echo "📁 إعداد مجلد الكاشط..."
cd scraper

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 تثبيت المتطلبات..."
    npm install
else
    echo "✅ المتطلبات مثبتة مسبقاً"
fi

# Run the scraper
echo ""
echo "🚀 بدء عملية الكشط..."
echo "🎯 الهدف: مطاعم الرياض من Google Maps"
echo "⏱️  المدة المتوقعة: 2-3 دقائق"
echo "👀 سيتم فتح متصفح Chrome للمراقبة"
echo ""

# جرب النسخة المبسطة أولاً
echo "🔄 تشغيل النسخة المبسطة..."
if node simple-scraper.js; then
    echo "✅ تم الكشط بنجاح باستخدام النسخة المبسطة"
else
    echo "⚠️ فشلت النسخة المبسطة، جاري المحاولة مع النسخة المتقدمة..."
    node scraper.js
fi

echo ""
echo "🎉 تم الانتهاء من الكشط!"
echo "📁 تحقق من الملفات:"
echo "   - ../backend/data/scraped_restaurants.json"
echo "🔍 تحقق من النتائج على: http://localhost:3000"

cd ..
