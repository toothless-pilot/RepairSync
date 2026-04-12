# RepairSync

**The Neutral AI Referee for Auto Repair & Insurance**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Stack: Turborepo](https://img.shields.io/badge/Stack-Turborepo-ef4444)](https://turbo.build/)
[![Backend: Convex](https://img.shields.io/badge/Backend-Convex-22c55e)](https://www.convex.dev/)

RepairSync is a **"Truth Layer"** for the auto insurance ecosystem. It uses computer vision, real-time pricing intelligence, and clinical-grade reporting to resolve friction between insurers, repair shops, and drivers.

---

## 🛡️ Core Features

### 1. Dispute Shield™
The Dispute Shield acts as an automated auditor for collision estimates. It compares manual shop estimates against AI-driven "Referee Reality" to identify:
- 🔴 **Overcharges**: Pricing that exceeds fair market value (>10% delta).
- 🟡 **Safety Risks**: Critical procedures (like ADAS calibrations or sensor checks) that were omitted by the shop.
- 🟢 **Agreed Items**: Line items that match market standards within a 5% tolerance.

### 2. Parts Pricing Pipeline
A sophisticated 3-stage engine that ensures precision in part valuation:
- **Stage 1: VIN-to-SKU**: Decodes VINs via NHTSA and maps damage to exact OEM part numbers.
- **Stage 2: Multi-Source Scraper**: Real-time pricing from OEM Dealers, Aftermarket (RockAuto), and Salvage (Car-Part.com) using Playwright stealth automation.
- **Stage 3: Normalization**: Handles shipping, core charges, and interchange compatibility to provide a "Total Landed Cost."

### 3. Referee Reporting
Generate clinical, "Neutrality Certified" PDF reports designed to be the final word in indemnity disputes. Reports include:
- Vehicle IQ (VIN decoding & severity matrix).
- Visual Evidence (AI-rendered bounding boxes on impact zones).
- Dispute Ledger (Transparent Side-by-Side comparison).

---

## 🚀 Tech Stack

- **Monorepo**: Turborepo
- **Backend**: [Convex](https://convex.dev) (Real-time DB, File Storage, Edge Functions)
- **Web**: Next.js 15, shadcn/ui, Tailwind CSS v4
- **Mobile**: Expo / React Native
- **AI**: Claude 3.5 Sonnet (Vision + Reasoning), OpenAI Whisper
- **State**: Zustand
- **PDF Engine**: `@react-pdf/renderer`

---

## 📂 Repository Structure

```
repair-sync/
├── apps/
│   ├── web/              # Next.js — Shop/Insurer dashboards
│   ├── mobile/           # Expo — Driver photo capture & instant estimates
│   └── convex/           # Backend functions, schema, and AI logic
├── packages/
│   ├── core/             # Pricing formulas, scrapers, and CV constants
│   ├── ui/               # Shared Tailwind/NativeWind components
│   ├── types/            # Zod schemas & TypeScript interfaces
│   └── config/           # Shared ESLint, TSConfig, and Tailwind configs
└── turbo.json            # Monorepo orchestration
```

---

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+
- [Convex Account](https://www.convex.dev) (for backend)

### Installation
```bash
npm install
```

### Environment Variables
Create a `.env.local` in the root (or set in Convex dashboard):
```env
ANTHROPIC_API_KEY=your_key
OPENAI_API_KEY=your_key
PARTSVOICE_API_KEY=your_key
PROXY_SERVER=your_proxy
```

### Development
Start the full stack (Web, Mobile, and Convex):
```bash
npm run dev
```

---

## ⚖️ Our Philosophy: The "Referee" Persona
Unlike traditional estimating platforms that act as a workspace for negotiation, RepairSync provides a **neutral audit**. Our tone is clinical, objective, and data-driven—we don't take sides; we defend the data.

*For detailed implementation specs, see the `/docs` directory.*
