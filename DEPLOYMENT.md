# Legal Shield - Deployment Guide

This document provides comprehensive deployment instructions for the Legal Shield application.

## 🚀 Quick Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Netlify
```bash
# Build the app
npm run build

# Deploy to Netlify (drag & drop dist folder)
# Or use Netlify CLI:
npm i -g netlify-cli
netlify deploy --prod --dir=dist
```

## 🔧 Environment Configuration

### Required Environment Variables

#### Production Environment
```env
# API Keys (Required for full functionality)
VITE_OPENAI_API_KEY=sk-...
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...

# App Configuration
VITE_APP_NAME=Legal Shield
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=production

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_GEOLOCATION=true
VITE_ENABLE_VIDEO_RECORDING=true
```

#### Development Environment
```env
# API Keys (Optional for development)
VITE_OPENAI_API_KEY=sk-...
VITE_SUPABASE_URL=https://your-dev-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# App Configuration
VITE_APP_NAME=Legal Shield (Dev)
VITE_APP_VERSION=1.0.0-dev
VITE_ENVIRONMENT=development

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_GEOLOCATION=true
VITE_ENABLE_VIDEO_RECORDING=true
```

## 🗄️ Database Setup (Supabase)

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and anon key

### 2. Database Schema
```sql
-- Users table
CREATE TABLE users (
  user_id UUID PRIMARY KEY,
  email TEXT,
  subscription_status TEXT DEFAULT 'free',
  preferred_language TEXT DEFAULT 'en',
  state TEXT DEFAULT 'CA',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Interaction records table
CREATE TABLE interaction_records (
  record_id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(user_id),
  timestamp TIMESTAMP WITH TIME ZONE,
  duration INTEGER,
  audio_file_path TEXT,
  video_file_path TEXT,
  location JSONB,
  notes TEXT,
  shared_status BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Generated scripts table
CREATE TABLE generated_scripts (
  script_id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(user_id),
  scenario TEXT,
  language TEXT,
  script_content TEXT,
  timestamp TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rights cards table
CREATE TABLE rights_cards (
  card_id UUID PRIMARY KEY,
  state TEXT,
  title TEXT,
  content TEXT,
  language TEXT DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Usage tracking table
CREATE TABLE usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(user_id),
  month TEXT,
  scripts_generated INTEGER DEFAULT 0,
  recording_time INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, month)
);
```

### 3. Row Level Security (RLS)
```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE interaction_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own data" ON users
  FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own recordings" ON interaction_records
  FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own scripts" ON generated_scripts
  FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own usage" ON usage_tracking
  FOR ALL USING (auth.uid()::text = user_id::text);

-- Rights cards are public
CREATE POLICY "Rights cards are public" ON rights_cards
  FOR SELECT USING (true);
```

### 4. Storage Buckets
```sql
-- Create storage bucket for recordings
INSERT INTO storage.buckets (id, name, public) VALUES ('recordings', 'recordings', false);

-- Storage policies
CREATE POLICY "Users can upload own recordings" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'recordings' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own recordings" ON storage.objects
  FOR SELECT USING (bucket_id = 'recordings' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## 💳 Payment Setup (Stripe)

### 1. Create Stripe Account
1. Go to [stripe.com](https://stripe.com)
2. Create account and verify
3. Get your publishable and secret keys

### 2. Create Products and Prices
```javascript
// Using Stripe CLI or Dashboard
stripe products create --name="Legal Shield Premium" --description="Premium subscription with unlimited features"

stripe prices create --product=prod_xxx --unit-amount=499 --currency=usd --recurring-interval=month
```

### 3. Webhook Configuration
Set up webhooks for subscription events:
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

## 🤖 OpenAI Setup

### 1. Get API Key
1. Go to [platform.openai.com](https://platform.openai.com)
2. Create account and get API key
3. Set usage limits and billing

### 2. Rate Limiting
Implement rate limiting in production:
```javascript
// Example rate limiting configuration
const rateLimits = {
  free: {
    requestsPerMinute: 3,
    requestsPerDay: 10
  },
  premium: {
    requestsPerMinute: 10,
    requestsPerDay: 100
  }
}
```

## 🌐 CDN and Performance

### Cloudflare Setup
1. Add your domain to Cloudflare
2. Enable caching for static assets
3. Configure security settings
4. Enable compression

### Performance Optimizations
```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['lucide-react'],
          services: ['openai', '@supabase/supabase-js']
        }
      }
    }
  }
}
```

## 📱 PWA Configuration

### Service Worker
```javascript
// public/sw.js
const CACHE_NAME = 'legal-shield-v1'
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
]

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  )
})
```

### Web App Manifest
```json
{
  "name": "Legal Shield",
  "short_name": "LegalShield",
  "description": "Know your rights, get instant legal guidance",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

## 🔒 Security Configuration

### Content Security Policy
```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://js.stripe.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://api.openai.com https://*.supabase.co https://api.stripe.com;
  media-src 'self' blob:;
">
```

### HTTPS Configuration
Ensure all deployments use HTTPS:
- Vercel: Automatic HTTPS
- Netlify: Automatic HTTPS
- Custom domain: Use Let's Encrypt or Cloudflare

## 📊 Monitoring and Analytics

### Error Tracking
```javascript
// Add Sentry or similar
import * as Sentry from "@sentry/react"

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: import.meta.env.VITE_ENVIRONMENT
})
```

### Performance Monitoring
```javascript
// Web Vitals tracking
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

getCLS(console.log)
getFID(console.log)
getFCP(console.log)
getLCP(console.log)
getTTFB(console.log)
```

## 🧪 Testing in Production

### Smoke Tests
```bash
# Test core functionality
curl -f https://your-domain.com/
curl -f https://your-domain.com/rights
curl -f https://your-domain.com/record
```

### Load Testing
```javascript
// Using Artillery or similar
config:
  target: 'https://your-domain.com'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "Browse app"
    flow:
      - get:
          url: "/"
      - get:
          url: "/rights"
      - get:
          url: "/ai"
```

## 🔄 CI/CD Pipeline

### GitHub Actions
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 📋 Pre-Launch Checklist

### Technical
- [ ] All environment variables configured
- [ ] Database schema deployed
- [ ] Stripe products and prices created
- [ ] OpenAI API key configured with limits
- [ ] HTTPS enabled
- [ ] PWA manifest configured
- [ ] Error tracking setup
- [ ] Performance monitoring enabled

### Legal & Compliance
- [ ] Privacy policy updated
- [ ] Terms of service reviewed
- [ ] Legal disclaimers in place
- [ ] GDPR compliance (if applicable)
- [ ] Accessibility standards met

### Testing
- [ ] Cross-browser testing completed
- [ ] Mobile device testing
- [ ] Recording functionality tested
- [ ] Payment flow tested
- [ ] Offline functionality verified
- [ ] Load testing completed

## 🚨 Troubleshooting

### Common Issues

#### Recording Not Working
- Check HTTPS requirement
- Verify microphone permissions
- Test MediaRecorder API support

#### API Errors
- Verify API keys are correct
- Check rate limits
- Confirm CORS settings

#### Payment Issues
- Test with Stripe test cards
- Verify webhook endpoints
- Check Stripe dashboard for errors

### Debug Mode
```javascript
// Enable debug logging
localStorage.setItem('debug', 'legal-shield:*')
```

## 📞 Support

For deployment issues:
- Check the troubleshooting section
- Review browser console for errors
- Contact support with deployment logs

---

**Legal Shield** - Production-ready deployment guide for empowering citizens with legal rights knowledge.
