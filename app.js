// Configuration
const C = window.JA_CONFIG || {};

// Global state
let selectedService = null;
let currentOrder = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    checkExistingOrder();
});

// Setup event listeners
function setupEventListeners() {
    const serviceButtons = document.querySelectorAll('.service-btn');
    serviceButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const card = this.closest('.service-card');
            const serviceName = card.querySelector('h3').textContent;
            const price = parseInt(card.querySelector('.service-price').textContent.match(/\d+/)[0]);
            const icon = card.querySelector('.service-icon').textContent;
            
            let serviceCode = 'birth';
            if (serviceName.includes('Love') || serviceName.includes('প্রেম') || serviceName.includes('प्रेम')) serviceCode = 'love';
            else if (serviceName.includes('Career') || serviceName.includes('ক্যারিয়ার') || serviceName.includes('करियर')) serviceCode = 'career';
            
            selectService(serviceCode, serviceName, price, icon);
        });
    });

    const form = document.getElementById('birthDetailsForm');
    if (form) form.addEventListener('submit', handleFormSubmit);

    const modal = document.getElementById('serviceModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) closeServiceModal();
        });
    }

    const langBtns = document.querySelectorAll('.lang-btn');
    langBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            langBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            changeLanguage(this.textContent.trim().substring(0, 2).toLowerCase());
        });
    });
}

// Select service
function selectService(serviceCode, serviceName, price, icon) {
    selectedService = { code: serviceCode, name: serviceName, price: price, icon: icon };
    showServiceModal(serviceCode, serviceName, price);
}

// Show service modal with form
function showServiceModal(serviceCode, serviceName, price) {
    let modal = document.getElementById('serviceModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'serviceModal';
        modal.className = 'modal';
        document.body.appendChild(modal);

        if (!document.getElementById('modalStyles')) {
            const style = document.createElement('style');
            style.id = 'modalStyles';
            style.textContent = `
                .modal { display: none; position: fixed; z-index: 2000; left: 0; top: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.6); animation: fadeIn 0.3s; }
                .modal.active { display: flex; justify-content: center; align-items: center; }
                .modal-content { background: white; padding: 2rem; border-radius: 15px; width: 90%; max-width: 500px; max-height: 90vh; overflow-y: auto; position: relative; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3); }
                .modal-close { position: absolute; right: 1.5rem; top: 1.5rem; font-size: 2rem; cursor: pointer; color: #666; transition: color 0.3s; }
                .modal-close:hover { color: #000; }
                .form-group { margin-bottom: 1.5rem; }
                .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 600; color: #333; font-size: 0.95rem; }
                .form-group input, .form-group select { width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem; transition: border-color 0.3s; }
                .form-group input:focus, .form-group select:focus { outline: none; border-color: #6b46c1; box-shadow: 0 0 0 3px rgba(107, 70, 193, 0.1); }
                .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
                @media (max-width: 600px) { .form-row { grid-template-columns: 1fr; } .modal-content { width: 95%; padding: 1.5rem; } }
                .service-header { text-align: center; margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 2px solid #f0f0f0; }
                .service-header-icon { font-size: 3rem; margin-bottom: 0.5rem; }
                .service-header h2 { font-size: 1.5rem; color: #333; margin-bottom: 0.5rem; }
                .service-header p { color: #d4af37; font-weight: 600; font-size: 1.2rem; }
                .form-actions { display: flex; gap: 1rem; margin-top: 2rem; }
                .form-actions button { flex: 1; padding: 0.75rem 1.5rem; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; transition: all 0.3s; font-size: 1rem; }
                .btn-submit { background: linear-gradient(135deg, #6b46c1, #7c3aed); color: white; }
                .btn-submit:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(107, 70, 193, 0.3); }
                .btn-cancel { background: #f0f0f0; color: #333; }
                .btn-cancel:hover { background: #e0e0e0; }
                .loading { display: none; text-align: center; padding: 2rem; }
                .loading.active { display: block; }
                .spinner { border: 4px solid #f3f3f3; border-top: 4px solid #6b46c1; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 1rem; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                .error-message { background: #fee; color: #c33; padding: 1rem; border-radius: 6px; margin-bottom: 1rem; display: none; }
                .error-message.show { display: block; }
                .time-inputs { display: flex; gap: 5px; }
                .time-inputs input, .time-inputs select { padding: 0.75rem 0.5rem; text-align: center; }
            `;
            document.head.appendChild(style);
        }
    }

    const serviceIcons = { birth: '🔮', love: '❤️', career: '💼' };

    modal.innerHTML = `
        <div class="modal-content">
            <span class="modal-close" onclick="closeServiceModal()">&times;</span>
            <div id="modalBody">
                <div class="service-header">
                    <div class="service-header-icon">${serviceIcons[serviceCode] || '🔮'}</div>
                    <h2>${serviceName}</h2>
                    <p>₹${price}</p>
                </div>
                <div class="error-message" id="errorMessage"></div>
                <form id="birthDetailsForm">
                    <div class="form-group"><label>নাম / Name *</label><input type="text" name="name" placeholder="আপোনাৰ সম্পূৰ্ণ নাম" required></div>
                    <div class="form-group"><label>ইমেইল / Email *</label><input type="email" name="email" placeholder="your@email.com" required></div>
                    
                    <div class="form-row">
                        <div class="form-group"><label>জন্ম তাৰিখ / Date *</label><input type="date" name="birthDate" required></div>
                        <div class="form-group">
                            <label>জন্ম সময় / Time *</label>
                            <div class="time-inputs">
                                <input type="number" name="birthHour" placeholder="ঘণ্টা" min="1" max="12" required style="width: 33%;">
                                <input type="number" name="birthMinute" placeholder="মিনিট" min="0" max="59" required style="width: 33%;">
                                <select name="birthAmpm" required style="width: 34%;">
                                    <option value="AM">AM</option>
                                    <option value="PM">PM</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div class="form-group"><label>জন্ম স্থান / Place *</label><input type="text" name="birthPlace" placeholder="City, State, Country" required></div>
                    <div class="form-group">
                        <label>ভাষা / Language *</label>
                        <select name="language" required>
                            <option value="as">Assamese (অসমীয়া)</option>
                            <option value="en">English</option>
                            <option value="hi">Hindi (हिन्दी)</option>
                        </select>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn-cancel" onclick="closeServiceModal()">বাতিল / Cancel</button>
                        <button type="submit" class="btn-submit">পেমেন্ট কৰক / Pay ₹${price}</button>
                    </div>
                </form>
                <div class="loading" id="loadingDiv">
                    <div class="spinner"></div>
                    <p>প্রক্রিয়াকরণ চলছে... Processing...</p>
                </div>
            </div>
        </div>
    `;

    document.getElementById('birthDetailsForm').addEventListener('submit', handleFormSubmit);
    modal.classList.add('active');
}

function closeServiceModal() {
    const modal = document.getElementById('serviceModal');
    if (modal) modal.classList.remove('active');
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);

    if (!formData.get('name') || !formData.get('email') || !formData.get('birthDate') || 
        !formData.get('birthHour') || !formData.get('birthMinute') || !formData.get('birthPlace')) {
        showError('সকলো field পূৰণ কৰক / Fill all fields');
        return;
    }

    let hour = parseInt(formData.get('birthHour'));
    const minute = formData.get('birthMinute').padStart(2, '0');
    const ampm = formData.get('birthAmpm');

    if (ampm === 'PM' && hour < 12) hour += 12;
    if (ampm === 'AM' && hour === 12) hour = 0;
    
    const formattedTime = `${hour.toString().padStart(2, '0')}:${minute}:00`;

    const selectedLang = formData.get('language') || 'as';

    showLoading(true);

    try {
        const orderResponse = await fetch(`${C.apiBaseUrl}/create-order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                service: selectedService.code,
                name: formData.get('name'),
                email: formData.get('email'),
                birthDate: formData.get('birthDate'),
                birthTime: formattedTime,
                birthPlace: formData.get('birthPlace'),
                language: selectedLang
            })
        });

        if (!orderResponse.ok) throw new Error('Order creation failed (Server error)');
        const orderData = await orderResponse.json();
        if (!orderData.success) throw new Error(orderData.error || 'Order creation failed');

        currentOrder = orderData;
        currentOrder.selectedLanguage = selectedLang;
        currentOrder.serviceCode = selectedService.code;

        handleRazorpayPayment(orderData);

    } catch (error) {
        console.error('Error:', error);
        showError('Error: ' + error.message);
        showLoading(false);
    }
}

// Handle Razorpay payment
function handleRazorpayPayment(orderData) {
    const options = {
        key: C.razorpayKeyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: C.brand || 'Jyotish Assam',
        description: `${orderData.serviceName} Reading`,
        order_id: orderData.razorpayOrderId,
        handler: function(response) {
            verifyPayment(
                orderData.orderId,
                response.razorpay_order_id,
                response.razorpay_payment_id,
                response.razorpay_signature
            );
        },
        prefill: { name: currentOrder.name, email: currentOrder.email },
        theme: { color: '#6b46c1' }
    };

    try {
        const razorpay = new Razorpay(options);
        razorpay.open();
    } catch(err) {
        showError("Razorpay SDK load হোৱা নাই। ইণ্টাৰনেট চেক কৰক।");
        showLoading(false);
    }
}

// Verify payment
async function verifyPayment(orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature) {
    try {
        const verifyResponse = await fetch(`${C.apiBaseUrl}/verify-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                orderId: orderId,
                razorpay_order_id: razorpayOrderId,
                razorpay_payment_id: razorpayPaymentId,
                razorpay_signature: razorpaySignature
            })
        });

        const verifyData = await verifyResponse.json();
        if (!verifyData.success) {
            showError('Payment verification failed');
            showLoading(false);
            return;
        }

        const lang = currentOrder ? currentOrder.selectedLanguage : 'as';
        const sCode = currentOrder ? currentOrder.serviceCode : 'birth';
        generateReport(orderId, lang, sCode);

    } catch (error) {
        console.error('Verification error:', error);
        showError('Payment verification error: ' + error.message);
        showLoading(false);
    }
}

// Generate report with tailored Love & Career Reports (No Ascendant/Planetary Position tables)
async function generateReport(orderId, language, serviceCode) {
    try {
        const loadingText = document.querySelector('#loadingDiv p');
        if (loadingText) loadingText.innerText = "Generating Report... / ৰিপোৰ্ট প্ৰস্তুত কৰা হৈছে...";

        const finalOrderId = orderId || "JA-MTS82YYC-34BBE39C";
        const lang = language || 'as';
        const sCode = serviceCode || 'birth';

        const reportResponse = await fetch("https://ihbdrtnkfitytklonnel.supabase.co/functions/v1/calculate-chart", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: finalOrderId })
        });

        const result = await reportResponse.json();

        if (!result.success) {
            showError('Error: ' + (result.error || JSON.stringify(result)));
            showLoading(false);
            return;
        }

        const c = result.chart;

        // Dynamic calculation of years from Dasha periods for precise predictions
        const currentYear = new Date().getFullYear();
        let activeDashaLord = "Jupiter";
        let dashaEndDate = "2030";
        if (c.dashas && c.dashas.length > 0) {
            const currentDasha = c.dashas.find(d => new Date(d.start_date) <= new Date() && new Date(d.end_date) >= new Date()) || c.dashas[1] || c.dashas[0];
            activeDashaLord = currentDasha.lord;
            dashaEndDate = currentDasha.end_date.split('-')[0];
        }

        // Multi-language Dictionaries tailored specifically for Love & Career
        const dict = {
            as: {
                title: "বিশেষ জ্যোতিষ ৰিপোৰ্ট",
                birthTitle: "জন্মৰ বিৱৰণ (Birth Details)",
                date: "জন্ম তাৰিখ", time: "জন্ম সময়", place: "জন্ম স্থান",
                printBtn: "🖨️ ৰিপোৰ্ট প্ৰিণ্ট কৰক",
                
                serviceBirthTitle: "🔮 সম্পূৰ্ণ জন্ম কুণ্ডলী বিশ্লেষণ",
                serviceBirthDesc: "আপোনাৰ গ্ৰহৰ স্থিতি অনুসৰি সামগ্রিক ভাগ্য, শক্তি আৰু আধ্যাত্মিক পথৰ এক সবিশেষ বিশ্লেষণ ইয়াত প্ৰদান কৰা হৈছে।",

                // Detailed Love Predictions with Years & Specifics
                loveTitle: "❤️ প্ৰেম আৰু সম্পৰ্কৰ বিশদ ভৱিষ্যদ্বাণী",
                timingTitle: "🕰️ প্ৰেম কেতিয়া হোৱাৰ সম্ভাৱনা আছে?",
                timingDesc: `বৰ্তমান আপোনাৰ কুণ্ডলীত ${activeDashaLord} মহা দশা চলি আছে। জ্যোতিষ্যিক গণনা মতে, বিশেষকৈ <strong>${currentYear} ৰ পৰা ${parseInt(currentYear)+2} চনৰ ভিতৰত</strong> আপোনাৰ জীৱনত প্ৰেম বা ৰোমাণ্টিক সম্পৰ্ক প্ৰৱেশ কৰাৰ প্ৰবল সম্ভাৱনা আছে।`,
                
                natureTitle: "👥 সংগী (ল’ৰা/ছোৱালীজন) কেনেকুৱা স্বভাৱৰ হ’ব?",
                natureDesc: "আপোনাৰ ভৱিষ্য্ত সংগী অত্যন্ত আকৰ্ষণীয় ব্যক্তিত্বৰ, মৰমীয়াল, বুদ্ধিমান আৰু শান্ত স্বভাৱৰ হ’ব। তেওঁ পৰিয়ালৰ প্ৰতি দায়বদ্ধ আৰু আপোনাৰ প্ৰতি সম্পূৰ্ণ সমৰ্পিত হ’ব।",
                
                profTitle: "💼 সংগীৰ পেছা (Profession) কি হ’ব পাৰে?",
                profTitleDesc: "গ্ৰহৰ স্থিতি অনুসাৰে সংগীজন বেংকিং, শিক্ষা খণ্ড, তথ্য প্ৰযুক্তি (IT), ব্যৱসায় বা কৃতি-শিল্পৰ লগত জড়িত হোৱাৰ যোগ সবল।",
                
                marriageTitle: "💍 বিবাহৰ সময় আৰু লাভ নে এৰেঞ্জ মেৰিজ?",
                marriageDate: `<strong>বিবাহৰ সম্ভাব্য সময়:</strong> ${parseInt(dashaEndDate)-3} আৰু ${dashaEndDate} চনৰ ভিতৰত বিবাহ সম্পন্ন হোৱাৰ যোগ আছে।`,
                marriageType: "<strong>বিবাহৰ প্ৰকাৰ:</strong> কুণ্ডলীত প্ৰেম বিবাহ (Love Marriage) হোৱাৰ সম্ভাৱনা প্ৰায় ৬৫% আৰু বাকী ৩৫% পৰিয়ালৰ সন্মতি ক্ৰমে এৰেঞ্জ মেৰিজ (Arrange Marriage) হোৱাৰ পথ মুকলি আছে।",

                // Detailed Career Predictions with Years & Job vs Business
                careerTitle: "💼 কেৰিয়াৰ, চাকৰি আৰু ব্যৱসায়িক ভৱিষ্যদ্বাণী",
                jobTimingTitle: "📈 চাকৰি পোৱাৰ সম্ভাৱনা আৰু সঠিক বছৰ:",
                jobTimingDesc: `কৰ্মস্থানৰ গ্ৰহৰ স্থিতি অনুযায়ী <strong>${currentYear} ৰ পৰা ${parseInt(currentYear)+1} চনৰ ভিতৰত</strong> আপোনাৰ স্থায়ী চাকৰি পোৱাৰ বা পদোন্নতি হোৱাৰ সোণালী সময় চলিছে।`,
                
                jobVsBizTitle: "⚖️ চাকৰি (Job) নে ব্যৱসায় (Business) কোনটো বেছি ভাল হ'ব?",
                jobVsBizDesc: "শনি আৰু সূৰ্যৰ প্ৰভাৱৰ বাবে আপোনাৰ ক্ষেত্ৰত ব্যৱসায়তকৈ স্থায়ী চাকৰি বা প্ৰতিযোগিতামূলক ক্ষেত্ৰত সফলতাৰ যোগ অলপ বেছি শক্তিশালী। অৱশ্যে, অংশীদাৰী নোহোৱাকৈ স্বাধীন ব্যৱসায় কৰিলে ${parseInt(currentYear)+3} চনৰ পিছত আশাতীত লাভ কৰিব পাৰিব।",
                
                successYearTitle: "🎯 কেৰিয়াৰত প্ৰকৃত সফলতা কেতিয়া আহিব?",
                successYearDesc: `গ্ৰহৰ গতিবিধি লক্ষ্য কৰি ক’ব পাৰি যে <strong>${dashaEndDate} চনৰ ভিতৰত</strong> আপুনি আপোনাৰ কেৰিয়াৰৰ শীৰ্ষস্থান লাভ কৰিব আৰু বিত্তীয়ভাৱে অতি শক্তিশালী হৈ উঠিব।`
            },
            en: {
                title: "Specialized Astrology Report",
                birthTitle: "Birth Details",
                date: "Birth Date", time: "Birth Time", place: "Birth Place",
                printBtn: "🖨️ Print Report",
                
                serviceBirthTitle: "🔮 Complete Birth Chart Analysis",
                serviceBirthDesc: "A detailed breakdown of your life path, strengths, and overall destiny based on your planetary positions.",

                loveTitle: "❤️ Advanced Love & Relationship Forecast",
                timingTitle: "🕰️ When is Love likely to happen?",
                timingDesc: `Currently, you are running under the ${activeDashaLord} Maha Dasha. Astrological calculations indicate high probabilities of entering a meaningful romantic relationship <strong>between ${currentYear} and ${parseInt(currentYear)+2}</strong>.`,
                
                natureTitle: "👥 What will your Partner's Nature be like?",
                natureDesc: "Your future partner will likely be charming, affectionate, intelligent, and deeply committed to family values and emotional harmony.",
                
                profTitle: "💼 What could be your Partner's Profession?",
                profTitleDesc: "Indications point towards careers in education, IT, banking, corporate sectors, or independent business.",
                
                marriageTitle: "💍 Marriage Timing & Love vs. Arrange Marriage",
                marriageDate: `<strong>Expected Marriage Timeline:</strong> Between ${parseInt(dashaEndDate)-3} and ${dashaEndDate}.`,
                marriageType: "<strong>Type of Marriage:</strong> There is a 65% probability of a Love Marriage, while a harmonious Arranged Marriage is also strongly supported by family alignments.",

                careerTitle: "💼 Career, Job & Business Forecast",
                jobTimingTitle: "📈 Job Opportunities & Favorable Year:",
                jobTimingDesc: `Based on your career house analysis, <strong>between ${currentYear} and ${parseInt(currentYear)+1}</strong> is the most auspicious period for securing a stable job or a major career promotion.`,
                
                jobVsBizTitle: "⚖️ Job vs. Business: Which is better?",
                jobVsBizDesc: "Planetary aspects favor a stable job or professional service initially. However, independent business ventures without partnerships can yield massive profits starting after anticipation in <strong>${parseInt(currentYear)+3}</strong>.",
                
                successYearTitle: "🎯 When will ultimate Career Success arrive?",
                successYearDesc: `Your major breakthrough and financial stability are destined to peak <strong>by the year ${dashaEndDate}</strong>.`
            },
            hi: {
                title: "विशेष ज्योतिष रिपोर्ट",
                birthTitle: "जन्म विवरण (Birth Details)",
                date: "जन्म तिथि", time: "जन्म समय", place: "जन्म स्थान",
                printBtn: "🖨️ पूर्ण रिपोर्ट प्रिंट करें",
                
                serviceBirthTitle: "🔮 पूर्ण जन्म कुंडली विश्लेषण",
                serviceBirthDesc: "ग्रहों की स्थिति के आधार पर आपके संपूर्ण जीवन पथ और भाग्य का विस्तृत विश्लेषण।",

                loveTitle: "❤️ प्रेम और संबंध विस्तृत भविष्यवाणी",
                timingTitle: "🕰️ प्रेम कब होने की संभावना है?",
                timingDesc: `वर्तमान में आपकी ${activeDashaLord} महादशा चल रही है। ज्योतिषीय गणना के अनुसार, विशेष रूप से <strong>${currentYear} से ${parseInt(currentYear)+2} के बीच</strong> आपके जीवन में प्रेम संबंध के प्रबल योग हैं।`,
                
                natureTitle: "👥 साथी (लड़का/लड़की) का स्वभाव कैसा होगा?",
                natureDesc: "आपका जीवनसाथी आकर्षक, स्नेही, बुद्धिमान और परिवार के प्रति पूरी तरह समर्पित स्वभाव का होगा।",
                
                profTitle: "💼 साथी का पेशा (Profession) क्या हो सकता है?",
                profTitleDesc: "संभावना है कि आपके साथी शिक्षा, बैंकिंग, आईटी या व्यवसाय क्षेत्र से जुड़े होंगे।",
                
                marriageTitle: "💍 विवाह का समय और लव vs अरेंज मैरिज",
                marriageDate: `<strong>विवाह का संभावित समय:</strong> ${parseInt(dashaEndDate)-3} से ${dashaEndDate} के बीच विवाह के योग हैं।`,
                marriageType: "<strong>विवाह का प्रकार:</strong> कुंडली में 65% योग लव मैरिज के हैं, शेष पारिवारिक सहमति से अरेंज मैरिज के संकेत हैं।",

,
                careerTitle: "💼 करियर, नौकरी और व्यवसाय पूर्वानुमान",
                jobTimingTitle: "📈 नौकरी मिलने के योग और अनुकूल वर्ष:",
                jobTimingDesc: `कर्म भाव के विश्लेषण के अनुसार, <strong>${currentYear} से ${parseInt(currentYear)+1} के बीच</strong> आपको स्थायी नौकरी या पदोन्नति मिलने का अत्यंत शुभ समय है।`,
                
                jobVsBizTitle: "⚖️ नौकरी (Job) या व्यवसाय (Business) में क्या बेहतर है?",
                jobVsBizDesc: "ग्रहीय प्रभावों के कारण आपके लिए नौकरी में स्थिरता के योग अधिक मजबूत हैं। हालांकि, ${parseInt(currentYear)+3} के बाद स्वतंत्र व्यवसाय में भी बड़ा लाभ मिल सकता है।",
                
                successYearTitle: "🎯 करियर में वास्तविक सफलता कब मिलेगी?",
                successYearDesc: `ग्रहों की चाल दर्शाती है कि <strong>वर्ष ${dashaEndDate} तक</strong> आप अपने करियर के सर्वोच्च शिखर पर होंगे और आर्थिक रूप से अत्यंत सुदृढ़ होंगे।`
            }
        };

        const t = dict[lang] || dict['as'];

        // Dynamic Service Content Selection (Strictly Love, Career or Birth without tables)
        let serviceSpecificContent = '';
        if (sCode === 'love') {
            serviceSpecificContent = `
                <div class="section" style="background: #fff1f2; border-left: 6px solid #e11d48;">
                    <h2 class="section-title" style="color: #e11d48;">${t.loveTitle}</h2>
                    
                    <div style="margin-bottom: 25px;">
                        <h3 style="color: #9f1239; font-size: 18px; margin-bottom: 8px;">${t.timingTitle}</h3>
                        <p style="font-size: 16px; color: #334155; line-height: 1.8;">${t.timingDesc}</p>
                    </div>

                    <div style="margin-bottom: 25px;">
                        <h3 style="color: #9f1239; font-size: 18px; margin-bottom: 8px;">${t.natureTitle}</h3>
                        <p style="font-size: 16px; color: #334155; line-height: 1.8;">${t.natureDesc}</p>
                    </div>

                    <div style="margin-bottom: 25px;">
                        <h3 style="color: #9f1239; font-size: 18px; margin-bottom: 8px;">${t.profTitle}</h3>
                        <p style="font-size: 16px; color: #334155; line-height: 1.8;">${t.profTitleDesc}</p>
                    </div>

                    <div>
                        <h3 style="color: #9f1239; font-size: 18px; margin-bottom: 8px;">${t.marriageTitle}</h3>
                        <p style="font-size: 16px; color: #334155; line-height: 1.8; margin-bottom: 5px;">${t.marriageDate}</p>
                        <p style="font-size: 16px; color: #334155; line-height: 1.8;">${t.marriageType}</p>
                    </div>
                </div>
            `;
        } else if (sCode === 'career') {
            serviceSpecificContent = `
                <div class="section" style="background: #eff6ff; border-left: 6px solid #2563eb;">
                    <h2 class="section-title" style="color: #2563eb;">${t.careerTitle}</h2>
                    
                    <div style="margin-bottom: 25px;">
                        <h3 style="color: #1e40af; font-size: 18px; margin-bottom: 8px;">${t.jobTimingTitle}</h3>
                        <p style="font-size: 16px; color: #334155; line-height: 1.8;">${t.jobTimingDesc}</p>
                    </div>

                    <div style="margin-bottom: 25px;">
                        <h3 style="color: #1e40af; font-size: 18px; margin-bottom: 8px;">${t.jobVsBizTitle}</h3>
                        <p style="font-size: 16px; color: #334155; line-height: 1.8;">${t.jobVsBizDesc}</p>
                    </div>

                    <div>
                        <h3 style="color: #1e40af; font-size: 18px; margin-bottom: 8px;">${t.successYearTitle}</h3>
                        <p style="font-size: 16px; color: #334155; line-height: 1.8;">${t.successYearDesc}</p>
                    </div>
                </div>
            `;
        } else {
            serviceSpecificContent = `
                <div class="section" style="background: #f5f3ff; border-left: 6px solid #7c3aed;">
                    <h2 class="section-title" style="color: #7c3aed;">${t.serviceBirthTitle}</h2>
                    <p style="font-size: 16px; color: #334155; line-height: 1.8;">${t.serviceBirthDesc}</p>
                </div>
            `;
        }

        const finalHtml = `
            <!DOCTYPE html>
            <html lang="${lang}">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${t.title} - Jyotish Assam</title>
                <style>
                    :root {
                        --primary: #6D28D9;
                        --secondary: #DB2777;
                        --dark: #0f172a;
                        --light: #f8fafc;
                        --border: #e2e8f0;
                        --card-bg: #ffffff;
                    }
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        background-color: #f1f5f9;
                        color: var(--dark);
                        margin: 0;
                        padding: 20px;
                        line-height: 1.7;
                    }
                    .report-container {
                        max-width: 900px;
                        margin: 0 auto;
                        background: var(--card-bg);
                        border-radius: 16px;
                        box-shadow: 0 10px 35px rgba(0,0,0,0.1);
                        overflow: hidden;
                    }
                    .header {
                        background: linear-gradient(135deg, var(--primary), var(--secondary));
                        color: white;
                        padding: 40px 20px;
                        text-align: center;
                    }
                    .header h1 { margin: 0 0 10px 0; font-size: 30px; font-weight: 700; }
                    .header p { margin: 0; opacity: 0.95; font-size: 16px; }
                    
                    .section { padding: 35px; border-bottom: 1px solid var(--border); }
                    .section:last-child { border-bottom: none; }
                    
                    .section-title {
                        font-size: 22px;
                        margin-top: 0;
                        margin-bottom: 20px;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        padding-left: 10px;
                    }
                    
                    .info-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
                        gap: 20px;
                        background: #f8fafc;
                        padding: 20px;
                        border-radius: 12px;
                        border: 1px solid var(--border);
                    }
                    .info-box { text-align: center; background: white; padding: 18px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
                    .info-label { font-size: 13px; color: #64748b; font-weight: 600; text-transform: uppercase; }
                    .info-value { font-size: 17px; font-weight: 700; color: var(--dark); margin-top: 6px; }
                    
                    .print-btn {
                        display: block;
                        width: 280px;
                        margin: 40px auto;
                        padding: 14px;
                        background: var(--dark);
                        color: white;
                        text-align: center;
                        border: none;
                        border-radius: 10px;
                        font-size: 16px;
                        cursor: pointer;
                        font-weight: bold;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                        transition: 0.3s;
                    }
                    .print-btn:hover { background: var(--primary); transform: translateY(-2px); }
                    
                    @media print {
                        .print-btn { display: none; }
                        body { background: white; padding: 0; }
                        .report-container { box-shadow: none; max-width: 100%; border-radius: 0; }
                    }
                </style>
            </head>
            <body>
                <div class="report-container">
                    <div class="header">
                        <h1>✨ জ্যোতিষ অসম - Jyotish Assam</h1>
                        <p>${t.title}</p>
                    </div>

                    <!-- Dynamic Service Specific Detailed Report (Love or Career) -->
                    ${serviceSpecificContent}
                    
                    <div class="section">
                        <h2 class="section-title" style="color: var(--primary); border-left: 5px solid var(--secondary);">👤 ${t.birthTitle}</h2>
                        <div class="info-grid">
                            <div class="info-box">
                                <div class="info-label">${t.date}</div>
                                <div class="info-value">${c.birth.date}</div>
                            </div>
                            <div class="info-box">
                                <div class="info-label">${t.time}</div>
                                <div class="info-value">${c.birth.time}</div>
                            </div>
                            <div class="info-box">
                                <div class="info-label">${t.place}</div>
                                <div class="info-value" style="text-transform: capitalize;">${c.birth.place}</div>
                            </div>
                        </div>
                    </div>
                    
                    <button class="print-btn" onclick="window.print()">${t.printBtn}</button>
                </div>
            </body>
            </html>
        `;

        displayReport(finalHtml);
        showLoading(false);
        closeServiceModal();

    } catch (error) {
        console.error('Report generation error:', error);
        showError('ইণ্টাৰনেটৰ সমস্যা বা চাৰ্ভাৰত সংযোগ হোৱা নাই।');
        showLoading(false);
    }
}

// Display report in current page
function displayReport(reportHtml) {
    document.open();
    document.write(reportHtml);
    document.close();
}

function showLoading(isLoading) {
    const loading = document.getElementById('loadingDiv');
    const form = document.getElementById('birthDetailsForm');
    if (loading) {
        loading.classList.toggle('active', isLoading);
        if (form) form.style.display = isLoading ? 'none' : 'block';
    }
}

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.add('show');
        setTimeout(() => { errorDiv.classList.remove('show'); }, 6000);
    } else {
        alert(message);
    }
}

function changeLanguage(lang) {
    localStorage.setItem('preferredLanguage', lang);
}

function checkExistingOrder() {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('orderId');
    if (orderId) console.log('Loading report for order:', orderId);
}

function loadRazorpayScript() {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.head.appendChild(script);
}

window.addEventListener('load', loadRazorpayScript);
