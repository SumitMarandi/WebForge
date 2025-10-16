# WebForge

This document describes how to set up and deploy the **production version** of the WebForge web application built with **React (frontend)**, **Supabase (backend)**, and **Cashfree Payments** for billing.

---

## 🚀 Overview
WebForge is a modern, full-stack web builder that allows users to create, edit, and publish websites easily. The production setup focuses on scalability, performance, and cost-efficiency.

**Stack Summary:**
- **Frontend:** React + TypeScript + Vite (hosted on Vercel)
- **Backend:** Supabase (Auth, Database, Storage, Edge Functions)
- **Payments:** Cashfree Payments API (India-friendly, supports subscriptions)
- **Hosting:** Vercel for frontend, Supabase Storage for published sites

---

## 🧱 Project Structure
```
/webforge
  ├── frontend/                # React app (Vite)
  │   ├── src/
  │   │   ├── components/      # UI components (editor, dashboard, billing)
  │   │   ├── pages/           # Routes for app pages
  │   │   ├── utils/           # Helper functions & Supabase client
  │   │   └── styles/          # TailwindCSS styles
  │   ├── public/
  │   ├── package.json
  │   ├── vite.config.ts
  │   └── tsconfig.json
  │
  ├── backend/
  │   ├── supabase/
  │   │   ├── migrations/      # SQL schema for tables
  │   │   └── functions/       # Edge Functions (publish-site, webhook)
  │   ├── .env
  │   └── README.md
  │
  ├── docs/                    # Technical docs & deployment notes
  ├── .env                     # Frontend env vars
  ├── docker-compose.yml       # Optional local setup
  └── README.md
```

---

## ⚙️ Supabase Setup

### 1. Create Supabase Project
- Go to [Supabase](https://supabase.com/)
- Create a new project
- Copy **Project URL** and **anon/service role keys** to `.env`

### 2. Run Database Migrations
Use Supabase SQL editor or CLI to create tables:
```bash
supabase db push
```

### 3. Configure Edge Functions
Deploy two core functions:
1. `publish-site` — generates static HTML and uploads to storage
2. `cashfree-webhook` — listens to Cashfree payment updates

Deploy via Supabase CLI:
```bash
supabase functions deploy publish-site
supabase functions deploy cashfree-webhook
```

### 4. Enable Storage Buckets
Create buckets:
- `uploads` (private)
- `public-sites` (public)

---

## 💳 Cashfree Payments Setup

1. Sign up at [Cashfree Dashboard](https://merchant.cashfree.com/)
2. Create an **App** and get **App ID** and **Secret Key**
3. Add these to Supabase Edge Function environment variables:
```bash
CASHFREE_APP_ID=your_app_id
CASHFREE_SECRET_KEY=your_secret_key
CASHFREE_BASE_URL=https://sandbox.cashfree.com/pg/orders  # change to production later
```
4. Configure webhooks in Cashfree Dashboard → Developer → Webhooks:
```
POST https://<YOUR_SUPABASE_FUNCTION_URL>/cashfree-webhook
```

### Payment Flow
- Frontend → `/api/create-order` (Edge Function)
- Cashfree checkout → user pays
- Webhook → updates subscription in Supabase

---

## 🧠 Frontend Configuration

### Install Dependencies
```bash
cd frontend
npm install
```

### Add Environment Variables
`.env` file for Vercel/Frontend:
```
VITE_SUPABASE_URL=https://xyzcompany.supabase.co
VITE_SUPABASE_ANON_KEY=public-anon-key
VITE_CASHFREE_APP_ID=your_app_id
```

### Build and Test Locally
```bash
npm run dev    # local dev
npm run build  # production build
```

### Deploy to Vercel
1. Push repo to GitHub
2. Import project to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Connect custom domain (optional)

---

## 🌐 Publishing Pipeline (Production)

When a user clicks **Publish** in the dashboard:
1. The app calls Supabase Function `publish-site`
2. Function fetches site pages → renders static HTML
3. Uploads bundle to `public-sites/{site-slug}/`
4. Site is accessible via CDN URL:
   ```
   https://<project>.supabase.co/storage/v1/object/public/public-sites/{site-slug}/index.html
   ```

You can optionally connect a reverse proxy or domain routing service (e.g. Vercel rewrites or Cloudflare Workers).

---

## 🧾 Environment Variables Summary
| Variable | Description |
|-----------|-------------|
| `SUPABASE_URL` | Supabase Project URL |
| `SUPABASE_ANON_KEY` | Public client key |
| `SUPABASE_SERVICE_ROLE_KEY` | Private backend key |
| `CASHFREE_APP_ID` | Cashfree Application ID |
| `CASHFREE_SECRET_KEY` | Cashfree Secret Key |
| `CASHFREE_BASE_URL` | API base URL (sandbox/production) |
| `VITE_SUPABASE_URL` | Used in frontend |
| `VITE_SUPABASE_ANON_KEY` | Frontend public key |
| `VITE_CASHFREE_APP_ID` | Frontend cashfree app ID |

---

## 📦 Deployment Strategy

### Production Recommendations
- **Frontend:** Vercel with automatic Git deployments.
- **Backend:** Supabase Edge Functions for serverless tasks.
- **Payments:** Cashfree sandbox → production switch when ready.
- **CDN & Storage:** Supabase Storage CDN (optional Cloudflare caching).
- **Monitoring:** Use Vercel Analytics + Supabase Logs.

### Security Checklist
- ✅ Enable RLS (Row-Level Security) for all tables
- ✅ Validate webhook signatures from Cashfree
- ✅ Use HTTPS for all endpoints
- ✅ Sanitize user input before rendering HTML

---

## 🧭 Maintenance
- Use Supabase backups or versioned migrations
- Add rate limiting to Edge Functions
- Log publish & payment events for debugging
- Implement user quota management (limit sites/pages for free tier)

---

## ✅ Launch Checklist
- [ ] Set environment variables (Supabase + Cashfree)
- [ ] Test payment flow (sandbox)
- [ ] Verify publish pipeline end-to-end
- [ ] Connect custom domain (optional)
- [ ] Deploy production build to Vercel
- [ ] Monitor logs and analytics

---

## 🧩 Future Enhancements
- Custom domain binding (per site)
- Template marketplace
- Multi-user editing
- Advanced analytics (page views, time on site)
- AI-assisted content generator

---

**Author:** WebForge Team  
**Version:** 1.0 (Production Setup)  
**Date:** October 2025

