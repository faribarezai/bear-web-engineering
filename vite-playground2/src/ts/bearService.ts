// bearService.ts
// Orchestrates api.ts + parser.ts into fully-resolved bear objects.

import { fetchWikitext, fetchImageUrl } from './api';
import { parseBearRows } from './parser';

const PAGE_TITLE = 'List_of_ursids';

import type {Bear} from './models';

export async function loadBears():Promise<Bear[]> {
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
