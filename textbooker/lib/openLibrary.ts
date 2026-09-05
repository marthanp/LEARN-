/**
 * openLibrary.ts
 * Fetches book metadata from the Open Library API using an ISBN.
 * API docs: https://openlibrary.org/dev/docs/api
 */

export interface BookMetadata {
  isbn: string;
  title: string;
  authors: string;      // comma-separated string, e.g. "J.K. Rowling, Mary GrandPré"
  coverUrl: string | null;
}

const OL_BASE = "https://openlibrary.org/api/books";

/**
 * Fetches book metadata from Open Library by ISBN.
 * Returns `null` if the ISBN is not found or the request fails.
 */
export async function fetchBookByISBN(isbn: string): Promise<BookMetadata | null> {
  const cleanISBN = isbn.replace(/[^0-9X]/gi, "");

  if (!cleanISBN) return null;

  const url = new URL(OL_BASE);
  url.searchParams.set("bibkeys", `ISBN:${cleanISBN}`);
  url.searchParams.set("format", "json");
  url.searchParams.set("jscmd", "data");

  try {
    const res = await fetch(url.toString(), {
      next: { revalidate: 86400 }, // cache for 24 hours (Next.js extended fetch)
    });

    if (!res.ok) {
      console.error(`[openLibrary] HTTP ${res.status} for ISBN ${cleanISBN}`);
      return null;
    }

    const data: Record<string, OLBookData> = await res.json();
    const key = `ISBN:${cleanISBN}`;
    const book = data[key];

    if (!book) return null;

    // ── Authors ─────────────────────────────────────────────────────────────
    const authors =
      book.authors && book.authors.length > 0
        ? book.authors.map((a) => a.name).join(", ")
        : "Unknown Author";

    // ── Cover URL (large → medium → small → null) ────────────────────────
    const coverUrl =
      book.cover?.large ??
      book.cover?.medium ??
      book.cover?.small ??
      null;

    return {
      isbn: cleanISBN,
      title: book.title ?? "Unknown Title",
      authors,
      coverUrl,
    };
  } catch (err) {
    console.error("[openLibrary] Fetch error:", err);
    return null;
  }
}

// ─── Raw Open Library response shape (partial) ───────────────────────────────
interface OLBookData {
  title?: string;
  authors?: Array<{ name: string; url?: string }>;
  cover?: {
    small?: string;
    medium?: string;
    large?: string;
  };
  identifiers?: {
    isbn_10?: string[];
    isbn_13?: string[];
  };
}
