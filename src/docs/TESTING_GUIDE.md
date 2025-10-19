# EZ Grades Testing Guide

## Overview
This guide covers all testing approaches for EZ Grades, including unit tests, integration tests, and end-to-end (E2E) tests.

---

## Test Structure

```
/tests
├── e2e/              # End-to-end tests (Playwright)
│   ├── auth.spec.ts  # Authentication flows
│   └── ...
├── unit/             # Unit tests (future)
└── integration/      # Integration tests (future)
```

---

## End-to-End Testing with Playwright

### Setup

#### 1. Install Dependencies
```bash
npm install -D @playwright/test
npx playwright install
```

#### 2. Configuration
Configuration is in `/playwright.config.ts`:
- Runs tests in Chromium, Firefox, WebKit, and mobile browsers
- Automatically starts dev server
- Takes screenshots and videos on failure
- Generates HTML report

### Running Tests

#### Run all tests
```bash
npx playwright test
```

#### Run specific test file
```bash
npx playwright test tests/e2e/auth.spec.ts
```

#### Run in headed mode (see browser)
```bash
npx playwright test --headed
```

#### Run in debug mode
```bash
npx playwright test --debug
```

#### Run specific browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

#### Run mobile tests
```bash
npx playwright test --project="Mobile Chrome"
npx playwright test --project="Mobile Safari"
```

### Viewing Test Reports

#### Open HTML report
```bash
npx playwright show-report
```

#### View traces for failed tests
```bash
npx playwright show-trace trace.zip
```

---

## Test Coverage

### Authentication Tests (`auth.spec.ts`)

#### ✅ Covered Scenarios

**Login Flow:**
- Display login page
- Validate email format
- Handle invalid credentials
- Switch between login/signup
- Remember intended route after login

**Signup Flow:**
- Complete signup process
- Password validation (weak passwords rejected)
- Email confirmation flow
- Account creation success

**Password Reset:**
- Display forgot password form
- Submit reset request
- Confirmation message shown

**OAuth:**
- Google OAuth button displayed
- OAuth callback handling

**Route Protection:**
- Protected routes redirect to login
- StudyHub auth guard works
- Guest access to public pages
- Auth state persists after reload

**Error Handling:**
- Network errors handled gracefully
- Auth errors don't crash app
- User-friendly error messages shown

---

## Writing New Tests

### Test Structure
```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
    await page.goto('/');
  });

  test('should do something', async ({ page }) => {
    // Arrange
    await page.click('[data-testid="some-button"]');
    
    // Act
    await page.fill('input[type="email"]', 'test@example.com');
    
    // Assert
    await expect(page.locator('text=Success')).toBeVisible();
  });
});
```

### Best Practices

#### 1. Use Test IDs
```typescript
// Add to components
<button data-testid="submit-button">Submit</button>

// Use in tests
await page.click('[data-testid="submit-button"]');
```

#### 2. Wait for States
```typescript
// ❌ Bad - can be flaky
await page.click('button');
expect(page.locator('text=Loading')).toBeVisible();

// ✅ Good - wait for specific state
await page.click('button');
await page.waitForLoadState('networkidle');
await expect(page.locator('text=Success')).toBeVisible({ timeout: 5000 });
```

#### 3. Isolate Tests
```typescript
// Each test should be independent
test.beforeEach(async ({ page }) => {
  // Reset state
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
});
```

#### 4. Use Page Objects
```typescript
// Create reusable page objects
class LoginPage {
  constructor(private page: Page) {}
  
  async login(email: string, password: string) {
    await this.page.fill('[data-testid="email-input"]', email);
    await this.page.fill('[data-testid="password-input"]', password);
    await this.page.click('[data-testid="login-button"]');
  }
}

// Use in tests
const loginPage = new LoginPage(page);
await loginPage.login('test@example.com', 'password');
```

---

## CI/CD Integration

### GitHub Actions

The workflow in `.github/workflows/deploy.yml` runs tests automatically:

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npx playwright install
      - run: npm run test:e2e
      
      # Upload artifacts on failure
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

### Local Pre-commit Hook

Create `.husky/pre-commit`:
```bash
#!/bin/sh
npm run test:e2e
```

---

## Manual Testing Checklist

### Authentication
- [ ] Email/password signup works
- [ ] Email verification email sent
- [ ] Email/password login works
- [ ] Google OAuth signup works
- [ ] Google OAuth login works
- [ ] Forgot password sends email
- [ ] Password reset link works
- [ ] Invalid credentials show error
- [ ] Weak passwords rejected

### Navigation
- [ ] All nav items clickable
- [ ] Active state highlights correctly
- [ ] Sidebar collapse/expand works
- [ ] Mobile navigation works
- [ ] Guest mode shows correct UI
- [ ] Logged in shows user profile

### Features
- [ ] Dashboard loads for guests
- [ ] Dashboard loads for users
- [ ] Break Mode works
- [ ] Focus Mode works
- [ ] StudyHub requires login
- [ ] StudyHub loads when logged in
- [ ] Study Together works
- [ ] Mental Health page loads
- [ ] About Us page loads
- [ ] Settings requires login
- [ ] Settings loads when logged in

### Data Persistence
- [ ] Tasks save correctly
- [ ] Notes save correctly
- [ ] Calendar events save
- [ ] Focus sessions recorded
- [ ] Journal entries save
- [ ] User profile updates save

### Error Handling
- [ ] Network errors show message
- [ ] Auth errors show message
- [ ] Database errors handled
- [ ] App doesn't crash on errors
- [ ] Errors logged to console

### Performance
- [ ] Page load < 3s
- [ ] Lighthouse score > 90
- [ ] No memory leaks
- [ ] Smooth animations
- [ ] Responsive on mobile

### Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Sufficient color contrast
- [ ] Focus indicators visible
- [ ] ARIA labels present

---

## Test Data

### Test Accounts

**Development:**
```
Email: test@ezgrades.dev
Password: TestPassword123!
```

**Staging:**
```
Email: staging@ezgrades.test
Password: StagingPass123!
```

### Mock Data

Tests use dynamic data generation:
```typescript
const TEST_USER = {
  name: 'Test User',
  email: `test-${Date.now()}@ezgrades.test`,
  password: 'TestPassword123!',
};
```

---

## Debugging Tests

### Visual Debugging
```bash
# Open Playwright Inspector
npx playwright test --debug

# Take screenshot at any point
await page.screenshot({ path: 'screenshot.png' });

# Record video
# (automatically enabled in config for failures)
```

### Console Logs
```typescript
// Capture console messages
page.on('console', msg => console.log(msg.text()));

// Capture network requests
page.on('request', request => console.log(request.url()));
page.on('response', response => console.log(response.status()));
```

### Trace Viewer
```bash
# Run with tracing
npx playwright test --trace on

# View trace
npx playwright show-trace trace.zip
```

---

## Performance Testing

### Lighthouse CI

```bash
# Install
npm install -g @lhci/cli

# Run audit
lhci autorun --collect.url=http://localhost:5173
```

### Custom Performance Tests
```typescript
test('should load dashboard quickly', async ({ page }) => {
  const startTime = Date.now();
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  const loadTime = Date.now() - startTime;
  
  expect(loadTime).toBeLessThan(3000); // Less than 3 seconds
});
```

---

## Load Testing

### K6 Example

Install k6 and create `load-test.js`:
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10,
  duration: '30s',
};

export default function () {
  const res = http.get('http://localhost:5173');
  check(res, { 'status was 200': (r) => r.status == 200 });
  sleep(1);
}
```

Run:
```bash
k6 run load-test.js
```

---

## Security Testing

### OWASP ZAP

1. Download [OWASP ZAP](https://www.zaproxy.org/)
2. Start application
3. Run automated scan against `http://localhost:5173`
4. Review security vulnerabilities

### Manual Security Checks

- [ ] XSS protection (sanitize user input)
- [ ] CSRF tokens (Supabase handles this)
- [ ] SQL injection (RLS policies prevent)
- [ ] Authentication bypass attempts
- [ ] Rate limiting works
- [ ] Sensitive data not in URLs
- [ ] HTTPS enforced in production
- [ ] Secure headers present

---

## Accessibility Testing

### Automated Testing

```bash
# Install axe
npm install -D @axe-core/playwright

# Run in test
import { injectAxe, checkA11y } from 'axe-playwright';

test('should have no accessibility violations', async ({ page }) => {
  await page.goto('/');
  await injectAxe(page);
  await checkA11y(page);
});
```

### Manual Testing

- [ ] Test with keyboard only
- [ ] Test with screen reader (NVDA/JAWS/VoiceOver)
- [ ] Check color contrast ratios
- [ ] Verify focus indicators
- [ ] Test with browser zoom at 200%

---

## Continuous Monitoring

### Production Monitoring

#### Sentry Integration
```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
});
```

#### Custom Error Tracking
See `/utils/errorTracking.ts` for built-in error tracking

#### Uptime Monitoring
- UptimeRobot
- Pingdom
- StatusPage.io

---

## Test Maintenance

### Regular Tasks

**Weekly:**
- [ ] Run full test suite
- [ ] Review failed tests
- [ ] Update snapshots if UI changed

**Monthly:**
- [ ] Update Playwright to latest
- [ ] Review test coverage
- [ ] Remove obsolete tests
- [ ] Add tests for new features

**Quarterly:**
- [ ] Performance baseline review
- [ ] Security audit
- [ ] Accessibility audit
- [ ] Load testing

---

## Troubleshooting

### Tests Timing Out
```typescript
// Increase timeout for specific test
test('slow operation', async ({ page }) => {
  test.setTimeout(60000); // 60 seconds
  // ... test code
});
```

### Flaky Tests
```typescript
// Add explicit waits
await page.waitForSelector('[data-testid="loaded"]');
await page.waitForLoadState('networkidle');

// Use retry logic
test('flaky test', async ({ page }) => {
  test.retries(2); // Retry up to 2 times
  // ... test code
});
```

### Browser Issues
```bash
# Reinstall browsers
npx playwright install --force

# Clear cache
rm -rf ~/.cache/ms-playwright
npx playwright install
```

---

## Resources

### Documentation
- [Playwright Docs](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)
- [Vitest](https://vitest.dev/)

### Best Practices
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Last Updated:** October 9, 2025
**Test Framework:** Playwright
**Coverage Goal:** >80%
**Status:** ✅ Testing Infrastructure Complete
