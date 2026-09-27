// network communication with Wikipedia API

const WIKI_API_BASE = 'https://en.wikipedia.org/w/api.php';

/**
 * Fetches the raw wikitext of a given section of a Wikipedia page.
 * @param {string} title - page title, e.g. "List_of_ursids"
 * @param {number} section - section index to fetch
 * @returns {Promise<string>} the wikitext of that section
 */
export async function fetchWikitext(title, section) {
  const params = new URLSearchParams({
    action: 'parse',
    page: title,
    prop: 'wikitext',
    section: String(section),
    format: 'json',
    origin: '*',
  });

  const res = await fetch(`${WIKI_API_BASE}?${params}`);
  const data = await res.json();
  return data.parse.wikitext['*'];
}

/**
 * Resolves the direct image URL for a Wikipedia "File:" page.
 * @param {string} fileName - file name without the "File:" prefix
 * @returns {Promise<string|null>} the image URL, or null if none exists
 */
export async function fetchImageUrl(fileName) {
  const params = new URLSearchParams({
    action: 'query',
    titles: `File:${fileName}`,
    prop: 'imageinfo',
    iiprop: 'url',
    format: 'json',
    origin: '*',
  });

  const res = await fetch(`${WIKI_API_BASE}?${params}`);
  const data = await res.json();
  const page = Object.values(data.query.pages)[0];
  return page?.imageinfo?.[0]?.url ?? null;
}
