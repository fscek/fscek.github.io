const REL_YEAR_MIN = 1990;
const REL_YEAR_MAX = new Date().getFullYear();

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

async function initReleases() {
  let releases = await fetch("../assets/data/releases.json")
    .then(r => r.json())
    .catch(err => { console.error("Error fetching releases:", err); return []; });

  releases = releases
    .filter(rel_isMeaningful)
    .map(r => ({
      ...r,
      links: Array.isArray(r.links) ? r.links.filter(l => l && l.url && l.platform) : [],
      image: (r.image && !/\/\.webp$/.test(r.image)) ? r.image : ""
    }));

  const years = [...new Set(
    releases.map(rel_getItemYear).filter(y => rel_yearInBounds(y))
  )].sort((a, b) => b - a);

  const hasUndated = releases.some(rel => rel_getItemYear(rel) === null);

  generateYearFiltersReleases(years, hasUndated, releases);

  // ?releases=YYYY|all|undated, else latest year, else 'all'
  const urlParam = new URLSearchParams(window.location.search).get("releases");
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

        div.innerHTML = html;
        contentContainer.appendChild(div);
      });
    }

    requestAnimationFrame(() => {
      contentContainer.style.opacity = 1;
    });
  }, 400);
}

// Boot
document.addEventListener("DOMContentLoaded", initReleases);
