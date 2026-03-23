type TokenType = "whitespace" | "string" | "number" | "keyword" | "punct";

interface Token {
  type: TokenType;
  text: string;
}

/**
 * Lex JSON (pretty-printed) for display-only highlighting.
 */
function scanJson(s: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (/\s/.test(c)) {
      const start = i;
      while (i < s.length && /\s/.test(s[i])) i++;
      tokens.push({ type: "whitespace", text: s.slice(start, i) });
      continue;
    }
    if (c === '"') {
      let j = i + 1;
      while (j < s.length) {
        if (s[j] === "\\") {
          j += 2;
          continue;
        }
        if (s[j] === '"') {
          j++;
          break;
        }
        j++;
      }
      tokens.push({ type: "string", text: s.slice(i, j) });
      i = j;
      continue;
    }
    if (/[-0-9]/.test(c)) {
      let j = i;
      while (j < s.length && /[-0-9.eE+]/.test(s[j])) j++;
      tokens.push({ type: "number", text: s.slice(i, j) });
      i = j;
      continue;
    }
    if (s.startsWith("true", i)) {
      tokens.push({ type: "keyword", text: "true" });
      i += 4;
      continue;
    }
    if (s.startsWith("false", i)) {
      tokens.push({ type: "keyword", text: "false" });
      i += 5;
      continue;
    }
    if (s.startsWith("null", i)) {
      tokens.push({ type: "keyword", text: "null" });
      i += 4;
      continue;
    }
    tokens.push({ type: "punct", text: c });
    i++;
  }
  return tokens;
}

function isObjectKeyString(tokens: Token[], index: number): boolean {
  if (tokens[index]?.type !== "string") return false;
  let j = index + 1;
  while (j < tokens.length && tokens[j].type === "whitespace") j++;
  return tokens[j]?.type === "punct" && tokens[j].text === ":";
}

const classes: Record<TokenType, string> = {
  whitespace: "text-stone-300 dark:text-stone-600",
  string: "text-emerald-600 dark:text-emerald-400",
  number: "text-violet-600 dark:text-violet-300",
  keyword: "text-amber-600 dark:text-amber-300",
  punct: "text-stone-500 dark:text-stone-500",
};

const keyStringClass = "text-sky-700 dark:text-sky-300";

export function HighlightedJson({ value }: { value: unknown }) {
  let json: string;
  try {
    json = JSON.stringify(value, null, 2);
  } catch {
    json = String(value);
  }

  const tokens = scanJson(json);
  return (
    <code className="block font-mono text-[12px] leading-relaxed sm:text-[13px]">
      {tokens.map((t, k) => {
        if (t.type === "string" && isObjectKeyString(tokens, k)) {
          return (
            <span key={k} className={keyStringClass}>
              {t.text}
            </span>
          );
        }
        const cls =
          t.type === "string" ? classes.string : classes[t.type];
        return (
          <span key={k} className={cls}>
            {t.text}
          </span>
        );
      })}
    </code>
  );
}

export function JsonPreviewBlock({ value }: { value: unknown }) {
  return (
    <pre
      className={
        "max-h-[min(55vh,520px)] overflow-auto rounded-xl border border-stone-200 " +
        "bg-stone-950 p-4 text-left shadow-inner dark:border-stone-700 " +
        "dark:bg-stone-950"
      }
      tabIndex={0}
    >
      <HighlightedJson value={value} />
    </pre>
  );
}
