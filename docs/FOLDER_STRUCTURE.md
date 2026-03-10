# Folder Structure

```
ai-proposal-generator/
├── .env.example
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── src/
│       ├── server.ts
│       ├── app.ts
│       ├── config/ (index.ts, database.ts, redis.ts, logger.ts)
│       ├── middleware/ (auth.ts, security.ts, errorHandler.ts, passport.ts)
│       ├── controllers/ (auth, client, proposal, template, analytics, billing)
│       ├── routes/ (auth, client, proposal, template, analytics, billing, public)
│       ├── services/ (ai, pdf, email, storage, stripe)
│       ├── workers/ (pdf.worker.ts)
│       └── utils/ (AppError.ts, jwt.ts)
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/app/ (landing, auth, dashboard, proposal editor, public view)
├── docker/nginx.conf
└── docs/
```
