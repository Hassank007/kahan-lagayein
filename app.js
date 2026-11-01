(function () {
  const { MARKET, OPTIONS, Engine, Community, FX, OVERSEAS } = window;
  const $ = (s, el = document) => el.querySelector(s);
  const ICONS = "assets/icons.svg#";
  const icon = (name, cls = "ic") => `<svg class="${cls}" aria-hidden="true" focusable="false"><use href="${ICONS}${name}"/></svg>`;

  // ---------- formatting ----------
  const grouped = (n) => Math.round(n).toLocaleString("en-IN");
  const rs = (n) => "Rs " + grouped(n);
  function words(n) {
    if (n >= 1e7) return trim(n / 1e7) + " crore";
    if (n >= 1e5) return trim(n / 1e5) + " lakh";
    if (n >= 1e3) return trim(n / 1e3) + " thousand";
    return grouped(n);
  }
  const trim = (x) => (Math.round(x * 100) / 100).toString();
  const short = (n) => (n >= 1e7 ? trim(n / 1e7) + " cr" : n >= 1e5 ? trim(n / 1e5) + " lakh" : n >= 1e3 ? trim(n / 1e3) + "k" : grouped(n));
  const pct = (x) => Number(x.toFixed(2)) + "%";
  const signed = (x) => (x >= 0 ? "+" : "") + pct(x);
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const fmtDate = (iso) => (/^\d{4}-\d\d-\d\d$/.test(iso) ? `${+iso.slice(8)} ${MONTHS[+iso.slice(5, 7) - 1]} ${iso.slice(0, 4)}` : iso);
  const today = () => new Date().toISOString().slice(0, 10);
  const daysSince = (iso) => Math.floor((Date.parse(today()) - Date.parse(iso)) / 864e5);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function parseAmount(raw) {
    const s = raw.toLowerCase().replace(/rs\.?|pkr|,/g, "").trim();
    const m = s.match(/^([\d.]+)\s*(k|thousand|lac|lakh|lakhs|cr|crore|crores|m|million)?$/);
    if (!m) return NaN;
    const mult = { k: 1e3, thousand: 1e3, lac: 1e5, lakh: 1e5, lakhs: 1e5, cr: 1e7, crore: 1e7, crores: 1e7, m: 1e6, million: 1e6 }[m[2]] || 1;
    return parseFloat(m[1]) * mult;
  }

  // Icon per investment option.
  const OPT_ICON = {
    behbood: "i-certificate", pensioners: "i-certificate", tbill: "i-receipt", ric: "i-certificate", ssc: "i-certificate",
    dsc: "i-certificate", stsc: "i-certificate", sarwa: "i-certificate", npc: "i-globe", mmf: "i-jar", immf: "i-jar",
    bank: "i-bank", termdeposit: "i-lock", equityfund: "i-trend", iequityfund: "i-trend", gold: "i-goldbar", reit: "i-building",
  };


  // ---------- "What is this?" info buttons ----------
  // Disclosure pattern: a real button with aria-expanded; opens on hover, tap/click or Enter/Space,
  // stays open while the pointer is over it, closes with Esc, a second click, or a click elsewhere.
  const TERMS = {
    kse: "<b class='tp-h'>KSE-100</b><span class='tp-p'>A number that shows how the 100 biggest companies on the Pakistan Stock Exchange are doing together. When it goes up, most big shares went up.</span>",
    policy: "<b class='tp-h'>Central bank rate</b><span class='tp-p'>The rate the State Bank of Pakistan (SBP) sets. Banks and government savings pay close to it, so when it goes up, savings usually pay more too.</span>",
    inflation: "<b class='tp-h'>Inflation (rising prices)</b><span class='tp-p'>How fast prices go up. At 10%, something that costs Rs 100 today costs about Rs 110 in a year. If your money grows slower than this, it buys less.</span>",
    usd: "<b class='tp-h'>Dollar rate</b><span class='tp-p'>How many rupees one US dollar costs. When this number goes up, the rupee is getting weaker.</span>",
    tola: "<b class='tp-h'>Tola</b><span class='tp-p'>The usual unit for gold in Pakistan. 1 tola is about 11.66 grams. 24k means pure gold.</span>",
    pe: "<b class='tp-h'>Price vs profit (P/E)</b><span class='tp-p'>The share price divided by one year of the company's profit per share. A P/E of 8 means you pay about 8 years of profit. Lower can mean cheaper, but not always better.</span>",
    float: "<b class='tp-h'>Shares that trade</b><span class='tp-p'>The part of a company's shares people can actually buy and sell. If it is small, the price can jump up and down more.</span>",
    payout: "<b class='tp-h'>Yearly payout (dividend)</b><span class='tp-p'>How much the company paid its shareholders last year, compared with the price. 5% means about Rs 5 a year for every Rs 100 of shares. It is not promised.</span>",
    etf: "<b class='tp-h'>ETF</b><span class='tp-p'>A fund you buy on PSX like a share. One ETF owns a little of many companies, so one bad company hurts less. Start from about Rs 500 to 1,000.</span>",
    fee: "<b class='tp-h'>Yearly fee</b><span class='tp-p'>What the fund company keeps each year. 0.5% means Rs 50 a year for every Rs 10,000 you have in it.</span>",
    limit: "<b class='tp-h'>Limit order</b><span class='tp-p'>When you buy, you set the highest price you will pay. If nobody sells at that price, nothing is bought, so you never overpay.</span>",
    sahulat: "<b class='tp-h'>PSX Sahulat account</b><span class='tp-p'>A simple account for buying shares, opened online with just your CNIC. You can put in up to Rs 30 lakh.</span>",
    minor: "<b class='tp-h'>Minor account</b><span class='tp-p'>A share account a parent or guardian opens for a child under 18 and runs for them. At 18, the shares move into the child's own name.</span>",
    teen: "<b class='tp-h'>Teen bank account or wallet</b><span class='tp-p'>Since April 2026, anyone aged 13 to 17 can have their own bank account or mobile wallet (like Easypaisa or JazzCash), with a debit card and app. No cheque book and no loans.</span>",
    vps: "<b class='tp-h'>Pension plan (VPS)</b><span class='tp-p'>Voluntary Pension Scheme: a long-term savings plan for when you stop working, run by licensed fund companies. You pay in while you work, pay less tax, and take money out from age 60.</span>",
    freelancer: "<b class='tp-h'>Freelancer Digital Account</b><span class='tp-p'>A bank account for freelancers that can hold rupees or dollars. Opens with just your CNIC; up to $5,000 a month can come in.</span>",
    halal: "<b class='tp-h'>Halal versions</b><span class='tp-p'>Islamic (Shariah-compliant) options that share profit instead of paying interest, and avoid businesses like alcohol or gambling.</span>",
    nss: "<b class='tp-h'>National Savings (CDNS)</b><span class='tp-p'>The government's own savings schemes. Your money is backed by the Government of Pakistan. Open at any CDNS branch or on the CDNS app.</span>",
    pmex: "<b class='tp-h'>PMEX</b><span class='tp-p'>Pakistan Mercantile Exchange: a market for gold, oil and other goods, licensed and watched by SECP.</span>",
    futures: "<b class='tp-h'>Futures</b><span class='tp-p'>A deal to buy or sell at a set price later. You only put down part of the money, so both gains and losses are bigger. Risky, not for beginners.</span>",
    cfd: "<b class='tp-h'>Forex and CFD apps</b><span class='tp-p'>Apps where you bet on whether a price goes up or down, without owning anything, often with borrowed money. Sending money to ones based abroad is banned in Pakistan.</span>",
    pvara: "<b class='tp-h'>PVARA</b><span class='tp-p'>Pakistan Virtual Assets Regulatory Authority: the new government body that licenses crypto companies. Only use crypto apps it has licensed.</span>",
    filer: "<b class='tp-h'>Filer</b><span class='tp-p'>Someone who files a tax return with FBR every year. Filers pay about half the tax that non-filers pay on savings and shares.</span>",
  };
  const RISK_WORD = ["", "Very low", "Low", "Medium", "High", "Very high"];
  const MONEY_BACK = (d) => (d <= 3 ? "in 1-3 days" : d <= 31 ? "in about a month" : d <= 120 ? "after 3 to 12 months, or sell early" : "locked in, or a fee to take out early");
  function optTipHtml(o) {
    // Worked example: Rs 1 lakh for one year, after a filer's tax.
    const p1 = { horizon: 1, filer: true };
    const net = Engine.afterTaxRate(o, p1);
    const ex = `Put in Rs 1 lakh. After 1 year you could have about <b>${rs(100000 * (1 + net / 100))}</b> (after tax, for a filer)${o.risk >= 3 ? ", but it could also be less" : ""}.`;
    return `<b class="tp-h">${esc(o.name)}</b>
      <span class="tp-def"><b>What is it?</b> ${esc(o.what || "")}</span>
      <span class="tp-ex"><b>Example:</b> ${ex}</span>
      <span class="tp-list">
      <span class="tp-row"><b>Risk:</b> ${RISK_WORD[o.risk]}</span>
      <span class="tp-row"><b>Promised back?</b> ${guarantee(o)}</span>
      <span class="tp-row"><b>Getting money out:</b> ${MONEY_BACK(o.liquidity)}</span>
      <span class="tp-row"><b>Halal:</b> ${o.halal ? "Yes" : "No"}</span>
      ${o.min ? `<span class="tp-row"><b>Start from:</b> ${rs(o.min)}</span>` : ""}
      </span>`;
  }
  const tip = (label, html) =>
    `<span class="tip"><button type="button" class="tip-btn" aria-expanded="false">${icon("i-info")}<span class="sr-only">What is ${esc(label)}?</span></button><span class="tip-pop" hidden>${html}</span></span>`;
  const optTip = (o) => tip(o.name, optTipHtml(o));
  const termTip = (key, label) => tip(label, TERMS[key]);

  // Static HTML marks terms with data-term="key" or data-opt="id"; add the button after each.
  function addTips(root = document) {
    root.querySelectorAll("[data-term]:not([data-tipped]), [data-opt]:not([data-tipped])").forEach((el) => {
      el.dataset.tipped = "";
      const o = el.dataset.opt && OPTIONS.find((x) => x.id === el.dataset.opt);
      el.insertAdjacentHTML("afterend", o ? optTip(o) : termTip(el.dataset.term, el.textContent.trim()));
    });
  }

  let openTip = null, pinned = false, closeTimer = 0;
  function placeTip(t) {
    const pop = t.querySelector(".tip-pop");
    const b = t.querySelector(".tip-btn").getBoundingClientRect();
    const w = Math.min(320, innerWidth - 32);
    pop.style.width = w + "px";
    pop.style.left = Math.max(16, Math.min(b.left + b.width / 2 - w / 2, innerWidth - w - 16)) + "px";
    const below = b.bottom + 8;
    pop.style.top = below + "px";
    const h = pop.offsetHeight;
    const headerH = document.querySelector(".top").offsetHeight;
    if (below + h > innerHeight - 8 && b.top - h - 8 > headerH + 8) pop.style.top = b.top - h - 8 + "px";
    // A card that is still sliding in has a transform, which shifts fixed children; cancel the shift.
    const want = { x: parseFloat(pop.style.left), y: parseFloat(pop.style.top) };
    const got = pop.getBoundingClientRect();
    pop.style.left = want.x - (got.left - want.x) + "px";
    pop.style.top = want.y - (got.top - want.y) + "px";
  }
  function showTip(t, pin) {
    clearTimeout(closeTimer);
    if (openTip && openTip !== t) hideTip();
    openTip = t;
    pinned = pinned || pin;
    const pop = t.querySelector(".tip-pop");
    pop.hidden = false;
    t.querySelector(".tip-btn").setAttribute("aria-expanded", "true");
    placeTip(t);
  }
  function hideTip() {
    if (!openTip) return;
    openTip.querySelector(".tip-pop").hidden = true;
    openTip.querySelector(".tip-btn").setAttribute("aria-expanded", "false");
    openTip = null;
    pinned = false;
  }
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".tip-btn");
    if (btn) {
      e.preventDefault();
      const t = btn.parentElement;
      if (openTip === t && pinned) hideTip();
      else showTip(t, true);
      return;
    }
    if (openTip && !e.target.closest(".tip-pop")) hideTip();
  });
  document.addEventListener("mouseover", (e) => {
    const t = e.target.closest(".tip");
    if (t) showTip(t, false);
  });
  document.addEventListener("mouseout", (e) => {
    const t = e.target.closest(".tip");
    if (!t || pinned || t.contains(e.relatedTarget)) return;
    closeTimer = setTimeout(hideTip, 250);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && openTip) {
      const btn = openTip.querySelector(".tip-btn");
      hideTip();
      btn.focus();
    }
  });
  addEventListener("scroll", () => openTip && placeTip(openTip), { passive: true });
  addEventListener("resize", () => openTip && placeTip(openTip));
  document.addEventListener("transitionend", () => openTip && placeTip(openTip));

  // ---------- header: mobile drawer (native modal dialog = focus trap + Esc) ----------
  const drawer = $("#drawer");
  const menuBtn = $("#menu-btn");
  function closeDrawer() { if (drawer.open) drawer.close(); }
  menuBtn.addEventListener("click", () => {
    drawer.showModal();
    menuBtn.setAttribute("aria-expanded", "true");
  });
  let navTo = null; // section chosen in the drawer, handled once the dialog has closed
  drawer.addEventListener("close", () => {
    menuBtn.setAttribute("aria-expanded", "false");
    if (!navTo) { menuBtn.focus({ preventScroll: true }); return; }
    const target = navTo;
    navTo = null;
    target.scrollIntoView({ block: "start" });
    history.replaceState(null, "", "#" + target.id);
    const h = target.querySelector("h1, h2");
    if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
  });
  $("#drawer-close").addEventListener("click", closeDrawer);
  drawer.addEventListener("click", (e) => {
    if (e.target === drawer) return closeDrawer(); // backdrop
    const a = e.target.closest("a[href^='#']");
    if (a) {
      e.preventDefault();
      navTo = document.querySelector(a.getAttribute("href"));
      closeDrawer();
    }
  });
  matchMedia("(min-width: 1024px)").addEventListener?.("change", (e) => { if (e.matches) closeDrawer(); });

  // Theme: light by default, dark is opt-in and remembered in this browser.
  const themeBtn = $("#theme-btn");
  const setTheme = (dark) => {
    if (dark) document.documentElement.dataset.theme = "dark"; else delete document.documentElement.dataset.theme;
    themeBtn.setAttribute("aria-pressed", String(dark));
    document.querySelector('meta[name="theme-color"]').content = dark ? "#0B1A1C" : "#F3F4EE";
    try { localStorage.setItem("kl.theme", dark ? "dark" : "light"); } catch (e) { /* storage blocked */ }
    if (lastChart) drawGrowth();
  };
  themeBtn.setAttribute("aria-pressed", String(document.documentElement.dataset.theme === "dark"));
  themeBtn.addEventListener("click", () => setTheme(themeBtn.getAttribute("aria-pressed") !== "true"));

  // Current section in the desktop nav.
  if ("IntersectionObserver" in window) {
    const links = [...document.querySelectorAll(".nav-desktop a")];
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const id = e.target.id === "results" ? "plan" : e.target.id;
        links.forEach((l) => (l.getAttribute("href") === "#" + id ? l.setAttribute("aria-current", "true") : l.removeAttribute("aria-current")));
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    document.querySelectorAll("main > section").forEach((s) => spy.observe(s));
  }

  // ---------- rates ----------
  function renderRates() {
    const byId = Object.fromEntries(OPTIONS.map((o) => [o.id, o]));
    const pr = MARKET.policyRate.value, cpi = MARKET.cpi.value;
    const max = Math.max(pr, cpi);
    $("#rate-feature").innerHTML = `
      <h3 class="card-h">Bank rate vs rising prices</h3>
      <p class="rf-gap"><span class="num">${signed(pr - cpi)}</span> <span>the gap between what safe savings pay before tax and how fast prices are rising</span></p>
      <dl class="rf-bars">
        <div><dt>${icon("i-percent")}Central bank rate (SBP)${termTip("policy", "the central bank rate")}</dt><dd><span class="rf-bar rf-a" style="--w:${(pr / max) * 100}%"></span><span class="num">${pct(pr)}</span><small>as of ${MARKET.policyRate.asOf}</small></dd></div>
        <div><dt>${icon("i-cart")}Prices rising (inflation)${termTip("inflation", "inflation")}</dt><dd><span class="rf-bar rf-b" style="--w:${(cpi / max) * 100}%"></span><span class="num">${pct(cpi)}</span><small>as of ${MARKET.cpi.asOf}</small></dd></div>
      </dl>`;
    const items = [
      ["Behbood (age 60+)", pct(byId.behbood.rate), byId.behbood.asOf, true, "i-certificate", optTip(byId.behbood)],
      ["1-year T-bill (government loan)", pct(byId.tbill.terms[1]), byId.tbill.asOf, false, "i-receipt", optTip(byId.tbill)],
      ["Money market fund", pct(byId.mmf.rate), byId.mmf.asOf, false, "i-jar", optTip(byId.mmf)],
      ["Bank savings account", pct(byId.bank.rate), byId.bank.asOf, true, "i-bank", optTip(byId.bank)],
      ["1 US dollar in rupees", MARKET.usdPkr.value.toFixed(1), MARKET.usdPkr.asOf, true, "i-dollar", termTip("usd", "the dollar rate")],
      ["Gold, 1 tola (24k)", words(MARKET.goldTola.value).replace(" thousand", "k"), MARKET.goldTola.asOf, true, "i-goldbar", termTip("tola", "a tola")],
      ["Stock market (KSE-100), last 12 months", "+" + pct(MARKET.kse100.change12m), MARKET.kse100.asOf, true, "i-trend", termTip("kse", "the KSE-100")],
      ["Stock market, average per year over 20 years", pct(MARKET.kse100.cagr20y) + "/yr", "end-2025", true, "i-calendar", termTip("kse", "the KSE-100")],
    ];
    $("#rate-list").innerHTML = items
      .map(([label, val, date, ok, ic, t]) => `<li><span class="rate-ic">${icon(ic)}</span><span class="rate-label">${label}${t || ""}</span><span class="rate-val num">${ok ? "" : "≈"}${val}</span><span class="rate-date">${ok ? "as of" : "estimate,"} ${date}</span></li>`)
      .join("");
    $("#as-of").textContent = MARKET.asOf;
    $("#change-list").innerHTML = (MARKET.changes || []).map((c) => `<li><time datetime="${c.date}">${fmtDate(c.date)}</time><span>${esc(c.text)}</span></li>`).join("");
  }

  // ---------- planner ----------
  const form = $("#planner");
  const amountInput = $("#amount");

  const overseasBox = $("#overseas");
  const currencySel = $("#currency");
  const fx = () => FX[currencySel.value];
  const money = (n, c) => c.sym + Math.round(n).toLocaleString("en-US");
  function showAmountWords() {
    const n = parseAmount(amountInput.value);
    const ok = isFinite(n) && n > 0;
    $("#amount-words").textContent = !ok ? "" : words(n) + (overseasBox.checked ? ` (about ${money(n / fx().rate, fx())})` : "");
  }
  amountInput.addEventListener("input", showAmountWords);
  overseasBox.addEventListener("change", () => { $("#fx-field").hidden = !overseasBox.checked; showAmountWords(); });
  currencySel.addEventListener("change", showAmountWords);
  amountInput.addEventListener("blur", () => {
    const n = parseAmount(amountInput.value);
    if (isFinite(n) && n > 0) amountInput.value = grouped(n);
  });
  form.querySelectorAll("[data-amt]").forEach((b) =>
    b.addEventListener("click", () => {
      amountInput.value = grouped(+b.dataset.amt);
      amountInput.dispatchEvent(new Event("input"));
    })
  );

  function readProfile() {
    const fd = new FormData(form);
    return {
      amount: parseAmount(amountInput.value),
      horizon: parseFloat(fd.get("horizon")),
      goal: fd.get("goal"),
      risk: "medium", // the risk question was removed; everyone gets the middle mix
      halal: fd.has("halal"),
      filer: fd.has("filer"),
      senior: fd.has("senior"),
      pensioner: fd.has("pensioner"),
      overseas: fd.has("overseas"),
      minor: fd.has("minor"),
      currency: fd.get("currency"),
    };
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const p = readProfile();
    const err = $("#amount-error");
    if (!isFinite(p.amount) || p.amount < 10000) {
      err.hidden = false;
      amountInput.setAttribute("aria-invalid", "true");
      amountInput.setAttribute("aria-describedby", "amount-words amount-hint amount-error");
      amountInput.focus();
      return;
    }
    err.hidden = true;
    amountInput.removeAttribute("aria-invalid");
    amountInput.setAttribute("aria-describedby", "amount-words amount-hint");
    renderPlan(p, Engine.plan(p));
  });

  const realOf = (net, cpi) => ((1 + net / 100) / (1 + cpi / 100) - 1) * 100;
  // Policy-linked safe rates fixed before the latest hike are likely to reprice upward.
  const isPreHike = (o) =>
    o.preHike || (o.bucket === "safe" && !o.assumption && /^\d{4}-\d\d-\d\d$/.test(o.asOf) && o.asOf < MARKET.hikeDate);

  // Plain answer to "is my money promised back?"
  const GOVT = ["behbood", "pensioners", "ric", "ssc", "dsc", "stsc", "sarwa", "tbill", "npc"];
  function guarantee(o) {
    if (GOVT.includes(o.id)) return "Yes, by the Government of Pakistan";
    if (o.id === "bank" || o.id === "termdeposit") return "Insured up to Rs 10 lakh per bank";
    if (o.id === "mmf" || o.id === "immf") return "No, but very low risk";
    return '<span class="neg">No. It can go down</span>';
  }
  const MINOR_NOTE = "You are under 18. From age 13 you can open your own bank account or mobile wallet (new SBP rule, April 2026). For shares, a parent or guardian can open a \"minor account\" in your name (allowed since November 2025). For most other options here, a parent or guardian invests for you until you turn 18.";

  const horizonLabel = { 0.5: "within a year", 2: "in 1-3 years", 4: "in 3-5 years", 7: "in 5+ years" };

  // Colour by bucket: safe homes in teal tones, growth blue, gold marigold, REIT coral.
  function colorsFor(lines) {
    let s = 0;
    return lines.map((l) => (l.opt.bucket === "safe" ? `var(--m-safe-${Math.min(s++, 2)})` : `var(--m-${l.opt.bucket})`));
  }

  function donut(lines, colors, amount) {
    const R = 80, C = 2 * Math.PI * R, GAP = lines.length > 1 ? 3 : 0;
    let off = 0;
    const segs = lines.map((l, i) => {
      const len = (l.share / 100) * C;
      const seg = `<circle class="seg" r="${R}" cx="110" cy="110" style="stroke:${colors[i]};--len:${Math.max(len - GAP, 0.5)};--c:${C};--i:${i}" stroke-dasharray="${Math.max(len - GAP, 0.5)} ${C}" stroke-dashoffset="${-off}"/>`;
      off += len;
      return seg;
    }).join("");
    const label = "Split: " + lines.map((l) => `${l.opt.name} ${Math.round(l.share)}%`).join(", ");
    return `<svg class="donut" viewBox="0 0 220 220" role="img" aria-label="${esc(label)}">
      <circle r="${R}" cx="110" cy="110" class="donut-base"/>
      <g transform="rotate(-90 110 110)">${segs}</g>
      <text x="110" y="104" text-anchor="middle" class="donut-big">${esc(short(amount))}</text>
      <text x="110" y="128" text-anchor="middle" class="donut-small">${lines.length === 1 ? "one option" : `${lines.length} options`}</text>
    </svg>`;
  }

  // Growth vs inflation chart, drawn from the engine's own rates.
  let lastChart = null;
  function growthSeries(p, r) {
    const yrs = r.years;
    const steps = yrs <= 1 ? [0, 0.25, 0.5, 0.75, 1] : Array.from({ length: Math.round(yrs) + 1 }, (_, i) => i);
    const at = (rate) => steps.map((t) => r.valueAt(rate, t));
    return {
      steps,
      nominal: at(r.netRate),
      low: r.usesAssumption ? at(r.netLow) : null,
      high: r.usesAssumption ? at(r.netHigh) : null,
    };
  }
  function drawGrowth() {
    if (!lastChart) return;
    const { p, r } = lastChart;
    const host = $("#growth");
    const S = growthSeries(p, r);
    const W = Math.max(280, Math.round(host.clientWidth || 600));
    const H = W < 520 ? 220 : 280;
    const pad = { l: W < 520 ? 52 : 66, r: 14, t: 16, b: 30 };
    const all = [...S.nominal, ...(S.high || []), ...(S.low || [])];
    let lo = Math.min(...all), hi = Math.max(...all);
    const span = hi - lo || hi * 0.1;
    lo -= span * 0.08; hi += span * 0.08;
    const last = S.steps[S.steps.length - 1];
    const x = (t) => pad.l + (t / last) * (W - pad.l - pad.r);
    const y = (v) => pad.t + (1 - (v - lo) / (hi - lo)) * (H - pad.t - pad.b);
    const path = (arr) => arr.map((v, i) => `${i ? "L" : "M"}${x(S.steps[i]).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
    const ticks = Array.from({ length: 4 }, (_, i) => lo + ((hi - lo) * (i + 0.5)) / 4);
    const xt = S.steps.filter((t, i) => last <= 1 ? i % 2 === 0 : (S.steps.length <= 6 || i % 2 === 0 || i === S.steps.length - 1));
    const xl = (t) => (t === 0 ? "Today" : last <= 1 ? `${Math.round(t * 12)} mo` : `Yr ${t}`);
    const band = S.high ? `<path class="g-band" d="${path(S.high)} ${S.low.slice().reverse().map((v, j) => `L${x(S.steps[S.steps.length - 1 - j]).toFixed(1)} ${y(v).toFixed(1)}`).join(" ")} Z"/>` : "";
    host.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" aria-hidden="true" focusable="false">
      ${ticks.map((v) => `<line class="g-grid" x1="${pad.l}" x2="${W - pad.r}" y1="${y(v)}" y2="${y(v)}"/><text class="g-tick" x="${pad.l - 8}" y="${y(v) + 4}" text-anchor="end">${esc(short(v))}</text>`).join("")}
      ${xt.map((t) => `<text class="g-tick" x="${x(t)}" y="${H - 8}" text-anchor="${t === 0 ? "start" : t === last ? "end" : "middle"}">${xl(t)}</text>`).join("")}
      <line class="g-base" x1="${pad.l}" x2="${W - pad.r}" y1="${y(p.amount)}" y2="${y(p.amount)}"/>
      ${band}
      <path class="g-line g-nominal" pathLength="1" d="${path(S.nominal)}"/>
      <circle class="g-dot g-nominal-dot" cx="${x(last)}" cy="${y(S.nominal[S.nominal.length - 1])}" r="5"/>
    </svg>`;
  }
  if ("ResizeObserver" in window) {
    let w0 = 0;
    new ResizeObserver((es) => {
      const w = Math.round(es[0].contentRect.width);
      if (Math.abs(w - w0) > 8) { w0 = w; drawGrowth(); }
    }).observe($("#growth"));
  }

  // Overseas mode: what the rupee result is worth back in the saver's own currency.
  function overseasCard(p, r, yrs) {
    const c = FX[p.currency] || FX.USD;
    const y = r.years;
    const fall = OVERSEAS.rupeeFall;
    const cert = OVERSEAS.usdCert;
    const certNet = ((cert.low + cert.high) / 2) * (1 - cert.tax / 100);
    const sent = p.amount / c.rate;
    const steady = r.lumpFuture / c.rate;
    const weaker = r.lumpFuture / (c.rate * Math.pow(1 + fall / 100, y));
    const usdCert = sent * Math.pow(1 + certNet / 100, y);
    const bars = [
      ["You send today", sent, "b-today"],
      [`After ${yrs}, if the rupee holds steady`, steady, "b-steady"],
      [`After ${yrs}, if the rupee falls ${fall}% a year (its 20-year average)`, weaker, "b-fall"],
      [`After ${yrs} in a dollar Naya Pakistan Certificate instead (${pct(cert.low)}-${pct(cert.high)}, ${cert.tax}% tax)`, usdCert, "b-usd"],
    ];
    const bmax = Math.max(...bars.map((b) => b[1]));
    return `<div class="cmp-card fx-card card">
        <h3 class="card-h">${icon("i-globe")}What it is worth in ${c.name}s</h3>
        <ul class="cmp-bars">${bars.map(([label, v, cls]) => `<li class="${cls}"><span class="cmp-label">${label}</span><span class="cmp-row"><span class="cmp-bar" style="--w:${(v / bmax) * 100}%"></span><b class="num">${money(v, c)}</b></span></li>`).join("")}</ul>
        <p>Rupee rates are higher than abroad, but a falling rupee can cancel that out. Since 2023 the rupee has held steady. Over 20 years it lost about ${fall}% a year against the dollar, mostly in sudden drops (2008, 2018-19, 2022-23).</p>
        <ul class="fx-how">
          <li>A <strong>Roshan Digital Account</strong> opens online from abroad at most big Pakistani banks. From it you can buy Naya Pakistan Certificates in rupees or dollars, PSX shares and mutual funds.</li>
          <li>Naya Pakistan Certificates have a 10% final tax for everyone, so you don't need to be a filer.</li>
          <li>Send money through a bank or licensed channel, so it counts for your account and any tax filing.</li>
        </ul>
        <p class="fx-note">${c.name} rate: ${c.rate.toFixed(2)} rupees, ${c.verified ? "" : "estimate, "}${esc(c.asOf)} (${esc(c.source)}). Planner amounts stay in rupees.</p>
      </div>`;
  }

  // ---------- committee comparison ----------
  // A committee (BC) returns exactly what you pay in. Compare one year of Rs 10,000 a month
  // in a money market fund (the Islamic one if halal), which you can also withdraw in 1-2 days.
  function committeeCard(p) {
    const m = 10000;
    const fund = byId(p.halal ? "immf" : "mmf");
    const rate = Engine.afterTaxRate(fund, p);
    const i = Math.pow(1 + rate / 100, 1 / 12) - 1;
    const inFund = m * (Math.pow(1 + i, 12) - 1) / i;
    const paid = m * 12;
    return `<div class="cmp-card card committee">
        <h3 class="card-h">${icon("i-coins")}Compared with a committee</h3>
        <p>Say you pay <strong>${rs(m)} a month</strong> into a 12-month committee: you get back exactly <strong>${rs(paid)}</strong>, with no profit.</p>
        <p>The same ${rs(m)} a month in a ${esc(fund.name.toLowerCase())}${optTip(fund)} could be about <strong>${rs(inFund)}</strong> after a year, after tax. That is <strong class="pos">${rs(inFund - paid)} more</strong>, and you can take it out in 1 to 2 days.</p>
        <p class="cmp-note">A committee still helps if you need the full amount early, or if saving on your own is hard. But nothing protects your money if a member stops paying or the organiser disappears.</p>
      </div>`;
  }

  // ---------- how to start, freshness ----------
  function howLink(o) {
    const l = window.OFFICIAL[window.OPTION_LINK[o.id]];
    return l ? `<a class="how-link" href="${l.url}" target="_blank" rel="noopener">${esc(l.label)}${icon("i-external")}<span class="sr-only"> (opens in a new tab)</span></a>` : "";
  }
  function freshLine() {
    const d = daysSince(MARKET.asOf);
    const when = d <= 0 ? "today" : d === 1 ? "yesterday" : `${d} days ago`;
    return d > 45
      ? `${icon("i-alert")}<span><strong>Rates last checked ${fmtDate(MARKET.asOf)} (${when}).</strong> Some may have changed, so check the official site before you invest.</span>`
      : `${icon("i-clock")}<span>Rates last checked ${fmtDate(MARKET.asOf)} (${when}).</span>`;
  }

  // ---------- share and saved plan ----------
  // A plan is stored as a short query string, so the same string works in a shared link and in localStorage.
  const FLAGS = { halal: "hl", filer: "f", senior: "s", pensioner: "pn", overseas: "o", minor: "m" };
  function encodePlan(p) {
    const q = new URLSearchParams({ a: Math.round(p.amount), h: p.horizon, g: p.goal });
    Object.entries(FLAGS).forEach(([k, v]) => q.set(v, p[k] ? 1 : 0));
    if (p.overseas) q.set("c", p.currency);
    return q.toString();
  }
  // Fill the form from a query string. Returns false if it doesn't hold a usable plan.
  function applyPlan(qs) {
    const q = new URLSearchParams(qs);
    const a = +q.get("a");
    if (!(a >= 10000 && a <= 1e10)) return false;
    amountInput.value = grouped(a);
    [["horizon", q.get("h")], ["goal", q.get("g")]].forEach(([name, v]) => {
      const el = form.querySelector(`input[name="${name}"][value="${CSS.escape(v || "")}"]`);
      if (el) el.checked = true;
    });
    Object.entries(FLAGS).forEach(([k, v]) => {
      const el = form.querySelector(`input[name="${k}"]`);
      if (el && q.has(v)) el.checked = q.get(v) === "1";
    });
    if (q.get("c") && [...currencySel.options].some((o) => o.value === q.get("c"))) currencySel.value = q.get("c");
    $("#fx-field").hidden = !overseasBox.checked;
    showAmountWords();
    return true;
  }
  const planUrl = (p) => `${location.origin}${location.pathname}?${encodePlan(p)}#results`;

  function setShare(p, r) {
    const url = planUrl(p);
    const top = r.lines.slice(0, 3).map((l) => `- ${l.opt.name}: ${short(l.amount)}`).join("\n");
    const yrs = `${r.years} year${r.years > 1 ? "s" : ""}`;
    const text = `I checked where to put ${rs(p.amount)} on Kahan Lagayein. It could grow about ${pct(r.netRate)} a year after tax, to about ${words(r.futureValue)} in ${yrs}.\n${top}\n\nSee the plan or make your own (free, no sign-up): ${url}`;
    $("#share-wa").href = "https://wa.me/?text=" + encodeURIComponent(text);
    $("#copy-link").dataset.url = url;
    $("#share-status").textContent = "";
  }
  $("#copy-link").addEventListener("click", async (e) => {
    const url = e.currentTarget.dataset.url;
    const status = $("#share-status");
    try {
      await navigator.clipboard.writeText(url);
      status.textContent = "Link copied. Paste it anywhere to share this plan.";
    } catch (err) {
      status.textContent = "Couldn't copy automatically. Your link: " + url;
    }
  });

  const SAVE_KEY = "kl.plan";
  function savePlan(p, r) {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify({ q: encodePlan(p), net: r.netRate, date: today() })); } catch (e) { /* storage blocked */ }
  }
  function loadPlan() {
    try { return JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (e) { return null; }
  }

  // On a return visit, say whether today's rates change the last plan.
  function showReturnNote() {
    const saved = loadPlan();
    const note = $("#return-note");
    if (!saved || !saved.q || saved.date === today() || !applyPlan(saved.q)) return;
    const p = readProfile();
    const now = Engine.plan(p).netRate;
    const diff = ((now - saved.net) / 100) * p.amount;
    const what = `your plan for ${rs(p.amount)} on ${fmtDate(saved.date)}`;
    note.innerHTML = `<p>${icon("i-clock")}<span><strong>Welcome back.</strong> ${
      Math.abs(diff) < 100
        ? `Rates haven't changed enough to matter since ${what}. It still grows about ${pct(now)} a year after tax.`
        : `Since ${what}, rates changed. It now grows about <b>${pct(now)}</b> a year after tax instead of ${pct(saved.net)}: about <b class="${diff < 0 ? "neg" : "pos"}">${rs(Math.abs(diff))} ${diff < 0 ? "less" : "more"}</b> a year.`
    }</span></p>
      <div class="return-actions"><button type="button" class="cta small" id="return-see">See my updated plan</button><button type="button" class="link-btn" id="return-forget">Forget my plan</button></div>`;
    note.hidden = false;
    $("#return-see").addEventListener("click", () => form.requestSubmit());
    $("#return-forget").addEventListener("click", () => {
      try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* storage blocked */ }
      note.hidden = true;
      $("#planner-title").setAttribute("tabindex", "-1");
      $("#planner-title").focus();
    });
  }

  function renderPlan(p, r) {
    const section = $("#results");
    section.hidden = false;
    const yrs = `${r.years} year${r.years > 1 ? "s" : ""}`;
    const n = r.lines.length;
    const colors = colorsFor(r.lines);

    $("#results-sub").textContent =
      `${rs(p.amount)} (${words(p.amount)}), needed ${horizonLabel[p.horizon]}, ${p.filer ? "filer" : "non-filer"}${p.halal ? ", halal only" : ""}. ` +
      `We assume prices rise ${pct(r.cpi)} a year (${p.horizon > 2 ? "Pakistan's 25-year average" : "the latest number"}). Anything growing slower than that is losing value.`;

    $("#statement").innerHTML =
      `<span class="num">${rs(p.amount)}</span>, split ${n === 1 ? "into one option" : `across ${n} options`}, grows about ` +
      `<b class="num">${pct(r.netRate)}</b> a year after tax. In ${yrs} it could grow to <b class="num">${words(r.futureValue)}</b>. ` +
      `${r.realRate < 0 ? `That is <b class="num neg">slower than prices are rising</b>, so it buys a bit less each year.` : `That is <b class="num">faster than prices are rising</b>.`}`;

    // KPI tiles: screen readers get the final value; the visible copy may count up (motion.js).
    const cnt = (t) => `<span class="sr-only">${t}</span><span aria-hidden="true" data-count>${t}</span>`;
    const realUp = r.realRate >= 0;
    $("#kpis").innerHTML = [
      ["kpi-main", "Grows each year, after tax", cnt(pct(r.netRate)), ""],
      [`kpi-real ${realUp ? "pos" : "neg"}`, "Compared with rising prices", cnt(signed(r.realRate)), `${icon(realUp ? "i-arrow-up" : "i-arrow-down")}<span>${realUp ? "Ahead" : "Behind"}</span>`],
      ["", `In ${yrs}`, cnt(words(r.futureValue)), ""],
      ["", `Profit in ${yrs}`, cnt(words(r.futureValue - r.putIn)), ""],
    ].map(([cls, label, val, extra]) => `<div class="kpi ${cls}"><dt>${label}</dt><dd><span class="kpi-val num">${val}</span>${extra ? `<span class="kpi-tag">${extra}</span>` : ""}</dd></div>`).join("");

    // Donut + legend
    $("#donut").innerHTML = donut(r.lines, colors, p.amount);
    $("#legend").innerHTML = r.lines.map((l, i) => `<li><span class="sw" style="background:${colors[i]}" aria-hidden="true"></span><span class="lg-name">${esc(l.opt.name)}${optTip(l.opt)}</span><span class="lg-val num">${Math.round(l.share)}%<small>${esc(short(l.amount))}</small></span></li>`).join("");

    // Growth chart + text alternative
    lastChart = { p, r };
    const S = growthSeries(p, r);
    const endIdx = S.steps.length - 1;
    $("#chart-sub").textContent = r.usesAssumption
      ? `The shaded area shows where it will likely end up (${words(r.futureLow)} to ${words(r.futureHigh)}), based on the last 20 years. The line is the middle guess.`
      : `How your money grows over ${yrs}, after tax.`;
    $("#chart-key").innerHTML = [
      ["k-nominal", `Your money after ${yrs}`, S.nominal[endIdx]],
    ].map(([cls, label, v]) => `<li class="${cls}"><span class="key-line" aria-hidden="true"></span><span>${label}</span><b class="num">${words(v)}</b></li>`).join("");
    const lab = (t) => (t === 0 ? "Today" : S.steps[endIdx] <= 1 ? `${Math.round(t * 12)} months` : `Year ${t}`);
    $("#growth-table").innerHTML = `<table><caption>Growth chart data: value over time, base case</caption>
      <thead><tr><th scope="col">When</th><th scope="col">Your money, after tax</th></tr></thead>
      <tbody>${S.steps.map((t, i) => `<tr><th scope="row">${lab(t)}</th><td>${rs(S.nominal[i])}</td></tr>`).join("")}</tbody></table>`;
    drawGrowth();

    // Before you act
    const stats = [];
    if (r.usesAssumption) stats.push(["i-calendar", `${words(r.futureLow)} to ${words(r.futureHigh)}`, `Where it will likely be in ${yrs}, based on the last 20 years`]);
    if (r.badYear < -1) stats.push(["i-trend-down", pct(r.badYear), `How much it could fall in a very bad year like 2008 (about ${words(Math.abs((p.amount * r.badYear) / 100))}). It usually comes back if you wait.`, true]);
    if (p.goal === "income" && r.monthly > 0) stats.push(["i-coins", rs(r.monthly), "What you could get each month, after tax"]);
    if (!p.filer) {
      const filerRate = Engine.plan({ ...p, filer: true }).netRate;
      stats.push(["i-receipt", rs(((filerRate - r.netRate) / 100) * p.amount), "Extra you keep each year by filing a tax return (a late return costs Rs 25,000 at most)"]);
    }
    $("#stats").innerHTML = stats.map(([ic, v, label, neg]) => `<div class="stat${neg ? " neg" : ""}"><span class="stat-ic">${icon(ic)}</span><dt>${label}</dt><dd class="num">${v}</dd></div>`).join("");
    $("#stats").hidden = !stats.length;
    const warns = (p.minor ? [MINOR_NOTE] : []).concat(r.warnings);
    $("#warnings").innerHTML = warns.map((w) => `<li>${icon("i-alert")}<span>${esc(w)}</span></li>`).join("");
    $("#warnings").hidden = !warns.length;
    $("#risks").hidden = !stats.length && !warns.length;

    // Option cards
    const access = (d) => (d <= 3 ? "In 1-3 days" : d <= 30 ? "In about a month" : "Locked in, or a fee to take it out early");
    const riskWord = ["", "Very low", "Low", "Medium", "High", "Very high"];
    $("#lines").innerHTML = r.lines
      .map((l, i) => {
        const o = l.opt;
        const real = realOf(l.netRate, r.cpi);
        const taxRate = p.filer ? o.tax.filer : o.tax.nonFiler;
        const facts = [
          ["Growth a year", `${o.assumption ? "About " : ""}${pct(l.grossRate)} before tax, <b>${pct(l.netRate)}</b> after ${taxRate}% tax${o.assumption ? ` (usually ${o.low} to ${o.high}%)` : ""}`],
          ["Guaranteed?", guarantee(o)],
          l.monthly ? ["Monthly", rs(l.monthly)] : null,
          o.worstYear ? ["Worst year so far", `<span class="neg">${o.worstYear}%</span>`] : null,
          ["Getting your money out", access(o.liquidity)],
          o.halal ? ["Halal", "Yes, Shariah-compliant"] : null,
          ["Where the number comes from", `${o.verified ? "Confirmed" : o.assumption ? "Average of the last 20 years" : "Estimate"}, ${esc(o.asOf)}`],
        ].filter(Boolean);
        const meter = Array.from({ length: 5 }, (_, k) => `<span class="${k < o.risk ? "on" : ""}"></span>`).join("");
        return `<li class="opt" style="--c:${colors[i]}">
          <div class="opt-head">
            <span class="opt-ic">${icon(OPT_ICON[o.id] || "i-coins")}</span>
            <div class="opt-name"><h4>${esc(o.name)}${optTip(o)}</h4><span class="ur" lang="ur">${o.nameUr}</span>${o.what ? `<p class="opt-what">${esc(o.what)}</p>` : ""}</div>
            <p class="opt-amt"><span class="num">${rs(l.amount)}</span><small><span class="num">${Math.round(l.share)}%</span>, ${words(l.amount)}</small></p>
          </div>
          <dl class="opt-metrics">
            <div><dt>Grows a year</dt><dd class="num">${pct(l.netRate)}</dd></div>
            <div class="${real < 0 ? "neg" : "pos"}"><dt>vs rising prices</dt><dd class="num">${icon(real < 0 ? "i-arrow-down" : "i-arrow-up")}${signed(real)}<small>${real < 0 ? "behind" : "ahead"}</small></dd></div>
            <div class="risk r${o.risk}"><dt>Risk</dt><dd><span class="meter" aria-hidden="true">${meter}</span>${riskWord[o.risk] || o.risk} <small>(${o.risk} of 5)</small></dd></div>
          </dl>
          <dl class="opt-facts">${facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl>
          ${isPreHike(o) ? `<p class="opt-flag">${icon("i-info")}<span><strong>Note:</strong> this rate was set before the 27 Oct hike and may rise.</span></p>` : ""}
          <div class="how">
            <p><strong>How to start:</strong> ${esc(o.howToBuy)}</p>
            ${howLink(o)}
          </div>
          <details class="opt-more">
            <summary>The small print${icon("i-chev-down", "ic chev")}</summary>
            <p class="note">${esc(o.note)} <span class="src">Source: ${esc(o.source)}.</span></p>
          </details>
        </li>`;
      })
      .join("");

    // How it grows
    const gain = r.futureValue - r.putIn;
    const bars = [
      ["You put in today", r.putIn, "b-today"],
      [`Your money after ${yrs}`, r.futureValue, "b-mix"],
    ];
    const bmax = Math.max(...bars.map((b) => b[1]));
    $("#compare").innerHTML =
      `<div class="cmp-card card">
        <h3 class="card-h">${icon("i-trend")}How much it can grow</h3>
        <ul class="cmp-bars">${bars.map(([label, v, cls]) => `<li class="${cls}"><span class="cmp-label">${label}</span><span class="cmp-row"><span class="cmp-bar" style="--w:${(v / bmax) * 100}%"></span><b class="num">${words(v)}</b></span></li>`).join("")}</ul>
        <p>You put in <strong>${rs(r.putIn)}</strong>. In ${yrs} it could grow to <strong>${rs(r.futureValue)}</strong>, a profit of about <strong>${words(gain)}</strong> after tax.</p>
      </div>` +
      committeeCard(p) +
      (p.overseas ? overseasCard(p, r, yrs) : "") +
      (r.usesAssumption ? `<p class="assume">${icon("i-info")}<span>Numbers for shares, gold and buildings (REITs) are <strong>averages from the last 20 years in Pakistan</strong>, not promises. Some years they fall a lot, and the result depends on when you start.</span></p>` : "");

    const tags = Community.tagsFor(p);
    const matched = Community.posts().filter((x) => x.tags.some((t) => tags.includes(t))).slice(0, 3);
    renderPosts($("#matched-posts"), matched, "h4");

    $("#fresh").innerHTML = freshLine();
    setShare(p, r);
    savePlan(p, r);

    section.focus({ preventScroll: true });
    section.scrollIntoView({ block: "start" });
    if (window.Motion) window.Motion.results(section);
  }

  // ---------- idle money ----------
  const idleForm = $("#idle-form");
  const idleInput = $("#idle-amount");
  const byId = (id) => OPTIONS.find((o) => o.id === id);
  const WHERE = { current: "in a current account", wallet: "in a wallet", cash: "as cash at home", savings: "in a bank savings account" };
  idleInput.addEventListener("input", () => {
    const n = parseAmount(idleInput.value);
    $("#idle-words").textContent = isFinite(n) && n > 0 ? words(n) : "";
  });
  idleInput.addEventListener("blur", () => {
    const n = parseAmount(idleInput.value);
    if (isFinite(n) && n > 0) idleInput.value = grouped(n);
  });

  function renderIdle() {
    const fd = new FormData(idleForm);
    const amount = parseAmount(idleInput.value);
    const err = $("#idle-error");
    if (!isFinite(amount) || amount < 1000) {
      err.hidden = false;
      idleInput.setAttribute("aria-invalid", "true");
      idleInput.setAttribute("aria-describedby", "idle-words idle-error");
      idleInput.focus();
      return;
    }
    err.hidden = true;
    idleInput.removeAttribute("aria-invalid");
    idleInput.setAttribute("aria-describedby", "idle-words");

    const years = +fd.get("years");
    const p = { horizon: years, filer: fd.has("filer"), halal: fd.has("halal") };
    const where = fd.get("where");
    const grow = (rate) => amount * Math.pow(1 + rate / 100, years);
    const nowRate = where === "savings" ? Engine.afterTaxRate(byId("bank"), p) : 0;
    const liquid = byId(p.halal ? "immf" : "mmf");
    const lock = byId(p.halal ? "sarwa" : "tbill");
    const liquidRate = Engine.afterTaxRate(liquid, p);
    const lockRate = Engine.afterTaxRate(lock, p);
    const yrs = `${years} year${years > 1 ? "s" : ""}`;
    const access = (d) => (d <= 3 ? "cash in 1-2 days" : d <= 31 ? "cash in about a month" : "cash in about 3 months");
    const nowLabel = WHERE[where][0].toUpperCase() + WHERE[where].slice(1);
    const rows = [
      [nowLabel, nowRate ? `${pct(nowRate)} a year after tax` : "no profit", grow(nowRate), "b-now"],
      [liquid.name, `about ${pct(liquidRate)} a year after tax, ${access(liquid.liquidity)}`, grow(liquidRate), "b-liquid"],
      [lock.name, `about ${pct(lockRate)} a year after tax, ${access(lock.liquidity)}`, grow(lockRate), "b-lock"],
    ];
    const extra = rows[1][2] - rows[0][2];
    const bmax = Math.max(...rows.map((x) => x[2]));
    $("#idle-result").innerHTML = `
      <h3 class="card-h">${icon("i-coins")}What ${words(amount)} could become in ${yrs}</h3>
      <p class="idle-big"><span class="num">+${rs(extra)}</span><span>more in ${p.halal ? "an Islamic" : "a"} money market fund than ${WHERE[where]}, about <strong>${rs(extra / (years * 12))}</strong> a month.</span></p>
      <ul class="cmp-bars">${rows.map(([name, sub, v, cls]) => `<li class="${cls}"><span class="cmp-label">${esc(name)}${OPTIONS.find((o) => o.name === name) ? optTip(OPTIONS.find((o) => o.name === name)) : ""} <small>(${sub})</small></span><span class="cmp-row"><span class="cmp-bar" style="--w:${(v / bmax) * 100}%"></span><b class="num">${words(v)}</b></span></li>`).join("")}</ul>
      <p class="fx-note">Prices in Pakistan rise about ${pct(MARKET.cpi.value)} a year, so money earning nothing buys less every year. Keep a few months of expenses where you can reach them instantly; the rest can move. Money market funds open in minutes with a CNIC on AMC apps (NBP Funds, UBL Funds, MCB Funds, HBL AMC). ${p.halal ? "Sarwa accounts open at a CDNS branch or on the CDNS app." : "T-bills are bought through InvestPak."}</p>`;
  }
  idleForm.addEventListener("submit", (e) => { e.preventDefault(); renderIdle(); });
  idleForm.addEventListener("change", (e) => { if (e.target !== idleInput) renderIdle(); });

  // ---------- advice board ----------
  const TAG_LABEL = { income: "Monthly income", halal: "Halal", long: "Long term", short: "Short term", property: "Property", overseas: "Overseas", senior: "60+ and pensioners", park: "Safe and ready", grow: "Growth" };
  let activeTag = "";
  function renderPosts(list, items, h = "h3") {
    list.innerHTML = items
      .map((x) => {
        const tags = x.tags.filter((t) => TAG_LABEL[t]).map((t) => `<li>${TAG_LABEL[t]}</li>`).join("");
        return `<li class="post">
        <div class="vote" role="group" aria-label="Vote on: ${esc(x.title)}">
          <button type="button" data-vote="1" data-id="${x.id}" aria-pressed="${x.myVote === 1}" aria-label="Upvote">${icon("i-chev-up")}</button>
          <span class="count num"><span class="sr-only">Score: </span>${x.votes}</span>
          <button type="button" data-vote="-1" data-id="${x.id}" aria-pressed="${x.myVote === -1}" aria-label="Downvote">${icon("i-chev-down")}</button>
        </div>
        <div class="post-body">
          <${h}>${esc(x.title)}</${h}>
          <p>${esc(x.body)}</p>
          ${tags ? `<ul class="post-tags" aria-label="For">${tags}</ul>` : ""}
          <p class="by">${icon("i-user")}<span>${esc(x.author)}${x.source ? `. <a href="${esc(x.source)}" target="_blank" rel="noopener">source<span class="sr-only"> (opens in new tab)</span></a>` : ""}</span></p>
        </div>
      </li>`;
      })
      .join("");
  }
  function renderBoard() {
    const items = Community.posts().filter((x) => !activeTag || x.tags.includes(activeTag));
    renderPosts($("#post-list"), items);
    return items.length;
  }

  document.addEventListener("click", (e) => {
    const v = e.target.closest("[data-vote]");
    if (v) {
      Community.vote(v.dataset.id, +v.dataset.vote);
      const inMatched = !!v.closest("#matched-posts");
      renderBoard();
      if (!$("#results").hidden) {
        const p = readProfile();
        const tags = Community.tagsFor(p);
        renderPosts($("#matched-posts"), Community.posts().filter((x) => x.tags.some((t) => tags.includes(t))).slice(0, 3), "h4");
      }
      // keep focus on the same control after re-render
      const scope = inMatched ? $("#matched-posts") : $("#post-list");
      const again = scope.querySelector(`[data-vote="${v.dataset.vote}"][data-id="${v.dataset.id}"]`) || document.querySelector(`[data-vote="${v.dataset.vote}"][data-id="${v.dataset.id}"]`);
      if (again) again.focus();
      return;
    }
    const f = e.target.closest(".filter");
    if (f) {
      activeTag = f.dataset.tag;
      document.querySelectorAll(".filter").forEach((b) => b.setAttribute("aria-pressed", String(b === f)));
      const count = renderBoard();
      $("#board-count").textContent = `Showing ${count} post${count === 1 ? "" : "s"}`;
    }
  });

  $("#post-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const title = $("#post-title").value.trim();
    const body = $("#post-body").value.trim();
    if (!title || !body) { (title ? $("#post-body") : $("#post-title")).focus(); return; }
    const tags = [...e.target.querySelectorAll("input[type=checkbox]:checked")].map((c) => c.value);
    Community.addPost({ title, body, tags: tags.length ? tags : ["all"] });
    e.target.reset();
    renderBoard();
    $("#board-count").textContent = "Your post was added to the board.";
  });

  // ---------- scam checker ----------
  $("#scam-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const text = $("#pitch").value.trim();
    const out = $("#scam-result");
    if (!text) { out.innerHTML = `<p class="scam-empty">${icon("i-info")}<span>Paste a message first, then press Check it.</span></p>`; return; }
    const { flags, tiers } = Community.checkPitch(text);
    out.innerHTML = flags.length
      ? `<div class="scam-out">
          <p class="scam-verdict">${icon("i-alert")}<span><strong>${flags.length} red flag${flags.length > 1 ? "s" : ""} found.</strong> Don't send money until you've checked the firm's licence (not just "registration") with SECP.</span></p>
          <ol class="flags">${flags.map((f) => `<li>${icon("i-flag")}<span>${esc(f)}</span></li>`).join("")}</ol>
          <h3 class="tier-h">If you've already paid: realistic odds</h3>
          ${tiers.map((t) => `<p class="tier">${esc(t)}</p>`).join("")}
          <h3 class="tier-h">Report fast, in this order</h3>
          <ol class="report-steps">
            <li>${icon("i-bank")}<span><b>Your bank</b> to stop or trace the transfer</span></li>
            <li>${icon("i-shield")}<span><b>NCCIA cybercrime</b></span></li>
            <li>${icon("i-building")}<span><b>SECP</b></span></li>
          </ol>
          <p class="tier">Keep screenshots and transaction IDs.</p>
        </div>`
      : `<div class="clean">${icon("i-shield")}<span>No common red flags found. That doesn't make it safe: check the company's licence with SECP and never pay into a personal account.</span></div>`;
  });

  // ---------- myths vs data ----------
  const FACTS_SHOWN = 6;
  function renderFacts() {
    $("#fact-list").innerHTML = window.FACTS.map(
      (f, i) => `<li class="fact ${f.verdict}"${i >= FACTS_SHOWN ? " hidden" : ""}>
        <p class="verdict"><span class="sr-only">Verdict: </span>${icon(f.verdict === "false" ? "i-x-circle" : "i-half-circle")}${esc(f.label)}</p>
        <h3>“${esc(f.claim)}”</h3>
        <p>${esc(f.body)}</p>
        <a class="src-link" href="${esc(f.source)}" target="_blank" rel="noopener">Source${icon("i-external")}<span class="sr-only"> for: ${esc(f.claim)} (opens in new tab)</span></a>
      </li>`
    ).join("");
    const more = $("#facts-more");
    const extra = window.FACTS.length - FACTS_SHOWN;
    if (extra > 0) {
      more.hidden = false;
      const label = (open) => (open ? `Show fewer${icon("i-chev-up")}` : `Show all ${window.FACTS.length} myths${icon("i-chev-down")}`);
      more.innerHTML = label(false);
      more.addEventListener("click", () => {
        const open = more.getAttribute("aria-expanded") !== "true";
        more.setAttribute("aria-expanded", String(open));
        more.innerHTML = label(open);
        [...$("#fact-list").children].forEach((li, i) => { if (i >= FACTS_SHOWN) li.hidden = !open; });
        if (open) $("#fact-list").children[FACTS_SHOWN].querySelector("a").focus();
      });
    }
  }

  // ---------- PSX snapshot ----------
  function renderStocks() {
    const k = MARKET.kse100;
    const g = MARKET.goldTola;
    $("#stock-stats").innerHTML = [
      [grouped(k.value), `Stock market (KSE-100) on ${k.asOf}, payouts included`, "i-trend", ""],
      [`${k.ytd}%`, "Stock market in 2026 so far", "i-calendar", "neg"],
      [`+${k.change36m}%`, "Stock market over 3 years", "i-arrow-up", "pos"],
      [`${k.drawdown2026}%`, "biggest fall in 2026, from top to bottom", "i-trend-down", "neg"],
      ["~7-8x", "price vs yearly profit (usual is about 8)", "i-percent", ""],
      [`${g.drawdownFromPeak}%`, "gold vs its Jan 2026 peak, for comparison", "i-goldbar", "neg"],
    ].map(([v, label, ic, cls]) => `<div class="mstat ${cls}"><span class="mstat-ic">${icon(ic)}</span><dt>${label}</dt><dd class="num">${v}</dd></div>`).join("");

    const chg = (x) => `<span class="chg ${x >= 0 ? "up" : "down"}">${icon(x >= 0 ? "i-arrow-up" : "i-arrow-down")}${x > 0 ? "+" : ""}${x}%</span>`;
    const maxY1 = Math.max(...window.STOCKS.map((s) => Math.abs(s.y1)));
    $("#stock-rows").innerHTML = window.STOCKS.map(
      (s) => `<tr><th scope="row">${s.t}</th><td>${esc(s.name)}</td><td>${s.sector}</td><td class="num">${s.close.toFixed(2)}</td><td class="num">${s.pe}</td>
        <td class="bar-cell"><span class="bar-wrap">${chg(s.y1)}<span class="mini-bar ${s.y1 >= 0 ? "up" : "down"}" style="--w:${(Math.abs(s.y1) / maxY1).toFixed(3)}" aria-hidden="true"></span></span></td>
        <td class="num">${chg(s.ytd)}</td><td class="num">${s.ff}%</td><td class="num">${s.yld}</td></tr>`
    ).join("");
    const maxAum = Math.max(...window.ETFS.map((e) => e.aum));
    $("#etf-rows").innerHTML = window.ETFS.map(
      (e) => `<tr><th scope="row">${e.t}</th><td>${esc(e.name)}</td><td>${esc(e.tracks)}</td><td>${e.fee}</td>
        <td class="bar-cell"><span class="bar-wrap"><span class="num">${e.aum.toFixed(2)}</span><span class="mini-bar aum" style="--w:${(e.aum / maxAum).toFixed(3)}" aria-hidden="true"></span></span></td></tr>`
    ).join("");
  }

  // ---------- install as an app ----------
  // Android/Chrome fires beforeinstallprompt, so our button opens the real install prompt.
  // iPhone Safari has no prompt, so the button shows the Share > Add to Home Screen steps.
  if ("serviceWorker" in navigator) addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  const installBtns = [...document.querySelectorAll(".install-btn")];
  const isApp = matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  let installEvt = null;
  const showInstall = (on) => installBtns.forEach((b) => { (b.closest(".install-li") || b).hidden = !on; });
  if (!isApp) {
    if (isIOS) showInstall(true);
    addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); installEvt = e; showInstall(true); });
  }
  addEventListener("appinstalled", () => { installEvt = null; showInstall(false); });
  installBtns.forEach((b) => b.addEventListener("click", async () => {
    if (installEvt) {
      closeDrawer();
      installEvt.prompt();
      const { outcome } = await installEvt.userChoice;
      installEvt = null;
      if (outcome === "accepted") showInstall(false);
    } else if (isIOS) {
      closeDrawer();
      $("#ios-dialog").showModal();
    }
  }));

  addTips();
  // A shared link opens straight on its plan; otherwise a returning visitor sees what changed.
  if (new URLSearchParams(location.search).has("a") && applyPlan(location.search)) form.requestSubmit();
  else showReturnNote();
  renderRates();
  renderIdle();
  renderFacts();
  renderStocks();
  renderBoard();
})();
