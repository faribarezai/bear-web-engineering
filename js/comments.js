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
    toggleBtn.setAttribute('aria-expanded', String(!wrapper.hidden));
    toggleBtn.textContent = wrapper.hidden ? 'Show comments' : 'Hide comments';
  });

  // role="alert" makes screen readers announce the message the moment
  // it becomes visible - not just on focus, which a plain <p> wouldn't do.
  const errorMessage = document.createElement('p');
  errorMessage.className = 'form-error';
  errorMessage.setAttribute('role', 'alert');
  errorMessage.hidden = true;
  form.prepend(errorMessage);

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = nameField.value.trim();
    const comment = commentField.value.trim();

    if (!name || !comment) {
      errorMessage.textContent = 'Please enter both your name and a comment.';
      errorMessage.hidden = false;
      return;
    }

    errorMessage.hidden = true;

    const listItem = document.createElement('li');
    const namePara = document.createElement('p');
    const commentPara = document.createElement('p');

    namePara.textContent = name;
    commentPara.textContent = comment;

    listItem.append(namePara, commentPara);
    list.appendChild(listItem);

    nameField.value = '';
    commentField.value = '';
  });
}