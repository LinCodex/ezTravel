# Production in 3 steps (Vercel)

SQLite cannot run on Vercel. This app uses **Postgres**. You do **not** need Neon’s website, migrations by hand, or seeding by hand — the build does that.

## 1. Create a free database (in Vercel)

1. Open your project on [vercel.com](https://vercel.com)
2. Go to **Storage**
3. **Create Database** → choose **Neon** → **Continue** (Hobby / free)
4. Confirm it’s connected to this project (it should add `DATABASE_URL` automatically)

## 2. Add the other env vars (once)

Still in Vercel → **Settings → Environment Variables**, set:

| Name | Example |
|---|---|
| `ADMIN_USERNAME` | `admin` |
| `ADMIN_PASSWORD` | your password |
| `ADMIN_SESSION_SECRET` | any random string 24+ chars |
| `PARTNER_SESSION_SECRET` | another random string 24+ chars |
| `ESIMACCESS_USE_MOCK` | `1` |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` |

(`DATABASE_URL` should already exist from step 1.)

## 3. Redeploy

**Deployments → … → Redeploy**

The build will:
- create tables (`prisma db push`)
- import plans if empty
- create partner `demo@partner.test` / `partner123`

Then log in on the live site.

---

## Local after this change

Local also needs the Postgres URL (same Neon DB is fine):

1. Vercel → Storage → your Neon DB → copy `DATABASE_URL`
2. Put it in `.env` as `DATABASE_URL=postgresql://...`
3. `npm run dev`

You can keep using the same demo logins locally and in production.
