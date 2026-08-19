import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { bootstrapProfileSchema } from "./schemas";

export const bootstrapProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => bootstrapProfileSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { ensureProfile } = await import("./account.server");
    const email = (context.claims["email"] as string | undefined) ?? "";
    return ensureProfile(context.userId, email, data);
  });

export const regenerateAccessKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { rotateAccessKey } = await import("./account.server");
    const { clientIpFrom } = await import("./security.server");
    const ip = clientIpFrom(getRequest().headers);
    return rotateAccessKey(context.userId, ip);
  });
