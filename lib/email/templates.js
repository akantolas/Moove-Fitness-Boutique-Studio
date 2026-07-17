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
  bodyText,
  ctaHref,
  ctaLabel,
  secondaryCtaHref,
  secondaryCtaLabel,
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
    secondaryCtaHref,
    secondaryCtaLabel,
    badgeLabel,
    badgeBg,
    badgeColor,
  })

  const text = buildPlainText({
    title,
    greeting,
    intro,
    details,
    bodyText,
    ctaHref,
    ctaLabel,
    secondaryCtaHref,
    secondaryCtaLabel,
    brand: posingBrand,
    locale,
    brandType: 'posing',
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
  bodyText,
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
    bodyText,
    ctaHref,
    ctaLabel,
    brand: mooveBrand,
    locale,
    brandType: 'moove',
  })

  return { subject, html, text }
}

export function formatProfileField(value, locale = 'el') {
  const trimmed = typeof value === 'string' ? value.trim() : ''
  if (trimmed) return trimmed
  return locale === 'el' ? '—' : 'Not provided'
}

export function formatBookingRef(bookingId) {
  if (!bookingId) return '—'
  return String(bookingId).slice(0, 8).toUpperCase()
}

export function formatDurationLabel(minutes, locale = 'el') {
  const n = Number(minutes)
  if (!n || Number.isNaN(n)) return locale === 'el' ? '—' : 'Not provided'
  return locale === 'el' ? `${n} λεπτά` : `${n} min`
}

export function buildBookingDetailRows({
  sessionTime,
  packageName,
  durationMinutes,
  bookingId,
  amountLabel,
  locale = 'el',
}) {
  const isEl = locale === 'el'
  const rows = [
    { label: isEl ? 'Ώρα' : 'Time', value: sessionTime },
    { label: isEl ? 'Διάρκεια' : 'Duration', value: formatDurationLabel(durationMinutes, locale) },
    { label: isEl ? 'Πακέτο' : 'Package', value: packageName },
  ]
  if (amountLabel) {
    rows.push({
      label: isEl ? 'Τιμή' : 'Amount',
      value: amountLabel,
    })
  }
  if (bookingId) {
    rows.push({
      label: isEl ? 'Κωδικός κράτησης' : 'Booking ref',
      value: formatBookingRef(bookingId),
    })
  }
  return rows
}

function buildPaymentAlternativesBlock({
  locale,
  stripeLink,
  paypalLink,
  revolutLink,
  bookingId,
  amountLabel,
}) {
  const isEl = locale === 'el'
  const colors = posingBrand.colors
  const hasAnyLink = Boolean(stripeLink || paypalLink || revolutLink)
  const bookingRef = bookingId ? formatBookingRef(bookingId) : ''

  if (!hasAnyLink && !amountLabel) {
    const fallback = isEl
      ? 'Οι σύνδεσμοι πληρωμής δεν είναι ρυθμισμένοι — θα επικοινωνήσουμε σύντομα.'
      : 'Payment links are not configured yet — we will contact you shortly.'
    return {
      bodyHtml: `<p style="margin:16px 0 0;font-family:system-ui,sans-serif;font-size:14px;line-height:1.6;color:${colors.muted};">${escapeHtml(fallback)}</p>`,
      bodyText: fallback,
    }
  }

  const note = isEl
    ? `Στην περιγραφή πληρωμής γράψε τον κωδικό κράτησης ${bookingRef}.`
    : `Include booking ref ${bookingRef} in the payment description.`

  const linkStyle =
    'display:inline-block;margin:8px 8px 0 0;padding:10px 16px;border-radius:999px;font-family:system-ui,sans-serif;font-size:13px;font-weight:600;text-decoration:none;'

  const links = []
  if (paypalLink) {
    links.push(
      `<a href="${escapeHtml(paypalLink)}" style="${linkStyle}background:${colors.outerBg};color:${colors.text};border:1px solid ${colors.cardBorder};">PayPal</a>`,
    )
  }
  if (revolutLink) {
    links.push(
      `<a href="${escapeHtml(revolutLink)}" style="${linkStyle}background:${colors.outerBg};color:${colors.text};border:1px solid ${colors.cardBorder};">Revolut</a>`,
    )
  }

  const altTitle = isEl ? 'Εναλλακτικές πληρωμές' : 'Other payment options'
  const stripeHint = stripeLink
    ? ''
    : isEl
      ? '<p style="margin:8px 0 0;font-size:13px;color:' +
        colors.muted +
        ';">Stripe: επικοινώνησε μαζί μας αν χρειάζεσαι βοήθεια.</p>'
      : ''

  const bodyHtml = `
    <div style="margin:20px 0 0;padding:16px;background:${colors.outerBg};border:1px solid ${colors.cardBorder};border-radius:12px;">
      <p style="margin:0 0 8px;font-family:system-ui,sans-serif;font-size:12px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:${colors.muted};">${escapeHtml(altTitle)}${amountLabel ? ` · ${escapeHtml(amountLabel)}` : ''}</p>
      ${links.length ? `<p style="margin:0;">${links.join('')}</p>` : ''}
      ${stripeHint}
      <p style="margin:12px 0 0;font-family:system-ui,sans-serif;font-size:13px;line-height:1.5;color:${colors.muted};">${escapeHtml(note)}</p>
    </div>`

  const bodyTextParts = [altTitle]
  if (amountLabel) bodyTextParts.push(amountLabel)
  if (paypalLink) bodyTextParts.push(`PayPal: ${paypalLink}`)
  if (revolutLink) bodyTextParts.push(`Revolut: ${revolutLink}`)
  bodyTextParts.push(note)

  return { bodyHtml, bodyText: bodyTextParts.join('\n') }
}

export function buildCalendarActionsBlock({ googleCalendarUrl, locale = 'el' }) {
  const isEl = locale === 'el'
  const colors = posingBrand.colors

  if (!googleCalendarUrl) {
    const fallback = isEl
      ? 'Συνημμένο αρχείο ημερολογίου (.ics) — άνοιξέ το από το email για να προσθέσεις τη συνεδρία στο κινητό σου.'
      : 'Calendar file (.ics) attached — open it from your email to add the session to your phone.'
    return {
      bodyHtml: `
        <div style="margin:20px 0 0;padding:16px;background:${colors.outerBg};border:1px solid ${colors.cardBorder};border-radius:12px;">
          <p style="margin:0 0 8px;font-family:system-ui,sans-serif;font-size:12px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:${colors.muted};">${isEl ? 'Ημερολόγιο' : 'Calendar'}</p>
          <p style="margin:0;font-family:system-ui,sans-serif;font-size:14px;line-height:1.6;color:${colors.text};">${escapeHtml(fallback)}</p>
        </div>`,
      bodyText: fallback,
    }
  }

  const linkStyle =
    'display:inline-block;margin:8px 8px 0 0;padding:10px 16px;border-radius:999px;font-family:system-ui,sans-serif;font-size:13px;font-weight:600;text-decoration:none;background:' +
    colors.accent +
    ';color:' +
    colors.ctaText +
    ';'

  const note = isEl
    ? 'Συνημμένο .ics για iPhone/Android Mail ή πρόσθεσε στο Google Calendar:'
    : 'Attached .ics for iPhone/Android Mail, or add to Google Calendar:'

  return {
    bodyHtml: `
      <div style="margin:20px 0 0;padding:16px;background:${colors.outerBg};border:1px solid ${colors.cardBorder};border-radius:12px;">
        <p style="margin:0 0 8px;font-family:system-ui,sans-serif;font-size:12px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:${colors.muted};">${isEl ? 'Πρόσθεσε στο ημερολόγιο' : 'Add to calendar'}</p>
        <p style="margin:0 0 8px;font-family:system-ui,sans-serif;font-size:14px;line-height:1.6;color:${colors.text};">${escapeHtml(note)}</p>
        <a href="${escapeHtml(googleCalendarUrl)}" style="${linkStyle}">Google Calendar</a>
      </div>`,
    bodyText: `${note}\nGoogle Calendar: ${googleCalendarUrl}`,
  }
}

export function buildPoseSessionInfoBlock({ locale, variant = 'full' }) {
  const isEl = locale === 'el'
  const colors = posingBrand.colors

  if (variant === 'contact') {
    const text = isEl
      ? 'Για ερωτήσεις σχετικά με την ακύρωση, επικοινώνησε μαζί μας στο WhatsApp.'
      : 'Questions about this cancellation? Reach us on WhatsApp.'
    return {
      bodyHtml: `
        <div style="margin:20px 0 0;padding:16px;background:${colors.outerBg};border:1px solid ${colors.cardBorder};border-radius:12px;">
          <p style="margin:0;font-family:system-ui,sans-serif;font-size:14px;line-height:1.6;color:${colors.muted};">${escapeHtml(text)}</p>
        </div>`,
      bodyText: text,
      secondaryCtaHref: posingBrand.whatsappUrl(),
      secondaryCtaLabel: isEl ? 'WhatsApp' : 'WhatsApp',
    }
  }

  const text = isEl
    ? 'Οι online συνεδρίες γίνονται μέσω WhatsApp στο κινητό. Θα επικοινωνήσουμε μαζί σου εκεί πριν την ώρα της συνεδρίας — πρότεινε να είσαι διαθέσιμος/η 15 λεπτά πριν.'
    : 'Online sessions take place via WhatsApp on your phone. We will reach out there before your session — please be available 15 minutes early.'

  return {
    bodyHtml: `
      <div style="margin:20px 0 0;padding:16px;background:${colors.outerBg};border:1px solid ${colors.cardBorder};border-radius:12px;">
        <p style="margin:0 0 8px;font-family:system-ui,sans-serif;font-size:12px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:${colors.muted};">${isEl ? 'Πώς γίνεται η συνεδρία' : 'How your session works'}</p>
        <p style="margin:0;font-family:system-ui,sans-serif;font-size:14px;line-height:1.6;color:${colors.text};">${escapeHtml(text)}</p>
        <p style="margin:12px 0 0;font-family:system-ui,sans-serif;font-size:14px;color:${colors.muted};">${escapeHtml(posingBrand.whatsapp)}</p>
      </div>`,
    bodyText: text,
    secondaryCtaHref: posingBrand.whatsappUrl(),
    secondaryCtaLabel: isEl ? 'WhatsApp' : 'WhatsApp',
  }
}

export function buildAdminClientDetailRows({
  profileName,
  userEmail,
  phone,
  division,
  notes,
  locale = 'el',
}) {
  const isEl = locale === 'el'
  const phoneValue = formatProfileField(phone, locale)
  const phoneTrimmed = typeof phone === 'string' ? phone.trim() : ''
  const notesTrimmed = typeof notes === 'string' ? notes.trim() : ''
  const notesValue = formatProfileField(notes, locale)

  return [
    { label: isEl ? 'Πελάτης' : 'Client', value: profileName },
    { label: 'Email', value: userEmail, isLink: true },
    {
      label: isEl ? 'Τηλέφωνο' : 'Phone',
      value: phoneValue,
      isLink: Boolean(phoneTrimmed),
      href: phoneTrimmed ? `tel:${phoneTrimmed.replace(/\s/g, '')}` : undefined,
    },
    {
      label: isEl ? 'Division / κατηγορία' : 'Division / category',
      value: formatProfileField(division, locale),
    },
    {
      label: isEl ? 'Σημειώσεις' : 'Notes',
      value: notesValue,
      valueHtml: notesTrimmed
        ? escapeHtml(notesTrimmed).replace(/\n/g, '<br/>')
        : undefined,
    },
  ]
}

/** Customer — new booking pending payment */
export function buildPaymentEmail({
  attendeeName,
  packageName,
  sessionTime,
  stripeLink,
  paypalLink,
  revolutLink,
  amountEur,
  amountLabel,
  bookingId,
  durationMinutes,
  locale = 'el',
}) {
  const isEl = locale === 'el'
  const sessionInfo = buildPoseSessionInfoBlock({ locale, variant: 'full' })
  const resolvedAmountLabel =
    amountLabel ?? (amountEur ? `${Math.round(Number(amountEur))}€` : null)
  const paymentAlt = buildPaymentAlternativesBlock({
    locale,
    stripeLink,
    paypalLink,
    revolutLink,
    bookingId,
    amountLabel: resolvedAmountLabel,
  })

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
      ? 'Η ώρα σου είναι κρατημένη. Ολοκλήρωσε την πληρωμή για να επιβεβαιωθεί η συνεδρία — μετά θα λάβεις email επιβεβαίωσης.'
      : 'Your time slot is reserved. Complete payment to confirm your session — you will receive a confirmation email afterwards.',
    details: buildBookingDetailRows({
      sessionTime,
      packageName,
      durationMinutes,
      bookingId,
      amountLabel: resolvedAmountLabel,
      locale,
    }),
    bodyHtml: `${sessionInfo.bodyHtml}${paymentAlt.bodyHtml}`,
    bodyText: `${sessionInfo.bodyText}\n\n${paymentAlt.bodyText}`,
    ctaHref: stripeLink || undefined,
    ctaLabel: stripeLink
      ? isEl
        ? 'Πληρωμή μέσω Stripe'
        : 'Pay with Stripe'
      : undefined,
    secondaryCtaHref: sessionInfo.secondaryCtaHref,
    secondaryCtaLabel: sessionInfo.secondaryCtaLabel,
    badgeLabel: isEl ? 'Εκκρεμεί πληρωμή' : 'Payment pending',
    badgeBg: posingBrand.colors.badgePending,
    badgeColor: posingBrand.colors.badgePendingText,
  })
}

/** Customer — session confirmed (included in active package) */
export function buildConfirmationEmail({
  attendeeName,
  packageName,
  sessionTime,
  bookingId,
  durationMinutes,
  googleCalendarUrl = null,
  locale = 'el',
}) {
  const isEl = locale === 'el'
  const sessionInfo = buildPoseSessionInfoBlock({ locale, variant: 'full' })
  const calendarBlock = buildCalendarActionsBlock({ googleCalendarUrl, locale })

  return posingTemplate({
    locale,
    subject: isEl ? 'Move & Pose — επιβεβαίωση συνεδρίας' : 'Move & Pose — session confirmed',
    preheader: isEl
      ? `Η συνεδρία σου επιβεβαιώθηκε — ${sessionTime}`
      : `Your session is confirmed — ${sessionTime}`,
    title: isEl ? 'Η συνεδρία σου επιβεβαιώθηκε' : 'Your session is confirmed',
    greeting: isEl ? `Γεια σου ${attendeeName},` : `Hi ${attendeeName},`,
    intro: isEl
      ? 'Σε περιμένουμε online. Δες τις λεπτομέρειες παρακάτω και βεβαιώσου ότι έχεις πρόσβαση στο WhatsApp.'
      : 'We look forward to seeing you online. See the details below and make sure you can access WhatsApp.',
    details: buildBookingDetailRows({
      sessionTime,
      packageName,
      durationMinutes,
      bookingId,
      locale,
    }),
    bodyHtml: `${calendarBlock.bodyHtml}${sessionInfo.bodyHtml}`,
    bodyText: `${calendarBlock.bodyText}\n\n${sessionInfo.bodyText}`,
    ctaHref: posingBrand.accountUrl(),
    ctaLabel: isEl ? 'Ο λογαριασμός μου' : 'My account',
    secondaryCtaHref: sessionInfo.secondaryCtaHref,
    secondaryCtaLabel: sessionInfo.secondaryCtaLabel,
    badgeLabel: isEl ? 'Επιβεβαιωμένη' : 'Confirmed',
    badgeBg: posingBrand.colors.badgeConfirmed,
    badgeColor: posingBrand.colors.badgeConfirmedText,
  })
}

/** Customer — payment completed, session confirmed */
export function buildPaidConfirmationEmail({
  attendeeName,
  packageName,
  sessionTime,
  bookingId,
  durationMinutes,
  googleCalendarUrl = null,
  locale = 'el',
}) {
  const isEl = locale === 'el'
  const sessionInfo = buildPoseSessionInfoBlock({ locale, variant: 'full' })
  const calendarBlock = buildCalendarActionsBlock({ googleCalendarUrl, locale })

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
      ? 'Η συνεδρία σου είναι πλέον επιβεβαιωμένη. Θα επικοινωνήσουμε μαζί σου στο WhatsApp πριν την ώρα της συνεδρίας.'
      : 'Your session is now confirmed. We will contact you on WhatsApp before your session time.',
    details: buildBookingDetailRows({
      sessionTime,
      packageName,
      durationMinutes,
      bookingId,
      locale,
    }),
    bodyHtml: `${calendarBlock.bodyHtml}${sessionInfo.bodyHtml}`,
    bodyText: `${calendarBlock.bodyText}\n\n${sessionInfo.bodyText}`,
    ctaHref: posingBrand.accountUrl(),
    ctaLabel: isEl ? 'Δες την κράτησή σου' : 'View your booking',
    secondaryCtaHref: sessionInfo.secondaryCtaHref,
    secondaryCtaLabel: sessionInfo.secondaryCtaLabel,
    badgeLabel: isEl ? 'Επιβεβαιωμένη' : 'Confirmed',
    badgeBg: posingBrand.colors.badgeConfirmed,
    badgeColor: posingBrand.colors.badgeConfirmedText,
  })
}

/** Admin — session confirmed (after payment or included session) */
export function buildAdminSessionConfirmedEmail({
  profileName,
  userEmail,
  phone,
  packageName,
  sessionTime,
  bookingId,
  googleCalendarUrl = null,
  locale = 'el',
}) {
  const isEl = locale === 'el'
  const calendarBlock = buildCalendarActionsBlock({ googleCalendarUrl, locale })

  return posingTemplate({
    locale,
    subject: isEl
      ? `Move & Pose — επιβεβαιωμένη συνεδρία · ${profileName}`
      : `Move & Pose — confirmed session · ${profileName}`,
    preheader: `${profileName} · ${packageName} · ${sessionTime}`,
    title: isEl ? 'Επιβεβαιωμένη συνεδρία' : 'Confirmed session',
    greeting: isEl ? 'Νέα επιβεβαιωμένη κράτηση.' : 'New confirmed booking.',
    intro: isEl
      ? 'Πρόσθεσε τη συνεδρία στο ημερολόγιό σου (συνημμένο .ics).'
      : 'Add this session to your calendar (attached .ics file).',
    details: [
      { label: isEl ? 'Πελάτης' : 'Client', value: profileName },
      { label: 'Email', value: userEmail, isLink: true },
      {
        label: isEl ? 'Τηλέφωνο' : 'Phone',
        value: phone?.trim() ? phone : isEl ? '—' : '—',
        isLink: Boolean(phone?.trim()),
        href: phone?.trim() ? `tel:${phone.trim().replace(/\s/g, '')}` : undefined,
      },
      { label: isEl ? 'Πακέτο' : 'Package', value: packageName },
      { label: isEl ? 'Ώρα' : 'Time', value: sessionTime },
      { label: 'Booking ID', value: bookingId },
    ],
    bodyHtml: calendarBlock.bodyHtml,
    bodyText: calendarBlock.bodyText,
    ctaHref: posingBrand.adminUrl(),
    ctaLabel: isEl ? 'Admin panel' : 'Admin panel',
    badgeLabel: isEl ? 'Επιβεβαιωμένη' : 'Confirmed',
    badgeBg: posingBrand.colors.badgeConfirmed,
    badgeColor: posingBrand.colors.badgeConfirmedText,
  })
}

/** Admin — new customer account signup */
export function buildAdminNewSignupEmail({
  profileName,
  userEmail,
  provider = 'email',
  locale = 'el',
}) {
  const isEl = locale === 'el'
  const providerKey = String(provider ?? 'email').toLowerCase()
  const providerLabel =
    providerKey === 'google'
      ? 'Google'
      : providerKey === 'email'
        ? isEl
          ? 'Email / κωδικός'
          : 'Email / password'
        : providerKey

  return posingTemplate({
    locale,
    subject: isEl
      ? `Move & Pose — νέος λογαριασμός · ${profileName}`
      : `Move & Pose — new account · ${profileName}`,
    preheader: isEl
      ? `${profileName} δημιούργησε λογαριασμό (${providerLabel})`
      : `${profileName} created an account (${providerLabel})`,
    title: isEl ? 'Νέος λογαριασμός' : 'New account',
    greeting: isEl ? 'Νέος πελάτης στο Move & Pose.' : 'A new Move & Pose customer signed up.',
    intro: isEl
      ? 'Ένας νέος λογαριασμός μόλις δημιουργήθηκε. Δες τα στοιχεία παρακάτω.'
      : 'A new account was just created. See the details below.',
    details: [
      { label: isEl ? 'Όνομα' : 'Name', value: profileName },
      { label: 'Email', value: userEmail, isLink: true },
      {
        label: isEl ? 'Εγγραφή μέσω' : 'Signed up via',
        value: providerLabel,
      },
    ],
    ctaHref: posingBrand.adminUrl(),
    ctaLabel: isEl ? 'Admin panel' : 'Admin panel',
    badgeLabel: isEl ? 'Νέος λογαριασμός' : 'New account',
    badgeBg: posingBrand.colors.badgePending,
    badgeColor: posingBrand.colors.badgePendingText,
  })
}

/** Admin — new booking notification */
export function buildAdminBookingNotifyEmail({
  profileName,
  userEmail,
  phone,
  division,
  notes,
  packageName,
  sessionTime,
  bookingId,
  status,
  stripeLink,
  paypalLink,
  revolutLink,
  amountEur,
  priceSource,
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

  const amountLabel = amountEur ? `${Math.round(Number(amountEur))}€` : null

  const details = [
    ...buildAdminClientDetailRows({
      profileName,
      userEmail,
      phone,
      division,
      notes,
      locale,
    }),
    { label: isEl ? 'Πακέτο' : 'Package', value: packageName },
    { label: isEl ? 'Ώρα' : 'Time', value: sessionTime },
    { label: 'Booking ID', value: bookingId },
    { label: isEl ? 'Κατάσταση' : 'Status', value: statusLabel },
  ]

  if (amountLabel) {
    details.push({
      label: isEl ? 'Τιμή' : 'Amount',
      value:
        priceSource === 'override'
          ? `${amountLabel} (${isEl ? 'ειδική τιμή πελάτη' : 'custom client price'})`
          : amountLabel,
    })
  }

  if (isPending && stripeLink) {
    details.push({
      label: isEl ? 'Πληρωμή Stripe' : 'Stripe payment',
      value: isEl ? 'Άνοιγμα συνδέσμου' : 'Open link',
      isLink: true,
      href: stripeLink,
    })
  }
  if (isPending && paypalLink) {
    details.push({
      label: 'PayPal',
      value: isEl ? 'Άνοιγμα συνδέσμου' : 'Open link',
      isLink: true,
      href: paypalLink,
    })
  }
  if (isPending && revolutLink) {
    details.push({
      label: 'Revolut',
      value: isEl ? 'Άνοιγμα συνδέσμου' : 'Open link',
      isLink: true,
      href: revolutLink,
    })
  }

  return posingTemplate({
    locale,
    subject: isEl
      ? `Νέα κράτηση Move & Pose — ${profileName}`
      : `New Move & Pose booking — ${profileName}`,
    preheader: `${profileName} · ${packageName} · ${sessionTime}`,
    title: isEl ? 'Νέα κράτηση' : 'New booking',
    intro: isEl
      ? 'Νέα κράτηση καταχωρήθηκε στο σύστημα.'
      : 'A new booking has been registered.',
    details,
    ctaHref: posingBrand.adminUrl(),
    ctaLabel: isEl ? 'Άνοιγμα admin' : 'Open admin',
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
  bookingId,
  durationMinutes,
  previousStatus,
  locale = 'el',
}) {
  const isEl = locale === 'el'
  const wasConfirmed = previousStatus === 'confirmed'
  const sessionInfo = buildPoseSessionInfoBlock({ locale, variant: 'contact' })

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
    details: buildBookingDetailRows({
      sessionTime,
      packageName,
      durationMinutes,
      bookingId,
      locale,
    }),
    bodyHtml: sessionInfo.bodyHtml,
    bodyText: sessionInfo.bodyText,
    ctaHref: posingBrand.accountUrl(),
    ctaLabel: isEl ? 'Ο λογαριασμός μου' : 'My account',
    secondaryCtaHref: sessionInfo.secondaryCtaHref,
    secondaryCtaLabel: sessionInfo.secondaryCtaLabel,
    badgeLabel: isEl ? 'Ακυρωμένη' : 'Cancelled',
    badgeBg: posingBrand.colors.badgeCancelled,
    badgeColor: posingBrand.colors.badgeCancelledText,
  })
}

/** Admin — booking cancellation notification */
export function buildAdminCancellationNotifyEmail({
  profileName,
  userEmail,
  phone,
  division,
  notes,
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
    subject: isEl
      ? `Ακύρωση Move & Pose — ${profileName}`
      : `Move & Pose cancellation — ${profileName}`,
    preheader: `${profileName} · ${packageName} · ${sessionTime}`,
    title: isEl ? 'Ακύρωση κράτησης' : 'Booking cancelled',
    intro: isEl
      ? 'Μια κράτηση ακυρώθηκε από τον πελάτη.'
      : 'A booking was cancelled by the client.',
    details: [
      ...buildAdminClientDetailRows({
        profileName,
        userEmail,
        phone,
        division,
        notes,
        locale,
      }),
      { label: isEl ? 'Πακέτο' : 'Package', value: packageName },
      { label: isEl ? 'Ώρα' : 'Time', value: sessionTime },
      { label: 'Booking ID', value: bookingId },
      { label: isEl ? 'Προηγ. κατάσταση' : 'Previous status', value: previousStatusLabel },
    ],
    ctaHref: posingBrand.adminUrl(),
    ctaLabel: isEl ? 'Άνοιγμα admin' : 'Open admin',
    badgeLabel: cancelledLabel,
    badgeBg: posingBrand.colors.badgeCancelled,
    badgeColor: posingBrand.colors.badgeCancelledText,
  })
}

/** Admin — contact form notification */
export function buildContactAdminEmail({ name, email, message, locale = 'el' }) {
  const isEl = locale === 'el'
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br/>')
  const messagePlain = String(message ?? '').trim()

  return mooveTemplate({
    locale,
    subject: isEl
      ? `Νέο μήνυμα επικοινωνίας — ${name}`
      : `New contact message — ${name}`,
    preheader: `${name} · ${email}`,
    title: isEl ? 'Νέο μήνυμα επικοινωνίας' : 'New contact message',
    intro: isEl
      ? 'Έλαβες νέο μήνυμα από τη φόρμα επικοινωνίας του site.'
      : 'You received a new message from the website contact form.',
    details: [
      { label: isEl ? 'Όνομα' : 'Name', value: name },
      { label: 'Email', value: email, isLink: true },
      {
        label: isEl ? 'Μήνυμα' : 'Message',
        value: messagePlain.slice(0, 200) + (messagePlain.length > 200 ? '…' : ''),
        valueHtml: safeMessage,
      },
    ],
    bodyHtml: `
      <div style="margin:20px 0 0;padding:16px;background:${mooveBrand.colors.outerBg};border:1px solid ${mooveBrand.colors.cardBorder};border-radius:12px;">
        <p style="margin:0 0 8px;font-family:system-ui,sans-serif;font-size:12px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:${mooveBrand.colors.muted};">${isEl ? 'Μήνυμα' : 'Message'}</p>
        <p style="margin:0;font-family:system-ui,sans-serif;font-size:15px;line-height:1.6;color:${mooveBrand.colors.text};">${safeMessage}</p>
      </div>`,
    bodyText: messagePlain,
    ctaHref: `mailto:${email}`,
    ctaLabel: isEl ? 'Απάντηση στο email' : 'Reply by email',
  })
}

/** Customer — contact form auto-reply */
export function buildContactAutoReplyEmail({ name, locale = 'el' }) {
  const isEl = locale === 'el'
  const hours = isEl ? mooveBrand.hours : mooveBrand.hoursEn

  return mooveTemplate({
    locale,
    subject: isEl ? 'Moove — λάβαμε το μήνυμά σου' : 'Moove — we received your message',
    preheader: isEl
      ? 'Ευχαριστούμε που επικοινώνησες μαζί μας.'
      : 'Thank you for getting in touch.',
    title: isEl ? 'Λάβαμε το μήνυμά σου' : 'We received your message',
    greeting: isEl ? `Γεια σου ${name},` : `Hi ${name},`,
    intro: isEl
      ? 'Ευχαριστούμε που επικοινώνησες με το Moove. Θα απαντήσουμε το συντομότερο δυνατό, συνήθως εντός 24 ωρών.'
      : 'Thank you for contacting Moove. We will reply as soon as possible, usually within 24 hours.',
    details: [
      { label: 'Email', value: mooveBrand.email, isLink: true },
      { label: isEl ? 'Τηλέφωνο' : 'Phone', value: mooveBrand.phone },
      { label: isEl ? 'Διεύθυνση' : 'Address', value: mooveBrand.address },
      { label: isEl ? 'Ώρες' : 'Hours', value: hours },
    ],
    ctaHref: mooveBrand.mapsUrl,
    ctaLabel: isEl ? 'Βρες μας στον χάρτη' : 'Find us on the map',
  })
}
