# SimuPay Pro — Deployment Guide

This document describes how to build, optimize, and deploy SimuPay Pro to production. Follow these instructions to ensure secure environment configuration, optimal asset delivery, and resilient API routing.

---

## 1. Key Production Configurations & Requirements

### Required Environment Variables
The application requires the following environment variables to connect to Supabase and execute the AI Operations and Strategy Agent securely:

| Variable Name | Client/Server | Purpose |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | Client-Side | Your unique Supabase Project Endpoint API URL. |
| `VITE_SUPABASE_ANON_KEY` | Client-Side | Your Supabase Project public anonymous API key. |
| `GEMINI_API_KEY` | Server-Side | Your Google AI Studio API key. **DO NOT** prefix with `VITE_` to ensure it remains hidden from the browser. |

---

## 2. Full-Stack Production Build Process

SimuPay Pro employs a modern full-stack Express server wrapper around Vite to securely isolate API transactions.

### Running a Production Build Locally
1. Install dependencies:
   ```bash
   npm install
   ```
2. Execute the production compilation suite:
   ```bash
   npm run build
   ```
   This command triggers two processes:
   * **Vite Build:** Compiles client-side assets (React, HTML, CSS) into optimized, static chunks inside `/dist`.
   * **Esbuild Compilation:** Bundles `server.ts` to `/dist/server.cjs` targeting Node environments, safely excluding external dependencies and optimizing cold starts.

3. Start the production full-stack application:
   ```bash
   npm run start
   ```
   The application binds to port `3000` on interface `0.0.0.0` for safe container ingress routing.

---

## 3. Deployment Platforms

### Option A: Cloud Run / Docker Container Deployment
The application includes support for Docker/Container runtime environments. To deploy via containerized tools:

1. Build your container image:
   ```bash
   docker build -t simupay-pro:latest .
   ```
2. Run your container, exposing port `3000` and feeding in your secure environment variables:
   ```bash
   docker run -p 3000:3000 \
     -e VITE_SUPABASE_URL="your-supabase-url" \
     -e VITE_SUPABASE_ANON_KEY="your-supabase-key" \
     -e GEMINI_API_KEY="your-gemini-key" \
     simupay-pro:latest
   ```

### Option B: Vercel Deployment
To deploy client-side capabilities to Vercel:

1. Connect your GitHub repository to Vercel.
2. In the Vercel Dashboard, navigate to Project Settings.
3. Add the required environment variables:
   * `VITE_SUPABASE_URL`
   * `VITE_SUPABASE_ANON_KEY`
4. Set the build settings:
   * **Build Command:** `vite build`
   * **Output Directory:** `dist`
5. Click **Deploy**. Note: For full server-side AI Operation logs proxying on Vercel, the routes can also be adapted to Vercel Serverless Functions under `/api/*` directory matching `vercel.json` rewrite configurations.
