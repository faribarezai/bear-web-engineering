// Search and highlight text inside <article> only.

export function initSearch(): void {
  const searchForm = document.querySelector<HTMLFormElement>('.search');
  const article = document.querySelector<HTMLElement>('article');
  const searchInput = document.querySelector<HTMLInputElement>('#search-box');

  if (searchForm === null || article === null || searchInput === null) return;

  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    clearHighlights(article);

    const searchKey = searchInput.value.trim();
    if (searchKey === null) return;

    const regex = new RegExp(`(${escapeRegExp(searchKey)})`, 'gi');
    highlight(article, regex);
  });
}

function clearHighlights(root: HTMLElement): void {
  root.querySelectorAll('.highlight').forEach((el) => {
    const parent = el.parentNode;
    if (parent === null) return;

    if (typeof el.textContent === 'string') {
      parent.replaceChild(document.createTextNode(el.textContent), el);
    }
    parent.normalize();
  });
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlight(root: HTMLElement, regex: RegExp): void {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      return node.parentElement?.closest('script, style, form, mark') != null
        ? NodeFilter.FILTER_REJECT
        : NodeFilter.FILTER_ACCEPT;
    },
  });

  const textNodes: Text[] = [];

  while (walker.nextNode() !== null) {
    // SHOW_TEXT sorgt dafür, dass der aktuelle Node ein Textknoten ist.
    textNodes.push(walker.currentNode as Text);
  }

  for (const node of textNodes) {
    const text = node.nodeValue ?? '';
    const fragment = document.createDocumentFragment();
    let lastIndex = 0;
    let found = false;

    regex.lastIndex = 0;

    for (const match of text.matchAll(regex)) {
      const matchIndex = match.index;
      if (matchIndex === undefined) continue;

      found = true;
      fragment.append(
        document.createTextNode(text.slice(lastIndex, matchIndex))
      );

      const mark = document.createElement('mark');
      mark.className = 'highlight';
      mark.textContent = match[0];
      fragment.append(mark);

      lastIndex = matchIndex + match[0].length;
    }

    if (found) {
      fragment.append(document.createTextNode(text.slice(lastIndex)));
      node.replaceWith(fragment);
    }
  }
}
