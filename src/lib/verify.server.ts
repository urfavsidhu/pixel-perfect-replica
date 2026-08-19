import { supabaseAdmin } from "@/integrations/supabase/client.server";

export async function runPublicVerification(
  certificateId: string,
  ip: string,
): Promise<string> {
  const { data, error } = await supabaseAdmin.rpc("public_verify_certificate", {
    _certificate_id: certificateId,
    _ip: ip,
  });
  if (error) throw new Error(error.message);
  return (data as string | null) ?? "NOT_FOUND";
}
