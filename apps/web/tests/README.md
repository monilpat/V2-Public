# Playwright E2E Tests

This directory contains end-to-end tests for the dHEDGE web application using Playwright.

## Test Structure

- **smoke.spec.ts** - Basic smoke tests to ensure pages load
- **navigation.spec.ts** - Tests for navigation and routing
- **pools.spec.ts** - Tests for pool listing and display
- **pool-detail.spec.ts** - Tests for individual pool detail pages
- **api-routes.spec.ts** - Tests for API endpoint responses
- **wallet.spec.ts** - Tests for wallet connection UI
- **forms.spec.ts** - Tests for form interactions and validation
- **accessibility.spec.ts** - Basic accessibility checks

## Running Tests

### Run all tests
```bash
pnpm test:e2e
```

### Run specific test file
```bash
pnpm playwright test tests/navigation.spec.ts
```

### Run tests in headed mode
```bash
PLAYWRIGHT_HEADED=true pnpm test:e2e
```

### Run tests against different base URL
```bash
PLAYWRIGHT_BASE_URL=https://your-deployment.vercel.app pnpm test:e2e
```

### Run tests in debug mode
```bash
pnpm playwright test --debug
```

## Test Configuration

Tests are configured in `playwright.config.ts`. The default base URL is `http://localhost:3000`.

## Notes

- Some tests may skip if certain conditions aren't met (e.g., no pools loaded)
- API route tests check response structure, not actual blockchain interactions
- Wallet connection tests check UI, not actual wallet connections
- Tests are designed to be resilient to network errors and missing data

## CI/CD

These tests can be run in CI/CD pipelines. Make sure to:
1. Start the Next.js dev server before running tests
2. Set appropriate timeouts for slower environments
3. Handle network errors gracefully
