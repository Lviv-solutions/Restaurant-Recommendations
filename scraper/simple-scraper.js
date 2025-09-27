const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const axios = require('axios');

class SimpleMapsRestaurantScraper {
    constructor() {
        this.restaurants = [];
        this.stats = {
            scraped: 0,
            errors: 0,
            startTime: Date.now()
        };
    }

    async scrape() {
        let browser;
        
        try {
            console.log('🚀 بدء كشط مطاعم الرياض من Google Maps');
            console.log('===========================================');
            
            // إعدادات المتصفح المحسنة
            browser = await puppeteer.launch({
                headless: false,
                defaultViewport: null,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-web-security',
                    '--start-maximized'
                ]
            });

            const page = await browser.newPage();
            
            // إعداد User Agent
            await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
            
            console.log('✅ تم تشغيل المتصفح بنجاح');

            // البحث عن مطاعم الرياض
            await this.searchRestaurants(page);
            
            // حفظ النتائج
            await this.saveResults();
            
            // إرسال إلى API
            await this.sendToAPI();
            
            this.printStats();

        } catch (error) {
            console.error('❌ خطأ عام:', error.message);
            this.stats.errors++;
        } finally {
            if (browser) {
                await browser.close();
                console.log('🔒 تم إغلاق المتصفح');
            }
        }
    }

    async searchRestaurants(page) {
        try {
            console.log('🔍 الانتقال إلى Google Maps...');
            
            // الذهاب إلى Google Maps
            await page.goto('https://www.google.com/maps', { 
                waitUntil: 'networkidle2',
                timeout: 30000 
            });

            console.log('✅ تم تحميل Google Maps');

            // البحث عن مطاعم الرياض
            console.log('🔍 البحث عن مطاعم الرياض...');
            
            await page.waitForSelector('input#searchboxinput', { timeout: 10000 });
            await page.click('input#searchboxinput');
            await page.type('input#searchboxinput', 'مطاعم الرياض');
            await page.keyboard.press('Enter');

            // انتظار النتائج
            console.log('⏳ انتظار النتائج...');
            await page.waitForSelector('div[role="main"]', { timeout: 15000 });
            await this.delay(5000);

            console.log('📍 استخراج قائمة المطاعم...');
            
            // استخراج المطاعم
            const restaurants = await page.evaluate(() => {
                const results = [];
                
                // البحث عن عناصر المطاعم
                const elements = document.querySelectorAll('div[role="article"], .Nv2PK, .bfdHYd');
                
                elements.forEach((element, index) => {
                    try {
                        // البحث عن الاسم
                        const nameEl = element.querySelector('.qBF1Pd, .fontHeadlineSmall, h3, .NrDZNb');
                        
                        // البحث عن التقييم
                        const ratingEl = element.querySelector('.MW4etd, .fontBodyMedium, [aria-label*="stars"]');
                        
                        // البحث عن النوع
                        const typeEl = element.querySelector('.W4Efsd, .fontBodyMedium');
                        
                        if (nameEl && nameEl.textContent.trim()) {
                            const name = nameEl.textContent.trim();
                            const rating = ratingEl ? parseFloat(ratingEl.textContent.replace(/[^\d.,]/g, '')) || 4.0 : 4.0;
                            const type = typeEl ? typeEl.textContent.trim() : 'مطعم';
                            
                            if (name.length > 2 && !name.includes('Google') && !name.includes('Map')) {
                                results.push({
                                    id: `rest_${index + 1}`,
                                    name: name,
                                    rating: Math.min(rating, 5.0),
                                    type: type,
                                    index: index
                                });
                            }
                        }
                    } catch (error) {
                        console.log('خطأ في استخراج عنصر:', error);
                    }
                });
                
                return results.slice(0, 20); // أول 20 مطعم
            });

            console.log(`📊 تم العثور على ${restaurants.length} مطعم`);

            // تحويل إلى تنسيق النظام
            for (let i = 0; i < restaurants.length; i++) {
                const restaurant = restaurants[i];
                const normalizedRestaurant = this.normalizeRestaurant(restaurant, i);
                this.restaurants.push(normalizedRestaurant);
                this.stats.scraped++;
                
                console.log(`✅ ${i + 1}. ${restaurant.name} - ${restaurant.rating}⭐`);
            }

        } catch (error) {
            console.error('❌ خطأ في البحث:', error.message);
            this.stats.errors++;
        }
    }

    normalizeRestaurant(restaurant, index) {
        // تحديد نوع المطبخ بناءً على الاسم
        const name = restaurant.name.toLowerCase();
        let cuisine = ['International'];
        let priceTier = 'medium';
        let avgBill = 200;
        let events = ['Family Friendly'];

        // تحديد نوع المطبخ
        if (name.includes('بيتزا') || name.includes('pizza')) {
            cuisine = ['Italian', 'Pizza'];
        } else if (name.includes('برجر') || name.includes('burger')) {
            cuisine = ['American', 'Burgers'];
            priceTier = 'low';
            avgBill = 120;
        } else if (name.includes('شاورما') || name.includes('shawarma')) {
            cuisine = ['Middle Eastern', 'Fast Food'];
            priceTier = 'low';
            avgBill = 90;
        } else if (name.includes('قهوة') || name.includes('كافيه') || name.includes('cafe')) {
            cuisine = ['Cafe'];
            events = ['Casual Dining', 'Work Friendly'];
        } else if (name.includes('صيني') || name.includes('chinese')) {
            cuisine = ['Chinese'];
        } else if (name.includes('هندي') || name.includes('indian')) {
            cuisine = ['Indian'];
        } else if (name.includes('تركي') || name.includes('turkish')) {
            cuisine = ['Turkish'];
        } else if (name.includes('لبناني') || name.includes('lebanese')) {
            cuisine = ['Lebanese', 'Middle Eastern'];
        } else if (name.includes('مندي') || name.includes('كبسة') || name.includes('مظبي')) {
            cuisine = ['Traditional', 'Saudi'];
            events = ['Family Friendly', 'Traditional Music'];
        }

        // تحديد مستوى السعر بناءً على التقييم
        if (restaurant.rating >= 4.5) {
            priceTier = 'high';
            avgBill = 350;
            events = ['Fine Dining', 'Date Night'];
        } else if (restaurant.rating <= 3.5) {
            priceTier = 'low';
            avgBill = 120;
        }

        // إحداثيات عشوائية في الرياض
        const lat = 24.7136 + (Math.random() - 0.5) * 0.1;
        const lng = 46.6753 + (Math.random() - 0.5) * 0.1;

        return {
            id: restaurant.id,
            name: restaurant.name,
            cuisine: cuisine,
            price_tier: priceTier,
            avg_bill_for_3: avgBill,
            events: events,
            rating: restaurant.rating,
            location: {
                latitude: parseFloat(lat.toFixed(4)),
                longitude: parseFloat(lng.toFixed(4))
            },
            description: `${restaurant.name} - مطعم في الرياض يقدم ${cuisine.join(' و ')} بتقييم ${restaurant.rating} نجوم.`,
            image_url: this.getImageForCuisine(cuisine[0])
        };
    }

    getImageForCuisine(cuisine) {
        const images = {
            'Italian': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=500',
            'Chinese': 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=500',
            'American': 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=500',
            'Middle Eastern': 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500',
            'Cafe': 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=500',
            'Traditional': 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=500',
            'Lebanese': 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=500',
            'Turkish': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=500',
            'Indian': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500'
        };
        
        return images[cuisine] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500';
    }

    async saveResults() {
        try {
            const outputPath = '../backend/data/scraped_restaurants.json';
            await fs.ensureDir('../backend/data');
            await fs.writeJSON(outputPath, this.restaurants, { spaces: 2 });
            console.log(`💾 تم حفظ ${this.restaurants.length} مطعم في ${outputPath}`);
        } catch (error) {
            console.error('❌ خطأ في حفظ الملف:', error.message);
        }
    }

    async sendToAPI() {
        try {
            console.log('📤 إرسال البيانات إلى API...');
            
            const response = await axios.post('http://localhost:8000/api/import', this.restaurants, {
                headers: { 'Content-Type': 'application/json' },
                timeout: 30000
            });
            
            console.log('✅ تم إرسال البيانات بنجاح:', response.data);
        } catch (error) {
            console.log('⚠️ لم يتم إرسال البيانات إلى API:', error.message);
            console.log('💡 تأكد من تشغيل الخدمات: docker-compose up -d');
        }
    }

    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    printStats() {
        const duration = Date.now() - this.stats.startTime;
        const minutes = Math.floor(duration / 60000);
        const seconds = Math.floor((duration % 60000) / 1000);
        
        console.log('\n📊 إحصائيات الكشط:');
        console.log('==================');
        console.log(`⏱️ المدة: ${minutes}m ${seconds}s`);
        console.log(`✅ مطاعم تم كشطها: ${this.stats.scraped}`);
        console.log(`❌ أخطاء: ${this.stats.errors}`);
        console.log(`📈 معدل النجاح: ${this.stats.errors === 0 ? '100%' : ((this.stats.scraped / (this.stats.scraped + this.stats.errors)) * 100).toFixed(1) + '%'}`);
    }
}

// تشغيل السكربت
async function main() {
    const scraper = new SimpleMapsRestaurantScraper();
    await scraper.scrape();
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = SimpleMapsRestaurantScraper;
