Next app migration notes

This folder contains starter files for migrating to Next.js. It is a scaffold only; no code runs until dependencies are installed.

Files of interest:
- next-package.json  — package manifest (rename to package.json to use)
- next-schema.prisma — Prisma schema for projects, users, media, invoices
- next-api-upload.js  — example Next.js API route for uploads (use pages/api/upload.js)
- next-nextauth-example.js — NextAuth configuration (pages/api/auth/...)
- image-pipeline.js — Node script using sharp to produce responsive images

Recommended workflow:
1. Copy these files into a fresh Next.js project (or rename next-package.json to package.json in this folder)
2. Run npm install
3. Configure DATABASE_URL and NEXTAUTH_SECRET in .env
4. Run prisma generate and prisma migrate
5. Implement pages, components, and API routes as shown in the examples

When ready, create a GitHub repo and connect to Vercel for staging. I can automate that for you when you grant GitHub access.
