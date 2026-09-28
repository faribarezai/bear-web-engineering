// Show/hide toggle + form handling for the comments section.

export function initComments(): void {
  const toggleBtn = document.querySelector<HTMLButtonElement>('.show-hide');
  const wrapper = document.querySelector<HTMLElement>('.comment-wrapper');
  const form = document.querySelector<HTMLFormElement>('.comment-form');
  const nameField = document.querySelector<HTMLInputElement>('#name');
  const commentField = document.querySelector<HTMLInputElement>('#comment');
  const list = document.querySelector<HTMLElement>('.comment-container');

  // querySelector kann null zurückgeben. Erst danach verwenden wir die Elemente.
  if (
    toggleBtn === null ||
    wrapper === null ||
    form === null ||
    nameField === null ||
    commentField === null ||
    list === null
  ) {
    return;
  }

  wrapper.hidden = true;

  toggleBtn.addEventListener('click', () => {
    wrapper.hidden = !wrapper.hidden;
    toggleBtn.setAttribute('aria-expanded', String(!wrapper.hidden));
    toggleBtn.textContent = wrapper.hidden ? 'Show comments' : 'Hide comments';
  });

  const errorMessage = document.createElement('p');
  errorMessage.className = 'form-error';
  errorMessage.setAttribute('role', 'alert');
  errorMessage.hidden = true;
  form.prepend(errorMessage);

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = nameField.value.trim();
    const comment = commentField.value.trim();

    if (name === '' || comment === '') {
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
