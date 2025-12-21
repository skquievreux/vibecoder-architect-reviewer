const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

async function generatePortfolioPDF() {
    console.log('📄 Generating Portfolio PDF with proper markdown parsing...\n');

    // Read the markdown file
    const mdPath = path.join(__dirname, '..', 'docs', 'PORTFOLIO_SUMMARY.md');
    const mdContent = fs.readFileSync(mdPath, 'utf8');

    // Convert markdown to HTML using marked
    const htmlBody = marked.parse(mdContent);

    // Wrap in styled HTML
    const styledHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Portfolio Intelligence Report</title>
    <style>
        @page { 
            size: A4; 
            margin: 15mm 20mm; 
        }
        * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #1a1a1a;
            background: white;
        }
        h1 {
            font-size: 24pt;
            color: #1a1a1a;
            border-bottom: 3px solid #6366f1;
            padding-bottom: 10px;
            margin-top: 20px;
            margin-bottom: 15px;
            page-break-after: avoid;
        }
        h2 {
            font-size: 16pt;
            color: #4f46e5;
            margin-top: 25px;
            margin-bottom: 10px;
            page-break-after: avoid;
            font-weight: 600;
        }
        h3 {
            font-size: 12pt;
            color: #6366f1;
            margin-top: 12px;
            margin-bottom: 6px;
            font-weight: 600;
        }
        p {
            margin-bottom: 8px;
            font-size: 10pt;
            line-height: 1.5;
        }
        blockquote {
            background: #f8f9fa;
            border-left: 4px solid #6366f1;
            padding: 10px 12px;
            margin: 12px 0;
            font-style: italic;
            color: #555;
            font-size: 10pt;
        }
        strong {
            color: #1a1a1a;
            font-weight: 600;
        }
        hr {
            border: none;
            border-top: 1px solid #e5e7eb;
            margin: 20px 0;
            page-break-after: avoid;
        }
        ul, ol {
            margin: 8px 0;
            padding-left: 20px;
        }
        li {
            margin-bottom: 4px;
            font-size: 10pt;
        }
        code {
            background: #f3f4f6;
            padding: 2px 4px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
            font-size: 9pt;
        }
        pre {
            background: #f3f4f6;
            padding: 10px;
            border-radius: 5px;
            overflow-x: auto;
            font-size: 9pt;
        }
        pre code {
            background: transparent;
            padding: 0;
        }
    </style>
</head>
<body>
    ${htmlBody}
</body>
</html>
    `;

    // Call the PDF generation API
    const response = await fetch('http://localhost:3000/api/generate-pdf', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            htmlContent: styledHTML
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`PDF generation failed: ${response.statusText}\n${errorText}`);
    }

    const buffer = await response.arrayBuffer();
    const outputPath = path.join(__dirname, '..', 'docs', 'PORTFOLIO_SUMMARY.pdf');

    // Delete old file if exists
    if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
    }

    fs.writeFileSync(outputPath, Buffer.from(buffer));

    console.log(`✅ PDF generated successfully!`);
    console.log(`📁 Location: ${outputPath}`);
    console.log(`📊 Size: ${(buffer.byteLength / 1024).toFixed(2)} KB`);
    console.log(`\n💡 Tip: Open with Adobe Reader or Chrome for best results`);
}

generatePortfolioPDF().catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});
