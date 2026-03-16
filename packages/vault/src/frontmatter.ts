export interface VaultFrontmatterBlock {
  raw: string;
  fence: "---" | "...";
  startOffset: number;
  endOffset: number;
}

export interface VaultDocumentParts {
  raw: string;
  frontmatter: VaultFrontmatterBlock | null;
  body: string;
  bodyStartOffset: number;
}

export function splitFrontmatterDocument(raw: string): VaultDocumentParts {
  if (!raw.startsWith("---")) {
    return {
      raw,
      frontmatter: null,
      body: raw,
      bodyStartOffset: 0,
    };
  }

  const firstLineEnd = findLineEnd(raw, 0);
  if (firstLineEnd === -1 || raw.slice(0, firstLineEnd).trim() !== "---") {
    return {
      raw,
      frontmatter: null,
      body: raw,
      bodyStartOffset: 0,
    };
  }

  let cursor = firstLineEnd + getNewlineLength(raw, firstLineEnd);

  while (cursor < raw.length) {
    const lineEnd = findLineEnd(raw, cursor);
    const nextCursor = lineEnd === -1 ? raw.length : lineEnd;
    const line = raw.slice(cursor, nextCursor).trim();

    if (line === "---" || line === "...") {
      const endOffset = nextCursor;
      const bodyStartOffset =
        lineEnd === -1 ? raw.length : lineEnd + getNewlineLength(raw, lineEnd);

      return {
        raw,
        frontmatter: {
          raw: raw.slice(0, endOffset),
          fence: line,
          startOffset: 0,
          endOffset,
        },
        body: raw.slice(bodyStartOffset),
        bodyStartOffset,
      };
    }

    if (lineEnd === -1) {
      break;
    }

    cursor = lineEnd + getNewlineLength(raw, lineEnd);
  }

  return {
    raw,
    frontmatter: null,
    body: raw,
    bodyStartOffset: 0,
  };
}

export function hasFrontmatter(raw: string): boolean {
  return splitFrontmatterDocument(raw).frontmatter !== null;
}

function findLineEnd(input: string, start: number): number {
  for (let index = start; index < input.length; index += 1) {
    if (input[index] === "\n" || input[index] === "\r") {
      return index;
    }
  }

  return -1;
}

function getNewlineLength(input: string, lineEnd: number): number {
  if (input[lineEnd] === "\r" && input[lineEnd + 1] === "\n") {
    return 2;
  }

  return 1;
}
