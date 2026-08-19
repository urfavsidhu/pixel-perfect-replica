import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { buildDisplayId, generateAccessKey, sha256Hex } from "./security.server";
import type { BootstrapProfileInput } from "./schemas";

export async function logAudit(params: {
  userId: string | null;
  action: string;
  targetId?: string | null;
  ip?: string | null;
}) {
  await supabaseAdmin.from("audit_logs").insert({
    user_id: params.userId,
    action: params.action,
    target_id: params.targetId ?? null,
    ip_address: params.ip ?? null,
  });
}

export async function ensureProfile(
  userId: string,
  email: string,
  input: BootstrapProfileInput,
) {
  const existing = await supabaseAdmin
    .from("profiles")
    .select("id, display_id")
    .eq("id", userId)
    .maybeSingle();

  if (existing.data) return { displayId: existing.data.display_id, created: false };

  let institutionId: string | null = null;
  if (input.role === "institution") {
    const institution = await supabaseAdmin
      .from("institutions")
      .insert({ name: input.institutionName?.trim() || input.name, contact_email: email })
      .select("id")
      .single();
    if (institution.error) throw new Error(institution.error.message);
    institutionId = institution.data.id;
  }

  const displayId = buildDisplayId(input.role);
  const accessKey = input.role === "student" ? generateAccessKey() : null;

  const profile = await supabaseAdmin.from("profiles").insert({
    id: userId,
    display_id: displayId,
    name: input.name.trim(),
    email,
    institution_id: institutionId,
    access_key_hash: accessKey ? await sha256Hex(accessKey) : null,
    access_key_last_regenerated_at: accessKey ? new Date().toISOString() : null,
  });
  if (profile.error) throw new Error(profile.error.message);

  const role = await supabaseAdmin.from("user_roles").insert({ user_id: userId, role: input.role });
  if (role.error) throw new Error(role.error.message);

  await logAudit({ userId, action: "account_created", targetId: displayId });
  return { displayId, accessKey, created: true };
}

export async function rotateAccessKey(userId: string, ip: string | null) {
  const accessKey = generateAccessKey();
  const now = new Date().toISOString();

  const update = await supabaseAdmin
    .from("profiles")
    .update({ access_key_hash: await sha256Hex(accessKey), access_key_last_regenerated_at: now })
    .eq("id", userId)
    .select("display_id")
    .single();
  if (update.error) throw new Error(update.error.message);

  // Any pending request made with the old key is no longer valid.
  await supabaseAdmin
    .from("access_requests")
    .update({ status: "denied" })
    .eq("student_id", userId)
    .eq("status", "pending");

  await logAudit({ userId, action: "access_key_regenerated", targetId: update.data.display_id, ip });
  return { accessKey, regeneratedAt: now };
}
