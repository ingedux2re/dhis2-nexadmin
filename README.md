# DHIS2 NexAdmin

**Enterprise UI/UX Toolkit for DHIS2 System Engineers**

A professional internal tool for DHIS2 admins performing bulk operations, metadata governance, and system engineering tasks — built with Hono + Cloudflare Pages.

---

## 🚀 Getting Started

```bash
npm install
npm run build
npm run dev:sandbox   # starts wrangler pages dev on port 3000
```

## 📦 Deploy to Cloudflare Pages

```bash
npm run deploy:prod
```

---

## 🗂 Project Structure

```
webapp/
├── src/
│   ├── index.tsx              # Main router — 9 routes
│   ├── components/
│   │   └── layout.ts          # App shell: Sidebar, Topbar, SVG icons
│   └── routes/
│       ├── dashboard.ts        # Dashboard with KPIs, activity, health
│       ├── elements.ts         # Data Elements management table
│       ├── datasets.ts         # Datasets with completeness bars
│       ├── bulk.ts             # Bulk Operations wizard
│       ├── governance.ts       # Governance scoring & issue tracker
│       └── misc.ts             # Indicators, Org Units, Validation, Settings
├── public/
│   └── static/
│       └── style.css           # Design system — 35 component groups
├── ecosystem.config.cjs        # PM2 configuration
└── wrangler.jsonc              # Cloudflare Pages config
```

---

## 🌐 Pages & Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Dashboard | KPI overview, activity feed, system health |
| `/elements` | Data Elements | Browse & manage all data elements |
| `/datasets` | Datasets | Dataset management with completeness |
| `/indicators` | Indicators | Calculated indicator formulas |
| `/orgunits` | Org Units | Organisation unit hierarchy browser |
| `/bulk` | Bulk Operations | Wizard-style mass metadata operations |
| `/governance` | Governance | Metadata quality scoring & rules |
| `/validation` | Validation Rules | Data quality validation rules |
| `/settings` | Settings | DHIS2 connection & preferences |

---

## 🎨 Design System

Built with a full CSS design token system:

- **Colors:** 10-step scales for primary, gray, success, warning, danger, info
- **Typography:** Inter (UI) + JetBrains Mono (code/UIDs)
- **Spacing:** 11-step scale (4px–64px)
- **Shadows:** 5 depth levels
- **Components:** Buttons, Cards, Tables, Badges, Forms, Modals, Tabs, Dropdowns, Toasts, Progress bars, Skeletons

---

## 📱 Responsive Breakpoints

| Breakpoint | Layout |
|-----------|--------|
| ≥ 1024px | Full sidebar (240px) + content |
| 768–1024px | Collapsed icon-only sidebar (64px) |
| < 768px | Hidden sidebar + hamburger menu |
| < 480px | Single-column stacked layout |

---

## 🛠 Tech Stack

- **Framework:** [Hono](https://hono.dev) v4 (TypeScript/JSX)
- **Runtime:** Cloudflare Pages / Workers
- **Build:** Vite + @hono/vite-build
- **Process Manager:** PM2 (sandbox dev)
- **Fonts:** Inter + JetBrains Mono (Google Fonts)
- **Icons:** Inline SVG (zero external dependencies)

---

## ✅ Functional Guarantee

This project is a **UI-only layer**. No business logic, API calls, hooks, or state management have been implemented or modified from the original spec. All data displayed is presentational and ready to be wired to real DHIS2 API endpoints.

---

*Built for DHIS2 System Engineers · WHO / World Bank / Bluesquare-grade internal tooling*
