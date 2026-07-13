# Move & Pose — Cal.com, Stripe & email setup

Ροή: **κράτηση slot στο Cal.com (χωρίς πληρωμή)** → webhook → **email με Stripe Payment Link** + οδηγίες προετοιμασίας.

## 1. Cal.com event (`online-posing-session`)

1. **Pricing:** Απενεργοποίησε πληρωμή στο checkout (free booking).
2. **Custom booking question** (backup αν χαθεί το metadata από το site):
   - Label: `Πακέτο` / `Package`
   - Identifier/slug: `package`
   - Type: dropdown
   - Options: `1 Posing Session`, `Sapphire`, `Ruby`, `Diamond`
3. **Booking fields (όνομα & email):** Συμπληρώνονται **μέσα στο Cal.com** — το site δεν έχει δικά του πεδία. Για πραγματικούς πελάτες τα πεδία είναι κενά (με placeholder). Αν δοκιμάζεις ενώ είσαι logged in στο Cal.com, θα δεις τα δικά σου στοιχεία — χρησιμοποίησε **incognito**.
4. **Additional notes:** Άλλαξε label/description στο Cal event σε κάτι όπως «Division, επίπεδο, ημερομηνία αγώνα…» — **μην** αφήνεις τεχνικό κείμενο. Το πακέτο περνάει αυτόματα από το site (metadata), όχι από τις σημειώσεις του πελάτη.
5. **Confirmation email:** Κράτα ενεργό το built-in Cal email (meeting link / Zoom).
6. **Webhook** (Settings → Developer → Webhooks → Add):
   - **Subscriber URL:** `https://moovefitness.gr/api/posing-cal-webhook`
   - **Event:** `BOOKING_CREATED`
   - **Secret:** δημιούργησε strong secret → αντιγράφεις στο Vercel ως `CAL_WEBHOOK_SECRET`
   - **Payload template:** default JSON

## 2. Stripe Payment Links

Δημιούργησε **4 Payment Links** (Dashboard → Payment Links):

| Πακέτο | Env var |
|--------|---------|
| 1 Posing Session | `STRIPE_LINK_SINGLE` |
| Sapphire | `STRIPE_LINK_SAPPHIRE` |
| Ruby | `STRIPE_LINK_RUBY` |
| Diamond | `STRIPE_LINK_DIAMOND` |

Για κάθε link:
- Όρισε τιμή ανά πακέτο
- **Success URL:** `https://moovefitness.gr/posing?payment=success`
- Μην περιορίζεις payment methods στο API — ρύθμισε από Dashboard

## 3. Resend (αποστολή email)

1. Δημιούργησε λογαριασμό στο [resend.com](https://resend.com)
2. **Verify domain** `moovefitness.gr` (SPF + DKIM DNS records στο Vercel DNS)
3. Απόστολτης: π.χ. `Move & Pose <bookings@moovefitness.gr>`
4. API key → Vercel `RESEND_API_KEY`

> Το ImprovMX (`info@moovefitness.gr`) είναι για **λήψη**. Η αποστολή transactional emails χρειάζεται ξεχωριστό provider (Resend).

## 4. Vercel environment variables

Αντέγραψε από `.env.example` και συμπλήρωσε:

```
CAL_WEBHOOK_SECRET=
RESEND_API_KEY=
POSE_FROM_EMAIL=Move & Pose <bookings@moovefitness.gr>
POSE_NOTIFY_EMAIL=info@moovefitness.gr
STRIPE_LINK_SINGLE=
STRIPE_LINK_SAPPHIRE=
STRIPE_LINK_RUBY=
STRIPE_LINK_DIAMOND=
```

## 5. Site integration

Το site στέλνει στο Cal embed metadata:
- `packageKey` — `single` | `sapphire` | `ruby` | `diamond`
- `packageName` — εμφανιζόμενο όνομα πακέτου
- `locale` — `el` | `en`

Το webhook διαβάζει πρώτα το `payload.metadata.packageKey`, μετά την απάντηση στο custom question `package`.

## 6. Test checklist

1. Επίλεξε πακέτο στο `/posing#booking`
2. **Δοκίμασε σε incognito** ή logout από Cal.com — αν είσαι συνδεδεμένος ως organizer, θα δεις τα δικά σου στοιχεία pre-filled (αυτό δεν συμβαίνει σε πραγματικούς πελάτες)
3. Κλείσε test slot στο Cal
4. Έλεγξε Vercel function logs → `200`
5. Email στον πελάτη + αντίγραφο στη Μαγδα
6. Stripe link ανοίγει και οδηγεί στο success URL
7. `npm run build` περνάει

## 7. Πολιτική πληρωμής

Προτείνεται deadline **24 ώρες πριν τη συνεδρία**. Αν δεν πληρωθεί, η Μαγδα ακυρώνει χειροκίνητα από Cal.com.
