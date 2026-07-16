import { escapeHtml, mooveBrand, posingBrand } from './brand.js'
import { buildPlainText, renderEmailLayout } from './layout.js'

function posingTemplate({
  locale,
  preheader,
  title,
  greeting,
  intro,
  details,
  bodyHtml,
  ctaHref,
  ctaLabel,
  badgeLabel,
  badgeBg,
  badgeColor,
  subject,
}) {
  const html = renderEmailLayout({
    brandType: 'posing',
    brand: posingBrand,
    locale,
    preheader,
    title,
    greeting,
    intro,
    details,
    bodyHtml,
    ctaHref,
    ctaLabel,
    badgeLabel,
    badgeBg,
    badgeColor,
  })

  const text = buildPlainText({
    title,
    greeting,
    intro,
    details,
    ctaHref,
    ctaLabel,
    brand: posingBrand,
    locale,
  })

  return { subject, html, text }
}

function mooveTemplate({
  locale,
  preheader,
  title,
  greeting,
  intro,
  details,
  bodyHtml,
  ctaHref,
  ctaLabel,
  subject,
}) {
  const html = renderEmailLayout({
    brandType: 'moove',
    brand: mooveBrand,
    locale,
    preheader,
    title,
    greeting,
    intro,
    details,
    bodyHtml,
    ctaHref,
    ctaLabel,
  })

  const text = buildPlainText({
    title,
    greeting,
    intro,
    details,
    ctaHref,
    ctaLabel,
    brand: mooveBrand,
    locale,
  })

  return { subject, html, text }
}

/** Customer — new booking pending payment */
export function buildPaymentEmail({ attendeeName, packageName, sessionTime, stripeLink, locale = 'el' }) {
  const isEl = locale === 'el'

  return posingTemplate({
    locale,
    subject: isEl
      ? 'Move & Pose — επιβεβαίωση κράτησης & πληρωμή'
      : 'Move & Pose — booking confirmation & payment',
    preheader: isEl
      ? `Η κράτησή σου καταχωρήθηκε — ${sessionTime}`
      : `Your booking is reserved — ${sessionTime}`,
    title: isEl ? 'Η κράτησή σου καταχωρήθηκε' : 'Your booking is reserved',
    greeting: isEl ? `Γεια σου ${attendeeName},` : `Hi ${attendeeName},`,
    intro: isEl
      ? 'Ολοκλήρωσε την πληρωμή για να επιβεβαιωθεί η συνεδρία σου.'
      : 'Complete payment to confirm your session.',
    details: [
      { label: isEl ? 'Ώρα' : 'Time', value: sessionTime },
      { label: isEl ? 'Πακέτο' : 'Package', value: packageName },
    ],
    ctaHref: stripeLink || undefined,
    ctaLabel: stripeLink
      ? isEl
        ? 'Πληρωμή μέσω Stripe'
        : 'Pay with Stripe'
      : undefined,
    bodyHtml: !stripeLink
      ? `<p style="margin:16px 0 0;font-family:system-ui,sans-serif;font-size:14px;line-height:1.6;color:${posingBrand.colors.muted};">${
          isEl
            ? 'Ο σύνδεσμος πληρωμής δεν είναι ρυθμισμένος — θα επικοινωνήσουμε σύντομα.'
            : 'Payment link is not configured yet — we will contact you shortly.'
        }</p>`
      : '',
    badgeLabel: isEl ? 'Εκκρεμεί πληρωμή' : 'Payment pending',
    badgeBg: posingBrand.colors.badgePending,
    badgeColor: posingBrand.colors.badgePendingText,
  })
}

/** Customer — session confirmed (included in active package) */
export function buildConfirmationEmail({ attendeeName, packageName, sessionTime, locale = 'el' }) {
  const isEl = locale === 'el'

  return posingTemplate({
    locale,
    subject: isEl ? 'Move & Pose — επιβεβαίωση συνεδρίας' : 'Move & Pose — session confirmed',
    preheader: isEl
      ? `Η συνεδρία σου επιβεβαιώθηκε — ${sessionTime}`
      : `Your session is confirmed — ${sessionTime}`,
    title: isEl ? 'Η συνεδρία σου επιβεβαιώθηκε' : 'Your session is confirmed',
    greeting: isEl ? `Γεια σου ${attendeeName},` : `Hi ${attendeeName},`,
    intro: isEl
      ? 'Σε περιμένουμε online. Μπορείς να δεις τις λεπτομέρειες στον λογαριασμό σου.'
      : 'We look forward to seeing you online. View details in your account.',
    details: [
      { label: isEl ? 'Ώρα' : 'Time', value: sessionTime },
      { label: isEl ? 'Πακέτο' : 'Package', value: packageName },
    ],
    ctaHref: posingBrand.accountUrl(),
    ctaLabel: isEl ? 'Ο λογαριασμός μου' : 'My account',
    badgeLabel: isEl ? 'Επιβεβαιωμένη' : 'Confirmed',
    badgeBg: posingBrand.colors.badgeConfirmed,
    badgeColor: posingBrand.colors.badgeConfirmedText,
  })
}

/** Customer — payment completed, session confirmed */
export function buildPaidConfirmationEmail({ attendeeName, packageName, sessionTime, locale = 'el' }) {
  const isEl = locale === 'el'

  return posingTemplate({
    locale,
    subject: isEl
      ? 'Move & Pose — η πληρωμή ολοκληρώθηκε'
      : 'Move & Pose — payment confirmed',
    preheader: isEl
      ? `Η πληρωμή σου ολοκληρώθηκε — ${sessionTime}`
      : `Payment received — ${sessionTime}`,
    title: isEl ? 'Η πληρωμή ολοκληρώθηκε' : 'Payment confirmed',
    greeting: isEl ? `Γεια σου ${attendeeName},` : `Hi ${attendeeName},`,
    intro: isEl
      ? 'Η συνεδρία σου είναι πλέον επιβεβαιωμένη. Σε περιμένουμε!'
      : 'Your session is now confirmed. See you soon!',
    details: [
      { label: isEl ? 'Ώρα' : 'Time', value: sessionTime },
      { label: isEl ? 'Πακέτο' : 'Package', value: packageName },
    ],
    ctaHref: posingBrand.accountUrl(),
    ctaLabel: isEl ? 'Δες την κράτησή σου' : 'View your booking',
    badgeLabel: isEl ? 'Επιβεβαιωμένη' : 'Confirmed',
    badgeBg: posingBrand.colors.badgeConfirmed,
    badgeColor: posingBrand.colors.badgeConfirmedText,
  })
}

/** Admin — new booking notification */
export function buildAdminBookingNotifyEmail({
  profileName,
  userEmail,
  packageName,
  sessionTime,
  bookingId,
  status,
  locale = 'el',
}) {
  const isEl = locale === 'el'
  const isPending = status === 'pending_payment'
  const statusLabel = isPending
    ? isEl
      ? 'Εκκρεμεί πληρωμή'
      : 'Pending payment'
    : isEl
      ? 'Επιβεβαιωμένη'
      : 'Confirmed'

  return posingTemplate({
    locale,
    subject: `New Move & Pose booking — ${profileName}`,
    preheader: `${profileName} · ${packageName} · ${sessionTime}`,
    title: isEl ? 'Νέα κράτηση' : 'New booking',
    intro: isEl
      ? 'Νέα κράτηση καταχωρήθηκε στο σύστημα.'
      : 'A new booking has been registered.',
    details: [
      { label: isEl ? 'Πελάτης' : 'Client', value: profileName },
      { label: 'Email', value: userEmail, isLink: true },
      { label: isEl ? 'Πακέτο' : 'Package', value: packageName },
      { label: isEl ? 'Ώρα' : 'Time', value: sessionTime },
      { label: 'Booking ID', value: bookingId },
      { label: isEl ? 'Κατάσταση' : 'Status', value: statusLabel },
    ],
    badgeLabel: statusLabel,
    badgeBg: isPending ? posingBrand.colors.badgePending : posingBrand.colors.badgeConfirmed,
    badgeColor: isPending ? posingBrand.colors.badgePendingText : posingBrand.colors.badgeConfirmedText,
  })
}

/** Customer — booking cancelled */
export function buildCancellationEmail({
  attendeeName,
  packageName,
  sessionTime,
  previousStatus,
  locale = 'el',
}) {
  const isEl = locale === 'el'
  const wasConfirmed = previousStatus === 'confirmed'

  return posingTemplate({
    locale,
    subject: isEl
      ? 'Move & Pose — η κράτηση ακυρώθηκε'
      : 'Move & Pose — booking cancelled',
    preheader: isEl
      ? `Η κράτησή σου ακυρώθηκε — ${sessionTime}`
      : `Your booking was cancelled — ${sessionTime}`,
    title: isEl ? 'Η κράτηση ακυρώθηκε' : 'Booking cancelled',
    greeting: isEl ? `Γεια σου ${attendeeName},` : `Hi ${attendeeName},`,
    intro: wasConfirmed
      ? isEl
        ? 'Η συνεδρία σου ακυρώθηκε. Το session επέστρεψε στο πακέτο σου.'
        : 'Your session was cancelled. The session has been returned to your package.'
      : isEl
        ? 'Η παραγγελία και η κράτησή σου ακυρώθηκαν.'
        : 'Your order and booking have been cancelled.',
    details: [
      { label: isEl ? 'Ώρα' : 'Time', value: sessionTime },
      { label: isEl ? 'Πακέτο' : 'Package', value: packageName },
    ],
    ctaHref: posingBrand.accountUrl(),
    ctaLabel: isEl ? 'Ο λογαριασμός μου' : 'My account',
    badgeLabel: isEl ? 'Ακυρωμένη' : 'Cancelled',
    badgeBg: posingBrand.colors.badgeCancelled,
    badgeColor: posingBrand.colors.badgeCancelledText,
  })
}

/** Admin — booking cancellation notification */
export function buildAdminCancellationNotifyEmail({
  profileName,
  userEmail,
  packageName,
  sessionTime,
  bookingId,
  previousStatus,
  locale = 'el',
}) {
  const isEl = locale === 'el'
  const wasConfirmed = previousStatus === 'confirmed'
  const previousStatusLabel = wasConfirmed
    ? isEl
      ? 'Επιβεβαιωμένη συνεδρία'
      : 'Confirmed session'
    : isEl
      ? 'Εκκρεμής πληρωμή'
      : 'Pending payment'
  const cancelledLabel = isEl ? 'Ακυρωμένη' : 'Cancelled'

  return posingTemplate({
    locale,
    subject: `Move & Pose cancellation — ${profileName}`,
    preheader: `${profileName} · ${packageName} · ${sessionTime}`,
    title: isEl ? 'Ακύρωση κράτησης' : 'Booking cancelled',
    intro: isEl
      ? 'Μια κράτηση ακυρώθηκε από τον πελάτη.'
      : 'A booking was cancelled by the client.',
    details: [
      { label: isEl ? 'Πελάτης' : 'Client', value: profileName },
      { label: 'Email', value: userEmail, isLink: true },
      { label: isEl ? 'Πακέτο' : 'Package', value: packageName },
      { label: isEl ? 'Ώρα' : 'Time', value: sessionTime },
      { label: 'Booking ID', value: bookingId },
      { label: isEl ? 'Προηγ. κατάσταση' : 'Previous status', value: previousStatusLabel },
    ],
    badgeLabel: cancelledLabel,
    badgeBg: posingBrand.colors.badgeCancelled,
    badgeColor: posingBrand.colors.badgeCancelledText,
  })
}

/** Admin — contact form notification */
export function buildContactAdminEmail({ name, email, message }) {
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br/>')

  return mooveTemplate({
    locale: 'el',
    subject: `Νέο μήνυμα επικοινωνίας — ${name}`,
    preheader: `${name} · ${email}`,
    title: 'Νέο μήνυμα επικοινωνίας',
    intro: 'Έλαβες νέο μήνυμα από τη φόρμα επικοινωνίας του site.',
    details: [
      { label: 'Όνομα', value: name },
      { label: 'Email', value: email, isLink: true },
    ],
    bodyHtml: `
      <div style="margin:20px 0 0;padding:16px;background:${mooveBrand.colors.outerBg};border:1px solid ${mooveBrand.colors.cardBorder};border-radius:12px;">
        <p style="margin:0 0 8px;font-family:system-ui,sans-serif;font-size:12px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:${mooveBrand.colors.muted};">Μήνυμα</p>
        <p style="margin:0;font-family:system-ui,sans-serif;font-size:15px;line-height:1.6;color:${mooveBrand.colors.text};">${safeMessage}</p>
      </div>`,
    ctaHref: `mailto:${email}`,
    ctaLabel: 'Απάντηση στο email',
  })
}

/** Customer — contact form auto-reply */
export function buildContactAutoReplyEmail({ name }) {
  return mooveTemplate({
    locale: 'el',
    subject: 'Moove — λάβαμε το μήνυμά σου',
    preheader: 'Ευχαριστούμε που επικοινώνησες μαζί μας.',
    title: 'Λάβαμε το μήνυμά σου',
    greeting: `Γεια σου ${name},`,
    intro:
      'Ευχαριστούμε που επικοινώνησες με το Moove. Θα απαντήσουμε το συντομότερο δυνατό, συνήθως εντός 24 ωρών.',
    details: [
      { label: 'Email', value: mooveBrand.email, isLink: true },
      { label: 'Τηλέφωνο', value: mooveBrand.phone },
    ],
    ctaHref: mooveBrand.siteUrl(),
    ctaLabel: 'Επισκέψου το site',
  })
}
