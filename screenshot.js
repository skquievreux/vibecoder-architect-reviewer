const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/maintenance');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'maintenance-screenshot.png', fullPage: true });
  await browser.close();
  console.log('Screenshot saved as maintenance-screenshot.png');
})();