import { test as base } from '@playwright/test'

/**
 * Extended test fixtures for Queue Automation E2E tests
 */

export type Fixtures = {
  // Add custom fixtures here
}

export const test = base.extend<Fixtures>({
  // Add fixture implementations here
})

export { expect } from '@playwright/test'
