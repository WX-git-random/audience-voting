"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { votes } from "@/lib/db/schema"
import { endAdminSession, isAdmin, startAdminSession, verifyPassword } from "@/lib/admin-auth"

export type AdminState = { error?: string; cleared?: number }

export async function login(_prev: AdminState, formData: FormData): Promise<AdminState> {
  const password = String(formData.get("password") ?? "")
  if (!password) return { error: "请输入密码" }

  if (!verifyPassword(password)) {
    // Small delay to blunt rapid password guessing.
    await new Promise((r) => setTimeout(r, 600))
    return { error: "密码错误" }
  }

  await startAdminSession()
  redirect("/admin")
}

export async function logout() {
  await endAdminSession()
  redirect("/admin")
}

/**
 * Wipes every vote so the next round starts at zero. The admin check runs
 * here on the server, not just in the UI — hiding the button is presentation,
 * this is the actual protection.
 */
export async function clearAllVotes(): Promise<AdminState> {
  if (!(await isAdmin())) return { error: "未授权" }

  const deleted = await db.delete(votes).returning({ email: votes.email })

  revalidatePath("/")
  revalidatePath("/admin")
  return { cleared: deleted.length }
}
