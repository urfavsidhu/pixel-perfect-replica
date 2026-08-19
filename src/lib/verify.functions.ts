import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { verifyCertificateSchema } from "./schemas";

export const verifyCertificate = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => verifyCertificateSchema.parse(input))
  .handler(async ({ data }): Promise<{ result: string }> => {
    const { runPublicVerification } = await import("./verify.server");
    const { clientIpFrom } = await import("./security.server");
    const result = await runPublicVerification(
      data.certificateId,
      clientIpFrom(getRequest().headers),
    );
    return { result };
  });
