(function initSZCHSkeleton() {
  function repeat(count, render) {
    return Array.from({ length: count }, (_, i) => render(i)).join("");
  }

  function line(width, extraClass = "") {
    return `<span class="szch-skeleton-line ${extraClass}" style="--szch-skel-width:${width};"></span>`;
  }

  function musicTemplate({ count = 1 } = {}) {
    return `
      <div class="szch-skeleton-stack szch-skeleton-stack--music" aria-hidden="true">
        ${repeat(count, () => `
          <article class="szch-skeleton-media-item">
            ${line("56%", "is-title")}
            <div class="szch-skeleton-thumb szch-skeleton-thumb--music"></div>
            ${line("24%")}
            ${line("92%")}
            ${line("74%")}
            ${line("34%")}
          </article>
        `)}
      </div>
    `;
  }

  function splitIntoGroups(total, groups) {
    const safeTotal = Math.max(1, Number(total) || 1);
    const safeGroups = Math.max(1, Math.min(safeTotal, Number(groups) || 1));
    const base = Math.floor(safeTotal / safeGroups);
    let remainder = safeTotal % safeGroups;
    return Array.from({ length: safeGroups }, () => {
      const size = base + (remainder > 0 ? 1 : 0);
      remainder = Math.max(0, remainder - 1);
      return size;
    }).filter(Boolean);
  }

  const templates = {
    latest({ count = 3 } = {}) {
      return `
        <div class="szch-skeleton-stack szch-skeleton-stack--chips" aria-hidden="true">
          ${repeat(count, () => `
            <article class="szch-skeleton-card szch-skeleton-card--chip">
              <div class="szch-skeleton-chip-row szch-skeleton-chip-row--single">
                <span class="szch-skeleton-dot"></span>
                ${line("18%", "is-tag")}
                ${line("40%")}
                <span class="szch-skeleton-sep"></span>
                ${line("16%")}
              </div>
            </article>
          `)}
        </div>
      `;
    },

    features({ count = 4 } = {}) {
      return `
        <div class="szch-skeleton-feature-grid" aria-hidden="true">
          ${repeat(count, () => `
            <article class="feature szch-skeleton-card szch-skeleton-card--feature">
              ${line("46%", "is-title")}
              ${line("82%")}
              ${line("76%")}
              ${line("38%")}
            </article>
          `)}
        </div>
      `;
    },

    dates({ count = 4 } = {}) {
      return repeat(count, () => `
        <li class="szch-skeleton-date-row" aria-hidden="true">
          ${line("92%")}
          ${line("58%")}
        </li>
      `);
    },

    music: musicTemplate,
    media: musicTemplate,

    news({ count = 2 } = {}) {
      return `
        <div class="szch-skeleton-stack" aria-hidden="true">
          ${repeat(count, () => `
            <article class="szch-skeleton-card szch-skeleton-card--news">
              <div class="szch-skeleton-news-meta">
                ${line("36%")}
              </div>
              ${line("62%", "is-title")}
              <div class="szch-skeleton-thumb szch-skeleton-thumb--news"></div>
              ${line("94%")}
              ${line("88%")}
              ${line("42%")}
            </article>
          `)}
        </div>
      `;
    },

    visuals({ count = 3, yearCount = 2 } = {}) {
      const groups = splitIntoGroups(count, yearCount);
      return `
        <div class="szch-skeleton-visual-layout" aria-hidden="true">
          ${groups.map((groupCount, groupIdx) => `
            <div class="szch-skeleton-visual-year">
              ${line(groupIdx === 0 ? "4.6rem" : "4rem", "is-title szch-skeleton-line--year")}
            </div>
            <div class="szch-skeleton-visual-grid">
              ${repeat(groupCount, () => `
                <article class="visual-card szch-skeleton-card szch-skeleton-card--visual">
                  <div class="visual-thumb szch-skeleton-thumb szch-skeleton-thumb--visual">
                    <span class="szch-skeleton-count"></span>
                  </div>
                  <div class="visual-meta">
                    ${line("64%", "is-title")}
                    ${line("46%")}
                  </div>
                </article>
              `)}
            </div>
          `).join("")}
        </div>
      `;
    },

    press({ count = 2 } = {}) {
      return `
        <div class="szch-skeleton-stack" aria-hidden="true">
          ${repeat(count, () => `
            <article class="szch-skeleton-card szch-skeleton-card--press">
              ${line("86%")}
              ${line("94%")}
              ${line("76%")}
              ${line("33%")}
            </article>
          `)}
        </div>
      `;
    }
  };

  function show(container, type, options = {}) {
    if (!container || !templates[type]) return;
    container.setAttribute("aria-busy", "true");
    container.classList.add("szch-loading");
    container.innerHTML = templates[type](options);
  }

  function preloadImages(urls = [], { timeoutMs = 4200 } = {}) {
    const unique = [...new Set((Array.isArray(urls) ? urls : []).filter(Boolean))];
    if (!unique.length) return Promise.resolve();

    return Promise.all(unique.map(src => new Promise((resolve) => {
      const img = new Image();
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        resolve();
      };
      const finalizeLoaded = () => {
        if (typeof img.decode === "function") {
          img.decode().catch(() => {}).finally(finish);
        } else {
          finish();
        }
      };
      const timer = setTimeout(finish, timeoutMs);
      img.onload = finalizeLoaded;
      img.onerror = finish;
      img.decoding = "async";
      img.src = src;
      if (img.complete) finalizeLoaded();
    }))).then(() => undefined);
  }

  function done(container) {
    if (!container) return;
    container.removeAttribute("aria-busy");
    container.classList.remove("szch-loading");
  }

  window.SZCHSkeleton = { show, done, preloadImages };
})();
