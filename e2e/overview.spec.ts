import { test, expect } from '@playwright/test';

test('the app shell loads with KPI cards and action items', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText("Founder's Desk")).toBeVisible();
  await expect(page.getByRole('heading', { name: '🏢 Overview' })).toBeVisible();

  for (const label of ["This Month's Spend", 'Budget Remaining', 'Open Action Items', 'Pending Reimbursement']) {
    await expect(page.getByText(label, { exact: true })).toBeVisible();
  }

  await expect(page.getByText('Follow up with legal on the Acme-Vendor NDA by Friday')).toBeVisible();
});

test('clicking an action item jumps to the Notebook area and opens its source note', async ({ page }) => {
  await page.goto('/');
  await page.getByText('Follow up with legal on the Acme-Vendor NDA by Friday').click();

  await expect(page.getByText('📓 Notebook')).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Note title' })).toHaveValue('Monday check-in');
});
