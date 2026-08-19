import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { accessStatusSchema, decideAccessSchema, requestAccessSchema } from "./schemas";

export const requestFullAccess = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => requestAccessSchema.parse(input))
  .handler(async ({ data }) => {
    const { createAccessRequest } = await import("./access.server");
    const { clientIpFrom } = await import("./security.server");
    return createAccessRequest(data, clientIpFrom(getRequest().headers));
  });

export const getAccessRequestResult = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => accessStatusSchema.parse(input))
  .handler(async ({ data }) => {
    const { readAccessRequest } = await import("./access.server");
    return readAccessRequest(data.requestId);
  });

export const respondToAccessRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => decideAccessSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { decideAccessRequest } = await import("./access.server");
    const { clientIpFrom } = await import("./security.server");
    return decideAccessRequest(
      context.userId,
      data.requestId,
      data.decision,
      clientIpFrom(getRequest().headers),
    );
  });
