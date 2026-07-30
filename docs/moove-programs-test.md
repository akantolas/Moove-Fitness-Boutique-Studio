# Moove — έτοιμα προγράμματα (guest purchase & test)

Ροή: **email στο `/programmata` → payment email (Stripe/PayPal/Revolut) → πληρωμή → access email με private link** — χωρίς login στο members site.

Setup DB: migrations `010_moove_program_purchases.sql` και
`011_moove_program_decimal_prices.sql` (με αυτή τη σειρά).

## URLs

| Σελίδα | Route | Τι δείχνει |
|--------|-------|------------|
| Catalog (αγορά) | `/programmata` | Κάρτες προγραμμάτων, email + Buy |
| Access (μετά πληρωμή) | `/programmata/access/{token}` | Ασκήσεις, meta, warm-up, load plan |
| Admin confirm | `/posing/admin` → tab **Moove Προγράμματα** | Pending PayPal/Revolut + resend access |

Link στο email πελάτη: `https://moovefitness.gr/programmata/access/XXXXXXXX` (`access_token` στη DB).

## Γιατί όχι μόνο `npm run dev`

Το frontend καλεί `/api/programs/*` (`src/lib/programsApi.ts`). Τα API είναι Vercel serverless στο `api/programs/` — **δεν τρέχουν** με καθαρό Vite.

Για πλήρες local test:

```bash
vercel dev
```

Συνήθως `http://localhost:3000` (όχι 5173).

Με `npm run dev` μόνο: βλέπεις UI στο `/programmata`, αλλά Buy / access API αποτυγχάνουν.

## Env (Vercel / `.env.local`)

Υπάρχοντα από Move & Pose + programs:

```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
CONTACT_FROM_EMAIL=
POSE_FROM_EMAIL=
POSE_ADMIN_EMAILS=
STRIPE_SECRET_KEY=
MOOVE_PROGRAM_SUCCESS_URL=https://moovefitness.gr/programmata?payment=success
MOOVE_PROGRAM_CANCEL_URL=https://moovefitness.gr/programmata
```

Optional Stripe Price IDs για τα 4 προϊόντα:

```text
STRIPE_PRICE_PROGRAM_PEACH_START_BUNDLE
STRIPE_PRICE_PROGRAM_PEACH_BUILD
STRIPE_PRICE_PROGRAM_PEACH_SCULPT
STRIPE_PRICE_PROGRAM_PEACH_COMPLETE
```

Χωρίς αυτά δουλεύει dynamic `price_data` με ακριβή ποσά σε cents.

## Τοπικό test — catalog

1. `vercel dev`
2. Άνοιξε `http://localhost:3000/programmata`
3. Όλες οι κάρτες είναι static από frontend — Buy χρειάζεται Supabase + Stripe + email.

## Access σελίδα — 3 μέθοδοι

Η API (`api/programs/_handlers/access.js`) δίνει content μόνο αν `status = paid` και token ταιριάζει.

### A — Admin confirm (πιο ρεαλιστικό)

1. Buy στο `/programmata` με test email
2. Login admin → `/posing/admin` → **Moove Προγράμματα**
3. Confirm PayPal/Revolut ή πλήρωσε Stripe test card
4. Resend access ή άνοιξε link από email

### B — Χειροκίνητα Supabase (γρήγορο preview)

Supabase → SQL Editor:

```sql
insert into moove_program_purchases (
  program_key, email, amount_eur, locale, status, access_token
) values (
  'peach_complete', 'test@example.com', 99.90, 'el', 'paid',
  'testtoken1234567890'
);
```

Άνοιξε: `http://localhost:3000/programmata/access/testtoken1234567890`

Token ≥ 16 χαρακτήρες. Άλλαξε `program_key` σε `peach_start_bundle`,
`peach_build`, `peach_sculpt` ή `peach_complete`.

### C — API smoke test

```bash
curl "http://localhost:3000/api/programs/access/testtoken1234567890?locale=el"
```

Αναμενόμενο: `ok: true`, `workouts` manifest, `activeWorkoutKey`, `sections`
και `meta`. Για συγκεκριμένη προπόνηση:

```bash
curl "http://localhost:3000/api/programs/access/testtoken1234567890?locale=el&workout=peach_sculpt_b"
```

## Production test

1. Deploy (Vercel)
2. `https://moovefitness.gr/programmata`
3. Order με Stripe test keys στο Vercel env ή admin confirm
4. Access link από email

## Τι ελέγχεις στο access page

- Meta: διάρκεια, στόχος, load plan (`progressNote`)
- Bundle selector: 3 Start / 4 Build / 5 Sculpt / 12 Complete workouts
- Peach Build workouts: πρώτο section **Προθέρμανση (κοινό Peach Build)**
- Sections ανά workout + finisher
- EL/EN — content από `api/programs/_catalog.js`

## Συχνά προβλήματα

| Σύμπτωμα | Αιτία |
|----------|--------|
| Buy → error | `vercel dev` όχι τρέχει, ή missing Supabase/Stripe env |
| Access → not found | `status` ≠ `paid`, λάθος token, migrations 010/011 όχι applied |
| Catalog OK, access fail | Μόνο API/DB issue |
| Email δεν έρχεται | Resend/SMTP env ή spam |

## Catalog keys (τιμές server-side)

| Key | Προϊόν |
|-----|--------|
| `peach_start_bundle` | Peach Start — 3 workouts (34,90€, ΦΠΑ included) |
| `peach_build` | Peach Build — 4 workouts (49,90€, ΦΠΑ included) |
| `peach_sculpt` | Peach Sculpt — 5 workouts (59,90€, ΦΠΑ included) |
| `peach_complete` | Complete Collection — 12 workouts (99,90€, ΦΠΑ included) |

Τιμές & bundle mapping: `api/programs/_pricing.js`. Περιεχόμενο workouts:
`api/programs/_catalog.js`. Τα legacy workout keys παραμένουν access-only για
παλιές αγορές.
