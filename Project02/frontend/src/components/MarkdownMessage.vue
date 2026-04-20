<script setup lang="ts">
import { computed } from "vue";
import { renderMarkdown } from "../utils/markdown";

const props = defineProps<{
  text: string;
}>();

const html = computed(() => renderMarkdown(props.text || ""));
</script>

<template>
  <div class="md-body" v-html="html"></div>
</template>

<style scoped>
.md-body :deep(p) {
  margin: 0.35rem 0;
}

.md-body :deep(pre) {
  background: #0b1220;
  border-radius: 12px;
  padding: 12px;
  overflow-x: auto;
}

.md-body :deep(code) {
  font-family: Consolas, Monaco, "Courier New", monospace;
}

.md-body :deep(pre code) {
  color: #e2e8f0;
}
</style>
