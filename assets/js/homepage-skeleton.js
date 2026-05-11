document.addEventListener("DOMContentLoaded", () => {
  const section = document.getElementById("features");
  const grid = section?.querySelector(".feature-grid");
  if (!section || !grid || !window.SZCHSkeleton?.show) return;

  const mount = document.createElement("div");
  mount.className = "features-loading-skeleton";
  section.insertBefore(mount, grid);

  window.SZCHSkeleton.show(mount, "features", { count: 4 });
  const FADE_MS = 280;
  grid.style.opacity = "0";
  grid.style.visibility = "hidden";
  grid.style.transition = `opacity ${FADE_MS}ms ease`;

  const startedAt = performance.now();
  const MIN_VISIBLE_MS = 420;
  const fontsReady = document.fonts?.ready ? document.fonts.ready.catch(() => {}) : Promise.resolve();

  Promise.all([fontsReady]).then(() => {
    const elapsed = performance.now() - startedAt;
    const remaining = Math.max(0, MIN_VISIBLE_MS - elapsed);
    setTimeout(() => {
      mount.style.opacity = "0";
      setTimeout(() => {
        mount.remove();
        grid.style.visibility = "visible";
        requestAnimationFrame(() => {
          grid.style.opacity = "1";
        });
      }, FADE_MS);
    }, remaining);
  });
});
