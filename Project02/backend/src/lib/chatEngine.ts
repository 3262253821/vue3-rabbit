import type { ChatMessage } from "../types.js";

interface ChatEngineInput {
  messages: ChatMessage[];
  toolContext?: string;
}

function toModelMessages(messages: ChatMessage[], toolContext?: string) {
  const systemPrompt = [
    "你是一个电商客服助手，请使用简体中文回答。",
    "回答要清晰，必要时给出分点说明。",
    "如果用户提到订单状态，优先基于给定工具结果回答，不要编造数据。",
  ].join("\n");

  const normalized = messages
    .filter((m) => Boolean(m.content?.trim()))
    .map((m) => ({
      role: m.role === "tool" ? "system" : m.role,
      content: m.content,
    }));

  const result = [{ role: "system", content: systemPrompt }, ...normalized] as Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }>;

  if (toolContext) {
    result.push({
      role: "system",
      content: `工具结果：\n${toolContext}\n请基于以上工具结果回答用户问题。`,
    });
  }

  return result;
}

function mockReply(messages: ChatMessage[], toolContext?: string): string {
  const latestUser = [...messages].reverse().find((m) => m.role === "user");
  const text = latestUser?.content ?? "";

  if (toolContext) {
    return `我已经帮你查到订单信息：\n\n${toolContext}\n\n如果你希望，我还可以继续帮你查询发票、售后或退款进度。`;
  }

  return [
    "已收到你的问题。",
    `你刚刚说的是：${text}`,
    "这是本地 mock 回复（未配置 OpenAI Key）。",
    "你可以在 backend/.env 中配置 OPENAI_API_KEY 后获得真实模型回复。",
  ].join("\n\n");
}

export async function generateAssistantReply(input: ChatEngineInput): Promise<string> {
  const { messages, toolContext } = input;
  const apiKey = process.env.OPENAI_API_KEY;
  const baseUrl = (process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1").replace(/\/$/, "");
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  if (!apiKey) {
    return mockReply(messages, toolContext);
  }

  const modelMessages = toModelMessages(messages, toolContext);

  const resp = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      messages: modelMessages,
    }),
  });

  if (!resp.ok) {
    const errorText = await resp.text();
    throw new Error(`OpenAI request failed (${resp.status}): ${errorText}`);
  }

  const data = (await resp.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const reply = data.choices?.[0]?.message?.content?.trim();

  if (!reply) {
    throw new Error("OpenAI returned empty content.");
  }

  return reply;
}
