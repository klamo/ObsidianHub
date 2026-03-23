import type { FrontmatterRecord } from "../../vault/dist/index.d.ts";

export type NoteActionName =
  | "read_note"
  | "create_note"
  | "update_note_body"
  | "update_frontmatter"
  | "rename_note"
  | "archive_note";

export interface NoteActionActor {
  type: "agent" | "user" | "system";
  id: string;
}

export interface NoteActionEnvelope<TAction extends NoteActionName, TPayload> {
  action: TAction;
  requestId?: string;
  vaultId?: string;
  actor?: NoteActionActor;
  payload: TPayload;
}

export interface NoteActionMeta {
  executor: "server-vault-executor" | "client-cli-executor";
}

export interface ReadNotePayload {
  path: string;
  include?: {
    raw?: boolean;
    frontmatter?: boolean;
    body?: boolean;
  };
}

export interface CreateNotePayload {
  path: string;
  body: string;
  frontmatter?: {
    mode: "replace" | "merge";
    data: FrontmatterRecord;
  };
  writeStrategy?: "direct" | "atomic";
}

export interface UpdateNoteBodyPayload {
  path: string;
  body: string;
  expectedMtimeMs?: number;
  writeStrategy?: "direct" | "atomic";
  backup?: boolean;
}

export interface UpdateFrontmatterPayload {
  path: string;
  mutation: {
    mode: "replace" | "merge";
    data: FrontmatterRecord;
  };
  expectedMtimeMs?: number;
  writeStrategy?: "direct" | "atomic";
  backup?: boolean;
}

export interface RenameNotePayload {
  fromPath: string;
  toPath: string;
}

export interface ArchiveNotePayload {
  path: string;
}

export type ReadNoteAction = NoteActionEnvelope<"read_note", ReadNotePayload>;
export type CreateNoteAction = NoteActionEnvelope<"create_note", CreateNotePayload>;
export type UpdateNoteBodyAction = NoteActionEnvelope<"update_note_body", UpdateNoteBodyPayload>;
export type UpdateFrontmatterAction = NoteActionEnvelope<"update_frontmatter", UpdateFrontmatterPayload>;
export type RenameNoteAction = NoteActionEnvelope<"rename_note", RenameNotePayload>;
export type ArchiveNoteAction = NoteActionEnvelope<"archive_note", ArchiveNotePayload>;

export type NoteAction =
  | ReadNoteAction
  | CreateNoteAction
  | UpdateNoteBodyAction
  | UpdateFrontmatterAction
  | RenameNoteAction
  | ArchiveNoteAction;

export interface ReadNoteResult {
  path: string;
  content?: string;
  document?: {
    frontmatter: FrontmatterRecord;
    body: string;
  };
  mtimeMs: number;
  size: number;
}

export interface WriteNoteResult {
  path: string;
  created: boolean;
  mtimeMs: number;
  bytesWritten: number;
  backup?: {
    path: string;
  };
}

export interface MoveNoteResult {
  fromPath: string;
  toPath: string;
  mtimeMs: number;
}

export type NoteActionResultMap = {
  read_note: ReadNoteResult;
  create_note: WriteNoteResult;
  update_note_body: WriteNoteResult;
  update_frontmatter: WriteNoteResult;
  rename_note: MoveNoteResult;
  archive_note: MoveNoteResult;
};

export type NoteActionResult<TAction extends NoteActionName> = NoteActionResultMap[TAction];
