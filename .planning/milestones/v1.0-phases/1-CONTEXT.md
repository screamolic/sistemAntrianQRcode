# Phase 1: Project Foundation — Context

**Phase Number:** 1
**Created:** 31 March 2026
**Mode:** Assumptions (auto)

---

## Decisions from Prior Context

The following decisions were already made in PROJECT.md and REQUIREMENTS.md:

### Stack Decisions (Locked)
1. **Next.js 15** with App Router (not Pages Router)
2. **TypeScript** in strict mode
3. **Tailwind CSS** for styling
4. **shadcn/ui** as component library (not Material-UI, not AntD)
5. **ESLint + Prettier** for code quality
6. **Husky** for pre-commit hooks

### Project Structure Decisions
1. **Full rewrite** approach (not incremental migration)
2. Old code in `pages/`, `components/`, `lib/` will be replaced
3. New structure follows Next.js 15 App Router conventions:
   - `app/` directory for routes
   - `components/` for reusable UI
   - `lib/` for utilities
   - `types/` for TypeScript types

### Development Workflow
1. **YOLO mode** enabled (auto-approve execution)
2. **Standard granularity** (4 plans per phase)
3. **Parallel execution** of plans within phase

---

## Implementation Decisions (Auto-Selected)

### 1.1 Next.js 15 Initialization
**Decision:** Use `create-next-app@latest` with flags
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

**Rationale:**
- Fastest setup with official tooling
- Ensures latest Next.js 15 conventions
- `src/` directory keeps root clean
- `@/*` alias is standard for imports

### 1.2 Tailwind + shadcn/ui Configuration
**Decision:** Install shadcn/ui after Next.js setup
```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input label alert-dialog skeleton
```

**Base Components for MVP:**
- `Button` - all interactions
- `Card` - queue displays, forms
- `Input` - form fields
- `Label` - form labels
- `AlertDialog` - confirmations
- `Skeleton` - loading states
- `Table` - queue lists
- `Badge` - status indicators

**Theme:**
- Default shadcn/ui theme with custom primary color
- Dark mode support from day 1 (using `next-themes`)

### 1.3 Code Quality Tools
**Decision:** Use Next.js 15 built-in ESLint + Prettier
```bash
npm install -D prettier eslint-config-prettier husky lint-staged
```

**Commit Conventions:**
- Conventional Commits format
- Pre-commit: lint-staged runs ESLint + Prettier
- Pre-push: run type check

### 1.4 Path Aliases & Structure
**Decision:** Use TypeScript path aliases
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/types/*": ["./src/types/*"],
      "@/hooks/*": ["./src/hooks/*"]
    }
  }
}
```

**Directory Structure:**
```
src/
├── app/              # Next.js App Router
│   ├── (auth)/       # Auth route group
│   ├── (dashboard)/  # Dashboard route group
│   ├── api/          # API routes
│   └── layout.tsx
├── components/
│   ├── ui/           # shadcn/ui components
│   ├── forms/        # Form components
│   └── layout/       # Layout components
├── lib/
│   ├── utils.ts      # Utilities
│   └── validations.ts # Zod schemas
├── types/
│   └── index.ts      # TypeScript types
└── hooks/
    └── use-toast.ts  # Custom hooks
```

---

## Gray Areas Resolved

### Q: Should we use `src/` directory or root-level `app/`?
**A:** Use `src/` directory - keeps root cleaner, separates source from config files.

### Q: Which package manager?
**A:** npm (specified in project - using package-lock.json)

### Q: Should we migrate old code or rewrite?
**A:** Full rewrite - old code has critical security issues and outdated patterns.

### Q: What about existing dependencies?
**A:** Start fresh - remove old `package.json` dependencies, let Next.js 15 installer set up clean base.

---

## Out of Scope (Deferred)

- Database setup (Phase 2)
- Authentication UI (Phase 2)
- Queue functionality (Phase 3)
- Notifications (Phase 4)
- Testing setup (Phase 6)

---

## Success Criteria for Phase 1

1. ✅ Next.js 15 app runs with `npm run dev`
2. ✅ TypeScript strict mode - no errors
3. ✅ Tailwind CSS working with custom config
4. ✅ shadcn/ui installed with 5+ components
5. ✅ ESLint + Prettier configured
6. ✅ Husky pre-commit hooks working
7. ✅ Path aliases resolve correctly
8. ✅ Clean project structure in place

---

## Next Steps

1. Run `/gsd-plan-phase 1` - Research and create detailed plans
2. Execute plans with `/gsd-execute-phase 1`
3. Verify with `/gsd-verify-work 1`

---

*Generated autonomously - assumptions mode*
