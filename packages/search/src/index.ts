export interface SearchQuery {
  text: string;
  limit?: number;
}

export const searchPackage = {
  name: "search",
  description: "Search and indexing scaffold."
} as const;
