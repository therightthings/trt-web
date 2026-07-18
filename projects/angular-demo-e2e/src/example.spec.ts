import { expect, test } from '@playwright/test';

test('renders the angular demo shell and default route', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText('@trt-web/angular')).toBeVisible();
  await expect(
    page.getByRole('heading', { level: 3, name: 'Autocomplete built on Angular Aria' }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Components' })).toBeVisible();
});
