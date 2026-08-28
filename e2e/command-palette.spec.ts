import { test, expect } from '@playwright/test';

const PLACEHOLDER = 'Jump to an area, a note, or run a command…';

test('Ctrl+K opens the command palette with Navigate, Notes, and Actions groups', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Control+k');
  await expect(page.getByPlaceholder(PLACEHOLDER)).toBeVisible();
  await expect(page.getByText('Navigate', { exact: true })).toBeVisible();
  await expect(page.getByText('Notes', { exact: true })).toBeVisible();
  await expect(page.getByText('Actions', { exact: true })).toBeVisible();
});

test('selecting "Ledger" from the command palette navigates and closes it', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Control+k');
  await page.getByRole('option', { name: /Ledger/ }).click();
  await expect(page.getByPlaceholder(PLACEHOLDER)).not.toBeVisible();
  await expect(page.getByText('💳 Ledger')).toBeVisible();
});

test('selecting a note from the command palette jumps straight into the Notebook area', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Control+k');
  await page.getByRole('option', { name: /Monday check-in/ }).click();
  await expect(page.getByRole('textbox', { name: 'Note title' })).toHaveValue('Monday check-in');
});

test('Escape closes the command palette', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Control+k');
  await expect(page.getByPlaceholder(PLACEHOLDER)).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByPlaceholder(PLACEHOLDER)).not.toBeVisible();
});
