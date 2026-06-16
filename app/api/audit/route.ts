import { ZodError } from "zod";
import { runAuditProvider } from "@/lib/providers";
import {
  ProviderConfigurationError,
  ProviderResponseError,
  ProviderTimeoutError,
} from "@/lib/providers/deepseek";
import { auditRequestSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const parsed = auditRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      {
        error: "Invalid audit request.",
        issues: parsed.error.issues.map((issue) => issue.message),
      },
      { status: 400 },
    );
  }

  try {
    const result = await runAuditProvider(parsed.data);
    return Response.json(result);
  } catch (error) {
    if (error instanceof ProviderConfigurationError) {
      return Response.json({ error: error.message }, { status: error.status });
    }

    if (error instanceof ProviderTimeoutError) {
      return Response.json(
        {
          error: error.message,
          events: [
            {
              stage: "inspect",
              status: "error",
              title: "Provider timeout",
              detail: "The model request exceeded the configured timeout.",
            },
          ],
        },
        { status: error.status },
      );
    }

    if (error instanceof ProviderResponseError || error instanceof ZodError) {
      return Response.json({ error: error.message }, { status: 502 });
    }

    return Response.json({ error: "Unexpected audit failure." }, { status: 500 });
  }
}
