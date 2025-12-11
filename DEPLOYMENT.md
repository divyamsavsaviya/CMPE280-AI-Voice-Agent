# Deployment Guide - Free Hosting Options

This guide will help you deploy your AI Voice Agent application for free using various platforms.

## 🎯 Recommended: Vercel (Easiest - Frontend + Backend)

Vercel offers the easiest deployment with excellent free tier limits.

### Prerequisites
- GitHub account
- Vercel account (free at [vercel.com](https://vercel.com))

### Step 1: Prepare Your Repository

1. Make sure your code is pushed to GitHub
2. Ensure `.env` files are in `.gitignore` (already done)

### Step 2: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Click **"Deploy"**

### Step 3: Deploy Backend to Vercel (Serverless Functions)

1. Create a **new Vercel project** for the backend
2. Import the same GitHub repository
3. Configure:
   - **Root Directory**: `server`
   - **Framework Preset**: Other
   - **Build Command**: Leave empty (or `npm install`)
   - **Output Directory**: Leave empty
4. Add Environment Variables:
   - Go to **Settings → Environment Variables**
   - Add: `OPENAI_API_KEY` = `your-openai-api-key`
   - Add: `NODE_ENV` = `production`
5. Click **"Deploy"**

### Step 4: Update Frontend Environment Variables

1. Go back to your **frontend Vercel project**
2. Go to **Settings → Environment Variables**
3. Add: `VITE_API_URL` = `https://your-backend-url.vercel.app`
   - Replace `your-backend-url` with your actual backend Vercel URL
4. **Redeploy** the frontend (go to Deployments → ... → Redeploy)

### Step 5: Update CORS in Backend

Update `server/server.js` to include your frontend URL:

```javascript
app.use(cors({
  origin: [
    'https://your-frontend-url.vercel.app',
    'http://localhost:5173'
  ],
  credentials: true
}));
```

---

## 🔄 Alternative Option 1: Render (Full-Stack)

Render offers free tier hosting for both frontend and backend.

### Backend on Render

1. Go to [render.com](https://render.com) and sign up
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `cmpe280-voice-agent-backend`
   - **Environment**: Node
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: Free
5. Add Environment Variables:
   - `OPENAI_API_KEY` = `your-openai-api-key`
   - `NODE_ENV` = `production`
   - `PORT` = `10000` (Render sets this automatically, but good to have)
6. Click **"Create Web Service"**

### Frontend on Render

1. Click **"New +"** → **"Static Site"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `cmpe280-voice-agent-frontend`
   - **Root Directory**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Add Environment Variable:
   - `VITE_API_URL` = `https://your-backend-url.onrender.com`
5. Click **"Create Static Site"**

### Update CORS

Update `server/server.js`:

```javascript
app.use(cors({
  origin: [
    'https://your-frontend-url.onrender.com',
    'http://localhost:5173'
  ],
  credentials: true
}));
```

---

## 🚂 Alternative Option 2: Railway (Backend Only)

Railway is great for backend deployment.

1. Go to [railway.app](https://railway.app) and sign up
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your repository
4. Railway will auto-detect it's a Node.js project
5. Set Root Directory to `server`
6. Add Environment Variables:
   - `OPENAI_API_KEY` = `your-openai-api-key`
7. Click **"Deploy"**

**Note**: Railway gives you a URL like `https://your-app.up.railway.app`

---

## 📝 Quick Setup Checklist

- [ ] Push code to GitHub
- [ ] Deploy backend (Vercel/Render/Railway)
- [ ] Add `OPENAI_API_KEY` environment variable
- [ ] Deploy frontend (Vercel/Render)
- [ ] Add `VITE_API_URL` environment variable pointing to backend
- [ ] Update CORS in `server/server.js` with frontend URL
- [ ] Test the deployed application

---

## 🔍 Testing Your Deployment

1. **Backend Health Check**: Visit `https://your-backend-url/health`
   - Should return: `{"status":"ok","timestamp":"..."}`

2. **Frontend**: Visit your frontend URL
   - Should load the application
   - Try starting an interview session

3. **Check Browser Console**: 
   - Open DevTools (F12)
   - Look for any CORS or API errors

---

## 🆓 Free Tier Limits

### Vercel
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Serverless functions: 100GB-hours/month
- ✅ Perfect for this project

### Render
- ✅ 750 hours/month (enough for 24/7)
- ✅ 100GB bandwidth/month
- ⚠️ Spins down after 15 min inactivity (takes ~30s to wake)

### Railway
- ✅ $5 free credit/month
- ⚠️ Charges per usage (usually stays free for small projects)

---

## 🐛 Troubleshooting

### CORS Errors
- Make sure frontend URL is in backend CORS origins
- Check that `VITE_API_URL` is set correctly

### API Key Not Working
- Verify `OPENAI_API_KEY` is set in backend environment variables
- Check backend logs for API errors

### Frontend Can't Connect to Backend
- Verify `VITE_API_URL` environment variable is set
- Make sure backend is deployed and accessible
- Check backend `/health` endpoint

### Build Failures
- Check build logs in deployment platform
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)
- [Railway Documentation](https://docs.railway.app)

---

**Need Help?** Check the deployment platform's logs for detailed error messages.

