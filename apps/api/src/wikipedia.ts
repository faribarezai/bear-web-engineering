import { parseBearRows } from './parser.js';
import { BearsResponseSchema, slugifyBinomial, type Bear } from './schema.js';
import { UpstreamError } from './errors.js';

const WIKI_API_BASE =
  process.env.WIKI_API_BASE ?? 'https://en.wikipedia.org/w/api.php';
const USER_AGENT =
  'WebEngWildlifeApp/1.0 (University Web Engineering Project; contact@example.org)';
const UPSTREAM_TIMEOUT_MS = Number(process.env.UPSTREAM_TIMEOUT_MS ?? 8000);
const PAGE_TITLE = 'List_of_ursids';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

async function requestWikipedia(
  params: URLSearchParams
): Promise<Record<string, unknown>> {
  let response: Response;

  try {
    response = await fetch(`${WIKI_API_BASE}?${params.toString()}`, {
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'TimeoutError') {
      throw new UpstreamError(
        `Wikipedia upstream timed out after ${UPSTREAM_TIMEOUT_MS}ms.`,
        504
      );
    }
    throw new UpstreamError('Failed to reach Wikipedia upstream.', 502);
  }

  if (!response.ok) {
    throw new UpstreamError(
      `Wikipedia upstream responded with HTTP ${response.status}.`,
      502
    );
  }

  let data: unknown;
  try {
    data = (await response.json()) as unknown;
  } catch {
    throw new UpstreamError('Wikipedia upstream returned invalid JSON.', 502);
  }

  if (!isRecord(data)) {
    throw new UpstreamError(
      'Wikipedia upstream returned an unexpected payload.',
      502
    );
  }

  if ('error' in data) {
    const apiError = data.error;
    const detail = isRecord(apiError)
      ? [apiError.info, apiError.code].find(
          (part): part is string => typeof part === 'string'
        )
      : undefined;
    throw new UpstreamError(
      `Wikipedia API error: ${detail ?? 'Unknown error'}`,
      502
    );
  }

  return data;
}

async function fetchWikitext(title: string): Promise<string> {
  const params = new URLSearchParams({
    action: 'parse',
    page: title,
    prop: 'wikitext',
    format: 'json',
  });

  const data = await requestWikipedia(params);
  const parse = data.parse;
  const wikitext =
    isRecord(parse) && isRecord(parse.wikitext)
      ? parse.wikitext['*']
      : undefined;

  if (typeof wikitext !== 'string') {
    throw new UpstreamError(
      'Wikipedia response did not contain readable wikitext.',
      502
    );
  }

  return wikitext;
}

async function fetchImageUrl(fileName: string): Promise<string | null> {
  const params = new URLSearchParams({
    action: 'query',
    titles: `File:${fileName}`,
    prop: 'imageinfo',
    iiprop: 'url',
    format: 'json',
  });

  const data = await requestWikipedia(params);
  const query = data.query;
  const pages = isRecord(query) ? query.pages : undefined;

  if (!isRecord(pages)) {
    throw new UpstreamError(
      `Invalid image response from Wikipedia for ${fileName}.`,
      502
    );
  }

  const page = Object.values(pages)[0];
  if (!isRecord(page)) {
    throw new UpstreamError(
      `Missing image page from Wikipedia for ${fileName}.`,
      502
    );
  }

  if (page.imageinfo === undefined) {
    return null;
  }

  if (
    !Array.isArray(page.imageinfo) ||
    !isRecord(page.imageinfo[0]) ||
    typeof page.imageinfo[0].url !== 'string'
  ) {
    throw new UpstreamError(
      `Invalid image URL in Wikipedia response for ${fileName}.`,
      502
    );
  }

  return page.imageinfo[0].url;
}

export async function getNormalizedBears(): Promise<Bear[]> {
  const wikitext = await fetchWikitext(PAGE_TITLE);
  const rows = parseBearRows(wikitext);

  if (rows.length === 0) {
    throw new UpstreamError(
      'No bear entries could be parsed from Wikipedia.',
      502
    );
  }

  const imageUrls = await Promise.all(
    rows.map(async (row) =>
      row.fileName !== null && row.fileName !== ''
        ? await fetchImageUrl(row.fileName)
        : null
    )
  );

  const normalized = rows.map((row, index) => ({
    id: slugifyBinomial(row.binomial),
    name: row.name,
    binomial: row.binomial,
    range: row.range,
    image: imageUrls[index] ?? null,
  }));

  const parsed = BearsResponseSchema.safeParse(normalized);
  if (!parsed.success) {
    throw new UpstreamError(
      'Normalized bear data failed schema validation.',
      502
    );
  }

  return parsed.data;
}
