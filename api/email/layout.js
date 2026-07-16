import { escapeHtml } from './brand.js'

const BODY_FONT = "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
const DISPLAY_FONT = "Georgia, 'Times New Roman', Times, serif"

function renderCta({ href, label, bg, color, border, marginTop = '28px' }) {
  if (!href || !label) return ''
  const safeHref = escapeHtml(href)
  const safeLabel = escapeHtml(label)
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:${marginTop} 0 8px;">
      <tr>
        <td align="center" style="border-radius:999px;background:${bg};${border ? `border:1px solid ${border};` : ''}">
          <a href="${safeHref}" target="_blank" style="display:inline-block;padding:14px 32px;font-family:${BODY_FONT};font-size:15px;font-weight:600;color:${color};text-decoration:none;border-radius:999px;">
            ${safeLabel}
          </a>
        </td>
      </tr>
    </table>`
}

function renderSecondaryCta({ href, label, colors, brandType }) {
  if (!href || !label) return ''
  const border = brandType === 'posing' ? colors.accent : colors.accent
  const color = brandType === 'posing' ? colors.accent : colors.text
  const safeHref = escapeHtml(href)
  const safeLabel = escapeHtml(label)
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:12px 0 8px;">
      <tr>
        <td align="center" style="border-radius:999px;border:1px solid ${border};">
          <a href="${safeHref}" target="_blank" style="display:inline-block;padding:12px 28px;font-family:${BODY_FONT};font-size:14px;font-weight:600;color:${color};text-decoration:none;border-radius:999px;">
            ${safeLabel}
          </a>
        </td>
      </tr>
    </table>`
}

function renderDetailRow({ label, value, valueHtml, colors, isLink = false, href }) {
  const safeLabel = escapeHtml(label)
  const linkHref = href ?? (isLink && String(value).includes('@') ? `mailto:${value}` : value)
  const safeValue = valueHtml
    ? valueHtml
    : isLink
      ? `<a href="${escapeHtml(linkHref)}" style="color:${colors.accent};text-decoration:none;">${escapeHtml(value)}</a>`
      : escapeHtml(value)

  return `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid ${colors.cardBorder ?? colors.divider ?? 'rgba(0,0,0,0.08)'};font-family:${BODY_FONT};font-size:14px;color:${colors.muted};width:120px;vertical-align:top;">
        ${safeLabel}
      </td>
      <td style="padding:10px 0 10px 16px;border-bottom:1px solid ${colors.cardBorder ?? colors.divider ?? 'rgba(0,0,0,0.08)'};font-family:${BODY_FONT};font-size:14px;color:${colors.text};vertical-align:top;">
        ${safeValue}
      </td>
    </tr>`
}

function renderDetailsBlock({ rows, colors }) {
  if (!rows?.length) return ''
  const rowHtml = rows.map((row) => renderDetailRow({ ...row, colors })).join('')
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:24px 0 8px;">
      ${rowHtml}
    </table>`
}

function renderBadge({ label, bg, color }) {
  return `
    <span style="display:inline-block;padding:4px 12px;border-radius:999px;background:${bg};color:${color};font-family:${BODY_FONT};font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;">
      ${escapeHtml(label)}
    </span>`
}

function renderPosingHeader(brand) {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td align="center" style="padding:0 0 20px;">
          <img src="${escapeHtml(brand.logoUrl())}" alt="${escapeHtml(brand.name)}" width="72" height="72" style="display:block;border:0;outline:none;" />
        </td>
      </tr>
      <tr>
        <td align="center" style="font-family:${DISPLAY_FONT};font-size:22px;font-weight:400;color:${brand.colors.text};letter-spacing:0.02em;">
          ${escapeHtml(brand.name)}
        </td>
      </tr>
      <tr>
        <td align="center" style="padding-top:4px;font-family:${BODY_FONT};font-size:11px;font-weight:600;letter-spacing:0.22em;text-transform:uppercase;color:${brand.colors.muted};">
          ${escapeHtml(brand.subtitle)}
        </td>
      </tr>
    </table>`
}

function renderMooveHeader(brand) {
  const logoBlock = brand.logoUrl
    ? `
      <tr>
        <td align="center" style="padding:0 0 16px;">
          <div style="width:56px;height:56px;border-radius:14px;background:${brand.colors.ctaBg};display:inline-block;line-height:56px;text-align:center;">
            <span style="font-family:${DISPLAY_FONT};font-size:22px;color:${brand.colors.ctaText};">M</span>
          </div>
        </td>
      </tr>`
    : ''

  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      ${logoBlock}
      <tr>
        <td align="center" style="font-family:${DISPLAY_FONT};font-size:28px;font-weight:400;color:${brand.colors.text};letter-spacing:-0.02em;">
          ${escapeHtml(brand.name)}
        </td>
      </tr>
      <tr>
        <td align="center" style="padding-top:6px;font-family:${BODY_FONT};font-size:11px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;color:${brand.colors.muted};">
          ${escapeHtml(brand.subtitle)}
        </td>
      </tr>
      <tr>
        <td align="center" style="padding-top:16px;">
          <div style="width:48px;height:3px;background:${brand.colors.accent};border-radius:2px;margin:0 auto;"></div>
        </td>
      </tr>
    </table>`
}

function renderFooter({ brand, locale, brandType }) {
  const isEl = locale === 'el'
  const socialLabel = isEl ? 'Ακολούθησέ μας' : 'Follow us'
  const contactLabel = isEl ? 'Επικοινωνία' : 'Contact'
  const whatsappLabel = isEl ? 'WhatsApp (συνεδρίες)' : 'WhatsApp (sessions)'

  const contactLines =
    brandType === 'posing' && brand.whatsapp
      ? `
          <p style="margin:0 0 4px;">
            <a href="${escapeHtml(brand.whatsappUrl())}" style="color:${brand.colors.accent};text-decoration:none;">${escapeHtml(whatsappLabel)}: ${escapeHtml(brand.whatsapp)}</a>
          </p>
          <p style="margin:0 0 4px;">
            <a href="mailto:${escapeHtml(brand.email)}" style="color:${brand.colors.accent};text-decoration:none;">${escapeHtml(brand.email)}</a>
          </p>
          <p style="margin:0 0 12px;">${escapeHtml(brand.phone)}</p>`
      : `
          <p style="margin:0 0 4px;">
            <a href="mailto:${escapeHtml(brand.email)}" style="color:${brand.colors.accent};text-decoration:none;">${escapeHtml(brand.email)}</a>
          </p>
          <p style="margin:0 0 12px;">${escapeHtml(brand.phone)}</p>`

  const addressBlock =
    brandType === 'moove' && brand.address
      ? `<p style="margin:0 0 8px;">${escapeHtml(brand.address)}</p>`
      : ''

  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:32px;">
      <tr>
        <td style="border-top:1px solid ${brand.colors.cardBorder ?? brand.colors.divider};padding-top:24px;font-family:${BODY_FONT};font-size:12px;line-height:1.6;color:${brand.colors.muted};text-align:center;">
          <p style="margin:0 0 8px;font-weight:600;color:${brand.colors.text};">${contactLabel}</p>
          ${addressBlock}
          ${contactLines}
          <p style="margin:0 0 4px;font-weight:600;color:${brand.colors.text};">${socialLabel}</p>
          <p style="margin:0;">
            <a href="${escapeHtml(brand.instagram)}" style="color:${brand.colors.accent};text-decoration:none;">Instagram</a>
          </p>
        </td>
      </tr>
    </table>`
}

/**
 * @param {object} options
 * @param {'posing'|'moove'} options.brandType
 * @param {object} options.brand
 * @param {string} options.locale
 * @param {string} options.preheader
 * @param {string} options.title
 * @param {string} [options.greeting]
 * @param {string} [options.intro]
 * @param {Array<{label:string,value:string,isLink?:boolean}>} [options.details]
 * @param {string} [options.bodyHtml] - extra HTML inside card
 * @param {string} [options.ctaHref]
 * @param {string} [options.ctaLabel]
 * @param {string} [options.secondaryCtaHref]
 * @param {string} [options.secondaryCtaLabel]
 * @param {string} [options.badgeLabel]
 * @param {string} [options.badgeBg]
 * @param {string} [options.badgeColor]
 */
export function renderEmailLayout({
  brandType,
  brand,
  locale = 'el',
  preheader,
  title,
  greeting,
  intro,
  details,
  bodyHtml = '',
  ctaHref,
  ctaLabel,
  secondaryCtaHref,
  secondaryCtaLabel,
  badgeLabel,
  badgeBg,
  badgeColor,
}) {
  const colors = brand.colors
  const header =
    brandType === 'posing' ? renderPosingHeader(brand) : renderMooveHeader(brand)

  const ctaBg = brandType === 'posing' ? colors.accent : colors.ctaBg
  const ctaColor = brandType === 'posing' ? colors.ctaText : colors.ctaText
  const ctaBorder = brandType === 'moove' ? colors.accent : undefined

  const badge =
    badgeLabel && badgeBg && badgeColor
      ? `<div style="margin-bottom:16px;">${renderBadge({ label: badgeLabel, bg: badgeBg, color: badgeColor })}</div>`
      : ''

  const html = `<!DOCTYPE html>
<html lang="${locale === 'el' ? 'el' : 'en'}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="${brandType === 'posing' ? 'dark' : 'light'}" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:${colors.outerBg};font-family:${BODY_FONT};">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    ${escapeHtml(preheader)}
  </div>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${colors.outerBg};">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:560px;">
          <tr>
            <td style="padding:32px 28px;background:${colors.cardBg};border:1px solid ${colors.cardBorder};border-radius:16px;">
              ${header}
              ${badge}
              <h1 style="margin:24px 0 0;font-family:${DISPLAY_FONT};font-size:24px;font-weight:400;line-height:1.3;color:${colors.text};text-align:center;">
                ${escapeHtml(title)}
              </h1>
              ${greeting ? `<p style="margin:20px 0 0;font-family:${BODY_FONT};font-size:15px;line-height:1.6;color:${colors.text};">${escapeHtml(greeting)}</p>` : ''}
              ${intro ? `<p style="margin:12px 0 0;font-family:${BODY_FONT};font-size:15px;line-height:1.6;color:${colors.muted};">${escapeHtml(intro)}</p>` : ''}
              ${renderDetailsBlock({ rows: details, colors })}
              ${bodyHtml}
              ${renderCta({ href: ctaHref, label: ctaLabel, bg: ctaBg, color: ctaColor, border: ctaBorder })}
              ${renderSecondaryCta({ href: secondaryCtaHref, label: secondaryCtaLabel, colors, brandType })}
              ${renderFooter({ brand, locale, brandType })}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  return html
}

export function buildPlainText({
  title,
  greeting,
  intro,
  details,
  bodyText,
  ctaHref,
  ctaLabel,
  secondaryCtaHref,
  secondaryCtaLabel,
  brand,
  locale,
  brandType,
}) {
  const isEl = locale === 'el'
  const lines = [title, '', greeting, intro, ''].filter(Boolean)

  for (const row of details ?? []) {
    lines.push(`${row.label}: ${row.value}`)
  }

  if (bodyText) {
    lines.push('', bodyText)
  }

  if (ctaHref && ctaLabel) {
    lines.push('', ctaLabel, ctaHref)
  }

  if (secondaryCtaHref && secondaryCtaLabel) {
    lines.push('', secondaryCtaLabel, secondaryCtaHref)
  }

  lines.push('', '—', brand.name)

  if (brandType === 'posing' && brand.whatsapp) {
    lines.push(`${isEl ? 'WhatsApp' : 'WhatsApp'}: ${brand.whatsapp}`, brand.whatsappUrl())
  }

  if (brand.address) {
    lines.push(brand.address)
  }

  lines.push(
    brand.email,
    brand.phone,
    '',
    isEl ? 'Ακολούθησέ μας στο Instagram:' : 'Follow us on Instagram:',
    brand.instagram,
  )

  return lines.join('\n')
}
