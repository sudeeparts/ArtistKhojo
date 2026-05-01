# ArtistKhojo — Product Requirements

## Tagline
"Every Skilled People Ka Single Platform."

## Original Problem Statement
Full-stack marketplace (Fiverr + UrbanClap inspired) for ALL skilled artists in India — not celebrities, includes beginners. Mobile OTP login, Artist + Customer + Admin interfaces, verification, blue-tick, wallet, booking system.

## User Personas
1. **Artist** — showcases craft via 4-item portfolio, earns booking requests, submits Aadhaar + intro video for blue-tick.
2. **Customer** — browses/filters artists, posts requirements, funds wallet, books & reviews.
3. **Admin** — verifies artists (blue-tick), views users/bookings/stats.

## User Choices (locked in)
- OTP: MOCKED, fixed code `123456` (Twilio swap planned when credentials provided).
- Payment: MOCKED Razorpay — wallet add credits instantly, booking.pay deducts wallet.
- File storage: Base64 inline in MongoDB.
- Instagram followers: manual entry, admin-verified.
- Admin: `admin@artistkhojo.in` / `Admin@123` (password login).

## Architecture
- Backend: FastAPI + Motor (MongoDB) + JWT (bearer token), routes under `/api`.
- Frontend: React + React Router + Tailwind + Shadcn UI + Sonner, axios + AuthContext.
- Design: Light cream theme (#FDFBF7), peacock gradient accents (purple→blue→orange→magenta), Clash Display + Satoshi typography.

## Core Requirements (static)
- 15 artist categories, public profile (4-slot portfolio), blue-tick verification.
- Private fields (WhatsApp/email/phone/Aadhaar/intro-video) never leak on public endpoints.
- Rating & review, wallet top-up + deduction, pan-India city filter.

## Implemented (2026-05-01)
- Full auth flow (OTP + admin password)
- Artist CRUD + filters + featured
- Customer requirements feed
- Booking create → pay (wallet) → status transitions → review
- Wallet top-up + txn history
- Admin: verification approval, users table, bookings table, stats
- Shareable public artist profile
- Mobile-first premium UI (cream theme + peacock gradient accents)
- 40/40 backend tests, 100% pass; UI flows verified

## Backlog (P0/P1/P2)
- **P0**: Real Twilio SMS integration (swap mock OTP) — awaiting credentials.
- **P0**: Real Razorpay Orders API + signature verification — awaiting Key ID/Secret.
- **P1**: Unique review per booking constraint; booking status state-machine.
- **P1**: Direct in-platform messaging (currently CTA only).
- **P1**: Search highlights, pagination + infinite scroll.
- **P2**: Social share Open Graph meta per artist, SEO metadata.
- **P2**: Emergent Object Storage migration from Base64.
- **P2**: Instagram OAuth follower auto-sync.
- **P2**: Email notifications (Resend / SendGrid) for bookings.

## Next Tasks
1. User provides Twilio + Razorpay keys → swap the mocked blocks in `server.py`.
2. Add unique-review + state-machine guards (quick).
3. Enable shareable profile meta tags for social sharing.
