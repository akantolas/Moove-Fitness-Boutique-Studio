# Move & Pose — Supabase booking, Stripe & email setup

Ροή: **λογαριασμός → κράτηση slot → email με τιμή + Stripe/PayPal/Revolut → webhook (Stripe) επιβεβαιώνει πακέτο & κράτηση**.

## 1. Supabase project

1. Δημιούργησε project στο [supabase.com](https://supabase.com)
2. **Authentication → Providers:** ενεργοποίησε Email (password) και **Google** (βλ. §1b)
3. **Authentication → URL Configuration:**
   - **Site URL:** `https://moovefitness.gr`
   - **Redirect URLs:** πρόσθεσε `https://moovefitness.gr/**`, `https://www.moovefitness.gr/**`, `https://moovefitness.gr/posing/auth/callback`, `https://moovefitness.gr/posing/account`, και `https://moovefitness.gr/posing/reset-password`
   - (Μην αφήνεις `http://localhost:3000` — τα email links θα σε πετάνε εκεί)
4. **SQL Editor:** τρέξε τα migrations:
   - `supabase/migrations/001_posing_booking.sql`
   - `supabase/migrations/002_profile_fields.sql` (phone, division, notes στο προφίλ)
   - `supabase/migrations/003_profile_avatar.sql` (avatar_url + bucket `posing-avatars`)
   - `supabase/migrations/008_july_package_offers.sql` (July Ruby/Diamond x8)
   - `supabase/migrations/009_profile_plan_prices.sql` (custom per-client prices)
5. Αντέγραψε:
   - Project URL → `VITE_SUPABASE_URL` + `SUPABASE_URL`
   - anon public key → `VITE_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY` (μόνο Vercel, ποτέ στο frontend)
   - Αν τα νέα `sb_secret_` keys δεν δουλεύουν στο API, χρησιμοποίησε tab **Legacy anon, service_role API keys** → `service_role`

### Admin (Μαγδα)

Ορίζεις στο Vercel:

```
POSE_ADMIN_EMAILS=info@moovefitness.gr
```

Το πρώτο login με αυτό το email παίρνει αυτόματα `role=admin` και πρόσβαση στο `/posing/admin`.

### 1b. Google sign-in

Το site έχει κουμπί **Google** στο `/posing/login` και `/posing/signup`. Μετά το enable στο Supabase:

**Google**
1. [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials → OAuth 2.0 Client ID (Web)
2. **Authorized redirect URI:** `https://<PROJECT_REF>.supabase.co/auth/v1/callback` (το βρίσκεις στο Supabase → Authentication → Google → callback URL)
3. Client ID + Secret → paste στο Supabase Google provider → Save

**Redirect URLs** (URL Configuration): πρέπει να περιλαμβάνουν τα paths όπου επιστρέφει ο χρήστης μετά το OAuth, π.χ. `https://moovefitness.gr/posing/account`, `https://moovefitness.gr/posing/auth/callback` και `https://moovefitness.gr/**`. Για local dev πρόσθεσε `http://localhost:5173/**`.

**Σημείωση:** OAuth δημιουργεί αυτόματα `profiles` row (trigger `handle_new_user`). Χρήστης με υπάρχοντα email/password λογαριασμό δεν συνδέεται αυτόματα με Google — χρειάζεται ίδιο provider ή manual linking στο Supabase.

## 2. Stripe

### Προτιμώμενο: Checkout Sessions (auto-confirm)

1. Δημιούργησε **Products + Prices** για κάθε πακέτο
2. **Developers → Webhooks → Add endpoint:**
   - URL: `https://moovefitness.gr/api/posing/stripe-webhook`
   - Event: `checkout.session.completed`
   - Secret → `STRIPE_WEBHOOK_SECRET`
3. Vercel env:

| Πακέτο | Env var |
|--------|---------|
| 1 Posing Session | `STRIPE_PRICE_SINGLE` |
| Sapphire | `STRIPE_PRICE_SAPPHIRE` |
| Ruby | `STRIPE_PRICE_RUBY` |
| Diamond | `STRIPE_PRICE_DIAMOND` |
| Ruby x8 (July offer) | `STRIPE_PRICE_RUBY_JULY8` |
| Diamond x8 (July offer) | `STRIPE_PRICE_DIAMOND_JULY8` |

+ `STRIPE_SECRET_KEY` (secret key από Dashboard)

Το API δημιουργεί Checkout Session ανά κράτηση με metadata `booking_id` + `user_package_id`. Αν δεν υπάρχει fixed Price ID (π.χ. promo plans) ή ο πελάτης έχει **ειδική τιμή** από admin → dynamic `price_data` με το resolved ποσό.

### PayPal & Revolut

Στο email κράτησης (μετά το booking) στέλνονται links με pre-filled amount:

| Variable | Default |
|----------|---------|
| `POSE_PAYPAL_URL` | `https://www.paypal.me/magdalinisamara` |
| `POSE_REVOLUT_URL` | `https://revolut.me/magdaqsn9` |

Οι τιμές **δεν** εμφανίζονται στο site — μόνο στο email.

### Custom τιμές ανά πελάτη

Στο `/posing/admin` → tab **Μέλη** → expanded member → **Ειδικές τιμές**. Αποθηκεύονται στον πίνακα `profile_plan_prices` (migration `009`).

### Fallback: static Payment Links

Αν δεν ορίσεις `STRIPE_SECRET_KEY` / price IDs, το email στέλνει static Payment Link (`STRIPE_LINK_*`). Σε αυτή την περίπτωση **δεν** ενεργοποιείται αυτόματα το πακέτο — χειροκίνητη επιβεβαίωση.

## 3. Email (ImprovMX + Resend)

Πλήρης οδηγός: **[docs/email-improvmx-resend.md](email-improvmx-resend.md)**

Σύντομα:
1. ImprovMX: `info@moovefitness.gr` → forward σε Gmail (MX + SPF DNS)
2. Resend: verify domain + `RESEND_API_KEY` στο Vercel
3. Supabase → Authentication → Custom SMTP (`smtp.resend.com`)

Εναλλακτικό με πλήρες inbox: [email-google-workspace.md](email-google-workspace.md)

Αποστολή κρατήσεων και φόρμας επικοινωνίας: Resend API μέσω `sendPosingEmail` (ή SMTP αν οριστεί).

## 4. Vercel environment variables

Αντέγραψε από `.env.example` και συμπλήρωσε όλα τα Move & Pose vars.

**Κρίσιμο για τα serverless API (`/api/posing/*`):**

| Variable | Υποχρεωτικό για API |
|----------|---------------------|
| `SUPABASE_URL` | Ναι — **ξεχωριστά** από `VITE_SUPABASE_URL` |
| `SUPABASE_SERVICE_ROLE_KEY` | Ναι — legacy `service_role` JWT |
| `VITE_SUPABASE_URL` | Frontend build μόνο |
| `VITE_SUPABASE_ANON_KEY` | Frontend build μόνο |

Μετά από αλλαγή env: **Redeploy** (όχι μόνο Save).

**Έλεγχος API:**
- `GET https://moovefitness.gr/api/posing/health` → `{ ok: true, hasUrl: true, hasServiceKey: true, hasEmail: true, emailProvider: "smtp" }`
- `GET https://moovefitness.gr/api/posing/me` (χωρίς login) → `{ ok: false, error: "unauthorized" }`

Το `/posing/account` διαβάζει δεδομένα απευθείας από Supabase (RLS) — δεν χρειάζεται service role για το dashboard.

### Troubleshooting: `server_config_error` ή `FUNCTION_INVOCATION_FAILED` στο ημερολόγιο

1. `GET /api/posing/health` — αν crashάρει ή `hasServiceKey: false`:
   - Όρισε `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` στο Vercel (Production)
   - **Redeploy** μετά από κάθε αλλαγή env
2. Αν το health είναι OK αλλά δεν φαίνονται ώρες (`—` σε κάθε μέρα):
   - Πρόσθεσε slots από `/posing/admin` (weekly calendar)
3. Τα `/api/posing/*` routes εισάγουν το shared module ως `./_lib.js` (όχι `../_lib.js`) — λάθος path προκαλεί crash σε όλα τα posing API.

## 5. Site routes

| Route | Ρόλος |
|-------|-------|
| `/posing` | Landing + ημερολόγιο κρατήσεων |
| `/posing/login`, `/posing/signup` | Auth |
| `/posing/forgot-password`, `/posing/reset-password` | Επαναφορά κωδικού |
| `/posing/account` | Dashboard πελάτη |
| `/posing/admin` | Διαθέσιμες ώρες + κρατήσεις (admin) |

## 6. API endpoints

| Endpoint | Ρόλος |
|----------|-------|
| `GET /api/posing/slots` | Διαθέσιμα slots |
| `POST /api/posing/bookings` | Κράτηση + email |
| `GET /api/posing/health` | Έλεγχος Vercel env (hasUrl, hasServiceKey) |
| `POST /api/posing/account/delete` | Διαγραφή λογαριασμού (password + Bearer JWT) |
| `GET /api/posing/me` | Πακέτα & κρατήσεις χρήστη (legacy API) |
| `POST /api/posing/admin/slots` | Προσθήκη slot |
| `DELETE /api/posing/admin/slots?id=` | Διαγραφή ελεύθερου slot |
| `GET /api/posing/admin/bookings` | Λίστα κρατήσεων |
| `GET /api/posing/admin/members` | Λίστα μελών (admin) |
| `DELETE /api/posing/admin/members?id=` | Διαγραφή μέλους (admin, όχι admin accounts) |
| `POST /api/posing/stripe-webhook` | Επιβεβαίωση πληρωμής |

## 7. Test checklist

1. Τρέξε migration στο Supabase
2. `vercel dev` με env vars
3. Signup → login → `/posing/account` (κενό dashboard)
4. Admin login → `/posing/admin` → πρόσθεσε slot
5. Client κλείνει slot → `pending_payment` + email
6. Stripe test payment → webhook → `confirmed` + active package
7. `npm run build` περνάει

## 8. Timezone

Όλα τα slots είναι `timestamptz` — UI/API χρησιμοποιούν `Europe/Athens`.

## 9. Πολιτική πληρωμής

Προτείνεται deadline **24 ώρες πριν τη συνεδρία**. Αν δεν πληρωθεί, ακύρωση χειροκίνητα από admin.
