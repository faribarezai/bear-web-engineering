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

  //asynchronous control flow
    const imageUrls = await Promise.all(
        rows.map((row) =>
            row.fileName ? fetchImageUrl(row.fileName) : Promise.resolve(null)
        )
    );

    return rows.map((row, index) => ({
        name: row.name,
        binomial: row.binomial,
        range: row.range,
        image: imageUrls[index],
    }));
}
