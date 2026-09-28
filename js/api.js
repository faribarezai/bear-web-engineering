// api.js – Kommunikation mit der Wikipedia-API

const WIKI_API_BASE = 'https://en.wikipedia.org/w/api.php';

/**
 * Sendet eine Anfrage an die Wikipedia-API.
 * Fehlgeschlagene Anfragen und ungültige Antworten werden als Fehler weitergegeben.
 * @param {URLSearchParams} params
 * @returns {Promise<object>}
 */
async function requestWikipedia(params) {
  let response;

  try {
    response = await fetch(`${WIKI_API_BASE}?${params}`);
  } catch (error) {
    throw new Error('Wikipedia konnte nicht erreicht werden.', {
      cause: error,
    });
  }

  if (!response.ok) {
    throw new Error(`Wikipedia antwortete mit HTTP ${response.status}.`);
  }

  let data;

  try {
    data = await response.json();
  } catch (error) {
    throw new Error('Die Antwort von Wikipedia ist kein gültiges JSON.', {
      cause: error,
    });
  }

  if (data.error) {
    throw new Error(
        `Wikipedia-API: ${data.error.info || data.error.code || 'Unbekannter Fehler'}`
    );
  }

  return data;
}

/**
 * Lädt den Wikitext einer Wikipedia-Seite.
 * @param {string} title - Seitentitel, z. B. "List_of_ursids"
 * @returns {Promise<string>}
 */
export async function fetchWikitext(title) {
  const params = new URLSearchParams({
    action: 'parse',
    page: title,
    prop: 'wikitext',
    format: 'json',
    origin: '*',
  });

  const data = await requestWikipedia(params);
  const wikitext = data.parse?.wikitext?.['*'];

  if (typeof wikitext !== 'string') {
    throw new Error('Wikipedia lieferte keinen lesbaren Artikeltext.');
  }

  return wikitext;
}

/**
 * Ermittelt die Bild-URL zu einer Wikipedia-Datei.
 * Eine Datei ohne verfügbares Bild ergibt null.
 * Ein fehlgeschlagener API-Aufruf löst dagegen einen Fehler aus.
 * @param {string} fileName - Dateiname ohne "File:"
 * @returns {Promise<string|null>}
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

  const data = await requestWikipedia(params);

  if (!data.query?.pages) {
    throw new Error(`Wikipedia lieferte keine gültige Bildantwort für ${fileName}.`);
  }

  const page = Object.values(data.query.pages)[0];

  if (!page) {
    throw new Error(`Wikipedia lieferte keine Bildseite für ${fileName}.`);
  }

  return page.imageinfo?.[0]?.url ?? null;
}