import { expect, test } from '@playwright/test';
import path from 'node:path';

test.describe('react-upload-pro demo', () => {
  test('renders the demo page', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /react-upload-pro/i })).toBeVisible();
  });

  test('accepts a file via the hidden input', async ({ page }) => {
    await page.goto('/');
    const input = page.locator('input[type="file"]').first();
    const fixture = path.join(__dirname, '../fixtures/sample.txt');
    await input.setInputFiles(fixture);
    await expect(page.getByText('sample.txt')).toBeVisible();
  });
});
