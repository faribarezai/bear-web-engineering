// search.js
// Search-and-highlight feature, scoped to the <article> element only -
// per the requirement "only html contents with tag article should be highlighted".

export function initSearch() {
  const searchForm = document.querySelector('.search');
  const article = document.querySelector('article');
  const searchInput = document.querySelector('#search-box');

  if (!searchForm || !article) return;

  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    clearHighlights(article);

    const searchKey = searchInput.value.trim();
    if (!searchKey) return;

    const regex = new RegExp(`(${escapeRegExp(searchKey)})`, 'gi'); //gi=alle treffer + groß/kleinschreibung
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

function highlight(root, regex) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      return node.parentElement?.closest('script, style, form, mark')
          ? NodeFilter.FILTER_REJECT
          : NodeFilter.FILTER_ACCEPT;
    },
  });

  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);

  for (const node of textNodes) {
    const text = node.nodeValue;
    const fragment = document.createDocumentFragment();
    let lastIndex = 0;
    let found = false;

    regex.lastIndex = 0;

    for (const match of text.matchAll(regex)) {
      found = true;
      fragment.append(document.createTextNode(text.slice(lastIndex, match.index)));

      const mark = document.createElement('mark');
      mark.className = 'highlight';
      mark.textContent = match[0];
      fragment.append(mark);

      lastIndex = match.index + match[0].length;
    }

    if (found) {
      fragment.append(document.createTextNode(text.slice(lastIndex)));
      node.replaceWith(fragment);
    }
  }
}
