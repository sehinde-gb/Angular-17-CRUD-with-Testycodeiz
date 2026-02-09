import { test, expect } from '@playwright/test';


test.describe('Post List and Deletion', () => {
  const mockPosts = [
    { id: 1, title: 'First Post', body: 'Content 1' },
    { id: 2, title: 'Second Post', body: 'Content 2' }
  ];

  test('should display posts and delete one successfully', async ({ page }) => {
    // 1. MOCK THE API CALLS
    // CHANGE: Added extra asterisks to make the URL pattern catch everything
    await page.route('**/posts**', async (route) => { 
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockPosts)
        });
      } else {
        await route.continue();
      }
    });

    // Mock the DELETE request for ID 1
    await page.route('**/posts/1', async (route) => {
      if (route.request().method() === 'DELETE') {
        await route.fulfill({ status: 200 });
      } else {
        await route.continue();
      }
    });

    // 2. NAVIGATE TO INDEX (The rest of your code is perfect)
    await page.goto('/post/index');

    // 3. VERIFY INITIAL TABLE LOAD
    const rows = page.locator('table tbody tr');
    await expect(rows).toHaveCount(2); // This should now pass!
    await expect(page.getByText('First Post')).toBeVisible();

    // 4. PREPARE DIALOG HANDLER
    page.on('dialog', async (dialog) => {
      await dialog.accept(); 
    });

    // 5. TRIGGER DELETE
    const firstPostRow = page.locator('tr', { hasText: 'First Post' });
    await firstPostRow.getByRole('button', { name: 'Delete' }).click();

    // 6. VERIFY UI UPDATES
    await expect(page.getByText('First Post')).not.toBeVisible();
    await expect(rows).toHaveCount(1);
  });
});