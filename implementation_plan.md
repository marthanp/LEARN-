# Implementation Plan — Phase 2: Interactive Core Features & Hackathon Demo Flows

This plan implements full interactivity across all major functional modules of the EdTech platform: Interactive Book Rentals & Listing, Live AI Study Chat with Markdown/Quiz modes, Tutor Booking Flow with Slot Selection, and Live Role & Subscription Tier Switching.

## User Review Required

> [!IMPORTANT]
> Since Supabase credentials in `.env.local` are currently placeholders, all interactive flows will use a hybrid state management architecture:
> 1. Client-side optimistic state with `localStorage` persistence and realistic mock data seed.
> 2. Direct readiness for Supabase/LLM API calls when live keys are provided.
> 3. Quick Profile & Tier Switcher in the header so judges can instantly test Free vs. Plus vs. Pro and Student vs. Tutor experiences.

---

## Proposed Changes

### Global State & User Context

#### [NEW] [`context/user-context.tsx`](file:///c:/Users/HP/OneDrive/Desktop/NO%20SCHOOL/edtech/context/user-context.tsx)
- Provides reactive state for active user profile (`id`, `full_name`, `email`, `role`, `subscription_tier`).
- Provides quick switchers: toggle between Student / Tutor roles, and upgrade / downgrade between `free`, `plus`, and `pro`.
- Saves state to `localStorage` for session persistence.

#### [MODIFY] [`app/layout.tsx`](file:///c:/Users/HP/OneDrive/Desktop/NO%20SCHOOL/edtech/app/layout.tsx)
- Wrap application with `UserProvider`.

#### [MODIFY] [`components/layout/header.tsx`](file:///c:/Users/HP/OneDrive/Desktop/NO%20SCHOOL/edtech/components/layout/header.tsx)
- Connect to `useUser` context: show real-time tier badge and role.
- Add an interactive Quick Switcher dropdown allowing instant switching between roles (Student/Tutor) and subscription tiers (Free/Plus/Pro) for live hackathon judging.

---

### Module 1: AI Study Assistant (`/chat`)

#### [MODIFY] [`app/chat/page.tsx`](file:///c:/Users/HP/OneDrive/Desktop/NO%20SCHOOL/edtech/app/chat/page.tsx)
- Convert to client component with live message stream.
- Multi-mode support:
  - **Explain Concept**: Breaks down topics step-by-step with markdown and examples.
  - **Quiz Me**: Generates interactive multiple-choice quiz questions with instant feedback.
  - **Homework Help**: Provides Socratic hints rather than just answers.
- Subject persona selector (Mathematics, Biology, Computer Science, Literature).
- Chat message history saved in `localStorage`.
- Tier check: Free tier shows message quota indicator with an upgrade CTA prompt.

---

### Module 2: Textbook Marketplace & Rental System (`/marketplace`)

#### [MODIFY] [`app/marketplace/page.tsx`](file:///c:/Users/HP/OneDrive/Desktop/NO%20SCHOOL/edtech/app/marketplace/page.tsx)
- Interactive search by title, author, course code, or ISBN.
- Filter pills: All, Digital Only, Physical Only, Under $20.
- **"Rent Book" Modal**:
  - For digital: Instant rental confirmation with immediate "Read Online" reader preview modal.
  - For physical: Date range picker (1 semester / 30 days / custom), calculates total rental price, confirms rental and adds to user's active rentals list.
- **"List a Book" Modal**:
  - Full modal form: Title, Author, ISBN, Course Code, Condition, Rental Price, Stock / Digital toggle.
  - Adds newly listed book immediately to the marketplace grid.
- "My Active Rentals" toggle view to see borrowed books and return countdowns.

---

### Module 3: Tutor Booking System (`/tutors`)

#### [MODIFY] [`app/tutors/page.tsx`](file:///c:/Users/HP/OneDrive/Desktop/NO%20SCHOOL/edtech/app/tutors/page.tsx)
- Filter by subject (Math, Physics, CS, Chemistry, English).
- **"Book Session" Modal**:
  - Interactive calendar/date selection and time slots (e.g. 10:00 AM, 2:00 PM, 4:30 PM).
  - Study notes & topic input.
  - Pricing calculation based on tutor's hourly rate and user subscription discount (Plus: 10% off, Pro: 25% off).
  - Session confirmation with direct feedback.
- **"My Bookings" Drawer/Tab**:
  - Displays upcoming scheduled sessions with option to join or reschedule.

---

### Module 4: Subscription Plans (`/plans`)

#### [MODIFY] [`app/plans/page.tsx`](file:///c:/Users/HP/OneDrive/Desktop/NO%20SCHOOL/edtech/app/plans/page.tsx)
- Connect plan selection directly to `UserContext`.
- One-click upgrade/downgrade with instant celebration confetti / toast notification.
- Highlights "Current Plan" dynamically according to the active tier.

---

## Verification Plan

### Automated Checks
- `npx tsc --noEmit` to ensure strict TypeScript cleanliness.

### Browser UI Verification (via `browser_subagent`)
1. **Interactive Chat**:
   - Send messages in `/chat`, test suggestion chips, verify streaming/simulated AI responses.
2. **Marketplace Rentals & Listing**:
   - Rent a textbook and verify it shows up in "My Active Rentals".
   - Open "List a Book" modal, add a custom book, verify it renders in the grid.
3. **Tutor Booking**:
   - Open booking modal on a tutor, select time slot, confirm session, and check "My Bookings".
4. **Subscription Switching**:
   - Upgrade to Pro from `/plans`, verify header badge updates to Pro, verify tutor discount applies in booking modal.
