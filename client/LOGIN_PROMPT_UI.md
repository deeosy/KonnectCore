# KonnectCore — Login Page UI Prompt

> Hand this prompt to your AI UI agent. It fully describes the reference design language, the existing stack and theme tokens, and exactly what to build. The target is a premium, visually striking login page that feels like it was designed by a senior UI/UX designer — not a default auth form.

---

## 1. Project context

We are building the **login page for KonnectCore**, an agricultural cooperative management platform for Ghanaian farmer organisations. This is the gateway into the authenticated app — it must feel polished, trustworthy, and visually memorable while remaining clean and focused on its single job: getting users signed in.

The login page lives inside an existing **React 19 + Vite 8** app (in `/client`), already wired with **Tailwind CSS v4**, **framer-motion**, **lucide-react**, **react-router-dom**. The internal app routes (dashboard, members, collections, payments, loans, reports…) already exist and are protected behind authentication. The login page sits at route `/login` and is the public entrance into the authenticated experience.

**Do not** redesign or touch any internal app pages. Build only the login page, following the design language and theme tokens below.

---

## 2. Design philosophy — what "senior UI/UX" means here

This is not a basic centered card on a white background. This is a **full-viewport, two-panel cinematic login** that tells a story while it authenticates. The design should evoke:

- **Confidence** — the brand knows what it's doing
- **Warmth** — this is for farmers and cooperatives, not fintech bros
- **Clarity** — the form is effortless, zero friction
- **Premium craft** — every micro-interaction, every spacing decision, every shadow is intentional

Think: Stripe's login meets Linear's polish meets African agricultural warmth.

---

## 3. Stack — use what already exists

- **React 19 + Vite** (existing)
- **Tailwind CSS v4** — theme tokens from `client/src/index.css` (see section 5). Use utility classes + `@theme` tokens only.
- **framer-motion** `^13.2.0` — for all animations (already installed).
- **lucide-react** — for icons (already installed).
- **react-router-dom** — navigation (`useNavigate`, `useLocation` for redirect-after-login).
- **Logo**: `client/src/assets/images/preferedlogo2.png`
- **Existing UI components**: Use `Button` (`client/src/components/ui/Button.jsx`) and `Input` (`client/src/components/ui/Input.jsx`) — they already have variants, sizes, and framer-motion spring hover/tap animations built in.

New dependency policy: ZERO new packages. Everything must be achievable with existing packages.

---

## 4. Color theme (KonnectCore tokens — use these ONLY)

Use ONLY these Tailwind theme tokens from `client/src/index.css`. Do NOT invent new hex colors:

| Token | Value | Use |
|---|---|---|
| `primary` / `primary-600` | `#0F766E` (teal) | Primary CTA button, focus rings, active accents |
| `primary-light` / `primary-400/500` | `#14B8A6`, `#2DD4BF` | Gradients, glows, hover states, icon accents |
| `primary-50 / 100` | `#F0FDFA` / `#CCFBF1` | Soft background tints, decorative washes |
| `primary-700 / 800` | `#115E59` / `#134E4A` | Deep teal for dark overlays, hover states |
| `secondary` | `#2563EB` (blue) | Secondary accents, "forgot password" link |
| `dark` | `#0F172A` | Left panel background, primary text |
| `dark-light` | `#1E293B` | Left panel surface variations |
| `dark-lighter` | `#334155` | Subtle borders on dark surfaces |
| `background` | `#F8FAFC` | Right panel (form side) background |
| `surface` | `#FFFFFF` | Form card surface |
| `border` / `border-light` | `#E2E8F0` / `#F1F5F9` | Form card borders, dividers |
| `muted` / `muted-light` | `#64748B` / `#94A3B8` | Secondary text, placeholders, captions |
| `subtle` | `#F1F5F9` | Demo credentials box background |
| `danger` / `danger-50` | `#DC2626` / `#FEF2F2` | Error message styling |

**Design mood:** The left panel is deep, dark, cinematic (`dark` + `dark-light`) with teal accents glowing against the dark backdrop. The right panel is airy, light, minimal (`background` / `surface`) with the form as the hero. The contrast between the two panels IS the design.

---

## 5. Page structure — the two-panel layout

### Layout overview
```
┌──────────────────────────────┬──────────────────────────────┐
│                              │                              │
│     LEFT PANEL (branding)    │    RIGHT PANEL (form)        │
│     dark bg, full height     │    light bg, centered form   │
│     logo + headline +        │    logo (mobile only) +      │
│     features + footer        │    welcome card + inputs      │
│                              │    + CTA + demo creds         │
│                              │                              │
└──────────────────────────────┴──────────────────────────────┘
```

- Left panel: `hidden lg:flex` (hidden on mobile, visible on desktop `lg:` and above)
- Right panel: always visible, full width on mobile
- Overall: `flex min-h-screen` (no scrolling needed, everything fits in viewport)

---

### A. Left Panel — Brand Story (dark, cinematic)

**Background:** `bg-dark` (`#0F172A`) with a subtle teal radial gradient overlay. Create a large, soft radial gradient using CSS: a `primary-900`/`primary-800` radial glow positioned at the bottom-left corner of the panel, fading to transparent. This gives the dark panel depth and warmth without being flat.

**Layout:** Full height (`h-screen`), flex column with `justify-between`, generous padding (`p-12` or `p-16`).

#### A1. Logo area (top)
- Logo image (`preferedlogo2.png`): `max-h-16`, `max-w-[180px]`, `object-contain`
- Entrance: `motion.div` with `initial={{ opacity: 0, y: -10 }}` → `animate={{ opacity: 1, y: 0 }}`, duration 0.5s

#### A2. Hero content (center-bottom area)
This is the emotional hook. A bold headline, a supporting paragraph, and feature highlights.

**Headline:** `text-4xl lg:text-5xl`, `font-extrabold`, `text-white`, tight tracking (`tracking-tight`), leading tight (`leading-tight`). Example copy:
> "Manage your agricultural cooperative."

Or a more evocative variant:
> "Your cooperative. One platform."

**Subheadline:** `text-lg`, `text-muted-light`, `max-w-md`, `leading-relaxed`, `mt-4`. Example:
> "Members, crops, harvests, payments and loans — all in one platform built for Ghanaian farmer organisations."

**Feature highlights:** A vertical list of 3 feature bullets, each animating in with staggered delays:

```jsx
const features = [
  'Member & farm management',
  'Produce collection & payments',
  'Group hierarchy & reports',
]
```

Each item:
- `motion.div` with `initial={{ opacity: 0, x: -12 }}` → `animate={{ opacity: 1, x: 0 }}`, staggered by `0.3 + i * 0.1` seconds
- Layout: `flex items-center gap-3`
- Icon container: `h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center`
- Icon: `ArrowRight` from lucide-react, `h-3 w-3 text-primary-light`
- Text: `text-sm text-muted-light`

#### A3. Footer (bottom)
- `text-xs text-muted-light/50`
- `© {year} KonnectCore. All rights reserved.`

---

### B. Right Panel — Login Form (light, clean, focused)

**Background:** `bg-background` (`#F8FAFC`), centered content with `flex items-center justify-center p-6`.

#### B1. Mobile logo (visible only on mobile/tablet)
- `lg:hidden` — show only below `lg` breakpoint
- Logo: `max-h-12`, `max-w-[160px]`
- `mb-8` spacing below

#### B2. Form card
A premium, elevated card with generous padding and smooth entrance:

**Card wrapper:**
```
rounded-3xl border border-border bg-surface p-8 shadow-card
```
- `rounded-3xl` for that modern, friendly feel
- `shadow-card` for subtle elevation (upgrade to `shadow-lg` on hover if you want)

**Entrance animation:** `motion.div` with `initial={{ opacity: 0, y: 16 }}` → `animate={{ opacity: 1, y: 0 }}`, duration 0.5s

#### B3. Card header
```
<h1>Welcome back</h1>     → text-2xl font-bold tracking-tight text-dark
<p>Sign in to your organisation dashboard</p>  → mt-1 text-sm text-muted
```

#### B4. Form fields
Use the existing `Input` component from `client/src/components/ui/Input.jsx`:

**Email field:**
```jsx
<Input
  label="Email address"
  type="email"
  autoComplete="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  placeholder="you@organisation.com"
  icon={Mail}          // from lucide-react
  required
/>
```

**Password field:**
```jsx
<Input
  label="Password"
  type="password"
  autoComplete="current-password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  placeholder="Enter your password"
  icon={Lock}          // from lucide-react
  required
/>
```

**Spacing:** `space-y-5` between fields, `mt-8` between header and form.

#### B5. Error state
When login fails, show an animated error banner above the submit button:

```
rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm font-medium text-danger
```

Animation: `motion.div` with `initial={{ opacity: 0, y: -4 }}` → `animate={{ opacity: 1, y: 0 }}`

#### B6. Submit button
Use the existing `Button` component:
```jsx
<Button type="submit" className="w-full" size="lg" loading={loading}>
  {loading ? 'Signing in...' : 'Sign in'}
</Button>
```
- `w-full` — full width of the card
- `size="lg"` — large, confident tap target
- `loading` prop shows a spinner automatically
- The Button component already has `whileHover={{ scale: 1.015 }}` and `whileTap={{ scale: 0.98 }}` spring animations

#### B7. Demo credentials box
Below the form, a subtle hint box:
```
mt-6 rounded-xl bg-subtle/50 px-4 py-3 text-center
```
Content:
```
text-xs text-muted
  Demo credentials: admin@konnectcore.com / admin123
```
Wrap the credential values in `font-semibold text-dark` for readability.

#### B8. Forgot password link (optional enhancement)
Below the password field, right-aligned:
```jsx
<div className="flex justify-end">
  <a href="#" className="text-xs font-medium text-secondary hover:text-secondary-hover transition-colors">
    Forgot password?
  </a>
</div>
```

---

## 6. Signature animations & micro-interactions (non-negotiable)

- [ ] **Left panel entrance:** Logo fades in from top, headline fades in from below, feature bullets stagger in from left — all on page load
- [ ] **Form card entrance:** Slides up from `y: 16` with fade, 0.5s duration
- [ ] **Error banner entrance:** Spring animation from `y: -4` when error appears
- [ ] **Button hover:** `scale(1.015)` spring (already in Button component)
- [ ] **Button tap:** `scale(0.98)` spring (already in Button component)
- [ ] **Input focus:** Ring glow with `primary-light` color (already in Input component)
- [ ] **Loading state:** Button shows spinner, text changes to "Signing in..."
- [ ] **Reduced motion:** Respect `prefers-reduced-motion: reduce` — framer-motion handles this automatically if you use `motion.div`
- [ ] **Panel divider:** On desktop, a subtle gradient edge on the right side of the left panel — a 40px wide gradient from `dark` to transparent, creating a soft feather between panels

---

## 7. Responsive behavior

### Desktop (lg and above)
- Two-panel side-by-side layout
- Left panel: full branding experience
- Right panel: centered form card

### Mobile / Tablet (below lg)
- Single panel: right panel takes full width
- Left panel hidden
- Logo appears above the form card
- Form card has slightly less padding (`p-6` instead of `p-8`)
- Everything remains in viewport or scrolls minimally

---

## 8. Login flow logic (preserve existing)

```jsx
const { login } = useAuth()
const navigate = useNavigate()
const location = useLocation()
const from = location.state?.from?.pathname || '/dashboard'

const handleSubmit = async (e) => {
  e.preventDefault()
  setError('')
  setLoading(true)
  try {
    await login(email, password)
    navigate(from, { replace: true })
  } catch (err) {
    setError(err.response?.data?.message || 'Login failed. Please try again.')
  } finally {
    setLoading(false)
  }
}
```

**Do not change the auth logic.** Only enhance the UI/UX of the visual presentation.

---

## 9. Files to touch (create/modify these only)

- `client/src/pages/Login.jsx` — the login page component (MODIFY the existing file)
- `client/src/components/ui/Input.jsx` — only if visual tweaks are needed (PREFER not modifying)
- `client/src/components/ui/Button.jsx` — only if visual tweaks are needed (PREFER not modifying)
- `client/src/index.css` — only if absolutely necessary for the panel gradient (PREFER inline styles or Tailwind)

Do **not** modify any other files.

---

## 10. Acceptance criteria

1. The login page renders at `/login` with a two-panel layout on desktop
2. It uses ONLY KonnectCore theme tokens — no off-theme colors
3. It feels premium and polished — not a default template, not a boring centered card
4. The left panel has depth (gradient glow against dark), not a flat dark rectangle
5. The form card has generous whitespace, clear hierarchy, and smooth interactions
6. All existing auth logic (login, error handling, redirect) is preserved unchanged
7. Mobile experience is clean — single panel, centered form, no layout breakage
8. All animations are smooth and purposeful — nothing gratuitous
9. `npm run dev --prefix client`, `npm run lint --prefix client` (oxlint), `npm run build --prefix client` — no errors
10. The demo credentials box is visible and readable

---

## 11. Reference design moodboard (verbal)

- **Stripe login:** Two-panel, dark left / light right, clean form, premium feel
- **Linear login:** Minimal, focused, beautiful animations
- **Vercel dashboard login:** Dark mode confidence, simple but crafted
- **Notion login:** Friendly, warm, not intimidating

Combine: the **layout confidence** of Stripe + the **animation polish** of Linear + the **warmth** of Notion + the **African agricultural context** of KonnectCore.

---

*Wrap-up for the agent: make the left panel cinematic with that teal glow against the dark backdrop. Make the form card feel like it's floating. Every animation should feel intentional, not decorative. When finished, verify with lint + build. Ship it.*
