export type ChatRole = "system" | "user" | "assistant" | "tool";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
}

export interface OrderStatus {
  orderId: string;
  status: string;
  updatedAt: string;
  warehouse: string;
  eta: string;
}

export interface ChatRequestBody {
  conversationId: string;
  messages: ChatMessage[];
}
