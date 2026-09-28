// bearService.js
// Orchestrates api.js + parser.js into fully-resolved bear objects.
// This is the only module that knows both "how to fetch" and "how to parse".

import { fetchWikitext, fetchImageUrl } from './api.js';
import { parseBearRows } from './parser.js';

const PAGE_TITLE = 'List_of_ursids';
 // const SECTION = 3;

/**
 * @typedef {Object} Bear
 * @property {string} name
 * @property {string} binomial
 * @property {string|null} image
 */

/**
 * Loads all bears from Wikipedia, in the same order as the source page.
 * @returns {Promise<Bear[]>}
 */
export async function loadBears() {
  const wikitext = await fetchWikitext(PAGE_TITLE);
  const rows = parseBearRows(wikitext);

  // Promise.all + map preserves the original array order
  return Promise.all(
    rows.map(async (row) => ({
      name: row.name,
      binomial: row.binomial,
        range: row.range,
        image: row.fileName ? await fetchImageUrl(row.fileName) : null,
        //image: await fetchImageUrl(row.fileName),
    }))
  );
}
