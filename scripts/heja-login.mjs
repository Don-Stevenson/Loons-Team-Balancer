#!/usr/bin/env node
// Create a new Heja refresh token for the server (REFRESH_TOKEN).
//
// Heja has no password login: it emails a 4-digit code. This script asks Heja
// to send the code, prompts you to type it in, and exchanges it for a refresh
// token that is valid for one year.
//
// Usage:
//   npm run heja:login             log in and write REFRESH_TOKEN to .env
//   npm run heja:login -- --check  show when the current REFRESH_TOKEN expires and test it

import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { createInterface } from 'node:readline/promises'

const AUTH_URL = 'https://auth.heja.io'
const ENV_FILE = '.env'
// Heja's web client salts the emailed code with this before sending it
const CODE_SALT = 'atropine-radices-necrotic-coaxial'
// Separate from your browser's device token, so signing out of Heja in Chrome
// doesn't revoke the app's refresh token
const DEVICE_TOKEN = sha256('teamGenerator-server')

const HEADERS = {
  'Content-Type': 'application/json;charset=utf-8',
  Accept: 'application/json',
  'heja-api-version': '3',
  'x-app-version-brand': 'web',
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex')
}

function decodeJwt(token) {
  try {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString())
  } catch {
    return null
  }
}

function describeExpiry(token) {
  const payload = decodeJwt(token)
  if (!payload?.exp) return 'unknown expiry'
  const expires = new Date(payload.exp * 1000)
  const daysLeft = Math.floor((expires - Date.now()) / 86400000)
  return `expires ${expires.toDateString()} (${daysLeft} days left)`
}

async function authPost(path, body) {
  const response = await fetch(`${AUTH_URL}${path}`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify(body),
  })
  const json = await response.json().catch(() => ({}))
  if (!response.ok) {
    const message = json.errors?.[0]?.message || response.statusText
    throw new Error(`${path} failed (${response.status}): ${message}`)
  }
  return { data: json.data ?? json, response }
}

async function testRefreshToken(refreshToken) {
  const response = await fetch(`${AUTH_URL}/login/refreshToken`, {
    method: 'POST',
    headers: { ...HEADERS, Cookie: `refreshToken=${refreshToken}` },
    body: JSON.stringify({
      credentialType: 'refreshToken',
      refreshToken: 'cookie',
    }),
  })
  return response.ok
}

function readRefreshTokenFromCookies(response) {
  const cookie = response.headers
    .getSetCookie()
    .find((c) => c.startsWith('refreshToken='))
  return cookie?.split(';')[0].slice('refreshToken='.length)
}

function writeEnvToken(refreshToken) {
  const env = existsSync(ENV_FILE) ? readFileSync(ENV_FILE, 'utf8') : ''
  const line = `REFRESH_TOKEN=${refreshToken}`
  const updated = /^REFRESH_TOKEN=.*$/m.test(env)
    ? env.replace(/^REFRESH_TOKEN=.*$/m, line)
    : `${env.replace(/\n?$/, '\n')}${line}\n`
  writeFileSync(ENV_FILE, updated)
}

function copyToClipboard(value) {
  try {
    execFileSync('pbcopy', { input: value })
    return true
  } catch {
    return false
  }
}

async function check() {
  const refreshToken = process.env.REFRESH_TOKEN
  if (!refreshToken) {
    console.log(`No REFRESH_TOKEN found in ${ENV_FILE}.`)
    process.exitCode = 1
    return
  }
  const works = await testRefreshToken(refreshToken)
  console.log(`REFRESH_TOKEN ${describeExpiry(refreshToken)}`)
  console.log(
    works
      ? 'Heja accepted it.'
      : 'Heja rejected it. Run `npm run heja:login` to create a new one.'
  )
  if (!works) process.exitCode = 1
}

async function login() {
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  try {
    const email = (await rl.question('Heja account email: ')).trim()

    const { data: verification } = await authPost('/verificationcode', {
      deviceToken: DEVICE_TOKEN,
      email,
      checkExisting: true,
    })
    console.log(`Heja sent a 4-digit code to ${email}.`)

    const code = (await rl.question('Code: ')).trim()
    const { data: session, response } = await authPost('/login/email', {
      deviceToken: DEVICE_TOKEN,
      credentialType: 'email',
      code: sha256(code + CODE_SALT),
      createNew: false,
      verificationRef: verification.ref,
      setCookie: true,
    })

    const refreshToken =
      session.refreshToken || readRefreshTokenFromCookies(response)
    if (!refreshToken) {
      throw new Error('Heja logged in but did not return a refresh token.')
    }
    if (!(await testRefreshToken(refreshToken))) {
      throw new Error('Heja returned a refresh token that does not work.')
    }

    console.log(`\nNew REFRESH_TOKEN ${describeExpiry(refreshToken)}.`)

    const save = await rl.question(`Write it to ${ENV_FILE}? [Y/n] `)
    if (!/^n/i.test(save.trim())) {
      writeEnvToken(refreshToken)
      console.log(`Updated REFRESH_TOKEN in ${ENV_FILE}.`)
    }

    if (copyToClipboard(refreshToken)) {
      console.log('Copied the token to your clipboard.')
    }
    console.log(
      [
        '',
        'To update production on Vercel:',
        '  vercel env rm REFRESH_TOKEN production -y',
        '  pbpaste | vercel env add REFRESH_TOKEN production',
        '  vercel --prod   (or redeploy from the Vercel dashboard)',
      ].join('\n')
    )
  } finally {
    rl.close()
  }
}

if (existsSync(ENV_FILE)) process.loadEnvFile(ENV_FILE)

const run = process.argv.includes('--check') ? check : login
run().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
