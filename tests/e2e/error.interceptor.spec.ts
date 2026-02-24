import { test, expect } from '@playwright/test';

test.describe('Error Interceptor Tests', () => {
  
  test('should retry twice and then show error UI on 500 error', async ({ page }) => {
    let requestCount = 0;

    // Diagnostic Listeners
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('request', req => console.log('NETWORK CALL:', req.url()));

    // 1. Updated Route: Matching your exact '/post/index' logic
    await page.route('**/jsonplaceholder.typicode.com/**', async (route) => {
      requestCount++;
      console.log(`✅ Interceptor triggered: Attempt ${requestCount}`);
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Internal Server Error' }),
      });
    });

    // 2. Navigate: Matching your Routes file exactly
    await page.goto('/post/index', { waitUntil: 'commit' });

    // 3. Locators
    const toast = page.locator('[data-test="toast-notification"]');
    const errorContainer = page.locator('[data-test="error-state-container"]');  

    // 4. Assertion: Waiting for the Toast to appear after retries
    // We use 15s to be safe for the 3-attempt cycle + bootstrap
    await expect(toast).toBeVisible({ timeout: 15000 });
    await expect(toast).toContainText('Internal Server Error');

    // 5. Final check on Logic
    expect(requestCount).toBe(3);
    await expect(errorContainer).toBeVisible();
  });

  test('should redirect and show toast on 401 Unauthorized', async ({ page }) => {
    // 1. UPDATE URL: Match JSONPlaceholder
    await page.route('**/jsonplaceholder.typicode.com/**', async (route) => {
      // We fulfill with 401 to trigger the Interceptor's 'Unauthorized' logic
      await route.fulfill({ 
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Session expired' }) 
      });
    });

    // 2. Trigger the call
    await page.goto('/post/index');

    // 3. Wait for the redirect (if your interceptor does this)
    // Note: Ensure your interceptor actually calls router.navigate
    await page.waitForURL('**/post/index'); 

    // 4. Verify Toast
    const toast = page.locator('[data-test="toast-notification"]');
    
    // Increase timeout slightly in case the redirect takes a moment
    await expect(toast).toBeVisible({ timeout: 7000 });
    await expect(toast).toContainText('Session expired');
  });

  test('should show forbidden toast on 403 error', async ({ page }) => {
    const errorMessage = 'You do not have permission to access this page';

    // 1. Mock the 401 response
    await page.route('**/jsonplaceholder.typicode.com/**', async (route) => {
      await route.fulfill({ 
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({ message: errorMessage }) 
      });
    });

    // 2. Trigger the call by navigating
    await page.goto('/post/index');

    // 3. Locate the toast
    const toast = page.locator('[data-test="toast-notification"]');

    // 4. Assert
    await expect(toast).toBeVisible();
    
    // Note: Match this text to whatever your interceptor actually displays for 403
    await expect(toast).toContainText(errorMessage);
  });


  test('should NOT show error UI on 200 OK success', async ({ page }) => {
    // 1. CATCH-ALL URL: Use a regex to ensure we catch the call regardless of slashes
    await page.route(/.*jsonplaceholder\.typicode\.com\/posts.*/, async (route) => {
      console.log('✅ Success Mock Triggered!');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 1, title: 'Playwright Test Post', body: 'Learning selectors' }
        ]),
      });
    });

    await page.goto('/post/index', { waitUntil: 'networkidle' });

    // 2. CHECK FOR DATA: Use a more flexible text match
    const tableData = page.getByText('Playwright Test Post', { exact: false });
    
    // 3. DIAGNOSTIC: If it fails, check if the "Empty" message is what's visible instead
    const emptyMessage = page.getByText('No posts found');
    
    if (await emptyMessage.isVisible()) {
      console.error('❌ TABLE IS EMPTY: The mock data was not loaded by the component.');
    }

    await expect(tableData).toBeVisible({ timeout: 10000 });

    // 4. VERIFY NO TOAST
    const toast = page.locator('[data-test="toast-notification"]');
    await expect(toast).not.toBeAttached(); // .not.toBeAttached is stricter than .not.toBeVisible
  });

  test('should show not found toast on 404 error and not retry', async ({ page }) => {
    let requestCount = 0;

    await page.route(/.*jsonplaceholder\.typicode\.com\/posts.*/, async (route) => {
      requestCount++;
      await route.fulfill({ 
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'The requested post does not exist' }) 
      });
    });

    await page.goto('/post/index');

    // 1. WAIT FOR THE TOAST FIRST (This confirms the Interceptor has run)
    const toast = page.locator('[data-test="toast-notification"]');
    await expect(toast).toBeVisible({ timeout: 10000 });
    await expect(toast).toContainText('The requested post does not exist');

 
    // 2. NOW CHECK THE ERROR MESSAGE
    const errorMessage = page.getByText("We couldn't load the posts", { exact: false });
    await expect(errorMessage).toBeVisible();

    // 3. Verify exactly 1 request (No retries for 404)
    expect(requestCount).toBe(1);
  });
});