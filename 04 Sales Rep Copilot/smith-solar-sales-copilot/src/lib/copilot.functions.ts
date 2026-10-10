import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const WEBHOOK = "https://half-unless-donor.ngrok-free.dev/webhook/sales-copilot";

export type ToolCall = { tool: string; ok: boolean };

// Proxied server-side to avoid browser CORS / ngrok interstitial issues.
export const sendToCopilot = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ sessionId: z.string(), message: z.string().min(1) }).parse(d))
  .handler(async ({ data }) => {
    const res = await fetch(WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Webhook error ${res.status}`);
    const text = await res.text();
    let json: any;
    try {
      json = JSON.parse(text);
    } catch {
      json = { reply: text };
    }
    if (Array.isArray(json)) json = json[0] ?? {};
    const toolCalls: ToolCall[] = Array.isArray(json.toolCalls)
      ? json.toolCalls.map((t: any) => ({ tool: String(t.tool), ok: !!t.ok }))
      : [];
    return { reply: String(json.reply ?? ""), toolCalls };
  });
