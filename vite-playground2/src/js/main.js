// main.js – startet die Funktionen, sobald das HTML geladen ist

import { loadBears } from './bearService.js';
import { renderBearList } from './bearView.js';
import { initComments } from './comments.js';
import { initSearch } from './search.js';

document.addEventListener('DOMContentLoaded', async () => {
  initComments();
  initSearch();

  const container = document.querySelector('.more_bears');

  try {
    const bears = await loadBears();
    renderBearList(bears);
  } catch (error) {
    console.error('Bear loading failed:', error);

    if (container) {
      const message = document.createElement('p');
      message.setAttribute('role', 'alert');
      message.textContent =
          'The bears could not be loaded. Please try again later.';
      container.append(message);
    }
  }
});