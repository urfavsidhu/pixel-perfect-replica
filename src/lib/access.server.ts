import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { normalizeAccessKey, sha256Hex } from "./security.server";
import { logAudit } from "./account.server";
import type { RequestAccessInput } from "./schemas";

const ACCESS_WINDOW_MS = 24 * 60 * 60 * 1000;

export async function createAccessRequest(input: RequestAccessInput, ip: string | null) {
  const keyHash = await sha256Hex(normalizeAccessKey(input.accessKey));

  const student = await supabaseAdmin
    .from("profiles")
    .select("id, access_key_hash")
    .eq("display_id", input.studentDisplayId.trim().toUpperCase())
    .maybeSingle();

  if (!student.data || student.data.access_key_hash !== keyHash) {
    return { ok: false as const, error: "Student ID or access key is incorrect." };
  }

  const inserted = await supabaseAdmin
    .from("access_requests")
    .insert({
      requester_name: input.requesterName.trim(),
      requester_organization: input.requesterOrganization?.trim() || null,
      requester_email: input.requesterEmail.trim().toLowerCase(),
      student_id: student.data.id,
      access_key_used_hash: keyHash,
      status: "pending",
    })
    .select("id")
    .single();
  if (inserted.error) throw new Error(inserted.error.message);

  await logAudit({
    userId: null,
    action: "access_requested",
    targetId: inserted.data.id,
    ip,
  });
  return { ok: true as const, requestId: inserted.data.id };
}

export async function readAccessRequest(requestId: string) {
  const request = await supabaseAdmin
    .from("access_requests")
    .select("id, status, expires_at, student_id, requester_name")
    .eq("id", requestId)
    .maybeSingle();

  if (!request.data) return { status: "not_found" as const };

  let status = request.data.status;
  if (
    status === "allowed" &&
    request.data.expires_at &&
    new Date(request.data.expires_at).getTime() < Date.now()
  ) {
    await supabaseAdmin.from("access_requests").update({ status: "expired" }).eq("id", requestId);
    status = "expired";
  }

  if (status !== "allowed") {
    return { status, certificates: [] as unknown[], student: null };
  }

  const student = await supabaseAdmin
    .from("profiles")
    .select("display_id, name")
    .eq("id", request.data.student_id)
    .single();

  const certificates = await supabaseAdmin
    .from("certificates")
    .select(
      "certificate_id, student_name, degree, department, graduation_year, grade_or_cgpa, issue_date, status, trust_score",
    )
    .eq("student_id", request.data.student_id)
    .order("created_at", { ascending: false });

  await logAudit({ userId: null, action: "full_details_viewed", targetId: requestId });

  return {
    status,
    expiresAt: request.data.expires_at,
    student: student.data,
    certificates: certificates.data ?? [],
  };
}

export async function decideAccessRequest(
  studentId: string,
  requestId: string,
  decision: "allowed" | "denied",
  ip: string | null,
) {
  const patch =
    decision === "allowed"
      ? {
          status: "allowed" as const,
          expires_at: new Date(Date.now() + ACCESS_WINDOW_MS).toISOString(),
        }
      : { status: "denied" as const };

  const updated = await supabaseAdmin
    .from("access_requests")
    .update(patch)
    .eq("id", requestId)
    .eq("student_id", studentId)
    .eq("status", "pending")
    .select("id")
    .maybeSingle();

  if (!updated.data) return { ok: false as const, error: "Request is no longer pending." };

  await logAudit({
    userId: studentId,
    action: decision === "allowed" ? "access_allowed" : "access_denied",
    targetId: requestId,
    ip,
  });
  return { ok: true as const };
}
