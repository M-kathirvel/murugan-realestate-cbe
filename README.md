# Murugan Realestate

A Coimbatore land and plots marketplace with a customer enquiry flow and a private admin portal. Built with Next.js App Router, TypeScript, Tailwind CSS, Lucide React, and SQLite.

## Run locally

Requirements: Node.js 20.9 or newer and npm.

```powershell
cd .\murugan-realestaten
Copy-Item .env.example .env.local
```

Set `ADMIN_SESSION_SECRET` in `.env.local` to a long, random secret before signing in. Then start the app:

```powershell
npm install
npm run dev
```

Open `http://localhost:3000`. The public catalogue is at `/`; the admin portal is at `/admin`.

The fixed admin credentials are username `Nishanth` and password `Nishanth@2006`. Three failed attempts from the same client address lock sign-in for three hours. The locked portal returns the exact message: “Too many failed attempts. Please come and login after 3 hours.”

## Included workflows

- Search, category/budget filter, and price-sort the admin-published property listings.
- Enquire about a listing with a name and 10-digit mobile number. Submitting opens a prefilled WhatsApp message to +91 87789 03754; the visitor must send the message in WhatsApp.
- Sign in to `/admin` to publish, edit, feature, and remove listings or upload a JPG, PNG, or WebP image up to 5 MB.
- Sample Coimbatore listings seed the database on first run.

## Configuration and persistence

Copy `.env.example` to `.env.local` and configure:

- `ADMIN_SESSION_SECRET`: required in production; use a cryptographically random secret of at least 32 bytes. Keep it private and stable across restarts.
- `DATABASE_PATH`: optional path to the SQLite file. The default is `data/murugan.sqlite` relative to the app directory.

The SQLite database and uploaded files are runtime data and are intentionally excluded from git. Back up `data/` and `public/uploads/`. For production, run the app on a persistent Node.js host with a writable persistent volume, HTTPS, and a reverse proxy that supplies a trusted client IP. A serverless or multi-instance deployment needs shared database and object-storage adapters; local SQLite and filesystem uploads are not shared between instances. Restrict access to the admin portal at the network edge if public access is not needed.

Property photos in the seeded catalogue and hero are remote Unsplash images; replace them with approved client photography before launch. Admin-uploaded photos are stored locally under `public/uploads/`.

## Checks

```powershell
npm run lint
npm run typecheck
npm run build
```

## Contact channels

- WhatsApp: +91 87789 03754
- Email: muruganrealestate21@gmail.com
- Instagram: @murugan_real.estate_cbe
