import { test, expect } from '@playwright/test';

test.describe('Post Edit Page', () => {
  const POST_ID = 1;

  test('should load data and show success toast on update', async ({ page }) => {
    // 1. MOCK DATA
    const mockPost = { id: POST_ID, title: 'Original Title', body: 'Original Body' };

    // Intercept GET and PUT
    await page.route(`**/posts/${POST_ID}`, async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({ status: 200, body: JSON.stringify(mockPost) });
      } else if (route.request().method() === 'PUT') {
        await route.fulfill({ status: 200, body: JSON.stringify({ success: true }) });
      }
    });

    // 2. NAVIGATE
    await page.goto(`/post/${POST_ID}/edit`);

    // 3. EDIT THE FORM
    const titleInput = page.locator('#title');
    await expect(titleInput).toHaveValue('Original Title');
    
    // We must fill() to make the form "dirty" so the button enables
    await titleInput.fill('Updated Title via Playwright');

    // 4. SUBMIT
    await page.getByRole('button', { name: 'Update Post' }).click();

    // 5. VERIFY TOAST (Using your specific HTML structure)
    const toast = page.locator('[data-test="toast-notification"]');
    
    // Verify visibility and the specific message span
    await expect(toast).toBeVisible();
    await expect(toast.locator('.message')).toHaveText('Post updated successfully');
    
    // Verify toast has the 'success' class (assuming toast.type maps to CSS class)
    await expect(toast).toHaveClass(/success/);

    // 6. REDIRECT
    await expect(page).toHaveURL(/.*post\/index/);
  });

  test('should allow closing the toast manually', async ({ page }) => {
    // 1. Setup: Trigger the toast (via update or direct action)
    await page.goto('/post/1/edit');
    await page.locator('#title').fill('Updated Title');
    await page.getByRole('button', { name: 'Update Post' }).click();

    // 2. Identify the toast
    const toast = page.locator('[data-test="toast-notification"]');
    await expect(toast).toBeVisible();

    // 3. THE CRITICAL CHANGE: 
    // Before, this line failed because <main> was "in the way".
    // Now, it should click successfully because <app-toast> is 
    // outside the <router-outlet> and has a proper z-index.
    await toast.locator('.close-btn').click();

    // 4. Verify the toast is gone
    await expect(toast).not.toBeVisible();
  });

  test('should automatically disappear after 5 seconds', async ({ page }) => {
    // 1. Trigger the toast
    await page.goto('/post/1/edit');
    await page.locator('#title').fill('Auto-dismiss test');
    await page.getByRole('button', { name: 'Update Post' }).click();

    const toast = page.locator('[data-test="toast-notification"]');
    
    // 2. Verify it appears initially
    await expect(toast).toBeVisible();

    // 3. Wait for it to disappear 
    // We increase the timeout for this specific assertion to 6 seconds
    // to account for a 5-second timer + animation time.
    await expect(toast).not.toBeVisible({ timeout: 6000 });
  });
});