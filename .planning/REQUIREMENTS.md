# QueueAutomation Modernization — Requirements

## User Stories

### Authentication & Authorization

**US-1: Admin Login**
- As an admin, I want to log in securely so I can manage my queue
- Acceptance: Username/password auth with NextAuth.js, secure session cookies, redirect to queue dashboard

**US-2: ~~Admin Signup~~** *(REMOVED — access controlled by admin only)*
- ~~As a new admin, I want to create an account so I can start managing queues~~
- Reason: Signup page removed; users are created by seeding or manually by SUPER_ADMIN
- Replaced by: US-13: Default Superuser Auto-Seed

**US-3: Super Admin Access**
- As a super admin, I want to view all queues and admins so I can oversee the system
- Acceptance: Role-based access control, separate super admin dashboard

**US-4: Logout**
- As a user, I want to log out securely so my session is terminated
- Acceptance: Session invalidation, redirect to home page

### Queue Management

**US-5: Create Queue**
- As an admin, I want to create a queue with a unique QR code so users can join
- Acceptance: Generate unique queue ID, create QR code with queue URL, display download option

**US-6: View Queue**
- As an admin, I want to see real-time queue status so I can manage it effectively
- Acceptance: Display queue list in FIFO order, show total count, auto-refresh

**US-7: Call Next Person**
- As an admin, I want to remove the next person from queue so I can serve them
- Acceptance: One-click "Next" button, remove from queue, trigger SMS if configured

**US-8: Delete Queue**
- As an admin, I want to delete my queue when done so data is cleaned up
- Acceptance: Confirmation dialog, delete all queue entries, soft delete option

### User Registration

**US-9: Scan QR to Join**
- As a user, I want to scan a QR code and join the queue so I don't have to wait physically
- Acceptance: Mobile-friendly registration form, phone number validation, duplicate prevention

**US-10: Queue Position Updates**
- As a user, I want to know my position in queue so I can plan accordingly
- Acceptance: Display position number, estimated wait time (future enhancement)

### Notifications

**US-11: WhatsApp Notification**
- As a user, I want to receive WhatsApp message when I'm next in line so I can be ready
- Acceptance: Trigger WhatsApp at position 3, rate limiting, Evolution-API integration, message template support

**US-12: Daily Queue Reset**
- As a system, I want to auto-delete old queues daily so data stays current
- Acceptance: Cron job at midnight, delete queues older than 24 hours, log cleanup

### System Setup

**US-13: Default Superuser Auto-Seed**
- As a system, I want to create a default SUPER_ADMIN on first run so the app is usable immediately
- Acceptance: Auto-creates user with username `admin` (configurable), password `Admin123!` (configurable), role `SUPER_ADMIN`, only if no users exist

## Functional Requirements

### FR-1: Authentication System
- NextAuth.js with Credentials Provider
- Username-based login (min 3 characters)
- Password hashing with bcrypt (10-12 rounds)
- JWT-based sessions with httpOnly cookies
- Session expiry: 24 hours
- Default superuser auto-seeded on first run (configurable via env)
- Password reset via email (Phase 2)

### FR-2: Database Schema
- Users table (id, username, name, email, passwordHash, role, counterId, createdAt, updatedAt)
- Username field (unique, nullable)
- Queues table (id, adminId, name, createdAt, expiresAt)
- QueueEntries table (id, queueId, userId, firstName, lastName, phone, position, createdAt)
- Drizzle migrations for schema management

### FR-3: Queue Algorithm
- FIFO (First-In-First-Out) ordering
- Position auto-increment on join
- Position recalculation on removal
- Concurrent join handling (transactions)

### FR-4: QR Code Generation
- Unique URL per queue: `/queue/[queueId]/[date]`
- QR code size: 256x256 minimum
- PNG format with download option
- Dynamic date validation

### FR-5: WhatsApp Integration
- Evolution-API self-hosted instance
- WhatsApp Business API connection
- Template messages for queue notifications
- Message: "Be ready you are next in queue at [queueName]"
- Rate limiting: max 1 message per user per 5 minutes
- Message delivery status tracking
- Fallback handling for failed deliveries

### FR-6: Real-time Updates
- Server-Sent Events (SSE) or React Query polling
- Queue updates every 5 seconds
- Optimistic UI updates
- Reconnection handling

## Non-Functional Requirements

### NFR-1: Security
- All passwords hashed (bcrypt)
- SQL injection prevention (Prisma parameterized queries)
- XSS prevention (React escaping, CSP headers)
- CSRF protection (NextAuth built-in)
- Rate limiting on all API routes
- Input validation with Zod schemas

### NFR-2: Performance
- First Contentful Paint < 1.5s
- Time to Interactive < 3.5s
- Lighthouse score > 90 (all categories)
- API response time < 200ms (p95)
- Database queries < 50ms (p95)

### NFR-3: Reliability
- 99.9% uptime target
- Graceful error handling
- Database connection pooling
- Retry logic for external services (Twilio)

### NFR-4: Scalability
- Support 1000 concurrent users
- Support 100 active queues
- Horizontal scaling ready (Vercel)
- Database connection limits respected

### NFR-5: Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- Color contrast ratios > 4.5:1

### NFR-6: Testing
- Unit test coverage > 80%
- Integration tests for API routes
- E2E tests for critical user paths
- Visual regression tests for UI components

## Technical Requirements

### TR-1: Development Environment
- Node.js 20+ LTS
- pnpm package manager
- ESLint + Prettier
- Husky pre-commit hooks
- TypeScript strict mode

### TR-2: CI/CD Pipeline
- GitHub Actions workflow
- Automated testing on PR
- Linting and type checking
- Vercel preview deployments
- Production deployment on main merge

### TR-3: Monitoring
- Vercel Analytics
- Error tracking (Sentry - Phase 2)
- Log aggregation (Vercel Logs)
- Performance monitoring

## Acceptance Criteria

### MVP Definition (Milestone 1 Complete)
- [ ] Admin can sign up and log in securely
- [ ] Admin can create a queue with QR code
- [ ] User can scan QR and join queue
- [ ] Admin can see queue in real-time
- [ ] Admin can call next person
- [ ] SMS sent when user is 3rd in line
- [ ] Queue resets daily
- [ ] All critical paths have E2E tests
- [ ] Lighthouse scores > 90
- [ ] No critical security issues

---

## Traceability — Milestone v2.0

### Requirements to Phase Mapping

| Requirement | Phase | Title |
|-------------|-------|-------|
| AUTH-01 | Phase 1 | Project Foundation & Auth |
| AUTH-02 | Phase 1 | Project Foundation & Auth |
| SEC-01 | Phase 1 | Project Foundation & Auth |
| SEC-02 | Phase 2 | Database Schema & Drizzle Setup |
| QUEUE-01 | Phase 3 | QR Code & Queue Entry |
| QUEUE-02 | Phase 3 | QR Code & Queue Entry |
| UI-01 | Phase 3 | QR Code & Queue Entry |
| QUEUE-03 | Phase 4 | Staff Dashboard & Queue Management |
| STAFF-01 | Phase 4 | Staff Dashboard & Queue Management |
| STAFF-02 | Phase 4 | Staff Dashboard & Queue Management |
| STAFF-03 | Phase 4 | Staff Dashboard & Queue Management |
| STAFF-04 | Phase 4 | Staff Dashboard & Queue Management |
| UI-02 | Phase 4 | Staff Dashboard & Queue Management |
| WA-01 | Phase 5 | Evolution-API WhatsApp Integration |
| WA-02 | Phase 5 | Evolution-API WhatsApp Integration |
| WA-03 | Phase 5 | Evolution-API WhatsApp Integration |
| WA-04 | Phase 5 | Evolution-API WhatsApp Integration |
| WA-05 | Phase 5 | Evolution-API WhatsApp Integration |
| QUEUE-04 | Phase 6 | Real-time Updates & Queue Display |
| QUEUE-05 | Phase 7 | Automation & Daily Reset |
| TEST-01 | Phase 8 | Testing & Deployment |
| TEST-02 | Phase 8 | Testing & Deployment |

**Coverage:** 22/22 Active requirements (100%)

### User Stories to Phase Mapping

| User Story | Primary Phase | Related Phases |
|------------|---------------|----------------|
| US-1: Admin Login | Phase 1 | - |
| US-2: ~~Admin Signup~~ | Phase 1 | **REMOVED** |
| US-3: Super Admin Access | Phase 1 | - |
| US-4: Logout | Phase 1 | - |
| US-5: Create Queue | Phase 3 | - |
| US-6: View Queue | Phase 4 | Phase 6 |
| US-7: Call Next Person | Phase 4 | Phase 5 |
| US-9: Scan QR to Join | Phase 3 | - |
| US-10: Queue Position Updates | Phase 3 | Phase 6 |
| US-11: WhatsApp Notification | Phase 5 | - |
| US-12: Daily Queue Reset | Phase 7 | - |
| US-13: Default Superuser Auto-Seed | Phase 1 | - |

**Coverage:** 12/12 User Stories (1 active removed)

---

*Last updated: 4 April 2026 — Auth refactor (username login, signup removed, US-13 added)*
