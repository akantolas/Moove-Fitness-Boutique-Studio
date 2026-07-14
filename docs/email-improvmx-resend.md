# Email — ImprovMX (λήψη) + Resend (αποστολή)

Χρησιμοποιούμε **ImprovMX** (free) για λήψη/forwarding του `info@moovefitness.gr` και **Resend** για αποστολή transactional emails (κρατήσεις Move & Pose, Supabase auth).

Εναλλακτικό με πλήρες inbox: [email-google-workspace.md](email-google-workspace.md)

---

## Αρχιτεκτονική

| Σκοπός | Υπηρεσία |
|--------|----------|
| Λήψη στο `info@moovefitness.gr` | ImprovMX → forward σε προσωπικό Gmail |
| Emails κρατήσεων (Stripe link, επιβεβαίωση) | Resend API (`RESEND_API_KEY` στο Vercel) |
| Supabase signup / reset password | Resend SMTP (`smtp.resend.com`) |

Ο κώδικας στέλνει μέσω `sendPosingEmail` στο [`api/posing/_lib.js`](../api/posing/_lib.js): προτιμά SMTP αν υπάρχει, αλλιώς Resend.

---

## 1. ImprovMX — λήψη & forwarding

1. Σύνδεση στο [app.improvmx.com](https://app.improvmx.com)
2. **Add domain** → `moovefitness.gr`
3. **Alias:** `info` → το προσωπικό Gmail σου
4. Στον DNS registrar, **αφαίρεσε** παλιά MX (Google κλπ.) αν υπάρχουν
5. **Πρόσθεσε** τα MX του ImprovMX:

| Type | Name | Priority | Value |
|------|------|----------|-------|
| MX | @ | 10 | `mx1.improvmx.com` |
| MX | @ | 20 | `mx2.improvmx.com` |

6. **SPF** (TXT record `@`):

```
v=spf1 include:spf.improvmx.com ~all
```

7. Περίμενε 15–60 λεπτά → δοκίμασε αποστολή email **προς** `info@moovefitness.gr` → πρέπει να φτάσει στο Gmail σου.

---

## 2. Resend — αποστολή από το domain

1. Λογαριασμός στο [resend.com](https://resend.com)
2. **Domains → Add Domain** → `moovefitness.gr`
3. Πρόσθεσε στο DNS τα records που σου δίνει το Resend (συνήθως):
   - DKIM TXT (`resend._domainkey`)
   - SPF TXT στο subdomain `send`
   - MX στο `send` subdomain (bounce handling)
4. **Verify** στο Resend dashboard
5. **API Keys → Create** → αντίγραψε το `re_...` key

**SPF:** Το ImprovMX SPF μένει στο `@`. Τα Resend records πάνε στο subdomain `send` — δεν συγκρούονται με τα ImprovMX MX στο `@`.

---

## 3. Vercel environment variables

Project → Settings → Environment Variables → **Production**:

```
RESEND_API_KEY=re_xxxxxxxxxxxx

POSE_FROM_EMAIL=Move & Pose <info@moovefitness.gr>
POSE_NOTIFY_EMAIL=info@moovefitness.gr
POSE_ADMIN_EMAILS=info@moovefitness.gr
```

**Μην** ορίσεις `SMTP_USER` / `SMTP_PASS` — αν υπάρχουν, **σβήστα**. Ο κώδικας προτιμά SMTP έναντι Resend.

Μετά: **Redeploy**.

Έλεγχος:

```
GET https://moovefitness.gr/api/posing/health
```

Αναμενόμενο:

```json
{
  "hasEmail": true,
  "emailProvider": "resend"
}
```

Δοκιμή: κράτηση slot ως πελάτης → email πληρωμής από `info@moovefitness.gr` + notification στο `info@` (μέσω ImprovMX forward).

**Φόρμα επικοινωνίας Moove** (`/epikoinonia`): χρησιμοποιεί το ίδιο `RESEND_API_KEY`. Προαιρετικά `CONTACT_FROM_EMAIL` / `CONTACT_NOTIFY_EMAIL` — αλλιώς fallback στα `POSE_*`.

---

## 4. Supabase auth emails

Supabase Dashboard → **Authentication → SMTP Settings** → Enable Custom SMTP:

| Πεδίο | Τιμή |
|-------|------|
| Host | `smtp.resend.com` |
| Port | `465` |
| Username | `resend` |
| Password | το `re_...` API key |
| Sender email | `info@moovefitness.gr` |
| Sender name | `Move & Pose` |

**Authentication → URL Configuration:**
- Site URL: `https://moovefitness.gr`
- Redirect URLs: `https://moovefitness.gr/**`

Δοκιμή: signup ή reset password → email από `info@moovefitness.gr`.

---

## 5. Admin login

Το `POSE_ADMIN_EMAILS=info@moovefitness.gr` σημαίνει ότι το πρώτο login με αυτό το email γίνεται admin.

Επειδή το `info@` είναι alias (όχι πραγματικό mailbox), τα auth emails του Supabase φτάνουν στο Gmail σου μέσω ImprovMX forwarding — μόνο αν το Βήμα 1 είναι σωστό.

---

## Troubleshooting

| Πρόβλημα | Λύση |
|----------|------|
| `hasEmail: false` / `missing_email_config` | `RESEND_API_KEY` στο Vercel + redeploy. Βεβαιώσου ότι δεν υπάρχουν SMTP vars. |
| Δεν φτάνουν inbound στο info@ | Έλεγξε MX → ImprovMX, όχι Google. |
| Emails στο spam | Ολοκλήρωσε DKIM/SPF στο Resend. |
| Supabase rate limit | Custom SMTP ενεργό + αύξησε rate limit στο Auth settings. |
| `emailProvider: "smtp"` αντί για resend | Σβήσε `SMTP_USER`/`SMTP_PASS` από Vercel. |

---

## Upgrade path — ImprovMX Premium SMTP

Αν αργότερα πάρεις ImprovMX Premium SMTP, αντικατάστησε το Resend με:

```
SMTP_HOST=smtp.improvmx.com
SMTP_PORT=587
SMTP_USER=<alias από ImprovMX dashboard>
SMTP_PASS=<password από ImprovMX dashboard>
POSE_FROM_EMAIL=Move & Pose <info@moovefitness.gr>
```

Και πρόσθεσε DKIM records από ImprovMX. Χωρίς αλλαγή κώδικα.
