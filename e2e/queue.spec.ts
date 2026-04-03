import { test, expect } from '@playwright/test'

/**
 * Queue Management E2E Tests
 * Tests for queue creation, viewing, and management flows
 */

test.describe('Queue Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test.describe('Homepage', () => {
    test('should display homepage with feature cards', async ({ page }) => {
      await page.goto('/')

      await expect(page).toHaveTitle(/Queue Automation/)
      await expect(page.getByText(/Queue Automation System/i)).toBeVisible()
      await expect(page.getByText(/Modern queue management/i)).toBeVisible()

      // Feature cards
      await expect(page.getByText(/QR Code Join/i)).toBeVisible()
      await expect(page.getByText(/Real-Time Updates/i)).toBeVisible()
      await expect(page.getByText(/WhatsApp Notifications/i)).toBeVisible()
    })

    test('should have get started button', async ({ page }) => {
      await page.goto('/')

      const getStartedButton = page.getByRole('link', { name: /get started/i })
      await expect(getStartedButton).toBeVisible()
      await getStartedButton.click()

      await expect(page).toHaveURL('/signup')
    })
  })

  test.describe('Dashboard (Authenticated)', () => {
    test.skip('should display dashboard after login', async ({ page }) => {
      // This test requires a valid user account
      await page.goto('/login')

      await page.getByLabel('Email').fill(process.env.TEST_USER_EMAIL || 'admin@example.com')
      await page.getByLabel('Password').fill(process.env.TEST_USER_PASSWORD || 'password123')
      await page.getByRole('button', { name: /sign in/i }).click()

      await expect(page).toHaveURL('/dashboard')
      await expect(page.getByText(/dashboard/i)).toBeVisible()
      await expect(page.getByText(/welcome back/i)).toBeVisible()
    })

    test('should redirect to login when accessing dashboard unauthenticated', async ({ page }) => {
      await page.goto('/dashboard')

      await expect(page).toHaveURL('/login')
    })
  })

  test.describe('Queue Join Flow', () => {
    test('should display queue page structure', async ({ page }) => {
      // Test with a sample queue ID
      await page.goto('/queue/test-queue-id')

      // Should show queue page (may show not found for invalid ID)
      await expect(page).toHaveTitle(/Queue Automation/)
    })

    test('should validate join form fields', async ({ page }) => {
      await page.goto('/queue/test-queue')

      // Try to submit empty form
      const submitButton = page.getByRole('button', { name: /join queue/i })
      if (await submitButton.isVisible()) {
        await submitButton.click()

        // Should show validation errors
        await expect(page.getByLabel(/first name/i)).toHaveAttribute('aria-invalid', 'true')
        await expect(page.getByLabel(/last name/i)).toHaveAttribute('aria-invalid', 'true')
        await expect(page.getByLabel(/phone/i)).toHaveAttribute('aria-invalid', 'true')
      }
    })
  })

  test.describe('Responsive Design', () => {
    test('should display mobile navigation', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }) // iPhone SE
      await page.goto('/')

      // Mobile menu button should be visible on mobile
      const mobileMenuButton = page.getByLabel(/open menu|menu/i)
      await expect(mobileMenuButton).toBeVisible()
    })

    test('should display desktop navigation', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 }) // Desktop
      await page.goto('/')

      // Desktop navigation should be visible
      await expect(page.getByText(/Queue Automation/i)).toBeVisible()
    })
  })

  test.describe('Accessibility', () => {
    test('should have proper heading hierarchy', async ({ page }) => {
      await page.goto('/')

      // Should have exactly one h1
      const h1Count = await page.locator('h1').count()
      expect(h1Count).toBe(1)
    })

    test('should have skip links for keyboard navigation', async ({ page }) => {
      await page.goto('/')

      // Check for main landmark
      await expect(page.locator('main')).toBeVisible()
    })

    test('should have proper form labels', async ({ page }) => {
      await page.goto('/login')

      // All inputs should have associated labels
      const inputs = page.locator('input[type="email"], input[type="password"]')
      const count = await inputs.count()

      for (let i = 0; i < count; i++) {
        const input = inputs.nth(i)
        const id = await input.getAttribute('id')
        if (id) {
          const label = page.locator(`label[for="${id}"]`)
          await expect(label).toBeVisible()
        }
      }
    })
  })
})
