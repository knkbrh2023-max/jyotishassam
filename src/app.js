document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('kundliForm');
    const submitBtn = document.getElementById('submitBtn');
    const loadingStatus = document.getElementById('loadingStatus');
    const statusText = document.getElementById('statusText');

    // Prices mapping based on backend logic
    const prices = {
        'free_kundli': 0,
        'birth_chart': 299,
        'love': 99,
        'career': 199
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Get form data
        const customerDetails = {
            name: document.getElementById('fullName').value,
            date: document.getElementById('dob').value,
            time: document.getElementById('time').value,
            place: document.getElementById('place').value,
            // (In a real app, geocode the place to Lat/Lng here before sending)
            lat: 26.14, // Dummy Guwahati Lat
            lng: 91.73  // Dummy Guwahati Lng
        };

        const serviceType = document.getElementById('serviceType').value;
        const amount = prices[serviceType];

        // UI Feedback
        submitBtn.disabled = true;
        loadingStatus.style.display = 'block';

        if (amount === 0) {
            // FREE KUNDLI LOGIC
            statusText.innerText = "আপোনাৰ বিনামূলীয়া কুণ্ডলী প্ৰস্তুত কৰা হৈছে...";
            // TODO: Call a different API for just the free chart calculation
            setTimeout(() => {
                alert("Free Kundli calculation logic will be integrated here.");
                resetUI();
            }, 2000);
            return;
        }

        // PAID REPORT LOGIC
        try {
            statusText.innerText = "Payment পেজ প্ৰস্তুত কৰা হৈছে...";
            
            // 1. Create Order in Supabase Backend
            const orderRes = await fetch(`${window.JA_CONFIG.apiBaseUrl}/create-order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    serviceType: serviceType,
                    amount: amount,
                    customerDetails: customerDetails
                })
            });

            const orderData = await orderRes.json();

            if (!orderData.success) {
                throw new Error("Failed to create order");
            }

            // 2. Open Razorpay Checkout
            statusText.innerText = "Payment ৰ বাবে অপেক্ষা কৰা হৈছে...";
            
            const options = {
                key: window.JA_CONFIG.razorpayKeyId,
                amount: amount * 100, // in paise
                currency: "INR",
                name: window.JA_CONFIG.brand,
                description: `${serviceType.replace('_', ' ').toUpperCase()} Report`,
                order_id: orderData.data.rzpOrderId,
                handler: function (response) {
                    // This handler is called when payment is successful on frontend
                    statusText.innerText = "Payment সফল হৈছে! আপোনাৰ ৰিপ'ৰ্ট প্ৰস্তুত কৰা হৈছে...";
                    
                    // The actual verification and AI generation happens via Webhook in Backend.
                    // Here we just redirect the user to a success/status page.
                    setTimeout(() => {
                        alert(`Payment Successful! Your Order ID is: ${orderData.data.orderNumber}`);
                        // window.location.href = `/status.html?orderId=${orderData.data.orderNumber}`;
                        resetUI();
                    }, 2000);
                },
                prefill: {
                    name: customerDetails.name
                },
                theme: {
                    color: "#D4AF37" // Brand Gold
                }
            };

            const rzp = new Razorpay(options);
            
            rzp.on('payment.failed', function (response){
                alert("Payment Failed. Please try again.");
                resetUI();
            });

            rzp.open();

        } catch (error) {
            console.error("Checkout Error:", error);
            alert("Something went wrong. Please try again.");
            resetUI();
        }
    });

    function resetUI() {
        submitBtn.disabled = false;
        loadingStatus.style.display = 'none';
        statusText.innerText = "প্ৰক্ৰিয়া চলি আছে...";
    }
});
