// Email Service
// SendGrid integration for email notifications

import sgMail from '@sendgrid/mail'
import { env, isProductionServicesEnabled } from '../config/env.js'

// Initialize SendGrid
if (env.sendgrid.apiKey) {
    sgMail.setApiKey(env.sendgrid.apiKey)
}

export interface EmailOptions {
    to: string
    subject: string
    text?: string
    html?: string
}

/**
 * Send an email via SendGrid
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
    // Check if production services are enabled
    if (!isProductionServicesEnabled() || !env.sendgrid.apiKey) {
        console.log(`📧 EMAIL (dev mode):`)
        console.log(`   To: ${options.to}`)
        console.log(`   Subject: ${options.subject}`)
        console.log(`   Body: ${(options.text || options.html || '').substring(0, 100)}...`)
        return true
    }

    try {
        await sgMail.send({
            to: options.to,
            from: {
                email: env.sendgrid.fromEmail,
                name: env.sendgrid.fromName,
            },
            subject: options.subject,
            text: options.text || '',
            html: options.html || '',
        })
        console.log(`✅ Email sent to ${options.to}`)
        return true
    } catch (error) {
        console.error('SendGrid error:', error)
        return false
    }
}

/**
 * Send OTP email
 */
export async function sendOtpEmail(
    email: string,
    otp: string,
    purpose: 'password_reset' | 'visitor_registration' | 'email_verification'
): Promise<boolean> {
    const subjects = {
        password_reset: 'Password Reset OTP - Lost & Found System',
        visitor_registration: 'Visitor Registration OTP - Lost & Found System',
        email_verification: 'Email Verification OTP - Lost & Found System',
    }

    const messages = {
        password_reset: `
      <h2>Password Reset Request</h2>
      <p>You have requested to reset your password for the Lost & Found Tracking System.</p>
      <p>Your OTP is: <strong style="font-size: 24px; color: #2563eb;">${otp}</strong></p>
      <p>This OTP is valid for 10 minutes. Do not share it with anyone.</p>
      <p>If you did not request this, please ignore this email.</p>
    `,
        visitor_registration: `
      <h2>Visitor Registration</h2>
      <p>Welcome to the Lost & Found Tracking System!</p>
      <p>Your verification OTP is: <strong style="font-size: 24px; color: #2563eb;">${otp}</strong></p>
      <p>This OTP is valid for 10 minutes.</p>
      <p>Your temporary visitor account will be valid for 24 hours.</p>
    `,
        email_verification: `
      <h2>Email Verification</h2>
      <p>Please verify your email address for the Lost & Found Tracking System.</p>
      <p>Your verification OTP is: <strong style="font-size: 24px; color: #2563eb;">${otp}</strong></p>
      <p>This OTP is valid for 10 minutes.</p>
    `,
    }

    return sendEmail({
        to: email,
        subject: subjects[purpose],
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        ${messages[purpose]}
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px;">
          Lost & Found Tracking System<br>
          This is an automated message. Please do not reply.
        </p>
      </div>
    `,
    })
}

/**
 * Send notification email
 */
export async function sendNotificationEmail(
    email: string,
    title: string,
    message: string,
    actionUrl?: string
): Promise<boolean> {
    const actionButton = actionUrl
        ? `<a href="${actionUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">View Details</a>`
        : ''

    return sendEmail({
        to: email,
        subject: `${title} - Lost & Found System`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>${title}</h2>
        <p>${message}</p>
        ${actionButton}
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px;">
          Lost & Found Tracking System<br>
          You can manage your notification preferences in your account settings.
        </p>
      </div>
    `,
    })
}

/**
 * Send security alert email
 */
export async function sendSecurityAlertEmail(
    email: string,
    alertType: string,
    details: string
): Promise<boolean> {
    return sendEmail({
        to: email,
        subject: '⚠️ Security Alert - Lost & Found System',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">⚠️ Security Alert</h2>
        <p><strong>Alert Type:</strong> ${alertType}</p>
        <p>${details}</p>
        <p>If this was you, you can ignore this message. If not, please secure your account immediately.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px;">
          Lost & Found Tracking System<br>
          This is an automated security notification.
        </p>
      </div>
    `,
    })
}
