import {
  buildMooveProgramAccessEmail,
  buildMooveProgramOrderNotifyEmail,
  buildMooveProgramPaymentEmail,
} from './templates.js'
import { sendPosingEmailReliable } from '../../api/posing/_lib.js'

function mooveFromEmail() {
  return process.env.POSE_FROM_EMAIL?.trim() ?? 'Move & Pose <info@moovefitness.gr>'
}

function mooveNotifyEmail() {
  return (
    process.env.POSE_NOTIFY_EMAIL?.trim() ??
    process.env.CONTACT_NOTIFY_EMAIL?.trim() ??
    'info@moovefitness.gr'
  )
}

export async function sendMooveProgramPaymentEmail({
  email,
  programName,
  purchaseId,
  amountEur,
  stripeLink,
  paypalLink,
  revolutLink,
  locale = 'el',
}) {
  const { subject, html, text } = buildMooveProgramPaymentEmail({
    programName,
    purchaseId,
    amountEur,
    stripeLink,
    paypalLink,
    revolutLink,
    locale,
  })

  await sendPosingEmailReliable({
    from: mooveFromEmail(),
    to: [email],
    subject,
    html,
    text,
    idempotencyKey: `moove-program-payment-${purchaseId}`,
    replyTo: mooveNotifyEmail(),
  })
}

export async function sendMooveProgramAccessEmail({
  email,
  programName,
  accessUrl,
  locale = 'el',
}) {
  const { subject, html, text } = buildMooveProgramAccessEmail({
    programName,
    accessUrl,
    locale,
  })

  await sendPosingEmailReliable({
    from: mooveFromEmail(),
    to: [email],
    subject,
    html,
    text,
    idempotencyKey: `moove-program-access-${accessUrl.slice(-24)}`,
    replyTo: mooveNotifyEmail(),
  })
}

export async function sendMooveProgramOrderNotifyEmail({
  email,
  programName,
  purchaseId,
  amountEur,
  stripeLink,
  paypalLink,
  revolutLink,
  locale = 'el',
}) {
  const notify = mooveNotifyEmail()
  if (!notify) return

  const { subject, html, text } = buildMooveProgramOrderNotifyEmail({
    email,
    programName,
    purchaseId,
    amountEur,
    stripeLink,
    paypalLink,
    revolutLink,
    locale,
  })

  await sendPosingEmailReliable({
    from: mooveFromEmail(),
    to: [notify],
    replyTo: email,
    subject,
    html,
    text,
    idempotencyKey: `moove-program-notify-${purchaseId}`,
  })
}
