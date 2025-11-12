const LATEST_LIMIT = 3;
const DATE_FMT = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric"
});

const DATA_PATHS = {
  mixes: "assets/data/mixes.json",
  releases: "assets/data/releases.json",
  visuals: "assets/data/visuals.json",
  news: "assets/data/news.md"
};

function htmlEscape(str = "") {
  return String(str).replace(/[&<>"']/g, c => ({
    "&":"&amp;",
    "<":"&lt;",
    ">":"&gt;",
    '"':"&quot;",
    "'":"&#39;"
  }[c] || c));
}

function slugify(str) {
  return String(str || "")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function uniqueSlug(baseParts, used, fallback = "item") {
  const base = slugify(baseParts.filter(Boolean).join("-")) || fallback;
  let slug = base || fallback;
  let i = 2;
  while (used.has(slug)) slug = `${base}-${i++}`;
  used.add(slug);
  return slug;
}

function parseDateInfo(value) {
  const raw = (value ?? "").toString().trim();
  if (!raw) return { ts: -Infinity, label: "" };
  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) {
    return { ts: parsed.getTime(), label: DATE_FMT.format(parsed) };
  }
  const yearMatch = raw.match(/^(\d{4})/);
  if (yearMatch) {
    const y = Number(yearMatch[1]);
    return {
      ts: new Date(y, 0, 1).getTime(),
      label: yearMatch[0]
    };
  }
  return { ts: -Infinity, label: raw };
}

function firstLink(links = []) {
  if (!Array.isArray(links)) return null;
  return links.find(link => link && link.url) || null;
}

async function fetchJson(path) {
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`Failed to fetch ${path}`);
    return await res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}

async function fetchText(path) {
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`Failed to fetch ${path}`);
    return await res.text();
  } catch (err) {
    console.error(err);
    return "";
  }
}

function markdownToEntries(md) {
  if (!md) return [];
  const blocks = md.split(/\n-{3,}\n/).map(b => b.trim()).filter(Boolean);
  return blocks.map(block => {
    const lines = block.split("\n");
    const titleMatch = (lines.shift() || "").match(/^##\s*(.+)$/);
    if (!titleMatch) return null;
    const title = titleMatch[1].trim();
    const meta = { links: [] };
    let i = 0;
    while (i < lines.length && lines[i].trim()) {
      const line = lines[i];
      if (/^\s*-/.test(line) && meta._lastKey === "links") {
        const [text, url] = line.replace(/^\s*-\s*/, "").split("|").map(s => s.trim());
        if (text && url) meta.links.push({ text, url });
      } else {
        const [key, ...rest] = line.split(":");
        if (!key) { i++; continue; }
        const normalized = key.trim().toLowerCase();
        meta._lastKey = normalized;
        const value = rest.join(":").trim();
        if (normalized === "links") {
          if (value) {
            const [text, url] = value.split("|").map(s => s.trim());
            if (text && url) meta.links.push({ text, url });
          }
        } else if (normalized === "tags") {
          meta.tags = value.split(/[,/]/).map(s => s.trim()).filter(Boolean);
        } else {
          meta[normalized] = value;
        }
      }
      i++;
    }
    const body = lines.slice(i).join("\n").trim();
    return {
      title,
      date: meta.date || "",
      slug: meta.slug || slugify(`${meta.date || ""}-${title}`),
      body,
      tags: meta.tags || [],
      links: meta.links || [],
      summary: body.split("\n")[0] || ""
    };
  }).filter(Boolean);
}

function mixEntries(mixes) {
  const used = new Set();
  return mixes
    .map(mix => {
      const { ts, label } = parseDateInfo(mix.date);
      if (!Number.isFinite(ts)) return null;
      const slug = uniqueSlug([(mix.date || "").split("T")[0], mix.title || "mix"], used, "mix");
      return {
        type: "mix",
        title: mix.title || "untitled mix",
        ts,
        dateLabel: label,
        href: `/music/?mix=${encodeURIComponent(slug)}`,
        external: false,
        blurb: mix.description ? mix.description.replace(/<br\s*\/?>/gi, " ").slice(0, 140) : "",
        accent: "mix",
        slug
      };
    })
    .filter(Boolean);
}

function releaseEntries(releases) {
  const used = new Set();
  return releases
    .map(rel => {
      const { ts, label } = parseDateInfo(rel.releaseDate || rel.year);
      if (!Number.isFinite(ts)) return null;
      const slug = uniqueSlug(
        [(rel.releaseDate || rel.year || "").toString().trim(), rel.title || "release"],
        used,
        "release"
      );
      return {
        type: "release",
        title: rel.title || "untitled release",
        ts,
        dateLabel: label,
        href: `/music/?release=${encodeURIComponent(slug)}`,
        external: false,
        blurb: rel.description || "",
        accent: "release",
        slug
      };
    })
    .filter(Boolean);
}

function visualEntries(visuals) {
  return visuals
    .map(item => {
      const { ts, label } = parseDateInfo(item.date);
      if (!Number.isFinite(ts)) return null;
      const slug = (item.slug || "").trim();
      return {
        type: "visual",
        title: item.title || "visuals project",
        ts,
        dateLabel: label,
        href: slug ? `/visuals/#${encodeURIComponent(slug)}` : "/visuals/",
        external: false,
        blurb: item.client || (Array.isArray(item.type) ? item.type.join(", ") : ""),
        accent: "visual"
      };
    })
    .filter(Boolean);
}

function newsEntries(newsMd) {
  return markdownToEntries(newsMd)
    .map(entry => {
      const { ts, label } = parseDateInfo(entry.date);
      if (!Number.isFinite(ts)) return null;
      const link = entry.links?.[0];
      return {
        type: "news",
        title: entry.title,
        ts,
        dateLabel: label,
        href: `/news/?post=${encodeURIComponent(entry.slug)}`,
        external: false,
        blurb: entry.summary,
        accent: "news",
        extraLink: link?.url,
        extraLabel: link?.text
      };
    })
    .filter(Boolean);
}

function renderChip(item) {
  const isExternal = /^https?:/i.test(item.href);
  const target = isExternal ? "_blank" : "_self";
  const rel = isExternal ? "noopener" : "";
  const icons = { mix:"🎧", release:"💽", visual:"🖼️", news:"📰" };
  const icon = icons[item.type] || "✳";
  const label = `${item.type}: ${item.title} (${item.dateLabel})`;
  const tooltip = item.blurb ? ` title="${htmlEscape(item.blurb)}"` : "";
  return `
    <article class="latest-chip" data-kind="${item.type}" aria-label="${htmlEscape(label)}">
      <span class="latest-chip-icon" aria-hidden="true">${icon}</span>
      <span class="latest-chip-tag">${htmlEscape(item.type)}</span>
      <a href="${item.href}" target="${target}" rel="${rel}" class="latest-chip-title"${tooltip}>
        ${htmlEscape(item.title)}
      </a>
      <span class="latest-chip-sep" aria-hidden="true">·</span>
      <span class="latest-chip-date">${htmlEscape(item.dateLabel)}</span>
    </article>
  `;
}

async function hydrateLatestFeed() {
  const feed = document.getElementById("latest-feed");
  if (!feed) return;

  const [mixes, releases, visuals, newsMd] = await Promise.all([
    fetchJson(DATA_PATHS.mixes),
    fetchJson(DATA_PATHS.releases),
    fetchJson(DATA_PATHS.visuals),
    fetchText(DATA_PATHS.news)
  ]);

  const items = [
    ...mixEntries(mixes),
    ...releaseEntries(releases),
    ...visualEntries(visuals),
    ...newsEntries(newsMd)
  ]
    .sort((a, b) => b.ts - a.ts)
    .slice(0, LATEST_LIMIT);

  if (!items.length) {
    feed.innerHTML = '<p class="muted">nothing new just yet.</p>';
    return;
  }

  feed.innerHTML = items.map(renderChip).join("");
}

document.addEventListener("DOMContentLoaded", hydrateLatestFeed);
