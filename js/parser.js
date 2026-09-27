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
export function parseBearRows(wikitext) {
  const tables = wikitext.split('{{Species table/end}}');
  const bears = [];

  for (const table of tables) {
    const rows = table.split('{{Species table/row');

    for (const row of rows) {
      const nameMatch = row.match(/\|name=\[\[(.*?)\]\]/);
      const binomialMatch = row.match(/\|binomial=(.*?)\n/);
      const imageMatch = row.match(/\|image=(.*?)\n/);

      if (nameMatch && binomialMatch && imageMatch) {
        bears.push({
          name: nameMatch[1],
          binomial: binomialMatch[1].trim(),
          fileName: imageMatch[1].trim().replace('File:', ''),
        });
      }
    }
  }

  return bears;
}
