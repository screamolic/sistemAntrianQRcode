import { test, expect } from '@playwright/test'

/**
 * Authentication E2E Tests
 * Tests for login, signup, and authentication flows
 */

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test.describe('Login', () => {
    test('should display login page', async ({ page }) => {
      await page.goto('/login')

      await expect(page).toHaveTitle(/Queue Automation/)
      await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible()
      await expect(page.getByLabel('Email')).toBeVisible()
      await expect(page.getByLabel('Password')).toBeVisible()
      await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
    })

    test('should show validation errors for empty fields', async ({ page }) => {
      await page.goto('/login')

      await page.getByRole('button', { name: /sign in/i }).click()

      await expect(page.getByLabel('Email')).toHaveAttribute('aria-invalid', 'true')
      await expect(page.getByLabel('Password')).toHaveAttribute('aria-invalid', 'true')
    })

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/login')

      await page.getByLabel('Email').fill('invalid@example.com')
      await page.getByLabel('Password').fill('wrongpassword')
      await page.getByRole('button', { name: /sign in/i }).click()

      await expect(page.getByRole('alert')).toBeVisible()
      await expect(page.getByText(/invalid credentials|error/i)).toBeVisible()
    })

    test('should have link to signup page', async ({ page }) => {
      await page.goto('/login')

      const signupLink = page.getByRole('link', { name: /sign up/i })
      await expect(signupLink).toBeVisible()
      await signupLink.click()

      await expect(page).toHaveURL('/signup')
    })
  })

  test.describe('Signup', () => {
    test('should display signup page', async ({ page }) => {
      await page.goto('/signup')

      await expect(page).toHaveTitle(/Queue Automation/)
      await expect(page.getByRole('heading', { name: /create account/i })).toBeVisible()
      await expect(page.getByLabel('Email')).toBeVisible()
      await expect(page.getByLabel('Password')).toBeVisible()
      await expect(page.getByLabel('Confirm Password')).toBeVisible()
      await expect(page.getByRole('button', { name: /create account/i })).toBeVisible()
    })

    test('should show password mismatch error', async ({ page }) => {
      await page.goto('/signup')

      await page.getByLabel('Email').fill('test@example.com')
      await page.getByLabel('Password').fill('password123')
      await page.getByLabel('Confirm Password').fill('password456')
      await page.getByRole('button', { name: /create account/i }).click()

      await expect(page.getByRole('alert')).toBeVisible()
      await expect(page.getByText(/passwords do not match/i)).toBeVisible()
    })

    test('should show password length requirement', async ({ page }) => {
      await page.goto('/signup')

      await page.getByLabel('Email').fill('test@example.com')
      await page.getByLabel('Password').fill('short')
      await page.getByLabel('Confirm Password').fill('short')
      await page.getByRole('button', { name: /create account/i }).click()

      await expect(page.getByRole('alert')).toBeVisible()
      await expect(page.getByText(/at least 8 characters/i)).toBeVisible()
    })

    test('should have link to login page', async ({ page }) => {
      await page.goto('/signup')

      const loginLink = page.getByRole('link', { name: /sign in/i })
      await expect(loginLink).toBeVisible()
      await loginLink.click()

      await expect(page).toHaveURL('/login')
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
