/* Curated company options shown in the frontend selector. */

import type { FormType } from "../types";

export interface CompanyOption {
  ticker: string;
  name: string;
  sector: string;
  exchange: string;
  country: "US" | "UK" | "Global";
  domain: string;
  logoUrls?: string[];
  description: string;
  forms: FormType[];
  defaultForm: FormType;
}

const US_FORMS: FormType[] = ["8-K", "10-Q", "10-K"];
const FOREIGN_ISSUER_FORMS: FormType[] = ["6-K", "20-F"];

const COMPANY_OPTIONS: CompanyOption[] = [
  {
    ticker: "AAPL",
    name: "Apple Inc.",
    sector: "Consumer Technology",
    exchange: "NASDAQ",
    country: "US",
    domain: "apple.com",
    description: "iPhone, Mac, services, wearables, and consumer hardware.",
    forms: US_FORMS,
    defaultForm: "8-K"
  },
  {
    ticker: "MSFT",
    name: "Microsoft Corporation",
    sector: "Cloud & Software",
    exchange: "NASDAQ",
    country: "US",
    domain: "microsoft.com",
    description: "Cloud infrastructure, software, AI, gaming, and enterprise tools.",
    forms: US_FORMS,
    defaultForm: "8-K"
  },
  {
    ticker: "NVDA",
    name: "NVIDIA Corporation",
    sector: "Semiconductors",
    exchange: "NASDAQ",
    country: "US",
    domain: "nvidia.com",
    description: "GPUs, AI accelerators, data center chips, and graphics systems.",
    forms: US_FORMS,
    defaultForm: "8-K"
  },
  {
    ticker: "TSLA",
    name: "Tesla, Inc.",
    sector: "Automotive & Energy",
    exchange: "NASDAQ",
    country: "US",
    domain: "tesla.com",
    description: "Electric vehicles, batteries, charging, and energy products.",
    forms: US_FORMS,
    defaultForm: "8-K"
  },
  {
    ticker: "AMZN",
    name: "Amazon.com, Inc.",
    sector: "E-Commerce & Cloud",
    exchange: "NASDAQ",
    country: "US",
    domain: "amazon.com",
    description: "Online retail, AWS cloud, logistics, media, and advertising.",
    forms: US_FORMS,
    defaultForm: "8-K"
  },
  {
    ticker: "GOOGL",
    name: "Alphabet Inc.",
    sector: "Internet & AI",
    exchange: "NASDAQ",
    country: "US",
    domain: "abc.xyz",
    description: "Search, ads, YouTube, Android, cloud, and AI research.",
    forms: US_FORMS,
    defaultForm: "8-K"
  },
  {
    ticker: "META",
    name: "Meta Platforms, Inc.",
    sector: "Social Platforms",
    exchange: "NASDAQ",
    country: "US",
    domain: "meta.com",
    description: "Facebook, Instagram, WhatsApp, ads, AI, and mixed reality.",
    forms: US_FORMS,
    defaultForm: "8-K"
  },
  {
    ticker: "JPM",
    name: "JPMorgan Chase & Co.",
    sector: "Banking",
    exchange: "NYSE",
    country: "US",
    domain: "jpmorganchase.com",
    description: "Consumer banking, investment banking, markets, and asset management.",
    forms: US_FORMS,
    defaultForm: "8-K"
  },
  {
    ticker: "BAC",
    name: "Bank of America Corporation",
    sector: "Banking",
    exchange: "NYSE",
    country: "US",
    domain: "bankofamerica.com",
    description: "Consumer banking, wealth management, lending, and markets.",
    forms: US_FORMS,
    defaultForm: "8-K"
  },
  {
    ticker: "XOM",
    name: "Exxon Mobil Corporation",
    sector: "Energy",
    exchange: "NYSE",
    country: "US",
    domain: "exxonmobil.com",
    description: "Oil, gas, chemicals, refining, and low-carbon energy investments.",
    forms: US_FORMS,
    defaultForm: "8-K"
  },
  {
    ticker: "UNH",
    name: "UnitedHealth Group Incorporated",
    sector: "Healthcare",
    exchange: "NYSE",
    country: "US",
    domain: "unitedhealthgroup.com",
    description: "Health insurance, care delivery, pharmacy services, and analytics.",
    forms: US_FORMS,
    defaultForm: "8-K"
  },
  {
    ticker: "WMT",
    name: "Walmart Inc.",
    sector: "Retail",
    exchange: "NYSE",
    country: "US",
    domain: "walmart.com",
    description: "Stores, grocery, e-commerce, supply chain, and marketplace retail.",
    forms: US_FORMS,
    defaultForm: "8-K"
  },
  {
    ticker: "SHEL",
    name: "Shell plc",
    sector: "Energy",
    exchange: "NYSE",
    country: "UK",
    domain: "shell.com",
    description: "UK-headquartered global energy company with oil, gas, LNG, and power operations.",
    forms: FOREIGN_ISSUER_FORMS,
    defaultForm: "6-K"
  },
  {
    ticker: "BP",
    name: "BP p.l.c.",
    sector: "Energy",
    exchange: "NYSE",
    country: "UK",
    domain: "bp.com",
    logoUrls: ["https://img.logokit.com/bp.com", "/logos/bp.svg"],
    description: "UK-headquartered integrated energy company with oil, gas, trading, and renewables.",
    forms: FOREIGN_ISSUER_FORMS,
    defaultForm: "6-K"
  },
  {
    ticker: "HSBC",
    name: "HSBC Holdings plc",
    sector: "Banking",
    exchange: "NYSE",
    country: "UK",
    domain: "hsbc.com",
    description: "London-based international bank serving retail, commercial, and institutional clients.",
    forms: FOREIGN_ISSUER_FORMS,
    defaultForm: "6-K"
  },
  {
    ticker: "AZN",
    name: "AstraZeneca PLC",
    sector: "Healthcare",
    exchange: "NASDAQ",
    country: "UK",
    domain: "astrazeneca.com",
    description: "UK-headquartered biopharmaceutical company focused on oncology and specialty medicines.",
    forms: FOREIGN_ISSUER_FORMS,
    defaultForm: "6-K"
  },
  {
    ticker: "GSK",
    name: "GSK plc",
    sector: "Healthcare",
    exchange: "NYSE",
    country: "UK",
    domain: "gsk.com",
    description: "UK-headquartered biopharma company focused on vaccines and specialty medicines.",
    forms: FOREIGN_ISSUER_FORMS,
    defaultForm: "6-K"
  },
  {
    ticker: "UL",
    name: "Unilever PLC",
    sector: "Consumer Goods",
    exchange: "NYSE",
    country: "UK",
    domain: "unilever.com",
    description: "UK-listed consumer goods company with global food, beauty, and home care brands.",
    forms: FOREIGN_ISSUER_FORMS,
    defaultForm: "6-K"
  },
  {
    ticker: "DEO",
    name: "Diageo plc",
    sector: "Beverages",
    exchange: "NYSE",
    country: "UK",
    domain: "diageo.com",
    description: "UK-headquartered spirits and beverage company with global premium drink brands.",
    forms: FOREIGN_ISSUER_FORMS,
    defaultForm: "6-K"
  },
  {
    ticker: "RIO",
    name: "Rio Tinto plc",
    sector: "Mining",
    exchange: "NYSE",
    country: "UK",
    domain: "riotinto.com",
    description: "UK-listed global mining group producing iron ore, aluminium, copper, and minerals.",
    forms: FOREIGN_ISSUER_FORMS,
    defaultForm: "6-K"
  },
  {
    ticker: "CVX",
    name: "Chevron Corporation",
    sector: "Energy",
    exchange: "NYSE",
    country: "US",
    domain: "chevron.com",
    description: "Integrated energy company with oil, gas, refining, chemicals, and low-carbon operations.",
    forms: US_FORMS,
    defaultForm: "8-K"
  },
  {
    ticker: "COP",
    name: "ConocoPhillips",
    sector: "Energy",
    exchange: "NYSE",
    country: "US",
    domain: "conocophillips.com",
    logoUrls: ["/logos/cop.svg", "https://logo.clearbit.com/conocophillips.com"],
    description: "Large independent exploration and production company focused on oil and natural gas.",
    forms: US_FORMS,
    defaultForm: "8-K"
  },
  {
    ticker: "OXY",
    name: "Occidental Petroleum Corporation",
    sector: "Energy",
    exchange: "NYSE",
    country: "US",
    domain: "oxy.com",
    description: "Oil, gas, chemicals, and carbon management company with major U.S. shale operations.",
    forms: US_FORMS,
    defaultForm: "8-K"
  },
  {
    ticker: "SLB",
    name: "SLB",
    sector: "Energy Services",
    exchange: "NYSE",
    country: "US",
    domain: "slb.com",
    description: "Global energy technology and oilfield services company.",
    forms: US_FORMS,
    defaultForm: "8-K"
  },
  {
    ticker: "TTE",
    name: "TotalEnergies SE",
    sector: "Energy",
    exchange: "NYSE",
    country: "Global",
    domain: "totalenergies.com",
    description: "French integrated energy company with oil, gas, LNG, power, and renewables operations.",
    forms: FOREIGN_ISSUER_FORMS,
    defaultForm: "6-K"
  },
  {
    ticker: "EQNR",
    name: "Equinor ASA",
    sector: "Energy",
    exchange: "NYSE",
    country: "Global",
    domain: "equinor.com",
    description: "Norwegian energy company focused on oil, gas, offshore wind, and low-carbon energy.",
    forms: FOREIGN_ISSUER_FORMS,
    defaultForm: "6-K"
  },
  {
    ticker: "E",
    name: "Eni S.p.A.",
    sector: "Energy",
    exchange: "NYSE",
    country: "Global",
    domain: "eni.com",
    description: "Italian integrated energy company with oil, gas, refining, chemicals, and energy transition assets.",
    forms: FOREIGN_ISSUER_FORMS,
    defaultForm: "6-K"
  },
  {
    ticker: "PBR",
    name: "Petroleo Brasileiro S.A. - Petrobras",
    sector: "Energy",
    exchange: "NYSE",
    country: "Global",
    domain: "petrobras.com.br",
    description: "Brazilian integrated energy company with major offshore oil and gas operations.",
    forms: FOREIGN_ISSUER_FORMS,
    defaultForm: "6-K"
  },
  {
    ticker: "VOD",
    name: "Vodafone Group Public Limited Company",
    sector: "Telecommunications",
    exchange: "NASDAQ",
    country: "UK",
    domain: "vodafone.com",
    description: "UK-headquartered telecom group providing mobile, broadband, and enterprise connectivity.",
    forms: FOREIGN_ISSUER_FORMS,
    defaultForm: "6-K"
  },
  {
    ticker: "BCS",
    name: "Barclays PLC",
    sector: "Banking",
    exchange: "NYSE",
    country: "UK",
    domain: "barclays.com",
    description: "UK universal bank with consumer, corporate, investment banking, and markets businesses.",
    forms: FOREIGN_ISSUER_FORMS,
    defaultForm: "6-K"
  },
  {
    ticker: "LYG",
    name: "Lloyds Banking Group plc",
    sector: "Banking",
    exchange: "NYSE",
    country: "UK",
    domain: "lloydsbankinggroup.com",
    description: "UK retail and commercial banking group serving households and businesses.",
    forms: FOREIGN_ISSUER_FORMS,
    defaultForm: "6-K"
  },
  {
    ticker: "ARM",
    name: "Arm Holdings plc",
    sector: "Semiconductors",
    exchange: "NASDAQ",
    country: "UK",
    domain: "arm.com",
    description: "UK-headquartered semiconductor design company known for processor architecture and IP licensing.",
    forms: FOREIGN_ISSUER_FORMS,
    defaultForm: "6-K"
  },
  {
    ticker: "NGG",
    name: "National Grid plc",
    sector: "Utilities",
    exchange: "NYSE",
    country: "UK",
    domain: "nationalgrid.com",
    description: "UK-headquartered electricity and gas transmission utility with UK and U.S. operations.",
    forms: FOREIGN_ISSUER_FORMS,
    defaultForm: "6-K"
  },
  {
    ticker: "RELX",
    name: "RELX PLC",
    sector: "Information Services",
    exchange: "NYSE",
    country: "UK",
    domain: "relx.com",
    description: "UK-listed analytics, scientific, legal, and risk information services company.",
    forms: FOREIGN_ISSUER_FORMS,
    defaultForm: "6-K"
  },
  {
    ticker: "ASML",
    name: "ASML Holding N.V.",
    sector: "Semiconductor Equipment",
    exchange: "NASDAQ",
    country: "Global",
    domain: "asml.com",
    description: "Dutch semiconductor equipment company and leading supplier of lithography systems.",
    forms: FOREIGN_ISSUER_FORMS,
    defaultForm: "6-K"
  },
  {
    ticker: "SAP",
    name: "SAP SE",
    sector: "Enterprise Software",
    exchange: "NYSE",
    country: "Global",
    domain: "sap.com",
    description: "German enterprise software company focused on ERP, cloud, data, and business applications.",
    forms: FOREIGN_ISSUER_FORMS,
    defaultForm: "6-K"
  },
  {
    ticker: "NVO",
    name: "Novo Nordisk A/S",
    sector: "Healthcare",
    exchange: "NYSE",
    country: "Global",
    domain: "novonordisk.com",
    description: "Danish pharmaceutical company focused on diabetes, obesity, and chronic disease treatments.",
    forms: FOREIGN_ISSUER_FORMS,
    defaultForm: "6-K"
  },
  {
    ticker: "NVS",
    name: "Novartis AG",
    sector: "Healthcare",
    exchange: "NYSE",
    country: "Global",
    domain: "novartis.com",
    description: "Swiss pharmaceutical company focused on innovative medicines and global healthcare.",
    forms: FOREIGN_ISSUER_FORMS,
    defaultForm: "6-K"
  },
  {
    ticker: "SNY",
    name: "Sanofi",
    sector: "Healthcare",
    exchange: "NASDAQ",
    country: "Global",
    domain: "sanofi.com",
    description: "French healthcare company focused on medicines, vaccines, immunology, and rare diseases.",
    forms: FOREIGN_ISSUER_FORMS,
    defaultForm: "6-K"
  },
  {
    ticker: "UBS",
    name: "UBS Group AG",
    sector: "Banking",
    exchange: "NYSE",
    country: "Global",
    domain: "ubs.com",
    description: "Swiss global wealth management, investment banking, and asset management group.",
    forms: FOREIGN_ISSUER_FORMS,
    defaultForm: "6-K"
  },
  {
    ticker: "TSM",
    name: "Taiwan Semiconductor Manufacturing Company Limited",
    sector: "Semiconductors",
    exchange: "NYSE",
    country: "Global",
    domain: "tsmc.com",
    description: "Taiwanese semiconductor foundry manufacturing chips for global technology companies.",
    forms: FOREIGN_ISSUER_FORMS,
    defaultForm: "6-K"
  },
  {
    ticker: "TM",
    name: "Toyota Motor Corporation",
    sector: "Automotive",
    exchange: "NYSE",
    country: "Global",
    domain: "toyota-global.com",
    description: "Japanese automaker producing cars, trucks, hybrids, EVs, and mobility services.",
    forms: FOREIGN_ISSUER_FORMS,
    defaultForm: "6-K"
  },
  {
    ticker: "SONY",
    name: "Sony Group Corporation",
    sector: "Consumer Technology",
    exchange: "NYSE",
    country: "Global",
    domain: "sony.com",
    description: "Japanese entertainment and technology group spanning gaming, music, film, imaging, and electronics.",
    forms: FOREIGN_ISSUER_FORMS,
    defaultForm: "6-K"
  },
  {
    ticker: "BABA",
    name: "Alibaba Group Holding Limited",
    sector: "E-Commerce & Cloud",
    exchange: "NYSE",
    country: "Global",
    domain: "alibabagroup.com",
    logoUrls: ["/logos/baba.svg", "https://logo.clearbit.com/alibaba.com"],
    description: "Chinese e-commerce, cloud, logistics, and digital commerce platform company.",
    forms: FOREIGN_ISSUER_FORMS,
    defaultForm: "6-K"
  },
  {
    ticker: "V",
    name: "Visa Inc.",
    sector: "Payments",
    exchange: "NYSE",
    country: "US",
    domain: "visa.com",
    description: "Global payments network enabling digital transactions across consumers, merchants, and banks.",
    forms: US_FORMS,
    defaultForm: "8-K"
  },
  {
    ticker: "MA",
    name: "Mastercard Incorporated",
    sector: "Payments",
    exchange: "NYSE",
    country: "US",
    domain: "mastercard.com",
    description: "Global payments technology company powering card, account, and digital payment networks.",
    forms: US_FORMS,
    defaultForm: "8-K"
  },
  {
    ticker: "PG",
    name: "The Procter & Gamble Company",
    sector: "Consumer Goods",
    exchange: "NYSE",
    country: "US",
    domain: "pg.com",
    description: "Consumer goods company with household, personal care, grooming, and health brands.",
    forms: US_FORMS,
    defaultForm: "8-K"
  },
  {
    ticker: "JNJ",
    name: "Johnson & Johnson",
    sector: "Healthcare",
    exchange: "NYSE",
    country: "US",
    domain: "jnj.com",
    description: "Healthcare company focused on medicines, medical technology, and global health products.",
    forms: US_FORMS,
    defaultForm: "8-K"
  },
  {
    ticker: "LLY",
    name: "Eli Lilly and Company",
    sector: "Healthcare",
    exchange: "NYSE",
    country: "US",
    domain: "lilly.com",
    description: "Pharmaceutical company focused on diabetes, obesity, oncology, immunology, and neuroscience.",
    forms: US_FORMS,
    defaultForm: "8-K"
  },
  {
    ticker: "COST",
    name: "Costco Wholesale Corporation",
    sector: "Retail",
    exchange: "NASDAQ",
    country: "US",
    domain: "costco.com",
    description: "Membership warehouse retailer selling groceries, general merchandise, fuel, and services.",
    forms: US_FORMS,
    defaultForm: "8-K"
  },
  {
    ticker: "ABBV",
    name: "AbbVie Inc.",
    sector: "Pharmaceuticals",
    exchange: "NYSE",
    country: "US",
    domain: "abbvie.com",
    logoUrls: ["/logos/abbv.svg", "https://logo.clearbit.com/abbvie.com"],
    description: "Biopharmaceutical company focused on immunology, oncology, neuroscience, and aesthetics.",
    forms: US_FORMS,
    defaultForm: "8-K"
  },
  {
    ticker: "AIG",
    name: "American International Group, Inc.",
    sector: "Insurance",
    exchange: "NYSE",
    country: "US",
    domain: "aig.com",
    logoUrls: ["/logos/aig.svg", "https://logo.clearbit.com/aig.com"],
    description: "Global insurance company providing commercial, personal, and specialty risk coverage.",
    forms: US_FORMS,
    defaultForm: "8-K"
  },
  {
    ticker: "XYZ",
    name: "Block, Inc.",
    sector: "Fintech",
    exchange: "NYSE",
    country: "US",
    domain: "block.xyz",
    logoUrls: ["/logos/xyz.svg", "https://logo.clearbit.com/block.xyz"],
    description: "Fintech company behind Square, Cash App, Afterpay, and commerce payment tools.",
    forms: US_FORMS,
    defaultForm: "8-K"
  },
  {
    ticker: "COIN",
    name: "Coinbase Global, Inc.",
    sector: "Fintech",
    exchange: "NASDAQ",
    country: "US",
    domain: "coinbase.com",
    logoUrls: ["/logos/coin.svg", "https://logo.clearbit.com/coinbase.com"],
    description: "Crypto asset platform offering trading, custody, staking, and institutional services.",
    forms: US_FORMS,
    defaultForm: "8-K"
  },
  {
    ticker: "HOOD",
    name: "Robinhood Markets, Inc.",
    sector: "Fintech",
    exchange: "NASDAQ",
    country: "US",
    domain: "robinhood.com",
    logoUrls: ["/logos/hood.svg", "https://logo.clearbit.com/robinhood.com"],
    description: "Consumer fintech platform for stock, options, crypto trading, retirement, and cash products.",
    forms: US_FORMS,
    defaultForm: "8-K"
  },
  {
    ticker: "MET",
    name: "MetLife, Inc.",
    sector: "Insurance",
    exchange: "NYSE",
    country: "US",
    domain: "metlife.com",
    logoUrls: ["/logos/met.svg", "https://logo.clearbit.com/metlife.com"],
    description: "Insurance and employee benefits company serving consumers, employers, and institutions.",
    forms: US_FORMS,
    defaultForm: "8-K"
  },
  {
    ticker: "MRK",
    name: "Merck & Co., Inc.",
    sector: "Pharmaceuticals",
    exchange: "NYSE",
    country: "US",
    domain: "merck.com",
    logoUrls: ["/logos/mrk.svg", "https://logo.clearbit.com/merck.com"],
    description: "Pharmaceutical company focused on oncology, vaccines, infectious disease, and animal health.",
    forms: US_FORMS,
    defaultForm: "8-K"
  },
  {
    ticker: "PYPL",
    name: "PayPal Holdings, Inc.",
    sector: "Fintech",
    exchange: "NASDAQ",
    country: "US",
    domain: "paypal.com",
    logoUrls: ["/logos/pypl.svg", "https://logo.clearbit.com/paypal.com"],
    description: "Digital payments company operating PayPal, Venmo, Braintree, and merchant payment services.",
    forms: US_FORMS,
    defaultForm: "8-K"
  },
  {
    ticker: "PFE",
    name: "Pfizer Inc.",
    sector: "Pharmaceuticals",
    exchange: "NYSE",
    country: "US",
    domain: "pfizer.com",
    logoUrls: ["/logos/pfe.svg", "https://logo.clearbit.com/pfizer.com"],
    description: "Pharmaceutical company developing medicines and vaccines across major therapeutic areas.",
    forms: US_FORMS,
    defaultForm: "8-K"
  },
  {
    ticker: "PRU",
    name: "Prudential Financial, Inc.",
    sector: "Insurance",
    exchange: "NYSE",
    country: "US",
    domain: "prudential.com",
    logoUrls: ["/logos/pru.svg", "https://logo.clearbit.com/prudential.com"],
    description: "Insurance, retirement, investment management, and financial protection company.",
    forms: US_FORMS,
    defaultForm: "8-K"
  },
  {
    ticker: "ADBE",
    name: "Adobe Inc.",
    sector: "Creative Software",
    exchange: "NASDAQ",
    country: "US",
    domain: "adobe.com",
    description: "Creative, document, marketing, and digital experience software platforms.",
    forms: US_FORMS,
    defaultForm: "8-K"
  },
  {
    ticker: "AMD",
    name: "Advanced Micro Devices, Inc.",
    sector: "Semiconductors",
    exchange: "NASDAQ",
    country: "US",
    domain: "amd.com",
    description: "CPUs, GPUs, adaptive computing chips, and data center semiconductor products.",
    forms: US_FORMS,
    defaultForm: "8-K"
  },
  {
    ticker: "DIS",
    name: "The Walt Disney Company",
    sector: "Media & Entertainment",
    exchange: "NYSE",
    country: "US",
    domain: "thewaltdisneycompany.com",
    description: "Film, television, streaming, theme parks, consumer products, and experiences.",
    forms: US_FORMS,
    defaultForm: "8-K"
  },
  {
    ticker: "INTC",
    name: "Intel Corporation",
    sector: "Semiconductors",
    exchange: "NASDAQ",
    country: "US",
    domain: "intel.com",
    description: "Processors, data center chips, foundry services, networking, and computing platforms.",
    forms: US_FORMS,
    defaultForm: "8-K"
  },
  {
    ticker: "MCD",
    name: "McDonald's Corporation",
    sector: "Restaurants",
    exchange: "NYSE",
    country: "US",
    domain: "mcdonalds.com",
    description: "Global quick-service restaurant operator and franchisor.",
    forms: US_FORMS,
    defaultForm: "8-K"
  },
  {
    ticker: "NFLX",
    name: "Netflix, Inc.",
    sector: "Streaming & Entertainment",
    exchange: "NASDAQ",
    country: "US",
    domain: "netflix.com",
    description: "Global streaming entertainment platform producing and distributing films, series, and games.",
    forms: US_FORMS,
    defaultForm: "8-K"
  },
  {
    ticker: "NKE",
    name: "NIKE, Inc.",
    sector: "Apparel & Footwear",
    exchange: "NYSE",
    country: "US",
    domain: "nike.com",
    description: "Athletic footwear, apparel, equipment, and sports lifestyle brand.",
    forms: US_FORMS,
    defaultForm: "8-K"
  },
  {
    ticker: "ORCL",
    name: "Oracle Corporation",
    sector: "Cloud & Enterprise Software",
    exchange: "NYSE",
    country: "US",
    domain: "oracle.com",
    description: "Cloud infrastructure, databases, enterprise applications, and AI services.",
    forms: US_FORMS,
    defaultForm: "8-K"
  },
  {
    ticker: "CRM",
    name: "Salesforce, Inc.",
    sector: "Enterprise Software",
    exchange: "NYSE",
    country: "US",
    domain: "salesforce.com",
    description: "Customer relationship management, data, AI, marketing, and enterprise cloud software.",
    forms: US_FORMS,
    defaultForm: "8-K"
  },
  {
    ticker: "SBUX",
    name: "Starbucks Corporation",
    sector: "Restaurants",
    exchange: "NASDAQ",
    country: "US",
    domain: "starbucks.com",
    description: "Global coffeehouse, beverage, food, and consumer products company.",
    forms: US_FORMS,
    defaultForm: "8-K"
  },
  {
    ticker: "ABNB",
    name: "Airbnb, Inc.",
    sector: "Travel & Marketplace",
    exchange: "NASDAQ",
    country: "US",
    domain: "airbnb.com",
    description: "Online marketplace for stays, experiences, and travel hosting services.",
    forms: US_FORMS,
    defaultForm: "8-K"
  },
  {
    ticker: "AXP",
    name: "American Express Company",
    sector: "Payments & Credit",
    exchange: "NYSE",
    country: "US",
    domain: "americanexpress.com",
    description: "Global payments, credit card, travel, and merchant services company.",
    forms: US_FORMS,
    defaultForm: "8-K"
  },
  {
    ticker: "BUD",
    name: "Anheuser-Busch InBev SA/NV",
    sector: "Beverages",
    exchange: "NYSE",
    country: "Global",
    domain: "ab-inbev.com",
    description: "Global brewer with beer, beverage, and consumer brand operations.",
    forms: FOREIGN_ISSUER_FORMS,
    defaultForm: "6-K"
  },
  {
    ticker: "BMWKY",
    name: "BMW Group",
    sector: "Automotive",
    exchange: "OTC",
    country: "Global",
    domain: "bmwgroup.com",
    description: "German automaker producing BMW, MINI, Rolls-Royce, motorcycles, and mobility services.",
    forms: FOREIGN_ISSUER_FORMS,
    defaultForm: "6-K"
  },
  {
    ticker: "BA",
    name: "The Boeing Company",
    sector: "Aerospace & Defense",
    exchange: "NYSE",
    country: "US",
    domain: "boeing.com",
    description: "Commercial aircraft, defense systems, space technology, and aerospace services.",
    forms: US_FORMS,
    defaultForm: "8-K"
  },
  {
    ticker: "BLK",
    name: "BlackRock, Inc.",
    sector: "Asset Management",
    exchange: "NYSE",
    country: "US",
    domain: "blackrock.com",
    description: "Global asset manager offering investment, ETF, risk analytics, and advisory services.",
    forms: US_FORMS,
    defaultForm: "8-K"
  },
  {
    ticker: "BTI",
    name: "British American Tobacco p.l.c.",
    sector: "Consumer Staples",
    exchange: "NYSE",
    country: "UK",
    domain: "bat.com",
    description: "UK-headquartered tobacco and nicotine products company with global consumer brands.",
    forms: FOREIGN_ISSUER_FORMS,
    defaultForm: "6-K"
  },
  {
    ticker: "CAT",
    name: "Caterpillar Inc.",
    sector: "Industrial Machinery",
    exchange: "NYSE",
    country: "US",
    domain: "caterpillar.com",
    description: "Construction equipment, mining machinery, engines, turbines, and industrial services.",
    forms: US_FORMS,
    defaultForm: "8-K"
  },
  {
    ticker: "CSCO",
    name: "Cisco Systems, Inc.",
    sector: "Networking & Security",
    exchange: "NASDAQ",
    country: "US",
    domain: "cisco.com",
    description: "Networking, cybersecurity, collaboration, observability, and enterprise infrastructure products.",
    forms: US_FORMS,
    defaultForm: "8-K"
  },
  {
    ticker: "C",
    name: "Citigroup Inc.",
    sector: "Banking",
    exchange: "NYSE",
    country: "US",
    domain: "citigroup.com",
    description: "Global bank offering consumer banking, institutional banking, markets, and transaction services.",
    forms: US_FORMS,
    defaultForm: "8-K"
  },
  {
    ticker: "KO",
    name: "The Coca-Cola Company",
    sector: "Beverages",
    exchange: "NYSE",
    country: "US",
    domain: "coca-colacompany.com",
    description: "Global beverage company with soft drinks, water, coffee, tea, and sports drink brands.",
    forms: US_FORMS,
    defaultForm: "8-K"
  },
  {
    ticker: "DAL",
    name: "Delta Air Lines, Inc.",
    sector: "Airlines",
    exchange: "NYSE",
    country: "US",
    domain: "delta.com",
    description: "Passenger airline with domestic, international, cargo, loyalty, and travel operations.",
    forms: US_FORMS,
    defaultForm: "8-K"
  },
  {
    ticker: "DB",
    name: "Deutsche Bank Aktiengesellschaft",
    sector: "Banking",
    exchange: "NYSE",
    country: "Global",
    domain: "db.com",
    description: "German global bank serving corporate, investment banking, private banking, and asset management clients.",
    forms: FOREIGN_ISSUER_FORMS,
    defaultForm: "6-K"
  },
  {
    ticker: "FDX",
    name: "FedEx Corporation",
    sector: "Logistics",
    exchange: "NYSE",
    country: "US",
    domain: "fedex.com",
    description: "Parcel delivery, freight, logistics, e-commerce shipping, and business services company.",
    forms: US_FORMS,
    defaultForm: "8-K"
  },
  {
    ticker: "GE",
    name: "GE Aerospace",
    sector: "Aerospace & Defense",
    exchange: "NYSE",
    country: "US",
    domain: "geaerospace.com",
    description: "Aircraft engines, aviation systems, services, and aerospace technology company.",
    forms: US_FORMS,
    defaultForm: "8-K"
  },
  {
    ticker: "GS",
    name: "The Goldman Sachs Group, Inc.",
    sector: "Investment Banking",
    exchange: "NYSE",
    country: "US",
    domain: "goldmansachs.com",
    description: "Investment banking, global markets, asset management, and wealth management company.",
    forms: US_FORMS,
    defaultForm: "8-K"
  },
  {
    ticker: "HD",
    name: "The Home Depot, Inc.",
    sector: "Home Improvement Retail",
    exchange: "NYSE",
    country: "US",
    domain: "homedepot.com",
    description: "Home improvement retailer serving consumers, contractors, and professional builders.",
    forms: US_FORMS,
    defaultForm: "8-K"
  },
  {
    ticker: "IBM",
    name: "International Business Machines Corporation",
    sector: "Enterprise Technology",
    exchange: "NYSE",
    country: "US",
    domain: "ibm.com",
    description: "Hybrid cloud, AI, consulting, infrastructure software, and enterprise technology services.",
    forms: US_FORMS,
    defaultForm: "8-K"
  },
  {
    ticker: "ING",
    name: "ING Groep N.V.",
    sector: "Banking",
    exchange: "NYSE",
    country: "Global",
    domain: "ing.com",
    description: "Dutch banking group offering retail, commercial, digital banking, and wholesale banking services.",
    forms: FOREIGN_ISSUER_FORMS,
    defaultForm: "6-K"
  },
  {
    ticker: "LOW",
    name: "Lowe's Companies, Inc.",
    sector: "Home Improvement Retail",
    exchange: "NYSE",
    country: "US",
    domain: "lowes.com",
    description: "Home improvement retailer serving homeowners, renters, and professional contractors.",
    forms: US_FORMS,
    defaultForm: "8-K"
  },
  {
    ticker: "MS",
    name: "Morgan Stanley",
    sector: "Investment Banking",
    exchange: "NYSE",
    country: "US",
    domain: "morganstanley.com",
    description: "Investment banking, securities, wealth management, and investment management company.",
    forms: US_FORMS,
    defaultForm: "8-K"
  },
  {
    ticker: "NWG",
    name: "NatWest Group plc",
    sector: "Banking",
    exchange: "NYSE",
    country: "UK",
    domain: "natwestgroup.com",
    description: "UK banking group serving retail, commercial, private, and business customers.",
    forms: FOREIGN_ISSUER_FORMS,
    defaultForm: "6-K"
  },
  {
    ticker: "PEP",
    name: "PepsiCo, Inc.",
    sector: "Beverages & Snacks",
    exchange: "NASDAQ",
    country: "US",
    domain: "pepsico.com",
    description: "Global food and beverage company with snacks, soft drinks, sports drinks, and packaged brands.",
    forms: US_FORMS,
    defaultForm: "8-K"
  },
  {
    ticker: "RACE",
    name: "Ferrari N.V.",
    sector: "Luxury Automotive",
    exchange: "NYSE",
    country: "Global",
    domain: "ferrari.com",
    description: "Luxury sports car manufacturer with racing, brand licensing, and lifestyle businesses.",
    forms: FOREIGN_ISSUER_FORMS,
    defaultForm: "6-K"
  },
  {
    ticker: "SAN",
    name: "Banco Santander, S.A.",
    sector: "Banking",
    exchange: "NYSE",
    country: "Global",
    domain: "santander.com",
    description: "Spanish global banking group serving retail, commercial, and institutional customers.",
    forms: FOREIGN_ISSUER_FORMS,
    defaultForm: "6-K"
  },
  {
    ticker: "SHOP",
    name: "Shopify Inc.",
    sector: "E-Commerce Software",
    exchange: "NYSE",
    country: "Global",
    domain: "shopify.com",
    description: "Commerce platform for online stores, payments, logistics, merchant tools, and retail operations.",
    forms: FOREIGN_ISSUER_FORMS,
    defaultForm: "6-K"
  },
  {
    ticker: "SPOT",
    name: "Spotify Technology S.A.",
    sector: "Streaming & Audio",
    exchange: "NYSE",
    country: "Global",
    domain: "spotify.com",
    description: "Audio streaming platform for music, podcasts, advertising, subscriptions, and creator tools.",
    forms: FOREIGN_ISSUER_FORMS,
    defaultForm: "6-K"
  },
  {
    ticker: "TGT",
    name: "Target Corporation",
    sector: "Retail",
    exchange: "NYSE",
    country: "US",
    domain: "target.com",
    description: "General merchandise retailer offering stores, e-commerce, groceries, apparel, and household goods.",
    forms: US_FORMS,
    defaultForm: "8-K"
  },
  {
    ticker: "UBER",
    name: "Uber Technologies, Inc.",
    sector: "Mobility & Delivery",
    exchange: "NYSE",
    country: "US",
    domain: "uber.com",
    description: "Ride-hailing, delivery, freight, and mobility technology platform.",
    forms: US_FORMS,
    defaultForm: "8-K"
  },
  {
    ticker: "UPS",
    name: "United Parcel Service, Inc.",
    sector: "Logistics",
    exchange: "NYSE",
    country: "US",
    domain: "ups.com",
    description: "Package delivery, logistics, supply chain, freight, and business shipping services.",
    forms: US_FORMS,
    defaultForm: "8-K"
  }
];

export const COMPANIES: CompanyOption[] = [...COMPANY_OPTIONS].sort((first, second) => {
  return first.name.localeCompare(second.name);
});

export function logoUrl(domain: string) {
  return `https://logo.clearbit.com/${domain}`;
}

export function fallbackLogoUrl(domain: string) {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
}
