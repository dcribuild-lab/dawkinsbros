Local upload server (optional demo)

This repository contains a simple local upload server used only for demos. It is NOT production-ready.

To run locally:
1. Install Node.js (>=16)
2. In the publish folder: npm install
3. Start the server: npm run start
4. The site will be served at http://localhost:3000 by the server; static files remain accessible.

Notes:
- Uploaded files are stored in ./uploads and served under /uploads.
- For production, integrate S3 or a managed storage provider and secure uploads behind authentication.
