const REL_YEAR_MIN = 1990;
const REL_YEAR_MAX = new Date().getFullYear();
window.__SZCH_RELEASES_READY = window.__SZCH_RELEASES_READY || false;

function rel_yearInBounds(y) {
  return Number.isInteger(y) && y >= REL_YEAR_MIN && y <= REL_YEAR_MAX;
}
function rel_getYearFromDate(dateStr) {
  const s = (dateStr ?? "").toString().trim();
  const m = /^(\d{4})/.exec(s);
  return m ? Number(m[1]) : null;
}
function rel_formatDateHuman(dateStr) {
  const s = (dateStr ?? "").toString().trim();
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) {
    return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(d);
  }
  return s;
}
function rel_getItemYear(release) {
  const fromDate = release.releaseDate ? rel_getYearFromDate(release.releaseDate) : null;
  if (rel_yearInBounds(fromDate)) return fromDate;
  const yProp = release.year;
  const y = Number.isInteger(yProp) ? yProp : rel_getYearFromDate(yProp);
  return rel_yearInBounds(y) ? y : null;
}
function rel_isMeaningful(release) {
  const hasTitle = typeof release.title === "string" && release.title.trim().length > 0;
  const hasAnyLink = Array.isArray(release.links) && release.links.some(l => l && l.url);
  // allow items with at least a title or a link; year optional
  return hasTitle || hasAnyLink;
}

function rel_slugify(str) {
  return String(str || "")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function rel_assignSlug(release, used) {
  const baseParts = [(release.releaseDate || release.year || "").toString().trim(), release.title || "release"];
  const base = rel_slugify(baseParts.filter(Boolean).join("-")) || "release";
  let slug = base;
  let i = 2;
  while (used.has(slug)) slug = `${base}-${i++}`;
  used.add(slug);
  return slug;
}

let RELEASE_TARGET_SLUG = null;
let HEADER_OFFSET_CACHE = null;

async function initReleases() {
  let releases = await fetch("../assets/data/releases.json")
    .then(r => r.json())
    .catch(err => { console.error("Error fetching releases:", err); return []; });
  const usedSlugs = new Set();

  releases = releases
    .filter(rel_isMeaningful)
    .map(r => ({
      ...r,
      links: Array.isArray(r.links) ? r.links.filter(l => l && l.url && l.platform) : [],
      image: (r.image && !/\/\.webp$/.test(r.image)) ? r.image : "",
      slug: rel_assignSlug(r, usedSlugs)
    }));

  const years = [...new Set(
    releases.map(rel_getItemYear).filter(y => rel_yearInBounds(y))
  )].sort((a, b) => b - a);

  const hasUndated = releases.some(rel => rel_getItemYear(rel) === null);

  const params = new URLSearchParams(window.location.search);
  const releaseSlugParam = params.get("release");
  const targetRelease = releaseSlugParam ? releases.find(r => r.slug === releaseSlugParam) : null;
  if (targetRelease) RELEASE_TARGET_SLUG = releaseSlugParam;

  generateYearFiltersReleases(years, hasUndated, releases);

  // ?releases=YYYY|all|undated, else latest year, else 'all'
  const urlParam = params.get("releases");
  let defaultFilter;
  if (urlParam) {
    if (urlParam === "all" || urlParam === "undated") defaultFilter = urlParam;
    else {
      const y = parseInt(urlParam, 10);
      defaultFilter = rel_yearInBounds(y) ? y : (years[0] ?? (hasUndated ? "undated" : "all"));
    }
  } else {
    defaultFilter = years[0] ?? (hasUndated ? "undated" : "all");
  }

  if (targetRelease) {
    const targetYear = rel_getItemYear(targetRelease);
    defaultFilter = targetYear ?? (hasUndated ? "undated" : "all");
  }

  const btn = document.querySelector(
    `#year-filter-container-releases .year-filter-button[data-filter="${defaultFilter}"]`
  );
  if (btn) btn.click(); else fetchAndRenderReleases(releases, "all");
}

function generateYearFiltersReleases(years, hasUndated, releases) {
  const filtersContainer = document.getElementById("year-filter-container-releases");
  filtersContainer.innerHTML = "";

  const makeBtn = (label, filterValue) => {
    const button = document.createElement("button");
    button.className = "year-filter-button";
    button.textContent = label;
    button.setAttribute("data-filter", filterValue);
    button.addEventListener("click", function () {
      document.querySelectorAll("#year-filter-container-releases .year-filter-button")
        .forEach(btn => btn.classList.remove("active"));
      this.classList.add("active");

      const url = new URL(window.location);
      url.searchParams.set("releases", filterValue);
      history.replaceState(null, "", url);

      fetchAndRenderReleases(releases, filterValue);
    });
    filtersContainer.appendChild(button);
  };

  makeBtn("all", "all");
  years.forEach(y => makeBtn(String(y), y));
  if (hasUndated) makeBtn("undated", "undated");
}

function fetchAndRenderReleases(releases, filterValue) {
  const contentContainer = document.querySelector(".releases-content-container");
  contentContainer.style.opacity = 0;

  setTimeout(() => {
    contentContainer.innerHTML = "";

    const filtered = releases.filter(release => {
      const y = rel_getItemYear(release);
      if (filterValue === "all") return true;
      if (filterValue === "undated") return y === null;
      if (typeof filterValue === "number" || /^\d{4}$/.test(String(filterValue))) {
        return y === Number(filterValue);
      }
      return true;
    });

    if (filtered.length === 0) {
      contentContainer.innerHTML = '<p class="fragment-mono-regular muted">No releases for this selection (yet).</p>';
    } else {
      filtered.sort((a, b) => {
        const ta = Date.parse(a.releaseDate || "");
        const tb = Date.parse(b.releaseDate || "");
        if (Number.isFinite(tb) && Number.isFinite(ta)) return tb - ta;
        const ya = rel_getItemYear(a);
        const yb = rel_getItemYear(b);
        if (ya === null && yb === null) return 0;
        if (ya === null) return 1;
        if (yb === null) return -1;
        return yb - ya;
      });

      filtered.forEach(release => {
        const div = document.createElement("div");
        div.className = "release-item";
        div.dataset.slug = release.slug;
        div.id = `release-${release.slug}`;
        let html = `<h3 class="release-title">${release.title || "(untitled)"}</h3>`;

        if (release.image) {
          html += `<img src="${release.image}" alt="${release.title || "release image"}" class="release-image" loading="lazy" decoding="async">`;
        }

        if (release.releaseDate) {
          html += `<p class="release-date">${rel_formatDateHuman(release.releaseDate)}</p>`;
        } else {
          const y = rel_getItemYear(release);
          if (y !== null) html += `<p class="release-date">${y}</p>`;
        }

        if (release.description) {
          html += `<p class="release-description">${release.description}</p>`;
        }

        if (Array.isArray(release.links)) {
          release.links.forEach(link => {
            if (link && link.url && link.platform) {
              html += `<a href="${link.url}" target="_blank" rel="noopener" class="release-link">${link.platform}</a><br>`;
            }
          });
        }

        html += `<p class="release-inline-link fragment-mono-regular"><a href="?release=${encodeURIComponent(release.slug)}">permalink →</a></p>`;

        div.innerHTML = html;
        contentContainer.appendChild(div);
      });
    }

    highlightReleaseSlug(contentContainer);

    requestAnimationFrame(() => {
      contentContainer.style.opacity = 1;
      if (!window.__SZCH_RELEASES_READY) {
        window.__SZCH_RELEASES_READY = true;
        window.dispatchEvent(new Event("releases:ready"));
      }
    });
  }, 400);
}

function highlightReleaseSlug(container) {
  if (!RELEASE_TARGET_SLUG) return;
  const selector = `[data-slug="${window.CSS?.escape ? CSS.escape(RELEASE_TARGET_SLUG) : RELEASE_TARGET_SLUG}"]`;
  const target = container.querySelector(selector);
  if (target) {
    target.classList.add("release-item--highlight");
    const offset = getHeaderOffset();
    const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top, behavior: "smooth" });
    setTimeout(() => window.scrollTo({ top, behavior: "auto" }), 650);
    RELEASE_TARGET_SLUG = null;
  }
}

function getHeaderOffset() {
  if (HEADER_OFFSET_CACHE && Math.abs(window.innerWidth - HEADER_OFFSET_CACHE.width) < 20) {
    return HEADER_OFFSET_CACHE.offset;
  }
  const header = document.querySelector("header");
  const base = header ? header.getBoundingClientRect().height : 0;
  const offset = Math.max(90, base + 18);
  HEADER_OFFSET_CACHE = { width: window.innerWidth, offset };
  return offset;
}

window.addEventListener("resize", () => { HEADER_OFFSET_CACHE = null; });

// Boot
document.addEventListener("DOMContentLoaded", initReleases);
