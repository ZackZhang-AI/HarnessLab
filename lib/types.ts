export type InputType = "diff" | "files";
export type Provider = "mock" | "deepseek";
export type Intensity = "quick" | "standard";

export type AgentEvent = {
  stage: "intake" | "plan" | "inspect" | "finding" | "evaluate" | "report";
  status: "pending" | "running" | "complete" | "warning" | "error";
  title: string;
  detail: string;
  artifact?: string;
};

export type Finding = {
  severity: "critical" | "high" | "medium" | "low" | "info";
  file?: string;
  line?: number;
  title: string;
  evidence: string;
  recommendation: string;
  category: "security" | "reliability" | "maintainability" | "testing" | "performance";
};

export type EvalCard = {
  reproducibility: number;
  traceability: number;
  testability: number;
  confidence: number;
  score: number;
};

export type AuditRequest = {
  content: string;
  inputType: InputType;
  provider: Provider;
  intensity: Intensity;
};

export type AuditInputMeta = {
  inputType: InputType;
  intensity: Intensity;
  contentHash: string;
  estimatedLines: number;
};

export type AuditResponse = {
  id: string;
  createdAt: string;
  provider: Provider;
  model?: string;
  summary: string;
  riskScore: number;
  inputMeta: AuditInputMeta;
  events: AgentEvent[];
  findings: Finding[];
  evalCard: EvalCard;
  reportMarkdown: string;
};

export type ParsedAuditInput = AuditInputMeta & {
  files: string[];
  lineHints: number[];
};

export type AuditReportInput = Pick<
  AuditResponse,
  "summary" | "riskScore" | "findings" | "evalCard"
>;
