# 🚀 Quick Deployment Guide

## Option 1: Vercel (Recommended - Easiest)

### Frontend Deployment
1. Go to [vercel.com](https://vercel.com) → Sign in with GitHub
2. Click **"Add New Project"** → Import your repo
3. Settings:
   - **Root Directory**: `client`
   - **Framework**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variable: `VITE_API_URL` = `https://your-backend-url.vercel.app`
5. Deploy!

### Backend Deployment
1. Create **another Vercel project** from the same repo
2. Settings:
   - **Root Directory**: `server`
   - **Framework**: Other
3. Add Environment Variable: `OPENAI_API_KEY` = `your-key-here`
4. Deploy!
5. Copy the backend URL and update frontend's `VITE_API_URL`

### Update CORS
Edit `server/server.js` line 11, add your frontend URL:
```javascript
origin: [
  'https://your-frontend-url.vercel.app',
  'https://cmpe-280-ai-voice-agent.vercel.app',
  'http://localhost:5173'
],
```

---

## Option 2: Render (Full-Stack)

### Backend
1. [render.com](https://render.com) → **New Web Service**
2. Connect GitHub repo
3. Settings:
   - **Root Directory**: `server`
   - **Build**: `npm install`
   - **Start**: `node server.js`
   - **Plan**: Free
4. Add `OPENAI_API_KEY` environment variable
5. Deploy!

### Frontend
1. **New Static Site** → Connect repo
2. Settings:
   - **Root Directory**: `client`
   - **Build**: `npm install && npm run build`
   - **Publish**: `dist`
3. Add `VITE_API_URL` = `https://your-backend.onrender.com`
4. Deploy!

---

## ✅ Checklist

- [ ] Backend deployed and accessible at `/health`
- [ ] `OPENAI_API_KEY` set in backend
- [ ] Frontend deployed
- [ ] `VITE_API_URL` set in frontend (points to backend)
- [ ] CORS updated in `server/server.js`
- [ ] Test the app!

---

**Full guide**: See `DEPLOYMENT.md` for detailed instructions.

