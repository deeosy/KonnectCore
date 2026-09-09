# KonnectCore — Landing / Signal Page UI Prompt

> Hand this prompt to your AI UI agent. It fully describes the reference site we took inspiration from, the current stack and theme already in this repo, and exactly what to build. The target is a scrollable, single-page ("signal") landing page that looks premium — not a boring dashboard-style page.

---

## 1. Project context

We are building the **public landing page for KonnectCore**, an agricultural cooperative management platform for Ghanaian farmer organisations. It is the first page a client sees, so it must feel modern, trustworthy, energetic and professional.

The landing page lives inside an existing **React 19 + Vite 8** app (in `/client`), already wired with **Tailwind CSS v4**, **framer-motion**, **lucide-react**, **react-router-dom** and **recharts**. The internal app routes (dashboard, members, collections, payments, loans, reports…) already exist and are protected. The landing page is the public entrance page — it should be served at the root route `/` and its CTAs should link to `/login`.

**Do not** redesign or touch the internal app pages. Build the landing page only, following the design language and theme tokens below.

---

## 2. Reference site analysis (gb-hub-africa.vercel.app)

We are borrowing the **animation style, structural layout and typographic scale** from the GB Hub Africa site — **not** its colors. Keep KonnectCore's own teal/blue theme (section 4).

### 2.1 Fonts used on the reference site (visual mood to target)
- **Gellix Bold / Regular** — big display headlines, section labels, large paragraph text. Dominant, confident type.
- **Addington CF (serif)** — occasional editorial serif accent for a "premium publication" feel.
- **Nersans One** — huge, punchy numbers for impact stats (up to `text-9xl`).
- **Montserrat** — body copy.

We already have **Plus Jakarta Sans** (800 down to 400), **Inter**, and **IBM Plex Mono** loaded in `client/index.html`. Use those — they deliver the same feel. Use **Plus Jakarta Sans ExtraBold/Bold** for display headlines, **Plus Jakarta Sans** for body, and **IBM Plex Mono** sparingly for small "live signal / data" labels.

### 2.2 Animation patterns (the important part — replicate these)
1. **Smooth scrolling** — the site uses ReactLenis (`lerp: 0.1`, `duration: 2.5`, `smooth: true`). Recreate a silky, eased scroll. If you install a library, prefer `lenis` (this app has no smooth-scroll setup yet); otherwise a framer-motion-driven flow is acceptable.
2. **Scroll-triggered reveals** — nearly every block animates from `opacity: 0; translateY(-26px)` to `opacity: 1; translateY(0)` on scroll into view (contents often reveal in a staggered sequence). Implement this consistently with framer-motion `whileInView`.
3. **Word-by-word hero headline** — the hero title is split into words, each word an `inline-block` that staggers in with `translateY(-20px)` + fade. This is the signature hero moment. Do it with framer-motion `staggerChildren`.
4. **Full-screen hero with slow parallax media** — `h-[100vh]` hero, background image/video that gently drifts (`translateY(50px)` over time), dark overlay (`rgba(0,0,0,0.62)`), content layered on top.
5. **Zoomed imagery composition** — images sit inside containers with `overflow-hidden` and huge border radius (see 2.3); when revealed, the inner image is over-scaled (`scale 1.3–1.5`) and slowly settles, giving a cinematic zoom.
6. **Growing divider lines** — `<hr>`-style section dividers animate `scaleX(0)` → `scaleX(1)` on scroll.
7. **Pill "learn more" buttons** — a rounded-full button with a circular arrow icon that animates (arrow slides out / circle expands on hover). On the reference it's the `.anime.learn-more` component.
8. **Staggered big-stat counters** — impact numbers reveal from `translateY(50px)` and count up (use a framer-motion `useInView` + `animate` counter, or `react-countup` if allowed — prefer a hand-rolled counter with `requestAnimationFrame` to avoid new deps).
9. **Navbar entrance/homepage** — the fixed navbar slides down from `translateY(-100px)` after load; on scroll it collapses/gets a frosted-glass background.
10. **Footer / CTA entrance** — bands reveal with fade + translateY.

### 2.3 Structural/layout patterns (replicate the rhythm)
- 12-column grid, generous page padding (`px-[5%]` on desktop).
- **Alternating split sections**: text column (`col-span-4/6`) + big image/card column (`col-span-7/6`) with a spacer column between.
- **Full-bleed tinted bands** (dark theme) used every few sections to break the page rhythm — this is what keeps it from looking boring.
- **Giant border radius on imagery** — `rounded-[3em]` up to `rounded-[8em]`. This oversized-radius "card" shape is the signature look.
- Large display type: `text-4xl`–`text-7xl`, tight tracking, bold.
- Big stat blocks (`text-6xl`–`text-9xl` numbers) with small labels underneath.
- Fixed translucent top nav; rich multi-column footer.

---

## 3. Stack — use what already exists (do not add heavy deps)

- **React 19 + Vite** (existing)
- **Tailwind CSS v4** — theme tokens from `client/src/index.css` (see section 4). Use utility classes + `@theme` tokens only.
- **framer-motion** `^13.2.0` — for all reveals/entrances (already installed).
- **lucide-react** — for icons (already installed). Use existing icons: `Users`, `Sprout`, `PackageCheck`, `Wallet`, `HandCoins`, `Layers`, `BarChart3`, `LayoutDashboard`, `MapPinned`, `ArrowRight`, `ArrowLeft`, `Menu`, `X`, `ChevronDown`, `ShieldCheck`, `Sparkles`, `TrendingUp`, etc.
- **react-router-dom** — CTA links (`<Link to="/login">`, anchors to in-page sections).
- **recharts** (already installed) is OPTIONAL — can be used in the "dashboard preview / live signals" section to draw a small area/bar chart. Otherwise use a CSS-only fake chart.
- **Logo**: `client/src/assets/images/preferedlogo2.png`

New dependency policy: only `lenis` (smooth scroll) is acceptable if you want true Lenis scroll; everything else must be achievable with existing packages.

---

## 4. Color theme (KonnectCore tokens — use these, from `client/src/index.css`)

Use ONLY these Tailwind theme tokens (they already exist; do not invent new hex colors):

| Token | Value | Use |
|---|---|---|
| `primary` / `primary-600` | `#0F766E` (teal) | brand accents, primary buttons, headline highlights |
| `primary-light` / `primary-400/500` | `#14B8A6`, `#2DD4BF` | gradients, glows, icons |
| `primary-50 / 100` | `#F0FDFA` / `#CCFBF1` | tinted chips, soft backgrounds |
| `secondary` | `#2563EB` (blue) | secondary accents, link hovers, charts |
| `dark` | `#0F172A` | hero text, dark bands, footer |
| `dark-light` | `#1E293B` | dark band surfaces |
| `background` | `#F8FAFC` | page background |
| `surface` | `#FFFFFF` | cards |
| `border` / `border-light` | `#E2E8F0` / `#F1F5F9` | hairlines, dividers |
| `muted` / `muted-light` | `#64748B` / `#94A3B8` | secondary text, captions |
| `success` / `warning` / `danger` | `#16A34A` / `#EAB308` / `#DC2626` | live-signal status dots, counters |

**Design mood:** white/`#F8FAFC` base with teal as the confident brand color, deep-slate `dark` bands for drama (replacing the reference site's orange bands), subtle teal→cyan gradients, and generous white space. Slight use of `primary-50`/`primary-100` tints for feature chips and section backdrops.

---

## 5. What to build — page structure

Build a **single scrollable landing page** at route `/`. Sections in order:

### A. Sticky navbar
- Fixed top bar, transparent over hero, becomes frosted (white/80 + backdrop-blur + border) after scrolling ~40px (use framer-motion `useScroll` + `useMotionValueEvent` or scroll listener).
- Left: logo image + wordmark "KonnectCore".
- Center/right: anchor links to sections (`Members`, `Collections`, `Payments`, `Reports`, `Why us`) — smooth-scroll to them.
- CTA button: "Sign in" → `/login` (use existing `Button` styles: primary variant).
- Mobile: hamburger opens a full-screen overlay menu with staggered link animation (lucide `Menu` / `X`).

### B. Hero (full screen, the wow moment)
- `min-h-screen` (or `h-screen`), background = a slow parallax farm/cooperative photo with dark overlay `bg-dark/60` + subtle teal gradient. Optionally a muted autoplay video if you can source/keep one in `public/`.
- **Word-by-word stagger reveal** headline using Plus Jakarta Sans extrabold, e.g.:
  > "Grow your cooperative. One platform." — or — "Connect farmers, harvests & capital."
- Need at least *two* lines with decorative emphasis (highlight a key word in `text-primary-light`).
- Sub-paragraph (max-w-2xl, `text-muted-light`) describing what KonnectCore does.
- Two CTAs: primary "Get Started" → `/login`; secondary "See the platform" (scrolls to dashboard preview section).
- A scroll indicator (animated `ChevronDown` or mouse icon) at the bottom to signal scrollability.
- Optional floating "signal chip": small frosted pill showing e.g. "▲ 1,240 tonnes collected this season" pulsing softly.

### C. Live signals / stats strip
The "signal" band — counted-up stats that prove the platform is alive:
- 4 large stats (counter animation on view): e.g. **Active members**, **Groups organised**, **Tonnes collected**, **Loan volume (₵)**.
- Style: big `text-5xl`–`text-7xl` bold numbers (teal gradient text), small muted labels below, arranged in a responsive grid; a thin `scaleX` divider above/below.
- Use mock values (clearly fine for a marketing page): e.g. 12,480 members · 236 groups · 8,940 t · ₵4.6M.

### D. Problem / "The opportunity"
- Full-bleed `dark` band like the reference's story section.
- Left: section label chip + bold headline ("Farmers at the centre" / "Ghana's cooperatives deserve better tools").
- Large paragraph text (`text-xl`–`text-2xl`, `text-muted-light`).
- "+" panel: mission statement styled like a pull quote.
- Keep it emotional and brief.

### E. What we provide — feature grid (use existing icons)
Headline + 6 feature cards in a responsive grid (2 cols mobile → 3 cols desktop). Cards must NOT look like admin dashboards:
- **Member & farm management** (`Users` / `Sprout`)
- **Produce collection & payments** (`PackageCheck` / `Wallet`)
- **Loans & savings** (`HandCoins`)
- **Group hierarchy** (`Layers`)
- **Field visits & traceability** (`MapPinned`)
- **Reports & insights** (`BarChart3`)
- Each card: rounded-3xl, hover lift (-2px) + shadow, icon in a `primary-50` rounded-xl chip, title, 1–2 line description. Staggered `whileInView` reveal.

### F. How it works
- Section with an eyebrow label, headline, and a horizontal 3-step row (numbered pills/circles): 1. Register cooperative · 2. Manage members & farms · 3. Collect, pay & report.
- Steps revealed sequentially with `staggerChildren`.

### G. Dashboard preview ("See the platform")
- Large rounded (`rounded-[3em]`–`[5em]`) mockup card, `overflow-hidden`, `shadow-xl`, with a scaled inner screenshot-style mock dashboard (build it with divs/recharts/Bars), tilted slightly for depth.
- Floating feature chips ("Synced payments", "Live reports") positioned at card corners.
- Image-style composition: overscaled inside, settles on scroll (see 2.2 #5).

### H. Why KonnectCore (testimonials or proof)
- 3 testimonial cards (name, role, quote) with avatar initials, star ratings, staggered reveal. Use farmer / field officer / cooperative-leader personas.
- Or a "built for cooperatives" checklist with `ShieldCheck` icons. Either is fine — pick the richer one.

### I. CTA band
- Full-bleed `primary`/gradient band (teal) with big white headline ("Ready to connect your cooperative?") + white primary button ("Sign in" → `/login`) + ghost button ("Talk to us").
- Soft animated glow/blob in the background (CSS radial gradient, subtle pulse).

### J. Footer
- `dark` background, 4 columns: brand blurb + logo, Product links, Company links, Legal. Social icons (LinkedIn/X) as lucide `Linkedin`/`X` or similar.
- Bottom bar: "© {year} KonnectCore. All rights reserved." + small links.

---

## 6. Signature animation + polish checklist (non-negotiable)

- [ ] Word-by-word hero headline stagger (translateY + fade).
- [ ] `whileInView` scroll reveals on **every** block — `viewport={{ once: true, margin: '-80px' }}`, consistent easing.
- [ ] Staggered children on all grouped reveals.
- [ ] Animated counters for the stats band.
- [ ] Growing `scaleX` divider lines between alternating sections.
- [ ] Giant rounded imagery (`rounded-[3em]` to `rounded-[8em]`) with zoom-in presentation.
- [ ] Pill "learn more" buttons with animated circular arrows in the dark bands.
- [ ] Frosted sticky navbar that transforms on scroll.
- [ ] Smooth scrolling to anchors (Lenis if installed, else CSS `scroll-behavior: smooth` + `scroll-margin-top` on sections).
- [ ] Hover micro-interactions: buttons scale 1.015 / cards lift / icons tilt — consistent with repo's Button (`whileHover` spring).
- [ ] `prefers-reduced-motion: reduce` respected (framer-motion `useReducedMotion`); page still fully readable.
- [ ] Fully responsive: mobile stack everything, hamburger nav, fluid type (`text-3xl lg:text-6xl` pattern), images `h-[22rem] lg:h-[38rem]`.
- [ ] Semantic HTML: `header`, `main`, `section` with `aria-label`, `footer`, proper `h1`/`h2` hierarchy.

---

## 7. Files to touch (create/modify these only)

- `client/src/pages/Landing.jsx` — the landing page component (NEW).
- `client/src/components/landing/*` — split into a few presentational components (Hero, Navbar, StatsBand, Features, HowItWorks, PlatformPreview, Testimonials, CtaBand, Footer). Split sensibly — don't put everything in one 1000-line file.
- `client/src/App.jsx` — add `Route path="/" element={<Landing />}` BEFORE the authenticated routes so visitors land here (keep everything else untouched; `/dashboard` remains the authed home).
- `client/index.html` — only if you must change the `<title>`/meta (if so, include an `og:` description, keep existing font links, ADD nothing heavy).

Do **not** modify `client/src/index.css` theme tokens unless impossible; prefer inline/config classes. Use existing `Button`/`Card` components from `client/src/components/ui/` where they fit, restyle via `className` props.

---

## 8. Acceptance criteria

1. The landing page renders at `/` and scrolls smoothly as a single page.
2. It uses the KonnectCore theme tokens only (teal/slate/blue) — no orange, no off-theme colors.
3. It visibly replicates the reference site's feel: word-by-word hero, scroll-stagger reveals, giant rounded imagery, full-bleed dark bands, counted stats, pill buttons — but looks like KonnectCore, not GB Hub.
4. It does NOT look like an admin/dashboard page — it is a marketing landing page.
5. All CTAs go to `/login`; nav anchors smooth-scroll to sections.
6. Runs clean: `npm run dev --prefix client`, `npm run lint --prefix client` (oxlint), `npm run build --prefix client` — no errors.
7. Mobile, tablet and desktop all look intentional and polished.
8. No secrets, no hardcoded user data, mock values clearly mock.

---

## 9. Reference snippets (for the agent)

**Tailwind v4 theme tokens** are defined in `client/src/index.css` under `@theme` (colors prefixed `--color-*` → classes like `bg-primary`, `text-muted-light`, `bg-dark`, `text-primary-light`, `border-border`, `shadow-card`). Fonts: `font-sans` (Plus Jakarta Sans), `font-mono` (IBM Plex Mono).

**Existing conventions** seen in `client/src/pages/Login.jsx`:
- `motion.div` with `initial={{ opacity: 0, y: 20 }}` / `animate` / staggered delays; `rounded-3xl border border-border bg-surface shadow-card`; logo used as `<img src={logo} className="max-h-16 w-auto object-contain" />`.

**Button** (`client/src/components/ui/Button.jsx`): variants `primary / secondary / outline / outline-primary / danger / ghost / ghost-primary`, sizes `sm / md / lg / icon`, spring hover/tap built in.

**Icons**: import from `lucide-react` (`import { Users, Sprout } from 'lucide-react'`).

---

*Wrap-up for the agent: take your time, make the hero unforgettable, keep every repeated motion rhythmic, and when finished verify with lint + build. Ship it.*