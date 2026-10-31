// Purposeful motion only. Progressive enhancement:
// - nothing is hidden unless this script runs AND the user has not asked for reduced motion;
// - IntersectionObserver, no scroll listeners;
// - counted numbers are aria-hidden copies; screen readers get the final value at once.
(function () {
  const noop = { results() {} };
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reduce.matches || !("IntersectionObserver" in window)) { window.Motion = noop; return; }

  document.documentElement.classList.add("motion");

  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("is-in");
      io.unobserve(e.target);
    }),
    { rootMargin: "0px 0px -6% 0px", threshold: 0.06 }
  );

  function mark(scope, sel, stagger) {
    scope.querySelectorAll(sel).forEach((el, i) => {
      el.classList.remove("is-in");
      el.setAttribute("data-reveal", "");
      el.style.setProperty("--i", stagger ? i % stagger : 0);
      io.observe(el);
    });
  }

  // Keyboard users never land on something still invisible.
  document.addEventListener("focusin", (e) => {
    const el = e.target.closest("[data-reveal]");
    if (el) el.classList.add("is-in");
  });
  reduce.addEventListener?.("change", (e) => {
    if (e.matches) document.querySelectorAll("[data-reveal]").forEach((el) => el.classList.add("is-in"));
  });

  const d = document;
  mark(d, ".sec-head, .advice-side, .scam-intro", 0);
  mark(d, ".rate-feature, .rate-list li", 5);
  mark(d, ".fact", 3);
  mark(d, ".mstat", 6);
  mark(d, "#post-list .post", 2);

  // ---- count-up for the result KPIs ----
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  function countUp(el, ms) {
    const final = el.textContent;
    const m = final.match(/([+-]?)(\d[\d,]*\.?\d*)/);
    if (!m) return;
    const raw = m[2];
    const target = parseFloat(raw.replace(/,/g, ""));
    const dec = (raw.split(".")[1] || "").length;
    const grouped = raw.includes(",");
    const pre = final.slice(0, m.index) + m[1];
    const post = final.slice(m.index + m[0].length);
    const fmt = (v) => grouped
      ? v.toLocaleString("en-IN", { minimumFractionDigits: dec, maximumFractionDigits: dec })
      : v.toFixed(dec);
    const t0 = performance.now();
    function frame(now) {
      const t = Math.min(1, (now - t0) / ms);
      el.textContent = t < 1 ? pre + fmt(target * easeOut(t)) + post : final;
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  window.Motion = {
    results(section) {
      // Donut segments sweep in, the growth line draws once, KPIs count up: one sequence that
      // reads "here is your split, here is what it becomes".
      const donut = section.querySelector(".donut");
      if (donut) donut.classList.add("grow");
      const growth = section.querySelector(".growth");
      growth.classList.remove("draw");
      void growth.offsetWidth;
      growth.classList.add("draw");
      setTimeout(() => growth.classList.remove("draw"), 1400);
      section.querySelectorAll("[data-count]").forEach((el, i) => countUp(el, 800 + i * 120));
      mark(section, ".chart-card, .risks, #lines .opt, .compare, .matched .post", 0);
    },
  };
})();
