import { z } from "zod";

export const MAX_CONTENT_LENGTH = 60000;

export const auditRequestSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Paste a diff or file snippet before running an audit.")
    .max(MAX_CONTENT_LENGTH, "Content is too large for the MVP audit path."),
  inputType: z.enum(["diff", "files"]),
  provider: z.enum(["mock", "deepseek"]),
  intensity: z.enum(["quick", "standard"]),
});

export const agentEventSchema = z.object({
  stage: z.enum(["intake", "plan", "inspect", "finding", "evaluate", "report"]),
  status: z.enum(["pending", "running", "complete", "warning", "error"]),
  title: z.string().min(1),
  detail: z.string().min(1),
  artifact: z.string().optional(),
});

export const findingSchema = z.object({
  severity: z.enum(["critical", "high", "medium", "low", "info"]),
  file: z.string().optional(),
  line: z.number().int().positive().optional(),
  title: z.string().min(1),
  evidence: z.string().min(1),
  recommendation: z.string().min(1),
  category: z.enum(["security", "reliability", "maintainability", "testing", "performance"]),
});

export const evalCardSchema = z.object({
  reproducibility: z.number().min(0).max(100),
  traceability: z.number().min(0).max(100),
  testability: z.number().min(0).max(100),
  confidence: z.number().min(0).max(100),
  score: z.number().min(0).max(100),
});

export const auditResponsePayloadSchema = z.object({
  summary: z.string().min(1),
  riskScore: z.number().min(0).max(100),
  events: z.array(agentEventSchema).min(1),
  findings: z.array(findingSchema),
  evalCard: evalCardSchema,
  reportMarkdown: z.string().optional(),
});

export const auditResponseSchema = auditResponsePayloadSchema.extend({
  id: z.string().min(1),
  createdAt: z.string().min(1),
  provider: z.enum(["mock", "deepseek"]),
  model: z.string().optional(),
  inputMeta: z.object({
    inputType: z.enum(["diff", "files"]),
    intensity: z.enum(["quick", "standard"]),
    contentHash: z.string().regex(/^[a-f0-9]{16}$/),
    estimatedLines: z.number().int().nonnegative(),
  }),
});

export type AuditRequestInput = z.infer<typeof auditRequestSchema>;
