import { expect, test } from '@playwright/test';

test('registers, plays a round and exits', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Piedra, papel o tijera')).toBeVisible();

  await page.getByPlaceholder('Tu nombre').fill('E2E');
  await page.getByRole('button', { name: 'Empezar a jugar' }).click();
  await expect(page.getByText('Hola, E2E')).toBeVisible();

  await page.getByRole('button', { name: 'Elegir piedra' }).click();
  await expect(page.getByText('La máquina está pensando…')).toBeVisible();
  await expect(page.getByText(/Máquina:/)).toBeVisible({ timeout: 10000 });
  const outcome = await page.getByText(/¡Has ganado!|Has perdido|Empate/).textContent();
  expect(outcome).toBeTruthy();

  await page.getByRole('button', { name: 'Salir del juego' }).click();
  await expect(page.getByText('Piedra, papel o tijera')).toBeVisible();
});

test('ranking loads from home', async ({ page }) => {
  await page.goto('/');
  await page.getByText('Ver ranking').click();
  await expect(page.getByText('Ranking', { exact: true })).toBeVisible();
});
