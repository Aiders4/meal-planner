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

### Phase 7 Components (planned)
- `checkbox` - dietary restrictions multi-select
- `slider` - cook time selector
- `badge` - disliked ingredients tags, cuisine tags
- `separator` - section dividers in profile
- `select` - dropdowns if needed
- `tabs` - restriction category grouping

### Phase 8 Components (planned)
- `progress` - macro target bars
- `accordion` - collapsible instructions
- `skeleton` - loading state for meal generation
- `alert` - profile setup prompt

### Phase 9 Components (planned)
- `pagination` - meal history pagination
- `dropdown-menu` - sort/filter options

## Screen-Specific Notes

### Login / Register
- Card: `max-w-sm` centered both axes
- App title "Meal Planner" as `<h1>` inside card
- Subtitle: "Welcome back" (login) / "Create your account" (register)
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

### Home Page (Phase 6 stub)
- Centered card with welcome message
- CTA button linking to profile setup
- Will be replaced by meal generation UI in Phase 8

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
