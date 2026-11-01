// Builds an educational model mix from a profile. Pure functions, no DOM.
(function () {
  const { OPTIONS, BUCKET_WEIGHTS, MARKET, TAX_RULES } = window;

  // Pick the rate for the term that fits the horizon. Short-term products are assumed
  // to be rolled over, so horizons beyond the longest term use the longest term's rate.
  function grossRate(opt, p, which = "rate") {
    if (which !== "rate" && opt[which] != null) return opt[which];
    if (!opt.terms) return opt.rate;
    const keys = Object.keys(opt.terms).map(Number).sort((a, b) => a - b);
    const fit = keys.filter((k) => k <= Math.max(p.horizon, keys[0]));
    return opt.terms[fit[fit.length - 1]];
  }

  function afterTaxRate(opt, p, which = "rate") {
    const tax = p.filer ? opt.tax.filer : opt.tax.nonFiler;
    return grossRate(opt, p, which) * (1 - tax / 100);
  }

  function eligible(opt, p) {
    if (p.halal && !opt.halal) return false;
    if (opt.eligibility === "senior" && !p.senior) return false;
    if (opt.eligibility === "pensioner" && !p.pensioner) return false;
    if (opt.eligibility === "overseas" && !p.overseas) return false;
    if (opt.minHorizon && p.horizon < opt.minHorizon) return false;
    if (p.horizon < 1 && opt.liquidity > 120) return false;
    return true;
  }

  function bucketWeights(p) {
    const w = { ...BUCKET_WEIGHTS[p.risk] };
    if (p.horizon < 1) return { safe: 100, growth: 0, gold: 0, reit: 0 };
    if (p.horizon < 3) {
      w.safe += w.reit + Math.max(0, w.growth - 10);
      w.growth = Math.min(w.growth, 10);
      w.reit = 0;
    }
    if (p.goal === "income") {
      // Income seekers need cash flow, not volatility.
      const moved = Math.round(w.growth / 2);
      w.growth -= moved;
      w.safe += moved;
    }
    if (w.growth > 0 && w.growth < 5) {
      // A sliver this small adds risk without moving the result.
      w.safe += w.growth;
      w.growth = 0;
    }
    if (p.amount < 100000) {
      // Small amounts: keep it simple, one safe home plus a little gold.
      return { safe: 90, growth: 0, gold: 10, reit: 0 };
    }
    return w;
  }

  function rankSafe(list, p) {
    return list
      .map((o) => {
        let score = afterTaxRate(o, p);
        if (p.goal === "income" && o.payout === "monthly") score += 1;
        if (p.goal === "park" && o.liquidity <= 7) score += 1;
        return { o, score };
      })
      .sort((a, b) => b.score - a.score)
      .map((x) => x.o);
  }

  function plan(p) {
    const weights = bucketWeights(p);
    const pool = OPTIONS.filter((o) => eligible(o, p));
    const lines = [];
    const warnings = [];

    // Safe bucket: ~70% in the best home, the rest in the next. Capped schemes (Behbood)
    // spill their excess down the ranking.
    const safeAmt = (p.amount * weights.safe) / 100;
    if (safeAmt > 0) {
      const ranked = rankSafe(pool.filter((o) => o.bucket === "safe" && o.min <= safeAmt * 0.3), p);
      let remaining = safeAmt;
      for (const o of ranked) {
        if (remaining < 1) break;
        const want = lines.length === 0 ? safeAmt * 0.7 : remaining;
        const amt = Math.min(want, o.max ?? Infinity);
        if (amt < want) warnings.push(`${o.name} takes at most about Rs ${(o.max / 1e5).toFixed(0)} lakh per person, so the rest goes to the next option.`);
        lines.push({ opt: o, amount: amt });
        remaining -= amt;
      }
    }

    for (const bucket of ["growth", "gold", "reit"]) {
      const amt = (p.amount * weights[bucket]) / 100;
      if (amt <= 0) continue;
      const best = pool
        .filter((o) => o.bucket === bucket && o.min <= amt)
        .sort((a, b) => afterTaxRate(b, p) - afterTaxRate(a, p))[0];
      if (best) lines.push({ opt: best, amount: amt });
      else if (lines[0]) lines[0].amount += amt; // nothing fits: fold back into safe
    }

    for (const l of lines) {
      l.share = (l.amount / p.amount) * 100;
      l.grossRate = grossRate(l.opt, p);
      l.netRate = afterTaxRate(l.opt, p);
      l.netLow = afterTaxRate(l.opt, p, "low");
      l.netHigh = afterTaxRate(l.opt, p, "high");
      l.monthly = l.opt.payout === "monthly" ? (l.amount * l.netRate) / 100 / 12 : 0;
    }

    const blend = (key) => lines.reduce((s, l) => s + l[key] * l.amount, 0) / p.amount;
    const netRate = blend("netRate");
    const netLow = blend("netLow");
    const netHigh = blend("netHigh");

    // Spot inflation for short horizons; the long-run average beyond 2 years.
    const cpi = p.horizon > 2 ? MARKET.cpiLongRun.value : MARKET.cpi.value;
    const real = (r) => ((1 + r / 100) / (1 + cpi / 100) - 1) * 100;
    const years = Math.max(p.horizon, 1);
    // Value after t years: the lump sum plus any money added at the end of each month, all at rate r.
    const addMonthly = p.monthly > 0 ? p.monthly : 0;
    const valueAt = (r, t) => {
      const i = Math.pow(1 + r / 100, 1 / 12) - 1;
      const n = Math.round(t * 12);
      return p.amount * Math.pow(1 + r / 100, t) + (addMonthly ? (i ? addMonthly * (Math.pow(1 + i, n) - 1) / i : addMonthly * n) : 0);
    };
    const grow = (r) => valueAt(r, years);
    const realRate = real(netRate);
    const idleValue = p.amount / Math.pow(1 + cpi / 100, years);
    const monthly = lines.reduce((s, l) => s + l.monthly, 0);
    const usesAssumption = lines.some((l) => l.opt.assumption);
    const unverified = lines.filter((l) => !l.opt.verified).map((l) => l.opt.name);
    // Rough bad-year loss: market lines at their worst historical year, safe lines flat.
    const badYear = lines.reduce((s, l) => s + (l.opt.worstYear || 0) * l.share / 100, 0);

    // Tax and safety warnings.
    const debtProfit = lines.filter((l) => l.opt.debt).reduce((s, l) => s + (l.amount * l.grossRate) / 100, 0);
    if (debtProfit > TAX_RULES.profitOnDebtFinalLimit) {
      warnings.push(`Your yearly profit from savings schemes, T-bills and bank deposits would be about Rs ${(debtProfit / 1e5).toFixed(1)} lakh. Above Rs 50 lakh a year, the tax cut at source is no longer the end of it: you may owe more when you file your return. Talk to a tax adviser.`);
    }
    for (const l of lines.filter((l) => l.opt.bankDeposit)) {
      if (l.amount > TAX_RULES.dpcLimit) warnings.push(`If a bank fails, only Rs 10 lakh per person per bank is insured. Split the ${l.opt.name.toLowerCase()} amount across banks.`);
      if (l.opt.id === "bank" && l.amount > TAX_RULES.minSavingsRateLimit) warnings.push("The minimum profit rate SBP makes banks pay only covers balances up to Rs 1 crore. Above that, the bank can pay less.");
    }

    return {
      weights, lines, warnings, netRate, netLow, netHigh, realRate, realLow: real(netLow), realHigh: real(netHigh),
      years, valueAt, putIn: p.amount + addMonthly * Math.round(years * 12), lumpFuture: p.amount * Math.pow(1 + netRate / 100, years),
      futureValue: grow(netRate), futureLow: grow(netLow), futureHigh: grow(netHigh),
      todayMoney: p.amount * Math.pow(1 + realRate / 100, years), idleValue, monthly, usesAssumption, unverified, cpi, badYear,
    };
  }

  window.Engine = { plan, afterTaxRate, grossRate };
})();
