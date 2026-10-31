// Evidence content: crowd claims fact-checked, and factual PSX/ETF snapshots.
// Source: reports/Pakistan investing crowd claims vs proof.md (30 Oct 2026).
// Stocks and ETFs are shown as facts only: never ranked, never recommended.

window.FACTS = [
  {
    claim: "The dollar always goes up", verdict: "false", label: "Not true since 2023",
    body: "1 dollar was Rs 281.86 at the end of 2023 and Rs 276.80 on 27 Oct 2026, so it went down. Safe government T-bills paid 12 to 20% a year in that time. Over 20 years the dollar did rise (about 8% a year), but in sudden jumps (2008, 2018-19, 2022-23), not every year.",
    source: "https://propakistani.pk/2023/12/29/rupee-ends-2023-with-13th-straight-gain-against-us-dollar/",
  },
  {
    claim: "Plots beat PSX", verdict: "false", label: "Not true in 2024–25",
    body: "In 2025, DHA plots went up about 15 to 18%, while the stock market (KSE-100) went up 51%. Plots also cost a filer about 4% in tax each time you buy and sell (non-filers about 22%), and can take months to sell.",
    source: "https://propakistani.pk/2025/12/29/these-were-the-top-performing-assets-in-pakistan-in-2025/amp/",
  },
  {
    claim: "Property never goes down", verdict: "false", label: "Not true",
    body: "Karachi house prices rose slower than everyday prices every year from 2019 to 2023, so houses really lost about 30% of their value. Lahore house prices were 7% lower in Feb 2026 than a year before. These numbers use asking prices, so real falls were probably bigger.",
    source: "https://www.globalpropertyguide.com/asia/pakistan/home-price-trends",
  },
  {
    claim: "Gold only goes up", verdict: "partly", label: "Partly true",
    body: "Gold was the best thing to own in 2025 (+73%) and is about 7.5 times its 2018 price. But it hit Rs 5.5 lakh a tola on 28 Jan 2026 and is about 24% lower now (Rs 4.2 lakh). Gold pays nothing while you hold it, and jewellery loses 5 to 15% to making charges.",
    source: "https://english.aaj.tv/news/amp/330451590",
  },
  {
    claim: "Bank deposits are safe at any amount", verdict: "false", label: "Not true above Rs 10 lakh",
    body: "If a bank fails, only Rs 10 lakh per person per bank is insured (your normal and Islamic accounts at the same bank count together). If you have more, split it across banks.",
    source: "https://dpc.org.pk/Circulars/2024/CL3.pdf",
  },
  {
    claim: "You need lakhs to start on PSX", verdict: "false", label: "Not true",
    body: "There is no minimum. A Sahulat account opens with just your CNIC. Its Rs 30 lakh limit is the most you can put in, not the least. ETFs and funds start from about Rs 500 to 1,000.",
    source: "https://www.psx.com.pk/psx/resources-and-tools/investors/sahulat-account",
  },
  {
    claim: "Crypto is banned in Pakistan", verdict: "false", label: "Not banned, but no licensed app yet",
    body: "A 2026 law (the Virtual Assets Act) made crypto legal, with a new regulator called PVARA, and banks may serve licensed crypto firms from 14 Apr 2026. But as of Oct 2026 no exchange has a confirmed full licence, and the tax on crypto profit is not confirmed.",
    source: "https://taxtoday.pk/sbp-ends-crypto-bank-ban-pvara-virtual-assets-act-2026/",
  },
  {
    claim: "Behbood is tax-free", verdict: "partly", label: "Mostly true",
    body: "No tax is cut from Behbood or the Pensioners' account when profit is paid, and at most 5% of the profit is due in your tax return. One report says 15 to 30% applies, so check your CDNS statement.",
    source: "https://www.brecorder.com/news/amp/40252961",
  },
  {
    claim: "Safe options at 8–10% beat inflation", verdict: "partly", label: "Not right now",
    body: "In FY25 a money market fund paid about 11% while prices rose 4.5%, so it was ahead. Now prices are rising 10.3% a year. After tax, a money market fund is about 1% behind rising prices, and a bank savings account about 2% behind. Only Behbood (2% ahead) and T-bills (just ahead) stay in front.",
    source: "https://www.imf.org/en/news/articles/2026/10/07/pr26326-pakistan-imf-complete-2026-aiv-consultation-reaches-sla-on-4th-review-eff-3rd-review-for-rsf",
  },
  {
    claim: "Non-filers just pay a little more", verdict: "false", label: "No: double or worse",
    body: "Non-filers pay 40% tax on bank profit (filers 20%), 30% on National Savings and T-bills (filers 15%), and 10.5 to 18.5% when buying property (filers 1.25%). Filing a late tax return costs Rs 25,000 at most.",
    source: "https://download1.fbr.gov.pk/Docs/202681113864992WithholdingTaxRatesCard2027.pdf",
  },
  {
    claim: "Brokers know where the index is going", verdict: "false", label: "Not true",
    body: "Brokers guessed the stock market would reach 81,000 by Dec 2024; it reached 115,127. They guessed 203,000 to 264,000 for Dec 2026; it was 166,409 on 30 Oct. Treat their targets as feelings, not facts.",
    source: "https://propakistani.pk/2023/12/05/kse-100-index-expected-to-hit-81000-level-by-december-2024/",
  },
  {
    claim: "Dividend blue chips are safe", verdict: "false", label: "Mixed",
    body: "Of 12 big companies that pay a yearly share of profit, 6 went up and 6 went down last year, from Meezan Bank (+24%) to Systems Ltd (−26%). One company's shares are never fully safe, even if it pays well.",
    source: "https://dps.psx.com.pk/company/SYS",
  },
  {
    claim: "Active funds beat the market", verdict: "false", label: "Mostly not true",
    body: "Meezan Islamic Fund, the biggest of its kind, made 33.0% in FY26, while the simple Islamic index it tries to beat made 39.2%. Studies of Pakistani funds from 1995 to 2019 found the same. Fees of up to 3% a year are the main reason.",
    source: "https://dps.psx.com.pk/download/document/283997.pdf",
  },
  {
    claim: "Committees are safer than banks", verdict: "false", label: "Not true",
    body: "Committees (BC) have no one watching them and no insurance. In Karachi, one organiser is accused of taking about Rs 42 crore from hundreds of women and going into hiding.",
    source: "https://www.geo.tv/latest/457106-alleged-committee-scammer-sidra-humaid-goes-into-hiding",
  },
  {
    claim: "Buying dollars is unrestricted", verdict: "false", label: "Not true",
    body: "A money exchange can sell one person at most $10,000 a day and $100,000 a year. Buying more than $500 in cash needs a fingerprint check and a reason. Dollars for a dollar account must move bank to bank.",
    source: "https://www.dawn.com/news/1955348",
  },
];

// Factual snapshot, PSX data portal close of 30 Oct 2026. Price changes exclude dividends.
window.STOCKS = [
  { t: "MEBL", name: "Meezan Bank", sector: "Bank", close: 526.15, pe: 9.9, y1: 24.2, ytd: 19.0, ff: 25, yld: "~5.7%" },
  { t: "OGDC", name: "Oil & Gas Development Co.", sector: "E&P", close: 306.47, pe: 5.4, y1: 20.9, ytd: 9.1, ff: 15, yld: "~4.3%" },
  { t: "FFC", name: "Fauji Fertilizer", sector: "Fertilizer", close: 559.07, pe: 10.0, y1: 17.4, ytd: -5.3, ff: 55, yld: "~7–7.7%" },
  { t: "PPL", name: "Pakistan Petroleum", sector: "E&P", close: 213.78, pe: 5.6, y1: 17.0, ytd: -9.2, ff: 24.6, yld: "~4.3%" },
  { t: "UBL", name: "United Bank", sector: "Bank", close: 408.39, pe: 7.1, y1: 13.5, ytd: -3.5, ff: 35, yld: "n/a" },
  { t: "MCB", name: "MCB Bank", sector: "Bank", close: 395.5, pe: 8.6, y1: 12.6, ytd: 4.8, ff: 35, yld: "n/a" },
  { t: "EFERT", name: "Engro Fertilizers", sector: "Fertilizer", close: 196.87, pe: 10.6, y1: -4.2, ytd: -13.9, ff: 45, yld: "~6.2%" },
  { t: "MARI", name: "Mari Energies", sector: "E&P", close: 630.0, pe: 8.1, y1: -8.7, ytd: -11.8, ff: 20, yld: "n/a" },
  { t: "HUBC", name: "Hub Power", sector: "Power", close: 193.12, pe: 10.2, y1: -9.9, ytd: -12.7, ff: 75, yld: "~8.6–10.6%" },
  { t: "LUCK", name: "Lucky Cement", sector: "Cement", close: 390.41, pe: 11.7, y1: -12.2, ytd: -17.6, ff: 30, yld: "n/a" },
  { t: "PSO", name: "Pakistan State Oil", sector: "OMC", close: 355.46, pe: 5.3, y1: -19.2, ytd: -25.0, ff: 50, yld: "n/a" },
  { t: "SYS", name: "Systems Ltd", sector: "Tech", close: 108.55, pe: 23.4, y1: -25.5, ytd: -36.1, ff: 65, yld: "low" },
];

window.ETFS = [
  { t: "MZNPETF", name: "Meezan Pakistan ETF", tracks: "Meezan Pakistan Index (Shariah)", fee: "up to 0.50%", aum: 2.59 },
  { t: "MIIETF", name: "Mahaana Islamic Index ETF", tracks: "Islamic index", fee: "up to 0.70%", aum: 2.03 },
  { t: "UBLPETF", name: "UBL Pakistan Enterprise ETF", tracks: "UBL Pakistan Enterprise Index", fee: "0.65%", aum: 0.8 },
  { t: "HBLTETF", name: "HBL Total Treasury ETF", tracks: "T-bills", fee: "n/a", aum: 0.54 },
  { t: "JSGBETF", name: "JS Global Banking ETF", tracks: "Banks", fee: "up to 0.80%", aum: 0.36 },
  { t: "NBPGETF", name: "NBP Pakistan Growth ETF", tracks: "NBP Pakistan Growth Index", fee: "up to 0.75%", aum: 0.28 },
  { t: "NITGETF", name: "NIT Pakistan Gateway ETF", tracks: "NIT Pakistan Gateway Index", fee: "0.40%", aum: 0.24 },
];
