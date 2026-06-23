type Block =
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] };

function parseContent(content: string): Block[] {
  const lines = content.split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const trimmed = lines[i].trim();

    if (!trimmed) { i++; continue; }

    if (trimmed.startsWith("### ")) {
      blocks.push({ type: "h3", text: trimmed.slice(4) });
      i++;
      continue;
    }

    if (trimmed.startsWith("## ")) {
      blocks.push({ type: "h2", text: trimmed.slice(3) });
      i++;
      continue;
    }

    if (trimmed.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("- ")) {
        items.push(lines[i].trim().slice(2));
        i++;
      }
      blocks.push({ type: "ul", items });
      continue;
    }

    if (/^\d+\.\s/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ""));
        i++;
      }
      blocks.push({ type: "ol", items });
      continue;
    }

    const paragraphLines: string[] = [];
    while (i < lines.length) {
      const l = lines[i].trim();
      if (!l || l.startsWith("### ") || l.startsWith("## ") || l.startsWith("- ") || /^\d+\.\s/.test(l)) break;
      paragraphLines.push(l);
      i++;
    }
    if (paragraphLines.length > 0) {
      blocks.push({ type: "p", text: paragraphLines.join(" ") });
    }
  }

  return blocks;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function parseInlineToHtml(text: string): string {
  const regex = /(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  const parts = text.split(regex);
  return parts.map((part) => {
    if (part.startsWith("[") && part.includes("](")) {
      const m = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (m) return `<a href="${escapeHtml(m[2])}" target="_blank" rel="noopener noreferrer" class="text-primary underline underline-offset-2 hover:opacity-80">${escapeHtml(m[1])}</a>`;
    }
    if (part.startsWith("**") && part.endsWith("**")) {
      return `<strong class="font-semibold text-foreground">${escapeHtml(part.slice(2, -2))}</strong>`;
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return `<em>${escapeHtml(part.slice(1, -1))}</em>`;
    }
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return `<code class="font-mono text-sm bg-secondary px-1.5 py-0.5 rounded text-primary">${escapeHtml(part.slice(1, -1))}</code>`;
    }
    return escapeHtml(part);
  }).join("");
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function renderContentToHtml(content: string): string {
  const blocks = parseContent(content);
  return blocks.map((block) => {
    if (block.type === "h2") {
      const id = slugify(block.text);
      return `<h2 id="${id}" class="text-xl sm:text-2xl font-semibold text-foreground mt-10 mb-4 first:mt-0 scroll-mt-20">${escapeHtml(block.text)}</h2>`;
    }
    if (block.type === "h3") {
      const id = slugify(block.text);
      return `<h3 id="${id}" class="text-lg sm:text-xl font-semibold text-foreground mt-8 mb-3 scroll-mt-20">${escapeHtml(block.text)}</h3>`;
    }
    if (block.type === "p") {
      return `<p class="text-[1.0625rem] text-muted-foreground leading-[1.8] mb-5">${parseInlineToHtml(block.text)}</p>`;
    }
    if (block.type === "ul") {
      const items = block.items.map((item) => `<li class="text-[1.0625rem] text-muted-foreground leading-[1.8] list-disc">${parseInlineToHtml(item)}</li>`).join("\n");
      return `<ul class="mb-5 space-y-2 pl-5">\n${items}\n</ul>`;
    }
    if (block.type === "ol") {
      const items = block.items.map((item) => `<li class="text-[1.0625rem] text-muted-foreground leading-[1.8] list-decimal">${parseInlineToHtml(item)}</li>`).join("\n");
      return `<ol class="mb-5 space-y-2 pl-5">\n${items}\n</ol>`;
    }
    return "";
  }).join("\n");
}
