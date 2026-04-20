import type { StreamPayload, ToolEventPayload } from "../types/chat";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

export class ApiError extends Error {
  status: number;
  retryAfterSec?: number;

  constructor(message: string, status: number, retryAfterSec?: number) {
    super(message);
    this.status = status;
    this.retryAfterSec = retryAfterSec;
  }
}

interface StreamHandlers {
  onChunk: (text: string) => void;
  onTool: (payload: ToolEventPayload) => void;
  onDone: () => void;
  onError: (message: string) => void;
}

function parseSSEBlock(block: string): { event: string; data: string } {
  let event = "message";
  let data = "";

  for (const line of block.split("\n")) {
    if (line.startsWith("event:")) {
      event = line.slice(6).trim();
    }
    if (line.startsWith("data:")) {
      data += line.slice(5).trim();
    }
  }

  return { event, data };
}

export async function streamChat(payload: StreamPayload, handlers: StreamHandlers) {
  const resp = await fetch(`${API_BASE}/api/chat/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!resp.ok) {
    let message = `HTTP ${resp.status}`;
    let retryAfterSec: number | undefined;
    try {
      const data = (await resp.json()) as { message?: string; retryAfterSec?: number };
      message = data.message ?? message;
      retryAfterSec = data.retryAfterSec;
    } catch {
      // noop
    }
    throw new ApiError(message, resp.status, retryAfterSec);
  }

  if (!resp.body) {
    throw new Error("Readable stream is not available.");
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const blocks = buffer.split("\n\n");
    buffer = blocks.pop() ?? "";

    for (const block of blocks) {
      if (!block.trim()) continue;
      const { event, data } = parseSSEBlock(block);
      if (!data) continue;

      try {
        const json = JSON.parse(data) as Record<string, unknown>;
        if (event === "chunk") {
          handlers.onChunk(String(json.text ?? ""));
        } else if (event === "tool") {
          handlers.onTool(json as unknown as ToolEventPayload);
        } else if (event === "done") {
          handlers.onDone();
        } else if (event === "error") {
          handlers.onError(String(json.message ?? "Unknown stream error"));
        }
      } catch (error) {
        handlers.onError(error instanceof Error ? error.message : "Invalid stream payload");
      }
    }
  }
}
