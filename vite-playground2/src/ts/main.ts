import { loadBears } from './bearService';
import { renderBearList } from './bearView';
import { initComments } from './comments';
import { initSearch } from './search';

document.addEventListener('DOMContentLoaded', () => {
  initComments();
  initSearch();

  void loadBearsAndRender();
});

async function loadBearsAndRender(): Promise<void> {
  const container = document.querySelector('.more_bears');

  try {
    const bears = await loadBears();
    renderBearList(bears);
  } catch (error) {
    console.error('Bear loading failed:', error);

    if (container !== null) {
      const message = document.createElement('p');
      message.setAttribute('role', 'alert');
      message.textContent =
        'The bears could not be loaded. Please try again later.';
      container.append(message);
    }
  }
}
