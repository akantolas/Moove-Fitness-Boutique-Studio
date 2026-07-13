# Move & Pose — Supabase booking, Stripe & email setup

Ροή: **λογαριασμός → κράτηση slot → email με Stripe Checkout → webhook επιβεβαιώνει πακέτο & κράτηση**.

## 1. Supabase project

1. Δημιούργησε project στο [supabase.com](https://supabase.com)
2. **Authentication → Providers:** ενεργοποίησε Email (password)
3. **SQL Editor:** τρέξε το `supabase/migrations/001_posing_booking.sql`
4. Αντέγραψε:
   - Project URL → `VITE_SUPABASE_URL` + `SUPABASE_URL`
   - anon public key → `VITE_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY` (μόνο Vercel, ποτέ στο frontend)

### Admin (Μαγδα)

Ορίζεις στο Vercel:

```
POSE_ADMIN_EMAILS=info@moovefitness.gr
```

Το πρώτο login με αυτό το email παίρνει αυτόματα `role=admin` και πρόσβαση στο `/posing/admin`.

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

+ `STRIPE_SECRET_KEY` (secret key από Dashboard)

Το API δημιουργεί Checkout Session ανά κράτηση με metadata `booking_id` + `user_package_id`.

### Fallback: static Payment Links

Αν δεν ορίσεις `STRIPE_SECRET_KEY` / price IDs, το email στέλνει static Payment Link (`STRIPE_LINK_*`). Σε αυτή την περίπτωση **δεν** ενεργοποιείται αυτόματα το πακέτο — χειροκίνητη επιβεβαίωση.

## 3. Resend

1. Verify domain `moovefitness.gr`
2. Αποστολέας: `Move & Pose <bookings@moovefitness.gr>`
3. API key → `RESEND_API_KEY`

## 4. Vercel environment variables

Αντέγραψε από `.env.example` και συμπλήρωσε όλα τα Move & Pose vars.

## 5. Site routes

| Route | Ρόλος |
|-------|-------|
| `/posing` | Landing + ημερολόγιο κρατήσεων |
| `/posing/login`, `/posing/signup` | Auth |
| `/posing/account` | Dashboard πελάτη |
| `/posing/admin` | Διαθέσιμες ώρες + κρατήσεις (admin) |

## 6. API endpoints

| Endpoint | Ρόλος |
|----------|-------|
| `GET /api/posing/slots` | Διαθέσιμα slots |
| `POST /api/posing/bookings` | Κράτηση + email |
| `GET /api/posing/me` | Πακέτα & κρατήσεις χρήστη |
| `POST /api/posing/admin/slots` | Προσθήκη slot |
| `DELETE /api/posing/admin/slots?id=` | Διαγραφή ελεύθερου slot |
| `GET /api/posing/admin/bookings` | Λίστα κρατήσεων |
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
