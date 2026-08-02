export type Continent =
  | "china"
  | "asia"
  | "europe"
  | "americas"
  | "oceania"
  | "middleeast"
  | "africa"
  | "global";

const CHINA_REGIONS = new Set([
  "China mainland",
  "China (mainland & HK)",
  "China (mainland HK Macao)",
  "China mainland & Japan & South Korea",
  "Hong Kong (China)",
  "Macao (China)",
]);

const ASIA_HINTS = [
  "japan",
  "korea",
  "thailand",
  "singapore",
  "vietnam",
  "malaysia",
  "indonesia",
  "philippines",
  "cambodia",
  "laos",
  "india",
  "nepal",
  "mongolia",
  "taiwan",
  "asia",
  "central asia",
  "brunei",
  "bangladesh",
  "pakistan",
  "sri lanka",
  "maldives",
  "myanmar",
];

const EUROPE_HINTS = [
  "europe",
  "united kingdom",
  "ireland",
  "france",
  "germany",
  "italy",
  "spain",
  "portugal",
  "switzerland",
  "netherlands",
  "belgium",
  "austria",
  "greece",
  "poland",
  "sweden",
  "norway",
  "denmark",
  "finland",
  "iceland",
  "czech",
  "hungary",
  "croatia",
  "turkey",
  "russia",
  "ukraine",
  "balkans",
];

const AMERICAS_HINTS = [
  "united states",
  "canada",
  "usa",
  "mexico",
  "brazil",
  "argentina",
  "chile",
  "peru",
  "colombia",
  "north america",
  "south america",
  "caribbean",
  "puerto rico",
];

const OCEANIA_HINTS = [
  "australia",
  "new zealand",
  "fiji",
  "guam",
  "samoa",
  "french polynesia",
  "aukus",
];

const ME_HINTS = [
  "united arab emirates",
  "saudi",
  "qatar",
  "kuwait",
  "bahrain",
  "oman",
  "israel",
  "jordan",
  "egypt",
  "middle east",
  "gulf",
  "gcc",
];

const AFRICA_HINTS = ["africa", "south africa", "kenya", "morocco", "nigeria", "tanzania"];

export const FEATURED_DESTINATIONS = [
  "China mainland",
  "China (mainland HK Macao)",
  "China mainland & Japan & South Korea",
  "Hong Kong (China)",
  "Japan",
  "South Korea",
  "Thailand",
  "USA & Canada",
  "Europe (40+ areas)",
  "Global (130+ areas)",
];

export const TRIP_CHINA_SLUGS = [
  "china-mainland",
  "china-mainland-hk-macao",
  "china-mainland-and-hk",
  "hong-kong-china",
  "macao-china",
  "china-mainland-and-japan-and-south-korea",
];

/** Exact region name → flagcdn ISO codes (lowercase). */
const REGION_EXACT_FLAGS: Record<string, string[]> = {
  "China mainland": ["cn"],
  "China (mainland & HK)": ["cn", "hk"],
  "China (mainland HK Macao)": ["cn", "hk", "mo"],
  "China mainland & Japan & South Korea": ["cn", "jp", "kr"],
  "Hong Kong (China)": ["hk"],
  "Macao (China)": ["mo"],
  Japan: ["jp"],
  "South Korea": ["kr"],
  "Japan & South Korea": ["jp", "kr"],
  Singapore: ["sg"],
  "Singapore & Malaysia": ["sg", "my"],
  "Singapore & Malaysia & Thailand": ["sg", "my", "th"],
  "Singapore & Malaysia & Vietnam & Thailand & Indonesia": ["sg", "my", "vn"],
  Thailand: ["th"],
  Vietnam: ["vn"],
  Malaysia: ["my"],
  Indonesia: ["id"],
  Philippines: ["ph"],
  Cambodia: ["kh"],
  Laos: ["la"],
  India: ["in"],
  Nepal: ["np"],
  "Sri Lanka": ["lk"],
  Maldives: ["mv"],
  Mongolia: ["mn"],
  Taiwan: ["tw"],
  "United States": ["us"],
  Canada: ["ca"],
  "USA & Canada": ["us", "ca"],
  Mexico: ["mx"],
  "North America (3 areas)": ["us", "ca", "mx"],
  "United Kingdom": ["gb"],
  "Ireland & UK": ["ie", "gb"],
  Ireland: ["ie"],
  France: ["fr"],
  Germany: ["de"],
  Italy: ["it"],
  Spain: ["es"],
  Portugal: ["pt"],
  Switzerland: ["ch"],
  Netherlands: ["nl"],
  Belgium: ["be"],
  Austria: ["at"],
  Greece: ["gr"],
  "Czech Republic": ["cz"],
  Poland: ["pl"],
  Hungary: ["hu"],
  Denmark: ["dk"],
  Sweden: ["se"],
  Norway: ["no"],
  Finland: ["fi"],
  Iceland: ["is"],
  Russia: ["ru"],
  Turkey: ["tr"],
  Australia: ["au"],
  "New Zealand": ["nz"],
  "Australia & New Zealand": ["au", "nz"],
  "United Arab Emirates": ["ae"],
  Qatar: ["qa"],
  "Saudi Arabia": ["sa"],
  Israel: ["il"],
  Egypt: ["eg"],
  Morocco: ["ma"],
  "South Africa": ["za"],
  Brazil: ["br"],
  Argentina: ["ar"],
  Chile: ["cl"],
  Peru: ["pe"],
  Colombia: ["co"],
  Belarus: ["by"],
  Ukraine: ["ua"],
  Kazakhstan: ["kz"],
  Uzbekistan: ["uz"],
  Afghanistan: ["af"],
  Albania: ["al"],
  Algeria: ["dz"],
  Andorra: ["ad"],
  Angola: ["ao"],
  Armenia: ["am"],
  Azerbaijan: ["az"],
  Bahrain: ["bh"],
  Bangladesh: ["bd"],
  Barbados: ["bb"],
  Bolivia: ["bo"],
  Bosnia: ["ba"],
  "Bosnia and Herzegovina": ["ba"],
  Botswana: ["bw"],
  Brunei: ["bn"],
  Bulgaria: ["bg"],
  Cameroon: ["cm"],
  "Costa Rica": ["cr"],
  Croatia: ["hr"],
  Cyprus: ["cy"],
  "Dominican Republic": ["do"],
  Ecuador: ["ec"],
  Estonia: ["ee"],
  Ethiopia: ["et"],
  Fiji: ["fj"],
  Georgia: ["ge"],
  Ghana: ["gh"],
  Guatemala: ["gt"],
  Honduras: ["hn"],
  Jamaica: ["jm"],
  Jordan: ["jo"],
  Kenya: ["ke"],
  Kuwait: ["kw"],
  Latvia: ["lv"],
  Lebanon: ["lb"],
  Lithuania: ["lt"],
  Luxembourg: ["lu"],
  Macedonia: ["mk"],
  "North Macedonia": ["mk"],
  Madagascar: ["mg"],
  Malta: ["mt"],
  Moldova: ["md"],
  Montenegro: ["me"],
  Myanmar: ["mm"],
  Nicaragua: ["ni"],
  Nigeria: ["ng"],
  Oman: ["om"],
  Pakistan: ["pk"],
  Panama: ["pa"],
  Paraguay: ["py"],
  Romania: ["ro"],
  Serbia: ["rs"],
  Slovakia: ["sk"],
  Slovenia: ["si"],
  Tanzania: ["tz"],
  Tunisia: ["tn"],
  Uganda: ["ug"],
  Uruguay: ["uy"],
  Venezuela: ["ve"],
  Zambia: ["zm"],
};

/** Pattern matches for regional / multi-country names (checked after exact map). */
const REGION_NAME_FLAGS: Array<{ match: RegExp; codes: string[] }> = [
  { match: /china mainland\s*&\s*japan|china mainland and japan/i, codes: ["cn", "jp", "kr"] },
  { match: /mainland hk macao|mainland & hk|mainland and hk/i, codes: ["cn", "hk", "mo"] },
  { match: /japan\s*&\s*south korea|japan and south korea/i, codes: ["jp", "kr"] },
  { match: /usa\s*&\s*canada|united states.*canada|north america/i, codes: ["us", "ca"] },
  { match: /australia\s*&\s*new zealand|aukus/i, codes: ["au", "nz"] },
  { match: /singapore\s*&\s*malaysia\s*&\s*vietnam/i, codes: ["sg", "my", "vn"] },
  { match: /singapore\s*&\s*malaysia\s*&\s*thailand/i, codes: ["sg", "my", "th"] },
  { match: /singapore\s*&\s*malaysia/i, codes: ["sg", "my"] },
  { match: /ireland\s*&\s*uk/i, codes: ["ie", "gb"] },
  { match: /hong kong/i, codes: ["hk"] },
  { match: /macao/i, codes: ["mo"] },
  { match: /^china mainland$/i, codes: ["cn"] },
  { match: /europe/i, codes: ["eu"] },
  { match: /global/i, codes: ["us", "eu", "jp"] },
  { match: /caribbean/i, codes: ["jm", "bb", "do"] },
  { match: /middle east|gulf|gcc/i, codes: ["ae", "sa", "qa"] },
  { match: /africa/i, codes: ["za", "ke", "eg"] },
  { match: /south america/i, codes: ["br", "ar", "cl"] },
  { match: /central asia/i, codes: ["kz", "uz"] },
  { match: /asia/i, codes: ["jp", "kr", "th"] },
];

function normalizeFlagCode(raw: string): string | null {
  const code = raw.trim().toLowerCase();
  if (!code) return null;
  if (code === "uk") return "gb";
  if (code === "xk") return "xk";
  if (code.startsWith("eu")) return "eu";
  // Supplier sometimes uses "EU-42", "AS-20", etc.
  const prefix = code.match(/^([a-z]{2})(?:[-_]|$)/);
  if (prefix) return prefix[1] === "uk" ? "gb" : prefix[1];
  if (/^[a-z]{2}$/.test(code)) return code;
  return null;
}

const GRADIENTS: Record<Continent, string> = {
  china: "from-red-950/80 via-neutral-900 to-neutral-950",
  asia: "from-amber-950/70 via-neutral-900 to-neutral-950",
  europe: "from-blue-950/70 via-neutral-900 to-neutral-950",
  americas: "from-emerald-950/70 via-neutral-900 to-neutral-950",
  oceania: "from-cyan-950/70 via-neutral-900 to-neutral-950",
  middleeast: "from-orange-950/70 via-neutral-900 to-neutral-950",
  africa: "from-yellow-950/60 via-neutral-900 to-neutral-950",
  global: "from-violet-950/50 via-neutral-900 to-neutral-950",
};

export function getContinent(region: string, type: string): Continent {
  if (region.startsWith("Global") || type !== "Single" && /global/i.test(region)) {
    if (region.startsWith("Global")) return "global";
  }
  if (CHINA_REGIONS.has(region.trim()) || /china/i.test(region)) return "china";
  const lower = region.toLowerCase();
  if (ASIA_HINTS.some((h) => lower.includes(h))) return "asia";
  if (EUROPE_HINTS.some((h) => lower.includes(h))) return "europe";
  if (AMERICAS_HINTS.some((h) => lower.includes(h))) return "americas";
  if (OCEANIA_HINTS.some((h) => lower.includes(h))) return "oceania";
  if (ME_HINTS.some((h) => lower.includes(h))) return "middleeast";
  if (AFRICA_HINTS.some((h) => lower.includes(h))) return "africa";
  if (region.startsWith("Global")) return "global";
  if (type !== "Single") {
    if (/europe/i.test(region)) return "europe";
    if (/asia/i.test(region)) return "asia";
    if (/america|caribbean/i.test(region)) return "americas";
    if (/africa/i.test(region)) return "africa";
    if (/middle east|gulf|gcc/i.test(region)) return "middleeast";
    return "global";
  }
  return "asia";
}

/** Returns lowercase ISO country/region codes for flag images. */
export function getRegionFlagCodes(region: string, regionCode?: string): string[] {
  const exact = REGION_EXACT_FLAGS[region.trim()];
  if (exact) return exact;

  for (const entry of REGION_NAME_FLAGS) {
    if (entry.match.test(region)) return entry.codes;
  }

  if (regionCode) {
    const raw = regionCode.trim();
    if (!raw) return [];
    if (raw.includes("/") || raw.includes(",")) {
      return raw
        .split(/[/,]/)
        .map(normalizeFlagCode)
        .filter((c): c is string => Boolean(c));
    }
    const single = normalizeFlagCode(raw);
    if (single) return [single];
  }

  return [];
}

/** @deprecated use RegionFlag component + getRegionFlagCodes */
export function getRegionFlag(region: string, regionCode?: string): string {
  const codes = getRegionFlagCodes(region, regionCode);
  return codes[0]?.toUpperCase() ?? "";
}

export function getCardGradient(region: string, type: string): string {
  return GRADIENTS[getContinent(region, type)];
}

const INTROS_EN: Record<string, string> = {
  "China mainland":
    "Stay online across mainland China with roaming networks that keep WeChat, maps, and payments working. No local SIM swap needed.",
  "China (mainland HK Macao)":
    "One eSIM for mainland China, Hong Kong, and Macao. Ideal for family trips that hop between cities and the bay area.",
  "China mainland & Japan & South Korea":
    "Cover a classic East Asia itinerary with a single plan across China, Japan, and South Korea.",
  "Hong Kong (China)":
    "Fast local networks in Hong Kong for layovers, shopping trips, and short visits.",
  Japan: "High-speed data on major Japanese carriers. Great for Tokyo, Osaka, Kyoto, and beyond.",
  "South Korea": "Reliable 5G-ready coverage across Seoul, Busan, and popular travel spots.",
  Thailand: "Affordable data for Bangkok, Chiang Mai, Phuket, and islands across Thailand.",
  Singapore: "Instant connectivity in Singapore. Perfect for short business or layover trips.",
  Vietnam: "Stay connected from Hanoi to Ho Chi Minh City and coastal destinations.",
  "USA & Canada": "Cross-border coverage for road trips and visits across the US and Canada.",
  "Europe (40+ areas)":
    "One regional eSIM spanning 40+ European destinations. Skip buying a new plan at every border.",
  "Global (130+ areas)":
    "A single global plan for multi-continent itineraries when you need one eSIM everywhere.",
};

const INTROS_ZH: Record<string, string> = {
  "China mainland":
    "覆盖中国大陆的旅行eSIM，使用漫游网络，微信、地图和支付照常可用，无需更换本地SIM卡。",
  "China (mainland HK Macao)":
    "一张eSIM覆盖中国大陆、香港和澳门，适合探亲访友与粤港澳行程。",
  "China mainland & Japan & South Korea":
    "中日韩三国一张卡搞定，经典东亚行程最省心。",
  "Hong Kong (China)": "香港本地高速网络，短途出差或转机停留都很方便。",
  Japan: "日本主流运营商高速流量，东京、大阪、京都等热门城市覆盖。",
  "South Korea": "首尔、釜山等热门目的地可靠覆盖，支持5G网络。",
  Thailand: "曼谷、清迈、普吉等泰国热门城市的实惠流量套餐。",
  Singapore: "新加坡即开即用，短途商务或转机首选。",
  Vietnam: "从河内到胡志明市及沿海城市，一路保持在线。",
  "USA & Canada": "美加跨境覆盖，自驾和探亲访友更省心。",
  "Europe (40+ areas)": "一张区域eSIM覆盖40多个欧洲目的地，过境不用换卡。",
  "Global (130+ areas)": "多洲行程一张全球卡，走到哪里都有网。",
};

export function getRegionIntro(region: string, locale: "en" | "zh"): string | null {
  const map = locale === "zh" ? INTROS_ZH : INTROS_EN;
  return map[region] ?? null;
}

export function formatCnyApprox(usd: number): string {
  // Rough display estimate only — not a live FX rate.
  const cny = usd * 7.2;
  return `≈¥${cny.toFixed(0)}`;
}
