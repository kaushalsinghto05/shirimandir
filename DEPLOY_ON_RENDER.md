# 🚀 Complete Deployment Guide: Deploy Shiri Mandir on Render

This guide provides step-by-step instructions for deploying the **entire Shiri Mandir platform (Frontend React SPA + Backend Node.js REST API + Database)** to [Render](https://render.com).

---

## 🌟 Choose Your Deployment Method

| Method | Recommended For | Description |
|---|---|---|
| **Method 1: Render Blueprint (`render.yaml`)** ⭐ | **Fastest & Automated** | 1-Click setup that deploys the Web Service and auto-provisions a managed PostgreSQL database. |
| **Method 2: Single Full-Stack Web Service** | **Free Tier & Zero-Config** | Deploys both React Frontend and Express API onto a single Render Web Service on one URL (zero CORS issues). |
| **Method 3: Split Services (Web Service + Static Site)** | **Microservice Architecture** | Deploys backend API as a Web Service and frontend as a Render Static Site. |

---

## ⚡ Method 1: Deploying via Render Blueprint (`render.yaml`)

We have pre-configured a native [`render.yaml`](./render.yaml) file at the root of the repository.

### Step 1: Push Repository to GitHub or GitLab
Ensure your latest code is committed and pushed to your GitHub or GitLab repository:
```bash
git add .
git commit -m "feat: complete temple booking platform with render deployment config"
git push origin main
```

### Step 2: Deploy Blueprint on Render
1. Log in to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** in the top right, then select **Blueprint**.
3. Connect your repository (`shirimandir`).
4. Render will read `render.yaml` and display the resources to create:
   - **`shirimandir-web`** (Node.js Web Service)
   - **`shirimandir-db`** (Managed PostgreSQL Database)
5. Click **Apply**.
6. Render will:
   - Provision your PostgreSQL database.
   - Automatically inject `DATABASE_URL`, `JWT_SECRET`, and `PAYMENT_WEBHOOK_SECRET`.
   - Run `npm run build:render` to build the Vite bundle and install dependencies.
   - Start `node backend/server.js`, auto-migrate the schema, and seed the initial temples.

---

## 🛠️ Method 2: Manual Setup as a Single Full-Stack Web Service (Free Tier)

This method deploys both Frontend and Backend on **one single Render service** with zero domain or CORS configuration needed.

### Step 1: Create a Web Service
1. In Render Dashboard, click **New +** > **Web Service**.
2. Select your GitHub repository.
3. Configure the service settings:
   - **Name:** `shirimandir`
   - **Region:** `Singapore` (or closest to your users)
   - **Branch:** `main`
   - **Root Directory:** Leave empty (uses repository root)
   - **Runtime:** `Node`
   - **Build Command:**
     ```bash
     npm run build:render
     ```
   - **Start Command:**
     ```bash
     npm start
     ```
   - **Instance Type:** `Free`

### Step 2: Add Environment Variables
In the **Environment Variables** tab, add:
| Variable | Value | Notes |
|---|---|---|
| `NODE_ENV` | `production` | Enables production caching and security |
| `PORT` | `10000` | Render standard port |
| `JWT_SECRET` | *(Generate a 32+ character random string)* | Used to sign devotee auth tokens |
| `PAYMENT_WEBHOOK_SECRET` | *(Random 32+ character string)* | Used for HMAC SHA-256 webhook verification |
| `CORS_ORIGIN` | `*` | Or your custom domain |
| `STORAGE_PROVIDER` | `local` | Uploads stored in `./backend/uploads` |

*(Optional)* If you create a Render PostgreSQL database, add:
| `DATABASE_URL` | `postgresql://user:pass@host/shirimandir` | If omitted, uses embedded SQLite with zero setup! |

### Step 3: Deploy
Click **Create Web Service**. 
Render will build the React SPA, launch the Express server, and your full platform will be live at:
`https://shirimandir.onrender.com`

---

## 🗄️ Optional: Connecting a Render PostgreSQL Database

If you want persistent PostgreSQL rather than local SQLite:
1. On Render Dashboard, click **New +** > **PostgreSQL**.
2. Name: `shirimandir-db`
3. Database: `shirimandir`
4. User: `shirimandir_admin`
5. Plan: `Free`
6. Click **Create Database**.
7. Copy the **Internal Database URL**.
8. Go to your Web Service > **Environment Variables** > set `DATABASE_URL` to this copied URL.
9. On the next deployment, the server will detect `DATABASE_URL`, execute `schema.sql`, and apply the compliant PostgreSQL schema automatically!

---

## 🔍 Verifying Your Render Deployment

Once your service is live, check these endpoints in your browser:

1. **Frontend Sanctum UI**:
   - `https://your-service.onrender.com/`
2. **Backend Health Check**:
   - `https://your-service.onrender.com/api/health`
   - Should return: `{"status":"healthy","platform":"Shiri Mandir Backend API","version":"1.0.0"}`
3. **API Documentation**:
   - `https://your-service.onrender.com/api/docs`
4. **Temple Directory API**:
   - `https://your-service.onrender.com/api/temples`
5. **Prasad Store API**:
   - `https://your-service.onrender.com/api/prasad`
6. **Cancellation & Refund Policy API**:
   - `https://your-service.onrender.com/api/refunds/policy`

---

## 💳 Testing Payment Webhook Verification on Render

To test HMAC SHA-256 signature validation on your deployed Render backend:
1. Log in to the application.
2. Select any puja and initiate booking.
3. Click **Proceed to Payment**.
4. In the payment dialog, click **Authorize with HMAC Webhook**.
5. The backend validates the cryptographic signature using `crypto.timingSafeEqual`, records `payments.verified_server_side = true`, and completes the transaction with immutable proof audit.
