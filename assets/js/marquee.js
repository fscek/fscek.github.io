(function initMarquee() {
  const marquees = Array.from(document.querySelectorAll(".scrolling_text"));
  if (!marquees.length) return;

  const SPEED_PX_PER_SECOND = 95;

  function ensureSecondSegment(track) {
    const segments = track.querySelectorAll(".text");
    if (!segments.length) return null;
    if (segments.length < 2) track.appendChild(segments[0].cloneNode(true));
    return track.querySelector(".text");
  }

  function measureMarquee(marquee) {
    const track = marquee.querySelector(".scrolling_text-track");
    if (!track) return;

    const firstSegment = ensureSecondSegment(track);
    if (!firstSegment) return;

    const segmentWidth = Math.ceil(firstSegment.getBoundingClientRect().width);
    if (!segmentWidth) {
      marquee.style.setProperty("--marquee-distance", "50%");
      marquee.style.setProperty("--marquee-distance-negative", "-50%");
      marquee.classList.add("is-ready");
      return;
    }

    const duration = Math.max(12, segmentWidth / SPEED_PX_PER_SECOND);
    marquee.style.setProperty("--marquee-distance", `${segmentWidth}px`);
    marquee.style.setProperty("--marquee-distance-negative", `-${segmentWidth}px`);
    marquee.style.setProperty("--marquee-duration", `${duration.toFixed(2)}s`);
    marquee.classList.add("is-ready");
  }

  let frameId = 0;
  function scheduleMeasure() {
    if (frameId) cancelAnimationFrame(frameId);
    frameId = requestAnimationFrame(() => {
      frameId = 0;
      marquees.forEach(measureMarquee);
    });
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(scheduleMeasure).catch(scheduleMeasure);
  } else {
    scheduleMeasure();
  }

  window.addEventListener("load", scheduleMeasure, { once: true });
  window.addEventListener("pageshow", scheduleMeasure, { passive: true });
  window.addEventListener("resize", scheduleMeasure, { passive: true });

  // Fail-safe: never leave the marquee paused if measurement is delayed or skipped.
  window.setTimeout(() => {
    marquees.forEach((marquee) => marquee.classList.add("is-ready"));
  }, 1800);
})();
