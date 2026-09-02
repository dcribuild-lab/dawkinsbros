Deployment & staging guide

Goal: host dawkinsbros.com on Vercel (recommended) or Netlify, with optional Node upload server for media during transition.

Steps (Vercel recommended):
1. Create a GitHub repository and push this publish folder as the repo root.
2. Sign in to Vercel and import the repo. Set framework to 'Other' or 'Static Site' if serving static files only.
3. For the optional Node upload server, create a separate server project (server.js) or use serverless functions.
4. Add environment variables (for production S3, DB, NEXTAUTH secrets) in Vercel settings.
5. Configure domain in Vercel to point dawkinsbros.com, add DNS records per Vercel instructions, enable HTTPS.

Notes:
- For full portals and auth, migrate to a Next.js app with Prisma/NextAuth; use Vercel for frontend + serverless functions or use a small Node host for server APIs.
- Keep backups of uploads and DB; use S3 + RDS for production storage.
