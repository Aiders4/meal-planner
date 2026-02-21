# Phase 6 Wireframes

ASCII wireframes for all Phase 6 screens. These define layout and information hierarchy.

---

## 1. Login Page

```
+--------------------------------------------------+
|                                                  |
|                                                  |
|          +----------------------------+          |
|          |       Meal Planner         |          |
|          |                            |          |
|          |  Welcome back              |          |
|          |                            |          |
|          |  Email                     |          |
|          |  +----------------------+  |          |
|          |  |                      |  |          |
|          |  +----------------------+  |          |
|          |                            |          |
|          |  Password                  |          |
|          |  +----------------------+  |          |
|          |  |                      |  |          |
|          |  +----------------------+  |          |
|          |                            |          |
|          |  [     Sign In          ]  |          |
|          |                            |          |
|          |  Don't have an account?    |          |
|          |  Register ->               |          |
|          |                            |          |
|          +----------------------------+          |
|                                                  |
|                                                  |
+--------------------------------------------------+
```

**Notes:**
- Card centered vertically and horizontally
- App name/logo at top of card
- Subtle background (muted color or slight gradient)
- Error messages appear inline below form fields or as a toast
- "Register" link navigates to `/register`
- Card max-width ~400px

---

## 2. Register Page

```
+--------------------------------------------------+
|                                                  |
|                                                  |
|          +----------------------------+          |
|          |       Meal Planner         |          |
|          |                            |          |
|          |  Create your account       |          |
|          |                            |          |
|          |  Email                     |          |
|          |  +----------------------+  |          |
|          |  |                      |  |          |
|          |  +----------------------+  |          |
|          |                            |          |
|          |  Password                  |          |
|          |  +----------------------+  |          |
|          |  |                      |  |          |
|          |  +----------------------+  |          |
|          |                            |          |
|          |  Confirm Password          |          |
|          |  +----------------------+  |          |
|          |  |                      |  |          |
|          |  +----------------------+  |          |
|          |                            |          |
|          |  [    Create Account     ] |          |
|          |                            |          |
|          |  Already have an account?  |          |
|          |  Sign in ->                |          |
|          |                            |          |
|          +----------------------------+          |
|                                                  |
|                                                  |
+--------------------------------------------------+
```

**Notes:**
- Same card style as login, centered
- Confirm password field validates match client-side
- Password requirements shown as helper text (min 8 characters)
- "Sign in" link navigates to `/login`

---

## 3. App Shell (Authenticated Layout)

```
+--------------------------------------------------+
| [Logo] Meal Planner    Home  Profile  History  [Logout] |
+--------------------------------------------------+
|                                                  |
|  +--------------------------------------------+ |
|  |                                            | |
|  |          (Page content renders here)        | |
|  |                                            | |
|  |          max-w-4xl centered                | |
|  |                                            | |
|  +--------------------------------------------+ |
|                                                  |
+--------------------------------------------------+
```

**Mobile (< 768px):**

```
+-----------------------------+
| [Logo] Meal Planner   [=]  |
+-----------------------------+
|                             |
|  (Page content here)        |
|  full width with padding    |
|                             |
+-----------------------------+

Mobile menu (expanded):
+-----------------------------+
| [Logo] Meal Planner   [X]  |
+-----------------------------+
|  Home                       |
|  Profile                    |
|  History                    |
|  Logout                     |
+-----------------------------+
```

**Notes:**
- Header is sticky, full-width, with subtle bottom border
- Nav links highlight the active route
- Content area is centered with `max-w-4xl` and horizontal padding
- Mobile: hamburger menu that expands to show nav links vertically
- Dark mode toggle in header (sun/moon icon)

---

## 4. Home Page (Phase 6 Placeholder)

This is the landing page after login. In Phase 8 it becomes the meal generation screen. For Phase 6, show a welcome state.

```
+--------------------------------------------------+
| [Logo] Meal Planner    Home  Profile  History  [Logout] |
+--------------------------------------------------+
|                                                  |
|          +----------------------------+          |
|          |                            |          |
|          |    Welcome to Meal Planner |          |
|          |                            |          |
|          |    Set up your profile to  |          |
|          |    start generating meals  |          |
|          |    tailored to your diet.  |          |
|          |                            |          |
|          |    [  Set Up Profile  ]     |          |
|          |                            |          |
|          +----------------------------+          |
|                                                  |
+--------------------------------------------------+
```

**Notes:**
- If profile is NOT set up: show the above CTA card
- If profile IS set up: show a "Generate Meal" button (Phase 8 will implement the actual flow)
- Centered card with brief description text
- Primary action button leads to `/profile`

---

## Screen Flow

```
  (unauthenticated)           (authenticated)

  /login  <---> /register     / (Home)
                              |
                              +-- /profile
                              |
                              +-- /history

  Login/Register success --> redirect to /
  Logout --> redirect to /login
  401 from API --> redirect to /login
```
