const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

class GoogleMapsRestaurantScraper {
    constructor(config = {}) {
        this.config = {
            headless: config.headless !== false, // Default true
            slowMo: config.slowMo || 100,
            timeout: config.timeout || 30000,
            maxResults: config.maxResults || 50,
            city: config.city || 'Riyadh',
            country: config.country || 'Saudi Arabia',
            outputFile: config.outputFile || '../backend/data/scraped_restaurants.json',
            ...config
        };
        
        this.searchQueries = [
            'مطاعم الرياض',
            'restaurants Riyadh',
            'مقاهي الرياض', 
            'cafes Riyadh',
            'مطاعم فاخرة الرياض',
            'fine dining Riyadh',
            'مطاعم شعبية الرياض',
            'fast food Riyadh'
        ];
        
        this.restaurants = [];
        this.seenPlaces = new Set();
        this.stats = {
            searched: 0,
            scraped: 0,
            duplicates: 0,
            errors: 0,
            startTime: Date.now()
        };
    }

    async init() {
        console.log('🚀 بدء تشغيل Google Maps Restaurant Scraper');
        console.log('================================================');
        
        try {
            this.browser = await puppeteer.launch({
                headless: this.config.headless,
                slowMo: this.config.slowMo,
                defaultViewport: null,
                ignoreDefaultArgs: ['--disable-extensions'],
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu',
                    '--disable-web-security',
                    '--disable-features=VizDisplayCompositor',
                    '--start-maximized'
                ]
            });
            
            console.log('✅ تم تشغيل المتصفح بنجاح');
        } catch (error) {
            console.error('❌ فشل في تشغيل المتصفح:', error.message);
            throw error;
        }
        
        this.page = await this.browser.newPage();
        
        // Set user agent and viewport
        await this.page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        await this.page.setViewport({ width: 1366, height: 768 });
        
        // Block images and fonts to speed up loading
        try {
            await this.page.setRequestInterception(true);
            this.page.on('request', (req) => {
                const resourceType = req.resourceType();
                if (resourceType === 'image' || resourceType === 'font') {
                    req.abort();
                } else {
                    req.continue();
                }
            });
            
            // Handle page errors
            this.page.on('error', (error) => {
                console.log('⚠️ خطأ في الصفحة:', error.message);
            });
            
            this.page.on('pageerror', (error) => {
                console.log('⚠️ خطأ JavaScript:', error.message);
            });
            
            console.log('✅ تم إعداد الصفحة بنجاح');
        } catch (error) {
            console.error('❌ فشل في إعداد الصفحة:', error.message);
            throw error;
        }
    }

    async scrapeRestaurants() {
        try {
            await this.init();
            
            for (const query of this.searchQueries) {
                console.log(`🔍 البحث عن: ${query}`);
                await this.searchAndScrape(query);
                
                // تأخير بين الاستعلامات
                await this.delay(2000);
            }
            
            // إزالة التكرارات وتطبيع البيانات
            const uniqueRestaurants = this.removeDuplicates();
            const normalizedRestaurants = this.normalizeData(uniqueRestaurants);
            
            // حفظ البيانات
            await this.saveResults(normalizedRestaurants);
            
            // إرسال إلى API
            await this.sendToAPI(normalizedRestaurants);
            
            this.printStats();
            
        } catch (error) {
            console.error('❌ خطأ في العملية:', error);
        } finally {
            if (this.browser) {
                await this.browser.close();
            }
        }
    }

    async searchAndScrape(query) {
        try {
            // الانتقال إلى Google Maps
            await this.page.goto('https://www.google.com/maps', { 
                waitUntil: 'networkidle2',
                timeout: this.config.timeout 
            });

            // البحث
            await this.page.waitForSelector('input#searchboxinput', { timeout: 10000 });
            await this.page.click('input#searchboxinput');
            await this.page.keyboard.down('Control');
            await this.page.keyboard.press('KeyA');
            await this.page.keyboard.up('Control');
            await this.page.type('input#searchboxinput', query);
            await this.page.keyboard.press('Enter');

            // انتظار النتائج
            await this.page.waitForSelector('div[role="main"]', { timeout: 15000 });
            await this.delay(3000);

            // التمرير لتحميل المزيد من النتائج
            await this.scrollResults();

            // استخراج البيانات الأساسية
            const places = await this.extractPlacesList();
            console.log(`📍 تم العثور على ${places.length} مكان`);
            
            this.stats.searched += places.length;

            // جلب التفاصيل لكل مكان
            for (let i = 0; i < Math.min(places.length, this.config.maxResults); i++) {
                const place = places[i];
                
                if (this.seenPlaces.has(place.name + place.address)) {
                    this.stats.duplicates++;
                    continue;
                }
                
                this.seenPlaces.add(place.name + place.address);
                
                try {
                    const details = await this.getPlaceDetails(place, i);
                    if (details) {
                        this.restaurants.push(details);
                        this.stats.scraped++;
                        console.log(`✅ تم كشط: ${details.name}`);
                    }
                } catch (error) {
                    console.log(`❌ خطأ في كشط ${place.name}: ${error.message}`);
                    this.stats.errors++;
                }
                
                // تأخير بين الطلبات
                await this.delay(1000);
            }

        } catch (error) {
            console.error(`❌ خطأ في البحث عن "${query}":`, error.message);
            this.stats.errors++;
        }
    }

    async scrollResults() {
        const resultsSelector = 'div[role="main"]';
        
        for (let i = 0; i < 3; i++) {
            await this.page.evaluate((selector) => {
                const element = document.querySelector(selector);
                if (element) {
                    element.scrollTop = element.scrollHeight;
                }
            }, resultsSelector);
            
            await this.delay(2000);
        }
    }

    async extractPlacesList() {
        return await this.page.evaluate(() => {
            const places = [];
            const items = document.querySelectorAll('div[role="article"], a[data-value="Directions"]');
            
            items.forEach((item, index) => {
                try {
                    // البحث عن اسم المكان
                    const nameElement = item.querySelector('div.fontHeadlineSmall span, .qBF1Pd, .NrDZNb, [data-value="Directions"] .qBF1Pd');
                    
                    // البحث عن التقييم
                    const ratingElement = item.querySelector('span.MW4etd, .fontBodyMedium span, [aria-label*="stars"]');
                    
                    // البحث عن نوع المكان/العنوان
                    const typeElement = item.querySelector('div.W4Efsd:last-child, .W4Efsd .fontBodyMedium, .W4Efsd span');
                    
                    if (nameElement) {
                        const name = nameElement.textContent?.trim();
                        const rating = ratingElement ? parseFloat(ratingElement.textContent?.replace(/[^\d.,]/g, '')) : 0;
                        const type = typeElement ? typeElement.textContent?.trim() : '';
                        
                        if (name && name.length > 2) {
                            places.push({
                                name,
                                rating: isNaN(rating) ? 0 : rating,
                                type,
                                address: type,
                                index
                            });
                        }
                    }
                } catch (error) {
                    console.log('خطأ في استخراج البيانات:', error);
                }
            });
            
            return places;
        });
    }

    async getPlaceDetails(place, index) {
        try {
            // النقر على المكان لفتح التفاصيل
            const placeSelectors = [
                `div[role="article"]:nth-child(${index + 1})`,
                `a[data-value="Directions"]:nth-child(${index + 1})`,
                `div.Nv2PK:nth-child(${index + 1})`
            ];
            
            let clicked = false;
            for (const selector of placeSelectors) {
                try {
                    await this.page.waitForSelector(selector, { timeout: 3000 });
                    await this.page.click(selector);
                    clicked = true;
                    break;
                } catch (e) {
                    continue;
                }
            }
            
            if (!clicked) {
                throw new Error('لم يتم العثور على المكان للنقر عليه');
            }

            // انتظار تحميل التفاصيل
            await this.delay(2000);

            // استخراج التفاصيل
            const details = await this.page.evaluate((baseName) => {
                const result = {
                    name: baseName,
                    rating: 0,
                    cuisine: [],
                    price_tier: 'medium',
                    description: '',
                    location: { latitude: 0, longitude: 0 },
                    events: ['Family Friendly'],
                    avg_bill_for_3: 200
                };

                try {
                    // الاسم
                    const nameEl = document.querySelector('h1.DUwDvf, .x3AX1-LfntMc-header-title-title, .qrShPb h1');
                    if (nameEl) result.name = nameEl.textContent?.trim() || baseName;

                    // التقييم
                    const ratingEl = document.querySelector('div.F7nice span[aria-hidden="true"], .jANrlb .fontDisplayLarge');
                    if (ratingEl) {
                        const rating = parseFloat(ratingEl.textContent?.replace(/[^\d.,]/g, ''));
                        if (!isNaN(rating)) result.rating = rating;
                    }

                    // نوع المطبخ من الوصف
                    const categoryEl = document.querySelector('button[data-value="Category"], .DkEaL, .mgr77e .DkEaL');
                    if (categoryEl) {
                        const category = categoryEl.textContent?.trim();
                        if (category) {
                            result.cuisine = [category];
                            
                            // تحديد نوع المطبخ بناءً على الفئة
                            const categoryLower = category.toLowerCase();
                            if (categoryLower.includes('italian')) result.cuisine = ['Italian'];
                            else if (categoryLower.includes('chinese')) result.cuisine = ['Chinese'];
                            else if (categoryLower.includes('japanese')) result.cuisine = ['Japanese'];
                            else if (categoryLower.includes('indian')) result.cuisine = ['Indian'];
                            else if (categoryLower.includes('mexican')) result.cuisine = ['Mexican'];
                            else if (categoryLower.includes('fast food')) result.cuisine = ['Fast Food'];
                            else if (categoryLower.includes('cafe')) result.cuisine = ['Cafe'];
                            else if (categoryLower.includes('restaurant')) result.cuisine = ['International'];
                        }
                    }

                    // السعر من الرموز
                    const priceEl = document.querySelector('[aria-label*="Price"], .mgr77e .fontBodyMedium');
                    if (priceEl) {
                        const priceText = priceEl.textContent || priceEl.getAttribute('aria-label') || '';
                        const dollarCount = (priceText.match(/\$/g) || []).length;
                        if (dollarCount === 1) result.price_tier = 'low';
                        else if (dollarCount === 2) result.price_tier = 'medium';
                        else if (dollarCount >= 3) result.price_tier = 'high';
                    }

                    // الوصف من المراجعات أو المعلومات
                    const descEl = document.querySelector('.PYvSYb, .mgr77e .fontBodyMedium, .W4Efsd .fontBodyMedium');
                    if (descEl) {
                        result.description = descEl.textContent?.trim() || `${result.name} restaurant located in Riyadh.`;
                    } else {
                        result.description = `${result.name} restaurant located in Riyadh with ${result.rating} star rating.`;
                    }

                    // الإحداثيات من الرابط
                    const url = window.location.href;
                    const coordMatch = url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
                    if (coordMatch) {
                        result.location.latitude = parseFloat(coordMatch[1]);
                        result.location.longitude = parseFloat(coordMatch[2]);
                    } else {
                        // إحداثيات افتراضية للرياض
                        result.location.latitude = 24.7136 + (Math.random() - 0.5) * 0.1;
                        result.location.longitude = 46.6753 + (Math.random() - 0.5) * 0.1;
                    }

                    // تقدير متوسط الفاتورة بناءً على مستوى السعر
                    if (result.price_tier === 'low') result.avg_bill_for_3 = 90;
                    else if (result.price_tier === 'medium') result.avg_bill_for_3 = 200;
                    else if (result.price_tier === 'high') result.avg_bill_for_3 = 350;

                    // الأحداث بناءً على نوع المطبخ
                    if (result.cuisine.includes('Cafe')) {
                        result.events = ['Casual Dining', 'Work Friendly'];
                    } else if (result.cuisine.includes('Fast Food')) {
                        result.events = ['Quick Service', 'Family Friendly'];
                    } else if (result.price_tier === 'high') {
                        result.events = ['Fine Dining', 'Date Night', 'Business Dining'];
                    } else {
                        result.events = ['Family Friendly', 'Casual Dining'];
                    }

                } catch (error) {
                    console.log('خطأ في استخراج التفاصيل:', error);
                }

                return result;
            }, place.name);

            // إضافة معرف فريد
            details.id = uuidv4().substring(0, 8);
            
            // إضافة صورة افتراضية
            details.image_url = this.getDefaultImage(details.cuisine[0] || 'Restaurant');

            return details;

        } catch (error) {
            throw new Error(`فشل في جلب تفاصيل ${place.name}: ${error.message}`);
        }
    }

    getDefaultImage(cuisine) {
        const imageMap = {
            'Italian': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=500',
            'Chinese': 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=500',
            'Japanese': 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=500',
            'Fast Food': 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=500',
            'Cafe': 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=500',
            'International': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500'
        };
        
        return imageMap[cuisine] || imageMap['International'];
    }

    removeDuplicates() {
        const seen = new Set();
        const unique = [];
        
        for (const restaurant of this.restaurants) {
            const key = `${restaurant.name.toLowerCase()}_${Math.round(restaurant.location.latitude * 100)}_${Math.round(restaurant.location.longitude * 100)}`;
            
            if (!seen.has(key)) {
                seen.add(key);
                unique.push(restaurant);
            } else {
                this.stats.duplicates++;
            }
        }
        
        return unique;
    }

    normalizeData(restaurants) {
        return restaurants.map(restaurant => ({
            ...restaurant,
            name: restaurant.name.trim(),
            rating: Math.min(Math.max(restaurant.rating, 0), 5),
            avg_bill_for_3: Math.round(restaurant.avg_bill_for_3),
            cuisine: restaurant.cuisine.filter(c => c && c.trim()),
            events: restaurant.events.filter(e => e && e.trim()),
            description: restaurant.description.trim() || `${restaurant.name} restaurant in Riyadh.`
        }));
    }

    async saveResults(restaurants) {
        try {
            await fs.ensureDir('../backend/data');
            await fs.writeJSON(this.config.outputFile, restaurants, { spaces: 2 });
            console.log(`💾 تم حفظ ${restaurants.length} مطعم في ${this.config.outputFile}`);
        } catch (error) {
            console.error('❌ خطأ في حفظ الملف:', error);
        }
    }

    async sendToAPI(restaurants) {
        try {
            console.log('📤 إرسال البيانات إلى API...');
            
            const response = await axios.post('http://localhost:8000/api/import', restaurants, {
                headers: { 'Content-Type': 'application/json' },
                timeout: 30000
            });
            
            console.log('✅ تم إرسال البيانات بنجاح:', response.data);
        } catch (error) {
            console.log('⚠️  لم يتم إرسال البيانات إلى API:', error.message);
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
        console.log(`⏱️  المدة: ${minutes}m ${seconds}s`);
        console.log(`🔍 أماكن تم البحث عنها: ${this.stats.searched}`);
        console.log(`📥 مطاعم تم كشطها: ${this.stats.scraped}`);
        console.log(`🔄 تكرارات تم إزالتها: ${this.stats.duplicates}`);
        console.log(`❌ أخطاء: ${this.stats.errors}`);
        console.log(`📈 معدل النجاح: ${((this.stats.scraped / this.stats.searched) * 100).toFixed(1)}%`);
    }
}

// تشغيل السكربت
async function main() {
    const scraper = new GoogleMapsRestaurantScraper({
        headless: false, // تغيير إلى true للتشغيل في الخلفية
        maxResults: 30,
        slowMo: 50
    });
    
    await scraper.scrapeRestaurants();
}

// تشغيل إذا تم استدعاء الملف مباشرة
if (require.main === module) {
    main().catch(console.error);
}

module.exports = GoogleMapsRestaurantScraper;
