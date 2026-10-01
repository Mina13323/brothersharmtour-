# Hostinger Deployment Guide for Brother Sharm Tour

This guide outlines the steps to deploy the Next.js production build on Hostinger (either **Hostinger Cloud/Web Hosting Node.js Application** or **Hostinger VPS**).

---

## 1. Environment Variables Configuration (`.env`)

On your Hostinger server, copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Ensure the following values match your live setup:

```ini
# Canonical live domain (no trailing slash)
NEXT_PUBLIC_SITE_URL=https://brothersharmtour.com

# Contact Info
NEXT_PUBLIC_WHATSAPP_NUMBER=201042441923
NEXT_PUBLIC_PHONE=+20 10 4244 1923
NEXT_PUBLIC_EMAIL=hello@brothersharmtour.com

# Admin CMS Access (/admin/login)
ADMIN_EMAIL=admin@brothersharmtour.com
ADMIN_PASSWORD=Brotour-Admin-2026
AUTH_SECRET=9f8c321d4a6e8b7c5f2a1e0d3c4b5a697812e4f0a9b8c7d6e5f4a3b2c1d0e9f8

# Hostinger SMTP Email (Create this email account in your Hostinger cPanel / hPanel)
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=bookings@brothersharmtour.com
SMTP_PASS=YourHostingerEmailPasswordHere
SMTP_SECURE=true
SMTP_FROM_NAME="Brother Sharm Tour"
EMAIL_FROM=bookings@brothersharmtour.com
```

---

## 2. Option A: Deployment on Hostinger VPS (Recommended)

### Step 1: Connect via SSH & Clone Repo
```bash
ssh root@your-vps-ip
git clone -b arena/01a0f4d8-brothersharmtour https://github.com/Mina13323/brothersharmtour-.git
cd brothersharmtour-
```

### Step 2: Install Node.js (v20+) & Dependencies
```bash
# Verify Node version (v18.18+ or v20+ recommended)
node -v

# Install dependencies
npm install

# Build the Next.js production bundle
npm run build
```

### Step 3: Run with PM2 Process Manager
```bash
npm install -g pm2
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

### Step 4: Configure Nginx Reverse Proxy
In `/etc/nginx/sites-available/brothersharmtour.com`:
```nginx
server {
    server_name brothersharmtour.com www.brothersharmtour.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
Run `certbot --nginx -d brothersharmtour.com -d www.brothersharmtour.com` to enable free SSL.

---

## 3. Option B: Deployment via Hostinger hPanel (Node.js Application)

1. In Hostinger hPanel, go to **Advanced** → **Node.js**.
2. Create New Application:
   - **Node.js version**: 20.x (or 18.x)
   - **Application mode**: Production
   - **Application root**: `public_html` (or your subfolder)
   - **Application startup file**: `node_modules/next/dist/bin/next` with argument `start`
3. Upload project files (or git clone).
4. Run `npm install` and `npm run build` in the hPanel Terminal.
5. Add the environment variables from `.env` in the hPanel Environment Variables tab.
6. Click **Restart Application**.

---

## 4. CMS Database (`content/db.json`)
The pre-seeded database containing:
- 10 enabled languages (English, Polish, Italian, Russian, Deutsch, Ukrainian, French, Arabic, Romanian, Nederlands)
- All tours, destination guides, and settings
is committed directly in `content/db.json` and loads automatically upon launch.
