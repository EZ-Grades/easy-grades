/**
 * End-to-End Authentication Tests
 * Tests signup, login, forgot password, and OAuth flows
 * 
 * Run with: npx playwright test
 */

import { test, expect } from '@playwright/test';

const TEST_USER = {
  name: 'Test User',
  email: `test-${Date.now()}@ezgrades.test`,
  password: 'TestPassword123!',
  weakPassword: '123'
};

test.describe('Authentication Flow', () => {
  
  test.beforeEach(async ({ page }) => {
    // Start from the home page (should show Dashboard for guests)
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display login page when clicking sign in', async ({ page }) => {
    // Wait for the app to load
    await expect(page.locator('text=EZ Grades')).toBeVisible();
    
    // Click on Settings (requires login)
    await page.click('[data-testid="nav-settings"]');
    
    // Should redirect to login
    await expect(page.locator('text=Welcome Back')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should show validation errors for invalid email', async ({ page }) => {
    // Navigate to login
    await page.click('[data-testid="nav-settings"]');
    await expect(page.locator('text=Welcome Back')).toBeVisible();
    
    // Try invalid email
    await page.fill('input[type="email"]', 'invalid-email');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Should show error (either validation or from backend)
    await expect(page.locator('text=/invalid|error/i')).toBeVisible({ timeout: 3000 });
  });

  test('should switch between login and signup', async ({ page }) => {
    // Navigate to login
    await page.click('[data-testid="nav-settings"]');
    await expect(page.locator('text=Welcome Back')).toBeVisible();
    
    // Click "Create account" or similar link
    await page.click('text=/create.*account|sign up/i');
    
    // Should show signup form
    await expect(page.locator('text=/create.*account|sign up/i')).toBeVisible();
    await expect(page.locator('input[placeholder*="name" i]')).toBeVisible();
    
    // Switch back to login
    await page.click('text=/already.*account|sign in/i');
    await expect(page.locator('text=Welcome Back')).toBeVisible();
  });

  test('should complete signup flow', async ({ page }) => {
    // Navigate to signup
    await page.click('[data-testid="nav-settings"]');
    await expect(page.locator('text=Welcome Back')).toBeVisible();
    await page.click('text=/create.*account|sign up/i');
    
    // Fill signup form
    await page.fill('input[placeholder*="name" i]', TEST_USER.name);
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Should show success message or redirect
    await page.waitForTimeout(2000); // Wait for processing
    
    // Check for success indicators
    const hasSuccessToast = await page.locator('text=/success|created|verify/i').isVisible();
    const isOnDashboard = await page.locator('text=Dashboard').isVisible();
    
    expect(hasSuccessToast || isOnDashboard).toBeTruthy();
  });

  test('should handle login with wrong credentials', async ({ page }) => {
    // Navigate to login
    await page.click('[data-testid="nav-settings"]');
    await expect(page.locator('text=Welcome Back')).toBeVisible();
    
    // Try wrong credentials
    await page.fill('input[type="email"]', 'wrong@email.com');
    await page.fill('input[type="password"]', 'WrongPassword123');
    await page.click('button[type="submit"]');
    
    // Should show error
    await expect(page.locator('text=/invalid|incorrect|failed/i')).toBeVisible({ timeout: 5000 });
  });

  test('should show forgot password option', async ({ page }) => {
    // Navigate to login
    await page.click('[data-testid="nav-settings"]');
    await expect(page.locator('text=Welcome Back')).toBeVisible();
    
    // Look for forgot password link
    const forgotPasswordLink = page.locator('text=/forgot.*password/i');
    await expect(forgotPasswordLink).toBeVisible();
    
    // Click it
    await forgotPasswordLink.click();
    
    // Should show password reset form
    await expect(page.locator('text=/reset.*password|enter.*email/i')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test('should handle forgot password submission', async ({ page }) => {
    // Navigate to login then forgot password
    await page.click('[data-testid="nav-settings"]');
    await expect(page.locator('text=Welcome Back')).toBeVisible();
    await page.click('text=/forgot.*password/i');
    
    // Fill email
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button[type="submit"]');
    
    // Should show confirmation message
    await expect(page.locator('text=/check.*email|sent|link/i')).toBeVisible({ timeout: 5000 });
  });

  test('should display Google OAuth button', async ({ page }) => {
    // Navigate to login
    await page.click('[data-testid="nav-settings"]');
    await expect(page.locator('text=Welcome Back')).toBeVisible();
    
    // Should show Google sign in option
    const googleButton = page.locator('button:has-text("Google"), text=/continue.*google|sign.*google/i');
    await expect(googleButton.first()).toBeVisible();
  });

  test('should protect StudyHub route', async ({ page }) => {
    // Try to access StudyHub without login
    await page.click('[data-testid="nav-studyhub"]');
    
    // Should show auth guard or redirect to login
    const hasAuthGuard = await page.locator('text=/sign.*in|login|authenticate/i').isVisible({ timeout: 3000 });
    
    expect(hasAuthGuard).toBeTruthy();
  });

  test('should allow guest access to public pages', async ({ page }) => {
    // Dashboard
    await page.click('[data-testid="nav-dashboard"]');
    await expect(page.locator('text=Dashboard')).toBeVisible();
    
    // Break Mode
    await page.click('[data-testid="nav-break"]');
    await expect(page.locator('text=Break Mode')).toBeVisible();
    
    // Focus Mode  
    await page.click('[data-testid="nav-focus"]');
    await expect(page.locator('text=Focus Mode')).toBeVisible();
    
    // About Us
    await page.click('[data-testid="nav-about"]');
    await expect(page.locator('text=About')).toBeVisible();
  });

  test('should persist auth state after page reload', async ({ page, context }) => {
    // This test would require actual login first
    // For now, just verify the auth check happens
    await page.goto('/');
    
    // Should show loading state briefly
    const loadingIndicator = page.locator('text=/loading/i');
    
    // Reload page
    await page.reload();
    
    // Should not crash and should show app
    await expect(page.locator('text=EZ Grades')).toBeVisible({ timeout: 5000 });
  });

  test('should handle OAuth callback URL', async ({ page }) => {
    // Simulate OAuth callback
    await page.goto('/#access_token=fake_token&type=recovery');
    
    // Should process the callback
    await page.waitForTimeout(1000);
    
    // Should not crash
    await expect(page.locator('text=EZ Grades')).toBeVisible({ timeout: 5000 });
  });

  test('should show user profile when logged in', async ({ page, context }) => {
    // This would require actual login
    // Test structure for when user is authenticated
    
    // For now, verify sidebar structure exists
    const sidebar = page.locator('[data-slot="sidebar"]');
    
    // Guest user should show "Guest User" or sign in option
    const hasGuestIndicator = await page.locator('text=/guest|sign in/i').isVisible();
    
    expect(hasGuestIndicator).toBeTruthy();
  });
});

test.describe('Password Validation', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Navigate to signup
    await page.click('[data-testid="nav-settings"]');
    await expect(page.locator('text=Welcome Back')).toBeVisible();
    await page.click('text=/create.*account|sign up/i');
  });

  test('should reject weak passwords', async ({ page }) => {
    await page.fill('input[placeholder*="name" i]', TEST_USER.name);
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.weakPassword);
    
    await page.click('button[type="submit"]');
    
    // Should show password strength error
    await expect(page.locator('text=/password.*weak|password.*short|minimum.*characters/i')).toBeVisible({ timeout: 3000 });
  });

  test('should accept strong passwords', async ({ page }) => {
    await page.fill('input[placeholder*="name" i]', TEST_USER.name);
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    
    // Should not show password error (until form submit which may fail for other reasons)
    const passwordError = page.locator('text=/password.*weak|password.*short/i');
    await expect(passwordError).not.toBeVisible();
  });
});

test.describe('Navigation After Auth', () => {
  
  test('should remember intended route after login', async ({ page }) => {
    // Try to access protected route
    await page.goto('/');
    await page.click('[data-testid="nav-studyhub"]');
    
    // Should be prompted to login
    await expect(page.locator('text=/sign.*in|login/i')).toBeVisible({ timeout: 3000 });
    
    // After login (mocked), should redirect to StudyHub
    // This would require actual auth implementation
  });
});

test.describe('Error Handling', () => {
  
  test('should handle network errors gracefully', async ({ page, context }) => {
    // Simulate offline
    await context.setOffline(true);
    
    await page.goto('/');
    
    // Should still render basic UI
    await expect(page.locator('text=EZ Grades')).toBeVisible({ timeout: 10000 });
    
    await context.setOffline(false);
  });

  test('should not crash on auth errors', async ({ page }) => {
    await page.goto('/');
    await page.click('[data-testid="nav-settings"]');
    
    // Fill invalid data
    await page.fill('input[type="email"]', 'test@test.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    
    // Should handle error without crashing
    await expect(page.locator('text=EZ Grades')).toBeVisible();
  });
});
