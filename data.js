// Market data for Kahan Lagayein. Every figure carries its source date.
// verified: true = confirmed in a dated 2026 source; false = estimate / unconfirmed / single source.
// Full sourcing: reports/Pakistan retail investment deep dive.md
// Update this file when rates change (CDNS revisions, SBP MPC meetings, T-bill auctions, MUFAP monthly).

window.MARKET = {
  asOf: "2026-10-30",
  policyRate: { value: 12.0, asOf: "2026-10-27", source: "SBP Monetary Policy Statement", verified: true },
  hikeDate: "2026-10-27", // rates set before this may reprice upward
  cpi: { value: 10.3, fy26Avg: 7.05, asOf: "Sep 2026", source: "PBS / IMF", verified: true },
  cpiLongRun: { value: 9.3, asOf: "2000–2025 avg", source: "World Bank / MoneyInRealTerms", verified: true },
  usdPkr: { value: 276.8, end2023: 281.86, asOf: "2026-10-27", source: "SBP interbank", verified: true },
  // KSE-100 is a total-return index (dividends reinvested).
  kse100: {
    value: 166409, change12m: 3.0, ytd: -4.4, change36m: 220, cagr20y: 15.6,
    peak: 189167, drawdownFromPeak: -12, drawdown2026: -24.6, recordDayFall: -9.57, recordDayFallDate: "2026-03-02",
    isTotalReturn: true, asOf: "2026-10-30", source: "PSX data portal", verified: true,
  },
  kmi30: { value: 237972, asOf: "2026-10-30", source: "PSX data portal", verified: true },
  // Shown under "Today's numbers". Newest first; add a line whenever a rate in this file changes.
  changes: [
    { date: "2026-10-28", text: "New T-bill rates from the latest government sale: 12.42% for 3 months to 12.89% for 1 year." },
    { date: "2026-10-27", text: "SBP raised the central bank rate to 12%. Bank and fund rates may go up in the coming weeks." },
    { date: "2026-10-21", text: "National Savings changed its rates. Behbood and the Pensioners' account now pay 12.96%." },
  ],
  goldTola: { value: 420536, peak: 551662, peakDate: "2026-01-28", drawdownFromPeak: -24, asOf: "2026-10-30", source: "Business Recorder / Aaj", verified: true },
};

// Tax rules (Finance Act 2026, TY2027), used for warnings.
window.TAX_RULES = {
  profitOnDebtFinalLimit: 5000000, // above Rs5m/yr profit on debt, withholding stops being final -> slab rates
  dpcLimit: 1000000,               // deposit insurance per depositor per bank
  minSavingsRateLimit: 10000000,   // SBP minimum savings rate covers balances up to Rs10m
  lateFilerSurcharge: 25000,
};

// bucket: safe | growth | gold | reit
// rate: expected gross annual return %. For market assets this is a long-run ASSUMPTION (base case).
// low/high: plausible long-run range for assumption-based assets.
// terms: { years: rate } when the rate depends on how long you lock in; the engine picks by horizon.
// tax: % on profit for filer / non-filer (withholding or final, whichever the user actually bears).
// risk: 1 (capital safe) .. 5 (can lose a lot)
// liquidity: days to get cash back without heavy penalty (approx)
window.OPTIONS = [
  {
    id: "behbood", bucket: "safe", name: "Behbood Savings Certificate", nameUr: "بہبود سیونگ سرٹیفکیٹ",
    what: "A government savings scheme only for people aged 60+, widows and disabled people. You put money in, and the government pays you profit every month.",
    rate: 12.96, payout: "monthly", risk: 1, liquidity: 30, min: 5000, max: 7500000,
    halal: false, eligibility: "senior", debt: true,
    tax: { filer: 5, nonFiler: 5 },
    howToBuy: "Any National Savings (CDNS) branch, or the CDNS app. Bring your CNIC and proof of age, that you are a widow, or of disability.",
    note: "For people aged 60+, widows, disabled people, or parents of a disabled child. No tax is cut when profit is paid, and at most 5% of the profit is due when you file your return, so we use 5% to be safe. One source says more tax applies, so check your CDNS statement. You can put in up to about Rs 75 lakh.",
    source: "CDNS revision 21 Oct 2026; tax: Second Schedule cl. 6", asOf: "2026-10-21", verified: true,
  },
  {
    id: "pensioners", bucket: "safe", name: "Pensioners' Benefit Account", nameUr: "پنشنرز بینیفٹ اکاؤنٹ",
    what: "A government savings account only for retired people. You put money in, and the government pays you profit every month.",
    rate: 12.96, payout: "monthly", risk: 1, liquidity: 30, min: 10000, max: 7500000,
    halal: false, eligibility: "pensioner", debt: true,
    tax: { filer: 5, nonFiler: 5 },
    howToBuy: "Any CDNS branch. Bring your pension book or proof that you have retired.",
    note: "For people retired from a government or private job. Same tax as Behbood: nothing cut when profit is paid, at most 5% due in your return.",
    source: "CDNS revision 21 Oct 2026", asOf: "2026-10-21", verified: true,
  },
  {
    id: "tbill", bucket: "safe", name: "T-bills (lend to the government)", nameUr: "ٹریژری بلز (انویسٹ پاک)",
    what: "A T-bill (Treasury bill) is a short loan you give to the Government of Pakistan. After 3, 6 or 12 months, the government pays you back with profit.",
    rate: 12.89, terms: { 0.25: 12.42, 0.5: 12.65, 1: 12.89 }, payout: "maturity", risk: 1, liquidity: 90, min: 5000,
    halal: false, eligibility: "all", debt: true,
    tax: { filer: 15, nonFiler: 30 },
    howToBuy: "On InvestPak, SBP's own app and website. You lend money to the government for 3, 6 or 12 months, from Rs 5,000, paid from your bank or mobile wallet.",
    note: "Rates from the 28 Oct 2026 sale, reported by one news site, so check SBP's result. When it ends, you can buy again for longer goals. If you sell before the end date, 20% tax applies.",
    source: "Daily Times, T-bill auction 28 Oct 2026", asOf: "2026-10-28", verified: false,
  },
  {
    id: "ric", bucket: "safe", name: "Regular Income Certificate", nameUr: "ریگولر انکم سرٹیفکیٹ",
    what: "A government savings certificate that lasts 5 years. You put money in once, and get profit every month.",
    rate: 12.12, payout: "monthly", risk: 1, liquidity: 365, min: 50000, minHorizon: 3,
    halal: false, eligibility: "all", debt: true,
    tax: { filer: 15, nonFiler: 30 },
    howToBuy: "CDNS branch or app. Pays about Rs 1,010 a month for every Rs 1 lakh, before tax.",
    note: "Lasts 5 years. If you take money out early, you lose some profit.",
    source: "CDNS revision 21 Oct 2026", asOf: "2026-10-21", verified: true,
  },
  {
    id: "ssc", bucket: "safe", name: "Special Savings Certificate", nameUr: "اسپیشل سیونگ سرٹیفکیٹ",
    what: "A government savings certificate that lasts 3 years. You put money in once, and get profit every 6 months.",
    rate: 12.13, payout: "6-monthly", risk: 1, liquidity: 365, min: 500, minHorizon: 3,
    halal: false, eligibility: "all", debt: true,
    tax: { filer: 15, nonFiler: 30 },
    howToBuy: "CDNS branch or app. Lasts 3 years, pays profit every 6 months.",
    note: "Pays 12% for the first five payments and 12.8% on the last, about 12.13% on average.",
    source: "CDNS revision 21 Oct 2026", asOf: "2026-10-21", verified: true,
  },
  {
    id: "dsc", bucket: "safe", name: "Defence Savings Certificate (10-yr)", nameUr: "ڈیفنس سیونگ سرٹیفکیٹ",
    what: "A government savings certificate that lasts 10 years. You get nothing until the end, but the profit keeps adding up, so the final amount is big.",
    rate: 12.15, payout: "maturity", risk: 1, liquidity: 365, min: 500, minHorizon: 5,
    halal: false, eligibility: "all", debt: true,
    tax: { filer: 15, nonFiler: 30 },
    howToBuy: "CDNS branch or app. Profit is added back in and grows: Rs 1 lakh becomes about Rs 3.15 lakh after 10 years.",
    note: "Best for money you won't touch for years. Taking it out early lowers the profit.",
    source: "CDNS revision 21 Oct 2026", asOf: "2026-10-21", verified: true,
  },
  {
    id: "stsc", bucket: "safe", name: "Short Term Savings Certificate", nameUr: "شارٹ ٹرم سیونگ سرٹیفکیٹ",
    what: "A short government savings certificate. You put money in for 3, 6 or 12 months and get it back with profit at the end.",
    rate: 11.72, terms: { 0.25: 11.12, 0.5: 11.5, 1: 11.72 }, payout: "maturity", risk: 1, liquidity: 90, min: 10000,
    halal: false, eligibility: "all", debt: true,
    tax: { filer: 15, nonFiler: 30 },
    howToBuy: "CDNS branch or app. Choose 3, 6 or 12 months.",
    note: "Pays about 1% a year less than a T-bill for the same time.",
    source: "CDNS revision 21 Oct 2026", asOf: "2026-10-21", verified: true,
  },
  {
    id: "sarwa", bucket: "safe", name: "Sarwa Islamic Term Account", nameUr: "سروا اسلامک ٹرم اکاؤنٹ",
    what: "An Islamic savings account run by the government (National Savings). It follows Shariah rules and lasts 1, 3 or 5 years.",
    rate: 12.12, terms: { 1: 11.84, 3: 12.1, 5: 12.12 }, payout: "monthly", risk: 1, liquidity: 30, min: 10000,
    halal: true, eligibility: "all", debt: true,
    tax: { filer: 15, nonFiler: 30 },
    howToBuy: "CDNS branch or app. An Islamic (Shariah-compliant) government scheme for 1, 3 or 5 years.",
    note: "The National Savings option most people choose when they want to avoid interest (riba).",
    source: "CDNS revision 21 Oct 2026", asOf: "2026-10-21", verified: true,
  },
  {
    id: "npc", bucket: "safe", name: "Naya Pakistan Certificate (PKR)", nameUr: "نیا پاکستان سرٹیفکیٹ",
    what: "A savings certificate from the government, only for Pakistanis living abroad. You buy it through a Roshan Digital Account.",
    rate: 12.25, terms: { 0.25: 11.75, 0.5: 12.0, 1: 12.25, 3: 12.5, 5: 12.75 }, payout: "maturity", risk: 1, liquidity: 90, min: 10000,
    halal: false, eligibility: "overseas", debt: true,
    tax: { filer: 10, nonFiler: 10 },
    howToBuy: "Through a Roshan Digital Account at a Pakistani bank, opened online from abroad. Dollar certificates pay 6.75 to 7.75%.",
    note: "Only for Pakistanis living abroad. Everyone pays 10% tax, filer or not. Rates were set in June 2026, before the latest rate rise.",
    source: "SBP NPC page", asOf: "2026-06-05", verified: true,
  },
  {
    id: "mmf", bucket: "safe", name: "Money market fund", nameUr: "منی مارکیٹ فنڈ",
    what: "A money market fund collects money from many people and lends it safely to the government and banks. You can take your money out in 1 to 2 days.",
    rate: 10.5, payout: "anytime", risk: 1, liquidity: 2, min: 500,
    halal: false, eligibility: "all", debt: false,
    tax: { filer: 15, nonFiler: 30 },
    howToBuy: "On fund company apps: NBP Funds, UBL Funds, ABL Funds Invest, MCB Funds, HBL AMC. Opens in minutes with your CNIC.",
    note: "A very safe fund that lends to the government and banks. Your cash is back in 1 working day. When you take money out, sell units (15% tax) instead of taking a payout (25% tax for filers, 50% for non-filers). The rate is what the top funds paid over the last year (10.46 to 10.81%, Sep 2026).",
    source: "MUFAP data via aggregator", asOf: "2026-09-09", verified: false,
  },
  {
    id: "immf", bucket: "safe", name: "Islamic Money Market Fund", nameUr: "اسلامک منی مارکیٹ فنڈ",
    what: "The Islamic version of a money market fund. It collects money from many people and invests it in safe, Shariah-compliant places. You can take money out in 1 to 2 days.",
    rate: 10.15, payout: "anytime", risk: 1, liquidity: 2, min: 500,
    halal: true, eligibility: "all", debt: false,
    tax: { filer: 15, nonFiler: 30 },
    howToBuy: "On apps like Al Meezan (Meezan Rozana Amdani), Mahaana, Alhamra (MCB) or Al-Ameen (UBL).",
    note: "The Islamic version of a money market fund. Meezan Rozana Amdani has paid 10.15% a year since July (28 Oct), and charges a 1.10% yearly fee. Sell units to take money out instead of taking payouts.",
    source: "Al Meezan fund page", asOf: "2026-10-28", verified: true,
  },
  {
    id: "bank", bucket: "safe", name: "Bank savings account", nameUr: "بینک سیونگ اکاؤنٹ",
    what: "A normal bank account that pays you a small profit every month on the money you keep in it.",
    rate: 10.0, payout: "monthly", risk: 1, liquidity: 1, min: 0,
    halal: false, eligibility: "all", debt: true, bankDeposit: true, preHike: true,
    tax: { filer: 20, nonFiler: 40 },
    howToBuy: "Any bank. Most pay only the lowest rate SBP allows.",
    note: "Bank profit is taxed more than National Savings: 20% for filers, 40% for non-filers. The lowest rate banks must pay may rise to 10.5% from 1 Nov (not confirmed), and only covers up to Rs 1 crore. If a bank fails, up to Rs 10 lakh per person per bank is insured.",
    source: "SBP minimum savings rule; FBR rate card 2027", asOf: "2026-10-27", verified: true,
  },
  {
    id: "termdeposit", bucket: "safe", name: "Bank term deposit", nameUr: "بینک ٹرم ڈپازٹ",
    what: "You leave a fixed amount in a bank for a set time, like 1 year, and the bank pays you a set profit.",
    rate: 7.1, payout: "maturity", risk: 1, liquidity: 365, min: 25000,
    halal: false, eligibility: "all", debt: true, bankDeposit: true,
    tax: { filer: 20, nonFiler: 40 },
    howToBuy: "Any bank branch. You leave money for a fixed time.",
    note: "Big banks pay much less on these (MCB 6.6 to 7.1%) than T-bills or National Savings for the same time. Shown so you can see why it usually earns less.",
    source: "MCB published rates", asOf: "Oct 2026", verified: false,
  },
  {
    id: "equityfund", bucket: "growth", name: "Whole stock market fund (KSE-100 ETF)", nameUr: "انڈیکس فنڈ / ای ٹی ایف",
    what: "One fund that owns a small piece of the 100 biggest companies on the Pakistan Stock Exchange. When those companies do well, it goes up; when they do badly, it goes down.",
    rate: 14, low: 9, high: 18, worstYear: -58, recoveryYears: 6.5,
    payout: "maturity", risk: 4, liquidity: 3, min: 1000, minHorizon: 3,
    halal: false, eligibility: "all", debt: false,
    tax: { filer: 15, nonFiler: 30 },
    howToBuy: "Buy an ETF that follows the KSE-100 on a PSX broker app (Finqalab, KTrade, AKD Trade), or an index fund on a fund company app.",
    note: "Based on the past: the KSE-100 (the 100 biggest PSX companies) grew about 15.6% a year over 20 years, payouts included. But it fell 58% in 2008, took 6.5 years to get back to its 2017 high, and fell about 25% from top to bottom in 2026. Only put in money you can leave for 5+ years. Filers pay 15% tax on gains; non-filers pay 30% or more, and you must be a filer both when you buy and when you sell.",
    source: "Topline 30y study; KSE-100 annual closes", asOf: "2026-10-28", verified: false, assumption: true,
  },
  {
    id: "iequityfund", bucket: "growth", name: "Islamic stock market fund (ETF)", nameUr: "اسلامک ایکویٹی فنڈ",
    what: "One fund that owns a small piece of many Islamic (Shariah-compliant) companies on the Pakistan Stock Exchange. It goes up and down with them.",
    rate: 13.5, low: 8.5, high: 17.5, worstYear: -58, recoveryYears: 6.5,
    payout: "maturity", risk: 4, liquidity: 3, min: 1000, minHorizon: 3,
    halal: true, eligibility: "all", debt: false,
    tax: { filer: 15, nonFiler: 30 },
    howToBuy: "Meezan Pakistan ETF (MZNPETF) or Mahaana Islamic Index ETF (MIIETF) through a broker app, or Meezan Islamic Fund / Alhamra Islamic Stock Fund on fund company apps.",
    note: "Same idea as the KSE-100 fund, but only Islamic companies, minus about 0.5% a year in fees. Funds run by a manager rarely beat the simple index after fees: Meezan Islamic Fund made 33.0% in FY26 while its index made 39.2%. Manager fees can be up to 3% a year. Few people trade ETFs each day, so set the highest price you'll pay (a \"limit order\") when buying.",
    source: "Assumption from KSE-100 history; fees from HalalWallet", asOf: "Oct 2026", verified: false, assumption: true,
  },
  {
    id: "gold", bucket: "gold", name: "Gold (bars or gold fund)", nameUr: "سونا",
    what: "Buying real gold bars, or a fund that holds gold for you. Gold often goes up when the rupee gets weaker, but it pays no monthly profit.",
    rate: 12, low: 8, high: 19, worstYear: -17,
    payout: "maturity", risk: 3, liquidity: 3, min: 10000,
    halal: true, eligibility: "all", debt: false,
    tax: { filer: 15, nonFiler: 15 },
    howToBuy: "Bars from a trusted sarafa (gold dealer), and keep the receipt. Or a gold fund on a fund company app, so you don't have to keep gold at home.",
    note: "Based on the past: world gold prices plus the rupee falling about 8% a year. Gold grew about 19.5% a year in rupees over 20 years and +73% in 2025, but it fell 3 years in a row in 2013-15 and is about 24% below its Jan 2026 high of Rs 5.5 lakh a tola. PMEX (a regulated exchange) lets you buy tiny amounts of gold from 0.001 tola. Tax on gold profit is not confirmed (we assume 15%). Jewellery loses 5 to 15% to making charges.",
    source: "Gold per-tola history; Sarafa price 27 Oct 2026", asOf: "2026-10-27", verified: false, assumption: true,
  },
  {
    id: "reit", bucket: "reit", name: "Shares in big buildings (REIT)", nameUr: "ریٹ (رئیل اسٹیٹ فنڈ)",
    what: "A REIT is a fund that owns big buildings, like malls and offices. You buy a small share of it on PSX, like a normal share, and get part of the rent.",
    rate: 12, low: 6, high: 15,
    payout: "dividends", risk: 3, liquidity: 3, min: 5000, minHorizon: 3,
    halal: true, eligibility: "all", debt: false,
    tax: { filer: 15, nonFiler: 30 },
    howToBuy: "Buy through any PSX broker app. Dolmen City REIT is Islamic (Shariah-compliant) and pays a share of rent as profit.",
    note: "A REIT lets you own a small part of big buildings, like malls, without buying a plot or risking plot fraud. The growth number is a guess, not confirmed. For comparison, plots grew about 10% a year over 10 years, about the same as prices, before about 4% tax each time you buy and sell.",
    source: "Assumption; Zameen index via Profit", asOf: "Oct 2026", verified: false, assumption: true,
  },
];

// Share of the amount per bucket, by risk appetite.
window.BUCKET_WEIGHTS = {
  low:    { safe: 85, growth: 5,  gold: 10, reit: 0 },
  medium: { safe: 60, growth: 25, gold: 10, reit: 5 },
  high:   { safe: 30, growth: 55, gold: 10, reit: 5 },
  max:    { safe: 0,  growth: 85, gold: 10, reit: 5 }, // "growth plan": only when someone asks for it
};

// Overseas mode: PKR per unit of each currency. AED and SAR are pegged to the dollar
// (3.6725 and 3.75), so they follow USD/PKR exactly. GBP is an older estimate.
window.FX = {
  USD: { rate: 276.8, sym: "$", name: "US dollar", asOf: "2026-10-27", source: "SBP interbank", verified: true },
  AED: { rate: 276.8 / 3.6725, sym: "AED ", name: "UAE dirham", asOf: "2026-10-27", source: "USD/PKR via the dirham peg", verified: true },
  SAR: { rate: 276.8 / 3.75, sym: "SAR ", name: "Saudi riyal", asOf: "2026-10-27", source: "USD/PKR via the riyal peg", verified: true },
  GBP: { rate: 373, sym: "£", name: "British pound", asOf: "May 2026", source: "ARY News interbank report", verified: false },
};
window.OVERSEAS = {
  rupeeFall: 8,                                   // ~8%/yr average fall vs USD over 20 years (see FACTS)
  usdCert: { low: 6.75, high: 7.75, tax: 10 },    // USD Naya Pakistan Certificates, SBP NPC page, Jun 2026
};

// Official pages for "How to start". Each one was opened and checked on 2026-11-01.
window.OFFICIAL = {
  cdns: { url: "https://savings.gov.pk", label: "National Savings (CDNS) website" },
  investpak: { url: "https://investpak.sbp.org.pk", label: "InvestPak, run by SBP" },
  rda: { url: "https://www.sbp.org.pk/our-operations/roshan-digital-accounts", label: "Roshan Digital Account (SBP)" },
  mufap: { url: "https://www.mufap.com.pk", label: "List of licensed funds (MUFAP)" },
  psx: { url: "https://www.psx.com.pk", label: "Pakistan Stock Exchange" },
};
window.OPTION_LINK = {
  behbood: "cdns", pensioners: "cdns", ric: "cdns", ssc: "cdns", dsc: "cdns", stsc: "cdns", sarwa: "cdns",
  tbill: "investpak", npc: "rda", mmf: "mufap", immf: "mufap", equityfund: "psx", iequityfund: "psx", reit: "psx",
};
