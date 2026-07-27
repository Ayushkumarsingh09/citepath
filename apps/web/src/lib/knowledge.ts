import { lexicalOverlap } from "@citepath/shared";

export function chunkText(content: string, size = 500): string[] {
  const cleaned = content.replace(/\s+/g, " ").trim();
  if (!cleaned) return [];
  const chunks: string[] = [];
  for (let i = 0; i < cleaned.length; i += size) {
    chunks.push(cleaned.slice(i, i + size));
  }
  return chunks;
}

export function isSafePublicUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    if (!["http:", "https:"].includes(u.protocol)) return false;
    const host = u.hostname.toLowerCase();
    if (
      host === "localhost" ||
      host.endsWith(".local") ||
      host.startsWith("127.") ||
      host.startsWith("10.") ||
      host.startsWith("192.168.") ||
      host === "0.0.0.0" ||
      host === "[::1]"
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function rankChunks(
  chunks: Array<{ id: string; content: string }>,
  query: string,
  topK = 5,
) {
  const keywords = query.split(/\W+/).filter((w) => w.length > 2);
  return chunks
    .map((c) => ({ ...c, score: lexicalOverlap(c.content, keywords) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .filter((c) => c.score > 0);
}
