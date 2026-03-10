# 🚀 Deployment Guide — Lost & Found

This guide walks you through deploying the Lost & Found application:
- **Frontend** → Vercel (free, auto-deploys)
- **Backend** → Azure Web App for Containers (Docker-based)

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Frontend — Deploy to Vercel](#frontend--deploy-to-vercel)
3. [Backend — Deploy to Azure Web App](#backend--deploy-to-azure-web-app)
4. [GitHub Actions CI/CD Setup](#github-actions-cicd-setup)
5. [GitHub Secrets Reference](#github-secrets-reference)
6. [Local Docker Testing](#local-docker-testing)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- [Node.js 20+](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- [Azure CLI (az)](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli) installed
- A [GitHub](https://github.com) account with your repo pushed
- An [Azure](https://portal.azure.com) account
- A [Vercel](https://vercel.com) account (free tier works)

---

## Frontend — Deploy to Vercel

### Step 1: Create a Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"** → choose **"Continue with GitHub"**
3. Authorize Vercel to access your GitHub

### Step 2: Import Your Repository
1. In the Vercel dashboard, click **"Add New..."** → **"Project"**
2. Find and select your GitHub repository
3. Configure the project with these settings:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Vite |
| **Root Directory** | Click **"Edit"** → type `frontend` → click **"Continue"** |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

### Step 2.5: Add vercel.json (SPAs only)
If your app uses client-side routing (like React Router), you need a `vercel.json` in the `frontend` folder to avoid 404 errors:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```
*(I have already created this file for you in the latest version.)*

### Step 3: Set Environment Variables
Before clicking Deploy, expand **"Environment Variables"** and add:

| Name | Value |
|------|-------|
| `VITE_API_URL` | Leave blank for now — you'll update this after backend deployment |
## Frontend Deployment (Vercel)

1. Connect your GitHub repository to [Vercel](https://vercel.com).
2. Set the **Root Directory** to `frontend`.
3. Configure the following **Environment Variables**:
   - `VITE_API_URL`: `https://lf-backend-9631.azurewebsites.net/api`
4. Click **Deploy**.
5. Once deployed, note your Vercel URL (e.g., `https://lost-found-front.vercel.app`).
6. Update your Azure Web App's `FRONTEND_URL` setting with this URL to enable CORS.

---

## Backend — Deploy to Azure Web App

### Step 1: Install & Login to Azure CLI
```bash
# Install Azure CLI from: https://learn.microsoft.com/en-us/cli/azure/install-azure-cli
# Then login:
az login
```

### Step 2: Create a Resource Group
```bash
# Create a resource group in your preferred location (e.g., centralindia)
az group create --name lost-found-rg --location centralindia
```

### Step 3: Create Azure Container Registry (ACR)
```bash
# ACR names must be globally unique and alphanumeric only
ACR_NAME="lostfoundacr$RANDOM"
az acr create --resource-group lost-found-rg --name $ACR_NAME --sku Basic --admin-enabled true
```

### Step 4: Create App Service Plan & Web App
```bash
# Create an App Service Plan (B1 is the cheapest tier that supports custom linux containers reliably)
az appservice plan create --name lost-found-plan --resource-group lost-found-rg --sku B1 --is-linux

# Create the Web App for Containers (name must be globally unique)
WEBAPP_NAME="lf-backend-$RANDOM"
az webapp create --resource-group lost-found-rg --plan lost-found-plan --name $WEBAPP_NAME --deployment-container-image-name nginx
```

### Step 5: Build & Push Docker Image
```bash
# Log in to ACR
az acr login --name $ACR_NAME

# Build the backend image (run from repo root)
docker build \
  -f backend/Dockerfile \
  -t ${ACR_NAME}.azurecr.io/lf-backend:latest \
  ./backend

# Push to ACR
docker push ${ACR_NAME}.azurecr.io/lf-backend:latest
```

### Step 6: Configure Web App to Use Your Image
```bash
az webapp config container set --name $WEBAPP_NAME --resource-group lost-found-rg \
  --docker-custom-image-name ${ACR_NAME}.azurecr.io/lf-backend:latest \
  --docker-registry-server-url https://${ACR_NAME}.azurecr.io
```

After deployment, your API will be live at:
```
Service URL: https://<WEBAPP_NAME>.azurewebsites.net
```

**Save this URL** — go back to Vercel and set `VITE_API_URL` to this value.

---

## GitHub Actions CI/CD Setup

This enables automatic deployment on every push to `main`.

### Step 1: Get Web App Publish Profile
This is a small file that contains the credentials needed for GitHub to deploy to your Web App.

1. Go to the [Azure Portal](https://portal.azure.com).
2. Open your Web App (e.g., `lf-backend-9631`).
3. On the **Overview** page, click **Download publish profile**.
4. Open the downloaded file and copy the entire XML content.

### Step 2: Get ACR Admin Credentials
Since Service Principals are restricted on some accounts, we use the ACR "Admin User" for the build step.

1. In the Azure Portal, open your Container Registry (e.g., `lostfoundacr9631`).
2. Go to **Settings** → **Access keys**.
3. Enable "Admin user" if it isn't already.
4. Note the **Username** and **password**.

### Step 3: Add GitHub Secrets
Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**.

Add each secret from the table in the next section.

---

## GitHub Secrets Reference

| Secret Name | How to Get the Value |
|-------------|---------------------|
| `AZURE_WEBAPP_PUBLISH_PROFILE` | The entire XML content from the downloaded Publish Profile (Step 1) |
| `AZURE_WEBAPP_NAME` | The name of your Azure Web App (e.g., `lf-backend-9631`) |
| `AZURE_ACR_NAME` | The name of your Azure Container Registry (e.g., `lostfoundacr9631`) |
| `AZURE_ACR_USERNAME` | The admin username from your ACR Access Keys (Step 2) |
| `AZURE_ACR_PASSWORD` | The admin password from your ACR Access Keys (Step 2) |
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `REDIS_URL` | Your Redis cloud connection string |
| `JWT_ACCESS_SECRET` | Generate with: `openssl rand -hex 32` |
| `JWT_REFRESH_SECRET` | Generate with: `openssl rand -hex 32` |
| `SENDGRID_API_KEY` | From [SendGrid dashboard](https://app.sendgrid.com/settings/api_keys) |
| `SENDGRID_FROM_EMAIL` | Your verified sender email in SendGrid |
| `FAST2SMS_API_KEY` | From [Fast2SMS dashboard](https://www.fast2sms.com/) |
| `CLOUDINARY_CLOUD_NAME` | From [Cloudinary dashboard](https://cloudinary.com/console) |
| `CLOUDINARY_API_KEY` | From Cloudinary dashboard → Settings → Access Keys |
| `CLOUDINARY_API_SECRET` | From Cloudinary dashboard → Settings → Access Keys |
| `FRONTEND_URL` | Your Vercel URL (e.g., `https://your-project.vercel.app`) |

---

## Local Docker Testing

Test your Docker builds locally before pushing:

### Backend
```bash
# Build
docker build -f backend/Dockerfile -t lf-backend ./backend

# Run (create a .env file with your dev values first)
docker run -p 3000:3000 --env-file backend/.env lf-backend

# Test it
curl http://localhost:3000/
```

### Frontend
```bash
# Build
docker build -f frontend/Dockerfile -t lf-frontend ./frontend

# Run
docker run -p 8080:8080 lf-frontend

# Open in browser
# http://localhost:8080
```

---

## Troubleshooting

### Windows Path with Special Characters (e.g., `&`)
If your project is in a folder like `l&f`, `npm install` will fail because Windows CMD treats `&` as a command separator.
**Fix**: Rename your project folder to use only alphanumeric characters, dashes, or underscores (e.g., `lost-found`).

### Docker build fails with "npm ci" error
Make sure `package-lock.json` is committed to your repo. Docker needs it for `npm ci`.

### Cloud Run deploy fails with permission error
Check that all IAM roles are correctly assigned to the service account:
### Azure Web App deploy fails with timeout
Make sure your Dockerfile exposes port 3000. Azure Web App automatically forwards incoming HTTP traffic to the port specified in `WEBSITES_PORT`.

### Frontend can't reach backend (CORS error)
Make sure `FRONTEND_URL` in Azure Web App settings matches your Vercel URL exactly (including `https://`).

### Azure Web App returns Application Error
Check the Docker container logs in the Azure Portal:
Web App → **Deployment Center** → Logs, or
Web App → **Log Stream**
