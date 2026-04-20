export type Role = "system" | "user" | "assistant" | "tool";

export interface Message {
  id: string;
  role: Role;
  content: string;
  createdAt: string;
  pending?: boolean;
  error?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
}

export interface StreamPayload {
  conversationId: string;
  messages: Message[];
}

export interface ToolEventPayload {
  name: string;
  result: Record<string, unknown>;
}
