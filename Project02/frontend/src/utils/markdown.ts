import DOMPurify from "dompurify";
import hljs from "highlight.js";
import { marked } from "marked";

marked.setOptions({
  gfm: true,
  breaks: true,
});

export function renderMarkdown(text: string): string {
  const raw = marked.parse(text) as string;
  const tpl = document.createElement("template");
  tpl.innerHTML = raw;

  tpl.content.querySelectorAll("pre code").forEach((block) => {
    hljs.highlightElement(block as HTMLElement);
  });

  return DOMPurify.sanitize(tpl.innerHTML);
}
