const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

// Translation dictionary
const translations = {
    'Value Proposition:': 'Wertversprechen:',
    'Target Customer:': 'Zielkunde:',
    'Revenue Model:': 'Erlösmodell:',
    'Recurring': 'Wiederkehrend',
    'One-time': 'Einmalig',
    'Usage-based': 'Nutzungsbasiert',
    'SaaS Subscription': 'SaaS-Abonnement',
    'Annual Contract': 'Jahresvertrag',
    'Project-based': 'Projektbasiert',
    'Enterprise': 'Unternehmen',
    'White-label': 'White-Label',
};

function translateText(text) {
    let translated = text;
    for (const [english, german] of Object.entries(translations)) {
        const regex = new RegExp(english, 'g');
        translated = translated.replace(regex, german);
    }
    return translated;
}

function generateHTML(execSummary, portfolioContent, language) {
    const execHTML = marked.parse(execSummary);
    const portfolioHTML = marked.parse(portfolioContent);

    const t = language === 'de' ? {
        title: 'Portfolio Intelligence Report',
        generatedOn: 'Generiert am',
        printButton: '🖨️ Als PDF drucken',
        execSummaryTitle: 'Management-Zusammenfassung',
        fullReportTitle: 'Vollständiger Portfolio-Report',
    } : {
        title: 'Portfolio Intelligence Report',
        generatedOn: 'Generated on',
        printButton: '🖨️ Print as PDF',
        execSummaryTitle: 'Executive Summary',
        fullReportTitle: 'Full Portfolio Report',
    };

    const dateStr = language === 'de'
        ? new Date().toLocaleDateString('de-DE', { year: 'numeric', month: 'long', day: 'numeric' })
        : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    return `
<!DOCTYPE html>
<html lang="${language}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${t.title}</title>
    <style>
        @media print {
            @page { size: A4; margin: 15mm 20mm; }
            body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            .no-print { display: none; }
            .page-break { page-break-before: always; }
        }
        * { box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1a1a1a; background: #f5f5f5; margin: 0; padding: 20px; }
        .container { max-width: 210mm; margin: 0 auto; background: white; padding: 40px; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
        .print-button { position: fixed; top: 20px; right: 20px; padding: 12px 24px; background: #6366f1; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; box-shadow: 0 4px 6px rgba(99, 102, 241, 0.3); z-index: 1000; }
        .print-button:hover { background: #4f46e5; }
        h1 { font-size: 32pt; color: #1a1a1a; border-bottom: 4px solid #6366f1; padding-bottom: 15px; margin-top: 0; margin-bottom: 30px; }
        h2 { font-size: 18pt; color: #4f46e5; margin-top: 35px; margin-bottom: 12px; page-break-after: avoid; font-weight: 700; }
        h3 { font-size: 13pt; color: #6366f1; margin-top: 15px; margin-bottom: 8px; font-weight: 600; }
        p { margin-bottom: 10px; font-size: 11pt; line-height: 1.7; text-align: justify; }
        blockquote { background: #f8f9fa; border-left: 5px solid #6366f1; padding: 15px 20px; margin: 20px 0; font-style: italic; color: #555; font-size: 11pt; border-radius: 4px; }
        strong { color: #1a1a1a; font-weight: 700; }
        hr { border: none; border-top: 2px solid #e5e7eb; margin: 30px 0; page-break-after: avoid; }
        ul, ol { margin: 12px 0; padding-left: 25px; }
        li { margin-bottom: 6px; font-size: 11pt; line-height: 1.6; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 10pt; }
        th, td { border: 1px solid #e5e7eb; padding: 10px; text-align: left; }
        th { background: #f8f9fa; font-weight: 700; color: #4f46e5; }
        code { background: #f3f4f6; padding: 2px 6px; border-radius: 3px; font-family: 'Courier New', monospace; font-size: 10pt; }
        pre { background: #f3f4f6; padding: 15px; border-radius: 6px; overflow-x: auto; font-size: 10pt; }
        .header-info { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; margin: -40px -40px 40px -40px; border-radius: 8px 8px 0 0; }
        .header-info h1 { color: white; border: none; margin: 0; font-size: 36pt; }
        .header-info p { margin: 10px 0 0 0; opacity: 0.9; font-size: 12pt; }
        .section-divider { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; margin: 40px -40px; text-align: center; font-size: 20pt; font-weight: 700; }
    </style>
</head>
<body>
    <button class="print-button no-print" onclick="window.print()">${t.printButton}</button>
    <div class="container">
        <div class="header-info">
            <h1>🚀 ${t.title}</h1>
            <p>${t.generatedOn} ${dateStr}</p>
        </div>
        
        <div class="executive-summary">
            ${execHTML}
        </div>
        
        <div class="page-break"></div>
        
        <div class="section-divider">
            📋 ${t.fullReportTitle}
        </div>
        
        <div class="full-report">
            ${portfolioHTML}
        </div>
    </div>
</body>
</html>
`;
}

console.log('📄 Generating Portfolio Reports with Executive Summary...\n');

// Read files
const execPath = path.join(__dirname, '..', 'docs', 'EXECUTIVE_SUMMARY.md');
const portfolioPath = path.join(__dirname, '..', 'docs', 'PORTFOLIO_SUMMARY.md');

const execSummary = fs.readFileSync(execPath, 'utf8');
const portfolioContent = fs.readFileSync(portfolioPath, 'utf8');

// German version
console.log('🇩🇪 Creating German version with Executive Summary...');
const germanExec = translateText(execSummary);
const germanPortfolio = translateText(portfolioContent);
const germanHTML = generateHTML(germanExec, germanPortfolio, 'de');
const germanOutputPath = path.join(__dirname, '..', 'docs', 'PORTFOLIO_COMPLETE_DE.html');
fs.writeFileSync(germanOutputPath, germanHTML, 'utf8');
console.log(`   ✅ Saved: ${germanOutputPath}`);

// English version
console.log('🇬🇧 Creating English version with Executive Summary...');
const englishHTML = generateHTML(execSummary, portfolioContent, 'en');
const englishOutputPath = path.join(__dirname, '..', 'docs', 'PORTFOLIO_COMPLETE_EN.html');
fs.writeFileSync(englishOutputPath, englishHTML, 'utf8');
console.log(`   ✅ Saved: ${englishOutputPath}`);

console.log('\n✨ Done! Complete portfolio reports with Executive Summary created.');
console.log('\n📄 Files created:');
console.log('   - PORTFOLIO_COMPLETE_DE.html (German with Management Summary)');
console.log('   - PORTFOLIO_COMPLETE_EN.html (English with Executive Summary)');
console.log('\n💡 Open the files in your browser and press Ctrl+P to save as PDF');
