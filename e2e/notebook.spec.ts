import { test, expect } from '@playwright/test';

test('the new-notebook form validates via Zod and rejects an empty name', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Notebook' }).click();
  await page.getByRole('button', { name: 'New folder or notebook' }).click();
  await expect(page.getByText('New Folder or Notebook', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Create' }).click();
  await expect(page.getByText('Name is required')).toBeVisible();
});

test('creating a notebook and a note, then editing content updates the preview and highlights #action', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Notebook' }).click();

  await page.getByRole('button', { name: 'New folder or notebook' }).click();
  await page.getByPlaceholder('e.g. Investor Updates').fill('Investor Updates');
  await page.getByRole('button', { name: 'Create' }).click();
  await expect(page.getByText('Investor Updates')).toBeVisible();

  await page.getByText('Investor Updates').click();
  await page.getByRole('button', { name: 'New note' }).click();
  await expect(page.getByRole('textbox', { name: 'Note title' })).toHaveValue('Untitled Note');

  const editorTextarea = page.getByRole('textbox', { name: 'Note content (Markdown)' });
  await editorTextarea.fill('# Investor Updates\n\n#action Send the Q3 deck to the board\n');

  const preview = page.locator('.note-preview');
  await expect(preview.getByText('Send the Q3 deck to the board')).toBeVisible();
  await expect(preview.locator('.action-tag')).toBeVisible();
});

test('closing a tab removes it from the TabStrip', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Notebook' }).click();

  await page.getByText('Daily Journal').click();
  await page.keyboard.press('ArrowRight');
  await page.getByText('Monday check-in').click();
  await expect(page.getByRole('textbox', { name: 'Note title' })).toHaveValue('Monday check-in');

  await page.getByRole('button', { name: 'Close Monday check-in' }).click();
  await expect(page.getByText('No notes open')).toBeVisible();
});
