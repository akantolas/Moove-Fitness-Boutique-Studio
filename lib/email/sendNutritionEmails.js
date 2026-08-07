import {
  buildNutritionGenerationFailedEmail,
  buildNutritionOrderNotifyEmail,
  buildNutritionPaymentEmail,
  buildNutritionPlanEmail,
} from './templates.js'
import { sendPosingEmailReliable } from '../../api/posing/_lib.js'

function mooveFromEmail() {
  return process.env.CONTACT_FROM_EMAIL?.trim() ?? 'Moove <noreply@moovefitness.gr>'
}

function mooveNotifyEmail() {
  return (
    process.env.CONTACT_NOTIFY_EMAIL?.trim() ??
    process.env.POSE_NOTIFY_EMAIL?.trim() ??
    'info@moovefitness.gr'
  )
}

export async function sendNutritionPaymentEmail({
  email,
  orderId,
  amountEur,
  stripeLink,
  paypalLink,
  revolutLink,
  locale = 'el',
}) {
  const { subject, html, text } = buildNutritionPaymentEmail({
    orderId,
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
    idempotencyKey: `nutrition-payment-${orderId}`,
    replyTo: mooveNotifyEmail(),
  })
}

export async function sendNutritionPlanEmail({
  email,
  locale = 'el',
  name,
  pdfBuffer,
  filename,
  orderId,
}) {
  const { subject, html, text } = buildNutritionPlanEmail({ name, locale })

  await sendPosingEmailReliable({
    from: mooveFromEmail(),
    to: [email],
    subject,
    html,
    text,
    idempotencyKey: `nutrition-plan-${orderId}`,
    replyTo: mooveNotifyEmail(),
    attachments: [
      {
        filename: filename ?? 'moove-nutrition-plan.pdf',
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  })
}

export async function sendNutritionOrderNotifyEmail({
  email,
  orderId,
  amountEur,
  stripeLink,
  paypalLink,
  revolutLink,
  locale = 'el',
  purchaseType,
}) {
  const { subject, html, text } = buildNutritionOrderNotifyEmail({
    email,
    orderId,
    amountEur,
    stripeLink,
    paypalLink,
    revolutLink,
    locale,
    purchaseType,
  })

  await sendPosingEmailReliable({
    from: mooveFromEmail(),
    to: [mooveNotifyEmail()],
    subject,
    html,
    text,
    idempotencyKey: `nutrition-notify-${orderId}`,
    replyTo: email,
  })
}

export async function sendNutritionGenerationFailedEmail({
  orderId,
  email,
  error,
  locale = 'el',
}) {
  const { subject, html, text } = buildNutritionGenerationFailedEmail({
    orderId,
    email,
    error,
    locale,
  })

  await sendPosingEmailReliable({
    from: mooveFromEmail(),
    to: [mooveNotifyEmail()],
    subject,
    html,
    text,
    idempotencyKey: `nutrition-fail-${orderId}`,
    replyTo: email,
  })
}
