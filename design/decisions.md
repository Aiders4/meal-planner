# Design Decisions

Persistent reference for Phases 6-9. Approved layout, component choices, color theme, spacing conventions, and screen-specific notes.

---

## Global

| Decision | Choice | Details |
|----------|--------|---------|
| Color theme | shadcn neutral | oklch-based CSS variables already configured in `index.css`. Zero chroma = pure grayscale for light/dark. |
| Dark mode | Supported from start | `.dark` class on `<html>`. Toggle in header. Respect `prefers-color-scheme` on first visit. |
| Layout | Centered container | `max-w-4xl mx-auto px-4` for main content area |
| Navigation | Top header bar | Text links: Home, Profile, History. Logout button on the right. Mobile hamburger menu. |
| Auth pages | Centered card | `max-w-sm mx-auto` card, vertically centered on page |
| Responsive | Mobile-first | Single column on small screens, same layout scales up. Breakpoint at `md` (768px) for nav. |
| Typography | System font stack | shadcn default. No custom fonts to load. |
| Border radius | 0.625rem base | Already set as `--radius` in CSS variables |
| Spacing | Tailwind defaults | `p-6` for card padding, `gap-4` between form fields, `py-4` for header |

## Component Library

Using **shadcn/ui** (new-york style, neutral base color, CSS variables enabled).

### Phase 6 Components
- `button` - primary actions, nav items, logout
- `input` - email/password form fields
- `label` - form field labels
- `card` - auth forms, home page CTA
- `sonner` - toast notifications for errors/success (shadcn recommends sonner over their toast)

### Phase 7 Components
- `checkbox` - dietary restrictions multi-select
- `slider` - cook time selector (15–120 min, step 5)
- `badge` - disliked ingredients tags (secondary + X), cuisine toggles (default/outline)
- `separator` - divider between page header and form sections
- `tabs` - restriction category grouping (lifestyle/allergy/religious/medical)
- `select` - not needed in Phase 7 (tabs replaced dropdown use case)

### Phase 8 Components
- `progress` - macro target bars (calories, protein, carbs, fat vs targets)
- `accordion` - collapsible instructions section in meal card
- `skeleton` - loading state placeholder (installed, available for future use)
- `alert` - no-profile prompt with link to profile setup

### Phase 9 Components
- No new installs needed — reuses existing `tabs`, `button`, `card`, `badge`, `separator`, `progress`, `accordion`

## Screen-Specific Notes

### Login / Register
- Card: `max-w-sm` centered both axes
- App title "Meal Planner" as `<h1>` inside card
- Subtitle: "Welcome back" (login) / "Create your account" (register)
- Register form includes "Invite Code" field above email (required when server has `INVITE_CODE` set)
- Form fields stacked vertically with `gap-4`
- Full-width primary button for submit
- Link text below button to switch between login/register
- Inline error messages below fields for validation errors
- Toast for server errors (network, 500, etc.)

### App Shell Header
- Full-width, sticky top, `border-b`
- Left: App name "Meal Planner" (link to `/`)
- Center/Right: Nav links (Home, Profile, History)
- Far right: Dark mode toggle + Logout button
- Mobile: Hamburger icon replaces nav links, opens vertical menu
- Active nav link gets subtle highlight (underline or background)

### Home Page — Meal Generation (Phase 8)
- No profile: `<Alert>` with "Profile Required" title and link to `/profile`, `max-w-lg` centered
- With profile, no meal: Centered heading + description + compact inline macro target inputs (pre-filled from profile defaults) + "Reset to defaults" link + "Generate Meal" button. Macro inputs allow per-meal overrides before generating.
- Generating: Button shows inline spinner + "Creating your meal..."
- Meal displayed: `<Card>` with `max-w-2xl` containing:
  1. **CardHeader**: title, description, cuisine + cook time `<Badge variant="secondary">`
  2. **Macro bars**: `grid-cols-1 sm:grid-cols-2`, each bar has label, "actual / target" text, `<Progress>` fill clamped 0-100%. If no target: show actual only with "No target set" muted text.
  3. `<Separator />`
  4. **Ingredients**: list of `{quantity} {unit} {name}`. If >6 items, first 6 + ghost button toggle "Show all N ingredients"
  5. **Instructions**: `<Accordion type="single" collapsible>`, trigger "Instructions (N steps)", content is `<ol>` numbered list
  6. `<Separator />`
  7. **Action buttons**: Accept (primary, Check icon) + Reject (outline, X icon), stacked on mobile, side-by-side on sm+
- After accept/reject: toast notification, returns to generate button state
- "Generate Another" button appears below meal card

### Profile Page (Phase 7)
- Page header: `text-2xl font-bold` title + `text-muted-foreground` subtitle, separated by `<Separator />`
- Sections stacked vertically with `gap-6`, each inside a `<Card>`
- **Macro Targets**: 2×2 grid (`grid-cols-1 sm:grid-cols-2`), number inputs with `inputMode="numeric"`, all optional (empty = null). Labeled as "default per-meal targets". Component supports `compact` mode (no Card wrapper) for reuse on Home page.
- **Dietary Restrictions**: `<Tabs>` with 4 categories, checkboxes in 2-col grid, composite key format `"category:value"`
- **Cuisine Preferences**: Clickable `<Badge>` toggles — `variant="default"` when selected, `variant="outline"` when not
- **Disliked Ingredients**: Text input + Add button, removable `<Badge variant="secondary">` with X icon, validates non-empty/≤100 chars/no duplicates
- **Cook Time**: `<Slider>` (15–120 min, step 5) with centered value label below
- **Save button**: `size="lg"`, full-width on mobile, right-aligned on sm+, saves all 3 endpoints in parallel via `Promise.all`
- Validation: client-side mirrors server rules, inline `text-sm text-destructive` errors below fields
- Toast: `toast.success` on save, `toast.error` on failure

### History Page — Meal History (Phase 9)
- Page header: `text-2xl font-bold` title + `text-sm text-muted-foreground` subtitle + `<Separator />`
- Container: `max-w-2xl mx-auto`, same as Home Page
- **Filter tabs**: shadcn `<Tabs>` with 3 triggers: All / Accepted / Rejected. Changing tab resets list and fetches from offset 0.
- **Meal cards**: `<Card>` with clickable summary row (not entire card). Summary shows: title (truncated), `<Badge>` status (accepted=default, rejected=secondary, pending=outline), macro summary line (e.g. "520 kcal · 35g protein · 45g carbs · 22g fat"), metadata row (cuisine, cook time, date). Chevron icon rotates 180° on expand.
- **Expanded view**: `<Separator>` + `MacroBarsSection` + description + `<Separator>` + `IngredientsSection` + `InstructionsSection`. No action buttons (meals already decided).
- **Pagination**: "Load more" `<Button variant="outline">` centered below list, appends next page. 20 meals per page.
- **Empty states**: Context-aware per filter tab — "No meals yet" / "No accepted meals" / "No rejected meals" with helper text.
- **Loading**: Standard spinner (border-4 spin animation) centered with `py-20`.

## Color Palette Reference

These are the oklch values from `index.css` for reference when building the prototype:

| Token | Light | Dark | Approx Hex |
|-------|-------|------|------------|
| background | oklch(1 0 0) | oklch(0.145 0 0) | #ffffff / #1a1a1a |
| foreground | oklch(0.145 0 0) | oklch(0.985 0 0) | #1a1a1a / #fafafa |
| card | oklch(1 0 0) | oklch(0.205 0 0) | #ffffff / #2a2a2a |
| primary | oklch(0.205 0 0) | oklch(0.922 0 0) | #2a2a2a / #e5e5e5 |
| muted | oklch(0.97 0 0) | oklch(0.269 0 0) | #f5f5f5 / #3a3a3a |
| muted-fg | oklch(0.556 0 0) | oklch(0.708 0 0) | #808080 / #a3a3a3 |
| border | oklch(0.922 0 0) | oklch(1 0 0 / 10%) | #e5e5e5 / rgba |
| destructive | oklch(0.577 0.245 27) | oklch(0.704 0.191 22) | ~#dc2626 / ~#ef4444 |
