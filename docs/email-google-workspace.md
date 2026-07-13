# Email — Google Workspace για info@moovefitness.gr

Χρησιμοποιούμε **Google Workspace** για:
- **Inbox** στο `info@moovefitness.gr`
- **Αποστολή** κρατήσεων Move & Pose (Vercel API μέσω SMTP)
- **Αποστολή** Supabase auth emails (signup, reset password)

---

## 1. Google Workspace

1. [workspace.google.com](https://workspace.google.com) → ξεκίνα trial ή πλάνο
2. **Verify domain** `moovefitness.gr`
3. Δημιούργησε χρήστη ή alias: `info@moovefitness.gr`

### DNS (στον registrar — π.χ. όπου είναι το domain)

**Αφαίρεσε** παλιά MX (ImprovMX κλπ.) αν υπάρχουν.

**Πρόσθεσε** τα MX records που δίνει το Google Admin (τυπικά):

| Type | Name | Priority | Value |
|------|------|----------|-------|
| MX | @ | 1 | `ASPMX.L.GOOGLE.COM` |
| MX | @ | 5 | `ALT1.ASPMX.L.GOOGLE.COM` |
| MX | @ | 5 | `ALT2.ASPMX.L.GOOGLE.COM` |
| MX | @ | 10 | `ALT3.ASPMX.L.GOOGLE.COM` |
| MX | @ | 10 | `ALT4.ASPMX.L.GOOGLE.COM` |

**SPF** (TXT record `@`):

```
v=spf1 include:_spf.google.com ~all
```

**DKIM:** Google Admin → Apps → Google Workspace → Gmail → Authenticate email → δημιούργησε DKIM key → πρόσθεσε το TXT record που σου δίνει.

Περίμενε 15–60 λεπτά propagation, μετά δοκίμασε λήψη στο inbox.

---

## 2. App Password (για SMTP από app)

Το Vercel API **δεν** χρησιμοποιεί κανονικό password — χρειάζεται **App Password**.

1. Στο Google Account του `info@`: **2-Step Verification** ON
2. [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. App: **Mail**, Device: **Other** → π.χ. `Moove Vercel`
4. Αντίγραψε τον **16-χαρακτήρα κωδικό** (χωρίς κενά) → `SMTP_PASS`

---

## 3. Vercel environment variables

Project → Settings → Environment Variables → **Production**:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=info@moovefitness.gr
SMTP_PASS=xxxx xxxx xxxx xxxx
POSE_FROM_EMAIL=Move & Pose <info@moovefitness.gr>
POSE_NOTIFY_EMAIL=info@moovefitness.gr
```

**Redeploy** μετά από κάθε αλλαγή.

Έλεγχος:

```
GET https://moovefitness.gr/api/posing/health
```

Αναμενόμενο:

```json
{
  "ok": true,
  "hasEmail": true,
  "emailProvider": "smtp"
}
```

Δοκιμή κράτησης: κλείσε slot ως πελάτης → πρέπει να έρθει email από `info@moovefitness.gr`.

---

## 4. Supabase — auth emails (signup / password reset)

Supabase Dashboard → **Authentication** → **SMTP Settings** → Enable Custom SMTP:

| Πεδίο | Τιμή |
|-------|------|
| Host | `smtp.gmail.com` |
| Port | `587` |
| Username | `info@moovefitness.gr` |
| Password | ίδιο App Password |
| Sender email | `info@moovefitness.gr` |
| Sender name | `Move & Pose` |

**Authentication → URL Configuration:**
- Site URL: `https://moovefitness.gr`
- Redirect URLs: `https://moovefitness.gr/**`

---

## 5. Troubleshooting

| Πρόβλημα | Λύση |
|----------|------|
| `missing_email_config` | Όρισε `SMTP_USER` + `SMTP_PASS` στο Vercel και redeploy |
| `Invalid login` / `535` | Νέο App Password, όχι κανονικό Google password |
| Email στο spam | Ολοκλήρωσε SPF + DKIM στο DNS |
| Δεν φτάνουν inbound | Έλεγξε MX records, αφαίρεσε ImprovMX |
| Supabase rate limit | Custom SMTP ενεργό + σωστό sender |

---

## Σημείωση Resend

Αν **δεν** ορίσεις SMTP, το API πέφτει πίσω στο Resend (`RESEND_API_KEY`). Με Google Workspace, **μόνο SMTP** είναι αρκετό — δεν χρειάζεται Resend.
