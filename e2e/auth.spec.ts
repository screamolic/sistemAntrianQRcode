import { test, expect } from '@playwright/test'

/**
 * Authentication E2E Tests
 * Tests for login and authentication flows
 */

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test.describe('Login', () => {
    test('should display login page', async ({ page }) => {
      await page.goto('/login')

      await expect(page).toHaveTitle(/Queue Automation/)
      await expect(page.getByRole('heading', { name: /masuk/i })).toBeVisible()
      await expect(page.getByLabel('Username')).toBeVisible()
      await expect(page.getByLabel('Password')).toBeVisible()
      await expect(page.getByRole('button', { name: /masuk/i })).toBeVisible()
    })

    test('should show validation errors for empty fields', async ({ page }) => {
      await page.goto('/login')

      await page.getByRole('button', { name: /masuk/i }).click()

      await expect(page.getByLabel('Username')).toHaveAttribute('aria-invalid', 'true')
      await expect(page.getByLabel('Password')).toHaveAttribute('aria-invalid', 'true')
    })

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/login')

      await page.getByLabel('Username').fill('invaliduser')
      await page.getByLabel('Password').fill('wrongpassword')
      await page.getByRole('button', { name: /masuk/i }).click()

      await expect(page.getByRole('alert')).toBeVisible()
      await expect(page.getByText(/username atau password salah/i)).toBeVisible()
    })

    test('should display admin contact message', async ({ page }) => {
      await page.goto('/login')

      await expect(page.getByText(/belum punya akun\? hubungi administrator/i)).toBeVisible()
    })
  })

  test.describe('Navigation', () => {
    test('should display theme toggle', async ({ page }) => {
      await page.goto('/')

      const themeToggle = page.getByLabel(/toggle theme|dark|light/i)
      await expect(themeToggle).toBeVisible()
    })

    test('should have sign in button on homepage', async ({ page }) => {
      await page.goto('/')

      const signInButton = page.getByRole('link', { name: /sign in/i })
      await expect(signInButton).toBeVisible()
      await signInButton.click()

      await expect(page).toHaveURL('/login')
    })
  })
})
