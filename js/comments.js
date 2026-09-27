// comments.js
// Show/hide toggle + form handling for the comments section.
// Self-contained: only touches its own corner of the DOM.

export function initComments() {
  const toggleBtn = document.querySelector('.show-hide');
  const wrapper = document.querySelector('.comment-wrapper');
  const form = document.querySelector('.comment-form');
  const nameField = document.querySelector('#name');
  const commentField = document.querySelector('#comment');
  const list = document.querySelector('.comment-container');

  if (!toggleBtn || !wrapper || !form) return;

  wrapper.hidden = true;

  toggleBtn.addEventListener('click', () => {
    wrapper.hidden = !wrapper.hidden;
    toggleBtn.textContent = wrapper.hidden ? 'Show comment' : 'Hide comment';
  });

  // NOTE: empty-field validation is intentionally not added yet -
  // that's a separate, later task.
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const listItem = document.createElement('li');
    const namePara = document.createElement('p');
    const commentPara = document.createElement('p');

    namePara.textContent = nameField.value;
    commentPara.textContent = commentField.value;

    listItem.append(namePara, commentPara);
    list.appendChild(listItem);

    nameField.value = '';
    commentField.value = '';
  });
}
