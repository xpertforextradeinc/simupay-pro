# SimuPay Pro — Contributors Guide

Thank you for contributing to SimuPay Pro! This document details the architectural patterns, styling conventions, and development practices required to maintain a secure, highly performant, and production-grade fintech environment.

---

## 1. Project Overview & Tech Stack

SimuPay Pro is a modern, responsive, high-fidelity fintech and commodities trading simulator workspace built using:
* **Frontend:** React 19, TypeScript, Vite, Tailwind CSS
* **Database & Auth:** Supabase (Auth, RLS, Real-Time Sync)
* **Backend Utilities:** Express (Vite Middleware Proxy for APIs)
* **Animations:** Motion (Motion/React)
* **Icons:** Lucide React

---

## 2. Directory Architecture

```bash
/
├── docs/                   # System and project documentation Guides
├── public/                 # Static assets and icons
├── src/
│   ├── components/         # Modular React views and layouts
│   │   ├── admin/          # Subcomponents for the administrator dashboard
│   │   └── ...
│   ├── data/               # Static dataset configurations
│   ├── hooks/              # Custom application React hooks
│   ├── services/           # DB, API, and third-party integration abstractions
│   ├── App.tsx             # Root navigation and view coordinator
│   ├── main.tsx            # App mount entry point
│   ├── index.css           # Global Tailwind declarations and typography
│   ├── types.ts            # Strict TypeScript types & schemas
│   └── supabase.ts         # Supabase client instantiation
├── server.ts               # Custom Node/Express Dev & API Proxy Server
├── package.json            # Dependencies and start scripts
└── vite.config.ts          # Build bundling optimizer
```

---

## 3. Coding Guidelines

### Clean & Typed Interfaces
* Never use the `any` keyword unless absolutely required. Always declare strict interfaces in `src/types.ts`.
* Place all imports at the top-level of the module.
* Use named imports; do not use general object destructuring for core imports.

### React State Management
* Avoid heavy states inside `App.tsx`. Delegate sub-views to modular components within `src/components/`.
* When writing asynchronous hooks, wrap them inside resilient `try/catch` handlers with user-friendly error boundaries.

### Styling & Brand Cohesion
* Use utility-first **Tailwind CSS** for all components. Do not write external `.css` files.
* **Colors:** Adhere to our premium slate-emerald styling:
  * Brand Accent: Emerald-400 / Emerald-500 (`text-brand-accent`, `bg-brand-accent`)
  * Brand Card backgrounds: Deep high-contrast charcoal slate (`bg-brand-card`)
  * Text Colors: High contrast (`text-brand-text`), Muted (`text-brand-text-dim`, `text-brand-text-muted`)
* Ensure touch targets for interactive items are at least **44px** for mobile-first responsiveness.
* Apply subtle transitions (`transition-all duration-200`) and hover states (`hover:bg-opacity-80`) to provide high-quality cursor feedback.

---

## 4. Workflows & Submissions

1. **Verify Code Integrity:** Prior to submission, run the linter and TypeScript checks:
   ```bash
   npm run lint
   ```
2. **Build for Production:** Verify that Vite can compile your assets flawlessly:
   ```bash
   npm run build
   ```
3. **Commit Convention:**
   * Keep your commits atomic, concise, and focused.
   * Format commits as: `feat: add <feature>`, `fix: resolve <issue>`, or `docs: update <file>`.
