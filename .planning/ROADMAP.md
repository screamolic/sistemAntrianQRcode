# QueueAutomation Modernization — Roadmap

## Overview

**Strategy:** Full rewrite with modern stack  
**Timeline:** 6 phases (Standard granularity)  
**Execution:** Parallel plans within phases  
**Workflow:** Research → Plan → Execute → Verify per phase

---

## Phase 1: Project Foundation

**Goal:** Set up modern Next.js 15 project with TypeScript, Tailwind, and development tooling

### Plans
1. **1.1** — Initialize Next.js 15 project with App Router and TypeScript
2. **1.2** — Configure Tailwind CSS + shadcn/ui component library
3. **1.3** — Set up ESLint, Prettier, Husky, and commit conventions
4. **1.4** — Configure path aliases and project structure

### Must-Haves
- [ ] Next.js 15 with App Router structure
- [ ] TypeScript strict mode enabled
- [ ] Tailwind CSS configured with custom theme
- [ ] shadcn/ui installed with 5+ base components
- [ ] ESLint + Prettier working
- [ ] Pre-commit hooks for linting

### Research Questions
- What's the optimal Next.js 15 project structure for 2026?
- Which shadcn/ui components are essential for MVP?
- What TypeScript path aliases improve DX most?

---

## Phase 2: Database & Authentication

**Goal:** Implement PostgreSQL database with Prisma ORM and NextAuth.js authentication

### Plans
1. **2.1** — Set up PostgreSQL (local + Vercel Postgres)
2. **2.2** — Design and implement Prisma schema (Users, Queues, QueueEntries)
3. **2.3** — Implement NextAuth.js with Credentials Provider
4. **2.4** — Create authentication UI (Login, Signup forms)
5. **2.5** — Implement role-based access control (Admin, Super Admin)

### Must-Haves
- [ ] PostgreSQL database running
- [ ] Prisma schema with migrations
- [ ] User signup with password hashing
- [ ] Secure login with JWT sessions
- [ ] Protected routes middleware
- [ ] Super admin role detection

### Research Questions
- What's the optimal Prisma schema for queue management?
- How to implement secure password reset flow?
- What session strategy works best with Vercel edge functions?

---

## Phase 3: Queue Core Functionality

**Goal:** Build core queue management features (create, join, view, manage)

### Plans
1. **3.1** — Create queue generation with unique IDs
2. **3.2** — Implement QR code generation component
3. **3.3** — Build queue join form with validation
4. **3.4** — Create admin queue dashboard
5. **3.5** — Implement FIFO queue algorithm with Prisma
6. **3.6** — Add real-time updates (React Query polling)

### Must-Haves
- [ ] Admin can create queue with unique URL
- [ ] QR code generates and displays correctly
- [ ] User can join queue via mobile form
- [ ] Admin sees queue in FIFO order
- [ ] Duplicate prevention (phone number check)
- [ ] Queue auto-refreshes every 5 seconds

### Research Questions
- How to handle concurrent queue joins (transactions)?
- What's the best strategy for real-time updates without WebSockets?
- How to generate SEO-friendly queue URLs?

---

## Phase 4: Notifications & Automation

**Goal:** Implement SMS notifications and daily queue cleanup automation

### Plans
1. **4.1** — Integrate Twilio SMS API
2. **4.2** — Implement SMS trigger logic (position 3)
3. **4.3** — Add rate limiting for SMS (prevent abuse)
4. **4.4** — Create Vercel cron job for daily cleanup
5. **4.5** — Build notification preferences UI

### Must-Haves
- [ ] Twilio integration working
- [ ] SMS sent when user reaches position 3
- [ ] Rate limiting: 1 SMS per 5 minutes per user
- [ ] Daily cron deletes expired queues
- [ ] Error handling for SMS failures
- [ ] SMS cost tracking per admin

### Research Questions
- What's the optimal cron schedule for queue cleanup?
- How to handle SMS delivery failures gracefully?
- What rate limiting strategy prevents abuse?

---

## Phase 5: UI/UX Polish & Accessibility

**Goal:** Refine user interface, improve accessibility, and optimize user experience

### Plans
1. **5.1** — Design and implement responsive navigation
2. **5.2** — Create loading states and animations
3. **5.3** — Implement dark mode toggle
4. **5.4** — Add accessibility features (keyboard nav, ARIA)
5. **5.5** — Optimize for mobile devices
6. **5.6** — Create error and empty states

### Must-Haves
- [ ] Mobile-first responsive design
- [ ] Dark mode working
- [ ] Keyboard navigation complete
- [ ] ARIA labels on interactive elements
- [ ] Loading skeletons for async states
- [ ] Error boundaries with recovery options

### Research Questions
- What accessibility improvements have highest impact?
- How to implement smooth dark mode transitions?
- What mobile UX patterns work best for queue management?

---

## Phase 6: Testing, CI/CD & Deployment

**Goal:** Add comprehensive tests, set up CI/CD pipeline, and deploy to production

### Plans
1. **6.1** — Set up Vitest for unit testing
2. **6.2** — Write unit tests for utilities and hooks
3. **6.3** — Implement Playwright E2E tests
4. **6.4** — Create GitHub Actions CI/CD workflow
5. **6.5** — Configure Vercel deployment
6. **6.6** — Performance optimization and Lighthouse audit

### Must-Haves
- [ ] Unit test coverage > 80%
- [ ] E2E tests for all critical paths
- [ ] GitHub Actions running on PR
- [ ] Vercel preview deployments working
- [ ] Production deployment automated
- [ ] Lighthouse scores > 90 (all categories)

### Research Questions
- What E2E test scenarios are critical for queue flow?
- How to optimize bundle size for Next.js 15?
- What CI/CD checks prevent bad deploys?

---

## Milestone Structure

### Milestone 1: MVP Launch (Phases 1-4)
**Definition of Done:**
- Admin authentication working
- Queue creation and management functional
- Users can join via QR code
- SMS notifications working
- Daily cleanup automated
- Deployed to Vercel production

### Milestone 2: Polish & Scale (Phases 5-6)
**Definition of Done:**
- UI/UX polished and accessible
- Dark mode implemented
- Comprehensive test coverage
- CI/CD pipeline operational
- Performance optimized
- Production-ready

---

## Dependencies

```
Phase 1 (Foundation)
    ↓
Phase 2 (Auth & DB) ← Requires Phase 1
    ↓
Phase 3 (Queue Core) ← Requires Phase 2
    ↓
Phase 4 (Notifications) ← Requires Phase 3
    ↓
Phase 5 (UI Polish) ← Can parallel with Phase 4
    ↓
Phase 6 (Testing/Deploy) ← Requires all previous
```

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Twilio SMS costs | High | Implement strict rate limiting, cost tracking |
| Database migration complexity | Medium | Use Prisma migrations, test thoroughly |
| Real-time sync issues | Medium | Use React Query with sensible polling intervals |
| Vercel cold starts | Low | Use edge functions, optimize bundle size |

---

*Last updated: 31 March 2026 — Initial roadmap after codebase audit*
