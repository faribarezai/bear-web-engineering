// bearView.js, Bear data view

const PLACEHOLDER_IMAGE = 'media/bear-placeholder.png';

/**
 * @param {import('./bearService.js').Bear[]} bears
 * @param {string} containerSelector
 */
export function renderBearList(bears, containerSelector = '.more_bears') {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  container.innerHTML = ''; // clear any previous/placeholder content

  for (const bear of bears) {
    const card = document.createElement('div');
    card.className = 'bear';

    const img = document.createElement('img');
    img.src = bear.image ?? PLACEHOLDER_IMAGE;
    img.alt = `Image of ${bear.name}`;
    img.style.width = '200px';
    img.style.height = 'auto';

    const nameLine = document.createElement('p');
    const nameBold=document.createElement('b');
    nameBold.textContent = bear.name;

    nameLine.append(nameBold, document.createTextNode(`${bear.binomial})`));

    const rangeLine = document.createElement('p');
    rangeLine.textContent = `Range: ${bear.range}`;

    card.append(img, nameLine, rangeLine);
    container.appendChild(card);
  }
}
