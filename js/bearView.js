// bearView.js – stellt die Bären im DOM dar

const PLACEHOLDER_IMAGE = 'media/wild-bear.jpg';

/**
 * Zeigt die Bären in der Reihenfolge des übergebenen Arrays an.
 * @param {import('./bearService.js').Bear[]} bears
 * @param {string} containerSelector
 */
export function renderBearList(bears, containerSelector = '.more_bears') {
  const container = document.querySelector(containerSelector);

  if (!container) {
    throw new Error(`Bear container not found: ${containerSelector}`);
  }

  // Eigener Bereich für die Karten: Die vorhandene Überschrift bleibt erhalten.
  let list = container.querySelector('.bear-list');

  if (!list) {
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
      // Verhindert eine Endlosschleife, falls der Platzhalter selbst fehlt.
      if (img.src !== placeholderUrl) {
        img.src = placeholderUrl;
      }
    });

    img.src = bear.image || placeholderUrl;

    const nameLine = document.createElement('p');
    const nameBold = document.createElement('b');
    nameBold.textContent = bear.name;

    nameLine.append(
        nameBold,
        document.createTextNode(` (${bear.binomial})`)
    );

    const rangeLine = document.createElement('p');
    rangeLine.textContent = `Range: ${bear.range}`;

    card.append(img, nameLine, rangeLine);
    fragment.append(card);
  }

  // Ersetzt alle bisherigen Karten in einem Schritt.
  list.replaceChildren(fragment);
}