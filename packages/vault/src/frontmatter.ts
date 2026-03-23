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

export type FrontmatterValue =
  | string
  | number
  | boolean
  | null
  | FrontmatterValue[]
  | { [key: string]: FrontmatterValue };

export type FrontmatterRecord = Record<string, FrontmatterValue>;

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

export function parseFrontmatterRecord(raw: string): FrontmatterRecord {
  const document = splitFrontmatterDocument(raw);
  if (!document.frontmatter) {
    return {};
  }

  const lines = document.frontmatter.raw
    .split(/\r?\n/)
    .slice(1, -1);

  return parseObjectBlock(lines, 0).value;
}

export function serializeFrontmatterRecord(data: FrontmatterRecord): string {
  const body = serializeObjectBlock(data, 0);
  return body.length > 0 ? `---\n${body}\n---\n` : `---\n---\n`;
}

export function applyFrontmatterMutation(
  raw: string,
  mutation: {
    mode: "replace" | "merge";
    data: FrontmatterRecord;
  },
): string {
  const document = splitFrontmatterDocument(raw);
  const nextData =
    mutation.mode === "replace"
      ? mutation.data
      : { ...parseFrontmatterRecord(raw), ...mutation.data };

  return `${serializeFrontmatterRecord(nextData)}${document.body}`;
}

function parseObjectBlock(
  lines: string[],
  startIndex: number,
  indent = 0,
): { value: FrontmatterRecord; nextIndex: number } {
  const value: FrontmatterRecord = {};
  let index = startIndex;

  while (index < lines.length) {
    const line = lines[index];

    if (isBlankLine(line)) {
      index += 1;
      continue;
    }

    const lineIndent = countIndent(line);
    if (lineIndent < indent) {
      break;
    }

    if (lineIndent > indent) {
      throw new Error(`Invalid frontmatter indentation at line ${index + 1}.`);
    }

    const trimmed = line.trim();
    if (trimmed.startsWith("- ")) {
      throw new Error(`Unexpected list item at line ${index + 1}.`);
    }

    const separatorIndex = trimmed.indexOf(":");
    if (separatorIndex === -1) {
      throw new Error(`Invalid frontmatter entry at line ${index + 1}.`);
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const remainder = trimmed.slice(separatorIndex + 1).trim();

    if (!key) {
      throw new Error(`Frontmatter key is required at line ${index + 1}.`);
    }

    if (remainder.length > 0) {
      value[key] = parseScalar(remainder);
      index += 1;
      continue;
    }

    const nextIndex = skipBlankLines(lines, index + 1);
    if (nextIndex >= lines.length || countIndent(lines[nextIndex]) <= indent) {
      value[key] = null;
      index += 1;
      continue;
    }

    if (lines[nextIndex].trim().startsWith("- ")) {
      const parsedArray = parseArrayBlock(lines, nextIndex, indent + 2);
      value[key] = parsedArray.value;
      index = parsedArray.nextIndex;
      continue;
    }

    const parsedObject = parseObjectBlock(lines, nextIndex, indent + 2);
    value[key] = parsedObject.value;
    index = parsedObject.nextIndex;
  }

  return { value, nextIndex: index };
}

function parseArrayBlock(
  lines: string[],
  startIndex: number,
  indent: number,
): { value: FrontmatterValue[]; nextIndex: number } {
  const value: FrontmatterValue[] = [];
  let index = startIndex;

  while (index < lines.length) {
    const line = lines[index];

    if (isBlankLine(line)) {
      index += 1;
      continue;
    }

    const lineIndent = countIndent(line);
    if (lineIndent < indent) {
      break;
    }

    if (lineIndent !== indent) {
      throw new Error(`Invalid frontmatter list indentation at line ${index + 1}.`);
    }

    const trimmed = line.trim();
    if (!trimmed.startsWith("- ")) {
      break;
    }

    value.push(parseScalar(trimmed.slice(2).trim()));
    index += 1;
  }

  return { value, nextIndex: index };
}

function serializeObjectBlock(data: FrontmatterRecord, indent: number): string {
  return Object.entries(data)
    .map(([key, value]) => serializeEntry(key, value, indent))
    .join("\n");
}

function serializeEntry(key: string, value: FrontmatterValue, indent: number): string {
  const prefix = " ".repeat(indent);

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return `${prefix}${key}: []`;
    }

    return `${prefix}${key}:\n${value
      .map((item) => `${" ".repeat(indent + 2)}- ${serializeScalar(item)}`)
      .join("\n")}`;
  }

  if (isPlainObject(value)) {
    const nested = serializeObjectBlock(value, indent + 2);
    return nested.length > 0 ? `${prefix}${key}:\n${nested}` : `${prefix}${key}: {}`;
  }

  return `${prefix}${key}: ${serializeScalar(value)}`;
}

function serializeScalar(value: FrontmatterValue): string {
  if (Array.isArray(value) || isPlainObject(value)) {
    throw new Error("Nested objects inside arrays are not supported in frontmatter serialization.");
  }

  if (value === null) {
    return "null";
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (value.length === 0) {
    return '""';
  }

  if (/^[A-Za-z0-9_.\/-]+$/.test(value)) {
    return value;
  }

  return JSON.stringify(value);
}

function parseScalar(raw: string): FrontmatterValue {
  if (raw === "null") {
    return null;
  }

  if (raw === "true") {
    return true;
  }

  if (raw === "false") {
    return false;
  }

  if (/^-?\d+(?:\.\d+)?$/.test(raw)) {
    return Number(raw);
  }

  if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) {
    return raw.slice(1, -1);
  }

  return raw;
}

function isPlainObject(value: FrontmatterValue): value is { [key: string]: FrontmatterValue } {
  return typeof value === "object" && value !== null && !Array.isArray(value);
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

function countIndent(line: string): number {
  let indent = 0;
  while (indent < line.length && line[indent] === " ") {
    indent += 1;
  }

  return indent;
}

function isBlankLine(line: string): boolean {
  return line.trim().length === 0;
}

function skipBlankLines(lines: string[], startIndex: number): number {
  let index = startIndex;
  while (index < lines.length && isBlankLine(lines[index])) {
    index += 1;
  }

  return index;
}
