const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

console.log('📄 Generating Portfolio HTML...\n');

// Read the markdown file
const mdPath = path.join(__dirname, '..', 'docs', 'PORTFOLIO_SUMMARY.md');
const mdContent = fs.readFileSync(mdPath, 'utf8');

// Convert markdown to HTML using marked
const htmlBody = marked.parse(mdContent);

// Create a beautiful, print-ready HTML
const styledHTML = `
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Portfolio Intelligence Report</title>
    <style>
        @media print {
            @page { 
                size: A4; 
                margin: 15mm 20mm; 
            }
            body {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            .no-print {
                display: none;
            }
        }
        
        * {
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #1a1a1a;
            background: #f5f5f5;
            margin: 0;
            padding: 20px;
        }
        
        .container {
            max-width: 210mm;
            margin: 0 auto;
            background: white;
            padding: 40px;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        
        .print-button {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 24px;
            background: #6366f1;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            box-shadow: 0 4px 6px rgba(99, 102, 241, 0.3);
            z-index: 1000;
        }
        
        .print-button:hover {
            background: #4f46e5;
        }
        
        h1 {
            font-size: 32pt;
            color: #1a1a1a;
            border-bottom: 4px solid #6366f1;
            padding-bottom: 15px;
            margin-top: 0;
            margin-bottom: 30px;
        }
        
        h2 {
            font-size: 18pt;
            color: #4f46e5;
            margin-top: 35px;
            margin-bottom: 12px;
            page-break-after: avoid;
            font-weight: 700;
        }
        
        h3 {
            font-size: 13pt;
            color: #6366f1;
            margin-top: 15px;
            margin-bottom: 8px;
            font-weight: 600;
        }
        
        p {
            margin-bottom: 10px;
            font-size: 11pt;
            line-height: 1.7;
            text-align: justify;
        }
        
        blockquote {
            background: #f8f9fa;
            border-left: 5px solid #6366f1;
            padding: 15px 20px;
            margin: 20px 0;
            font-style: italic;
            color: #555;
            font-size: 11pt;
            border-radius: 4px;
        }
        
        strong {
            color: #1a1a1a;
            font-weight: 700;
        }
        
        hr {
            border: none;
            border-top: 2px solid #e5e7eb;
            margin: 30px 0;
            page-break-after: avoid;
        }
        
        ul, ol {
            margin: 12px 0;
            padding-left: 25px;
        }
        
        li {
            margin-bottom: 6px;
            font-size: 11pt;
            line-height: 1.6;
        }
        
        code {
            background: #f3f4f6;
            padding: 3px 6px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            font-size: 10pt;
            color: #d63384;
        }
        
        pre {
            background: #f3f4f6;
            padding: 15px;
            border-radius: 6px;
            overflow-x: auto;
            font-size: 10pt;
            border: 1px solid #e5e7eb;
        }
        
        pre code {
            background: transparent;
            padding: 0;
            color: inherit;
        }
        
        .header-info {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            margin: -40px -40px 40px -40px;
            border-radius: 8px 8px 0 0;
        }
        
        .header-info h1 {
            color: white;
            border: none;
            margin: 0;
            font-size: 36pt;
        }
        
        .header-info p {
            margin: 10px 0 0 0;
            opacity: 0.9;
            font-size: 12pt;
        }
    </style>
</head>
<body>
    <button class="print-button no-print" onclick="window.print()">🖨️ Als PDF drucken</button>
    
    <div class="container">
        <div class="header-info">
            <h1>🚀 Portfolio Intelligence Report</h1>
            <p>Generiert am ${new Date().toLocaleDateString('de-DE', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        
        ${htmlBody}
    </div>
    
    <script>
        // Auto-print hint
        console.log('💡 Tipp: Drücke Strg+P oder klicke auf den Button, um als PDF zu drucken');
    </script>
</body>
</html>
`;

// Save HTML file
const outputPath = path.join(__dirname, '..', 'docs', 'PORTFOLIO_SUMMARY.html');
fs.writeFileSync(outputPath, styledHTML, 'utf8');

console.log(`✅ HTML generated successfully!`);
console.log(`📁 Location: ${outputPath}`);
console.log(`\n💡 Öffne die Datei im Browser und drücke Strg+P zum Drucken als PDF`);
