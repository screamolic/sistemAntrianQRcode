# Performance Optimization Guide

## Lighthouse Audit

Run Lighthouse audits to measure performance:

```bash
# Run full audit (starts dev server automatically)
npm run lighthouse

# Desktop audit only
npm run lighthouse:desktop

# Mobile audit only
npm run lighthouse:mobile
```

## Performance Targets

| Metric                   | Target  | Priority |
| ------------------------ | ------- | -------- |
| Performance              | ≥ 90    | High     |
| Accessibility            | ≥ 95    | Critical |
| Best Practices           | ≥ 90    | High     |
| SEO                      | ≥ 90    | Medium   |
| First Contentful Paint   | < 1.5s  | High     |
| Largest Contentful Paint | < 2.5s  | High     |
| Cumulative Layout Shift  | < 0.1   | High     |
| Total Blocking Time      | < 200ms | Medium   |

## Optimization Strategies

### 1. Image Optimization

- Use Next.js `Image` component for automatic optimization
- Serve images in WebP format
- Implement lazy loading for below-fold images

```tsx
import Image from 'next/image'
;<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={630}
  priority // For above-fold images
  quality={85}
/>
```

### 2. Code Splitting

- Next.js automatically code-splits by route
- Use dynamic imports for heavy components

```tsx
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('@/components/heavy-component'), {
  loading: () => <LoadingSkeleton />,
  ssr: false, // Disable SSR if not needed
})
```

### 3. Font Optimization

- Use `next/font` for automatic optimization
- Subset fonts to reduce file size
- Preload critical fonts

```tsx
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
})
```

### 4. CSS Optimization

- Purge unused CSS (Tailwind does this automatically)
- Minimize CSS bundle size
- Use CSS containment for isolated components

### 5. JavaScript Optimization

- Tree-shake unused code
- Minimize bundle size with `@next/bundle-analyzer`
- Defer non-critical JavaScript

```bash
# Install bundle analyzer
npm install --save-dev @next/bundle-analyzer

# Analyze bundle
ANALYZE=true npm run build
```

### 6. Caching Strategies

#### Static Assets

- Set long cache TTLs for static assets
- Use content hashes for cache busting

#### API Responses

- Implement stale-while-revalidate
- Use SWR or React Query for data caching

```tsx
import { useQuery } from '@tanstack/react-query'

const { data } = useQuery({
  queryKey: ['queues'],
  queryFn: fetchQueues,
  staleTime: 5 * 60 * 1000, // 5 minutes
  refetchInterval: 30 * 1000, // 30 seconds
})
```

### 7. Server-Side Optimization

- Use Edge Functions for latency-sensitive routes
- Implement streaming for large responses
- Optimize database queries with indexes

```typescript
// API route with Edge runtime
export const runtime = 'edge'

export async function GET() {
  // Fast response from edge
}
```

### 8. Third-Party Scripts

- Load third-party scripts asynchronously
- Use `next/script` with proper strategy
- Consider self-hosting critical scripts

```tsx
import Script from 'next/script'
;<Script src="https://analytics.example.com/script.js" strategy="lazyOnload" />
```

## Monitoring

### Core Web Vitals

Track these metrics in production:

1. **LCP (Largest Contentful Paint)**: Loading performance
2. **FID (First Input Delay)**: Interactivity
3. **CLS (Cumulative Layout Shift)**: Visual stability

### Tools

- **Vercel Analytics**: Built-in Web Vitals tracking
- **Lighthouse CI**: Automated performance testing
- **WebPageTest**: Detailed performance analysis

## Checklist

### Pre-Deployment

- [ ] Run Lighthouse audit
- [ ] Analyze bundle size
- [ ] Optimize images
- [ ] Minimize third-party scripts
- [ ] Test on slow networks (3G)
- [ ] Test on mobile devices

### Post-Deployment

- [ ] Monitor Core Web Vitals
- [ ] Track error rates
- [ ] Analyze user timing data
- [ ] Review server response times

## Common Issues & Solutions

### High LCP

**Causes:**

- Large images
- Slow server response
- Render-blocking resources

**Solutions:**

- Optimize and compress images
- Use Edge Functions
- Preload critical resources

### High CLS

**Causes:**

- Images without dimensions
- Web fonts causing FOUT
- Dynamically injected content

**Solutions:**

- Always specify width/height for images
- Use `font-display: swap`
- Reserve space for dynamic content

### High TBT

**Causes:**

- Long JavaScript tasks
- Excessive DOM manipulation
- Heavy component rendering

**Solutions:**

- Code split heavy components
- Use Web Workers for heavy computation
- Implement virtual scrolling for long lists

## Resources

- [Web.dev Performance](https://web.dev/performance/)
- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)
- [Lighthouse Documentation](https://developer.chrome.com/docs/lighthouse/overview/)
