import { test, expect } from '@playwright/test';

test.describe('Public Post Flow', () => {

  // This runs BEFORE every test in this block
  test.beforeEach(async ({ page }) => {
   // Fake This wildcard '**' means "anything before" and '*' means "anything after"
    await page.route('**/*posts*', async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ id: 101, title: 'Mocked Post' }),
      });
    });

    // Navigate to the site
    await page.goto('http://localhost:4200/post/create', { waitUntil: 'networkidle' });
  });

  test('should successfully create a post', async ({ page }) => {
    // We don't need goto or page.route here anymore! 
    // The beforeEach already did it.

    await page.locator('#title').fill('A Sufficiently Long Title');
    await page.locator('#body').fill('Some descriptive body text.');
    
    // Trigger Angular logic
    await page.locator('#title').blur();

    await page.click('button[type="submit"]');

    // Assertions
    await expect(page.getByText(/post created successfully/i)).toBeVisible();
    await expect(page).toHaveURL(/.*post\/index/);
  });

  test('should keep button disabled if form is invalid', async ({ page }) => {
    // Fill only the title, leaving body empty
    await page.locator('#title').fill('Short');
    await page.locator('#title').blur();

    const submitBtn = page.locator('button[type="submit"]');
    
    // Assert the button is disabled because the form is invalid
    await expect(submitBtn).toBeDisabled();
  });

});