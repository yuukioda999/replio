import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { reserveGeneration, refundGeneration, type QuotaReservation } from "@/lib/quota";

export const runtime = "nodejs";
const origin = process.env.GO_API_ORIGIN || "http://127.0.0.1:8080";

export async function POST(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const internalSecret = process.env.INTERNAL_API_SECRET;
  let reservation: QuotaReservation | undefined;
  // When auth is configured, enforce it server-side before forwarding requests.
  if (url && anon) {
    if (!internalSecret) return NextResponse.json({error:"auth_not_configured"},{status:503});
    const bearer = request.headers.get("authorization");
    if (!bearer?.startsWith("Bearer ")) return NextResponse.json({error:"unauthorized"},{status:401});
    const auth = createClient(url, anon, {auth:{persistSession:false,autoRefreshToken:false}});
    const {data,error} = await auth.auth.getUser(bearer.slice(7));
    if (error || !data.user) return NextResponse.json({error:"unauthorized"},{status:401});
    const quota = await reserveGeneration(data.user.id);
    if (quota.error === "quota_exceeded") return NextResponse.json({error:"monthly_quota_exceeded"},{status:429});
    if (quota.error || !quota.reservation) return NextResponse.json({error:"quota_unavailable"},{status:503});
    reservation = quota.reservation;
  }
  const body = await request.text();
  const headers: Record<string,string> = {"Content-Type":"application/json"};
  if (internalSecret) headers["X-Replio-Internal-Secret"] = internalSecret;
  try {
    const response = await fetch(origin + "/api/v1/replies/generate", {
      method:"POST",headers,body,signal:AbortSignal.timeout(23000),cache:"no-store"
    });
    if (!response.ok && reservation) await refundGeneration(reservation);
    return new NextResponse(response.body,{
      status:response.status,
      headers:{
        "Content-Type":response.headers.get("content-type")||"application/json",
        ...(response.headers.get("retry-after")?{"Retry-After":response.headers.get("retry-after")!}:{})
      }
    });
  } catch {
    if (reservation) await refundGeneration(reservation);
    return NextResponse.json({error:"upstream_unavailable"},{status:502});
  }
}
