# RepairSync | System Manifest & Technical Context
**Version:** 1.0.1
**Status:** Core Definition
**Role:** The Neutral AI Referee for the Auto Repair & Insurance Economy
---
## 1. Executive Summary
RepairSync is a "Truth Layer" infrastructure. It leverages computer vision and dynamic pricing intelligence to resolve the friction between **Insurers** (who want to minimize payouts), **Repair Shops** (who want to maximize labor/parts revenue), and **Drivers** (who want transparency and safety).
### The "Referee" Philosophy
Unlike incumbents who build tools for *one* side of the transaction, RepairSync's logic is built on **Neutrality**. If the data says a bumper needs replacement, we defend that cost to the insurer; if the data says a repair is padded, we flag it for the driver.
---
## 2. Technical Domain Model
### A. Computer Vision Ontology (CV-O)
The AI must classify damage into a structured object:
* **Primary Entity:** Component (e.g., *Front Bumper, Quarter Panel, A-Pillar*).
* **Sub-Component:** Sensors, fog lights, trim, or internal brackets.
* **Material Science:** Identify substrate (Plastic, Aluminum, Carbon Fiber, HSS) to determine repairability.
* **Damage Severity Matrix:**
    1. **Cosmetic:** Paint-only (Buff/Refinish).
    2. **Minor:** Dents/Creases < 3 inches (Repair/PDR).
    3. **Major:** Structural deformation or tears (Replace).
    4. **Critical:** Airbag deployment or Frame rail misalignment (Total Loss Alert).
### B. The Pricing Engine (Dynamic Intelligence Layer)
Pricing is calculated via a "Three-Factor Authentication" (3FA) model:
1.  **OEM Parts API:** Real-time MSRP for VIN-specific parts.
2.  **Regional Labor Index:** Live scraping of labor rates by Zip Code (e.g., $65/hr in rural Ohio vs. $165/hr in San Francisco).
3.  **Historical "Settlement" Data:** Uses embeddings from previous claims where both shop and insurer agreed on a price, identifying the "True Market Value."
---
## 3. Product & API Architecture
### B2B API Specifications
* **Goal:** Provide a "Quick-Quote" widget for InsurTechs and Fleet Managers.
* **Key Endpoint:** `POST /v1/assess/photo-estimate`
* **Logic Constraint:** The API must return a `confidence_interval`. If the AI is <85% sure, it must trigger a "Human-in-the-Loop" (HITL) flag.
### B2C Feature Set (The "Truth" App)
* **The Dispute Shield:** A feature that compares a shop's written estimate against RepairSync’s AI estimate and highlights discrepancies in red (overcharges) or yellow (missing safety procedures).
* **The Resale Impact Score:** Predicts how the specific repair will affect the vehicle's CARFAX/resale value.
---
## 4. Persona & Communication Guidelines
### Tone of Voice
* **Objective:** Use clinical, mechanical, and legal-adjacent language.
* **Transparent:** Always explain the "Why." Instead of saying "Cost is $1,200," say "Cost is $1,200 because the OEM requires a pre-repair diagnostic scan for this specific ADAS sensor."
* **Empowering:** Reduce user anxiety through data-backed certainty.
### Vocabulary
* **Use:** *Indemnity, Supplement, Line-item, OEM, PDR, Recycled Parts, Tolerance.*
* **Avoid:** *Cheap, Scam, Rip-off, Expensive, Guess.* (Use "Statistical Outlier" or "Non-Standard Pricing" instead).
---
## 5. Strategic Moats & Competition
| Competitor | Their Weakness | RepairSync's Edge |
| :--- | :--- | :--- |
| **Tractable** | Pro-Insurer bias. | Neutrality (Trusted by both shops & drivers). |
| **CCC Intelligent** | Legacy desktop software; "walled garden." | API-First; mobile-native; cloud-speed. |
| **RepairPal** | Consumer-only; no computer vision. | Ends the dispute with visual proof. |
---
## 6. Guardrails & Safety Protocols
1.  **Hidden Damage Warning:** AI must always state: *"External photos may not reveal internal mechanical or structural compromises."*
2.  **Safety First:** If damage is within 6 inches of a sensor (Lidar/Radar), automatically add "Calibration Labor" to the estimate.
3.  **Total Loss Trigger:** If the estimated repair cost exceeds 65% of the vehicle's estimated ACV (Actual Cash Value), pivot UI to "Total Loss Guidance."
---
## 7. Interaction Instructions for LLMs
* **When Coding:** Prioritize **Auditability**. Ensure every estimate generated has a unique `Estimate_ID` and a timestamped log of the data sources used.
* **When Strategizing:** Focus on the **Network Effect**. More photos = better models = higher trust = more users.
* **When Content Creating:** Position RepairSync as the "Stripe for Auto Claims"—the invisible, reliable plumbing of the industry.
## 8. System Architecture Overview
RepairSync is built as a **Unified Monorepo**. This ensures that the "Refining Logic" and "Damage Ontology" defined in the Core Manifest are shared across the Web (Insurers/Shops) and Mobile (Drivers) platforms.
### The Stack
* **Monorepo Manager:** [Turborepo](https://turbo.build/) (Caching, task orchestration).
* **Backend-as-a-Service:** [Convex](https://www.convex.dev/) (Real-time DB, File Storage for photos, Vector Search for invoice similarity).
* **Frontend (Web):** Next.js (Dashboard for shops/insurers).
* **Frontend (Mobile):** Expo / React Native (Photo capture and instant estimates for drivers).
* **Shared Logic:** TypeScript packages for validation, math, and Zod schemas.
---
## 9. Monorepo Structure (`/apps` and `/packages`)
```text
repair-sync/
├── apps/
│   ├── web/                # Next.js: Insurer/Shop Admin Dashboards
│   ├── mobile/             # Expo: Driver app for photo uploads
│   └── convex/             # Centralized Backend (Functions, Schema, Auth)
├── packages/
│   ├── ui/                 # Shared Tailwind/NativeWind components
│   ├── core/               # Shared logic: Pricing formulas, CV constants
│   ├── types/              # Unified TypeScript interfaces & Zod schemas
│   └── config/             # Shared ESLint, TSConfig, Tailwind configs
└── turbo.json

