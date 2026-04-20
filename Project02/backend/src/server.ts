import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { z } from "zod";
import { generateAssistantReply } from "./lib/chatEngine.js";
import { extractOrderId, getOrderStatus } from "./lib/orderTool.js";
import { checkRateLimit } from "./lib/rateLimit.js";
import type { ChatRequestBody } from "./types.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT ?? 3000);
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN ?? "http://localhost:5173";

app.use(
  cors({
    origin: FRONTEND_ORIGIN,
  }),
);
app.use(express.json({ limit: "1mb" }));

const chatRequestSchema = z.object({
  conversationId: z.string().min(1),
  messages: z
    .array(
      z.object({
        id: z.string(),
        role: z.enum(["system", "user", "assistant", "tool"]),
        content: z.string(),
        createdAt: z.string(),
      }),
    )
    .min(1),
});

function getRequesterKey(req: express.Request): string {
  const ip = req.ip ?? "unknown-ip";
  const conversationId = (req.body?.conversationId as string | undefined) ?? "unknown-conversation";
  return `${ip}:${conversationId}`;
}

function sendSSE(res: express.Response, event: string, data: unknown) {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

async function runAssistant(body: ChatRequestBody) {
  const latestUser = [...body.messages].reverse().find((m) => m.role === "user");
  const latestText = latestUser?.content ?? "";
  let toolPayload: string | undefined;
  let orderResult: ReturnType<typeof getOrderStatus> | null = null;

  const orderId = extractOrderId(latestText);
  if (orderId) {
    orderResult = getOrderStatus(orderId);
    toolPayload = [
      `订单号: ${orderResult.orderId}`,
      `状态: ${orderResult.status}`,
      `更新时间: ${orderResult.updatedAt}`,
      `仓库: ${orderResult.warehouse}`,
      `预计: ${orderResult.eta}`,
    ].join("\n");
  }

  const assistantText = await generateAssistantReply({
    messages: body.messages,
    toolContext: toolPayload,
  });

  return {
    assistantText,
    orderResult,
  };
}

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    now: new Date().toISOString(),
    mode: process.env.OPENAI_API_KEY ? "openai" : "mock",
  });
});

app.get("/api/tools/order-status/:orderId", (req, res) => {
  const { orderId } = req.params;
  const result = getOrderStatus(orderId);
  res.json({
    ok: true,
    result,
  });
});

app.post("/api/chat", async (req, res) => {
  const parsed = chatRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      ok: false,
      message: "Invalid request body",
      issues: parsed.error.issues,
    });
  }

  const rate = checkRateLimit(getRequesterKey(req));
  if (!rate.allowed) {
    return res.status(429).json({
      ok: false,
      message: "Rate limit exceeded",
      retryAfterSec: rate.retryAfterSec,
    });
  }

  try {
    const { assistantText, orderResult } = await runAssistant(parsed.data);
    return res.json({
      ok: true,
      result: {
        assistantText,
        tool: orderResult,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({
      ok: false,
      message,
    });
  }
});

app.post("/api/chat/stream", async (req, res) => {
  const parsed = chatRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      ok: false,
      message: "Invalid request body",
      issues: parsed.error.issues,
    });
  }

  const rate = checkRateLimit(getRequesterKey(req));
  if (!rate.allowed) {
    return res.status(429).json({
      ok: false,
      message: "Rate limit exceeded",
      retryAfterSec: rate.retryAfterSec,
    });
  }

  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  try {
    const { assistantText, orderResult } = await runAssistant(parsed.data);

    if (orderResult) {
      sendSSE(res, "tool", {
        name: "get_order_status",
        result: orderResult,
      });
    }

    const chunkSize = 24;
    for (let i = 0; i < assistantText.length; i += chunkSize) {
      const text = assistantText.slice(i, i + chunkSize);
      sendSSE(res, "chunk", { text });
      await new Promise((resolve) => setTimeout(resolve, 30));
    }

    sendSSE(res, "done", {
      done: true,
      mode: process.env.OPENAI_API_KEY ? "openai" : "mock",
      createdAt: new Date().toISOString(),
    });
    res.end();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    sendSSE(res, "error", {
      message,
    });
    res.end();
  }
});

app.listen(PORT, () => {
  const mode = process.env.OPENAI_API_KEY ? "openai" : "mock";
  console.log(`[backend] listening on http://localhost:${PORT} (mode=${mode})`);
});
