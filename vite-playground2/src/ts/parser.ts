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

import type { BearRow } from './models';

export function parseBearRows(wikitext: string): BearRow[] {
  const bears = [];

  for (const row of wikitext.split('{{Species table/row').slice(1)) {
    const nameMatch = row.match(/\|name=\[\[(?:[^\]|]*\|)?([^\]]+)\]\]/);
    const binomialMatch = row.match(/\|binomial=([^\n]*)/);
    const imageMatch = row.match(/\|image=([^\n]*)/);
    const rangeMatch = row.match(/\|range=([^\n]*)/);

    if (nameMatch === null || binomialMatch === null) continue;

    const fileName = imageMatch?.[1].trim().replace(/^File:/, '');
    const range = rangeMatch?.[1].trim();

    bears.push({
      name: nameMatch[1].trim(),
      binomial: binomialMatch[1].trim(),
      fileName:
          fileName === undefined || fileName === '' ? null : fileName,
      range:
          range === undefined || range === '' ? 'Unknown' : range,
    });
  }

  return bears;
}
