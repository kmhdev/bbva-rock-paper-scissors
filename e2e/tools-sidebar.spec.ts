import { devices, expect, test } from '@playwright/test';

// El botón y el sidebar son solo-mobile: emular UA móvil.
test.use({ ...devices['Pixel 5'] });

test('tools button opens sidebar and navigates', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Piedra, papel o tijera')).toBeVisible();

  const menuButton = page.getByRole('button', { name: 'Abrir menú' });
  await expect(menuButton).toBeVisible();
  // El glifo debe usar la familia registrada por @expo/vector-icons, no tofu.
  await expect
    .poll(async () => {
      const family = await menuButton.evaluate((el) => {
        const glyph = Array.from(el.querySelectorAll('span, div')).find((node) =>
          (node.textContent ?? '').trim(),
        );
        return glyph ? getComputedStyle(glyph).fontFamily : '';
      });
      return family;
    })
    .toMatch(/material-community/i);
  const box = await menuButton.boundingBox();
  expect(box).toBeTruthy();
  const viewport = page.viewportSize();
  expect(box!.x + box!.width).toBeGreaterThan(viewport!.width - 100);
  expect(box!.y + box!.height).toBeGreaterThan(viewport!.height - 120);
  await page.screenshot({ path: 'test-results/tools-button.png' });

  await menuButton.click();
  const panel = page.getByTestId('sidebar-panel');
  await expect(panel.getByRole('button', { name: 'Ranking', exact: true })).toBeVisible();
  // Asentar la animación de apertura (350ms) antes de capturar.
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'test-results/sidebar-open.png' });

  await panel.getByRole('button', { name: 'Ranking', exact: true }).click();
  await expect(page.getByTestId('ranking-title')).toBeVisible();
});

test('sidebar theme toggle persists', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Piedra, papel o tijera')).toBeVisible();

  await page.getByRole('button', { name: 'Abrir menú' }).click();
  const panel = page.getByTestId('sidebar-panel');
  await expect(panel.getByRole('button', { name: 'Cambiar tema' })).toBeVisible();
  await panel.getByRole('button', { name: 'Cambiar tema' }).click();

  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('@bbva-rps:theme')))
    .toBe('light');
});
