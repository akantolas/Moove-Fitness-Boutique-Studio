# Moove — έτοιμα προγράμματα (guest purchase & test)

Ροή: **email στο `/programmata` → payment email (Stripe/PayPal/Revolut) → πληρωμή → access email με private link** — χωρίς login στο members site.

Setup DB: migration `supabase/migrations/010_moove_program_purchases.sql`.

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

Optional: `STRIPE_PRICE_PROGRAM_*` per SKU (χωρίς αυτά δουλεύει dynamic `price_data` από catalog).

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
  'peach_build_wd', 'test@example.com', 45, 'el', 'paid',
  'testtoken1234567890'
);
```

Άνοιξε: `http://localhost:3000/programmata/access/testtoken1234567890`

Token ≥ 16 χαρακτήρες. Άλλαξε `program_key` για άλλο SKU (π.χ. `peach_start`, `peach_build_wa_heavy`).

### C — API smoke test

```bash
curl "http://localhost:3000/api/programs/access/testtoken1234567890?locale=el"
```

Αναμενόμενο: `ok: true`, `sections` array, `meta` με load plan.

## Production test

1. Deploy (Vercel)
2. `https://moovefitness.gr/programmata`
3. Order με Stripe test keys στο Vercel env ή admin confirm
4. Access link από email

## Τι ελέγχεις στο access page

- Meta: διάρκεια, στόχος, load plan (`progressNote`)
- Peach Build SKUs: πρώτο section **Προθέρμανση (κοινό Peach Build)**
- Sections ανά workout + finisher
- EL/EN — content από `api/programs/_catalog.js`

## Συχνά προβλήματα

| Σύμπτωμα | Αιτία |
|----------|--------|
| Buy → error | `vercel dev` όχι τρέχει, ή missing Supabase/Stripe env |
| Access → not found | `status` ≠ `paid`, λάθος token, migration 010 όχι applied |
| Catalog OK, access fail | Μόνο API/DB issue |
| Email δεν έρχεται | Resend/SMTP env ή spam |

## Catalog keys (τιμές server-side)

| Key | Προϊόν |
|-----|--------|
| `peach_start` | Peach Collection – Start (45€) |
| `peach_workout_b` / `peach_workout_c` | Peach Collection B/C (45€) |
| `peach_build_wa_heavy` | Peach Build WA Heavy (60€) |
| `peach_build_wb` / `peach_build_wc` / `peach_build_wd` | Peach Build B/C/D (45€) |

Τιμές & names: `api/programs/_pricing.js`. Περιεχόμενο: `api/programs/_catalog.js`.
