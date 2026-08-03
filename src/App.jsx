import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Guitar, Plus, X, GripVertical, Info, AlertTriangle,
  Zap, Radio, Disc3, Waves, Timer, Sparkles, Sun, Moon,
} from "lucide-react";

/* ---------------------------------------------------------------------- */
/* Theme                                                                   */
/* ---------------------------------------------------------------------- */
const THEMES = {
  dark: {
    bg: "#161512", panel: "#1E1C17", panelAlt: "#221F19", border: "#3A362C",
    text: "#EDEAE1", textDim: "#B8B2A3", textMuted: "#8A8579", textFaint: "#6E695C",
    accent: "#5EE6B4", accentBg: "#1B2B24", warnBg: "#221F19", warnText: "#E8B65A",
    warnBody: "#B8B2A3", danger: "#E86A5A", track: "#3A362C",
  },
  light: {
    bg: "#F4F1EA", panel: "#FFFFFF", panelAlt: "#ECE7DA", border: "#DCD4C2",
    text: "#221F19", textDim: "#453F33", textMuted: "#6E6656", textFaint: "#8A8270",
    accent: "#0E9A6C", accentBg: "#E1F3EA", warnBg: "#FBEEDA", warnText: "#8A5A12",
    warnBody: "#5C4A2A", danger: "#B23A2A", track: "#DCD4C2",
  },
};

/* ---------------------------------------------------------------------- */
/* Prime P1 chain order                                                    */
/* ---------------------------------------------------------------------- */
const STAGE_META = {
  DYNA: { label: "Dynamics", icon: Zap },
  OD: { label: "Drive", icon: Radio },
  AMP: { label: "Amp", icon: Disc3 },
  CAB: { label: "Cabinet", icon: Disc3 },
  MOD: { label: "Modulation", icon: Waves },
  DELAY: { label: "Delay", icon: Timer },
  REVERB: { label: "Reverb", icon: Sparkles },
};
const DEFAULT_STAGE_ORDER = ["DYNA", "OD", "AMP", "CAB", "MOD", "DELAY", "REVERB"];

/* ---------------------------------------------------------------------- */
/* Prime P1 real sub-type field sets (confirmed from device screenshots,   */
/* unless marked estimated)                                                */
/* ---------------------------------------------------------------------- */
const DYNA_PRIME_TYPES = {
  Comp: { fields: ["Attack", "Threshold", "Ratio", "Level"], confirmed: true },
  "Touch Wah": { fields: ["Attack", "Sens", "Peak", "Level"], confirmed: true },
  "Auto Wah": { fields: ["Rate", "Range", "Peak", "Level"], confirmed: true },
  NG: { fields: ["Threshold", "Decay"], confirmed: false },
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

const DELAY_PRIME_TYPES = ["Digital", "Analog", "Real Echo", "Tape", "Mod", "Reverse"];
const REVERB_PRIME_TYPES = ["Room", "Hall", "Plate", "Spring", "Mod"];

/* ---------------------------------------------------------------------- */
/* Real-gear reference: what Tonebridge says its gear is "modeled on"      */
/* (pulled directly from in-app descriptions — not guesses)                */
/* ---------------------------------------------------------------------- */
const TONEBRIDGE_MODELED_ON = {
  "teavoy valveking": "Peavey ValveKing",
  "echology": "BOSS RV-3 (reverb/delay)",
  "d-delay": "BOSS DD-7",
  "eq monster": "MXR M108 (10-band EQ)",
  "ensembly": "BOSS CE-5 (Chorus)",
  "magic modulator": "Maestro Ring Modulator",
  "octapuss": "BOSS OC-2 (Octave)",
  "phase '72": "MXR M101 (Phaser)",
  "phunk phaser": "Dunlop Uni-Vibe",
  "vibrango": "BOSS VB-2 (Vibrato)",
  "acoustic8": "BOSS AC-3 (Acoustic sim)",
  "distortoise": "BOSS DS-1",
  "elevenizer": "Ibanez TS8 (Tube Screamer-style)",
  "mountain blue": "BOSS BD-2 (Blues Driver)",
  "noise gate": "BOSS NS-2",
  "offroad overdrive": "MXR Distortion+",
  "rabid rodent": "Pro Co RAT",
  "the haze": "Electro-Harmonix Big Muff Pi",
  "the juicer": "Dan Armstrong Orange Squeezer",
  "thrasher pre": "TC Electronic Integrated Preamp",
  "tonemime bass": "Tech21 SansAmp Bass Driver DI",
  "tonemime gt": "Tech21 SansAmp GT2",
};
function lookupModeledOn(name) {
  if (!name) return null;
  const key = name.trim().toLowerCase();
  return TONEBRIDGE_MODELED_ON[key] || null;
}

/* ---------------------------------------------------------------------- */
/* Prime P1 real amp list (compiled from device screenshots).              */
/* tier: CL = clean/low-gain, OD = crunch/mid, DS = distortion/high-gain.  */
/* lineage: only set where the naming convention makes it a confident      */
/* guess (Mooer doesn't publish "modeled on" text like Tonebridge does) —  */
/* everything else is left null rather than invented.                     */
/* NOTE: models #22–35 weren't visible in the screenshots provided, so     */
/* this list has a gap there — matching still works, just slightly less   */
/* precise if your source amp would've landed in that range.              */
/* ---------------------------------------------------------------------- */
const PRIME_AMPS = [
  { name: "US DLX", tier: "CL", family: "US DLX", lineage: "Fender '65 Deluxe Reverb-style" },
  { name: "US TW", tier: "CL", family: "US TW", lineage: "Fender '65 Twin Reverb-style" },
  { name: "US Bass", tier: "CL", family: "US Bass", lineage: "Fender '59 Bassman-style" },
  { name: "US Sonic", tier: "CL", family: "US Sonic", lineage: null },
  { name: "US Blues CL", tier: "CL", family: "US Blues", lineage: "Fender Blues Deluxe-style" },
  { name: "US Blues OD", tier: "OD", family: "US Blues", lineage: "Fender Blues Deluxe-style (driven)" },
  { name: "E650 CL", tier: "CL", family: "E650", lineage: null },
  { name: "Powerbell CL", tier: "CL", family: "Powerbell", lineage: null },
  { name: "Blacknight CL", tier: "CL", family: "Blacknight", lineage: null },
  { name: "Mark III CL", tier: "CL", family: "Mark III", lineage: "Mesa Boogie Mark III-style" },
  { name: "Mark III DS", tier: "DS", family: "Mark III", lineage: "Mesa Boogie Mark III-style" },
  { name: "Mark V CL", tier: "CL", family: "Mark V", lineage: "Mesa Boogie Mark V-style" },
  { name: "Mark V DS", tier: "DS", family: "Mark V", lineage: "Mesa Boogie Mark V-style" },
  { name: "Tri Rec CL", tier: "CL", family: "Tri Rec", lineage: "Mesa Boogie Triple Rectifier-style" },
  { name: "Tri Rec DS", tier: "DS", family: "Tri Rec", lineage: "Mesa Boogie Triple Rectifier-style" },
  { name: "Rockvrb CL", tier: "CL", family: "Rockvrb", lineage: "Ampeg Reverberocket-style" },
  { name: "Rockvrb DS", tier: "DS", family: "Rockvrb", lineage: "Ampeg Reverberocket-style" },
  { name: "Dr Zee 18 JR", tier: "CL", family: "Dr Zee", lineage: "Dr. Z-style boutique" },
  { name: "Dr Zee Reck", tier: "OD", family: "Dr Zee", lineage: "Dr. Z-style boutique" },
  { name: "Jet 100H CL", tier: "CL", family: "Jet 100H", lineage: null },
  { name: "Jet 100H OD", tier: "OD", family: "Jet 100H", lineage: null },
  { name: "Jazz 120", tier: "CL", family: "Jazz 120", lineage: "Roland JC-120-style" },
  { name: "UK 30 CL", tier: "CL", family: "UK 30", lineage: "British 30W (Orange/Marshall-style)" },
  { name: "UK 30 OD", tier: "OD", family: "UK 30", lineage: "British 30W (Orange/Marshall-style)" },
  { name: "HWT 103", tier: "CL", family: "HWT", lineage: "Hughes & Kettner-style" },
  { name: "PV5050 CL", tier: "CL", family: "PV5050", lineage: "Peavey 5150-style" },
  { name: "PV 5050 DS", tier: "DS", family: "PV5050", lineage: "Peavey 5150-style" },
  { name: "Regal Tone CL", tier: "CL", family: "Regal Tone", lineage: null },
  { name: "Regal Tone OD1", tier: "OD", family: "Regal Tone", lineage: null },
  { name: "Regal Tone OD2", tier: "OD", family: "Regal Tone", lineage: null },
  { name: "Carol CL", tier: "CL", family: "Carol", lineage: null },
  { name: "Carol OD", tier: "OD", family: "Carol", lineage: null },
  { name: "Cardeff", tier: "CL", family: "Cardeff", lineage: null },
  { name: "EV 5050 CL", tier: "CL", family: "EV5050", lineage: "EVH 5150III-style" },
  { name: "EV 5050 DS", tier: "DS", family: "EV5050", lineage: "EVH 5150III-style" },
  { name: "HT Club CL", tier: "CL", family: "HT Club", lineage: "Blackstar HT Club-style" },
  { name: "HT Club DS", tier: "DS", family: "HT Club", lineage: "Blackstar HT Club-style" },
  { name: "Hugen CL", tier: "CL", family: "Hugen", lineage: "Boutique high-gain (Bogner-style)" },
  { name: "Hugen OD", tier: "OD", family: "Hugen", lineage: "Boutique high-gain (Bogner-style)" },
  { name: "Hugen DS", tier: "DS", family: "Hugen", lineage: "Boutique high-gain (Bogner-style)" },
  { name: "Koche OD", tier: "OD", family: "Koche", lineage: "Koch-style" },
  { name: "Koche DS", tier: "DS", family: "Koche", lineage: "Koch-style" },
  { name: "J800", tier: "OD", family: "J800", lineage: "Marshall JCM800-style" },
  { name: "J900", tier: "DS", family: "J900", lineage: "Marshall JCM900-style" },
  { name: "PLX 100", tier: "OD", family: "PLX 100", lineage: null },
  { name: "E650 DS", tier: "DS", family: "E650", lineage: null },
  { name: "Powerbell DS", tier: "DS", family: "Powerbell", lineage: null },
  { name: "Blacknight DS", tier: "DS", family: "Blacknight", lineage: null },
  { name: "Citrus 30", tier: "OD", family: "Citrus", lineage: "Orange amp-style" },
  { name: "Citrus 50", tier: "OD", family: "Citrus", lineage: "Orange amp-style" },
  { name: "Slow 100 CR", tier: "OD", family: "Slow 100", lineage: null },
  { name: "Slow 100 DS", tier: "DS", family: "Slow 100", lineage: null },
];

const PRIME_CABS = [
  "Regal Tone 110", "US DLX 112", "Sonic 112", "Blues 112", "Mark 112", "Dr Zee 112", "Cardeff 112",
  "US TW 212", "Citrus 212", "Dr Zee 212", "Jazz 212", "UK 212", "Tow Stones 212",
  "US Bass 410", "1960 412", "Eagle P412", "Eagle S412", "Rec 412", "Citrus 412",
  "Slow 412", "HWT 412", "PV5050 412", "EV5050 412", "HT 412", "Diesel 412",
];

const AMP_KEYWORD_MAP = [
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
];

const OD_KEYWORD_MAP = [
  { kw: "tube screamer", name: "808" }, { kw: "ts8", name: "808" }, { kw: "ts9", name: "808" },
  { kw: "rat", name: "Black Rat" },
  { kw: "big muff", name: "Muffy" }, { kw: "muff pi", name: "Muffy" },
  { kw: "klon", name: "Gold Clon" },
  { kw: "bb preamp", name: "Beebee Pre" }, { kw: "xotic", name: "Beebee Pre" },
  { kw: "ocd", name: "Obsessive Dist" },
  { kw: "metal zone", name: "MTL Zone" },
];
const OD_TIER_FALLBACK = { low: "Pure Boost", mid: "808", high: "Full DS" };

function tierFromGain(gain0to10) {
  if (gain0to10 <= 3) return "CL";
  if (gain0to10 <= 6.5) return "OD";
  return "DS";
}

function matchAmp(realGearHint, gainTier) {
  const hint = (realGearHint || "").toLowerCase();
  let candidateFamilies = null;
  for (const entry of AMP_KEYWORD_MAP) {
    if (hint.includes(entry.kw)) { candidateFamilies = entry.families; break; }
  }
  let pool = candidateFamilies
    ? PRIME_AMPS.filter((a) => candidateFamilies.includes(a.family))
    : null;
  let matchType = pool ? "lineage" : "tier-only";
  if (!pool || pool.length === 0) pool = PRIME_AMPS;

  let byTier = pool.filter((a) => a.tier === gainTier);
  if (byTier.length === 0) byTier = pool;
  const chosen = byTier[0] || PRIME_AMPS[0];

  const reason = matchType === "lineage"
    ? `Matched via real-gear lineage (${realGearHint} → ${chosen.lineage || chosen.family}), picking the closest gain tier.`
    : `No known lineage for "${realGearHint || "this pedal"}" — matched by gain character only (${gainTier}-tier).`;
  return { amp: chosen, reason };
}

function matchCab(amp) {
  const fam = amp.family.toLowerCase().replace(/\s+/g, "");
  let match = PRIME_CABS.find((c) => c.toLowerCase().replace(/\s+/g, "").startsWith(fam));
  if (match) return { cab: match, reason: `Name-matched to the ${amp.family} amp family.` };
  const sizeMap = { CL: "112", OD: "212", DS: "412" };
  const size = sizeMap[amp.tier] || "212";
  const bySize = PRIME_CABS.find((c) => c.includes(size));
  const sizeLabel = size === "112" ? "1x12" : size === "212" ? "2x12" : "4x12";
  return { cab: bySize || PRIME_CABS[0], reason: `No name match for "${amp.family}" — picked a ${sizeLabel} sized for a ${amp.tier}-tier tone.` };
}

function matchOD(realGearHint, gain0to10) {
  const hint = (realGearHint || "").toLowerCase();
  for (const entry of OD_KEYWORD_MAP) {
    if (hint.includes(entry.kw)) return { name: entry.name, reason: `Matched via real-gear lineage (${realGearHint}).` };
  }
  const tier = gain0to10 <= 3 ? "low" : gain0to10 <= 6.5 ? "mid" : "high";
  return { name: OD_TIER_FALLBACK[tier], reason: `No known lineage — matched by drive amount (${tier}).` };
}

/* ---------------------------------------------------------------------- */
/* Tonebridge-style input pedal categories                                */
/* ---------------------------------------------------------------------- */
const CATEGORIES = {
  NOISE_GATE: { label: "Noise Gate", stage: "DYNA", primeType: "NG",
    fields: [
      { key: "threshold", label: "Threshold", type: "slider", min: 0, max: 10, step: 0.1, def: 3.5 },
      { key: "decay", label: "Decay", type: "slider", min: 0, max: 10, step: 0.1, def: 2.0 },
    ]},
  COMPRESSOR: { label: "Compressor", stage: "DYNA", primeType: "Comp",
    fields: [
      { key: "level", label: "Level", type: "slider", min: 0, max: 10, step: 0.1, def: 5 },
      { key: "sustain", label: "Sustain", type: "slider", min: 0, max: 10, step: 0.1, def: 5 },
      { key: "attack", label: "Attack", type: "slider", min: 0, max: 10, step: 0.1, def: 5 },
      { key: "tone", label: "Tone", type: "slider", min: 0, max: 10, step: 0.1, def: 5 },
    ]},
  DRIVE: { label: "Drive / Overdrive / Distortion / Fuzz", stage: "OD",
    fields: [
      { key: "drive", label: "Drive", type: "slider", min: 0, max: 10, step: 0.1, def: 5 },
      { key: "tone", label: "Tone", type: "slider", min: 0, max: 10, step: 0.1, def: 5 },
      { key: "level", label: "Level", type: "slider", min: 0, max: 10, step: 0.1, def: 5 },
    ]},
  AMP: { label: "Amp Head", stage: "AMP",
    fields: [
      { key: "volume", label: "Volume", type: "slider", min: 0, max: 10, step: 0.1, def: 5 },
      { key: "drive", label: "Drive", type: "slider", min: 0, max: 10, step: 0.1, def: 5 },
      { key: "presence", label: "Presence", type: "slider", min: 0, max: 10, step: 0.1, def: 5 },
      { key: "resonance", label: "Resonance", type: "slider", min: 0, max: 10, step: 0.1, def: 0 },
      { key: "texture", label: "Texture", type: "slider", min: 0, max: 10, step: 0.1, def: 5 },
      { key: "bass", label: "Bass", type: "slider", min: 0, max: 10, step: 0.1, def: 5 },
      { key: "mid", label: "Mid", type: "slider", min: 0, max: 10, step: 0.1, def: 5 },
      { key: "treble", label: "Treble", type: "slider", min: 0, max: 10, step: 0.1, def: 5 },
      { key: "reverb", label: "Reverb", type: "slider", min: 0, max: 10, step: 0.1, def: 0 },
    ]},
  CAB: { label: "Cabinet + Mic", stage: "CAB",
    fields: [
      { key: "power", label: "Power", type: "toggle", def: true },
      { key: "micModel", label: "Mic Model", type: "text", def: "" },
      { key: "micPosition", label: "Mic Position", type: "select", options: ["On Axis", "Off Axis", "Edge", "Back"], def: "On Axis" },
    ]},
  MOD: { label: "Modulation (Chorus / Flanger / Phaser / Tremolo…)", stage: "MOD",
    fields: [
      { key: "type", label: "Type", type: "select", def: "Ana Chorus",
        options: Object.keys(MOD_PRIME_TYPES) },
      { key: "rate", label: "Rate", type: "slider", min: 0, max: 10, step: 0.1, def: 5 },
      { key: "depth", label: "Depth", type: "slider", min: 0, max: 10, step: 0.1, def: 5 },
      { key: "mix", label: "Mix / Level", type: "slider", min: 0, max: 10, step: 0.1, def: 5 },
    ]},
  DELAY: { label: "Delay / Echo", stage: "DELAY",
    fields: [
      { key: "type", label: "Prime delay type", type: "select", def: "Digital", options: DELAY_PRIME_TYPES },
      { key: "effectLevel", label: "Effect Level", type: "slider", min: 0, max: 10, step: 0.1, def: 3 },
      { key: "time", label: "Time (s)", type: "slider", min: 0, max: 3, step: 0.05, def: 0.4 },
      { key: "color", label: "Color", type: "slider", min: 0, max: 10, step: 0.1, def: 5 },
    ]},
  REVERB: { label: "Reverb (standalone)", stage: "REVERB",
    fields: [
      { key: "level", label: "Level", type: "slider", min: 0, max: 10, step: 0.1, def: 3 },
      { key: "decay", label: "Decay", type: "slider", min: 0, max: 10, step: 0.1, def: 5 },
      { key: "tone", label: "Tone", type: "slider", min: 0, max: 10, step: 0.1, def: 5 },
      { key: "space", label: "Space", type: "select", options: ["Hall", "Room", "Plate", "Spring", "None"], def: "Hall" },
    ]},
  EQ: { label: "Graphic EQ", stage: "AMP", isEq: true,
    fields: [
      { key: "level", label: "Level", type: "slider", min: 0, max: 10, step: 0.1, def: 5 },
      { key: "b31", label: "31.25 Hz", type: "slider", min: -12, max: 12, step: 0.1, def: 0 },
      { key: "b62", label: "62.5 Hz", type: "slider", min: -12, max: 12, step: 0.1, def: 0 },
      { key: "b125", label: "125 Hz", type: "slider", min: -12, max: 12, step: 0.1, def: 0 },
      { key: "b250", label: "250 Hz", type: "slider", min: -12, max: 12, step: 0.1, def: 0 },
      { key: "b500", label: "500 Hz", type: "slider", min: -12, max: 12, step: 0.1, def: 0 },
      { key: "b1k", label: "1 kHz", type: "slider", min: -12, max: 12, step: 0.1, def: 0 },
      { key: "b2k", label: "2 kHz", type: "slider", min: -12, max: 12, step: 0.1, def: 0 },
      { key: "b4k", label: "4 kHz", type: "slider", min: -12, max: 12, step: 0.1, def: 0 },
      { key: "b8k", label: "8 kHz", type: "slider", min: -12, max: 12, step: 0.1, def: 0 },
      { key: "b16k", label: "16 kHz", type: "slider", min: -12, max: 12, step: 0.1, def: 0 },
    ]},
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
  telecaster: { label: "Telecaster (single-coil / noiseless)", outputComp: 8,
    positions: [
      { key: "bridge", label: "Bridge", desc: "Brightest, twangy, cuts through.", delta: { treble: 8, presence: 8, gain: -4 } },
      { key: "middle", label: "Middle (both pickups)", desc: "Scooped, quacky, glassy.", delta: { mid: -8, treble: 2 } },
      { key: "neck", label: "Neck", desc: "Warm, round, smooth.", delta: { treble: -10, bass: 5, mid: 5 } },
    ]},
  stratocaster: { label: "Stratocaster (single-coil)", outputComp: 8,
    positions: [
      { key: "bridge", label: "Bridge", desc: "Bright, cutting, thin under heavy gain.", delta: { treble: 8, presence: 8, gain: -4 } },
      { key: "position2", label: "Position 2 (bridge+middle)", desc: "Classic quack.", delta: { mid: -10, treble: 2 } },
      { key: "middle", label: "Middle", desc: "Balanced, slightly warm.", delta: { mid: -3 } },
      { key: "position4", label: "Position 4 (middle+neck)", desc: "Warm quack.", delta: { mid: -6, bass: 3 } },
      { key: "neck", label: "Neck", desc: "Warm, round, thick.", delta: { treble: -10, bass: 5, mid: 5 } },
    ]},
  humbucker: { label: "Les Paul / other humbucker guitar", outputComp: -6,
    positions: [
      { key: "bridge", label: "Bridge", desc: "Thick, cutting, high output.", delta: { presence: 4, gain: 2 } },
      { key: "middle", label: "Both (middle switch)", desc: "Fuller, slightly scooped.", delta: { mid: -4 } },
      { key: "neck", label: "Neck", desc: "Warm, thick, smooth.", delta: { treble: -6, bass: 4 } },
    ]},
  semihollow: { label: "Semi-hollow / P90 guitar", outputComp: 3,
    positions: [
      { key: "bridge", label: "Bridge", desc: "Bright with airy body.", delta: { treble: 5, presence: 4 } },
      { key: "neck", label: "Neck", desc: "Warm, woody.", delta: { treble: -6, bass: 4 } },
    ]},
  acoustic: { label: "Acoustic-Electric", outputComp: -3, isAcoustic: true, positionsLabel: "Pickup / mic system",
    positions: [
      { key: "undersaddle", label: "Under-saddle Piezo", desc: "Bright, slightly quacky — the most common acoustic-electric pickup.", delta: { treble: -8, presence: -6, mid: 6, bass: 4 } },
      { key: "soundhole", label: "Soundhole Magnetic", desc: "Warmer, more electric-guitar-like.", delta: { bass: 4, treble: -3 } },
      { key: "mic", label: "Internal Mic", desc: "Most natural, full-range — keep EQ changes gentle.", delta: {} },
      { key: "blended", label: "Blended (Piezo + Mic)", desc: "Balances clarity with warmth.", delta: { treble: -3, mid: 2 } },
    ]},
};

const clamp = (n) => Math.max(0, Math.min(100, Math.round(n)));
const pct = (v) => clamp((v || 0) * 10);
const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
const uid = () => Math.random().toString(36).slice(2, 9);

/* ---------------------------------------------------------------------- */
/* Example preload                                                        */
/* ---------------------------------------------------------------------- */
function buildExampleChain() {
  return [
    { id: uid(), category: "NOISE_GATE", name: "Noise Gate", values: { threshold: 3.5, decay: 2.0 } },
    { id: uid(), category: "AMP", name: "Teavoy ValveKing", values: { volume: 7.5, drive: 3.4, presence: 6.4, resonance: 0.0, texture: 7.8, bass: 7.0, mid: 6.0, treble: 7.5, reverb: 0 } },
    { id: uid(), category: "DELAY", name: "Echology", values: { type: "Digital", effectLevel: 1.5, time: 0.9, color: 10.0 } },
    { id: uid(), category: "CAB", name: "4x12 Teavoy ValveKing", values: { power: true, micModel: "Workhorse 57", micPosition: "On Axis" } },
    { id: uid(), category: "EQ", name: "EQ Monster", values: { level: 5.0, b31: -12, b62: -8.7, b125: -5.9, b250: -2.8, b500: -1.0, b1k: 0.0, b2k: 0.0, b4k: 1.0, b8k: 0.8, b16k: -1.9 } },
  ];
}

/* ---------------------------------------------------------------------- */
/* Mod field mapping — generic Tonebridge Rate/Depth/Mix -> Prime type      */
/* ---------------------------------------------------------------------- */
function mapModFields(type, v) {
  const def = MOD_PRIME_TYPES[type] || MOD_PRIME_TYPES["Ana Chorus"];
  const rate = pct(v.rate), depth = pct(v.depth), mix = pct(v.mix);
  const params = [];
  const notes = [];
  def.fields.forEach((f) => {
    switch (f) {
      case "Rate": params.push({ label: "Rate", value: rate }); break;
      case "Mix": params.push({ label: "Mix", value: mix }); break;
      case "Level": params.push({ label: "Level", value: mix }); break;
      case "Depth": params.push({ label: "Depth", value: depth }); break;
      case "Feedback": params.push({ label: "Feedback", value: depth }); notes.push("No direct Feedback knob on the Tonebridge side — using Depth as a stand-in."); break;
      case "Tone": params.push({ label: "Tone", value: 50 }); notes.push("No Tone control on the Tonebridge side — starting at 50, adjust by ear."); break;
      case "Q": params.push({ label: "Q", value: depth }); notes.push("Using Depth as a stand-in for Q."); break;
      case "Sample": params.push({ label: "Sample", value: rate }); notes.push("Using Rate as a stand-in for Sample rate."); break;
      case "Bit": params.push({ label: "Bit", value: depth }); notes.push("Using Depth as a stand-in for Bit depth."); break;
      case "Rise": params.push({ label: "Rise", value: 100 - rate }); notes.push("Using inverse Rate as a stand-in for Rise."); break;
      case "Pitch": params.push({ label: "Pitch", value: 0 }); notes.push("No Pitch control on the Tonebridge side — set manually."); break;
      default: params.push({ label: f, value: mix });
    }
  });
  if (!def.confirmed) notes.push(`${type}'s exact Prime P1 field names aren't confirmed yet — shown as a best estimate.`);
  return { params, note: notes.join(" ") };
}

/* ---------------------------------------------------------------------- */
/* Conversion                                                              */
/* ---------------------------------------------------------------------- */
function convert(chain, guitar, position) {
  const stages = { DYNA: [], OD: [], AMP: [], CAB: [], MOD: [], DELAY: [], REVERB: [] };
  let ampEq = null;
  const eqFolds = [];
  let primaryToneRef = null;
  const isAcoustic = !!guitar.isAcoustic;

  chain.forEach((pedal) => {
    const v = pedal.values;
    switch (pedal.category) {
      case "NOISE_GATE":
        stages.DYNA.push({ id: pedal.id, name: (pedal.name || "Noise Gate") + " → Dyna: NG", params: [
          { label: "Threshold", value: pct(v.threshold) }, { label: "Decay", value: pct(v.decay) },
        ], note: "Prime's NG field names aren't confirmed by screenshot yet — shown as a best estimate." });
        break;
      case "COMPRESSOR":
        stages.DYNA.push({ id: pedal.id, name: (pedal.name || "Compressor") + " → Dyna: Comp", params: [
          { label: "Attack", value: pct(v.attack) },
          { label: "Threshold", value: clamp(100 - pct(v.sustain)) },
          { label: "Ratio", value: 50 },
          { label: "Level", value: pct(v.level) },
        ], note: "Tonebridge's Sustain/Tone knobs don't map 1:1 to Prime's Threshold/Ratio — Threshold is inverted from Sustain, Ratio defaults to noon (50). Adjust both by ear." });
        break;
      case "DRIVE": {
        const lineage = lookupModeledOn(pedal.name);
        const od = matchOD(lineage, v.drive);
        stages.OD.push({ id: pedal.id, name: `${pedal.name || "Drive"} → ${od.name}`, params: [
          { label: "Gain", value: pct(v.drive) }, { label: "Tone", value: pct(v.tone) }, { label: "Vol", value: pct(v.level) },
        ], note: (lineage ? `Modeled on ${lineage}. ` : "") + od.reason });
        break;
      }
      case "AMP": {
        const eq = { gain: pct(v.drive), bass: pct(v.bass), mid: pct(v.mid), treble: pct(v.treble), presence: pct(v.presence) };
        const lineage = lookupModeledOn(pedal.name);
        const { amp, reason } = matchAmp(lineage, tierFromGain(v.drive));
        stages.AMP.push({ id: pedal.id, name: `${pedal.name || "Amp"} → ${amp.name}`, ampObj: amp, params: [
          { label: "Gain", value: eq.gain }, { label: "Bass", value: eq.bass }, { label: "Mid", value: eq.mid },
          { label: "Treble", value: eq.treble }, { label: "Presence", value: eq.presence }, { label: "Master", value: pct(v.volume) },
        ], note: (lineage ? `Modeled on ${lineage}. ` : "") + reason });
        const { cab, reason: cabReason } = matchCab(amp);
        stages.CAB.push({ id: pedal.id + "-cab", name: cab, note: cabReason, isNameOnly: true });
        if (v.reverb > 0) {
          stages.REVERB.push({ id: pedal.id + "-rv", name: (pedal.name || "Amp") + " onboard reverb → Reverb: Room", params: [
            { label: "Pre Delay", value: 5, unit: "ms" }, { label: "Level", value: pct(v.reverb) }, { label: "Decay", value: 50 }, { label: "Tone", value: 50 },
          ], note: "Carried over from the amp's built-in reverb — blend with any standalone reverb pedal below." });
        }
        primaryToneRef = { stage: "AMP", id: pedal.id };
        ampEq = eq;
        break;
      }
      case "CAB":
        // Prime's cabinet stage has no editable parameters — informational only.
        stages.CAB.push({ id: pedal.id, name: (pedal.name || "Cabinet") + " (info only)", isNameOnly: true,
          note: `Tonebridge mic settings (${v.micModel || "—"}, ${v.micPosition}) don't carry over — Prime's Cab stage is name-only with no mic modeling. Treat On Axis as brighter/tighter if you want to compensate via the Amp's Treble/Presence instead.` });
        break;
      case "MOD": {
        const { params, note } = mapModFields(v.type, v);
        stages.MOD.push({ id: pedal.id, name: `${pedal.name || "Modulation"} → Mod: ${v.type}`, params, note });
        break;
      }
      case "DELAY": {
        const ms = Math.round((v.time || 0) * 1000);
        stages.DELAY.push({ id: pedal.id, name: `${pedal.name || "Delay"} → Delay: ${v.type}`, params: [
          { label: "Level", value: pct(v.effectLevel) },
          { label: `Time (≈${ms}ms)`, value: clamp((ms / 2000) * 100) },
          { label: "Feedback", value: pct(v.color) },
        ], note: "Feedback approximated from Tonebridge's Color knob (no direct repeats control on that pedal) — adjust by ear. Time assumed in seconds → ms." });
        break;
      }
      case "REVERB": {
        if (v.space === "None") break;
        const type = REVERB_PRIME_TYPES.includes(v.space) ? v.space : "Room";
        stages.REVERB.push({ id: pedal.id, name: `${pedal.name || "Reverb"} → Reverb: ${type}`, params: [
          { label: "Pre Delay", value: 5, unit: "ms" }, { label: "Level", value: pct(v.level) },
          { label: "Decay", value: pct(v.decay) }, { label: "Tone", value: pct(v.tone) },
        ], note: "Pre Delay has no Tonebridge equivalent — defaulted low (5ms)." });
        break;
      }
      case "EQ": {
        const bassDelta = avg([v.b31, v.b62, v.b125]) / 2;
        const midDelta = avg([v.b250, v.b500, v.b1k]) / 2;
        const trebleDelta = avg([v.b2k, v.b4k]) / 2;
        const presenceDelta = avg([v.b8k, v.b16k]) / 2;
        eqFolds.push({ bassDelta, midDelta, trebleDelta, presenceDelta });
        stages.CAB.push({ id: pedal.id, name: (pedal.name || "Graphic EQ") + " (folded into Amp EQ)", isNameOnly: true,
          note: "Prime has no standalone multiband EQ stage — folded into the Amp block's Bass/Mid/Treble/Presence as an approximate nudge." });
        break;
      }
      default: break;
    }
  });

  let baseEq = ampEq || { gain: 45, bass: 50, mid: 50, treble: 50, presence: 50 };
  eqFolds.forEach((f) => {
    baseEq = { ...baseEq,
      bass: clamp(baseEq.bass + f.bassDelta), mid: clamp(baseEq.mid + f.midDelta),
      treble: clamp(baseEq.treble + f.trebleDelta), presence: clamp(baseEq.presence + f.presenceDelta) };
  });
  const d = position.delta;
  const finalEq = {
    gain: clamp(baseEq.gain + guitar.outputComp + (d.gain || 0)),
    bass: clamp(baseEq.bass + (d.bass || 0)), mid: clamp(baseEq.mid + (d.mid || 0)),
    treble: clamp(baseEq.treble + (d.treble || 0)), presence: clamp(baseEq.presence + (d.presence || 0)),
  };
  if (primaryToneRef) {
    const arr = stages[primaryToneRef.stage];
    const block = arr.find((b) => b.id === primaryToneRef.id);
    if (block) {
      block.params = block.params.map((p) => {
        if (p.label === "Gain") return { ...p, value: finalEq.gain };
        if (p.label === "Bass") return { ...p, value: finalEq.bass };
        if (p.label === "Mid") return { ...p, value: finalEq.mid };
        if (p.label === "Treble") return { ...p, value: finalEq.treble };
        if (p.label === "Presence") return { ...p, value: finalEq.presence };
        return p;
      });
      block.note = `${block.note} EQ already includes ${eqFolds.length ? "graphic-EQ folding + " : ""}your guitar/pickup compensation (${guitar.label}, ${position.label}).`;
    }
  } else {
    stages.AMP.push({ id: "inferred-amp", name: "Amp (inferred — no amp pedal in chain)", params: [
      { label: "Gain", value: finalEq.gain }, { label: "Bass", value: finalEq.bass }, { label: "Mid", value: finalEq.mid },
      { label: "Treble", value: finalEq.treble }, { label: "Presence", value: finalEq.presence }, { label: "Master", value: 60 },
    ]});
  }
  return stages;
}

/* ---------------------------------------------------------------------- */
/* UI primitives                                                          */
/* ---------------------------------------------------------------------- */
function Field({ field, value, onChange, c }) {
  if (field.type === "slider") {
    return (
      <div>
        <div className="flex justify-between font-mono text-[10px] mb-1" style={{ color: c.textMuted }}>
          <span>{field.label}</span><span style={{ color: c.textDim }}>{value}</span>
        </div>
        <input type="range" min={field.min} max={field.max} step={field.step} value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          style={{ accentColor: c.accent }} className="w-full h-1" />
      </div>
    );
  }
  if (field.type === "toggle") {
    return (
      <label className="flex items-center justify-between font-mono text-[10px] cursor-pointer" style={{ color: c.textMuted }}>
        <span>{field.label}</span>
        <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} style={{ accentColor: c.accent }} />
      </label>
    );
  }
  if (field.type === "select") {
    return (
      <div>
        <div className="font-mono text-[10px] mb-1" style={{ color: c.textMuted }}>{field.label}</div>
        <select value={value} onChange={(e) => onChange(e.target.value)}
          style={{ background: c.bg, borderColor: c.border, color: c.text }}
          className="w-full border rounded px-2 py-1 text-xs">
          {field.options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
    );
  }
  return (
    <div>
      <div className="font-mono text-[10px] mb-1" style={{ color: c.textMuted }}>{field.label}</div>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
        style={{ background: c.bg, borderColor: c.border, color: c.text }}
        className="w-full border rounded px-2 py-1 text-xs" />
    </div>
  );
}

function PedalCard({ pedal, onChange, onRemove, dragProps, c }) {
  const cat = CATEGORIES[pedal.category];
  return (
    <div draggable {...dragProps} style={{ background: c.panel, borderColor: c.border }}
      className="border rounded-md overflow-hidden cursor-grab active:cursor-grabbing">
      <div className="flex items-center gap-2 px-3 py-2 border-b" style={{ background: c.panelAlt, borderColor: c.border }}>
        <GripVertical size={14} className="shrink-0" style={{ color: c.textFaint }} />
        <input value={pedal.name} onChange={(e) => onChange({ ...pedal, name: e.target.value })} placeholder={cat.label}
          style={{ color: c.text }} className="bg-transparent font-display text-sm font-semibold focus:outline-none flex-1 min-w-0" />
        <span className="font-mono text-[9px] uppercase tracking-widest shrink-0" style={{ color: c.accent }}>{cat.label.split(" ")[0]}</span>
        <button onClick={() => onRemove(pedal.id)} className="shrink-0" style={{ color: c.textMuted }}><X size={14} /></button>
      </div>
      <div className={`px-3 py-3 grid gap-x-4 gap-y-3 ${cat.isEq ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3"}`}>
        {cat.fields.map((f) => (
          <Field key={f.key} field={f} value={pedal.values[f.key]} c={c}
            onChange={(val) => onChange({ ...pedal, values: { ...pedal.values, [f.key]: val } })} />
        ))}
      </div>
    </div>
  );
}

function useDragReorder(list, setList) {
  const dragIdx = useRef(null);
  const onDragStart = (i) => (e) => { dragIdx.current = i; e.dataTransfer.effectAllowed = "move"; };
  const onDragOver = () => (e) => { e.preventDefault(); };
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
  return { onDragStart, onDragOver, onDrop };
}

/* ---------------------------------------------------------------------- */
/* Main component                                                         */
/* ---------------------------------------------------------------------- */
export default function PrimeP1ToneConverter() {
  const [themeKey, setThemeKey] = useState("dark");
  const c = THEMES[themeKey];
  const [chain, setChain] = useState([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [guitarKey, setGuitarKey] = useState("telecaster");
  const [positionKey, setPositionKey] = useState("bridge");
  const [stageOrder, setStageOrder] = useState(DEFAULT_STAGE_ORDER);

  const guitar = GUITARS[guitarKey];
  const position = guitar.positions.find((p) => p.key === positionKey) || guitar.positions[0];

  useEffect(() => { setPositionKey(GUITARS[guitarKey].positions[0].key); }, [guitarKey]);

  const stages = useMemo(() => convert(chain, guitar, position), [chain, guitar, position]);

  const addPedal = (catKey) => {
    setChain([...chain, { id: uid(), category: catKey, name: "", values: defaultValues(catKey) }]);
    setPickerOpen(false); setSearch("");
  };
  const removePedal = (id) => setChain(chain.filter((p) => p.id !== id));
  const updatePedal = (updated) => setChain(chain.map((p) => (p.id === updated.id ? updated : p)));

  const chainDrag = useDragReorder(chain, setChain);
  const stageDrag = useDragReorder(stageOrder, setStageOrder);

  const filteredCats = Object.entries(CATEGORIES).filter(([, cat]) => cat.label.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ background: c.bg, color: c.text }} className="w-full min-h-screen font-sans transition-colors">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@400;500;600&display=swap');
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-mono { font-family: 'IBM Plex Mono', monospace; }
        .font-body { font-family: 'Inter', sans-serif; }
      `}</style>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-baseline justify-between mb-2 flex-wrap gap-2">
          <h1 className="font-display text-3xl font-bold tracking-tight">Signal<span style={{ color: c.accent }}>Match</span></h1>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs uppercase tracking-widest" style={{ color: c.textMuted }}>Tonebridge → Prime P1</span>
            <button onClick={() => setThemeKey(themeKey === "dark" ? "light" : "dark")}
              style={{ background: c.panel, borderColor: c.border, color: c.text }}
              className="border rounded-full p-1.5 hover:opacity-80" aria-label="Toggle theme">
              {themeKey === "dark" ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          </div>
        </div>
        <p className="font-body text-sm max-w-3xl mb-4" style={{ color: c.textMuted }}>
          Build the Tonebridge chain with its real fields, then get a Prime P1 chain with matched amp/cab models, real per-type Dyna/Mod controls, and honest notes wherever a value is approximated.
        </p>

        <div className="flex gap-3 items-start border rounded-md px-4 py-3 mb-8" style={{ background: c.warnBg, borderColor: c.border }}>
          <AlertTriangle size={16} className="shrink-0 mt-0.5" style={{ color: c.warnText }} />
          <p className="font-body text-xs leading-relaxed" style={{ color: c.warnBody }}>
            Neither app publishes an API or parameter spec. Amp/cab matches use Tonebridge's own "modeled on" text where known, plus Prime's naming conventions — flagged inline as lineage-matched vs. tier-only guesses.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* LEFT */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="font-mono text-[11px] uppercase tracking-widest" style={{ color: c.textMuted }}>Tonebridge chain</div>
              <button onClick={() => setChain(buildExampleChain())} className="font-mono text-[10px] hover:underline" style={{ color: c.accent }}>Load example</button>
            </div>

            <div className="space-y-3">
              {chain.map((pedal, i) => (
                <PedalCard key={pedal.id} pedal={pedal} onChange={updatePedal} onRemove={removePedal} c={c}
                  dragProps={{ onDragStart: chainDrag.onDragStart(i), onDragOver: chainDrag.onDragOver(i), onDrop: chainDrag.onDrop(i) }} />
              ))}
            </div>

            {chain.length === 0 && (
              <div className="border border-dashed rounded-md py-8 text-center font-body text-xs mb-3" style={{ borderColor: c.border, color: c.textFaint }}>
                No pedals yet — add one below or load the example.
              </div>
            )}

            <div className="relative mt-3">
              <button onClick={() => setPickerOpen(!pickerOpen)}
                style={{ borderColor: c.border, color: c.textMuted }}
                className="w-full flex items-center justify-center gap-2 border border-dashed rounded-md py-2.5 font-mono text-xs uppercase tracking-widest hover:opacity-80 transition-opacity">
                <Plus size={14} /> Add pedal
              </button>
              {pickerOpen && (
                <div className="absolute z-10 mt-2 w-full border rounded-md shadow-xl p-2" style={{ background: c.panel, borderColor: c.border }}>
                  <input autoFocus value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search pedal type…"
                    style={{ background: c.bg, borderColor: c.border, color: c.text }}
                    className="w-full border rounded px-3 py-2 text-sm mb-2 focus:outline-none" />
                  <div className="max-h-64 overflow-y-auto space-y-1">
                    {filteredCats.map(([key, cat]) => (
                      <button key={key} onClick={() => addPedal(key)} style={{ color: c.textDim }}
                        className="w-full text-left px-3 py-2 rounded font-body text-sm hover:opacity-80">
                        {cat.label}
                      </button>
                    ))}
                    {filteredCats.length === 0 && <div className="px-3 py-2 text-xs" style={{ color: c.textFaint }}>No match</div>}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 space-y-4">
              <div>
                <label className="font-mono text-[11px] uppercase tracking-widest mb-2 flex items-center gap-2" style={{ color: c.textMuted }}><Guitar size={13} /> Your guitar</label>
                <select value={guitarKey} onChange={(e) => setGuitarKey(e.target.value)}
                  style={{ background: c.panel, borderColor: c.border, color: c.text }}
                  className="w-full border rounded-md px-3 py-2 font-body text-sm focus:outline-none">
                  {Object.entries(GUITARS).map(([key, g]) => <option key={key} value={key}>{g.label}</option>)}
                </select>
              </div>
              <div>
                <label className="font-mono text-[11px] uppercase tracking-widest mb-2 block" style={{ color: c.textMuted }}>{guitar.positionsLabel || "Pickup position"}</label>
                <div className="flex flex-col gap-2">
                  {guitar.positions.map((p) => (
                    <button key={p.key} onClick={() => setPositionKey(p.key)}
                      style={ positionKey === p.key ? { borderColor: c.accent, background: c.accentBg } : { borderColor: c.border, background: c.panel, color: c.textDim } }
                      className="text-left px-3 py-2 rounded-md border font-body text-xs transition-colors">
                      <span className="font-semibold" style={{ color: c.text }}>{p.label}</span>
                      <span className="block mt-0.5" style={{ color: c.textMuted }}>{p.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div>
            <div className="font-mono text-[11px] uppercase tracking-widest mb-3" style={{ color: c.textMuted }}>Prime P1 chain (drag to reorder)</div>
            <div className="space-y-3">
              {stageOrder.map((stageKey, i) => {
                const meta = STAGE_META[stageKey];
                const Icon = meta.icon;
                const items = stages[stageKey];
                return (
                  <div key={stageKey} draggable onDragStart={stageDrag.onDragStart(i)} onDragOver={stageDrag.onDragOver(i)} onDrop={stageDrag.onDrop(i)}
                    style={{ background: c.panel, borderColor: c.border }}
                    className="border rounded-md overflow-hidden cursor-grab active:cursor-grabbing">
                    <div className="flex items-center gap-2 px-4 py-2 border-b" style={{ background: c.panelAlt, borderColor: c.border }}>
                      <GripVertical size={14} style={{ color: c.textFaint }} />
                      <span className="font-mono text-[10px]" style={{ color: c.accent }}>{String(i + 1).padStart(2, "0")}</span>
                      <Icon size={14} style={{ color: c.text }} />
                      <span className="font-display text-sm font-semibold">{meta.label}</span>
                      {items.length === 0 && <span className="ml-auto font-mono text-[10px]" style={{ color: c.textFaint }}>empty</span>}
                    </div>
                    {items.length > 0 && (
                      <div className="px-4 py-3 space-y-4">
                        {items.map((item) => (
                          <div key={item.id}>
                            <div className="font-body text-sm font-medium mb-2">{item.name}</div>
                            {!item.isNameOnly && item.params && (
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2">
                                {item.params.map((p, idx) => (
                                  <div key={idx}>
                                    <div className="font-mono text-[10px] mb-1" style={{ color: c.textFaint }}>{p.label}</div>
                                    <div className="flex items-center gap-2">
                                      <div className="h-1.5 flex-1 rounded-full overflow-hidden" style={{ background: c.track }}>
                                        <div className="h-full" style={{ width: `${p.value}%`, background: c.accent }} />
                                      </div>
                                      <span className="font-mono text-[10px] w-8 text-right" style={{ color: c.textMuted }}>{p.value}{p.unit || ""}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                            {item.note && (
                              <div className="flex gap-1.5 mt-2">
                                <Info size={11} className="shrink-0 mt-0.5" style={{ color: c.textFaint }} />
                                <p className="font-body text-[11px] leading-relaxed" style={{ color: c.textFaint }}>{item.note}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-6 border rounded-md px-4 py-3" style={{ background: c.accentBg, borderColor: c.border }}>
              <div className="font-mono text-[11px] uppercase tracking-widest mb-1 flex items-center gap-2" style={{ color: c.accent }}><Guitar size={13} /> {guitar.positionsLabel || "Pickup position"}</div>
              <div className="font-body text-sm">{position.label} — {guitar.label}</div>
              <div className="font-body text-xs mt-1" style={{ color: c.textMuted }}>{position.desc}</div>
              <div className="font-body text-[11px] mt-2" style={{ color: c.textFaint }}>Gain/EQ compensation for this guitar is already folded into the Amp block above.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}