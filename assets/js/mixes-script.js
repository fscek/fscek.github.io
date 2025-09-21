// ---- helpers ---------------------------------------------------------------
function getYearFromDate(dateStr) {
  const s = (dateStr ?? "").toString().trim();
  const match = /^(\d{4})/.exec(s);
  return match ? Number(match[1]) : null;
}

function formatDateHuman(dateStr) {
  const s = (dateStr ?? "").toString().trim();
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit", month: "short", year: "numeric"
    }).format(d);
  }
  return s;
}

// ---- main mixes flow -------------------------------------------------------
async function initMixes() {
  const mixes = await fetch("../assets/data/mixes.json")
    .then(r => r.json())
    .catch(err => { console.error("Error fetching mixes:", err); return []; });

  const years = [...new Set(
    mixes.map(m => getYearFromDate(m.date)).filter(y => Number.isInteger(y))
  )].sort((a, b) => b - a);

  const hasUndated = mixes.some(m => getYearFromDate(m.date) === null);

  generateMixesYearFilters(years, hasUndated, mixes);

  // Default filter: ?year=YYYY|all|undated, else latest year, else 'all'
  const urlParam = new URLSearchParams(window.location.search).get("year");
  let defaultFilter;
  if (urlParam) {
    if (urlParam === "all" || urlParam === "undated") defaultFilter = urlParam;
    else {
      const y = parseInt(urlParam, 10);
      defaultFilter = Number.isFinite(y) ? y : (years[0] ?? (hasUndated ? "undated" : "all"));
    }
  } else {
    defaultFilter = years[0] ?? (hasUndated ? "undated" : "all");
  }

  const btn = document.querySelector(
    `#year-filter-container-mixes .year-filter-button[data-filter="${defaultFilter}"]`
  );
  if (btn) btn.click(); else fetchAndRenderMixes(mixes, "all");
}

function generateMixesYearFilters(years, hasUndated, mixes) {
  const filtersContainer = document.getElementById("year-filter-container-mixes");
  filtersContainer.innerHTML = "";

  const makeBtn = (label, filterValue) => {
    const button = document.createElement("button");
    button.className = "year-filter-button";
    button.textContent = label;
    button.setAttribute("data-filter", filterValue);
    button.addEventListener("click", function () {
      document.querySelectorAll("#year-filter-container-mixes .year-filter-button")
        .forEach(btn => btn.classList.remove("active"));
      this.classList.add("active");

      const url = new URL(window.location);
      url.searchParams.set("year", filterValue);
      history.replaceState(null, "", url);

      fetchAndRenderMixes(mixes, filterValue);
    });
    filtersContainer.appendChild(button);
  };

  makeBtn("all", "all");
  years.forEach(y => makeBtn(String(y), y));
  if (hasUndated) makeBtn("undated", "undated");
}

function fetchAndRenderMixes(mixes, filterValue) {
  const mixesContainer = document.querySelector(".mixes-content-container");
  mixesContainer.style.opacity = 0;

  setTimeout(() => {
    mixesContainer.innerHTML = "";

    const filtered = mixes.filter(mix => {
      const y = getYearFromDate(mix.date);
      if (filterValue === "all") return true;
      if (filterValue === "undated") return y === null;
      if (typeof filterValue === "number" || /^\d{4}$/.test(String(filterValue))) {
        return y === Number(filterValue);
      }
      return true;
    });

    if (filtered.length === 0) {
      mixesContainer.innerHTML = '<p class="fragment-mono-regular muted">No mixes for this selection (yet).</p>';
    } else {
      filtered.sort((a, b) => {
        const ta = Date.parse(a.date || "");
        const tb = Date.parse(b.date || "");
        if (Number.isFinite(tb) && Number.isFinite(ta)) return tb - ta;
        const ya = getYearFromDate(a.date);
        const yb = getYearFromDate(b.date);
        if (ya === null && yb === null) return 0;
        if (ya === null) return 1;
        if (yb === null) return -1;
        return yb - ya;
      });

      filtered.forEach(mix => {
        const mixDiv = document.createElement("div");
        mixDiv.className = "mix-item";
        let mixHTML = `<h3 class="mix-title">${mix.title}</h3>`;

        if (mix.image) {
          mixHTML += `<img src="${mix.image}" alt="${mix.title}" class="mix-image" loading="lazy" decoding="async">`;
        }

        if (mix.date) {
          mixHTML += `<p class="mix-date">${formatDateHuman(mix.date)}</p>`;
        }

        mixHTML += `<p class="mix-description">${mix.description || ""}</p>`;

        if (Array.isArray(mix.links)) {
          mix.links.forEach(link => {
            if (link && link.url && link.platform) {
              mixHTML += `<a href="${link.url}" target="_blank" rel="noopener" class="mixes-link">${link.platform}</a><br>`;
            }
          });
        }

        mixDiv.innerHTML = mixHTML;
        mixesContainer.appendChild(mixDiv);
      });
    }

    requestAnimationFrame(() => {
      mixesContainer.style.opacity = 1;
    });
  }, 400);
}

// Boot
document.addEventListener("DOMContentLoaded", initMixes);
