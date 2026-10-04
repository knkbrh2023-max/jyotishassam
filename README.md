# জ্যোতিষ অসম — Production-ready frontend + backend starter

## What is included
- Daily 12-sign Rashifal
- Assamese / English / Hindi UI
- Birth Chart ₹299
- Love Reading ₹99
- Career Reading ₹199
- Customer birth-details form
- Razorpay Checkout integration hook
- Payment verification API contract
- Customer report/status page
- Production admin architecture
- Supabase database schema
- AI report-generation architecture
- No WhatsApp booking

## Very important
The ZIP is **not claiming that real payments/AI/PDF are live yet**. GitHub Pages cannot securely run payment verification or hold secret API keys.

### Step 1 — Upload frontend
Upload the website files to your GitHub Pages repository.

### Step 2 — Create Supabase
Create a Supabase project and run `supabase/schema.sql` in SQL Editor.

### Step 3 — Deploy backend
Deploy the API/Edge Functions described in `backend/README.md` and `supabase/functions/`.

### Step 4 — Configure frontend
Edit `config.js`:
- `apiBaseUrl` = your real backend URL
- `siteUrl` = your real website URL

### Step 5 — Razorpay
Create a Razorpay account and use its Key ID in the backend only. The secret key must never be placed in GitHub files.

### Step 6 — AI + astrology engine
Connect a reliable astrology calculation engine/API on the backend. Calculate planetary positions first; then send those structured results to the AI for interpretation.

### Step 7 — PDF + email
Generate the PDF server-side and store it in private storage or a signed URL. Send the report link to the customer's email after successful payment.

### Step 8 — Admin
Use Supabase Auth (or another real auth provider) and RLS. Never use a frontend PIN/localStorage as production security.

### Step 9 — AdSense
Only add the official AdSense code after approval.

## Prices
- Birth Chart — ₹299
- Love Reading — ₹99
- Career Reading — ₹199


## Current public configuration
- Website: https://knkbrh2023-max.github.io/jyotish-assam/
- Supabase project: https://ihbdrtnkfitytklonnel.supabase.co
- Razorpay mode: TEST
- Razorpay Key ID is configured in `config.js`.

## Required for final live automation
Razorpay Secret Key, Supabase service-role key, and AI/astrology provider secrets must be stored only as backend/Edge Function secrets. Never put them in GitHub/frontend files.


## Added: জীৱনৰ সংকেত module
- `jibonor-sonket.html` — searchable category page
- `jibonor-sonket.css` — premium responsive styling
- `jibonor-sonket.js` — 105 article dataset
- 105 static SEO-friendly article pages
- Main homepage navigation + CTA updated
- `sitemap.xml` updated with all new URLs
