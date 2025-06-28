# Firebase Hosting Deployment Guide

## Prerequisites

1. Firebase account
2. Firebase CLI installed
3. GitHub repository
4. Google Cloud Platform project

## Initial Setup

### 1. Install Firebase CLI

```bash
# Install globally
npm install -g firebase-tools

# Or use pnpm
pnpm add -g firebase-tools

# Login to Firebase
firebase login
```

### 2. Initialize Firebase Project

```bash
# If you haven't created a Firebase project yet
firebase projects:create sensilog-app

# Initialize hosting in the project
firebase init hosting

# Select:
# - Use an existing project → sensilog-app
# - Public directory → apps/web/out
# - Configure as single-page app → Yes
# - Set up automatic builds → No (we use GitHub Actions)
```

### 3. Configure Environment Variables

Create `.env.production` in `apps/web/`:

```env
NEXT_PUBLIC_API_URL=https://api.sensilog.com
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-xxxxxxxxx
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### 4. GitHub Actions Setup

Add the following secrets to your GitHub repository:

1. **FIREBASE_SERVICE_ACCOUNT**:
   - Go to Firebase Console → Project Settings → Service Accounts
   - Generate new private key
   - Copy the entire JSON content
   - Add as GitHub secret

2. **Environment Variables**:
   - `NEXT_PUBLIC_API_URL`
   - `NEXT_PUBLIC_ADSENSE_CLIENT_ID`
   - `NEXT_PUBLIC_GA_ID`

## Build Configuration

### Next.js Static Export

The app is configured for static export in `next.config.ts`:

```typescript
const nextConfig: NextConfig = {
  output: 'export',
  // ... other config
}
```

### Firebase Configuration

`firebase.json`:
- Static files served from `apps/web/out`
- SPA rewrites configured
- Security headers set
- Cache control for assets

## Deployment Workflow

### Automatic Deployment

**Production (main branch)**:
```bash
git push origin main
```

**Preview (Pull Request)**:
- Create a pull request
- Preview URL will be commented automatically

### Manual Deployment

```bash
# Build the app
cd apps/web
pnpm build

# Deploy to production
firebase deploy --only hosting

# Deploy preview channel
firebase hosting:channel:deploy preview
```

### Using pnpm Scripts

From the monorepo root:

```bash
# Deploy to production
pnpm deploy

# Deploy preview
pnpm deploy:preview
```

## Preview Channels

Firebase Hosting preview channels provide temporary preview URLs:

1. **Automatic**: Created for each pull request
2. **Manual**: `firebase hosting:channel:deploy [channel-name]`
3. **Expiration**: 30 days by default

## Performance Optimization

1. **Static Export**: Pre-renders all pages at build time
2. **Asset Optimization**: 
   - Images: 1 year cache
   - JS/CSS: 1 day cache
3. **CDN**: Firebase Hosting uses global CDN
4. **Compression**: Automatic gzip/brotli

## Custom Domain

1. Go to Firebase Console → Hosting
2. Click "Add custom domain"
3. Add your domain (e.g., sensilog.com)
4. Verify ownership
5. Update DNS records

## Monitoring

### Firebase Console
- View deployment history
- Check bandwidth usage
- Monitor performance

### Google Analytics
- Integrated with GA4
- Real-time user tracking
- Performance metrics

## Troubleshooting

### Build Failures
1. Check Node.js version (20.x required)
2. Clear cache: `rm -rf .next out`
3. Verify environment variables

### 404 Errors
1. Ensure SPA rewrites in `firebase.json`
2. Check `output: 'export'` in Next.js config
3. Verify all pages are static

### Large Bundle Size
1. Analyze bundle: `pnpm build && npx @next/bundle-analyzer`
2. Enable tree shaking
3. Lazy load components

## Costs

Firebase Hosting (as of 2024):
- **Free Tier**:
  - 10 GB storage
  - 360 MB/day bandwidth
  - Custom domain + SSL
- **Blaze Plan** (pay as you go):
  - $0.026/GB storage
  - $0.15/GB bandwidth

For typical usage, the free tier is sufficient.

## Security

1. **Headers**: Security headers configured in `firebase.json`
2. **HTTPS**: Automatic SSL certificates
3. **DDoS Protection**: Built-in protection
4. **Access Control**: Firebase Security Rules (if using other Firebase services)

## Rollback

To rollback to a previous version:

1. Via Console:
   - Go to Hosting → Release History
   - Click "Rollback" on desired version

2. Via CLI:
   ```bash
   firebase hosting:releases:list
   firebase hosting:rollback
   ```