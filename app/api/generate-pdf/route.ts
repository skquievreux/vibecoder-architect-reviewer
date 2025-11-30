import puppeteer from 'puppeteer';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { htmlContent } = await request.json();

    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-fonts',
        '--font-render-hinting=none',
      ],
    });

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
          /* Safety: Force everything to black text */
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
        document.fonts.ready.then(() => resolve());
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

    return new NextResponse(pdf, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="architecture-report.pdf"',
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'PDF generation failed' },
      { status: 500 }
    );
  }
}
