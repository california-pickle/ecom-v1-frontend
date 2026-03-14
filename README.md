# The California Pickle — Frontend

Storefront and admin panel for [thecaliforniapickle.com](https://thecaliforniapickle.com), a direct-to-consumer e-commerce brand selling a performance electrolyte sports drink built for athletes.

## Tech Stack

- **Framework**: Next.js 15 (App Router, Server Components, ISR)
- **Styling**: TailwindCSS (brutalist design — black borders, lime green accents)
- **State**: TanStack Query (admin), React Context (cart)
- **HTTP**: Axios with auto token refresh interceptor
- **Payments**: Stripe Checkout (redirect flow)
- **Notifications**: Sonner (toasts)
- **Charts**: Recharts (admin dashboard)
- **Icons**: Lucide React

## Features

### Storefront
- Landing page with Hero, Benefits, Ingredients, Size Selection, Comparison sections
- Product page with ISR (60s revalidation)
- Cart with persistent state
- Checkout with live Shippo shipping rates, coupon codes, Stripe redirect
- Order confirmation page
- Stale deployment banner — prompts users to reload after a new deploy

### Admin Panel (`/admin`)
- Dashboard with sales charts and recent activity
- Orders management with status updates and shipping tracking
- Products CRUD with image upload, variants, archive/restore
- Customer management with email sending
- Bulk order management
- Email templates (Order Confirmation, Shipping Update, Custom)
- Coupon generation and management
- Activity log and settings

## Project Structure

```
src/
├── app/
│   ├── (storefront)/   # public pages
│   ├── admin/          # protected admin pages
│   └── api/            # Next.js API routes (proxy to backend)
├── components/         # shared UI components
├── lib/                # axios instance, admin auth, utilities
└── providers/          # QueryProvider, CartContext
```

## Environment Variables

Create a `.env` file (dev) or `.env.production` (VPS) with:

```
NEXT_PUBLIC_API_URL=
BACKEND_URL=
ZEPTOMAIL_API_KEY=
```

## Development

```bash
npm install
npm run dev
```

## Production Build

```bash
npm ci
npm run build
npm start
```

Deployed via GitHub Actions on push to `main` — SSHes into VPS, pulls latest, builds, and reloads PM2.
