import { createClient } from "@supabase/supabase-js";

export type QuotaReservation = { id: string; userId: string };
export type QuotaResult = { reservation?: QuotaReservation; error?: "quota_exceeded" | "quota_unavailable" };

function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {auth:{persistSession:false,autoRefreshToken:false}});
}

/** Reserve one generation atomically in PostgreSQL before making the paid API call. */
export async function reserveGeneration(userId: string): Promise<QuotaResult> {
  const db = serviceClient();
  if (!db) return {error:"quota_unavailable"};
  const {data,error} = await db.rpc("reserve_generation", {p_user_id:userId});
  if (error) return {error:"quota_unavailable"};
  if (!data) return {error:"quota_exceeded"};
  return {reservation:{id:String(data),userId}};
}

/** On upstream failure refund the reservation; on success it remains charged. */
export async function refundGeneration(reservation: QuotaReservation): Promise<void> {
  const db = serviceClient();
  if (!db) return;
  const {error} = await db.rpc("refund_generation", {p_reservation_id:reservation.id,p_user_id:reservation.userId});
  if (error) console.error("Quota refund failed", {reservationId:reservation.id,errorCode:error.code});
}
