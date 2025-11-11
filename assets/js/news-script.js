const NEWS_PATH = '../assets/data/news.md';

const DATE_FORMAT = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric'
});

function slugify(str) {
  return String(str || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime()) ? dateStr : DATE_FORMAT.format(d);
}

function markdownToHtml(body) {
  if (!body) return '';
  const escaped = body
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  const withLinks = escaped.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  const withBold = withLinks
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>');
  const withItalics = withBold
    .replace(/(^|[\s>_])\*(?!\s)([^*]+?)\*(?=[\s<]|$)/g, '$1<em>$2</em>')
    .replace(/(^|[\s>*])_(?!\s)([^_]+?)_(?=[\s<]|$)/g, '$1<em>$2</em>');
  return withItalics
    .split(/\n{2,}/)
    .map(block => `<p>${block.replace(/\n/g, '<br>')}</p>`)
    .join('');
}

function parseNewsMarkdown(raw) {
  return raw
    .split(/\n-{3,}\n/)
    .map(block => block.trim())
    .filter(Boolean)
    .map(block => {
      const lines = block.split('\n');
      const titleLine = lines.shift() || '';
      const titleMatch = titleLine.match(/^##\s*(.+)$/);
      if (!titleMatch) return null;
      const title = titleMatch[1].trim();

      const meta = { links: [], tags: [] };
      let i = 0;
      while (i < lines.length && lines[i].trim()) {
        const line = lines[i];
        if (/^\s*-/.test(line) && meta._lastKey === 'links') {
          const linkParts = line.replace(/^\s*-\s*/, '').split('|').map(s => s.trim());
          if (linkParts[0] && linkParts[1]) {
            meta.links.push({ text: linkParts[0], url: linkParts[1] });
          }
        } else {
          const [rawKey, ...rest] = line.split(':');
          if (!rawKey) { i++; continue; }
          const key = rawKey.trim().toLowerCase();
          const value = rest.join(':').trim();
          meta._lastKey = key;
          if (key === 'links') {
            if (value) {
              const [text, url] = value.split('|').map(s => s.trim());
              if (text && url) meta.links.push({ text, url });
            }
          } else if (key === 'tags') {
            meta.tags = value.split(/[,/]/).map(s => s.trim()).filter(Boolean);
          } else {
            meta[key] = value;
          }
        }
        i++;
      }
      delete meta._lastKey;
      const body = lines.slice(i).join('\n').trim();
      const slug = meta.slug ? meta.slug : slugify(`${meta.date || ''}-${title}`);
      return {
        title,
        date: meta.date || '',
        displayDate: formatDate(meta.date),
        image: meta.image || '',
        links: meta.links,
        tags: meta.tags,
        bodyHtml: markdownToHtml(body),
        slug
      };
    })
    .filter(Boolean)
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
}

function renderNewsItem(item, { single } = {}) {
  const article = document.createElement('article');
  article.className = `news-item${single ? ' news-item--single' : ''}`;
  article.id = item.slug;

  const titleLink = single ? item.title : `<a href="?post=${item.slug}" class="news-permalink">${item.title}</a>`;
  let html = `
    <p class="news-meta fragment-mono-regular">${item.displayDate ?? ''}${item.tags.length ? ` · ${item.tags.join(', ')}` : ''}</p>
    <h3 class="news-title">${titleLink}</h3>
  `;

  if (item.image) {
    html += `<img src="${item.image}" alt="${item.title}" class="news-image" loading="lazy" decoding="async">`;
  }

  html += item.bodyHtml;

  if (item.links.length) {
    html += '<ul class="news-links fragment-mono-regular">';
    item.links.forEach(link => {
      html += `<li><a href="${link.url}" target="_blank" rel="noopener">${link.text}</a></li>`;
    });
    html += '</ul>';
  }

  if (!single) {
    html += `<p class="news-inline-link fragment-mono-regular"><a href="?post=${item.slug}">permalink →</a></p>`;
  }

  article.innerHTML = html;
  return article;
}

async function initNews() {
  const newsFeed = document.getElementById('news-feed');
  if (!newsFeed) return;
  try {
    const response = await fetch(NEWS_PATH);
    if (!response.ok) throw new Error(`Failed to fetch news (${response.status})`);
    const raw = await response.text();
    const items = parseNewsMarkdown(raw);
    if (!items.length) {
      newsFeed.innerHTML = '<p class="fragment-mono-regular">No news just yet.</p>';
      return;
    }
    newsFeed.innerHTML = '';

    const params = new URLSearchParams(window.location.search);
    const requestedSlug = params.get('post');
    let renderItems = items;
    let single = false;
    let activeItem = null;

    if (requestedSlug) {
      activeItem = items.find(item => item.slug === requestedSlug);
      if (activeItem) {
        renderItems = [activeItem];
        single = true;
        document.title = `${activeItem.title} - szch.me news`;
      } else {
        const notice = document.createElement('p');
        notice.className = 'fragment-mono-regular';
        notice.textContent = 'News item not found. Showing the latest updates instead.';
        newsFeed.appendChild(notice);
      }
    }

    renderItems.forEach(item => newsFeed.appendChild(renderNewsItem(item, { single })));

    if (single && activeItem) {
      const back = document.createElement('p');
      back.className = 'news-back-link fragment-mono-regular';
      back.innerHTML = `<a href="./">← back to all news</a>`;
      newsFeed.insertBefore(back, newsFeed.firstChild);
      if (window.history?.replaceState) {
        const url = new URL(window.location);
        url.searchParams.set('post', activeItem.slug);
        window.history.replaceState(null, '', url);
      }
    }
  } catch (err) {
    console.error('Error fetching news:', err);
    newsFeed.innerHTML = '<p class="fragment-mono-regular">Unable to load news right now. Try again later.</p>';
  }
}

initNews();
