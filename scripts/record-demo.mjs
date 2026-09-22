import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendRequire = createRequire(path.join(__dirname, '../frontend/package.json'));
const { chromium } = frontendRequire('playwright');

const rootDir = path.resolve(__dirname, '..');
const recordingsDir = path.join(rootDir, 'recordings');

if (!fs.existsSync(recordingsDir)) {
  fs.mkdirSync(recordingsDir, { recursive: true });
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log('🚀 Launching Playwright browser to record WORKNOON Refund System flows...');

  const browser = await chromium.launch({
    headless: true, // run headless inside automation
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: {
      dir: recordingsDir,
      size: { width: 1280, height: 720 },
    },
  });

  const page = await context.newPage();

  try {
    // -------------------------------------------------------------------------
    // FLOW 1: Landing Page
    // -------------------------------------------------------------------------
    console.log('📍 [Flow 1] Navigating to Home Page (http://localhost:3000)...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await sleep(2000);

    // Smooth scroll down to highlight features
    await page.evaluate(() => window.scrollBy({ top: 400, behavior: 'smooth' }));
    await sleep(1500);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await sleep(1500);

    // -------------------------------------------------------------------------
    // FLOW 2: Customer Refund Request Flow
    // -------------------------------------------------------------------------
    console.log('📍 [Flow 2] Navigating to Customer Refund Request (/request)...');
    await page.goto('http://localhost:3000/request', { waitUntil: 'networkidle' });
    await sleep(1500);

    // Step 1: Select Customer
    console.log('  -> Selecting Customer...');
    const selectCustomer = page.locator('select.demo-select');
    await selectCustomer.waitFor({ state: 'visible' });
    await selectCustomer.selectOption({ index: 1 }); // Select first customer (e.g. Sarah Chen or Tom Bradley)
    await sleep(1500);

    // Step 2: Select Order
    console.log('  -> Selecting Order...');
    const orderCard = page.locator('button.demo-list-item').first();
    await orderCard.waitFor({ state: 'visible', timeout: 10000 });
    await orderCard.click();
    await sleep(1500);

    // Step 3: Describe the issue
    console.log('  -> Typing issue description...');
    const textarea = page.locator('textarea.demo-textarea');
    await textarea.waitFor({ state: 'visible', timeout: 5000 });
    const messageText =
      'The earbuds stopped producing sound in the right ear after 10 days of normal use. Requesting a replacement or refund.';
    for (const char of messageText) {
      await textarea.type(char, { delay: 20 });
    }
    await sleep(1000);

    // Submit the refund request
    console.log('  -> Submitting Refund Request...');
    const submitBtn = page.locator('button:has-text("Submit Refund Request")');
    await submitBtn.waitFor({ state: 'visible', timeout: 5000 });
    await submitBtn.click();
    console.log('  -> Awaiting AI evaluation from Google Gemini...');

    // Wait for AI decision card (Submit Another Request button)
    const resetBtn = page.locator('button:has-text("Submit Another Request")');
    await resetBtn.waitFor({ state: 'visible', timeout: 35000 });
    console.log('  -> AI Decision card received! Displaying evaluation details...');
    await sleep(3500); // Give viewer time to inspect the AI reasoning card

    // -------------------------------------------------------------------------
    // FLOW 3: Support Admin Portal
    // -------------------------------------------------------------------------
    console.log('📍 [Flow 3] Navigating to Admin Dashboard (/admin)...');
    await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle' });
    await sleep(2000);

    // Filter by Escalated
    console.log('  -> Filtering by Escalated status...');
    const escalatedPill = page.locator('button.demo-pill:has-text("Escalated")');
    if (await escalatedPill.isVisible()) {
      await escalatedPill.click();
      await sleep(1500);
    }

    // Filter by Approved
    console.log('  -> Filtering by Approved status...');
    const approvedPill = page.locator('button.demo-pill:has-text("Approved")');
    if (await approvedPill.isVisible()) {
      await approvedPill.click();
      await sleep(1500);
    }

    // Filter by All
    console.log('  -> Resetting filter to All...');
    const allPill = page.locator('button.demo-pill:has-text("All")');
    if (await allPill.isVisible()) {
      await allPill.click();
      await sleep(1500);
    }

    // Expand first table row to show audit breakdown
    console.log('  -> Expanding request details for audit inspection...');
    const tableRows = page.locator('tr.cursor-pointer, tbody tr');
    if ((await tableRows.count()) > 0) {
      await tableRows.first().click();
      await sleep(2500);
    }

    // Use search filter
    console.log('  -> Testing Search Filter...');
    const searchInput = page.locator('input.demo-input');
    if (await searchInput.isVisible()) {
      await searchInput.type('Sarah', { delay: 100 });
      await sleep(2000);
      await searchInput.fill('');
      await sleep(1500);
    }

    // -------------------------------------------------------------------------
    // FLOW 4: Theme Toggle & Finish
    // -------------------------------------------------------------------------
    console.log('📍 [Flow 4] Demonstrating Theme Toggle...');
    const themeToggle = page.locator('button[aria-label*="theme" i], button:has(svg)').first();
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
      await sleep(1500);
      await themeToggle.click();
      await sleep(1500);
    }

    console.log('📍 Navigating back to Home Page...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await sleep(2000);

    console.log('✅ Flow walkthrough completed successfully.');
  } catch (err) {
    console.error('Error during recording:', err);
  } finally {
    const video = page.video();
    await page.close();
    await context.close();
    await browser.close();

    if (video) {
      const videoPath = await video.path();
      const targetPath = path.join(recordingsDir, 'worknoon-refund-flows.webm');
      try {
        fs.copyFileSync(videoPath, targetPath);
        console.log(`🎬 Video saved to disk at: ${targetPath}`);
      } catch (e) {
        console.log(`🎬 Video recorded at: ${videoPath}`);
      }
    }
  }
}

main().catch(console.error);
