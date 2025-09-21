// visuals-script.js — single-page grid with hash deep links + inline expand

// --- slug helpers -----------------------------------------------------------
const DIACRITICS = { č:'c', ć:'c', đ:'d', š:'s', ž:'z',
  à:'a', á:'a', â:'a', ä:'a', ã:'a', å:'a', ā:'a',
  è:'e', é:'e', ê:'e', ë:'e', ē:'e',
  ì:'i', í:'i', î:'i', ï:'i', ī:'i',
  ò:'o', ó:'o', ô:'o', ö:'o', õ:'o', ō:'o',
  ù:'u', ú:'u', û:'u', ü:'u', ū:'u', ñ:'n', ý:'y'
};
function translit(str) {
  return String(str).replace(/[\u00C0-\u024F]/g, ch => DIACRITICS[ch.toLowerCase()] ?? ch)
                    .replace(/ß/g, 'ss');
}
function slugify(str) {
  return translit(str)
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}
function ensureUniqueSlug(base, taken) {
  let s = base || 'project';
  let i = 2;
  while (taken.has(s)) s = `${base}-${i++}`;
  taken.add(s);
  return s;
}
function computeSlug(item, taken) {
  const datePart = (item.date && /^\d{4}(-\d{2}-\d{2})?$/.test(item.date))
    ? item.date
    : (item.date?.match(/^\d{4}/)?.[0] || '');
  const titlePart = slugify(item.title || 'untitled');
  const base = [datePart, titlePart].filter(Boolean).join('-') || titlePart || 'project';
  return ensureUniqueSlug(base, taken);
}

// --- utils ------------------------------------------------------------------
function v_getYearFromDate(dateStr) {
  const s = (dateStr ?? "").toString().trim();
  const m = /^(\d{4})/.exec(s);
  return m ? Number(m[1]) : null;
}

// Parse things like "2017–2024", "2017-2024", "2017 — 2024", "2017–present"
function v_parseYearRange(rangeStr) {
  const s = (rangeStr ?? "").toString().trim();
  if (!s) return null;
  // allow hyphen, en-dash, em-dash with optional spaces
  const m = /^(\d{4})\s*[—–-]\s*(\d{4}|present|now|ongoing)$/i.exec(s);
  if (!m) return null;
  const start = Number(m[1]);
  const endRaw = m[2].toLowerCase();
  const isOpen = /^(present|now|ongoing)$/i.test(m[2]);
  const end = isOpen ? new Date().getFullYear() : Number(m[2]);
  return (Number.isFinite(start) && Number.isFinite(end)) ? { start, end, isOpen } : null;
}

// Preferred display: normalized date_range if set, else try range in date, else formatted date
function v_niceDate(item, locale = "en-GB") {
  // 1) explicit date_range
  let r = v_parseYearRange(item.date_range);
  if (r) return r.start === r.end ? String(r.start) : `${r.start}–${r.isOpen ? 'present' : r.end}`;

  // 2) range accidentally stored in date
  r = v_parseYearRange(item.date);
  if (r) return r.start === r.end ? String(r.start) : `${r.start}–${r.isOpen ? 'present' : r.end}`;

  // 3) fallback to single date
  const s = (item.date ?? "").toString().trim();
  if (!s) return "";
  if (/^\d{4}$/.test(s)) return s;
  const d = new Date(s);
  return Number.isNaN(d.getTime())
    ? s
    : new Intl.DateTimeFormat(locale, { day: "2-digit", month: "short", year: "numeric" }).format(d);
}

// Which year should this item live under (header + sort)?
// Prefer END year of a range (in date_range OR date); else single date's year; else null.
function v_yearForGrouping(item) {
  let r = v_parseYearRange(item.date_range);
  if (r) return r.end;
  r = v_parseYearRange(item.date);
  if (r) return r.end;

  const y = v_getYearFromDate(item.date);
  return y !== null ? y : null;
}


function v_isMeaningful(item) {
  const hasTitle = typeof item.title === "string" && item.title.trim();
  const hasImages = Array.isArray(item.images) && item.images.length && item.images[0]?.src;
  return Boolean(hasTitle && hasImages);
}
function v_htmlEscape(s = "") {
  return String(s).replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
}
function v_cleanLinks(arr) {
  return (Array.isArray(arr) ? arr : []).filter(l => l && l.url && l.platform);
}
const clearHash = () => history.replaceState(null, "", window.location.pathname + window.location.search);

// --- lightbox state ----------------------------------------------------------
let suppressNextDocClick = false;

const VB = {
  root: null, img: null, prev: null, next: null, close: null,
  items: [], index: 0, touchStartX: null
};

function vb_mount() {
  if (VB.root) return;
  VB.root  = document.getElementById('visuals-lightbox');
  if (!VB.root) {
    VB.root = document.createElement('div');
    VB.root.id = 'visuals-lightbox';
    VB.root.innerHTML = `
      <div class="vb-frame">
        <button class="vb-close" aria-label="Close">×</button>
        <button class="vb-prev" aria-label="Previous">‹</button>
        <img alt="">
        <button class="vb-next" aria-label="Next">›</button>
      </div>`;
    document.body.appendChild(VB.root);
  }
  VB.img   = VB.root.querySelector('img');
  VB.prev  = VB.root.querySelector('.vb-prev');
  VB.next  = VB.root.querySelector('.vb-next');
  VB.close = VB.root.querySelector('.vb-close');

  VB.prev.addEventListener('click', () => vb_goto(VB.index - 1));
  VB.next.addEventListener('click', () => vb_goto(VB.index + 1));
  VB.close.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    vb_close();
  });
  VB.root.addEventListener('click', (e) => {
    if (e.target === VB.root) {
      e.stopPropagation();
      vb_close();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (!VB.root.classList.contains('is-open')) return;
    if (e.key === 'Escape') vb_close();
    if (e.key === 'ArrowLeft') vb_goto(VB.index - 1);
    if (e.key === 'ArrowRight') vb_goto(VB.index + 1);
  });

  // swipe
  VB.root.addEventListener('touchstart', e => { VB.touchStartX = e.touches[0].clientX; }, {passive:true});
  VB.root.addEventListener('touchend', e => {
    if (VB.touchStartX == null) return;
    const dx = e.changedTouches[0].clientX - VB.touchStartX;
    if (Math.abs(dx) > 40) vb_goto(VB.index + (dx < 0 ? 1 : -1));
    VB.touchStartX = null;
  }, {passive:true});
}

function vb_open(images, startIndex = 0) {
  vb_mount();
  VB.items = images.slice();
  VB.index = Math.max(0, Math.min(startIndex, VB.items.length - 1));
  VB.root.classList.add('is-open');
  VB.root.setAttribute('aria-hidden', 'false');
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
  vb_render();
}

function vb_goto(i) {
  if (!VB.items.length) return;
  VB.index = (i + VB.items.length) % VB.items.length;
  vb_render();
}

function vb_render() {
  const cur = VB.items[VB.index];
  if (!cur) return;
  VB.img.src = cur.src;
  VB.img.alt = cur.alt || '';
}

function vb_close() {
  if (!VB.root) return;
  suppressNextDocClick = true;  // ignore the very next document click
  VB.root.classList.remove('is-open');
  VB.root.setAttribute('aria-hidden', 'true');
  document.documentElement.style.overflow = '';
  document.body.style.overflow = '';
}

// --- render -----------------------------------------------------------------
function renderVisuals(items) {
  const section = document.getElementById("visuals-section");
  if (!section) return;

  if (!items.length) {
    const empty = document.createElement("p");
    empty.className = "fragment-mono-regular muted";
    empty.textContent = "No visuals yet.";
    section.appendChild(empty);
    return;
  }

  // Sort newest → oldest by best available key:
  // 1) year from full date
  // 2) year from YYYY-only date
  // 3) end year from date_range
  items.sort((a, b) => {
    const ya = v_yearForGrouping(a) ?? -Infinity;
    const yb = v_yearForGrouping(b) ?? -Infinity;
    if (yb !== ya) return yb - ya;

    // tie-breaker: if both have full dates in same year, sort by actual date
    const ta = Date.parse(a.date || "");
    const tb = Date.parse(b.date || "");
    if (Number.isFinite(tb) && Number.isFinite(ta)) return tb - ta;
    return 0;
  });

  // Build year blocks: {header + grid}
  let currentYear = null;
  let yearGrid = null;

  items.forEach(item => {
    const year = v_yearForGrouping(item) ?? "undated";
    if (year !== currentYear) {
      currentYear = year;
      const yearHeader = document.createElement("h3");
      yearHeader.className = "display-font visuals-year";
      yearHeader.textContent = String(year);
      section.appendChild(yearHeader);

      yearGrid = document.createElement("div");
      yearGrid.className = "visuals-grid";
      section.appendChild(yearGrid);
    }

    const slug = (item.slug || "").trim() || `project-${Math.random().toString(36).slice(2)}`;
    const first = item.images[0];

    const card = document.createElement("article");
    card.className = "visual-card";
    card.id = slug;
    card.setAttribute("data-slug", slug);
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "button");
    card.setAttribute("aria-expanded", "false");
    card.innerHTML = `
      <a class="visual-thumb" href="#${slug}" aria-label="${v_htmlEscape(item.title)}" aria-controls="${slug}-details">
        <img src="${first.src}" alt="${v_htmlEscape(first.alt || item.title)}" class="visual-image" loading="lazy" decoding="async">
      </a>
      <div class="visual-meta">
        <h4 class="visual-title">${v_htmlEscape(item.title)}</h4>
        <p class="fragment-mono-regular muted">
          ${ (item.date || item.date_range) ? v_htmlEscape(v_niceDate(item)) : "" }
          ${ item.client ? ((item.date || item.date_range) ? " · " : "") + v_htmlEscape(item.client) : "" }
          ${ Array.isArray(item.type) && item.type.length
              ? ((item.date || item.client || item.date_range) ? " · " : "") + item.type.map(v_htmlEscape).join(", ")
              : "" }
        </p>
      </div>
      <div class="visual-expand" id="${slug}-details" hidden></div>
    `;

    yearGrid.appendChild(card);

    const toggle = (ev) => {
      ev?.preventDefault?.();
      const expanded = card.getAttribute("aria-expanded") === "true";
      document.querySelectorAll(".visual-card[aria-expanded='true']").forEach(el => {
        if (el !== card) collapseCard(el);
      });
      if (expanded) {
        collapseCard(card);
        clearHash();
      } else {
        expandCard(card, item);
        history.replaceState(null, "", `#${slug}`);
      }
    };

    // make the whole card clickable, but let external links work
    card.addEventListener("click", (e) => {
      if (e.target.closest(".visual-expand a")) return;      // allow clicks on links inside expanded
      if (e.target.closest(".visual-thumb")) { e.preventDefault(); }
      toggle(e);
    });

    card.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") toggle(e);
      if (e.key === "Escape") { collapseCard(card); clearHash(); }
    });
  });

  // Deep-link activation
  const activateFromHash = () => {
    const slug = location.hash.replace(/^#/, "");
    if (!slug) return;
    const target = document.querySelector(`.visual-card[data-slug="${CSS.escape(slug)}"]`);
    if (target) {
      document.querySelectorAll(".visual-card[aria-expanded='true']").forEach(el => {
        if (el !== target) collapseCard(el);
      });
      const item = items.find(i => (i.slug || "").trim() === slug);
      if (item) expandCard(target, item, { scroll: true });
    }
  };
  window.addEventListener("hashchange", activateFromHash);
  activateFromHash();
}

function expandCard(card, item, opts = {}) {
  const box = card.querySelector(".visual-expand");
  if (!box) return;

  const links = v_cleanLinks(item.links);
  const credits = Array.isArray(item.credits) ? item.credits : [];
  const desc = item.description ? `<p class="visual-description">${item.description}</p>` : "";

  const gallery = `
    <div class="visual-gallery" role="region" aria-label="images for ${v_htmlEscape(item.title)}">
      ${item.images.map(img => `
        <figure class="visual-slide">
          <img src="${img.src}" alt="${v_htmlEscape(img.alt || item.title)}" loading="lazy" decoding="async">
          ${img.caption ? `<figcaption class="caption fragment-mono-regular">${v_htmlEscape(img.caption)}</figcaption>` : ""}
        </figure>
      `).join("")}
    </div>
  `;

  const linksHtml = links.length
    ? `<p class="fragment-mono-regular">
         ${links.map(l => `<a href="${l.url}" target="_blank" rel="noopener" class="visuals-link">${v_htmlEscape(l.platform)} →</a>`).join("&nbsp;&nbsp;")}
       </p>`
    : "";

  const creditsHtml = credits.length
    ? `<div class="fragment-mono-regular muted">
         ${credits.map(c => {
            const name = v_htmlEscape(c.name || "");
            const role = v_htmlEscape(c.role || "");
            const url  = c.url ? `<a href="${c.url}" target="_blank" rel="noopener">${name}</a>` : name;
            return role ? `${url} — ${role}` : url;
          }).join("<br>")}
       </div>`
    : "";

  box.innerHTML = `${gallery}${desc}${linksHtml}${creditsHtml}`;
  box.hidden = false;
  card.setAttribute("aria-expanded", "true");
  card.classList.add("is-open");

  // lightbox hooks
  const galleryImgs = box.querySelectorAll('.visual-slide img');
  const galleryData = item.images.map(img => ({ src: img.src, alt: img.alt || item.title }));

  galleryImgs.forEach((imgEl, idx) => {
    imgEl.style.cursor = 'zoom-in';
    imgEl.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      vb_open(galleryData, idx);
    });
  });

  if (opts.scroll) {
    setTimeout(() => {
      card.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  }
}

function collapseCard(card) {
  const box = card.querySelector(".visual-expand");
  if (!box) return;
  box.hidden = true;
  box.innerHTML = "";
  card.setAttribute("aria-expanded", "false");
  card.classList.remove("is-open");
}

// --- boot -------------------------------------------------------------------
document.addEventListener("click", (e) => {
  // If lightbox is open, or we just closed it, do nothing
  if (VB.root && VB.root.classList.contains('is-open')) return;
  if (suppressNextDocClick) { suppressNextDocClick = false; return; }

  const open = document.querySelector(".visual-card[aria-expanded='true']");
  if (!open) return;
  if (!open.contains(e.target)) { collapseCard(open); clearHash(); }
});

document.addEventListener("DOMContentLoaded", async () => {
  const data = await fetch("../assets/data/visuals.json")
    .then(r => r.json())
    .catch(err => { console.error("Error fetching visuals:", err); return []; });

  const taken = new Set();
  const items = (Array.isArray(data) ? data : []).map(it => {
    const raw = (it.slug || '').trim();
    const safe = raw ? ensureUniqueSlug(slugify(raw), taken) : computeSlug(it, taken);
    return { ...it, slug: safe };
  });

  renderVisuals(items.filter(v_isMeaningful));
});
