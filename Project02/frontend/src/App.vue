<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from "vue";
import MarkdownMessage from "./components/MarkdownMessage.vue";
import { ApiError, streamChat } from "./api/chat";
import type { Conversation, Message, ToolEventPayload } from "./types/chat";
import { createId } from "./utils/id";

const STORAGE_KEY = "project02-ai-chat-v1";

const conversations = ref<Conversation[]>([]);
const activeConversationId = ref("");
const inputValue = ref("");
const isSending = ref(false);
const errorText = ref("");
const retryAfterSec = ref<number>(0);
const chatBodyRef = ref<HTMLElement | null>(null);

const activeConversation = computed(() =>
  conversations.value.find((c) => c.id === activeConversationId.value),
);

const sortedConversations = computed(() =>
  [...conversations.value].sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)),
);

function nowIso() {
  return new Date().toISOString();
}

function formatClock(iso: string) {
  return new Date(iso).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getTitleFromText(text: string) {
  const pure = text.replace(/\s+/g, " ").trim();
  if (!pure) return "新会话";
  return pure.length > 14 ? `${pure.slice(0, 14)}...` : pure;
}

function persistConversations() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations.value));
}

function loadConversations() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Conversation[];
    if (Array.isArray(parsed)) {
      conversations.value = parsed;
      if (parsed.length > 0) {
        activeConversationId.value = parsed[0].id;
      }
    }
  } catch {
    // ignore invalid local data
  }
}

function createConversation() {
  const now = nowIso();
  const conversation: Conversation = {
    id: createId("conv"),
    title: "新会话",
    createdAt: now,
    updatedAt: now,
    messages: [
      {
        id: createId("msg"),
        role: "assistant",
        content:
          "你好，我是 AI 客服助理。你可以问商品问题，也可以直接输入“订单 20260001”触发订单查询工具调用。",
        createdAt: now,
      },
    ],
  };
  conversations.value.unshift(conversation);
  activeConversationId.value = conversation.id;
}

function removeConversation(id: string) {
  const idx = conversations.value.findIndex((c) => c.id === id);
  if (idx === -1) return;
  conversations.value.splice(idx, 1);
  if (!conversations.value.length) {
    createConversation();
    return;
  }
  if (activeConversationId.value === id) {
    activeConversationId.value = conversations.value[0].id;
  }
}

function pushMessage(conv: Conversation, msg: Message) {
  conv.messages.push(msg);
  conv.updatedAt = nowIso();
}

function toolEventToText(payload: ToolEventPayload) {
  const result = payload.result as Record<string, string>;
  return [
    `工具调用: ${payload.name}`,
    `订单号: ${result.orderId ?? "-"}`,
    `状态: ${result.status ?? "-"}`,
    `更新时间: ${result.updatedAt ?? "-"}`,
    `仓库: ${result.warehouse ?? "-"}`,
    `预计: ${result.eta ?? "-"}`,
  ].join("\n");
}

async function scrollToBottom() {
  await nextTick();
  const el = chatBodyRef.value;
  if (!el) return;
  el.scrollTop = el.scrollHeight;
}

async function requestAssistant(conv: Conversation) {
  const pendingAssistant: Message = {
    id: createId("msg"),
    role: "assistant",
    content: "",
    createdAt: nowIso(),
    pending: true,
  };
  pushMessage(conv, pendingAssistant);
  await scrollToBottom();

  const payloadMessages = conv.messages
    .filter((m) => m.id !== pendingAssistant.id)
    .map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      createdAt: m.createdAt,
    }));

  try {
    isSending.value = true;
    errorText.value = "";
    retryAfterSec.value = 0;

    await streamChat(
      {
        conversationId: conv.id,
        messages: payloadMessages,
      },
      {
        onChunk: (text) => {
          pendingAssistant.content += text;
          pendingAssistant.pending = true;
          void scrollToBottom();
        },
        onTool: (payload) => {
          const toolMessage: Message = {
            id: createId("msg"),
            role: "tool",
            content: toolEventToText(payload),
            createdAt: nowIso(),
          };
          pushMessage(conv, toolMessage);
          void scrollToBottom();
        },
        onDone: () => {
          pendingAssistant.pending = false;
        },
        onError: (message) => {
          pendingAssistant.pending = false;
          pendingAssistant.error = true;
          pendingAssistant.content = pendingAssistant.content || `请求异常: ${message}`;
          errorText.value = message;
        },
      },
    );
  } catch (error) {
    pendingAssistant.pending = false;
    pendingAssistant.error = true;

    if (error instanceof ApiError) {
      errorText.value = error.message;
      retryAfterSec.value = error.retryAfterSec ?? 0;
      pendingAssistant.content = `请求失败(${error.status}): ${error.message}`;
    } else {
      const msg = error instanceof Error ? error.message : "未知错误";
      errorText.value = msg;
      pendingAssistant.content = `请求失败: ${msg}`;
    }
  } finally {
    isSending.value = false;
  }
}

async function sendMessage() {
  const text = inputValue.value.trim();
  if (!text || isSending.value) return;

  if (!activeConversation.value) {
    createConversation();
  }
  const conv = activeConversation.value!;

  if (conv.title === "新会话") {
    conv.title = getTitleFromText(text);
  }

  const userMessage: Message = {
    id: createId("msg"),
    role: "user",
    content: text,
    createdAt: nowIso(),
  };
  pushMessage(conv, userMessage);
  inputValue.value = "";
  await scrollToBottom();
  await requestAssistant(conv);
}

async function retryLast() {
  if (isSending.value || !activeConversation.value) return;
  const conv = activeConversation.value;
  const idx = [...conv.messages]
    .reverse()
    .findIndex((m) => m.role === "assistant" && m.error);
  if (idx !== -1) {
    const realIdx = conv.messages.length - idx - 1;
    conv.messages.splice(realIdx, 1);
  }
  await requestAssistant(conv);
}

watch(
  conversations,
  () => {
    persistConversations();
  },
  { deep: true },
);

onMounted(() => {
  loadConversations();
  if (!conversations.value.length) {
    createConversation();
  }
  void scrollToBottom();
});
</script>

<template>
  <div class="page">
    <aside class="sidebar">
      <div class="brand">
        <h1>ShopPilot AI</h1>
        <p>客服 + 工具调用演示</p>
      </div>
      <button class="new-btn" type="button" @click="createConversation">+ 新会话</button>
      <div class="conv-list">
        <button
          v-for="item in sortedConversations"
          :key="item.id"
          type="button"
          class="conv-item"
          :class="{ active: item.id === activeConversationId }"
          @click="activeConversationId = item.id"
        >
          <div class="conv-title">{{ item.title }}</div>
          <div class="conv-time">{{ formatClock(item.updatedAt) }}</div>
        </button>
      </div>
      <button
        type="button"
        class="danger-btn"
        :disabled="!activeConversationId || isSending"
        @click="removeConversation(activeConversationId)"
      >
        删除当前会话
      </button>
    </aside>

    <main class="chat">
      <header class="chat-header">
        <div>
          <h2>{{ activeConversation?.title ?? "新会话" }}</h2>
          <p>支持 SSE 流式输出、多轮上下文、本地持久化、订单状态工具调用。</p>
        </div>
        <button class="retry-btn" type="button" :disabled="isSending" @click="retryLast">重试上次请求</button>
      </header>

      <section ref="chatBodyRef" class="chat-body">
        <article
          v-for="msg in activeConversation?.messages"
          :key="msg.id"
          class="msg-row"
          :class="[msg.role, { pending: msg.pending, error: msg.error }]"
        >
          <div class="msg-meta">
            <span class="role">{{ msg.role }}</span>
            <span>{{ formatClock(msg.createdAt) }}</span>
          </div>
          <div class="bubble">
            <MarkdownMessage v-if="msg.role !== 'user'" :text="msg.content || '...'" />
            <p v-else>{{ msg.content }}</p>
          </div>
        </article>
      </section>

      <footer class="composer">
        <textarea
          v-model="inputValue"
          :disabled="isSending || retryAfterSec > 0"
          placeholder="输入消息，示例：帮我查订单 20260001 的物流状态"
          @keydown.ctrl.enter.prevent="sendMessage"
        />
        <div class="composer-row">
          <p class="tip">Ctrl + Enter 发送</p>
          <button
            class="send-btn"
            type="button"
            :disabled="isSending || !inputValue.trim() || retryAfterSec > 0"
            @click="sendMessage"
          >
            {{ isSending ? "发送中..." : "发送" }}
          </button>
        </div>
        <p v-if="errorText" class="error">错误：{{ errorText }}</p>
        <p v-if="retryAfterSec > 0" class="warn">请求过于频繁，请 {{ retryAfterSec }} 秒后再试。</p>
      </footer>
    </main>
  </div>
</template>
