// Community advice board + scam red-flag checker.
// Seed posts are SUMMARIES of advice seen repeatedly in public forums, written by us and labelled as such.
// They are not quotes from real users. Visitor posts live in localStorage until a backend exists.
(function () {
  const SEED = [
    {
      id: "s1", author: "Summary of public forums", seed: true, votes: 42,
      tags: ["senior", "income"],
      title: "Retired parents who need monthly income: Behbood first",
      body: "The most repeated answer for parents aged 60+ or widows: Behbood Savings Certificates at CDNS. Government-backed, pays every month, currently 12.96%, and no tax is deducted. Keep a few months of expenses in a money market fund for emergencies.",
      source: "https://www.reddit.com/r/FIREPakistan/comments/1vzj9h9/",
    },
    {
      id: "s2", author: "Summary of public forums", seed: true, votes: 37,
      tags: ["park", "short"],
      title: "Money needed within a year? Money market fund or T-bills",
      body: "Default answer for short-term or emergency money: a money market fund (cash back in a day) or 3 to 6-month T-bills, now buyable directly on SBP's InvestPak app. Don't put short-term money in stocks or plots.",
      source: "https://gummysearch.com/r/FIREPakistan/",
    },
    {
      id: "s3", author: "Summary of public forums", seed: true, votes: 31,
      tags: ["grow", "long"],
      title: "5+ years: monthly SIP into an index or equity fund",
      body: "Younger investors with a long horizon mostly recommend putting a fixed amount every month into a KSE-100 index fund or Islamic equity fund instead of trying to pick stocks. Expect bad years; the payoff needs time.",
      source: "https://gummysearch.com/r/FIREPakistan/",
    },
    {
      id: "s4", author: "Summary of public forums", seed: true, votes: 28,
      tags: ["halal"],
      title: "Halal-only: Islamic MMF, Sarwa Islamic, Meezan funds",
      body: "For people avoiding riba, the usual list is an Islamic money market fund, CDNS Sarwa Islamic accounts, Shariah-compliant equity funds or ETFs, Dolmen City REIT and gold. Some users argue Islamic banking is just relabelled interest, so read the structure and decide for yourself.",
      source: "https://www.pakwheels.com/forums/t/how-to-keep-your-savings-from-depreciating-make-small-investments/1604489",
    },
    {
      id: "s5", author: "Summary of public forums", seed: true, votes: 25,
      tags: ["all"],
      title: "Become a filer before you invest anything",
      body: "Non-filers pay double the tax on profit: 40% vs 20% on bank profit, 30% vs 15% on National Savings and T-bills. On Rs10 lakh in a bank at 10%, that's Rs20,000 a year lost. Filing a return on FBR's IRIS portal is the first 'investment' people recommend.",
      source: "https://download1.fbr.gov.pk/Docs/202681113864992WithholdingTaxRatesCard2027.pdf",
    },
    {
      id: "s8", author: "Summary of public forums", seed: true, votes: 35,
      tags: ["overseas"],
      title: "Coming back from abroad? Keep it liquid and keep it quiet",
      body: "The most upvoted advice to returning overseas Pakistanis: don't fund a relative's business, don't announce your savings, keep money liquid for the first year while you settle, and become a filer before you invest.",
      source: "https://www.reddit.com/r/FIREPakistan/comments/1uby4a0/",
    },
    {
      id: "s9", author: "Summary of public forums", seed: true, votes: 33,
      tags: ["all"],
      title: "A relative's 'online trading' paying 10–20% a month is a scam",
      body: "The most common loss story: a cousin or aunt collects money for forex/crypto 'trading' and pays 10–20% a month at first. Nothing legal in Pakistan pays that. Early payouts come from newer investors' money.",
      source: "https://www.reddit.com/r/FIREPakistan/comments/1vy5pc1/",
    },
    {
      id: "s10", author: "Summary of public forums", seed: true, votes: 30,
      tags: ["all", "grow"],
      title: "The usual ladder: emergency fund, MMF, ETF, a little gold",
      body: "The default answer on r/FIREPakistan: first 6 months of expenses in a money market fund, then monthly buys of a PSX ETF (e.g. MZNPETF, MIIETF), then a small slice of gold. Take MMF money out by redeeming units (15% tax), not as dividends (25%).",
      source: "https://www.reddit.com/r/FIREPakistan/comments/1wm5gpw/",
    },
    {
      id: "s6", author: "Summary of public forums", seed: true, votes: 22,
      tags: ["property"],
      title: "Plots: only if you can hold for years and verify the NOC",
      body: "Property gets split opinions. If you do buy, check the society's approval with RDA/LDA/CDA/SBCA, avoid 'files' and suspiciously cheap overseas blocks. A REIT on PSX gives property exposure with a small ticket and no plot fraud risk.",
      source: "https://propakistani.pk/2026/05/08/pakistans-biggest-real-estate-scam-42000-plot-files-sold-for-just-6000-plots/amp/",
    },
    {
      id: "s7", author: "Summary of public forums", seed: true, votes: 18,
      tags: ["all"],
      title: "Keep 10 to 25% in gold as a rupee hedge",
      body: "A common middle ground in the gold vs dollar debate: a slice in gold bars or a gold fund protects against devaluation. Avoid jewellery as an investment because making charges eat 5 to 15% upfront.",
      source: "https://www.pakwheels.com/forums/t/how-to-keep-your-savings-from-depreciating-make-small-investments/1604489",
    },
  ];

  const KEY = "kl.posts.v1";
  const VOTE_KEY = "kl.votes.v1";

  function load(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
  }
  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage blocked: ignore */ }
  }

  function posts() {
    const mine = load(KEY, []);
    const votes = load(VOTE_KEY, {});
    return [...SEED, ...mine]
      .map((p) => ({ ...p, votes: p.votes + (votes[p.id] || 0), myVote: votes[p.id] || 0 }))
      .sort((a, b) => b.votes - a.votes);
  }

  function addPost({ title, body, tags }) {
    const mine = load(KEY, []);
    mine.push({ id: "u" + Date.now(), author: "You", seed: false, votes: 0, tags, title, body, created: new Date().toISOString() });
    save(KEY, mine);
  }

  function vote(id, dir) {
    const votes = load(VOTE_KEY, {});
    votes[id] = votes[id] === dir ? 0 : dir;
    save(VOTE_KEY, votes);
  }

  // Tags that match a profile, used to surface relevant advice under the result.
  function tagsFor(p) {
    const t = ["all"];
    if (p.senior || p.pensioner) t.push("senior");
    if (p.goal === "income") t.push("income");
    if (p.goal === "park" || p.horizon < 1) t.push("park", "short");
    if (p.goal === "grow" && p.horizon >= 5) t.push("grow", "long");
    if (p.halal) t.push("halal");
    if (p.overseas) t.push("overseas");
    return t;
  }

  // tier = what enforcement has actually recovered for victims of this pattern (2020–2026 cases):
  //   online:   mass arrests, no reported refunds to victims
  //   asset:    NAB-backed partial recovery over 3–15+ years (Eden ~65%, modaraba ~7%)
  //   informal: cases stall at bail/summons; organiser often disappears
  const RED_FLAGS = [
    { tier: "online", re: /guarant(ee|eed)|pakka|fixed (monthly )?(profit|return)|100% safe|no risk/i, msg: "Promises a guaranteed or fixed return. Only government schemes like CDNS can do that. Even a licensed broker (Blink Capital, Rs446.6m, referred to FIA in Aug 2026) ran a fixed-return scheme." },
    { tier: "online", re: /(\d{1,2}(\.\d+)?)\s*%\s*(per|a|every|har)?\s*(month|monthly|mahina|mahine|week|day|din)/i, msg: "Quotes a monthly/weekly/daily % return. 5% a month is ~80% a year; nothing legitimate in Pakistan pays that. Several national cricketers reportedly lost money in an 8–9%-a-month scheme (Jan 2026)." },
    { tier: "asset", re: /double (your|the)? ?money|paisa double|dugna/i, msg: "'Double your money' is the classic Ponzi pitch. Double Shah victims got about Rs4bn back only after ~15 years." },
    { tier: "asset", re: /mudaraba|mudarabah|musharakah? (business|scheme)|halal (guaranteed )?profit|islamic (investment|scheme)/i, msg: "Religious framing is a common Ponzi cover. The modaraba scam took ~Rs31bn from ~33,000 people; the organisers were convicted, but only ~7% was recovered." },
    { tier: "online", re: /signal|vip group|forex|binary|copy trad|trading (app|platform)/i, msg: "Forex/crypto 'trading' apps and signal groups are the most common online fraud. NCCIA arrested 34 in a ~$60M Karachi ring (Dec 2025) and 149 in Faisalabad (Jul 2025); no refunds to victims have been reported." },
    { tier: "online", re: /(fee|tax|charges?) (to|before|for) withdraw|withdrawal (fee|tax)|unlock (your )?(funds|profit)/i, msg: "Asking for a 'fee' or 'tax' before you can withdraw is how fake platforms take a second payment. The Karachi ring asked victims for ~$5,000 to release funds. Stop paying." },
    { tier: "online", re: /topline|arif habib|akd|js global|meezan|official (app|group)|licensed broker/i, msg: "Scammers impersonate real brokers and AMCs. SECP warned about the fake 'TSL Wealth' app and WhatsApp group posing as Topline (Nov 2025). Only use apps linked from the firm's own website, and check the PSX/SECP broker list." },
    { tier: "online", re: /secp registered|registered with secp|registered company/i, msg: "'SECP registered' only means a company was incorporated. It does not allow it to take deposits or manage money. Ask for the specific SECP licence and check it." },
    { tier: "online", re: /refer|referral|bring (friends|members)|team bana/i, msg: "Returns tied to recruiting others is a pyramid structure." },
    { tier: "asset", re: /\bfiles?\b|booking|overseas block|pre-?launch|token money/i, msg: "Plot 'files' and pre-launch bookings: verify the society's NOC with RDA/LDA/CDA/SBCA first. Islamabad Cooperative Housing Society allegedly sold ~36,000+ files on land for ~6,000 plots (May 2026)." },
    { tier: "informal", re: /committee|\bbc\b|kameti/i, msg: "Committees (BC) have no regulator and no insurance. In Karachi's 'Committee Wali Baji' case, an organiser allegedly took ~Rs420m and went into hiding." },
    { tier: "online", re: /usdt|crypto|bitcoin|p2p|binance/i, msg: "Crypto is legal under the Virtual Assets Act 2026, but no exchange has a confirmed full PVARA licence yet (Oct 2026). P2P trading is a grey zone and banks may freeze linked accounts. Crypto returned −4% in rupees in 2025." },
    { tier: "online", re: /whatsapp|telegram|dm me|inbox/i, msg: "Deals pushed through WhatsApp/Telegram DMs skip every regulator. SECP has declared such investment groups illegal." },
    { tier: "informal", re: /influencer|youtuber|tiktok|celebrity|famous/i, msg: "Influencer promotion proves nothing. NCCIA registered cases against several influencers for promoting illegal trading apps (2025); celebrity photos are routinely misused in fake ads." },
    { tier: "online", re: /recovery (agent|service)|recover your (money|funds)|refund (agent|officer)/i, msg: "'Recovery agents' who ask for money to get your losses back are a second scam. Real agencies don't charge victims." },
    { tier: "online", re: /system (hacked|down|upgrade)|platform (shifted|renamed|migrat)/i, msg: "'System hacked' or a renamed platform is how Ponzis exit (PSlash, ~Rs5.6bn from 100,000+ people)." },
    { tier: "informal", re: /urgent|limited (seats|time)|aaj hi|last chance|jaldi/i, msg: "Pressure to act fast is a manipulation tactic." },
  ];

  const TIERS = {
    online: "Online scams: police make arrests, but no case we found returned money to victims. Treat money sent as lost; act fast to stop further payments.",
    asset: "Asset-backed schemes pursued by NAB: some money comes back, slowly (Eden Housing ~65% after ~7 years; modaraba ~7%).",
    informal: "Committees and influencer schemes: cases usually stall at bail and summons; recovery is rare.",
  };

  function checkPitch(text) {
    const hits = RED_FLAGS.filter((f) => f.re.test(text));
    const tiers = [...new Set(hits.map((f) => f.tier))].map((t) => TIERS[t]);
    return { flags: hits.map((f) => f.msg), tiers };
  }

  window.Community = { posts, addPost, vote, tagsFor, checkPitch };
})();
