# vton-retailer-portal

Web portal for retailer/tenant staff to manage their Virtual Try-On store.

## Features
- **Dashboard**: Summary stats (total try-ons, cost, ratings)
- **Products**: Upload and manage garment catalog (drag-and-drop)
- **Sessions**: Create sessions (get PIN), top-up trials, revoke sessions, view galleries
- **Analytics**: Usage breakdown by product, engine, time
- **Settings**: Configure trial limits, session timeout, engine preferences (owner only)

## Stack
- React 19 + TypeScript + Vite
- Tailwind CSS 4
- TanStack React Query
- Recharts (analytics charts)
- react-dropzone (product image upload)
- react-hot-toast (notifications)

## Local dev
```bash
cp .env.example .env.local
# set VITE_API_BASE_URL

npm install
npm run dev        # http://localhost:5174
```

## Roles
| Role | Permissions |
|------|-------------|
| `owner` | Full access including settings and user management |
| `staff` | Create/manage sessions, view products |
| `viewer` | Read-only access to sessions and analytics |

## Docker
```bash
docker build -t vton-retailer-portal .
docker run -p 80:80 vton-retailer-portal
```
