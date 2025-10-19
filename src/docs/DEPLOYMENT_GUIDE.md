# EZ Grades Deployment Guide

## Overview
This guide covers deploying EZ Grades to production, including Supabase setup, frontend hosting, environment configuration, and monitoring.

---

## Prerequisites

### Required Accounts
- [ ] Supabase account (free or pro tier)
- [ ] Vercel/Netlify/Cloudflare Pages account (for frontend hosting)
- [ ] Google Cloud Console (for OAuth)
- [ ] Domain name (optional but recommended)

### Required Tools
```bash
# Node.js 18+ and npm
node --version  # v18.0.0 or higher
npm --version   # 9.0.0 or higher

# Supabase CLI (optional, for migrations)
npm install -g supabase

# Git
git --version
```

---

## Part 1: Supabase Backend Setup

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create new organization (if needed)
4. Create new project:
   - **Name:** ez-grades-prod
   - **Database Password:** Generate strong password (save securely!)
   - **Region:** Choose closest to users
   - **Pricing Plan:** Free or Pro

5. Wait for project initialization (~2 minutes)

### Step 2: Configure Database

1. Navigate to **SQL Editor** in Supabase dashboard
2. Create new query
3. Copy entire contents of `/supabase/schema.sql`
4. Run the query to create all tables, policies, and functions
5. Verify tables created: **Database > Tables**

**Alternative using CLI:**
```bash
cd supabase
supabase db push
```

### Step 3: Enable Authentication Providers

#### Email/Password Auth
1. Navigate to **Authentication > Providers**
2. Enable **Email** provider
3. Configure email templates:
   - **Confirm signup:** Customize welcome email
   - **Reset password:** Add branded header/footer
   - **Magic Link:** Configure if using

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project or select existing
3. Navigate to **APIs & Services > Credentials**
4. Create **OAuth 2.0 Client ID**:
   - Application type: Web application
   - Name: EZ Grades Production
   - Authorized redirect URIs:
     ```
     https://your-project.supabase.co/auth/v1/callback
     https://your-domain.com/auth/callback
     ```
5. Copy Client ID and Client Secret
6. In Supabase dashboard:
   - **Authentication > Providers > Google**
   - Enable Google provider
   - Paste Client ID and Secret
   - Save

### Step 4: Configure Security Settings

#### Row Level Security (RLS)
```sql
-- Verify all tables have RLS enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
-- All should show 't' for rowsecurity
```

#### API Settings
1. **Authentication > Settings**
   - Disable signup: ❌ (leave enabled)
   - Email confirmation: ✅ Enable
   - Secure email change: ✅ Enable
   - Session timeout: 604800 (7 days)

2. **API > Settings**
   - Max rows: 1000 (free tier default)
   - Enable RLS: ✅

### Step 5: Setup Storage (Optional)

If using file uploads:

1. **Storage > Create bucket**
   - Name: `user-uploads`
   - Public: ❌ (private)
   - File size limit: 50MB

2. Create storage policies:
```sql
-- Users can upload their own files
CREATE POLICY "Users can upload own files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'user-uploads'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can view their own files
CREATE POLICY "Users can view own files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'user-uploads'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### Step 6: Deploy Edge Functions (if using AI chat)

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy functions
supabase functions deploy ai-chat
supabase functions deploy server
```

Set environment variables for functions:
```bash
supabase secrets set PERPLEXITY_API_KEY=your_api_key
```

### Step 7: Get API Credentials

1. **Settings > API**
2. Copy the following (save to `.env.production`):
   - **Project URL:** `https://xxxxx.supabase.co`
   - **Anon (public) key:** `eyJhbGc...`
   - **Service role key:** (NEVER expose in frontend!)

---

## Part 2: Frontend Deployment

### Step 1: Prepare Environment Variables

Create `.env.production`:
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Security Notes:**
- ✅ Anon key is safe to expose (protected by RLS)
- ❌ NEVER include service role key in frontend
- ✅ Use `.env.local` for development
- ✅ Add `.env*` to `.gitignore`

### Step 2: Build Production Bundle

```bash
# Install dependencies
npm install

# Run tests
npm run test:e2e

# Build for production
npm run build

# Preview build locally
npm run preview
```

Verify build output in `/dist`:
- Should contain optimized JS/CSS bundles
- All assets compressed
- No development code included

### Step 3: Deploy to Vercel

#### Option A: Git Integration (Recommended)

1. Push code to GitHub/GitLab/Bitbucket
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your repository
5. Configure:
   - **Framework:** Vite
   - **Root Directory:** ./
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
6. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
7. Click "Deploy"

#### Option B: CLI Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Follow prompts to configure
```

### Step 4: Deploy to Netlify

#### Git Integration

1. Go to [netlify.com](https://netlify.com)
2. Click "Add new site > Import existing project"
3. Connect to Git provider
4. Select repository
5. Configure:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
6. Environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
7. Click "Deploy"

#### CLI Deployment

```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

### Step 5: Deploy to Cloudflare Pages

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. **Workers & Pages > Create application > Pages**
3. Connect to Git
4. Configure:
   - **Build command:** `npm run build`
   - **Build output:** `dist`
5. Environment variables (same as above)
6. Deploy

### Step 6: Custom Domain Setup

#### Vercel
1. **Settings > Domains**
2. Add domain
3. Configure DNS:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```
4. Wait for SSL certificate (automatic)

#### Netlify
1. **Domain settings > Add custom domain**
2. Configure DNS:
   ```
   Type: A
   Name: @
   Value: (Netlify Load Balancer IP)

   Type: CNAME
   Name: www
   Value: your-site.netlify.app
   ```

#### SSL Certificate
- All platforms provide free automatic HTTPS via Let's Encrypt
- Verify HTTPS working: `https://your-domain.com`

---

## Part 3: Post-Deployment Configuration

### Step 1: Update Supabase Redirect URLs

1. **Authentication > URL Configuration**
2. Add production URLs:
   ```
   Site URL: https://your-domain.com
   Redirect URLs:
   - https://your-domain.com/**
   - https://your-domain.com/auth/callback
   ```

### Step 2: Update Google OAuth Redirect URIs

1. Google Cloud Console
2. **Credentials > OAuth 2.0 Client**
3. Add authorized redirect URIs:
   ```
   https://your-domain.com/auth/callback
   ```

### Step 3: Configure CORS (if needed)

Supabase automatically handles CORS, but verify:
1. **Settings > API > CORS**
2. Allowed origins should include your domain

### Step 4: Setup Error Tracking

#### Sentry Integration

```bash
npm install @sentry/react @sentry/vite-plugin
```

Configure in `main.tsx`:
```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: import.meta.env.MODE,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay(),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

Update error handlers in `App.tsx`:
```typescript
window.addEventListener('error', (event) => {
  Sentry.captureException(event.error);
  console.error('Global error:', event.error);
});
```

### Step 5: Setup Analytics

#### Plausible Analytics (Privacy-friendly)

```html
<!-- Add to index.html -->
<script defer data-domain="yourdomain.com" 
  src="https://plausible.io/js/script.js"></script>
```

#### Google Analytics (Alternative)

```typescript
// Install
npm install react-ga4

// Configure in main.tsx
import ReactGA from "react-ga4";

ReactGA.initialize("G-XXXXXXXXXX");
```

---

## Part 4: Monitoring & Maintenance

### Health Checks

Create `/public/health.json`:
```json
{
  "status": "ok",
  "version": "2.0.0",
  "timestamp": "2025-10-09T00:00:00Z"
}
```

Monitor endpoint: `https://your-domain.com/health.json`

### Supabase Monitoring

1. **Dashboard > Logs**
   - API logs
   - Database logs
   - Auth logs

2. **Dashboard > Reports**
   - API usage
   - Database usage
   - Storage usage
   - Active users

### Performance Monitoring

#### Lighthouse CI

```bash
npm install -g @lhci/cli

# Run audit
lhci autorun --collect.url=https://your-domain.com
```

#### Web Vitals

Add to `main.tsx`:
```typescript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  console.log(metric);
  // Send to your analytics service
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

### Database Backups

#### Automated (Supabase)
- Free tier: Daily backups, 7-day retention
- Pro tier: Daily backups, 30-day retention + PITR

#### Manual Backup

```bash
# Backup database
pg_dump -h db.your-project.supabase.co \
  -U postgres \
  -d postgres \
  -F c \
  -f backup-$(date +%Y%m%d).dump

# Backup storage
supabase storage download user-uploads/* ./backup/storage/
```

### Update Strategy

#### Zero-Downtime Deployments

1. **Database migrations:**
   ```bash
   # Always test migrations first
   supabase db reset
   supabase migration up
   ```

2. **Frontend updates:**
   - Git-based platforms auto-deploy on push
   - Use feature flags for gradual rollouts
   - Keep API backwards compatible

3. **Rollback plan:**
   ```bash
   # Vercel
   vercel rollback

   # Netlify
   netlify rollback

   # Database
   supabase db reset --db-url="backup-url"
   ```

---

## Part 5: Security Checklist

### Pre-Launch Security

- [ ] All tables have RLS policies enabled
- [ ] Service role key NOT in frontend code
- [ ] HTTPS enabled (SSL certificate valid)
- [ ] OAuth redirect URIs whitelisted
- [ ] CORS configured correctly
- [ ] Email confirmation required for signups
- [ ] Password strength requirements enforced
- [ ] Rate limiting enabled on auth endpoints
- [ ] Database backups automated
- [ ] Error messages don't leak sensitive info
- [ ] Dependencies updated (no known vulnerabilities)
- [ ] Environment variables secured
- [ ] API keys rotated from development

### Runtime Security

```bash
# Scan for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Check outdated packages
npm outdated
```

### Security Headers

Add to hosting platform:

**Vercel:** Create `vercel.json`
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

**Netlify:** Create `netlify.toml`
```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "origin-when-cross-origin"
```

---

## Part 6: CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches:
      - main

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - run: npx playwright install
      - run: npm run test:e2e

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run build
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

---

## Part 7: Scaling Considerations

### Database Optimization

#### Connection Pooling
```typescript
// Supabase client automatically uses connection pooling
// No additional configuration needed
```

#### Indexes
```sql
-- Monitor slow queries
SELECT * FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;

-- Add indexes as needed
CREATE INDEX idx_custom ON table_name(column_name);
```

### CDN & Caching

#### Cloudflare CDN
1. Add domain to Cloudflare
2. Enable **Speed > Optimization**
3. Configure cache rules
4. Enable Brotli compression

#### Service Worker Caching

Create `public/sw.js`:
```javascript
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('v1').then((cache) => {
      return cache.addAll([
        '/',
        '/styles/globals.css',
        // Add static assets
      ]);
    })
  );
});
```

### Rate Limiting

Supabase built-in:
- Free tier: 500 requests/second
- Pro tier: Unlimited

Custom rate limiting:
```typescript
// Use Upstash Redis or similar
import { Ratelimit } from "@upstash/ratelimit";
```

---

## Part 8: Cost Optimization

### Supabase Free Tier Limits
- 500MB database
- 1GB file storage
- 2GB bandwidth
- 50,000 monthly active users

### Monitoring Usage
1. **Dashboard > Usage**
2. Set up alerts for 80% usage

### Upgrade Triggers
- Database > 400MB
- Bandwidth > 1.5GB/month
- Need PITR backups
- Need custom SMTP
- Need more than 7-day backups

---

## Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear cache and rebuild
rm -rf node_modules
rm package-lock.json
npm install
npm run build
```

#### CORS Errors
- Verify Supabase redirect URLs include your domain
- Check browser console for specific error

#### OAuth Not Working
- Verify redirect URIs match exactly
- Check Google Cloud Console credentials
- Verify Supabase OAuth configured

#### Database Connection Issues
- Check Supabase project status
- Verify environment variables
- Test connection with SQL editor

---

## Production Checklist

### Pre-Launch
- [ ] All tests passing
- [ ] Performance: Lighthouse score > 90
- [ ] Security: No known vulnerabilities
- [ ] Database: All migrations applied
- [ ] Auth: Email and OAuth working
- [ ] Domain: Custom domain configured
- [ ] SSL: HTTPS working
- [ ] Monitoring: Error tracking enabled
- [ ] Analytics: Configured and testing
- [ ] Backups: Automated and tested
- [ ] Documentation: Up to date

### Post-Launch
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify auth flows working
- [ ] Test all critical features
- [ ] Monitor database usage
- [ ] Check bandwidth usage
- [ ] Respond to user feedback
- [ ] Plan first maintenance window

---

## Support & Resources

### Documentation
- [Supabase Docs](https://supabase.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Netlify Docs](https://docs.netlify.com)

### Community
- [Supabase Discord](https://discord.supabase.com)
- [Supabase GitHub](https://github.com/supabase/supabase)

---

**Last Updated:** October 9, 2025
**Guide Version:** 1.0
**Status:** ✅ Production Ready
