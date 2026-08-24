import { createHmac, timingSafeEqual } from "crypto"
import { cookies } from "next/headers"

const COOKIE_NAME = "dv_admin"
const MAX_AGE_SECONDS = 60 * 60 * 8 // 8 hours, enough for one event

function getSecret() {
  const secret = process.env.ADMIN_PASSWORD
  if (!secret) throw new Error("ADMIN_PASSWORD is not configured")
  return secret
}

/**
 * The cookie value is an HMAC of a fixed marker keyed by the password, so a
 * visitor cannot forge it without knowing the password, and the password
 * itself is never stored in the browser. Rotating ADMIN_PASSWORD invalidates
 * every existing admin session for free.
 */
function expectedToken() {
  return createHmac("sha256", getSecret()).update("admin-session-v1").digest("hex")
}

function safeEqual(a: string, b: string) {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  // timingSafeEqual throws on length mismatch, so guard first.
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}

export function verifyPassword(input: string) {
  return safeEqual(input, getSecret())
}

export async function isAdmin() {
  try {
    const token = (await cookies()).get(COOKIE_NAME)?.value
    if (!token) return false
    return safeEqual(token, expectedToken())
  } catch {
    return false
  }
}

export async function startAdminSession() {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, expectedToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  })
}

export async function endAdminSession() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}
