// Composition root: imports feature modules and wires them together once the DOM is ready

import { loadBears } from './bearService.js';
import { renderBearList } from './bearView.js';
import { initComments } from './comments.js';
import { initSearch } from './search.js';

document.addEventListener('DOMContentLoaded', async () => {
  initComments();
  initSearch();

  const bears = await loadBears();
  renderBearList(bears);
});
