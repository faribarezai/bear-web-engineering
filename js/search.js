// search.js
// Search-and-highlight feature, scoped to the <article> element only -
// per the requirement "only html contents with tag article should be highlighted".

export function initSearch() {
  const searchForm = document.querySelector('.search');
  const article = document.querySelector('article');

  if (!searchForm || !article) return;

  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    clearHighlights(article);

    const searchKey = searchForm.q.value.trim();
    if (!searchKey) return;

    const regex = new RegExp(`(${escapeRegExp(searchKey)})`, 'gi');
    highlight(article, regex);
  });
}

function clearHighlights(root) {
  root.querySelectorAll('.highlight').forEach((el) => {
    const parent = el.parentNode;
    parent.replaceChild(document.createTextNode(el.textContent), el);
    parent.normalize();
  });
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlight(node, regex) {
  if (node.nodeType === Node.TEXT_NODE) {
    if (node.nodeValue.match(regex)) {
      const span = document.createElement('span');
      span.innerHTML = node.nodeValue.replace(regex, '<mark class="highlight">$1</mark>');
      node.replaceWith(...span.childNodes);
    }
  } else if (
    node.nodeType === Node.ELEMENT_NODE &&
    !['SCRIPT', 'STYLE', 'FORM'].includes(node.tagName)
  ) {
    node.childNodes.forEach((child) => highlight(child, regex));
  }
}
