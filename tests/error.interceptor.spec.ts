import { test, expect } from '@playwright/test';

test.describe('Error Interceptor Tests', () => {
  
  test('should retry twice and then show error UI on 500 error', async ({ page }) => {
    let requestCount = 0;

    // --- PLACE LISTENERS HERE ---
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('request', req => console.log('NETWORK CALL:', req.url()));

    // 1. Intercept the API call and force a 500 error ACT
    await page.route('**/api/posts', async (route) => {
      requestCount++;
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Internal Server Error' }),
      });
    });

    // 2. NAVIGATE (The trigger) ARRANGE
    // Ensure this matches the route defined in your App Routing
    await page.goto('/post/index');

    // 3. THE WATER TIGHT ASSERTION
    // We wait for the UI (Toast) FIRST. This gives the retries time to happen.
      //const toast = page.locator('.app-toast.error'); // Adjust selector to your Toast HTML
      // was '.toast-box'
    const toast = page.locator('[data-test="toast-notification"]');
    const errorContainer = page.locator('[data-test="error-state-container"]');  

    // Increase timeout to 10s because: 1s (try 1) + 1s (retry 1) + 1s (retry 2) = ~3s+
    await expect(toast).toBeVisible({ timeout: 10000 });
    await expect(toast).toHaveClass(/error/); // Verify it has the error class
    await expect(toast).toContainText('Cannot connect to the server');

    // STEP 4: VERIFY THE COUNT (Now it will be 3)
    expect(requestCount).toBe(3);

    // STEP 5: CHECK COMPONENT UI
    const pageError = page.locator('.error-state'); 
    await expect(pageError).toBeVisible();
  });

  test('should redirect and show toast on 401 Unauthorized', async ({ page }) => {
    // 1. Mock a 401 response ACT
    await page.route('**/api/posts', async (route) => {
      await route.fulfill({ status: 401 });
    });

    // 2. Navigate
    await page.goto('/post/index');

    // 3. Wait for the URL to change (Intercepting the redirect)
    await page.waitForURL('**/posts/index');
    await expect(page).toHaveURL(/\/post\/index/);

    // 4. Verify Toast
    await expect(page.locator('.toast-box')).toContainText('Session expired');
  });
});