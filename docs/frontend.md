# RepairSync Frontend Design Guide

**Read this file before working on any frontend code.**

---

## Design Reference

Use `bicycleRef.jpeg` in the project root as the primary visual reference. Key design cues to follow from this reference:

- **Hero product image**: A large, centered, clean illustration of the product (car instead of bicycle) as the focal point of the page
- **Clickable component callouts**: Highlighted interactive zones on the product image that users can click to inspect/annotate — similar to how the bicycle reference shows parts with icon callouts
- **Dark header/footer, light content sections**: Alternating dark and light sections for visual rhythm
- **Accent color highlights**: Use a single bold accent color (neon yellow-green `#CCFF00` or similar) for interactive elements, hover states, and callouts against a mostly monochrome palette
- **Modern, minimal typography**: Clean sans-serif body text, bold display headings
- **Generous whitespace and padding**: Sections are well-spaced, nothing feels cramped
- **Card-based feature sections**: Supporting info presented in clean cards with icons

---

## Layout Structure

### Header (fixed top bar)
- Company name **"RepairSync"** on the left — use a distinctive display font (DM Serif Display or similar)
- Dark background (`bg-zinc-950` or `bg-sidebar`)
- Minimal — no clutter, just the brand name and optionally a "Demo Mode" badge on the right

### Left Sidebar Navigation
- Persistent left sidebar using shadcn `Sidebar` component
- Navigation items:
  - **New Estimate** (icon: `Plus`)
  - **How It Works** (icon: `Info`)
  - **About** (icon: `HelpCircle`)
- Active state: accent color highlight on current route
- Collapsible on mobile (hamburger toggle)
- Dark background matching the header

### Main Content Area
- Fills remaining space to the right of the sidebar and below the header
- Light background (`bg-background` or `bg-zinc-50`)
- Centered content with `max-w-5xl` constraint
- Responsive: single-column on mobile, two-column grid on desktop (`lg:grid-cols-2`)

---

## Interactive Car Diagram (Core Feature)

### Vehicle Type Toggle
- Positioned above the car diagram
- shadcn `ToggleGroup` with two options: **Sedan** and **SUV**
- Switching changes the SVG diagram below
- Styled with accent color for the active selection

### Car SVG Illustration
- **Style**: Black-and-white line drawing, clean and minimal — similar to the bicycle illustration in the reference
- **Format**: Inline SVG with React components, NOT an image file
- **View**: Top-down (bird's eye) view of the vehicle
- **ViewBox**: Approximately `600x300`, scales responsively with `w-full`
- **Stroke**: Black outlines on white/transparent fill
- **Clickable regions**: Each body panel is a separate `<g>` group with its own click handler

### Clickable Car Parts
Each of the following parts must be a separate, clickable SVG group:

| Part ID | Label |
|---------|-------|
| `front_bumper` | Front Bumper |
| `rear_bumper` | Rear Bumper |
| `hood` | Hood |
| `trunk` | Trunk |
| `roof` | Roof |
| `left_fender` | Left Fender |
| `right_fender` | Right Fender |
| `left_front_door` | Left Front Door |
| `left_rear_door` | Left Rear Door |
| `right_front_door` | Right Front Door |
| `right_rear_door` | Right Rear Door |
| `windshield` | Windshield |
| `rear_window` | Rear Window |
| `left_mirror` | Left Mirror |
| `right_mirror` | Right Mirror |
| `left_headlight` | Left Headlight |
| `right_headlight` | Right Headlight |
| `left_taillight` | Left Taillight |
| `right_taillight` | Right Taillight |

### Part Interaction Behavior
- **Default state**: White/transparent fill, black stroke
- **Hover**: Subtle fill change (light gray) and stroke thickens — cursor becomes pointer
- **Damaged (MINOR)**: Fill `yellow-200` (#FEF08A)
- **Damaged (MODERATE)**: Fill `orange-300` (#FDBA74)
- **Damaged (SEVERE)**: Fill `red-400` (#F87171)
- **Transitions**: Smooth CSS transitions on fill and stroke (`transition-all duration-200`)

### Damage Notes Popup
- Opens as a **shadcn Dialog** when a car part is clicked — stays within the main page (no page navigation)
- Dialog contents:
  - **Title**: Part label (e.g., "Front Bumper")
  - **Severity selector**: ToggleGroup with three options — Minor / Moderate / Severe, each color-coded to match the fill colors above
  - **Notes textarea**: Free-form text area for damage description
  - **Save button**: Saves damage entry to Zustand store and closes dialog
  - **Remove button**: Only visible if damage already exists for this part — removes the entry
- After saving, the car part visually updates its fill color to reflect the severity

### "Scan Damages" Button
- Positioned directly below the car diagram
- Large, prominent button using accent color (`bg-[#CCFF00] text-black` or primary variant)
- Full width of the diagram container
- Disabled state when no parts have been marked as damaged
- Shows a badge/count: e.g., "Scan 3 Damages"
- Triggers the AI assessment and estimation flow

---

## Damage Input Panel (Right Column)

Positioned to the right of the car diagram on desktop, below it on mobile.

### Tab Interface
- shadcn `Tabs` with three tabs:
  - **Photo** (Camera icon) — drag-and-drop upload zone, file picker, thumbnail previews, max 5 photos
  - **Audio** (Mic icon) — record button, duration timer, playback controls
  - **Text** (MessageSquare icon) — textarea with example placeholder
- Each tab stores its data independently in the Zustand store

### "Get Estimate" Button
- At the bottom of the input panel
- Accent-colored, full width
- Disabled if no damage input has been provided (no car parts selected AND no photo/audio/text)

---

## Color Palette

| Role | Color | Usage |
|------|-------|-------|
| Background (dark) | `zinc-950` / `#09090b` | Header, sidebar, footer |
| Background (light) | `zinc-50` / `#fafafa` | Main content area |
| Accent | `#CCFF00` (neon yellow-green) | Buttons, active states, highlights, interactive elements |
| Text primary | `zinc-100` on dark, `zinc-900` on light | Body text |
| Text muted | `zinc-400` | Secondary text, placeholders |
| Severity - Minor | `yellow-200` / `#FEF08A` | Minor damage fill |
| Severity - Moderate | `orange-300` / `#FDBA74` | Moderate damage fill |
| Severity - Severe | `red-400` / `#F87171` | Severe damage fill |

---

## Typography

- **Brand name ("RepairSync")**: DM Serif Display, or a similar serif display font — large, distinctive
- **Headings**: System sans-serif stack or Inter — bold weight
- **Body text**: Same sans-serif — regular weight, good line height (1.6)
- **Monospace** (cost ranges): JetBrains Mono or similar — used for displaying dollar amounts

---

## Responsive Behavior

| Breakpoint | Layout |
|------------|--------|
| Mobile (`< 768px`) | Sidebar collapses to hamburger. Single column: car diagram stacks above input panel. |
| Tablet (`768px - 1024px`) | Sidebar visible but narrow. Content adjusts to available width. |
| Desktop (`> 1024px`) | Full sidebar + two-column grid (car diagram left, input panel right). |

- All touch targets must be at least **44x44px**
- Car diagram must scale proportionally and remain usable on small screens

---

## Component Checklist

Before submitting frontend work, verify:

- [ ] "RepairSync" appears in the header with display font
- [ ] Left sidebar navigation works and highlights active route
- [ ] Sedan/SUV toggle switches the car diagram
- [ ] Every car part listed above is clickable
- [ ] Clicking a part opens the damage notes Dialog (not a new page)
- [ ] Severity selection visually updates the part's fill color on the diagram
- [ ] "Scan Damages" button appears below the car image
- [ ] "Scan Damages" is disabled when no parts are damaged
- [ ] Photo upload, audio recording, and text input all work
- [ ] Layout is responsive — works on mobile and desktop
- [ ] Accent color (`#CCFF00`) is used consistently for interactive elements
- [ ] Design follows the visual style of `bicycleRef.jpeg` (clean, modern, dark/light contrast)
