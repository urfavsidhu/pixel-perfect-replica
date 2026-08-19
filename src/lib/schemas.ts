import { z } from "zod";

export const bootstrapProfileSchema = z.object({
  name: z.string().min(2).max(120),
  role: z.enum(["student", "institution"]),
  institutionName: z.string().max(160).optional(),
});

export const verifyCertificateSchema = z.object({
  certificateId: z.string().min(3).max(64),
});

export const requestAccessSchema = z.object({
  studentDisplayId: z.string().min(4).max(40),
  accessKey: z.string().min(4).max(40),
  requesterName: z.string().min(2).max(120),
  requesterOrganization: z.string().max(160).optional(),
  requesterEmail: z.string().email().max(160),
});

export const accessStatusSchema = z.object({
  requestId: z.string().uuid(),
});

export const decideAccessSchema = z.object({
  requestId: z.string().uuid(),
  decision: z.enum(["allowed", "denied"]),
});

export type BootstrapProfileInput = z.infer<typeof bootstrapProfileSchema>;
export type RequestAccessInput = z.infer<typeof requestAccessSchema>;
