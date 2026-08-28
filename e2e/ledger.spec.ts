import { test, expect } from '@playwright/test';

test('the new-transaction form validates via Zod and requires a category', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Ledger' }).click();
  await page.getByRole('button', { name: 'Add transaction' }).click();
  await expect(page.getByText('Add a Transaction', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: /^Add Transaction$/ }).click();
  await expect(page.getByText('Select a category', { exact: true })).toBeVisible();
});

test('adding a transaction shows it in the ledger table', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Ledger' }).click();
  await page.getByRole('button', { name: 'Add transaction' }).click();

  await page.getByText('Select a category...').click();
  await page.getByRole('option', { name: 'Travel' }).click();
  await page.getByPlaceholder('0.00').fill('123.45');
  await page.getByPlaceholder('e.g. Client dinner').fill('E2E test expense');
  await page.getByRole('button', { name: /^Add Transaction$/ }).click();

  await expect(page.getByText('Add a Transaction')).not.toBeVisible();
  await expect(page.getByText('E2E test expense')).toBeVisible();
  await expect(page.getByText('$123.45')).toBeVisible();
});

test('marking a reimbursable transaction as reimbursed updates its badge', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Ledger' }).click();

  const row = page.getByRole('row', { name: /Hotel — one night, board meeting/ });
  await expect(row.getByText('Reimbursable')).toBeVisible();
  await row.getByRole('button', { name: 'Mark reimbursed' }).click();
  await expect(row.getByText('Reimbursed')).toBeVisible();
});
