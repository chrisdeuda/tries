import { expect, test } from '@playwright/test';

test('todo MVP supports empty, add, toggle, delete, and persistence', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();

  await expect(page.getByText('Your list is empty.')).toBeVisible();

  await page.getByRole('button', { name: 'Add task' }).click();
  await page.getByPlaceholder('Add a task...').fill('   ');
  await page.getByRole('button', { name: 'Add task' }).click();
  await expect(page.getByRole('listitem')).toHaveCount(0);
  await expect(page.getByText('Your list is empty.')).toBeVisible();

  await page.getByPlaceholder('Add a task...').fill('Buy milk');
  await page.getByRole('button', { name: 'Add task' }).click();
  await page.getByPlaceholder('Add a task...').fill('Walk dog');
  await page.getByRole('button', { name: 'Add task' }).click();

  await expect(page.getByText('Your list is empty.')).toBeHidden();
  await expect(page.getByRole('listitem')).toHaveCount(2);
  await expect(page.getByText('Buy milk')).toBeVisible();
  await expect(page.getByText('Walk dog')).toBeVisible();

  const buyMilk = page.getByRole('checkbox', { name: 'Mark Buy milk as complete' });
  await expect(buyMilk).not.toBeChecked();
  await buyMilk.check();
  await expect(page.getByRole('checkbox', { name: 'Mark Buy milk as incomplete' })).toBeChecked();
  await expect(page.getByText('1 of 2 tasks remaining.')).toBeVisible();

  await page.getByRole('checkbox', { name: 'Mark Buy milk as incomplete' }).uncheck();
  await expect(page.getByRole('checkbox', { name: 'Mark Buy milk as complete' })).not.toBeChecked();
  await expect(page.getByText('2 of 2 tasks remaining.')).toBeVisible();

  await page.getByRole('button', { name: 'Delete Buy milk' }).click();
  await expect(page.getByRole('listitem')).toHaveCount(1);
  await expect(page.getByText('Walk dog')).toBeVisible();

  await page.getByRole('button', { name: 'Delete Walk dog' }).click();
  await expect(page.getByRole('listitem')).toHaveCount(0);
  await expect(page.getByText('Your list is empty.')).toBeVisible();

  await page.getByPlaceholder('Add a task...').fill('Persist this task');
  await page.getByRole('button', { name: 'Add task' }).click();
  await page.getByRole('checkbox', { name: 'Mark Persist this task as complete' }).check();
  await page.reload();

  await expect(page.getByText('Persist this task')).toBeVisible();
  await expect(page.getByRole('checkbox', { name: 'Mark Persist this task as incomplete' })).toBeChecked();
  await expect(page.getByText('0 of 1 task remaining.')).toBeVisible();

  await page.getByRole('button', { name: 'Delete Persist this task' }).click();
  await expect(page.getByText('Your list is empty.')).toBeVisible();
});
