# SignalMatch

**Convert a Tonebridge (Ultimate Guitar) pedal chain into a matching Mooer Prime P1 signal chain — automatically, with real fields on both sides.**

SignalMatch is a single-file React tool that reads the pedal chain you built in Tonebridge and produces a corresponding chain for the Mooer Prime P1, matching amps, cabs, and pedal models to real hardware wherever possible. The output is fully editable — nothing is locked to the auto-generated result.

---

## Why this exists

Neither Tonebridge nor the Prime P1 publishes an API, file format, or parameter spec. There's no "export" button that bridges the two apps. SignalMatch closes that gap by acting as a UI-literate translator: it knows what each Tonebridge pedal is _actually modeled on_ (real hardware, taken from Tonebridge's own in-app copy) and what real gear each Prime P1 amp/cab is modeled on, and uses that shared "real gear" layer to line the two up — rather than guessing from knob positions alone.

Nothing here is scraped or reverse-engineered from a private API. It's built from screenshots of both apps' own UIs.

---

## Features

- **Searchable pedal-chain builder** for the Tonebridge side, with real per-category fields (0–10 sliders, ±12dB EQ bands, etc.) matching Tonebridge's actual UI.
- **Automatic amp & cabinet matching** — Tonebridge amp/cab models are matched to the closest real Prime P1 amp/cab by shared real-world lineage (e.g. a Marshall JCM900-style amp matches a Marshall-family Prime amp) when possible, falling back to a gain-tier match with a clearly labeled reason either way.
- **Real amp/cab/mic catalogs on both sides** — all Tonebridge amp models, cabinets, and mic models, and all Prime P1 amps and cabinets, sourced directly from each app's own screens.
- **Fully editable Prime output** — change the matched model via dropdown (fields remap automatically, preserving values that exist in both), tweak any value, add a new effect to any stage, or remove any item.
- **Edit-freezing** — once you manually edit an output value, it's marked "Edited" and won't be overwritten if you keep tweaking the Tonebridge input side. Untouched items keep re-syncing live.
- **Empty by default** — with no pedals in the Tonebridge chain, the Prime output is genuinely empty too (it no longer silently infers a default amp+cab before you've added anything to convert).
- **Clear button** — resets both the Tonebridge chain and the Prime output back to empty in one click.
- **Drag-and-drop reordering** — reorder pedals in the input chain, and stages in the Prime output chain. Dragging reorders live as you drag over other items (not just on drop), with opacity/transition feedback so it reads as a smooth reorder rather than a jump-cut. Mousedown-drag on a slider/select/text field never gets hijacked into a card-reorder drag.
- **"Match my chain order" toggle** — Prime's stage order defaults to a fixed Dyna→OD→Amp→Cab→Mod→Delay→Reverb sequence, independent of how you actually arranged pedals in Tonebridge (within a stage, e.g. two Drive pedals, relative order is always preserved — but the macro stage sequence itself isn't auto-derived by default). Click to re-derive the Prime stage order from your actual Tonebridge chain instead; the button visibly toggles into "Revert chain order" so you can undo it back to whatever order you had before, in either direction.
- **Click-to-type numeric entry** — click any value to type an exact number (Enter to commit, Escape to cancel), clamped to the valid range.
- **Save / Load as JSON** — download the full state (Tonebridge chain, Prime output with per-item "modified" flags, guitar/pickup selection) and reload it later, preserving which output values you'd manually edited.
- **Guitar/pickup EQ compensation** — Telecaster, Stratocaster, humbucker, semi-hollow, and Acoustic-Electric (piezo/magnetic soundhole/internal mic/blended), folded into the amp's EQ with a note describing what was applied.
- **Light/dark theme toggle.**
- **Honest, inline uncertainty flags** — every auto-computed value that's an approximation (rather than a confirmed real Prime field) says so in its note, right next to the value.

### What actually gets converted

| Tonebridge stage                | Prime P1 stage                                                   | Notes                                                                                                                                                                                                                                                                                                                                 |
| ------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Noise Gate                      | Dyna (NG)                                                        | Threshold only — Prime's NG has no Decay control                                                                                                                                                                                                                                                                                      |
| Compressor                      | Dyna (Comp)                                                      | Threshold inverted from Sustain; Ratio has no equivalent, defaults to 50                                                                                                                                                                                                                                                              |
| Drive/Overdrive/Distortion/Fuzz | OD                                                               | Matched to a real Prime OD model via lineage when known                                                                                                                                                                                                                                                                               |
| Amp                             | Amp + Cab (+ Reverb if amp reverb > 0)                           | Amp matched by lineage/gain tier; cab auto-derived from the matched amp; Texture/Resonance folded into Presence/Bass since Prime has no dedicated knobs for them                                                                                                                                                                      |
| Cabinet + Mic                   | _(folded into the Cab item's note)_                              | Prime's Cab stage has no mic modeling. Rather than showing as its own separate card, your real Tonebridge cab + mic choice is appended to the note on whichever Prime Cab item was actually matched — so there's one Cab card, not two. Falls back to its own info-only card only if there's no amp/cab in the chain to attach it to. |
| Modulation (12+ types)          | Mod                                                              | Each sub-type mapped to its real Prime field set                                                                                                                                                                                                                                                                                      |
| Delay / Echo                    | Delay (+ Reverb if the pedal has a Space setting, e.g. Echology) | Feedback is a real editable field (some real pedals, like D-Delay, have one); reverb/delay combo pedals get split into two Prime items since Prime has no combined block                                                                                                                                                              |
| Reverb (standalone)             | Reverb                                                           | Direct mapping                                                                                                                                                                                                                                                                                                                        |
| Graphic EQ                      | _(folded into the Amp's EQ)_                                     | 10 bands folded into Bass/Mid/Treble/Presence deltas                                                                                                                                                                                                                                                                                  |

---

## Data confidence — what's confirmed vs. estimated

This matters because the tool will tell you which numbers to trust.

**Confirmed directly from screenshots:**

- Tonebridge fields are 0–10 scale for all pedal types; EQ bands are ±12dB.
- Prime P1 fields are plain 0–100 integers, except Delay Time (real ms) and Reverb Pre Delay (real ms).
- Prime's Amp block: Gain, Bass, Mid, Treble, Presence, Master (6 knobs, no more).
- Prime's Dyna sub-types (Comp, Touch Wah, Auto Wah, NG) have their own confirmed field sets.
- Prime's Mod sub-types (12 of 14) have confirmed field sets; Vibrato and Stutter are flagged as estimated.
- **Prime's Cab stage has zero editable parameters** — name-only picker.
- Full Prime amp list (52 names) and cab list (25 names).
- Full Tonebridge amp (29), cabinet (27), and mic (8) catalogs, with real-hardware lineage for each, taken from Tonebridge's own "Modeled on \_\_\_" copy.

**Estimated / approximated (flagged inline via notes):**

- Any amp/cab lineage without an obvious real-world match — several Prime amps (e.g. US Sonic, Cardeff, PLX 100) have no known identity and are matched by gain tier only.
- Mod-type field mapping where Tonebridge's generic Rate/Depth/Mix doesn't cover a Prime field.
- Compressor Threshold/Ratio (no 1:1 mapping exists).
- Reverb Pre Delay (no Tonebridge equivalent, defaults low).

If you find a screenshot that resolves one of these, the fix points are: `DYNA_PRIME_TYPES`, `AMP_KEYWORD_MAP` / individual `lineage` fields in `PRIME_AMPS`/`TONEBRIDGE_AMPS`, and `mapModFields()`.

> **A note on keyword specificity in `AMP_KEYWORD_MAP`:** matching is substring-based and first-match-wins, so broad brand keywords (e.g. `"peavey"`) can accidentally catch a specific model that deserves a different family — e.g. `"Peavey ValveKing"` (a mid-gain combo) was originally falling into the generic Peavey bucket alongside `"Peavey 5150-style"` (a high-gain metal family), giving it a completely wrong voicing. When adding a new Tonebridge amp with a lineage that shares a brand with an existing keyword, check whether it needs its own more-specific keyword listed _before_ the generic one, rather than trusting the generic bucket to fit.

---

## Installation & Setup

SignalMatch is a single React component (`App.jsx`) built for **Vite + React + Tailwind v4**.

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ and npm

### 1. Clone the repo

```bash
git clone https://github.com/<your-username>/signalmatch.git
cd signalmatch
```

### 2. Create the Vite project (if starting fresh)

If you're setting this up from scratch rather than cloning a full project:

```bash
npm create vite@latest signalmatch -- --template react
cd signalmatch
```

### 3. Install dependencies

```bash
npm install
npm install tailwindcss @tailwindcss/vite
npm install lucide-react
```

### 4. Configure Tailwind v4

`vite.config.js`:

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

`src/index.css`:

```css
@import "tailwindcss";
```

### 5. Add the component

Drop `App.jsx` into `src/App.jsx` (replacing the default one Vite generates).

### 6. Run it

```bash
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

### Building for production

```bash
npm run build
```

Outputs a static site to `dist/`, deployable to any static host (Vercel, Netlify, GitHub Pages, etc.).

---

## Usage

1. **Build your Tonebridge chain** on the left — search for a pedal category (Noise Gate, Compressor, Drive, Amp, Cab, Mod, Delay, Reverb), add it, name it after the real Tonebridge pedal if you want lineage-based matching, and dial in the values from your actual Tonebridge preset.
2. **Pick your guitar and pickup position** at the top — this feeds into the amp EQ compensation.
3. Watch the **Prime P1 output** on the right update live. Each card shows the matched model, its params, and a note explaining _why_ it was matched or approximated the way it was.
4. **Edit anything you disagree with** — change a matched amp/cab model via its dropdown, retype a value, or add a pedal the auto-match missed. Edited items are marked and won't be overwritten by further input changes.
5. **Save** your work as a JSON file when done; **Load** it later to pick up exactly where you left off, edits and all.
6. Click **Load Example** any time to see a fully worked example chain.

---

## Known limitations

- Prime P1's amp/cab list is smaller and differently-voiced than Tonebridge's — some real-gear lineages (VOX, ENGL, Soldano, Budda, Fargen, Lab Series, etc.) don't have a clean 1:1 Prime equivalent and fall back to the nearest boutique/gain-tier family.
- A handful of Prime field names (NG's Decay, Vibrato/Stutter Mod fields) are still unconfirmed by screenshot.
- No live audio preview — this tool converts _settings_, not sound; you'll still want to fine-tune by ear on the actual Prime P1.

> **Layout gotcha for contributors:** the stage-column cards on the Prime output side used to have `overflow-hidden` (for rounded corners), which silently clipped the absolutely-positioned "Add to stage" dropdown, making it invisible. If you touch that card's styling, keep it `overflow-visible` (rounding is handled per-child instead) or any future popover inside it will have the same problem.

## Contributing

Screenshots of any unconfirmed Prime P1 or Tonebridge parameter screen are the most useful contribution — they let real fields replace estimated ones. Open an issue or PR with the screenshot and which section of the data it resolves.

## License

Project provided as is.

All product names, logos, and trademarks (Tonebridge, Ultimate Guitar, Mooer, Prime P1, and all referenced amp/pedal manufacturers) are property of their respective owners. This project is an independent, unofficial conversion tool and is not affiliated with or endorsed by any of them.
