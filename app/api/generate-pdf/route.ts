import { NextRequest, NextResponse } from 'next/server';
import chromium from '@sparticuz/chromium';

export async function POST(request: NextRequest) {
  let browser;
  try {
    const { htmlContent } = await request.json();

    if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
      // Production (Vercel/Lambda) with enhanced error handling
      let executablePath;
      
      try {
        const chromium = (await import('@sparticuz/chromium')).default;
        executablePath = await chromium.executablePath();
        console.log('Chromium executable path:', executablePath);
        
        // Verify path exists
        const fs = await import('fs');
        if (!fs.existsSync(executablePath)) {
          throw new Error(`Chromium executable not found at: ${executablePath}`);
        }
        
        const puppeteer = await import('puppeteer-core');
        
        browser = await puppeteer.launch({
          args: [
            ...chromium.args,
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--single-process'
          ],
          defaultViewport: {
            width: 1920,
            height: 1080,
            deviceScaleFactor: 1,
            isMobile: false,
            hasTouch: false,
            isLandscape: false,
          },
          executablePath,
          headless: 'new', // Use new headless mode for better compatibility
        });
      } catch (error) {
        console.error('Error launching Chromium:', error);
        throw new Error(`Failed to initialize Chromium: ${error.message}`);
      }
    } else {
      // Local Development (using standard puppeteer)
      const puppeteer = await import('puppeteer');
      browser = await (puppeteer as any).launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    }

    const page = await browser.newPage();

    // A4 Viewport
    await page.setViewport({ width: 794, height: 1122, deviceScaleFactor: 1 });

    // Theme-independent HTML template (No Tailwind)
    const fullHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />
        <title>Report</title>
        <style>
          @page { size: A4; margin: 15mm 20mm; }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          html, body {
            margin: 0;
            padding: 0;
            background: #ffffff !important;
            color: #000000 !important;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            line-height: 1.5;
            font-size: 12pt;
          }
          h1, h2, h3, h4, h5, h6,
          p, span, li, td, th, div {
            color: #000000 !important;
            background-color: transparent !important;
          }
          h1 { font-size: 24pt; margin-bottom: 0.5em; border-bottom: 2px solid #000; padding-bottom: 10px; }
          h2 { font-size: 18pt; margin-top: 1.5em; margin-bottom: 0.5em; }
          h3 { font-size: 14pt; margin-top: 1.2em; margin-bottom: 0.5em; }
          p { margin-bottom: 1em; }
          ul, ol { margin-bottom: 1em; padding-left: 1.5em; }
          li { margin-bottom: 0.5em; }
          code { font-family: monospace; background: #f0f0f0 !important; padding: 2px 4px; border-radius: 3px; }
          pre { background: #f0f0f0 !important; padding: 1em; border-radius: 5px; overflow-x: auto; margin-bottom: 1em; }
          pre code { background: transparent !important; padding: 0; }
          blockquote { border-left: 4px solid #ccc; padding-left: 1em; margin-left: 0; font-style: italic; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 1em; }
          th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
          th { background: #eee !important; font-weight: bold; }
          a { color: #000000 !important; text-decoration: underline; }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
      </html>
    `;

    await page.setContent(fullHTML, {
      waitUntil: ['networkidle0', 'domcontentloaded']
    });

    await page.evaluate(() => {
      return new Promise<void>(resolve => {
        if ((document as any).fonts) {
          (document as any).fonts.ready.then(() => resolve());
        } else {
          resolve();
        }
        setTimeout(resolve, 1000);
      });
    });

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: false,
    });

    await browser.close();

    return new NextResponse(Buffer.from(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="architecture-report.pdf"',
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    if (browser) await browser.close();
    return NextResponse.json(
      { error: 'PDF generation failed', details: String(error) },
      { status: 500 }
    );
  }
}

