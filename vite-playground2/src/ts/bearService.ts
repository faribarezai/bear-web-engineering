import { fetchWikitext, fetchImageUrl } from './api';
import { parseBearRows } from './parser';
import type { Bear } from './models';

const PAGE_TITLE = 'List_of_ursids';

export async function loadBears(): Promise<Bear[]> {
  const wikitext = await fetchWikitext(PAGE_TITLE);
  const rows = parseBearRows(wikitext);

  // Load the image URLs asynchronously.
  const imageUrls = await Promise.all(
    rows.map(async (row) =>
      row.fileName !== null && row.fileName !== ''
        ? await fetchImageUrl(row.fileName)
        : null
    )
  );

  return rows.map((row, index) => ({
    name: row.name,
    binomial: row.binomial,
    range: row.range,
    image: imageUrls[index],
  }));
}
