# RMG Portal — Azure Deployment Guide

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [MongoDB Atlas Setup](#2-mongodb-atlas-setup)
3. [Prepare Backend for Production](#3-prepare-backend-for-production)
4. [Prepare Frontend for Production](#4-prepare-frontend-for-production)
5. [Create Azure Resources](#5-create-azure-resources)
6. [Deploy Backend to Azure Web App](#6-deploy-backend-to-azure-web-app)
7. [Deploy Frontend to Azure Static Web App](#7-deploy-frontend-to-azure-static-web-app)
8. [Configure CORS & Environment Variables](#8-configure-cors--environment-variables)
9. [Whitelist Azure IPs in MongoDB Atlas](#9-whitelist-azure-ips-in-mongodb-atlas)
10. [Verify Deployment](#10-verify-deployment)
11. [Troubleshooting](#11-troubleshooting)
12. [CI/CD with GitHub Actions (Optional)](#12-cicd-with-github-actions-optional)

---

## 1. Prerequisites

### 1.1 Install Required Tools

| Tool | Purpose | Install Command |
|------|---------|----------------|
| **Azure CLI** | Manage Azure resources from terminal | `winget install Microsoft.AzureCLI` |
| **Node.js 18+** | Build and run the application | `winget install OpenJS.NodeJS.LTS` |
| **Git** | Version control & deployment | `winget install Git.Git` |

### 1.2 Login to Azure

Open PowerShell and run:

```powershell
az login
```

A browser window will open. Sign in with your Azure account.

### 1.3 Verify Login

```powershell
az account show --query "{Name:name, SubscriptionId:id}" -o table
```

You should see your subscription name and ID.

---

## 2. MongoDB Atlas Setup

Since you already have MongoDB Atlas, follow these steps:

### 2.1 Get the Connection String

1. Open [https://cloud.mongodb.com](https://cloud.mongodb.com)
2. Navigate to your cluster
3. Click **Connect** → **Drivers**
4. Select **Node.js** driver, version **5.5 or later**
5. Copy the connection string. It will look like:
   ```
   mongodb+srv://<username>:<password>@<cluster-name>.xxxxx.mongodb.net/?retryWrites=true&w=majority&appName=<appName>
   ```
6. Replace `<username>` and `<password>` with your actual database credentials
7. Add the database name after `.net/`:
   ```
   mongodb+srv://myuser:mypassword@cluster0.abc123.mongodb.net/rmg-portal?retryWrites=true&w=majority
   ```

### 2.2 Save This Connection String

You will need it in Step 6. Keep it safe — do NOT commit it to Git.

---

## 3. Prepare Backend for Production

### 3.1 Create Production Environment File

Create a file `server/.env.production`:

```env
NODE_ENV=production
PORT=8080
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/rmg-portal?retryWrites=true&w=majority
JWT_SECRET=<generate-a-random-64-char-string>
JWT_REFRESH_SECRET=<generate-another-random-64-char-string>
CORS_ORIGIN=https://<your-frontend-app>.azurestaticapps.net
```

> **Tip:** Generate secure secrets with:
> ```powershell
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

### 3.2 Update CORS for Production

Open `server/src/server.ts`. The CORS config currently only allows localhost:

```typescript
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
  credentials: true
}));
```

Update it to also accept the production frontend URL:

```typescript
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [process.env.CORS_ORIGIN || '']
  : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
```

### 3.3 Build the Backend

```powershell
cd C:\Users\sainikhil.bomma.ACUVATE\RMG-Portal\server

# Install dependencies
npm install

# Compile TypeScript to JavaScript
npm run build
```

This creates a `server/dist/` folder with compiled JS files.

### 3.4 Verify the Build

```powershell
# Check that dist folder exists and has server.js
Test-Path server\dist\server.js
# Should output: True
```

### 3.5 Add .gitignore for Server (if not present)

Make sure `server/.gitignore` includes:

```
node_modules/
dist/
.env
.env.production
logs/
```

---

## 4. Prepare Frontend for Production

### 4.1 Create Production Environment File

Create a file `.env.production` in the project root:

```env
VITE_API_URL=https://<your-backend-app>.azurewebsites.net/api
```

> **Note:** Replace `<your-backend-app>` with the name you choose in Step 5 (e.g., `rmg-portal-api`).

### 4.2 Build the Frontend

```powershell
cd C:\Users\sainikhil.bomma.ACUVATE\RMG-Portal

# Install dependencies
npm install

# Build for production
npm run build
```

This creates a `dist/` folder with static files (HTML, JS, CSS).

### 4.3 Verify the Build

```powershell
# Check that dist folder exists with index.html
Test-Path dist\index.html
# Should output: True
```

### 4.4 Add SPA Routing Config

Create `public/staticwebapp.config.json`:

```json
{
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": ["/assets/*", "*.{css,js,svg,png,jpg,ico}"]
  }
}
```

This ensures client-side routing (React Router) works — all paths fall back to `index.html`.

> **Re-build frontend** after adding this file:
> ```powershell
> npm run build
> ```

---

## 5. Create Azure Resources

### 5.1 Set Variables

Open PowerShell and define your resource names:

```powershell
# Choose your names (must be globally unique for Azure)
$RESOURCE_GROUP = "rmg-portal-rg"
$LOCATION = "eastus"                    # Or: westus, centralindia, uksouth, etc.
$APP_PLAN = "rmg-portal-plan"
$BACKEND_APP = "rmg-portal-api"         # Will create: rmg-portal-api.azurewebsites.net
$FRONTEND_APP = "rmg-portal-web"        # Will create: rmg-portal-web.azurestaticapps.net
```

### 5.2 Create Resource Group

```powershell
az group create --name $RESOURCE_GROUP --location $LOCATION
```

**Expected output:**
```json
{
  "id": "/subscriptions/.../resourceGroups/rmg-portal-rg",
  "location": "eastus",
  "name": "rmg-portal-rg",
  "properties": { "provisioningState": "Succeeded" }
}
```

### 5.3 Create App Service Plan (for Backend)

```powershell
az appservice plan create `
  --name $APP_PLAN `
  --resource-group $RESOURCE_GROUP `
  --sku B1 `
  --is-linux
```

> **Pricing tiers:**
> - `F1` — Free tier (limited, good for testing)
> - `B1` — Basic (~$13/month, recommended for dev/staging)
> - `S1` — Standard (~$70/month, recommended for production)

### 5.4 Create Backend Web App

```powershell
az webapp create `
  --name $BACKEND_APP `
  --resource-group $RESOURCE_GROUP `
  --plan $APP_PLAN `
  --runtime "NODE:18-lts"
```

**Expected output:** You'll see JSON with the app details. Note the `defaultHostName`:
```
"defaultHostName": "rmg-portal-api.azurewebsites.net"
```

### 5.5 Create Frontend Static Web App

```powershell
az staticwebapp create `
  --name $FRONTEND_APP `
  --resource-group $RESOURCE_GROUP `
  --location $LOCATION `
  --sku Free
```

---

## 6. Deploy Backend to Azure Web App

### 6.1 Configure Environment Variables

```powershell
az webapp config appsettings set `
  --name $BACKEND_APP `
  --resource-group $RESOURCE_GROUP `
  --settings `
    NODE_ENV="production" `
    PORT="8080" `
    MONGODB_URI="mongodb+srv://<user>:<password>@<cluster>.mongodb.net/rmg-portal?retryWrites=true&w=majority" `
    JWT_SECRET="<your-jwt-secret-from-step-3.1>" `
    JWT_REFRESH_SECRET="<your-jwt-refresh-secret-from-step-3.1>" `
    CORS_ORIGIN="https://rmg-portal-web.azurestaticapps.net"
```

> **Important:** Replace all `< >` placeholders with your actual values.

### 6.2 Configure Startup Command

```powershell
az webapp config set `
  --name $BACKEND_APP `
  --resource-group $RESOURCE_GROUP `
  --startup-file "node dist/server.js"
```

### 6.3 Deploy via ZIP

```powershell
cd C:\Users\sainikhil.bomma.ACUVATE\RMG-Portal\server

# Create deployment ZIP (include dist, package.json, and package-lock.json)
Compress-Archive -Path dist, package.json, package-lock.json -DestinationPath ..\backend-deploy.zip -Force

# Deploy to Azure
az webapp deploy `
  --name $BACKEND_APP `
  --resource-group $RESOURCE_GROUP `
  --src-path ..\backend-deploy.zip `
  --type zip
```

> **Note:** We do NOT include `node_modules` in the ZIP. Azure will run `npm install --production` automatically during deployment (Oryx build).

### 6.4 Enable Build Automation

If Azure doesn't install `node_modules` automatically, enable Oryx build:

```powershell
az webapp config appsettings set `
  --name $BACKEND_APP `
  --resource-group $RESOURCE_GROUP `
  --settings SCM_DO_BUILD_DURING_DEPLOYMENT="true"
```

Then re-deploy:

```powershell
az webapp deploy `
  --name $BACKEND_APP `
  --resource-group $RESOURCE_GROUP `
  --src-path ..\backend-deploy.zip `
  --type zip
```

### 6.5 Verify Backend is Running

```powershell
# Wait 2-3 minutes for deployment, then test health endpoint
Invoke-WebRequest -Uri "https://rmg-portal-api.azurewebsites.net/api/health" -UseBasicParsing | Select-Object -ExpandProperty Content
```

**Expected output:**
```json
{"status":"ok","message":"Server is running"}
```

---

## 7. Deploy Frontend to Azure Static Web App

### 7.1 Install SWA CLI

```powershell
npm install -g @azure/static-web-apps-cli
```

### 7.2 Get Deployment Token

```powershell
$TOKEN = az staticwebapp secrets list `
  --name $FRONTEND_APP `
  --resource-group $RESOURCE_GROUP `
  --query "properties.apiKey" -o tsv

# Display the token (save it)
Write-Output $TOKEN
```

### 7.3 Build Frontend with Production API URL

```powershell
cd C:\Users\sainikhil.bomma.ACUVATE\RMG-Portal

# Set the API URL for the build
$env:VITE_API_URL = "https://rmg-portal-api.azurewebsites.net/api"

# Build
npm run build
```

### 7.4 Deploy

```powershell
swa deploy ./dist `
  --deployment-token $TOKEN `
  --env production
```

### 7.5 Verify Frontend

Open your browser and go to:

```
https://rmg-portal-web.azurestaticapps.net
```

You should see the RMG Portal login page.

---

## 8. Configure CORS & Environment Variables

### 8.1 Update Backend CORS (if frontend URL differs)

If your Static Web App URL is different from what you set earlier:

```powershell
az webapp config appsettings set `
  --name $BACKEND_APP `
  --resource-group $RESOURCE_GROUP `
  --settings CORS_ORIGIN="https://<actual-frontend-url>.azurestaticapps.net"
```

### 8.2 Restart Backend

```powershell
az webapp restart --name $BACKEND_APP --resource-group $RESOURCE_GROUP
```

---

## 9. Whitelist Azure IPs in MongoDB Atlas

### 9.1 Get Azure Outbound IPs

```powershell
az webapp show `
  --name $BACKEND_APP `
  --resource-group $RESOURCE_GROUP `
  --query "outboundIpAddresses" -o tsv
```

This returns comma-separated IPs like:
```
20.42.1.100,20.42.1.101,20.42.1.102,...
```

### 9.2 Add IPs to MongoDB Atlas

1. Open [MongoDB Atlas](https://cloud.mongodb.com)
2. Go to **Network Access** (left sidebar under Security)
3. Click **+ Add IP Address**
4. Add each IP from Step 9.1
5. Click **Confirm**

> **Shortcut for testing:** Click **Allow Access from Anywhere** (`0.0.0.0/0`).
> **Warning:** This is NOT secure for production. Always use specific IPs in production.

### 9.3 Verify Database Connection

```powershell
# Check backend logs for MongoDB connection
az webapp log tail --name $BACKEND_APP --resource-group $RESOURCE_GROUP
```

Look for: `✅ MongoDB Connected: <cluster>.mongodb.net`

---

## 10. Verify Deployment

### 10.1 Checklist

Run each command and verify the expected result:

| # | Test | Command | Expected |
|---|------|---------|----------|
| 1 | Backend health | `curl https://rmg-portal-api.azurewebsites.net/api/health` | `{"status":"ok"}` |
| 2 | Frontend loads | Open browser to `https://rmg-portal-web.azurestaticapps.net` | Login page appears |
| 3 | Login works | Enter credentials on the login page | Redirects to dashboard |
| 4 | API connected | Open browser DevTools → Network tab, login | API calls go to `azurewebsites.net` |
| 5 | DB connected | Check backend logs | `MongoDB Connected` message |

### 10.2 View Backend Logs

```powershell
# Stream live logs
az webapp log tail --name $BACKEND_APP --resource-group $RESOURCE_GROUP

# Or enable application logging first
az webapp log config `
  --name $BACKEND_APP `
  --resource-group $RESOURCE_GROUP `
  --application-logging filesystem `
  --level information
```

### 10.3 Check App Settings

```powershell
az webapp config appsettings list `
  --name $BACKEND_APP `
  --resource-group $RESOURCE_GROUP -o table
```

---

## 11. Troubleshooting

### Problem: "Application Error" on backend URL

**Cause:** App failed to start.

**Fix:**
```powershell
# Check logs
az webapp log tail --name $BACKEND_APP --resource-group $RESOURCE_GROUP

# Verify startup command
az webapp config show --name $BACKEND_APP --resource-group $RESOURCE_GROUP --query "linuxFxVersion" -o tsv
```

Common causes:
- Missing `dist/server.js` — re-run `npm run build` in server folder
- Missing environment variables — re-check Step 6.1
- Wrong startup file — re-check Step 6.2

---

### Problem: CORS errors in browser console

**Cause:** Backend not accepting frontend origin.

**Fix:**
```powershell
# Verify CORS_ORIGIN is set correctly
az webapp config appsettings list --name $BACKEND_APP --resource-group $RESOURCE_GROUP -o table | Select-String "CORS"

# Update if needed
az webapp config appsettings set `
  --name $BACKEND_APP `
  --resource-group $RESOURCE_GROUP `
  --settings CORS_ORIGIN="https://rmg-portal-web.azurestaticapps.net"

# Restart
az webapp restart --name $BACKEND_APP --resource-group $RESOURCE_GROUP
```

---

### Problem: MongoDB connection timeout

**Cause:** Azure IPs not whitelisted in Atlas.

**Fix:**
1. Get current outbound IPs: `az webapp show --name $BACKEND_APP --resource-group $RESOURCE_GROUP --query "outboundIpAddresses" -o tsv`
2. Add ALL IPs to MongoDB Atlas → Network Access
3. Also add `possibleOutboundIpAddresses`: `az webapp show --name $BACKEND_APP --resource-group $RESOURCE_GROUP --query "possibleOutboundIpAddresses" -o tsv`

---

### Problem: 404 on page refresh (frontend)

**Cause:** Missing SPA fallback config.

**Fix:** Make sure `public/staticwebapp.config.json` exists with the navigation fallback (see Step 4.4), then rebuild and redeploy frontend.

---

### Problem: API returning 404 for all routes

**Cause:** `dist/` folder structure incorrect.

**Fix:**
```powershell
# SSH into the app and check file structure
az webapp ssh --name $BACKEND_APP --resource-group $RESOURCE_GROUP

# Inside SSH, check:
ls /home/site/wwwroot/
ls /home/site/wwwroot/dist/
```

You should see `dist/server.js`. If not, re-deploy.

---

## 12. CI/CD with GitHub Actions (Optional)

### 12.1 Get Deployment Credentials

**Backend publish profile:**
```powershell
az webapp deployment list-publishing-profiles `
  --name $BACKEND_APP `
  --resource-group $RESOURCE_GROUP `
  --xml > backend-publish-profile.xml
```

**Frontend deployment token:**
```powershell
az staticwebapp secrets list `
  --name $FRONTEND_APP `
  --resource-group $RESOURCE_GROUP `
  --query "properties.apiKey" -o tsv
```

### 12.2 Add GitHub Secrets

Go to GitHub repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**:

| Secret Name | Value |
|-------------|-------|
| `AZURE_BACKEND_PUBLISH_PROFILE` | Contents of `backend-publish-profile.xml` |
| `AZURE_STATIC_WEB_APPS_TOKEN` | API key from previous command |
| `MONGODB_URI` | Your Atlas connection string |
| `JWT_SECRET` | Your JWT secret |
| `JWT_REFRESH_SECRET` | Your JWT refresh secret |

### 12.3 Create Workflow File

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy RMG Portal to Azure

on:
  push:
    branches: [main]
  workflow_dispatch:      # Allow manual trigger

jobs:
  deploy-backend:
    name: Deploy Backend
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: server/package-lock.json

      - name: Install dependencies
        run: cd server && npm ci

      - name: Build TypeScript
        run: cd server && npm run build

      - name: Deploy to Azure Web App
        uses: azure/webapps-deploy@v3
        with:
          app-name: rmg-portal-api
          publish-profile: ${{ secrets.AZURE_BACKEND_PUBLISH_PROFILE }}
          package: server/

  deploy-frontend:
    name: Deploy Frontend
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          VITE_API_URL: https://rmg-portal-api.azurewebsites.net/api

      - name: Deploy to Azure Static Web App
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_TOKEN }}
          action: upload
          app_location: /
          output_location: dist
          skip_api_build: true
```

### 12.4 Push and Deploy

```powershell
git add .
git commit -m "Add Azure deployment workflow"
git push origin main
```

GitHub Actions will automatically build and deploy both frontend and backend.

---

## Quick Reference

### Azure URLs

| Component | URL |
|-----------|-----|
| Backend API | `https://rmg-portal-api.azurewebsites.net/api` |
| Frontend | `https://rmg-portal-web.azurestaticapps.net` |
| Health Check | `https://rmg-portal-api.azurewebsites.net/api/health` |
| Azure Portal | `https://portal.azure.com` → Resource Group: `rmg-portal-rg` |

### Useful Commands

```powershell
# View backend logs
az webapp log tail --name rmg-portal-api --resource-group rmg-portal-rg

# Restart backend
az webapp restart --name rmg-portal-api --resource-group rmg-portal-rg

# Check app settings
az webapp config appsettings list --name rmg-portal-api --resource-group rmg-portal-rg -o table

# SSH into backend
az webapp ssh --name rmg-portal-api --resource-group rmg-portal-rg

# Redeploy frontend
swa deploy ./dist --deployment-token <token> --env production
```

### Monthly Cost Estimate

| Resource | Tier | Approx. Cost |
|----------|------|-------------|
| App Service (Backend) | B1 Basic | ~$13/month |
| Static Web App (Frontend) | Free | $0 |
| MongoDB Atlas | M0 Free / M10 Dedicated | $0 – $57/month |
| **Total** | | **$13 – $70/month** |
