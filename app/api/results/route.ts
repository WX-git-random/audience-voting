import { getResults } from "@/app/actions/vote"

export const dynamic = "force-dynamic"

export async function GET() {
  const results = await getResults()
  return Response.json(results, {
    headers: { "Cache-Control": "no-store" },
  })
}
