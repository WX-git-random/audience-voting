import { JWT } from "google-auth-library"

const SHEET_NAME = "Form Responses 1"
const EMAIL_HEADER = "Email Address"

export type AllowlistResult =
  | { status: "ok"; emails: Set<string> }
  | { status: "unconfigured" }
  | { status: "error"; message: string }

/**
 * Reads the registered-voter emails from the "Form Responses 1" tab of the
 * Google Sheet, mirroring the original gspread `load_users()` behaviour.
 *
 * Returns "unconfigured" when the Google credentials are absent so the caller
 * can decide how to degrade instead of hard-failing the whole page.
 */
export async function loadRegisteredEmails(): Promise<AllowlistResult> {
  const rawCreds = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  const sheetId = process.env.GOOGLE_SHEET_ID

  if (!rawCreds || !sheetId) return { status: "unconfigured" }

  try {
    const creds = JSON.parse(rawCreds) as {
      client_email: string
      private_key: string
    }

    const auth = new JWT({
      email: creds.client_email,
      // Env vars often carry literal "\n" sequences instead of real newlines.
      key: creds.private_key.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    })

    const token = await auth.getAccessToken()

    const range = encodeURIComponent(`${SHEET_NAME}!A1:Z10000`)
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}`,
      {
        headers: { Authorization: `Bearer ${token.token}` },
        cache: "no-store",
      },
    )

    if (!res.ok) {
      const body = await res.text()
      return {
        status: "error",
        message: `Google Sheets responded ${res.status}: ${body.slice(0, 200)}`,
      }
    }

    const data = (await res.json()) as { values?: string[][] }
    const rows = data.values ?? []
    if (rows.length === 0) return { status: "ok", emails: new Set() }

    const header = rows[0]
    let emailIndex = header.findIndex((h) => h?.trim() === EMAIL_HEADER)
    // Fall back to any column that looks like an email header.
    if (emailIndex === -1) {
      emailIndex = header.findIndex((h) => h?.toLowerCase().includes("email"))
    }
    if (emailIndex === -1) {
      return {
        status: "error",
        message: `Could not find an "${EMAIL_HEADER}" column in the sheet.`,
      }
    }

    const emails = new Set<string>()
    for (const row of rows.slice(1)) {
      const value = row[emailIndex]
      if (value?.trim()) emails.add(value.trim().toLowerCase())
    }

    return { status: "ok", emails }
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unknown Sheets error",
    }
  }
}
