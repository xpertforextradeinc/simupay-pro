# SimuPay Pro 🚀

A modern, high-performance fintech simulation, ledger synchronization, and virtual asset management application. Built with a sleek, military-grade emerald-dark interface, **SimuPay Pro** is designed to provide a comprehensive, ultra-fast sandbox environment for executing cross-chain transactions, auditing ledgers, testing peer-to-peer flash transfers, and generating compliant transaction receipts.

---

[![React Version](https://img.shields.io/badge/react-v19.0-blue.svg?style=flat-square&color=00D853)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/typescript-v5.0-blue.svg?style=flat-square&color=007ACC)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/vite-v5.0-blue.svg?style=flat-square&color=646CFF)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/tailwindcss-v4.0-blue.svg?style=flat-square&color=38B2AC)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/database-supabase-green.svg?style=flat-square&color=3ECF8E)](https://supabase.com)
[![Vercel](https://img.shields.io/badge/deployment-vercel-black.svg?style=flat-square)](https://vercel.com)

---

## 🌟 Strategic Vision & Overview

SimuPay Pro is a simulation-first sandbox system engineered to let users explore digital ledger economics without financial risk. The system incorporates real-time auth, automated ledger verification, dynamic gas fee logic, and deep analytics.

We have recently expanded SimuPay Pro with a **Partner Resource Hub**, offering direct integrations and strategic nodes with top-tier global exchanges (e.g., Gate.com). This allows users to seamlessly bridge their simulation skills into real-world production environments.

---

## ✨ New: Partner Resource Integration Hub

We've introduced context-aware integrations to assist users in selecting industry-leading cryptocurrency providers:
- **Partner Resources Portal**: A dedicated hub accessible via the sidebar, outlining validated platforms, key benefits, and secure sign-up paths.
- **Dynamic Dashboard Callouts**: Responsive banners on the dashboard that prompt users to establish secure partner nodes.
- **Empty-State Recommendations**: Smart detection of clean ledgers (0 transactions) displaying introductory guides to quickstart account creation.
- **Receipt Post-Generation Cards**: Once a receipt is generated, printed, or exported, SimuPay Pro displays smart partner links to easily transition simulation-based assets into live networks.
- **Sidebar Partner Shortcut**: A collapsible, sleek promotional sidebar block that remains highly accessible yet dismissible for seasoned power users.

---

## 💡 Core Feature Suite

### 1. Robust Security & Authentication
- Seamless email-and-password flow combined with Google OAuth sign-in.
- Fully synchronized with **Supabase Auth** and guarded by strict Postgres **Row Level Security (RLS)**.

### 2. Multi-Network Asset Wallet
- Supports virtual asset injection and tracking across several networks: **TRC20, ERC20, BEP20, BTC, ETH**.
- Real-time wallet balance manipulation, address generation, and node safety monitoring.

### 3. Flash P2P Transfers
- Simulated ultra-fast, decentralized peer-to-peer asset transfers.
- Guarded by active transaction PIN requirements, real-time fee calculations, and transaction-status animations.

### 4. Receipts & Ledger Audit
- **Dynamic Receipt Generator**: Select previous ledger entries or construct custom records.
- **Print & Export Styles**: Beautiful, print-media optimized layouts that hide navigation panels and headers automatically when printing (`print:hidden`).
- Instant post-generation recommendation cards for quick deployment.

### 5. Advanced Analytics Dashboard
- Interactive charts utilizing `recharts` for tracking transacted volumes, trends, and fee distributions.
- Real-time KPI trackers showing total balances, transaction speed averages, and active subscription parameters.

### 6. Subscription & License Manager
- Interactive Tier configurations (Basic, Premium, Enterprise) showing relative feature capabilities.
- Real-time profile level updates synced instantly to Supabase.

### 7. Support Portal
- Live support ticket routing and seamless redirect mechanisms linking to official WhatsApp support channels.

---

## 🛠️ Modern Technical Stack

- **Frontend**: React 19, TypeScript (Strict typing enabled), Vite, React Router.
- **Transitions & Animations**: Custom CSS variables, Tailwind transition-effects, and Lucide React icons.
- **Database & Storage**: Supabase (PostgreSQL), providing secure relational storage, schema-driven constraints, and RLS policies.
- **Deployment**: Configured for instant deployment to Vercel and Cloud Run.

---

## 📱 Mobile Developer Guide: Git & GitHub on the Go

If you are developing SimuPay Pro directly from your mobile device, managing Git commits and pushing to GitHub manually can be streamlined using these proven mobile workflows.

### Method A: Pushing via Mobile Terminal (Termux or iSH)

If you are using a mobile terminal emulator like **Termux** (Android) or **iSH** (iOS), you can run full Git commands directly:

1. **Configure Git Credentials** (Use a **Personal Access Token (PAT)** instead of a password):
   ```bash
   git config --global user.name "Your Name"
   git config --global user.email "your.email@example.com"
   ```

2. **Stage your changes**:
   ```bash
   git add .
   ```

3. **Create your commit**:
   ```bash
   git commit -m "feat: integrated partner resource hub and smart recommendations"
   ```

4. **Push your changes securely**:
   ```bash
   git push origin main
   ```
   *Note: When prompted for your password, paste your GitHub Personal Access Token (PAT).*

---

### Method B: Pushing via GitHub Web Editor (No Terminal Needed)

If your mobile device doesn't have a terminal emulator, you can commit directly from your smartphone's web browser:

1. Visit your repository page on [GitHub](https://github.com).
2. Request **Desktop Site** in your mobile browser settings.
3. Tap **Add file** -> **Upload files** to upload individual components or templates.
4. Alternatively, press **`.` (the period key)** on any GitHub repository page to launch **GitHub Web Editor (VS Code in Browser)**, which supports full mobile-friendly code adjustments and direct web-based commits!

---

### Method C: Pushing via Git App (Working Copy / MGit)

- **iOS (iPhone/iPad)**: Use the app **Working Copy**. It is a powerful mobile Git client that lets you clone, edit, stage, commit, and push directly with interactive visual UI.
- **Android**: Use **MGit** or **Pocket Git** to manage keys, repository states, and push to remote targets.

---

## ⚙️ Quickstart & Environment Setup

To run this project locally or in a container, you must configure your environment variables. Create a `.env` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 1. Installation
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
The application will boot on `http://localhost:3000` (mapped by Vite).

### 3. Production Build
```bash
npm run build
```
Builds highly optimized static assets into the `dist/` directory.

---

## 🔐 Supabase Configuration & Policies

1. **Auth Providers**:
   - Go to **Authentication** -> **Providers** -> **Email** and enable it.
   - Go to **Authentication** -> **Providers** -> **Google** and toggle "Enabled". Enter your Google Client ID and Secret obtained from the Google Cloud Console.

2. **Redirect URIs**:
   - Set **Site URL** in your Supabase Auth dashboard to: `https://your-vercel-domain.vercel.app`
   - Set **Redirect URLs** to include:
     - `http://localhost:3000/**`
     - `https://your-vercel-domain.vercel.app/**`

3. **Row Level Security (RLS)**:
   - Ensure you enable RLS on your transactional tables and profile tables.
   - Configure a select policy allowing public read access to active partner information if desired, or lock user data down so only authenticated users can modify their profile details (`auth.uid() = user_id`).

---

## 📄 License

This project is proprietary and intended exclusively for sandbox and transaction simulation purposes.

---
*SimuPay Pro: Scaled for mobile developers, optimized for modern global digital asset simulations.*
