// Kommunikation mit der Wikipedia-API

const WIKI_API_BASE = 'https://en.wikipedia.org/w/api.php';

// Prüft, ob ein unbekannter Wert ein Objekt mit Eigenschaften ist.
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Sendet eine Anfrage an Wikipedia.
 * JSON aus dem Netz wird zuerst als unknown behandelt.
 */
async function requestWikipedia(
  params: URLSearchParams
): Promise<Record<string, unknown>> {
  let response: Response;

  try {
    response = await fetch(`${WIKI_API_BASE}?${params.toString()}`);
  } catch (error) {
    throw new Error('Wikipedia konnte nicht erreicht werden.', {
      cause: error,
    });
  }

  if (!response.ok) {
    throw new Error(`Wikipedia antwortete mit HTTP ${response.status}.`);
  }

  let data: unknown;

  try {
    data = (await response.json()) as unknown;
  } catch (error) {
    throw new Error('Die Antwort von Wikipedia ist kein gültiges JSON.', {
      cause: error,
    });
  }

  if (!isRecord(data)) {
    throw new Error('Wikipedia lieferte keine gültige Antwort.');
  }

  if ('error' in data) {
    const apiError = data.error;

    const detail = isRecord(apiError)
      ? [apiError.info, apiError.code].find(
          (part): part is string => typeof part === 'string'
        )
      : undefined;

    throw new Error(`Wikipedia-API: ${detail ?? 'Unbekannter Fehler'}`);
  }

  return data;
}

/**
 * Lädt den Wikitext einer Wikipedia-Seite.
 */
export async function fetchWikitext(title: string): Promise<string> {
  const params = new URLSearchParams({
    action: 'parse',
    page: title,
    prop: 'wikitext',
    format: 'json',
    origin: '*',
  });

  const data = await requestWikipedia(params);
  const parse = data.parse;

  const wikitext =
    isRecord(parse) && isRecord(parse.wikitext)
      ? parse.wikitext['*']
      : undefined;

  if (typeof wikitext !== 'string') {
    throw new Error('Wikipedia lieferte keinen lesbaren Artikeltext.');
  }

  return wikitext;
}

/**
 * Gibt die Bild-URL zurück oder null, wenn kein Bild vorhanden ist.
 */
export async function fetchImageUrl(fileName: string): Promise<string | null> {
  const params = new URLSearchParams({
    action: 'query',
    titles: `File:${fileName}`,
    prop: 'imageinfo',
    iiprop: 'url',
    format: 'json',
    origin: '*',
  });

  const data = await requestWikipedia(params);
  const query = data.query;
  const pages = isRecord(query) ? query.pages : undefined;

  if (!isRecord(pages)) {
    throw new Error(
      `Wikipedia lieferte keine gültige Bildantwort für ${fileName}.`
    );
  }

  const page = Object.values(pages)[0];

  if (!isRecord(page)) {
    throw new Error(`Wikipedia lieferte keine Bildseite für ${fileName}.`);
  }

  // Die Datei hat keine Bildinformationen: Der Platzhalter kann erscheinen.
  if (page.imageinfo === undefined) {
    return null;
  }

  if (
    !Array.isArray(page.imageinfo) ||
    !isRecord(page.imageinfo[0]) ||
    typeof page.imageinfo[0].url !== 'string'
  ) {
    throw new Error(
      `Wikipedia lieferte eine ungültige Bild-URL für ${fileName}.`
    );
  }

  return page.imageinfo[0].url;
}
