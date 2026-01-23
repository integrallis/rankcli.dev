import { test, expect, Page } from '@playwright/test';

test.describe('Delete Audit UI Test', () => {
  test.beforeEach(async ({ page }) => {
    // Capture all console messages
    page.on('console', (msg) => {
      const type = msg.type();
      const text = msg.text();
      if (type === 'error' || type === 'warn' || text.includes('Delete')) {
        console.log(`[${type.toUpperCase()}] ${text}`);
      }
    });

    // Capture network errors
    page.on('requestfailed', (request) => {
      console.log(`[NETWORK FAILED] ${request.method()} ${request.url()}`);
    });

    // Log all API responses
    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('supabase') && url.includes('audits')) {
        console.log(`[API] ${response.request().method()} ${url} -> ${response.status()}`);
        if (response.status() >= 400) {
          try {
            const body = await response.text();
            console.log(`[API BODY] ${body}`);
          } catch {}
        }
      }
    });
  });

  test('check if audit history renders and delete button is clickable', async ({ page }) => {
    // Go to a project page directly (using known project ID from earlier test)
    const projectId = 'fb8e4dc3-ff37-4f7b-b7fe-4bbb6b367e08';

    await page.goto(`/dashboard/projects/${projectId}`);
    await page.waitForTimeout(3000);

    // Take screenshot
    await page.screenshot({ path: 'e2e-screenshots/project-page.png', fullPage: true });

    // Check if we're on login page (need auth)
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);

    if (currentUrl.includes('login')) {
      console.log('Redirected to login - need authentication');
      // Take screenshot of login page
      await page.screenshot({ path: 'e2e-screenshots/login-redirect.png' });
      return;
    }

    // Check if Audit History section exists
    const auditHistoryHeader = page.locator('text=Audit History');
    const hasAuditHistory = await auditHistoryHeader.count() > 0;
    console.log('Has Audit History section:', hasAuditHistory);

    if (hasAuditHistory) {
      // Find delete buttons
      const deleteButtons = page.locator('button:has(svg.lucide-trash-2)');
      const deleteButtonCount = await deleteButtons.count();
      console.log('Delete buttons found:', deleteButtonCount);

      if (deleteButtonCount > 0) {
        // Try clicking the first delete button
        const firstDeleteButton = deleteButtons.first();
        const isVisible = await firstDeleteButton.isVisible();
        const isEnabled = await firstDeleteButton.isEnabled();
        console.log('First delete button - visible:', isVisible, 'enabled:', isEnabled);

        // Get button bounding box
        const box = await firstDeleteButton.boundingBox();
        console.log('Button bounding box:', box);

        // Click and wait for network response
        console.log('Clicking delete button...');
        await firstDeleteButton.click();
        await page.waitForTimeout(2000);

        // Take screenshot after click
        await page.screenshot({ path: 'e2e-screenshots/after-delete-click.png', fullPage: true });
      }
    }

    // Dump the page HTML for the audit history section
    const auditSection = page.locator('[class*="Card"]:has-text("Audit History")');
    if (await auditSection.count() > 0) {
      const html = await auditSection.innerHTML();
      console.log('Audit History section HTML length:', html.length);
      // Write to file for inspection
      const fs = await import('fs');
      fs.writeFileSync('e2e-screenshots/audit-history-html.txt', html);
    }
  });

  test('check raw page HTML for delete buttons', async ({ page }) => {
    const projectId = 'fb8e4dc3-ff37-4f7b-b7fe-4bbb6b367e08';

    await page.goto(`/dashboard/projects/${projectId}`);
    await page.waitForTimeout(5000);

    // Get full page HTML
    const html = await page.content();

    // Check for Trash2 icon or delete-related elements
    const hasTrash = html.includes('lucide-trash') || html.includes('Trash2');
    const hasDeleteButton = html.includes('Delete') && html.includes('button');

    console.log('Page contains trash icon:', hasTrash);
    console.log('Page contains delete button:', hasDeleteButton);

    // Search for the audit history section
    const auditHistoryMatch = html.match(/Audit History[\s\S]{0,5000}/);
    if (auditHistoryMatch) {
      console.log('Audit History section found, length:', auditHistoryMatch[0].length);
      const fs = await import('fs');
      fs.writeFileSync('e2e-screenshots/audit-history-raw.txt', auditHistoryMatch[0]);
    } else {
      console.log('Audit History section NOT found in HTML');
    }

    await page.screenshot({ path: 'e2e-screenshots/full-page.png', fullPage: true });
  });
});
