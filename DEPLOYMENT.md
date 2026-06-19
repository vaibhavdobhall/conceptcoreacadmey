# ConceptCore Academy - Deployment Guide

Quick deployment instructions for production environments.

## 🚀 Production Deployment

### Option 1: Deploy to Vercel (Frontend) + Railway (Backend)

This is the recommended deployment setup.

#### Deploy Backend to Railway

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy on Railway**
   - Go to [Railway.app](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - **Important:** Set the **Root Directory** to `backend`
   - Railway will auto-detect Node.js and deploy

3. **Add Environment Variables**
   In Railway dashboard, go to your project → Variables tab:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   NODE_ENV=production
   PORT=3001
   ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app
   ```

4. **Get Your Backend URL**
   - After deployment, Railway provides a URL like: `https://conceptcore-backend.up.railway.app`
   - Copy this URL for the frontend configuration

#### Deploy Frontend to Vercel

1. **Deploy on Vercel**
   - Go to [Vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - **Important:** Set the **Root Directory** to `frontend`
   - Vercel will auto-detect Next.js

2. **Add Environment Variables**
   In Vercel dashboard, go to Settings → Environment Variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_API_URL=https://conceptcore-backend.up.railway.app
   ```

3. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your frontend
   - You'll get a URL like: `https://conceptcore-academy.vercel.app`

4. **Update Backend CORS**
   - Go back to Railway
   - Update `ALLOWED_ORIGINS` to include your Vercel domain
   - Redeploy the backend

### Option 2: Deploy to Render (Alternative)

#### Backend on Render

1. Go to [Render.com](https://render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name:** conceptcore-backend
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Add environment variables (same as Railway)
6. Click "Create Web Service"

#### Frontend on Vercel

Same as Option 1.

### Option 3: Deploy Both to Vercel

You can deploy the backend as a Vercel Serverless Function:

1. Create `api/index.js` in the frontend folder
2. Move backend code to `frontend/api/`
3. Deploy as a single Next.js application

**Note:** This requires restructuring the project. Option 1 is recommended for separation of concerns.

## 🔧 Post-Deployment Checklist

### 1. Verify Backend

```bash
# Test health endpoint
curl https://your-backend-url.up.railway.app/health

# Should return:
# {"status":"OK","timestamp":"2024-01-15T10:30:00.000Z"}
```

### 2. Verify Frontend

- Visit your Vercel URL
- Check that the page loads
- Open browser DevTools → Console
- Look for any errors

### 3. Test Booking Flow

1. Select a time slot
2. Fill in the booking form
3. Submit the booking
4. Verify confirmation screen appears
5. Check that the booking appears in the educator dashboard

### 4. Configure Custom Domain (Optional)

#### For Vercel (Frontend)
1. Go to your project → Settings → Domains
2. Add your custom domain (e.g., `conceptcoreacademy.com`)
3. Update DNS records as instructed
4. SSL certificate will be auto-generated

#### For Railway (Backend)
1. Go to your project → Settings → Domains
2. Add custom domain (e.g., `api.conceptcoreacademy.com`)
3. Update DNS records
4. SSL certificate will be auto-generated

### 5. Set Up Monitoring

#### Backend Monitoring (Railway)
- Railway provides built-in logs and metrics
- Set up alerts for downtime
- Monitor response times

#### Frontend Monitoring (Vercel)
- Vercel provides Analytics
- Enable Web Vitals monitoring
- Set up error tracking

### 6. Configure Email Notifications (Optional)

1. **Set up SMTP** (Gmail example):
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   FROM_EMAIL=noreply@conceptcoreacademy.com
   ```

2. **Update backend code** to send emails on booking confirmation
   - See `backend/src/routes/bookings.js`
   - Add Nodemailer logic after successful booking

### 7. Set Up Database Backups

Supabase provides automatic backups:
- **Free tier:** Daily backups, 7-day retention
- **Pro tier:** Point-in-time recovery

To enable:
1. Go to Supabase Dashboard → Settings → Backups
2. Choose your backup plan
3. Configure backup schedule

## 🔒 Security Checklist

- [ ] Environment variables are set in production (not in code)
- [ ] CORS is configured to only allow your domain
- [ ] Rate limiting is enabled
- [ ] HTTPS is enabled (automatic with Vercel/Railway)
- [ ] Supabase RLS policies are active
- [ ] Service role key is not exposed to frontend
- [ ] Input validation is working (Joi schemas)

## 📊 Performance Optimization

### Frontend
- ✅ Next.js automatically optimizes images
- ✅ Static pages are pre-rendered
- ✅ Code splitting is automatic
- Consider enabling:
  - Image optimization in `next.config.ts`
  - Compression (enabled by default in Vercel)

### Backend
- ✅ Supabase connection pooling
- ✅ Database indexes on frequently queried columns
- Consider:
  - Adding Redis for caching
  - Implementing CDN for static assets

## 🐛 Troubleshooting

### Issue: "Cannot connect to API"

**Solution:**
- Verify `NEXT_PUBLIC_API_URL` in Vercel environment variables
- Check that backend is running (visit backend URL directly)
- Verify CORS settings in backend

### Issue: "Database connection failed"

**Solution:**
- Check Supabase project is not paused
- Verify Supabase credentials in environment variables
- Check Supabase dashboard for any errors

### Issue: "Build fails on Vercel"

**Solution:**
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify TypeScript has no errors: `npm run build` locally

### Issue: "Slots not loading"

**Solution:**
- Verify backend health endpoint works
- Check browser console for CORS errors
- Verify Supabase schema was executed
- Check backend logs for database errors

## 📈 Scaling Considerations

### When to Scale

- **Frontend:** Vercel handles scaling automatically
- **Backend:** Railway/Render auto-scales based on traffic
- **Database:** Supabase scales up to 10M rows on free tier

### Scaling Options

1. **Database:**
   - Upgrade Supabase plan for more connections
   - Add read replicas for heavy read loads
   - Implement caching layer (Redis)

2. **Backend:**
   - Upgrade Railway/Render plan
   - Add load balancer
   - Implement horizontal scaling

3. **Frontend:**
   - Use Vercel Pro for better performance
   - Implement ISR (Incremental Static Regeneration)
   - Add CDN for global distribution

## 💰 Cost Estimates

### Free Tier (Development/Testing)
- **Vercel:** Free (Hobby plan)
- **Railway:** Free trial credits ($5)
- **Supabase:** Free (500MB database, 2GB bandwidth)
- **Total:** $0/month

### Production Tier (Small Business)
- **Vercel Pro:** $20/month
- **Railway Pro:** $5-20/month (depending on usage)
- **Supabase Pro:** $25/month
- **Total:** $50-65/month

### Enterprise Tier (High Traffic)
- **Vercel Enterprise:** Custom pricing
- **Railway/Render:** $50-200/month
- **Supabase Enterprise:** Custom pricing
- **Total:** $100-500/month

## 🎯 Maintenance

### Regular Tasks

1. **Weekly:**
   - Check booking confirmations are working
   - Review error logs
   - Monitor database size

2. **Monthly:**
   - Update dependencies: `npm audit fix`
   - Review and optimize slow queries
   - Check security advisories

3. **Quarterly:**
   - Review and update documentation
   - Backup database (if not automatic)
   - Performance audit

### Updates

```bash
# Update dependencies
cd backend && npm update
cd frontend && npm update

# Check for vulnerabilities
npm audit

# Commit and push
git add .
git commit -m "Update dependencies"
git push
```

## 📞 Support

If you encounter deployment issues:

1. Check platform-specific documentation:
   - [Vercel Docs](https://vercel.com/docs)
   - [Railway Docs](https://docs.railway.app)
   - [Supabase Docs](https://supabase.com/docs)

2. Review logs in platform dashboards

3. Common issues are covered in SETUP.md

---

**Deployment complete! 🎉**

Your tutoring platform is now live and ready to serve students!