// bearView.ts – stellt die Bären im DOM dar

import type { Bear } from './models';

const PLACEHOLDER_IMAGE = '/media/wild-bear.jpg';

export function renderBearList(
  bears: Bear[],
  containerSelector = '.more_bears'
): void {
  const container = document.querySelector<HTMLElement>(containerSelector);

  if (container === null) {
    throw new Error(`Bear container not found: ${containerSelector}`);
  }

  // Eigener Bereich für die Karten: Die Überschrift bleibt erhalten.
  let list = container.querySelector<HTMLElement>('.bear-list');

  if (list === null) {
    list = document.createElement('div');
    list.className = 'bear-list';
    container.append(list);
  }

  const fragment = document.createDocumentFragment();
  const placeholderUrl = new URL(PLACEHOLDER_IMAGE, document.baseURI).href;

  for (const bear of bears) {
    const card = document.createElement('div');
    card.className = 'bear';

    const img = document.createElement('img');
    img.alt = `Image of ${bear.name}`;
    img.style.width = '200px';
    img.style.height = 'auto';

    img.addEventListener('error', () => {
      // Keine Endlosschleife, falls auch der Platzhalter fehlt.
      if (img.src !== placeholderUrl) {
        img.src = placeholderUrl;
      }
    });

    img.src =
      bear.image === null || bear.image === '' ? placeholderUrl : bear.image;

    const nameLine = document.createElement('p');
    const nameBold = document.createElement('b');
    nameBold.textContent = bear.name;

    nameLine.append(nameBold, document.createTextNode(` (${bear.binomial})`));

    const rangeLine = document.createElement('p');
    rangeLine.textContent = `Range: ${bear.range}`;

    card.append(img, nameLine, rangeLine);
    fragment.append(card);
  }

  list.replaceChildren(fragment);
}
