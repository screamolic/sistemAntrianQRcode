# QueueAutomation Modernization — Requirements

## User Stories

### Authentication & Authorization

**US-1: Admin Login**
- As an admin, I want to log in securely so I can manage my queue
- Acceptance: Email/password auth with NextAuth.js, secure session cookies, redirect to queue dashboard

**US-2: Admin Signup**
- As a new admin, I want to create an account so I can start managing queues
- Acceptance: Email/password with validation, password hashing (bcrypt), email uniqueness check

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

**US-11: SMS Notification**
- As a user, I want to receive SMS when I'm next in line so I can be ready
- Acceptance: Trigger SMS at position 3, rate limiting, Twilio integration

**US-12: Daily Queue Reset**
- As a system, I want to auto-delete old queues daily so data stays current
- Acceptance: Cron job at midnight, delete queues older than 24 hours, log cleanup

## Functional Requirements

### FR-1: Authentication System
- NextAuth.js with Credentials Provider
- Password hashing with bcrypt (12 rounds)
- JWT-based sessions with httpOnly cookies
- Session expiry: 24 hours
- Password reset via email (Phase 2)

### FR-2: Database Schema
- Users table (id, email, passwordHash, role, createdAt)
- Queues table (id, adminId, name, createdAt, expiresAt)
- QueueEntries table (id, queueId, userId, firstName, lastName, phone, position, createdAt)
- Prisma migrations for schema management

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

### FR-5: SMS Integration
- Twilio API integration
- Template: "Be ready you are next in queue at [queueName]"
- Rate limiting: max 1 SMS per user per 5 minutes
- Cost tracking per admin

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

*Last updated: 31 March 2026 — Initial requirements from legacy system audit*
