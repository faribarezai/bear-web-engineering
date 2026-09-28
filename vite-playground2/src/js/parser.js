// Pure text parsing: turns raw wikitext into plain JS objects
// No fetch, no DOM - this makes it trivial to unit-test in isolation

/**
 * @typedef {Object} BearRow
 * @property {string} name
 * @property {string} binomial
 * @property {string} fileName
 */

/**
 * Extracts one row per bear species from the "Species table" wikitext,
 * in the same order as they appear on the page.
 * @param {string} wikitext
 * @returns {BearRow[]}
 */

/*
Only `name` and `binomial` are required to count as a real species row -
 * `image` and `range` are optional per the app requirements ("if there is
 * no image available, show a placeholder").
 */

export function parseBearRows(wikitext) {
  const bears = [];

  for (const row of wikitext.split('{{Species table/row').slice(1)) {
    const nameMatch = row.match(/\|name=\[\[(?:[^\]|]*\|)?([^\]]+)\]\]/);
    const binomialMatch = row.match(/\|binomial=([^\n]*)/);
    const imageMatch = row.match(/\|image=([^\n]*)/);
    const rangeMatch = row.match(/\|range=([^\n]*)/);

    if (!nameMatch || !binomialMatch) continue;

    bears.push({
      name: nameMatch[1].trim(),
      binomial: binomialMatch[1].trim(),
      fileName: imageMatch?.[1].trim().replace(/^File:/, '') || null,
      range: rangeMatch?.[1].trim() || 'Unknown',
    });
  }

  return bears;
}
