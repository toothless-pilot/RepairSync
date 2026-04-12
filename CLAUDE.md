# RepairSync

**The Neutral AI Referee for Auto Repair & Insurance**

RepairSync is a "Truth Layer" — using computer vision and dynamic pricing intelligence to resolve friction between insurers, repair shops, and drivers. If the data says a bumper needs replacement, we defend that cost; if a repair is padded, we flag it.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Monorepo | Turborepo |
| Backend | Convex (real-time DB, file storage, vector search) |
| Web | Next.js 15, shadcn/ui (nova), Tailwind CSS v4 |
| Mobile | Expo / React Native |
| Shared | TypeScript packages, Zod schemas |
| AI | Claude API (vision + text), OpenAI Whisper (audio) |
| State | Zustand |
| PDF | @react-pdf/renderer |

## Repo Structure

```
repair-sync/
├── apps/
│   ├── web/              # Next.js — shop/insurer dashboards + driver estimates
│   ├── mobile/           # Expo — photo capture, instant estimates
│   └── convex/           # Backend functions, schema, auth
├── packages/
│   ├── ui/               # Shared Tailwind/NativeWind components
│   ├── core/             # Pricing formulas, CV constants
│   ├── types/            # TypeScript interfaces & Zod schemas
│   └── config/           # ESLint, TSConfig, Tailwind configs
└── turbo.json
```

## Commands

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run lint` — ESLint

## Environment Variables

```
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
```

App runs in demo mode with mock data when keys are missing.

---

## Core Domain Model

### Computer Vision Ontology

Damage is classified into a structured object:

- **Component**: Front Bumper, Quarter Panel, A-Pillar, etc.
- **Sub-Component**: Sensors, fog lights, trim, brackets
- **Material**: Plastic, Aluminum, Carbon Fiber, HSS (determines repairability)
- **Severity**:
  1. **Cosmetic** — paint-only (buff/refinish)
  2. **Minor** — dents/creases < 3 inches (repair/PDR)
  3. **Major** — structural deformation or tears (replace)
  4. **Critical** — airbag deployment or frame rail misalignment (total loss alert)

### Pricing Engine (Three-Factor Model)

1. **OEM Parts API** — real-time MSRP for VIN-specific parts
2. **Regional Labor Index** — labor rates by zip code ($65/hr rural Ohio vs $165/hr San Francisco)
3. **Historical Settlement Data** — embeddings from prior agreed claims to find "True Market Value"

---

## API

- **Endpoint**: `POST /v1/assess/photo-estimate`
- Returns a `confidence_interval` — if AI confidence < 85%, triggers a Human-in-the-Loop (HITL) flag
- Every estimate gets a unique `Estimate_ID` with timestamped data source log

### Key Features

- **Dispute Shield** — compares shop estimate vs AI estimate, highlights overcharges (red) and missing safety procedures (yellow)
- **Resale Impact Score** — predicts how a repair affects CARFAX/resale value

---

## Guardrails

1. **Hidden Damage**: Always state — *"External photos may not reveal internal mechanical or structural compromises."*
2. **Sensor Proximity**: If damage is within 6 inches of Lidar/Radar sensor, auto-add "Calibration Labor"
3. **Total Loss**: If repair cost > 65% of ACV (Actual Cash Value), pivot to "Total Loss Guidance"

## Conventions

- Use shadcn/ui components — never build custom UI when a shadcn component exists
- `gap-*` not `space-*`, `size-*` for equal dimensions, semantic colors
- `cn()` from `@/lib/utils` for conditional classNames
- Car part names use snake_case from `@/lib/constants`
- API routes return `{ error: string }` on failure
- Read `docs/frontend.md` before any frontend work

## Tone & Vocabulary

- **Be**: Objective, transparent, empowering. Always explain the "Why" behind costs.
- **Use**: Indemnity, Supplement, Line-item, OEM, PDR, Recycled Parts, Tolerance
- **Avoid**: Cheap, Scam, Rip-off, Expensive, Guess (use "Statistical Outlier" or "Non-Standard Pricing")
