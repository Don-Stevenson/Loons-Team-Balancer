import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

const emailAddress = process.env.TEST_USERNAME
const emailPassword = process.env.GMAIL_PASSWORD

// Log configuration status (without exposing credentials)
console.log('Email configuration:', {
  emailConfigured: !!emailAddress,
  passwordConfigured: !!emailPassword,
  emailAddress: emailAddress ? `${emailAddress.substring(0, 3)}...` : 'NOT SET',
  environment: process.env.NODE_ENV,
  vercelEnv: process.env.VERCEL_ENV,
})

if (!emailAddress || !emailPassword) {
  console.error('CRITICAL: Email credentials not configured!')
  console.error('Missing environment variables:', {
    TEST_USERNAME: !!process.env.TEST_USERNAME,
    GMAIL_PASSWORD: !!process.env.GMAIL_PASSWORD,
  })
  console.error(
    'Please set TEST_USERNAME and GMAIL_PASSWORD environment variables'
  )
}

// Create transporter with Gmail configuration
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: emailAddress,
    pass: emailPassword,
  },
})

/**
 * Sends a temporary password email to the user
 * @param {string} toEmail - The recipient's email address
 * @param {string} username - The user's name
 * @param {string} temporaryPassword - The generated temporary password
 * @returns {Promise<Object>} - The nodemailer info object
 */
export async function sendTemporaryPasswordEmail(
  toEmail,
  username,
  temporaryPassword
) {
  // Pre-flight check
  if (!emailAddress || !emailPassword) {
    throw new Error(
      'Email service not configured. Missing TEST_USERNAME or GMAIL_PASSWORD environment variables.'
    )
  }

  try {
    console.log(`Attempting to send temporary password email to: ${toEmail}`)

    const info = await transporter.sendMail({
      from: `Loons Team Balancer <${emailAddress}>`,
      to: toEmail,
      subject: 'Temporary Password for Loons Team Balance',
      html: `
        <p>Hello ${username},</p>
        <p>Your temporary password is: <strong>${temporaryPassword}</strong></p>
        <p>Please use this password to login to your account and change it immediately for security purposes at 
        </p>

        <a href="https://create-teams.vercel.app/password-reset">https://create-teams.vercel.app/password-reset</a>
        
        <p>If you did not request a temporary password, please ignore this email.</p>
        <br>
        <p>Thank you,</p>
        <p>Loons Team Balancer</p>
        <hr>
        <p style="color: #666; font-size: 12px;">This is an automated email. Please do not reply to this email.</p>
        <p style="color: #666; font-size: 12px;">This email was sent on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}.</p>
      `,
    })

    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Error sending email:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
    })
    throw error
  }
}
