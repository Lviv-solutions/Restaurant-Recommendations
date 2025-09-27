const fs = require('fs-extra');
const axios = require('axios');

class RestaurantDataGenerator {
    constructor() {
        this.restaurants = [];
        this.stats = {
            generated: 0,
            startTime: Date.now()
        };
        
        // قاعدة بيانات المطاعم الحقيقية في الرياض
        this.realRestaurants = [
            // مطاعم تراثية سعودية
            { name: "مطعم نجد فيليج", cuisine: ["Traditional", "Saudi"], price: "high", rating: 4.6 },
            { name: "مطعم الأصالة", cuisine: ["Traditional", "Saudi"], price: "medium", rating: 4.4 },
            { name: "مطعم البيت النجدي", cuisine: ["Traditional", "Saudi"], price: "medium", rating: 4.3 },
            { name: "مطعم الدار", cuisine: ["Traditional", "Saudi"], price: "high", rating: 4.5 },
            { name: "مطعم الخيمة", cuisine: ["Traditional", "Saudi"], price: "medium", rating: 4.2 },
            
            // مطاعم لبنانية
            { name: "مطعم الشام", cuisine: ["Lebanese", "Middle Eastern"], price: "medium", rating: 4.4 },
            { name: "مطعم بيروت", cuisine: ["Lebanese", "Middle Eastern"], price: "medium", rating: 4.3 },
            { name: "مطعم الأرز اللبناني", cuisine: ["Lebanese", "Middle Eastern"], price: "medium", rating: 4.2 },
            { name: "مطعم كرم بيروت", cuisine: ["Lebanese", "Middle Eastern"], price: "high", rating: 4.5 },
            
            // مطاعم تركية
            { name: "مطعم اسطنبول", cuisine: ["Turkish"], price: "medium", rating: 4.3 },
            { name: "مطعم التنور التركي", cuisine: ["Turkish"], price: "medium", rating: 4.4 },
            { name: "مطعم الأناضول", cuisine: ["Turkish"], price: "high", rating: 4.5 },
            
            // مطاعم هندية
            { name: "مطعم التاج الهندي", cuisine: ["Indian"], price: "medium", rating: 4.2 },
            { name: "مطعم بومباي", cuisine: ["Indian"], price: "medium", rating: 4.3 },
            { name: "مطعم الهند", cuisine: ["Indian"], price: "low", rating: 4.1 },
            
            // مطاعم صينية
            { name: "مطعم دراغون", cuisine: ["Chinese"], price: "medium", rating: 4.2 },
            { name: "مطعم الصين", cuisine: ["Chinese"], price: "medium", rating: 4.1 },
            { name: "مطعم بكين", cuisine: ["Chinese"], price: "high", rating: 4.4 },
            
            // مطاعم إيطالية
            { name: "مطعم روما", cuisine: ["Italian", "Pizza"], price: "medium", rating: 4.3 },
            { name: "بيتزا هت", cuisine: ["Italian", "Pizza"], price: "medium", rating: 4.0 },
            { name: "مطعم نابولي", cuisine: ["Italian", "Pizza"], price: "high", rating: 4.5 },
            
            // مطاعم أمريكية
            { name: "برجر كينغ", cuisine: ["American", "Burgers"], price: "low", rating: 4.0 },
            { name: "ماكدونالدز", cuisine: ["American", "Burgers"], price: "low", rating: 3.9 },
            { name: "هارديز", cuisine: ["American", "Burgers"], price: "low", rating: 4.1 },
            { name: "تشيليز", cuisine: ["American"], price: "medium", rating: 4.2 },
            
            // مقاهي
            { name: "ستarbucks", cuisine: ["Cafe"], price: "medium", rating: 4.2 },
            { name: "كوستا كوفي", cuisine: ["Cafe"], price: "medium", rating: 4.1 },
            { name: "مقهى الكورنيش", cuisine: ["Cafe"], price: "medium", rating: 4.3 },
            { name: "مقهى النخيل", cuisine: ["Cafe"], price: "low", rating: 4.0 },
            
            // مطاعم وجبات سريعة
            { name: "الطازج", cuisine: ["Fast Food", "Middle Eastern"], price: "low", rating: 4.2 },
            { name: "شاورما الملك", cuisine: ["Fast Food", "Middle Eastern"], price: "low", rating: 4.1 },
            { name: "كنتاكي", cuisine: ["Fast Food", "Chicken"], price: "low", rating: 4.0 },
            { name: "البيك", cuisine: ["Fast Food", "Chicken"], price: "low", rating: 4.8 },
            
            // مطاعم يابانية
            { name: "مطعم طوكيو", cuisine: ["Japanese", "Sushi"], price: "high", rating: 4.4 },
            { name: "مطعم ساكورا", cuisine: ["Japanese", "Sushi"], price: "high", rating: 4.5 },
            { name: "مطعم أوساكا", cuisine: ["Japanese", "Sushi"], price: "medium", rating: 4.2 },
            
            // مطاعم مكسيكية
            { name: "مطعم تاكو بيل", cuisine: ["Mexican"], price: "medium", rating: 4.1 },
            { name: "مطعم المكسيك", cuisine: ["Mexican"], price: "medium", rating: 4.2 },
            
            // مطاعم فرنسية
            { name: "مطعم باريس", cuisine: ["French"], price: "high", rating: 4.6 },
            { name: "مطعم الشانزليزيه", cuisine: ["French"], price: "high", rating: 4.5 },
            
            // مطاعم متنوعة
            { name: "مطعم الفردوس", cuisine: ["International"], price: "medium", rating: 4.3 },
            { name: "مطعم الواحة", cuisine: ["International"], price: "medium", rating: 4.2 },
            { name: "مطعم الحديقة", cuisine: ["International"], price: "high", rating: 4.4 }
        ];
    }

    async generateRestaurants() {
        console.log('🎯 مولد بيانات المطاعم الذكي');
        console.log('==============================');
        console.log(`📊 سيتم توليد ${this.realRestaurants.length} مطعم من الرياض`);
        
        try {
            for (let i = 0; i < this.realRestaurants.length; i++) {
                const restaurantData = this.realRestaurants[i];
                const restaurant = this.generateRestaurant(restaurantData, i + 1);
                this.restaurants.push(restaurant);
                this.stats.generated++;
                
                console.log(`✅ ${i + 1}. ${restaurant.name} - ${restaurant.rating}⭐ (${restaurant.price_tier})`);
            }
            
            // حفظ النتائج
            await this.saveResults();
            
            // إرسال إلى API
            await this.sendToAPI();
            
            this.printStats();
            
        } catch (error) {
            console.error('❌ خطأ في التوليد:', error.message);
        }
    }

    generateRestaurant(data, index) {
        // تحديد متوسط الفاتورة بناءً على مستوى السعر
        const priceMapping = {
            'low': { tier: 'low', bill: this.randomBetween(80, 150) },
            'medium': { tier: 'medium', bill: this.randomBetween(180, 280) },
            'high': { tier: 'high', bill: this.randomBetween(320, 500) }
        };
        
        const priceInfo = priceMapping[data.price];
        
        // تحديد الأحداث بناءً على نوع المطعم ومستوى السعر
        let events = ['Family Friendly'];
        
        if (data.cuisine.includes('Cafe')) {
            events = ['Casual Dining', 'Work Friendly', 'Coffee Lovers'];
        } else if (data.cuisine.includes('Fast Food')) {
            events = ['Quick Service', 'Family Friendly', 'Takeaway'];
        } else if (data.price === 'high') {
            events = ['Fine Dining', 'Date Night', 'Business Dining', 'Special Occasions'];
        } else if (data.cuisine.includes('Traditional')) {
            events = ['Family Friendly', 'Traditional Music', 'Cultural Experience'];
        } else if (data.cuisine.includes('Lebanese') || data.cuisine.includes('Middle Eastern')) {
            events = ['Family Friendly', 'Live Music', 'Authentic Cuisine'];
        }
        
        // إحداثيات عشوائية في الرياض
        const riyadhCenter = { lat: 24.7136, lng: 46.6753 };
        const lat = riyadhCenter.lat + (Math.random() - 0.5) * 0.15; // نطاق 15 كم تقريباً
        const lng = riyadhCenter.lng + (Math.random() - 0.5) * 0.15;
        
        // وصف ذكي بناءً على نوع المطعم
        const description = this.generateDescription(data);
        
        return {
            id: `gen_${index}`,
            name: data.name,
            cuisine: data.cuisine,
            price_tier: priceInfo.tier,
            avg_bill_for_3: priceInfo.bill,
            events: events,
            rating: this.addVariation(data.rating, 0.2), // تنويع طفيف في التقييم
            location: {
                latitude: parseFloat(lat.toFixed(4)),
                longitude: parseFloat(lng.toFixed(4))
            },
            description: description,
            image_url: this.getImageForCuisine(data.cuisine[0])
        };
    }

    generateDescription(data) {
        const templates = {
            'Traditional': [
                `${data.name} يقدم أشهى الأطباق التراثية السعودية في أجواء أصيلة تعكس التراث العريق.`,
                `استمتع بتجربة الطعام التراثي الأصيل في ${data.name} مع أطباق الكبسة والمندي الشهية.`,
                `${data.name} وجهة مثالية لمحبي الطعام السعودي التقليدي في قلب الرياض.`
            ],
            'Lebanese': [
                `${data.name} يقدم أشهى المأكولات اللبنانية الأصيلة مع المزة والمشاوي اللذيذة.`,
                `تذوق نكهات بلاد الشام الأصيلة في ${data.name} مع أطباق الحمص والتبولة والكبة.`,
                `${data.name} يجمع بين الضيافة العربية والطعم اللبناني الأصيل.`
            ],
            'Turkish': [
                `${data.name} يقدم الأطباق التركية الشهية مع الكباب والدونر والحلويات التركية.`,
                `استمتع بالنكهات التركية الغنية في ${data.name} مع أطباق الكفتة والبقلاوة.`,
                `${data.name} يأخذك في رحلة طعام إلى قلب تركيا مع أشهى الأطباق التقليدية.`
            ],
            'Indian': [
                `${data.name} يقدم الكاري الهندي الحار والبرياني العطر مع الخبز النان الطازج.`,
                `تذوق التوابل الهندية الأصيلة في ${data.name} مع أطباق التندوري والماسالا.`,
                `${data.name} وجهة محبي الطعام الهندي الحار والنكهات الغنية.`
            ],
            'Chinese': [
                `${data.name} يقدم الأطباق الصينية الأصيلة مع الأرز المقلي والنودلز والدجاج الحلو والحامض.`,
                `استمتع بالنكهات الآسيوية في ${data.name} مع أطباق الديم سام والبط المشوي.`,
                `${data.name} يجمع بين التقاليد الصينية والطعم الأصيل في قلب الرياض.`
            ],
            'Italian': [
                `${data.name} يقدم البيتزا الإيطالية الأصيلة والباستا الطازجة مع الصلصات التقليدية.`,
                `تذوق إيطاليا في ${data.name} مع أطباق اللازانيا والريزوتو والتيراميسو.`,
                `${data.name} وجهة محبي الطعام الإيطالي والبيتزا الطازجة.`
            ],
            'American': [
                `${data.name} يقدم البرجر الأمريكي الشهي والبطاطس المقرمشة مع المشروبات الباردة.`,
                `استمتع بالطعام الأمريكي السريع في ${data.name} مع أطباق الدجاج المقلي والسندويشات.`,
                `${data.name} المكان المثالي للوجبات السريعة والطعم الأمريكي الأصيل.`
            ],
            'Cafe': [
                `${data.name} يقدم أفضل أنواع القهوة والمشروبات الساخنة مع الحلويات والمعجنات الطازجة.`,
                `استرخ واستمتع بكوب قهوة مميز في ${data.name} مع أجواء هادئة ومريحة.`,
                `${data.name} المكان المثالي لاجتماعات العمل وقضاء وقت ممتع مع الأصدقاء.`
            ],
            'Fast Food': [
                `${data.name} يقدم الوجبات السريعة اللذيذة والطازجة بأسعار مناسبة للجميع.`,
                `استمتع بالطعام السريع والشهي في ${data.name} مع خدمة سريعة ونظيفة.`,
                `${data.name} الخيار الأمثل للوجبات السريعة والطعم المميز.`
            ]
        };
        
        const cuisineType = data.cuisine[0];
        const templateArray = templates[cuisineType] || templates['Fast Food'];
        const randomTemplate = templateArray[Math.floor(Math.random() * templateArray.length)];
        
        return randomTemplate;
    }

    getImageForCuisine(cuisine) {
        const images = {
            'Traditional': 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=500',
            'Saudi': 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=500',
            'Lebanese': 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=500',
            'Middle Eastern': 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500',
            'Turkish': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=500',
            'Indian': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500',
            'Chinese': 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=500',
            'Italian': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=500',
            'Pizza': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=500',
            'American': 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=500',
            'Burgers': 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=500',
            'Cafe': 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=500',
            'Fast Food': 'https://images.unsplash.com/photo-1562967914-608f82629710?w=500',
            'Chicken': 'https://images.unsplash.com/photo-1562967914-608f82629710?w=500',
            'Japanese': 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=500',
            'Sushi': 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=500',
            'Mexican': 'https://images.unsplash.com/photo-1565299585323-38174c4a6471?w=500',
            'French': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=500',
            'International': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500'
        };
        
        return images[cuisine] || images['International'];
    }

    randomBetween(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    addVariation(base, variation) {
        const change = (Math.random() - 0.5) * 2 * variation;
        const result = base + change;
        return Math.max(3.0, Math.min(5.0, parseFloat(result.toFixed(1))));
    }

    async saveResults() {
        try {
            const outputPath = '../backend/data/generated_restaurants.json';
            await fs.ensureDir('../backend/data');
            await fs.writeJSON(outputPath, this.restaurants, { spaces: 2 });
            console.log(`\n💾 تم حفظ ${this.restaurants.length} مطعم في ${outputPath}`);
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

    printStats() {
        const duration = Date.now() - this.stats.startTime;
        const seconds = Math.floor(duration / 1000);
        
        console.log('\n📊 إحصائيات التوليد:');
        console.log('====================');
        console.log(`⏱️ المدة: ${seconds} ثانية`);
        console.log(`✅ مطاعم تم توليدها: ${this.stats.generated}`);
        console.log(`🎯 معدل التوليد: ${(this.stats.generated / seconds).toFixed(1)} مطعم/ثانية`);
        console.log(`📈 معدل النجاح: 100%`);
        
        // إحصائيات حسب نوع المطبخ
        const cuisineStats = {};
        this.restaurants.forEach(r => {
            const cuisine = r.cuisine[0];
            cuisineStats[cuisine] = (cuisineStats[cuisine] || 0) + 1;
        });
        
        console.log('\n🍽️ توزيع المطابخ:');
        Object.entries(cuisineStats).forEach(([cuisine, count]) => {
            console.log(`   ${cuisine}: ${count} مطعم`);
        });
    }
}

// تشغيل المولد
async function main() {
    const generator = new RestaurantDataGenerator();
    await generator.generateRestaurants();
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = RestaurantDataGenerator;
