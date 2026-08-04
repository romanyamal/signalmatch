import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Guitar,
  Plus,
  X,
  GripVertical,
  Info,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Zap,
  Radio,
  Disc3,
  Waves,
  Timer,
  Sparkles,
  Sun,
  Moon,
  Download,
  Upload,
} from "lucide-react";

/* ---------------------------------------------------------------------- */
/* Theme                                                                   */
/* ---------------------------------------------------------------------- */
const THEMES = {
  dark: {
    bg: "#161512",
    panel: "#1E1C17",
    panelAlt: "#221F19",
    border: "#3A362C",
    text: "#EDEAE1",
    textDim: "#B8B2A3",
    textMuted: "#8A8579",
    textFaint: "#6E695C",
    accent: "#5EE6B4",
    accentBg: "#1B2B24",
    warnBg: "#221F19",
    warnText: "#E8B65A",
    warnBody: "#B8B2A3",
    danger: "#E86A5A",
    track: "#3A362C",
  },
  light: {
    bg: "#F4F1EA",
    panel: "#FFFFFF",
    panelAlt: "#ECE7DA",
    border: "#DCD4C2",
    text: "#221F19",
    textDim: "#453F33",
    textMuted: "#6E6656",
    textFaint: "#8A8270",
    accent: "#0E9A6C",
    accentBg: "#E1F3EA",
    warnBg: "#FBEEDA",
    warnText: "#8A5A12",
    warnBody: "#5C4A2A",
    danger: "#B23A2A",
    track: "#DCD4C2",
  },
};

const STAGE_META = {
  DYNA: { label: "Dynamics", icon: Zap },
  OD: { label: "Drive", icon: Radio },
  AMP: { label: "Amp", icon: Disc3 },
  CAB: { label: "Cabinet", icon: Disc3 },
  MOD: { label: "Modulation", icon: Waves },
  DELAY: { label: "Delay", icon: Timer },
  REVERB: { label: "Reverb", icon: Sparkles },
};
const DEFAULT_STAGE_ORDER = [
  "DYNA",
  "OD",
  "AMP",
  "CAB",
  "MOD",
  "DELAY",
  "REVERB",
];

/* ---------------------------------------------------------------------- */
/* Prime P1 real per-type field sets                                       */
/* ---------------------------------------------------------------------- */
const DYNA_PRIME_TYPES = {
  Comp: { fields: ["Attack", "Threshold", "Ratio", "Level"], confirmed: true },
  "Touch Wah": { fields: ["Attack", "Sens", "Peak", "Level"], confirmed: true },
  "Auto Wah": { fields: ["Rate", "Range", "Peak", "Level"], confirmed: true },
  NG: { fields: ["Threshold"], confirmed: true },
};
const MOD_PRIME_TYPES = {
  Phaser: { fields: ["Rate", "Level", "Depth"], confirmed: true },
  Flanger: { fields: ["Rate", "Mix", "Feedback"], confirmed: true },
  "Jet Flanger": { fields: ["Rate", "Mix", "Feedback"], confirmed: true },
  Tremolo: { fields: ["Rate", "Mix", "Tone"], confirmed: true },
  "Pitch Shift": { fields: ["Mix", "Tone", "Pitch"], confirmed: true },
  Rotary: { fields: ["Rate", "Mix", "Tone"], confirmed: true },
  "Ana Chorus": { fields: ["Rate", "Mix", "Tone", "Depth"], confirmed: true },
  "Tri Chorus": { fields: ["Rate", "Mix", "Tone", "Depth"], confirmed: true },
  Ring: { fields: ["Rate", "Mix", "Tone"], confirmed: true },
  "Q-Filter": { fields: ["Rate", "Mix", "Q"], confirmed: true },
  Lofi: { fields: ["Sample", "Mix", "Bit"], confirmed: true },
  "Slow Gear": { fields: ["Rise", "Level"], confirmed: true },
  Vibrato: { fields: ["Rate", "Mix", "Depth"], confirmed: false },
  Stutter: { fields: ["Rate", "Mix", "Level"], confirmed: false },
};
const DELAY_PRIME_TYPES = [
  "Digital",
  "Analog",
  "Real Echo",
  "Tape",
  "Mod",
  "Reverse",
];
const REVERB_PRIME_TYPES = ["Room", "Hall", "Plate", "Spring", "Mod"];
const PRIME_OD_NAMES = [
  "Pure Boost",
  "Flex Boost",
  "Tube DR",
  "808",
  "Gold Clon",
  "D-Drive",
  "Jimmy OD",
  "Full DR",
  "Beebee Pre",
  "Beebee+",
  "Black Rat",
  "Grey Faze",
  "Muffy",
  "Full DS",
  "Shred",
  "Riet",
  "MTL Zone",
  "MTL Master",
  "Obsessive Dist",
];

/* ---------------------------------------------------------------------- */
/* Real-gear reference (Tonebridge's own "modeled on" text)                */
/* ---------------------------------------------------------------------- */
const TONEBRIDGE_MODELED_ON = {
  "teavoy valveking": "Peavey ValveKing",
  echology: "BOSS RV-3 (reverb/delay)",
  "d-delay": "BOSS DD-7",
  "eq monster": "MXR M108 (10-band EQ)",
  ensembly: "BOSS CE-5 (Chorus)",
  "magic modulator": "Maestro Ring Modulator",
  octapuss: "BOSS OC-2 (Octave)",
  "phase '72": "MXR M101 (Phaser)",
  "phunk phaser": "Dunlop Uni-Vibe",
  vibrango: "BOSS VB-2 (Vibrato)",
  acoustic8: "BOSS AC-3 (Acoustic sim)",
  distortoise: "BOSS DS-1",
  elevenizer: "Ibanez TS8 (Tube Screamer-style)",
  "mountain blue": "BOSS BD-2 (Blues Driver)",
  "noise gate": "BOSS NS-2",
  "offroad overdrive": "MXR Distortion+",
  "rabid rodent": "Pro Co RAT",
  "the haze": "Electro-Harmonix Big Muff Pi",
  "the juicer": "Dan Armstrong Orange Squeezer",
  "thrasher pre": "TC Electronic Integrated Preamp",
  "tonemime bass": "Tech21 SansAmp Bass Driver DI",
  "tonemime gt": "Tech21 SansAmp GT2",
  "rocketon cottonmouth fuzz": "Rocktron Cottonmouth Fuzz",
  "rocketon hush noise reduction": "Rocktron HUSH",
  "rocketon metal planet distortion": "Rocktron Metal Planet",
  "rocketon zombie rectified distortion": "Rocktron Zombie",
  "somnic edgy g&g overdrive": "Sonic Edge J&J Overdrive",
  "somnic edgy tumbleneed": "The Sonic Edge Tumbleweed",
};
function lookupModeledOn(name) {
  if (!name) return null;
  return TONEBRIDGE_MODELED_ON[name.trim().toLowerCase()] || null;
}

/* Tonebridge's own amp/cabinet/mic catalogs — real hardware names + Ultimate
   Guitar's own "Modeled on ___" copy, taken directly from Tonebridge's
   Change Amplifier / Change Cabinet / Mic Model screens. */
const TONEBRIDGE_AMPS = [
  {
    name: "American Acoustic",
    type: "acoustic",
    lineage: "Fender Acoustasonic Junior DSP",
  },
  { name: "American Bass King", type: "bass", lineage: "Fender Bassman" },
  { name: "Ashedam ABM 900", type: "bass", lineage: "Ashdown ABM 900" },
  { name: "Trees Effect 1215", type: "bass", lineage: "Trace Elliot 1215" },
  { name: "Voltage VT Classic", type: "bass", lineage: "Ampeg SVT-CL" },
  { name: "Voltage VT Reissue", type: "bass", lineage: "Ampeg SVT-VR" },
  { name: "American Dual", type: "electric", lineage: "Fender Twin" },
  {
    name: "American Rebel",
    type: "electric",
    lineage: "Fender Hot Rod Deluxe",
  },
  {
    name: "Bogdan Xtreme 101",
    type: "electric",
    lineage: "Bogner Ecstasy 101B",
  },
  { name: "Badua SD30", type: "electric", lineage: "Budda SD30" },
  { name: "Colonel 900", type: "electric", lineage: "Marshall JCM900" },
  {
    name: "Colonel Jump 75",
    type: "electric",
    lineage: "1975 Marshall Master Model JMP 2203 100w Lead",
  },
  {
    name: "Colonel Plexi 50W",
    type: "electric",
    lineage: "Marshall JMP 50W Lead",
  },
  { name: "Colonel Vintage", type: "electric", lineage: "Marshall JTM45" },
  { name: "London Century", type: "electric", lineage: "Hiwat Custom 100" },
  { name: "Meteor", type: "electric", lineage: "ENGL Fireball E625" },
  {
    name: "Sultan Rack 88",
    type: "electric",
    lineage: "Soldano X88 preamp / Mesa Boogie 20/20 power module",
  },
  { name: "Talon Blues 5", type: "electric", lineage: "Lab Series L5" },
  {
    name: "Taos .50 Cal",
    type: "electric",
    lineage: "Mesa Studio .50 Caliber",
  },
  { name: "Taos C+", type: "electric", lineage: "Mesa Boogie Mark IIC+" },
  {
    name: "Taos Rectifier",
    type: "electric",
    lineage: "Mesa Boogie Dual Rectifier",
  },
  { name: "Teavoy 3120", type: "electric", lineage: "Peavey 3120" },
  { name: "Teavoy 6505+", type: "electric", lineage: "Peavey 6505+" },
  { name: "Teavoy 6534+", type: "electric", lineage: "Peavey 6534+" },
  { name: "Teavoy Classic 30", type: "electric", lineage: "Peavey Classic 30" },
  { name: "Teavoy ValveKing", type: "electric", lineage: "Peavey ValveKing" },
  {
    name: "Torgen Hot Mod Baby Blues",
    type: "electric",
    lineage: "Fargen Hot Mod (Fender Blues Jr-based)",
  },
  { name: "Torgen Olde 800", type: "electric", lineage: "Fargen Olde 800" },
  {
    name: "Torgen Super Collider",
    type: "electric",
    lineage: "Fargen Super Collider",
  },
  { name: "Vintage Brit", type: "electric", lineage: "VOX AC30" },
];
function lookupAmpLineage(name) {
  return TONEBRIDGE_AMPS.find((a) => a.name === name)?.lineage || null;
}

const TONEBRIDGE_CABS = [
  {
    name: "2x8 American Acoustic",
    type: "acoustic",
    lineage: "Fender Special Design 2x8 + tweeter",
  },
  {
    name: "4x10 American Bass King",
    type: "bass",
    lineage: "Jensen-loaded 4x10 bass cab",
  },
  {
    name: "8x10 Ashedam ABM-810",
    type: "bass",
    lineage: "8x10 British bass cab",
  },
  {
    name: "1x15 Trees Effect",
    type: "bass",
    lineage: "Celestion-loaded 1x15 bass cab + horn",
  },
  { name: "8x10 Voltage VT Classic", type: "bass", lineage: "8x10 bass cab" },
  {
    name: "2x12 American Dual",
    type: "electric",
    lineage: "Jensen-loaded 2x12",
  },
  {
    name: "1x12 American Rebel",
    type: "electric",
    lineage: "Eminence-loaded 1x12",
  },
  { name: "4x12 Bogdan", type: "electric", lineage: "4x12" },
  {
    name: "1x12 Badua SD30",
    type: "electric",
    lineage: "Phat speaker-loaded 1x12",
  },
  { name: "4x12 Colonel 900", type: "electric", lineage: "British 4x12" },
  { name: "1x12 Colonel Vintage", type: "electric", lineage: "British 1x12" },
  {
    name: "4x10 Colonel Vintage",
    type: "electric",
    lineage: "Celestion-loaded 4x10",
  },
  {
    name: "4x12 London Century",
    type: "electric",
    lineage: "FANE-loaded 4x12",
  },
  { name: "4x12 Meteor", type: "electric", lineage: "Celestion-loaded 4x12" },
  { name: "4x12 Sultan", type: "electric", lineage: "4x12" },
  {
    name: "2x12 Talon Ceramic",
    type: "electric",
    lineage: "CTS ceramic-loaded 2x12",
  },
  { name: "2x12 Talon Blues", type: "electric", lineage: "2x12" },
  { name: "1x10 Taos", type: "electric", lineage: "1x10" },
  {
    name: "4x12 Taos Rectifier",
    type: "electric",
    lineage: "Vintage 30-loaded 4x12",
  },
  {
    name: "4x12 Teavoy 6505+",
    type: "electric",
    lineage: "Sheffield-loaded 4x12",
  },
  {
    name: "1x12 Teavoy Classic 30",
    type: "electric",
    lineage: "Blue Marvel-loaded 1x12",
  },
  { name: "1x12 Teavoy ValveKing", type: "electric", lineage: "1x12" },
  { name: "4x12 Teavoy ValveKing", type: "electric", lineage: "4x12" },
  {
    name: "1x12 Torgen Baby Blues",
    type: "electric",
    lineage: "Celestion V30-loaded 1x12",
  },
  {
    name: "2x12 Torgen Olde 800",
    type: "electric",
    lineage: "WGS-loaded 2x12",
  },
  {
    name: "2x12 Torgen Super Collider",
    type: "electric",
    lineage: "Jensen-loaded 2x12",
  },
  {
    name: "2x12 Vintage Brit",
    type: "electric",
    lineage: "Celestion G12-loaded 2x12",
  },
];

const TONEBRIDGE_MICS = [
  { name: "KGB 414", lineage: "AKG C414" },
  { name: "Technique 4033", lineage: "Audio-Technica AT4033" },
  { name: "KGB 451", lineage: "AKG C451" },
  { name: "Wideload 421", lineage: "Sennheiser MD 421 II" },
  { name: "Broadcast 20", lineage: "Electro-Voice RE20" },
  { name: "Workhorse 57", lineage: "Shure SM57" },
  { name: "Workhorse 58", lineage: "Shure SM58" },
  { name: "Germann 87", lineage: "Neumann U 87" },
];

/* Prime P1 amp list — tier: CL/OD/DS. lineage only set where confident. */
const PRIME_AMPS = [
  {
    name: "US DLX",
    tier: "CL",
    family: "US DLX",
    lineage: "Fender '65 Deluxe Reverb-style",
  },
  {
    name: "US TW",
    tier: "CL",
    family: "US TW",
    lineage: "Fender '65 Twin Reverb-style",
  },
  {
    name: "US Bass",
    tier: "CL",
    family: "US Bass",
    lineage: "Fender '59 Bassman-style",
  },
  { name: "US Sonic", tier: "CL", family: "US Sonic", lineage: null },
  {
    name: "US Blues CL",
    tier: "CL",
    family: "US Blues",
    lineage: "Fender Blues Deluxe-style",
  },
  {
    name: "US Blues OD",
    tier: "OD",
    family: "US Blues",
    lineage: "Fender Blues Deluxe-style (driven)",
  },
  { name: "E650 CL", tier: "CL", family: "E650", lineage: null },
  { name: "E650 DS", tier: "DS", family: "E650", lineage: null },
  { name: "Powerbell CL", tier: "CL", family: "Powerbell", lineage: null },
  { name: "Powerbell DS", tier: "DS", family: "Powerbell", lineage: null },
  { name: "Blacknight CL", tier: "CL", family: "Blacknight", lineage: null },
  { name: "Blacknight DS", tier: "DS", family: "Blacknight", lineage: null },
  {
    name: "Mark III CL",
    tier: "CL",
    family: "Mark III",
    lineage: "Mesa Boogie Mark III-style",
  },
  {
    name: "Mark III DS",
    tier: "DS",
    family: "Mark III",
    lineage: "Mesa Boogie Mark III-style",
  },
  {
    name: "Mark V CL",
    tier: "CL",
    family: "Mark V",
    lineage: "Mesa Boogie Mark V-style",
  },
  {
    name: "Mark V DS",
    tier: "DS",
    family: "Mark V",
    lineage: "Mesa Boogie Mark V-style",
  },
  {
    name: "Tri Rec CL",
    tier: "CL",
    family: "Tri Rec",
    lineage: "Mesa Boogie Triple Rectifier-style",
  },
  {
    name: "Tri Rec DS",
    tier: "DS",
    family: "Tri Rec",
    lineage: "Mesa Boogie Triple Rectifier-style",
  },
  {
    name: "Rockvrb CL",
    tier: "CL",
    family: "Rockvrb",
    lineage: "Ampeg Reverberocket-style",
  },
  {
    name: "Rockvrb DS",
    tier: "DS",
    family: "Rockvrb",
    lineage: "Ampeg Reverberocket-style",
  },
  {
    name: "Dr Zee 18 JR",
    tier: "CL",
    family: "Dr Zee",
    lineage: "Dr. Z-style boutique",
  },
  {
    name: "Dr Zee Reck",
    tier: "OD",
    family: "Dr Zee",
    lineage: "Dr. Z-style boutique",
  },
  { name: "Jet 100H CL", tier: "CL", family: "Jet 100H", lineage: null },
  { name: "Jet 100H OD", tier: "OD", family: "Jet 100H", lineage: null },
  {
    name: "Jazz 120",
    tier: "CL",
    family: "Jazz 120",
    lineage: "Roland JC-120-style",
  },
  {
    name: "UK 30 CL",
    tier: "CL",
    family: "UK 30",
    lineage: "British 30W amp-style",
  },
  {
    name: "UK 30 OD",
    tier: "OD",
    family: "UK 30",
    lineage: "British 30W amp-style",
  },
  {
    name: "HWT 103",
    tier: "CL",
    family: "HWT",
    lineage: "Hughes & Kettner-style",
  },
  {
    name: "PV5050 CL",
    tier: "CL",
    family: "PV5050",
    lineage: "Peavey 5150-style",
  },
  {
    name: "PV 5050 DS",
    tier: "DS",
    family: "PV5050",
    lineage: "Peavey 5150-style",
  },
  { name: "Regal Tone CL", tier: "CL", family: "Regal Tone", lineage: null },
  { name: "Regal Tone OD1", tier: "OD", family: "Regal Tone", lineage: null },
  { name: "Regal Tone OD2", tier: "OD", family: "Regal Tone", lineage: null },
  { name: "Carol CL", tier: "CL", family: "Carol", lineage: null },
  { name: "Carol OD", tier: "OD", family: "Carol", lineage: null },
  { name: "Cardeff", tier: "CL", family: "Cardeff", lineage: null },
  {
    name: "EV 5050 CL",
    tier: "CL",
    family: "EV5050",
    lineage: "EVH 5150III-style",
  },
  {
    name: "EV 5050 DS",
    tier: "DS",
    family: "EV5050",
    lineage: "EVH 5150III-style",
  },
  {
    name: "HT Club CL",
    tier: "CL",
    family: "HT Club",
    lineage: "Blackstar HT Club-style",
  },
  {
    name: "HT Club DS",
    tier: "DS",
    family: "HT Club",
    lineage: "Blackstar HT Club-style",
  },
  {
    name: "Hugen CL",
    tier: "CL",
    family: "Hugen",
    lineage: "Boutique high-gain (Bogner-style)",
  },
  {
    name: "Hugen OD",
    tier: "OD",
    family: "Hugen",
    lineage: "Boutique high-gain (Bogner-style)",
  },
  {
    name: "Hugen DS",
    tier: "DS",
    family: "Hugen",
    lineage: "Boutique high-gain (Bogner-style)",
  },
  { name: "Koche OD", tier: "OD", family: "Koche", lineage: "Koch-style" },
  { name: "Koche DS", tier: "DS", family: "Koche", lineage: "Koch-style" },
  {
    name: "J800",
    tier: "OD",
    family: "J800",
    lineage: "Marshall JCM800-style",
  },
  {
    name: "J900",
    tier: "DS",
    family: "J900",
    lineage: "Marshall JCM900-style",
  },
  { name: "PLX 100", tier: "OD", family: "PLX 100", lineage: null },
  {
    name: "Citrus 30",
    tier: "OD",
    family: "Citrus",
    lineage: "Orange amp-style",
  },
  {
    name: "Citrus 50",
    tier: "OD",
    family: "Citrus",
    lineage: "Orange amp-style",
  },
  { name: "Slow 100 CR", tier: "OD", family: "Slow 100", lineage: null },
  { name: "Slow 100 DS", tier: "DS", family: "Slow 100", lineage: null },
];
const PRIME_CABS = [
  "Regal Tone 110",
  "US DLX 112",
  "Sonic 112",
  "Blues 112",
  "Mark 112",
  "Dr Zee 112",
  "Cardeff 112",
  "US TW 212",
  "Citrus 212",
  "Dr Zee 212",
  "Jazz 212",
  "UK 212",
  "Tow Stones 212",
  "US Bass 410",
  "1960 412",
  "Eagle P412",
  "Eagle S412",
  "Rec 412",
  "Citrus 412",
  "Slow 412",
  "HWT 412",
  "PV5050 412",
  "EV5050 412",
  "HT 412",
  "Diesel 412",
];

const AMP_KEYWORD_MAP = [
  { kw: "svt", families: ["US Bass"] },
  { kw: "bassman", families: ["US Bass"] },
  { kw: "peavey", families: ["PV5050"] },
  { kw: "evh", families: ["EV5050"] },
  { kw: "fender", families: ["US DLX", "US TW", "US Bass", "US Blues"] },
  { kw: "mesa", families: ["Mark III", "Mark V", "Tri Rec"] },
  { kw: "rectifier", families: ["Tri Rec"] },
  { kw: "roland", families: ["Jazz 120"] },
  { kw: "orange", families: ["Citrus"] },
  { kw: "blackstar", families: ["HT Club"] },
  { kw: "ampeg", families: ["Rockvrb"] },
  { kw: "marshall", families: ["J800", "J900"] },
  { kw: "jcm800", families: ["J800"] },
  { kw: "jcm900", families: ["J900"] },
  { kw: "hughes", families: ["HWT"] },
  { kw: "koch", families: ["Koche"] },
  { kw: "bogner", families: ["Hugen"] },
  { kw: "vox", families: ["UK 30"] },
  { kw: "hiwat", families: ["HWT"] },
  { kw: "engl", families: ["Hugen"] },
  { kw: "soldano", families: ["Hugen"] },
  { kw: "budda", families: ["Dr Zee"] },
  { kw: "fargen", families: ["Dr Zee"] },
  { kw: "trace elliot", families: ["US Bass"] },
  { kw: "ashdown", families: ["US Bass"] },
];
const OD_KEYWORD_MAP = [
  { kw: "tube screamer", name: "808" },
  { kw: "ts8", name: "808" },
  { kw: "ts9", name: "808" },
  { kw: "rat", name: "Black Rat" },
  { kw: "big muff", name: "Muffy" },
  { kw: "muff pi", name: "Muffy" },
  { kw: "klon", name: "Gold Clon" },
  { kw: "bb preamp", name: "Beebee Pre" },
  { kw: "xotic", name: "Beebee Pre" },
  { kw: "ocd", name: "Obsessive Dist" },
  { kw: "metal zone", name: "MTL Zone" },
];
const OD_TIER_FALLBACK = { low: "Pure Boost", mid: "808", high: "Full DS" };

function tierFromGain(g) {
  return g <= 3 ? "CL" : g <= 6.5 ? "OD" : "DS";
}
function matchAmp(realGearHint, gainTier) {
  const hint = (realGearHint || "").toLowerCase();
  let families = null;
  for (const e of AMP_KEYWORD_MAP)
    if (hint.includes(e.kw)) {
      families = e.families;
      break;
    }
  let pool = families
    ? PRIME_AMPS.filter((a) => families.includes(a.family))
    : null;
  const matchType = pool ? "lineage" : "tier-only";
  if (!pool || pool.length === 0) pool = PRIME_AMPS;
  let byTier = pool.filter((a) => a.tier === gainTier);
  if (byTier.length === 0) byTier = pool;
  const chosen = byTier[0] || PRIME_AMPS[0];
  const reason =
    matchType === "lineage"
      ? `Matched via real-gear lineage (${realGearHint} → ${chosen.lineage || chosen.family}).`
      : `No known lineage for "${realGearHint || "this pedal"}" — matched by gain character only (${gainTier}-tier).`;
  return { amp: chosen, reason };
}
function matchCab(ampName) {
  const amp = PRIME_AMPS.find((a) => a.name === ampName) || PRIME_AMPS[0];
  const fam = amp.family.toLowerCase().replace(/\s+/g, "");
  const match = PRIME_CABS.find((c) =>
    c.toLowerCase().replace(/\s+/g, "").startsWith(fam),
  );
  if (match)
    return {
      cab: match,
      reason: `Name-matched to the ${amp.family} amp family.`,
    };
  const sizeMap = { CL: "112", OD: "212", DS: "412" };
  const size = sizeMap[amp.tier] || "212";
  const bySize = PRIME_CABS.find((c) => c.includes(size));
  const sizeLabel = size === "112" ? "1x12" : size === "212" ? "2x12" : "4x12";
  return {
    cab: bySize || PRIME_CABS[0],
    reason: `No name match for "${amp.family}" — picked a ${sizeLabel} sized for a ${amp.tier}-tier tone.`,
  };
}
function matchOD(realGearHint, gain0to10) {
  const hint = (realGearHint || "").toLowerCase();
  for (const e of OD_KEYWORD_MAP)
    if (hint.includes(e.kw))
      return {
        name: e.name,
        reason: `Matched via real-gear lineage (${realGearHint}).`,
      };
  const tier = gain0to10 <= 3 ? "low" : gain0to10 <= 6.5 ? "mid" : "high";
  return {
    name: OD_TIER_FALLBACK[tier],
    reason: `No known lineage — matched by drive amount (${tier}).`,
  };
}

/* ---------------------------------------------------------------------- */
/* Prime-side stage definitions (drive the editable output UI)             */
/* ---------------------------------------------------------------------- */
const FIELD_RANGE = {
  Time: { min: 0, max: 2000, step: 10, unit: "ms", def: 500 },
  "Pre Delay": { min: 0, max: 100, step: 1, unit: "ms", def: 5 },
  Pitch: { min: -100, max: 100, step: 1, unit: "", def: 0 },
  default: { min: 0, max: 100, step: 1, unit: "", def: 50 },
};
function rangeFor(field) {
  return FIELD_RANGE[field] || FIELD_RANGE.default;
}

const PRIME_STAGE_DEFS = {
  DYNA: {
    options: Object.keys(DYNA_PRIME_TYPES),
    fieldsFor: (t) => (DYNA_PRIME_TYPES[t] || DYNA_PRIME_TYPES.Comp).fields,
  },
  OD: { options: PRIME_OD_NAMES, fieldsFor: () => ["Gain", "Tone", "Vol"] },
  AMP: {
    options: PRIME_AMPS.map((a) => a.name),
    fieldsFor: () => ["Gain", "Bass", "Mid", "Treble", "Presence", "Master"],
  },
  CAB: { options: PRIME_CABS, fieldsFor: () => [] },
  MOD: {
    options: Object.keys(MOD_PRIME_TYPES),
    fieldsFor: (t) =>
      (MOD_PRIME_TYPES[t] || MOD_PRIME_TYPES["Ana Chorus"]).fields,
  },
  DELAY: {
    options: DELAY_PRIME_TYPES,
    fieldsFor: () => ["Level", "Feedback", "Time"],
  },
  REVERB: {
    options: REVERB_PRIME_TYPES,
    fieldsFor: () => ["Pre Delay", "Level", "Decay", "Tone"],
  },
};

function defaultParams(stage, type) {
  const fields = PRIME_STAGE_DEFS[stage].fieldsFor(type);
  const out = {};
  fields.forEach((f) => (out[f] = rangeFor(f).def));
  return out;
}

/* ---------------------------------------------------------------------- */
/* Tonebridge-style input pedal categories                                */
/* ---------------------------------------------------------------------- */
const CATEGORIES = {
  NOISE_GATE: {
    label: "Noise Gate",
    stage: "DYNA",
    fields: [
      {
        key: "threshold",
        label: "Threshold",
        type: "slider",
        min: 0,
        max: 10,
        step: 0.1,
        def: 3.5,
      },
      {
        key: "decay",
        label: "Decay",
        type: "slider",
        min: 0,
        max: 10,
        step: 0.1,
        def: 2.0,
      },
    ],
  },
  COMPRESSOR: {
    label: "Compressor",
    stage: "DYNA",
    fields: [
      {
        key: "level",
        label: "Level",
        type: "slider",
        min: 0,
        max: 10,
        step: 0.1,
        def: 5,
      },
      {
        key: "sustain",
        label: "Sustain",
        type: "slider",
        min: 0,
        max: 10,
        step: 0.1,
        def: 5,
      },
      {
        key: "attack",
        label: "Attack",
        type: "slider",
        min: 0,
        max: 10,
        step: 0.1,
        def: 5,
      },
      {
        key: "tone",
        label: "Tone",
        type: "slider",
        min: 0,
        max: 10,
        step: 0.1,
        def: 5,
      },
    ],
  },
  DRIVE: {
    label: "Drive / Overdrive / Distortion / Fuzz",
    stage: "OD",
    fields: [
      {
        key: "drive",
        label: "Drive",
        type: "slider",
        min: 0,
        max: 10,
        step: 0.1,
        def: 5,
      },
      {
        key: "tone",
        label: "Tone",
        type: "slider",
        min: 0,
        max: 10,
        step: 0.1,
        def: 5,
      },
      {
        key: "level",
        label: "Level",
        type: "slider",
        min: 0,
        max: 10,
        step: 0.1,
        def: 5,
      },
    ],
  },
  AMP: {
    label: "Amp Head",
    stage: "AMP",
    fields: [
      {
        key: "model",
        label: "Amp Model",
        type: "select",
        options: TONEBRIDGE_AMPS.map((a) => a.name),
        def: "American Dual",
      },
      {
        key: "volume",
        label: "Volume",
        type: "slider",
        min: 0,
        max: 10,
        step: 0.1,
        def: 5,
      },
      {
        key: "drive",
        label: "Drive",
        type: "slider",
        min: 0,
        max: 10,
        step: 0.1,
        def: 5,
      },
      {
        key: "presence",
        label: "Presence",
        type: "slider",
        min: 0,
        max: 10,
        step: 0.1,
        def: 5,
      },
      {
        key: "resonance",
        label: "Resonance",
        type: "slider",
        min: 0,
        max: 10,
        step: 0.1,
        def: 0,
      },
      {
        key: "texture",
        label: "Texture",
        type: "slider",
        min: 0,
        max: 10,
        step: 0.1,
        def: 5,
      },
      {
        key: "bass",
        label: "Bass",
        type: "slider",
        min: 0,
        max: 10,
        step: 0.1,
        def: 5,
      },
      {
        key: "mid",
        label: "Mid",
        type: "slider",
        min: 0,
        max: 10,
        step: 0.1,
        def: 5,
      },
      {
        key: "treble",
        label: "Treble",
        type: "slider",
        min: 0,
        max: 10,
        step: 0.1,
        def: 5,
      },
      {
        key: "reverb",
        label: "Reverb",
        type: "slider",
        min: 0,
        max: 10,
        step: 0.1,
        def: 0,
      },
    ],
  },
  CAB: {
    label: "Cabinet + Mic",
    stage: "CAB",
    fields: [
      {
        key: "model",
        label: "Cabinet Model",
        type: "select",
        options: TONEBRIDGE_CABS.map((c) => c.name),
        def: "2x12 American Dual",
      },
      { key: "power", label: "Power", type: "toggle", def: true },
      {
        key: "micModel",
        label: "Mic Model",
        type: "select",
        options: TONEBRIDGE_MICS.map((m) => m.name),
        def: "Workhorse 57",
      },
      {
        key: "micPosition",
        label: "Mic Position",
        type: "select",
        options: ["On Axis", "Off Axis", "Edge", "Back"],
        def: "On Axis",
      },
    ],
  },
  MOD: {
    label: "Modulation (Chorus / Flanger / Phaser / Tremolo…)",
    stage: "MOD",
    fields: [
      {
        key: "type",
        label: "Type",
        type: "select",
        def: "Ana Chorus",
        options: Object.keys(MOD_PRIME_TYPES),
      },
      {
        key: "rate",
        label: "Rate",
        type: "slider",
        min: 0,
        max: 10,
        step: 0.1,
        def: 5,
      },
      {
        key: "depth",
        label: "Depth",
        type: "slider",
        min: 0,
        max: 10,
        step: 0.1,
        def: 5,
      },
      {
        key: "mix",
        label: "Mix / Level",
        type: "slider",
        min: 0,
        max: 10,
        step: 0.1,
        def: 5,
      },
    ],
  },
  DELAY: {
    label: "Delay / Echo",
    stage: "DELAY",
    fields: [
      {
        key: "type",
        label: "Prime delay type",
        type: "select",
        def: "Digital",
        options: DELAY_PRIME_TYPES,
      },
      {
        key: "effectLevel",
        label: "Effect Level",
        type: "slider",
        min: 0,
        max: 10,
        step: 0.1,
        def: 3,
      },
      {
        key: "time",
        label: "Time (s)",
        type: "slider",
        min: 0,
        max: 3,
        step: 0.05,
        def: 0.4,
      },
      {
        key: "color",
        label: "Color",
        type: "slider",
        min: 0,
        max: 10,
        step: 0.1,
        def: 5,
      },
      {
        key: "space",
        label: "Space (Echology only)",
        type: "select",
        options: ["None", "Hall", "Room", "Plate", "Spring"],
        def: "None",
      },
    ],
  },
  REVERB: {
    label: "Reverb (standalone)",
    stage: "REVERB",
    fields: [
      {
        key: "level",
        label: "Level",
        type: "slider",
        min: 0,
        max: 10,
        step: 0.1,
        def: 3,
      },
      {
        key: "decay",
        label: "Decay",
        type: "slider",
        min: 0,
        max: 10,
        step: 0.1,
        def: 5,
      },
      {
        key: "tone",
        label: "Tone",
        type: "slider",
        min: 0,
        max: 10,
        step: 0.1,
        def: 5,
      },
      {
        key: "space",
        label: "Space",
        type: "select",
        options: ["Hall", "Room", "Plate", "Spring", "None"],
        def: "Hall",
      },
    ],
  },
  EQ: {
    label: "Graphic EQ",
    stage: "AMP",
    isEq: true,
    fields: [
      {
        key: "level",
        label: "Level",
        type: "slider",
        min: 0,
        max: 10,
        step: 0.1,
        def: 5,
      },
      {
        key: "b31",
        label: "31.25 Hz",
        type: "slider",
        min: -12,
        max: 12,
        step: 0.1,
        def: 0,
      },
      {
        key: "b62",
        label: "62.5 Hz",
        type: "slider",
        min: -12,
        max: 12,
        step: 0.1,
        def: 0,
      },
      {
        key: "b125",
        label: "125 Hz",
        type: "slider",
        min: -12,
        max: 12,
        step: 0.1,
        def: 0,
      },
      {
        key: "b250",
        label: "250 Hz",
        type: "slider",
        min: -12,
        max: 12,
        step: 0.1,
        def: 0,
      },
      {
        key: "b500",
        label: "500 Hz",
        type: "slider",
        min: -12,
        max: 12,
        step: 0.1,
        def: 0,
      },
      {
        key: "b1k",
        label: "1 kHz",
        type: "slider",
        min: -12,
        max: 12,
        step: 0.1,
        def: 0,
      },
      {
        key: "b2k",
        label: "2 kHz",
        type: "slider",
        min: -12,
        max: 12,
        step: 0.1,
        def: 0,
      },
      {
        key: "b4k",
        label: "4 kHz",
        type: "slider",
        min: -12,
        max: 12,
        step: 0.1,
        def: 0,
      },
      {
        key: "b8k",
        label: "8 kHz",
        type: "slider",
        min: -12,
        max: 12,
        step: 0.1,
        def: 0,
      },
      {
        key: "b16k",
        label: "16 kHz",
        type: "slider",
        min: -12,
        max: 12,
        step: 0.1,
        def: 0,
      },
    ],
  },
};
function defaultValues(catKey) {
  const out = {};
  CATEGORIES[catKey].fields.forEach((f) => (out[f.key] = f.def));
  return out;
}

/* ---------------------------------------------------------------------- */
/* Guitars & pickup positions                                             */
/* ---------------------------------------------------------------------- */
const GUITARS = {
  telecaster: {
    label: "Telecaster (single-coil / noiseless)",
    outputComp: 8,
    positions: [
      {
        key: "bridge",
        label: "Bridge",
        desc: "Brightest, twangy, cuts through.",
        delta: { treble: 8, presence: 8, gain: -4 },
      },
      {
        key: "middle",
        label: "Middle (both pickups)",
        desc: "Scooped, quacky, glassy.",
        delta: { mid: -8, treble: 2 },
      },
      {
        key: "neck",
        label: "Neck",
        desc: "Warm, round, smooth.",
        delta: { treble: -10, bass: 5, mid: 5 },
      },
    ],
  },
  stratocaster: {
    label: "Stratocaster (single-coil)",
    outputComp: 8,
    positions: [
      {
        key: "bridge",
        label: "Bridge",
        desc: "Bright, cutting, thin under heavy gain.",
        delta: { treble: 8, presence: 8, gain: -4 },
      },
      {
        key: "position2",
        label: "Position 2 (bridge+middle)",
        desc: "Classic quack.",
        delta: { mid: -10, treble: 2 },
      },
      {
        key: "middle",
        label: "Middle",
        desc: "Balanced, slightly warm.",
        delta: { mid: -3 },
      },
      {
        key: "position4",
        label: "Position 4 (middle+neck)",
        desc: "Warm quack.",
        delta: { mid: -6, bass: 3 },
      },
      {
        key: "neck",
        label: "Neck",
        desc: "Warm, round, thick.",
        delta: { treble: -10, bass: 5, mid: 5 },
      },
    ],
  },
  humbucker: {
    label: "Les Paul / other humbucker guitar",
    outputComp: -6,
    positions: [
      {
        key: "bridge",
        label: "Bridge",
        desc: "Thick, cutting, high output.",
        delta: { presence: 4, gain: 2 },
      },
      {
        key: "middle",
        label: "Both (middle switch)",
        desc: "Fuller, slightly scooped.",
        delta: { mid: -4 },
      },
      {
        key: "neck",
        label: "Neck",
        desc: "Warm, thick, smooth.",
        delta: { treble: -6, bass: 4 },
      },
    ],
  },
  semihollow: {
    label: "Semi-hollow / P90 guitar",
    outputComp: 3,
    positions: [
      {
        key: "bridge",
        label: "Bridge",
        desc: "Bright with airy body.",
        delta: { treble: 5, presence: 4 },
      },
      {
        key: "neck",
        label: "Neck",
        desc: "Warm, woody.",
        delta: { treble: -6, bass: 4 },
      },
    ],
  },
  acoustic: {
    label: "Acoustic-Electric",
    outputComp: -3,
    positionsLabel: "Pickup / mic system",
    positions: [
      {
        key: "undersaddle",
        label: "Under-saddle Piezo",
        desc: "Bright, slightly quacky.",
        delta: { treble: -8, presence: -6, mid: 6, bass: 4 },
      },
      {
        key: "soundhole",
        label: "Soundhole Magnetic",
        desc: "Warmer, more electric-like.",
        delta: { bass: 4, treble: -3 },
      },
      {
        key: "mic",
        label: "Internal Mic",
        desc: "Most natural — keep EQ changes gentle.",
        delta: {},
      },
      {
        key: "blended",
        label: "Blended (Piezo + Mic)",
        desc: "Balances clarity with warmth.",
        delta: { treble: -3, mid: 2 },
      },
    ],
  },
};

const clamp = (n) => Math.max(0, Math.min(100, Math.round(n)));
const pct = (v) => clamp((v || 0) * 10);
const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
const uid = () => Math.random().toString(36).slice(2, 9);

function buildExampleChain() {
  return [
    {
      id: uid(),
      category: "NOISE_GATE",
      name: "Noise Gate",
      values: { power: true, threshold: 3.5, decay: 2.0 },
    },
    {
      id: uid(),
      category: "AMP",
      name: "",
      values: {
        model: "Teavoy ValveKing",
        volume: 7.5,
        drive: 3.4,
        presence: 6.4,
        resonance: 0.0,
        texture: 7.8,
        bass: 7.0,
        mid: 6.0,
        treble: 7.5,
        reverb: 0,
      },
    },
    {
      id: uid(),
      category: "DELAY",
      name: "Echology",
      values: {
        type: "Digital",
        effectLevel: 1.5,
        time: 0.9,
        color: 10.0,
        space: "Hall",
      },
    },
    {
      id: uid(),
      category: "CAB",
      name: "",
      values: {
        model: "4x12 Teavoy ValveKing",
        power: true,
        micModel: "Workhorse 57",
        micPosition: "On Axis",
      },
    },
    {
      id: uid(),
      category: "EQ",
      name: "EQ Monster",
      values: {
        level: 5.0,
        b31: -12,
        b62: -8.7,
        b125: -5.9,
        b250: -2.8,
        b500: -1.0,
        b1k: 0.0,
        b2k: 0.0,
        b4k: 1.0,
        b8k: 0.8,
        b16k: -1.9,
      },
    },
  ];
}

/* ---------------------------------------------------------------------- */
/* Mod generic -> Prime-type field mapping                                */
/* ---------------------------------------------------------------------- */
function mapModFields(type, v) {
  const def = MOD_PRIME_TYPES[type] || MOD_PRIME_TYPES["Ana Chorus"];
  const rate = pct(v.rate),
    depth = pct(v.depth),
    mix = pct(v.mix);
  const params = {};
  const notes = [];
  def.fields.forEach((f) => {
    switch (f) {
      case "Rate":
        params[f] = rate;
        break;
      case "Mix":
        params[f] = mix;
        break;
      case "Level":
        params[f] = mix;
        break;
      case "Depth":
        params[f] = depth;
        break;
      case "Feedback":
        params[f] = depth;
        notes.push(
          "No direct Feedback knob on the Tonebridge side — using Depth as a stand-in.",
        );
        break;
      case "Tone":
        params[f] = 50;
        notes.push("No Tone control on the Tonebridge side — starting at 50.");
        break;
      case "Q":
        params[f] = depth;
        notes.push("Using Depth as a stand-in for Q.");
        break;
      case "Sample":
        params[f] = rate;
        notes.push("Using Rate as a stand-in for Sample rate.");
        break;
      case "Bit":
        params[f] = depth;
        notes.push("Using Depth as a stand-in for Bit depth.");
        break;
      case "Rise":
        params[f] = clamp(100 - rate);
        notes.push("Using inverse Rate as a stand-in for Rise.");
        break;
      case "Pitch":
        params[f] = 0;
        notes.push("No Pitch control on the Tonebridge side — set manually.");
        break;
      default:
        params[f] = mix;
    }
  });
  if (!def.confirmed)
    notes.push(
      `${type}'s exact Prime field names aren't confirmed yet — best estimate.`,
    );
  return { params, note: notes.join(" ") };
}

/* ---------------------------------------------------------------------- */
/* Conversion: builds the auto-computed baseline output list               */
/* ---------------------------------------------------------------------- */
function computeBaseline(chain, guitar, position) {
  const items = [];
  let ampEq = null;
  let ampItemId = null;
  const eqFolds = [];

  chain.forEach((pedal) => {
    const v = pedal.values;
    switch (pedal.category) {
      case "NOISE_GATE":
        items.push({
          id: pedal.id,
          stage: "DYNA",
          type: "NG",
          originName: pedal.name || "Noise Gate",
          params: { Threshold: pct(v.threshold) },
          note: "Prime's NG only has a Threshold control (confirmed by screenshot) — Tonebridge's Decay has no Prime equivalent.",
        });
        break;
      case "COMPRESSOR":
        items.push({
          id: pedal.id,
          stage: "DYNA",
          type: "Comp",
          originName: pedal.name || "Compressor",
          params: {
            Attack: pct(v.attack),
            Threshold: clamp(100 - pct(v.sustain)),
            Ratio: 50,
            Level: pct(v.level),
          },
          note: "Tonebridge's Sustain/Tone don't map 1:1 — Threshold inverted from Sustain, Ratio defaults to 50.",
        });
        break;
      case "DRIVE": {
        const lineage = lookupModeledOn(pedal.name);
        const od = matchOD(lineage, v.drive);
        items.push({
          id: pedal.id,
          stage: "OD",
          type: od.name,
          originName: pedal.name || "Drive",
          params: { Gain: pct(v.drive), Tone: pct(v.tone), Vol: pct(v.level) },
          note: (lineage ? `Modeled on ${lineage}. ` : "") + od.reason,
        });
        break;
      }
      case "AMP": {
        const eq = {
          gain: pct(v.drive),
          bass: pct(v.bass),
          mid: pct(v.mid),
          treble: pct(v.treble),
          presence: pct(v.presence),
        };
        const modelLineage = lookupAmpLineage(v.model);
        const lineage = modelLineage || lookupModeledOn(pedal.name);
        const { amp, reason } = matchAmp(lineage, tierFromGain(v.drive));
        items.push({
          id: pedal.id,
          stage: "AMP",
          type: amp.name,
          originName: pedal.name
            ? `${pedal.name} (${v.model})`
            : v.model || "Amp",
          params: {
            Gain: eq.gain,
            Bass: eq.bass,
            Mid: eq.mid,
            Treble: eq.treble,
            Presence: eq.presence,
            Master: pct(v.volume),
          },
          note: (lineage ? `Modeled on ${lineage}. ` : "") + reason,
        });
        ampItemId = pedal.id;
        ampEq = eq;
        const { cab, reason: cabReason } = matchCab(amp.name);
        items.push({
          id: pedal.id + "-cab",
          stage: "CAB",
          type: cab,
          originName: null,
          params: {},
          note: cabReason,
        });
        if (v.reverb > 0) {
          items.push({
            id: pedal.id + "-rv",
            stage: "REVERB",
            type: "Room",
            originName: (pedal.name || "Amp") + " (onboard reverb)",
            params: {
              "Pre Delay": 5,
              Level: pct(v.reverb),
              Decay: 50,
              Tone: 50,
            },
            note: "Carried over from the amp's built-in reverb.",
          });
        }
        break;
      }
      case "CAB": {
        const cabInfo = TONEBRIDGE_CABS.find((c) => c.name === v.model);
        const micInfo = TONEBRIDGE_MICS.find((m) => m.name === v.micModel);
        items.push({
          id: pedal.id,
          stage: "CAB",
          type: null,
          isInfo: true,
          originName: pedal.name || v.model || "Cabinet + Mic",
          note:
            `${v.model || "Cabinet"}${cabInfo ? ` (${cabInfo.lineage})` : ""}, mic'd with ${v.micModel || "—"}` +
            `${micInfo ? ` (${micInfo.lineage})` : ""} at ${v.micPosition} — none of this carries to Prime; ` +
            `its Cab stage has no mic modeling and the cab choice comes from the matched amp instead.`,
        });
        break;
      }
      case "MOD": {
        const { params, note } = mapModFields(v.type, v);
        items.push({
          id: pedal.id,
          stage: "MOD",
          type: v.type,
          originName: pedal.name || "Modulation",
          params,
          note,
        });
        break;
      }
      case "DELAY": {
        const rawMs = Math.round((v.time || 0) * 1000);
        const timeRange = rangeFor("Time");
        const ms = Math.max(timeRange.min, Math.min(timeRange.max, rawMs));
        const clampNote =
          rawMs > timeRange.max
            ? ` Tonebridge's time (${rawMs}ms) exceeds Prime's ${timeRange.max}ms max — clamped down.`
            : "";
        items.push({
          id: pedal.id,
          stage: "DELAY",
          type: v.type,
          originName: pedal.name || "Delay",
          params: {
            Level: pct(v.effectLevel),
            Feedback: 30,
            Time: ms,
          },
          note:
            "Feedback defaulted to a conservative single-repeat value (30%) — Tonebridge's Color knob is a tone/brightness control on the real hardware, not repeats, so mapping it 1:1 to Feedback would let a maxed-out Color produce a runaway 100% self-oscillating delay. No Tonebridge equivalent for repeats exists here." +
            clampNote,
        });
        if (v.space && v.space !== "None") {
          const type = REVERB_PRIME_TYPES.includes(v.space) ? v.space : "Room";
          items.push({
            id: pedal.id + "-rv",
            stage: "REVERB",
            type,
            originName: (pedal.name || "Delay") + " (reverb side)",
            params: {
              "Pre Delay": 5,
              Level: pct(v.effectLevel),
              Decay: 50,
              Tone: pct(v.color),
            },
            note: `${pedal.name || "This pedal"} is a reverb/delay combo (e.g. Echology) — this is its Space (${v.space}) half, split into Prime's separate Reverb stage since Prime has no combined reverb+delay block. Level from Effect Level; Tone from Color, since Color is a tone/brightness knob on the real hardware — a much closer match to Prime's Tone than to Decay or Feedback. Decay defaulted to 50 (no Tonebridge equivalent).`,
          });
        }
        break;
      }
      case "REVERB": {
        if (v.space === "None") break;
        const type = REVERB_PRIME_TYPES.includes(v.space) ? v.space : "Room";
        items.push({
          id: pedal.id,
          stage: "REVERB",
          type,
          originName: pedal.name || "Reverb",
          params: {
            "Pre Delay": 5,
            Level: pct(v.level),
            Decay: pct(v.decay),
            Tone: pct(v.tone),
          },
          note: "Pre Delay has no Tonebridge equivalent — defaulted low.",
        });
        break;
      }
      case "EQ": {
        eqFolds.push({
          bassDelta: avg([v.b31, v.b62, v.b125]) / 2,
          midDelta: avg([v.b250, v.b500, v.b1k]) / 2,
          trebleDelta: avg([v.b2k, v.b4k]) / 2,
          presenceDelta: avg([v.b8k, v.b16k]) / 2,
        });
        break;
      }
      default:
        break;
    }
  });

  let baseEq = ampEq || {
    gain: 45,
    bass: 50,
    mid: 50,
    treble: 50,
    presence: 50,
  };
  eqFolds.forEach((f) => {
    baseEq = {
      ...baseEq,
      bass: clamp(baseEq.bass + f.bassDelta),
      mid: clamp(baseEq.mid + f.midDelta),
      treble: clamp(baseEq.treble + f.trebleDelta),
      presence: clamp(baseEq.presence + f.presenceDelta),
    };
  });
  const d = position.delta;
  const finalEq = {
    gain: clamp(baseEq.gain + guitar.outputComp + (d.gain || 0)),
    bass: clamp(baseEq.bass + (d.bass || 0)),
    mid: clamp(baseEq.mid + (d.mid || 0)),
    treble: clamp(baseEq.treble + (d.treble || 0)),
    presence: clamp(baseEq.presence + (d.presence || 0)),
  };
  const eqNote = ` EQ includes ${eqFolds.length ? "graphic-EQ folding + " : ""}guitar/pickup compensation (${guitar.label}, ${position.label}).`;
  if (ampItemId) {
    const amp = items.find((it) => it.id === ampItemId);
    amp.params = {
      ...amp.params,
      Gain: finalEq.gain,
      Bass: finalEq.bass,
      Mid: finalEq.mid,
      Treble: finalEq.treble,
      Presence: finalEq.presence,
    };
    amp.note += eqNote;
  } else {
    const { amp } = matchAmp(null, "OD");
    items.push({
      id: "inferred-amp",
      stage: "AMP",
      type: amp.name,
      originName: "Amp (inferred — no amp pedal in chain)",
      params: {
        Gain: finalEq.gain,
        Bass: finalEq.bass,
        Mid: finalEq.mid,
        Treble: finalEq.treble,
        Presence: finalEq.presence,
        Master: 60,
      },
      note: "No amp pedal in your chain — inferred a default." + eqNote,
    });
    const { cab, reason } = matchCab(amp.name);
    items.push({
      id: "inferred-amp-cab",
      stage: "CAB",
      type: cab,
      originName: null,
      params: {},
      note: reason,
    });
  }
  return items;
}

function mergeOutputs(prevItems, computed) {
  const prevById = new Map(prevItems.map((i) => [i.id, i]));
  const result = computed.map((ci) => {
    const prev = prevById.get(ci.id);
    if (prev && prev.modified) return prev;
    return { ...ci, modified: false, sourceId: ci.id };
  });
  prevItems.forEach((p) => {
    if (p.sourceId === null && !result.find((r) => r.id === p.id))
      result.push(p);
    else if (
      p.modified &&
      !computed.find((ci) => ci.id === p.id) &&
      !result.find((r) => r.id === p.id)
    ) {
      result.push({ ...p, sourceId: null });
    }
  });
  return result;
}

/* ---------------------------------------------------------------------- */
/* UI primitives                                                          */
/* ---------------------------------------------------------------------- */
function NumberDisplay({ value, min, max, step, onChange, c, unit }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  useEffect(() => {
    if (!editing) setDraft(String(value));
  }, [value, editing]);
  const commit = () => {
    let n = parseFloat(draft);
    if (isNaN(n)) n = value;
    n = Math.max(min, Math.min(max, n));
    onChange(n);
    setEditing(false);
  };
  if (editing) {
    return (
      <input
        autoFocus
        type="number"
        min={min}
        max={max}
        step={step}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onFocus={(e) => e.target.select()}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") setEditing(false);
        }}
        style={{ background: c.bg, borderColor: c.accent, color: c.text }}
        className="w-14 text-right border rounded px-1 py-0.5 text-[10px] font-mono focus:outline-none"
      />
    );
  }
  return (
    <span
      onClick={() => setEditing(true)}
      style={{ color: c.textDim }}
      className="cursor-pointer hover:underline decoration-dotted underline-offset-2"
    >
      {value}
      {unit || ""}
    </span>
  );
}

function Field({ field, value, onChange, c }) {
  if (field.type === "slider") {
    return (
      <div>
        <div
          className="flex justify-between font-mono text-[10px] mb-1"
          style={{ color: c.textMuted }}
        >
          <span>{field.label}</span>
          <NumberDisplay
            value={value}
            min={field.min}
            max={field.max}
            step={field.step}
            onChange={onChange}
            c={c}
          />
        </div>
        <input
          type="range"
          min={field.min}
          max={field.max}
          step={field.step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          style={{ accentColor: c.accent }}
          className="w-full h-1"
        />
      </div>
    );
  }
  if (field.type === "toggle") {
    return (
      <label
        className="flex items-center justify-between font-mono text-[10px] cursor-pointer"
        style={{ color: c.textMuted }}
      >
        <span>{field.label}</span>
        <input
          type="checkbox"
          checked={!!value}
          onChange={(e) => onChange(e.target.checked)}
          style={{ accentColor: c.accent }}
        />
      </label>
    );
  }
  if (field.type === "select") {
    return (
      <div>
        <div
          className="font-mono text-[10px] mb-1"
          style={{ color: c.textMuted }}
        >
          {field.label}
        </div>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ background: c.bg, borderColor: c.border, color: c.text }}
          className="w-full border rounded px-2 py-1 text-xs"
        >
          {field.options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </div>
    );
  }
  return (
    <div>
      <div
        className="font-mono text-[10px] mb-1"
        style={{ color: c.textMuted }}
      >
        {field.label}
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ background: c.bg, borderColor: c.border, color: c.text }}
        className="w-full border rounded px-2 py-1 text-xs"
      />
    </div>
  );
}

function CardShell({
  c,
  headerLeft,
  headerRight,
  collapsible,
  collapsed,
  onToggle,
  children,
}) {
  return (
    <div
      style={{ background: c.panel, borderColor: c.border }}
      className="border rounded-md overflow-hidden"
    >
      <div
        className="flex items-center gap-2 px-3 py-2 border-b"
        style={{ background: c.panelAlt, borderColor: c.border }}
      >
        {collapsible && (
          <button
            onClick={onToggle}
            style={{ color: c.textFaint }}
            className="shrink-0"
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
          </button>
        )}
        {headerLeft}
        <div className="ml-auto flex items-center gap-2 shrink-0">
          {headerRight}
        </div>
      </div>
      {!collapsed && children}
    </div>
  );
}

function PedalCard({
  pedal,
  onChange,
  onRemove,
  dragProps,
  collapsed,
  onToggle,
  c,
}) {
  const cat = CATEGORIES[pedal.category];
  return (
    <div
      draggable
      {...dragProps}
      className="cursor-grab active:cursor-grabbing"
    >
      <CardShell
        c={c}
        collapsible
        collapsed={collapsed}
        onToggle={onToggle}
        headerLeft={
          <>
            <GripVertical
              size={14}
              className="shrink-0"
              style={{ color: c.textFaint }}
            />
            <input
              value={pedal.name}
              onChange={(e) => onChange({ ...pedal, name: e.target.value })}
              placeholder={cat.label}
              onClick={(e) => e.stopPropagation()}
              style={{ color: c.text }}
              className="bg-transparent font-display text-sm font-semibold focus:outline-none flex-1 min-w-0"
            />
          </>
        }
        headerRight={
          <>
            <span
              className="font-mono text-[9px] uppercase tracking-widest"
              style={{ color: c.accent }}
            >
              {cat.label.split(" ")[0]}
            </span>
            <button
              onClick={() => onRemove(pedal.id)}
              style={{ color: c.textMuted }}
            >
              <X size={14} />
            </button>
          </>
        }
      >
        <div
          className={`px-3 py-3 grid gap-x-4 gap-y-3 ${cat.isEq ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3"}`}
        >
          {cat.fields.map((f) => (
            <Field
              key={f.key}
              field={f}
              value={pedal.values[f.key]}
              c={c}
              onChange={(val) =>
                onChange({
                  ...pedal,
                  values: { ...pedal.values, [f.key]: val },
                })
              }
            />
          ))}
        </div>
      </CardShell>
    </div>
  );
}

function OutputItemCard({ item, onChange, onRemove, collapsed, onToggle, c }) {
  if (item.isInfo) {
    return (
      <CardShell
        c={c}
        collapsible={false}
        headerLeft={
          <span className="font-body text-sm font-medium">
            {item.originName}
          </span>
        }
        headerRight={
          <button
            onClick={() => onRemove(item.id)}
            style={{ color: c.textMuted }}
          >
            <X size={14} />
          </button>
        }
      >
        <div />
      </CardShell>
    );
  }
  const def = PRIME_STAGE_DEFS[item.stage];
  const fields = def.fieldsFor(item.type);

  const setType = (newType) => {
    const oldFields = def.fieldsFor(item.type);
    const newFields = def.fieldsFor(newType);
    const newParams = {};
    newFields.forEach((f) => {
      newParams[f] = oldFields.includes(f) ? item.params[f] : rangeFor(f).def;
    });
    onChange({ ...item, type: newType, params: newParams, modified: true });
  };
  const setParam = (field, val) =>
    onChange({
      ...item,
      params: { ...item.params, [field]: val },
      modified: true,
    });

  return (
    <CardShell
      c={c}
      collapsible={fields.length > 0}
      collapsed={collapsed}
      onToggle={onToggle}
      headerLeft={
        <div className="min-w-0 flex-1">
          <div className="font-body text-sm font-medium truncate">
            {item.originName ? `${item.originName} →` : ""}{" "}
            <span style={{ color: c.accent }}>{item.type}</span>
          </div>
        </div>
      }
      headerRight={
        <>
          {item.modified && (
            <span
              className="font-mono text-[9px] uppercase tracking-widest"
              style={{ color: c.warnText }}
            >
              edited
            </span>
          )}
          <select
            value={item.type}
            onChange={(e) => setType(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: c.bg,
              borderColor: c.border,
              color: c.textDim,
            }}
            className="border rounded px-1.5 py-1 text-[11px] max-w-[110px]"
          >
            {def.options.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
          <button
            onClick={() => onRemove(item.id)}
            style={{ color: c.textMuted }}
          >
            <X size={14} />
          </button>
        </>
      }
    >
      {fields.length > 0 && (
        <div className="px-4 py-3 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2">
            {fields.map((f) => {
              const r = rangeFor(f);
              const val = item.params[f] ?? r.def;
              return (
                <div key={f}>
                  <div
                    className="flex justify-between font-mono text-[10px] mb-1"
                    style={{ color: c.textFaint }}
                  >
                    <span>{f}</span>
                    <NumberDisplay
                      value={val}
                      min={r.min}
                      max={r.max}
                      step={r.step}
                      unit={r.unit}
                      onChange={(n) => setParam(f, n)}
                      c={c}
                    />
                  </div>
                  <input
                    type="range"
                    min={r.min}
                    max={r.max}
                    step={r.step}
                    value={val}
                    onChange={(e) => setParam(f, parseFloat(e.target.value))}
                    style={{ accentColor: c.accent }}
                    className="w-full h-1"
                  />
                </div>
              );
            })}
          </div>
          {item.note && (
            <div className="flex gap-1.5">
              <Info
                size={11}
                className="shrink-0 mt-0.5"
                style={{ color: c.textFaint }}
              />
              <p
                className="font-body text-[11px] leading-relaxed"
                style={{ color: c.textFaint }}
              >
                {item.note}
              </p>
            </div>
          )}
        </div>
      )}
      {fields.length === 0 && item.note && (
        <div className="px-4 py-3 flex gap-1.5">
          <Info
            size={11}
            className="shrink-0 mt-0.5"
            style={{ color: c.textFaint }}
          />
          <p
            className="font-body text-[11px] leading-relaxed"
            style={{ color: c.textFaint }}
          >
            {item.note}
          </p>
        </div>
      )}
    </CardShell>
  );
}

function useDragReorder(list, setList) {
  const dragIdx = useRef(null);
  const blockDrag = useRef(false);
  const onMouseDown = () => (e) => {
    blockDrag.current = !!e.target.closest(
      "input, select, textarea, button, label",
    );
  };
  const onDragStart = (i) => (e) => {
    if (blockDrag.current) {
      e.preventDefault();
      return;
    }
    dragIdx.current = i;
    e.dataTransfer.effectAllowed = "move";
  };
  const onDragOver = () => (e) => {
    e.preventDefault();
  };
  const onDrop = (i) => (e) => {
    e.preventDefault();
    const from = dragIdx.current;
    if (from === null || from === i) return;
    const next = [...list];
    const [moved] = next.splice(from, 1);
    next.splice(i, 0, moved);
    setList(next);
    dragIdx.current = null;
  };
  return { onDragStart, onDragOver, onDrop, onMouseDown };
}

function AddStageItemButton({ stage, onAdd, c }) {
  const [open, setOpen] = useState(false);
  const def = PRIME_STAGE_DEFS[stage];
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        style={{ borderColor: c.border, color: c.textMuted }}
        className="w-full flex items-center justify-center gap-1.5 border border-dashed rounded-md py-1.5 font-mono text-[10px] uppercase tracking-widest hover:opacity-80"
      >
        <Plus size={12} /> Add to {STAGE_META[stage].label}
      </button>
      {open && (
        <div
          className="absolute z-10 mt-1 w-full max-h-48 overflow-y-auto border rounded-md shadow-xl p-1"
          style={{ background: c.panel, borderColor: c.border }}
        >
          {def.options.map((o) => (
            <button
              key={o}
              onClick={() => {
                onAdd(o);
                setOpen(false);
              }}
              style={{ color: c.textDim }}
              className="w-full text-left px-2 py-1.5 rounded font-body text-xs hover:opacity-80"
            >
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Main component                                                         */
/* ---------------------------------------------------------------------- */
export default function PrimeP1ToneConverter() {
  const [themeKey, setThemeKey] = useState("dark");
  const c = THEMES[themeKey];
  const [chain, setChain] = useState([]);
  const [outputItems, setOutputItems] = useState([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [guitarKey, setGuitarKey] = useState("telecaster");
  const [positionKey, setPositionKey] = useState("bridge");
  const [stageOrder, setStageOrder] = useState(DEFAULT_STAGE_ORDER);
  const [collapsedIn, setCollapsedIn] = useState({});
  const [collapsedOut, setCollapsedOut] = useState({});
  const fileInputRef = useRef(null);

  const guitar = GUITARS[guitarKey];
  const position =
    guitar.positions.find((p) => p.key === positionKey) || guitar.positions[0];

  useEffect(() => {
    setPositionKey(GUITARS[guitarKey].positions[0].key);
  }, [guitarKey]);

  useEffect(() => {
    const baseline = computeBaseline(chain, guitar, position);
    setOutputItems((prev) => mergeOutputs(prev, baseline));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chain, guitarKey, positionKey]);

  const addPedal = (catKey) => {
    setChain([
      ...chain,
      { id: uid(), category: catKey, name: "", values: defaultValues(catKey) },
    ]);
    setPickerOpen(false);
    setSearch("");
  };
  const removePedal = (id) => setChain(chain.filter((p) => p.id !== id));
  const updatePedal = (updated) =>
    setChain(chain.map((p) => (p.id === updated.id ? updated : p)));

  const updateOutputItem = (updated) =>
    setOutputItems(
      outputItems.map((it) => (it.id === updated.id ? updated : it)),
    );
  const removeOutputItem = (id) =>
    setOutputItems(outputItems.filter((it) => it.id !== id));
  const addOutputItem = (stage, type) => {
    setOutputItems([
      ...outputItems,
      {
        id: uid(),
        stage,
        type,
        originName: null,
        params: defaultParams(stage, type),
        note: null,
        modified: true,
        sourceId: null,
      },
    ]);
  };

  const chainDrag = useDragReorder(chain, setChain);
  const stageDrag = useDragReorder(stageOrder, setStageOrder);

  const filteredCats = Object.entries(CATEGORIES).filter(([, cat]) =>
    cat.label.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSave = () => {
    const payload = {
      version: 1,
      savedAt: new Date().toISOString(),
      guitarKey,
      positionKey,
      tonebridgeChain: chain,
      primeOutput: outputItems,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "signalmatch-preset.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  const handleLoad = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (data.tonebridgeChain) setChain(data.tonebridgeChain);
        if (data.primeOutput) setOutputItems(data.primeOutput);
        if (data.guitarKey) setGuitarKey(data.guitarKey);
        if (data.positionKey) setPositionKey(data.positionKey);
      } catch (err) {
        console.error("Failed to load preset", err);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div
      style={{ background: c.bg, color: c.text }}
      className="w-full min-h-screen font-sans transition-colors"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@400;500;600&display=swap');
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-mono { font-family: 'IBM Plex Mono', monospace; }
        .font-body { font-family: 'Inter', sans-serif; }
      `}</style>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-baseline justify-between mb-2 flex-wrap gap-2">
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Signal<span style={{ color: c.accent }}>Match</span>
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              style={{
                background: c.panel,
                borderColor: c.border,
                color: c.textDim,
              }}
              className="border rounded-full px-3 py-1.5 flex items-center gap-1.5 font-mono text-[11px] hover:opacity-80"
            >
              <Download size={13} /> Save
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                background: c.panel,
                borderColor: c.border,
                color: c.textDim,
              }}
              className="border rounded-full px-3 py-1.5 flex items-center gap-1.5 font-mono text-[11px] hover:opacity-80"
            >
              <Upload size={13} /> Load
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              onChange={handleLoad}
              className="hidden"
            />
            <button
              onClick={() =>
                setThemeKey(themeKey === "dark" ? "light" : "dark")
              }
              style={{
                background: c.panel,
                borderColor: c.border,
                color: c.text,
              }}
              className="border rounded-full p-1.5 hover:opacity-80"
            >
              {themeKey === "dark" ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          </div>
        </div>
        <p
          className="font-body text-sm max-w-3xl mb-4"
          style={{ color: c.textMuted }}
        >
          Build the Tonebridge chain, get an auto-matched Prime P1 chain — then
          edit the Prime side directly: change models, tweak values, add or
          remove effects. Anything you touch is marked{" "}
          <span style={{ color: c.warnText }}>edited</span> and won't be
          overwritten.
        </p>

        <div
          className="flex gap-3 items-start border rounded-md px-4 py-3 mb-8"
          style={{ background: c.warnBg, borderColor: c.border }}
        >
          <AlertTriangle
            size={16}
            className="shrink-0 mt-0.5"
            style={{ color: c.warnText }}
          />
          <p
            className="font-body text-xs leading-relaxed"
            style={{ color: c.warnBody }}
          >
            Neither app publishes an API or parameter spec. Amp/cab matches use
            Tonebridge's own "modeled on" text where known, plus Prime's naming
            conventions — flagged inline as lineage-matched vs. tier-only
            guesses.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* LEFT */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div
                className="font-mono text-[11px] uppercase tracking-widest"
                style={{ color: c.textMuted }}
              >
                Tonebridge chain
              </div>
              <button
                onClick={() => setChain(buildExampleChain())}
                className="font-mono text-[10px] hover:underline"
                style={{ color: c.accent }}
              >
                Load example
              </button>
            </div>

            <div className="space-y-3">
              {chain.map((pedal, i) => (
                <PedalCard
                  key={pedal.id}
                  pedal={pedal}
                  onChange={updatePedal}
                  onRemove={removePedal}
                  c={c}
                  collapsed={!!collapsedIn[pedal.id]}
                  onToggle={() =>
                    setCollapsedIn({
                      ...collapsedIn,
                      [pedal.id]: !collapsedIn[pedal.id],
                    })
                  }
                  dragProps={{
                    onMouseDown: chainDrag.onMouseDown(i),
                    onDragStart: chainDrag.onDragStart(i),
                    onDragOver: chainDrag.onDragOver(i),
                    onDrop: chainDrag.onDrop(i),
                  }}
                />
              ))}
            </div>

            {chain.length === 0 && (
              <div
                className="border border-dashed rounded-md py-8 text-center font-body text-xs mb-3"
                style={{ borderColor: c.border, color: c.textFaint }}
              >
                No pedals yet — add one below or load the example.
              </div>
            )}

            <div className="relative mt-3">
              <button
                onClick={() => setPickerOpen(!pickerOpen)}
                style={{ borderColor: c.border, color: c.textMuted }}
                className="w-full flex items-center justify-center gap-2 border border-dashed rounded-md py-2.5 font-mono text-xs uppercase tracking-widest hover:opacity-80"
              >
                <Plus size={14} /> Add pedal
              </button>
              {pickerOpen && (
                <div
                  className="absolute z-10 mt-2 w-full border rounded-md shadow-xl p-2"
                  style={{ background: c.panel, borderColor: c.border }}
                >
                  <input
                    autoFocus
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search pedal type…"
                    style={{
                      background: c.bg,
                      borderColor: c.border,
                      color: c.text,
                    }}
                    className="w-full border rounded px-3 py-2 text-sm mb-2 focus:outline-none"
                  />
                  <div className="max-h-64 overflow-y-auto space-y-1">
                    {filteredCats.map(([key, cat]) => (
                      <button
                        key={key}
                        onClick={() => addPedal(key)}
                        style={{ color: c.textDim }}
                        className="w-full text-left px-3 py-2 rounded font-body text-sm hover:opacity-80"
                      >
                        {cat.label}
                      </button>
                    ))}
                    {filteredCats.length === 0 && (
                      <div
                        className="px-3 py-2 text-xs"
                        style={{ color: c.textFaint }}
                      >
                        No match
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 space-y-4">
              <div>
                <label
                  className="font-mono text-[11px] uppercase tracking-widest mb-2 flex items-center gap-2"
                  style={{ color: c.textMuted }}
                >
                  <Guitar size={13} /> Your guitar
                </label>
                <select
                  value={guitarKey}
                  onChange={(e) => setGuitarKey(e.target.value)}
                  style={{
                    background: c.panel,
                    borderColor: c.border,
                    color: c.text,
                  }}
                  className="w-full border rounded-md px-3 py-2 font-body text-sm focus:outline-none"
                >
                  {Object.entries(GUITARS).map(([key, g]) => (
                    <option key={key} value={key}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  className="font-mono text-[11px] uppercase tracking-widest mb-2 block"
                  style={{ color: c.textMuted }}
                >
                  {guitar.positionsLabel || "Pickup position"}
                </label>
                <div className="flex flex-col gap-2">
                  {guitar.positions.map((p) => (
                    <button
                      key={p.key}
                      onClick={() => setPositionKey(p.key)}
                      style={
                        positionKey === p.key
                          ? { borderColor: c.accent, background: c.accentBg }
                          : {
                              borderColor: c.border,
                              background: c.panel,
                              color: c.textDim,
                            }
                      }
                      className="text-left px-3 py-2 rounded-md border font-body text-xs transition-colors"
                    >
                      <span className="font-semibold" style={{ color: c.text }}>
                        {p.label}
                      </span>
                      <span
                        className="block mt-0.5"
                        style={{ color: c.textMuted }}
                      >
                        {p.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div>
            <div
              className="font-mono text-[11px] uppercase tracking-widest mb-3"
              style={{ color: c.textMuted }}
            >
              Prime P1 chain (drag stages to reorder)
            </div>
            <div className="space-y-3">
              {stageOrder.map((stageKey, i) => {
                const meta = STAGE_META[stageKey];
                const Icon = meta.icon;
                const items = outputItems.filter((it) => it.stage === stageKey);
                return (
                  <div
                    key={stageKey}
                    draggable
                    onMouseDown={stageDrag.onMouseDown(i)}
                    onDragStart={stageDrag.onDragStart(i)}
                    onDragOver={stageDrag.onDragOver(i)}
                    onDrop={stageDrag.onDrop(i)}
                    style={{ background: c.panel, borderColor: c.border }}
                    className="border rounded-md overflow-hidden"
                  >
                    <div
                      draggable={false}
                      className="flex items-center gap-2 px-4 py-2 border-b cursor-grab active:cursor-grabbing"
                      style={{ background: c.panelAlt, borderColor: c.border }}
                    >
                      <GripVertical size={14} style={{ color: c.textFaint }} />
                      <span
                        className="font-mono text-[10px]"
                        style={{ color: c.accent }}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <Icon size={14} style={{ color: c.text }} />
                      <span className="font-display text-sm font-semibold">
                        {meta.label}
                      </span>
                      {items.length === 0 && (
                        <span
                          className="ml-auto font-mono text-[10px]"
                          style={{ color: c.textFaint }}
                        >
                          empty
                        </span>
                      )}
                    </div>
                    <div className="p-3 space-y-2">
                      {items.map((item) => (
                        <OutputItemCard
                          key={item.id}
                          item={item}
                          c={c}
                          onChange={updateOutputItem}
                          onRemove={removeOutputItem}
                          collapsed={!!collapsedOut[item.id]}
                          onToggle={() =>
                            setCollapsedOut({
                              ...collapsedOut,
                              [item.id]: !collapsedOut[item.id],
                            })
                          }
                        />
                      ))}
                      <AddStageItemButton
                        stage={stageKey}
                        c={c}
                        onAdd={(type) => addOutputItem(stageKey, type)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div
              className="mt-6 border rounded-md px-4 py-3"
              style={{ background: c.accentBg, borderColor: c.border }}
            >
              <div
                className="font-mono text-[11px] uppercase tracking-widest mb-1 flex items-center gap-2"
                style={{ color: c.accent }}
              >
                <Guitar size={13} />{" "}
                {guitar.positionsLabel || "Pickup position"}
              </div>
              <div className="font-body text-sm">
                {position.label} — {guitar.label}
              </div>
              <div
                className="font-body text-xs mt-1"
                style={{ color: c.textMuted }}
              >
                {position.desc}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
