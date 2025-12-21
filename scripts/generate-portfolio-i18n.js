const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

// Comprehensive translation dictionary
const translations = {
    // Headers and structure
    'Generated on': 'Generiert am',
    'Value Proposition:': 'Wertversprechen:',
    'Target Customer:': 'Zielkunde:',
    'Revenue Model:': 'Erlösmodell:',

    // Revenue models
    'Recurring': 'Wiederkehrend',
    'One-time': 'Einmalig',
    'Usage-based': 'Nutzungsbasiert',
    'SaaS Subscription': 'SaaS-Abonnement',
    'Annual Contract': 'Jahresvertrag',
    'Project-based': 'Projektbasiert',
    'Freemium': 'Freemium',
    'Per-seat': 'Pro Arbeitsplatz',
    'Enterprise': 'Unternehmen',
    'White-label': 'White-Label',
    'API': 'API',

    // Common business terms
    'Dashboard': 'Dashboard',
    'Platform': 'Plattform',
    'Workflow': 'Arbeitsablauf',
    'Integration': 'Integration',
    'Automation': 'Automatisierung',
    'Analytics': 'Analysen',
    'Monitoring': 'Überwachung',
    'Deployment': 'Bereitstellung',
    'Scalable': 'Skalierbar',
    'Multi-tenant': 'Mandantenfähig',
    'Real-time': 'Echtzeit',
    'Cloud': 'Cloud',
    'On-premise': 'On-Premise',
    'Self-service': 'Self-Service',
    'Mobile-first': 'Mobile-First',
    'Responsive': 'Responsiv',
    'Progressive': 'Progressiv',
    'Serverless': 'Serverless',

    // Customer segments
    'Developers': 'Entwickler',
    'Agencies': 'Agenturen',
    'Startups': 'Startups',
    'SMEs': 'KMU',
    'Enterprises': 'Großunternehmen',
    'Freelancers': 'Freiberufler',
    'Teams': 'Teams',
    'Professionals': 'Fachleute',
    'Creators': 'Creator',
    'Musicians': 'Musiker',
    'Artists': 'Künstler',
    'Designers': 'Designer',
    'Marketers': 'Marketer',
    'Managers': 'Manager',
    'Educators': 'Bildungsanbieter',
    'Students': 'Studenten',

    // Action verbs
    'Automate': 'Automatisieren',
    'Streamline': 'Optimieren',
    'Accelerate': 'Beschleunigen',
    'Simplify': 'Vereinfachen',
    'Enhance': 'Verbessern',
    'Transform': 'Transformieren',
    'Enable': 'Ermöglichen',
    'Deliver': 'Liefern',
    'Generate': 'Generieren',
    'Create': 'Erstellen',
    'Build': 'Erstellen',
    'Manage': 'Verwalten',
    'Track': 'Verfolgen',
    'Monitor': 'Überwachen',
    'Optimize': 'Optimieren',
};

function translateText(text) {
    let translated = text;

    // Apply all translations
    for (const [english, german] of Object.entries(translations)) {
        const regex = new RegExp(english, 'g');
        translated = translated.replace(regex, german);
    }

    return translated;
}

function generateHTML(content, language) {
    const htmlBody = marked.parse(content);

    const t = language === 'de' ? {
        title: 'Portfolio Intelligence Report',
        generatedOn: 'Generiert am',
        printButton: '🖨️ Als PDF drucken',
    } : {
        title: 'Portfolio Intelligence Report',
        generatedOn: 'Generated on',
        printButton: '🖨️ Print as PDF',
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
        .header-info { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; margin: -40px -40px 40px -40px; border-radius: 8px 8px 0 0; }
        .header-info h1 { color: white; border: none; margin: 0; font-size: 36pt; }
        .header-info p { margin: 10px 0 0 0; opacity: 0.9; font-size: 12pt; }
    </style>
</head>
<body>
    <button class="print-button no-print" onclick="window.print()">${t.printButton}</button>
    <div class="container">
        <div class="header-info">
            <h1>🚀 ${t.title}</h1>
            <p>${t.generatedOn} ${dateStr}</p>
        </div>
        ${htmlBody}
    </div>
</body>
</html>
`;
}

console.log('📄 Generating translated Portfolio Reports...\n');

// Read original markdown
const mdPath = path.join(__dirname, '..', 'docs', 'PORTFOLIO_SUMMARY.md');
const mdContent = fs.readFileSync(mdPath, 'utf8');

// German version - translate English terms
console.log('🇩🇪 Creating German version with translations...');
const germanContent = translateText(mdContent);
const germanHTML = generateHTML(germanContent, 'de');
const germanPath = path.join(__dirname, '..', 'docs', 'PORTFOLIO_SUMMARY_DE.html');
fs.writeFileSync(germanPath, germanHTML, 'utf8');
console.log(`   ✅ Saved: ${germanPath}`);

// English version - keep as is (most content is already in English)
console.log('🇬🇧 Creating English version...');
const englishHTML = generateHTML(mdContent, 'en');
const englishPath = path.join(__dirname, '..', 'docs', 'PORTFOLIO_SUMMARY_EN.html');
fs.writeFileSync(englishPath, englishHTML, 'utf8');
console.log(`   ✅ Saved: ${englishPath}`);

console.log('\n✨ Done! Both versions created successfully.');
console.log('\n💡 Open the files in your browser and press Ctrl+P to save as PDF');
