export interface PainPoint {
    icon: string;
    title: string;
    description: string;
}

export interface LandingPageContent {
    slug: string;
    headline: string;
    subheadline: string;
    ctaText: string;
    ctaHref: string;
    badge: string;
    painPoints: PainPoint[];
    solutionTitle: string;
    solutionFeatures: string[];
    heroStat: { value: string; label: string };
}

export const landingPages: Record<string, LandingPageContent> = {
    "indie-hacker": {
        slug: "indie-hacker",
        badge: "Für Solo-Devs & Indie Hackers",
        headline: "Turn Your GitHub Chaos into a Managed Empire.",
        subheadline:
            "25+ Repos. Kein Überblick. Kein Plan. — Vibecoder analysiert dein gesamtes Portfolio in Sekunden und zeigt dir genau, was läuft, was kostet und was als nächstes dran ist.",
        ctaText: "Portfolio analysieren →",
        ctaHref: "/",
        heroStat: { value: "25+", label: "Repos auf einen Blick" },
        painPoints: [
            {
                icon: "🧠",
                title: "Context Switching Hell",
                description:
                    "Du öffnest ein altes Repo und weißt nicht mehr: Welcher Stack? Deployed? Läuft das überhaupt noch?",
            },
            {
                icon: "🔥",
                title: "Maintenance Blindspot",
                description:
                    "Security-Patches, veraltete Dependencies, tote Links — du siehst es erst, wenn es knallt.",
            },
            {
                icon: "💸",
                title: "Kosten-Chaos",
                description:
                    "Supabase hier, Vercel da, Fly.io dort — du weißt nicht mehr, was dein Portfolio wirklich kostet.",
            },
        ],
        solutionTitle: "Ein Dashboard. Alles drin.",
        solutionFeatures: [
            "Automatische Tech-Stack-Erkennung für alle Repos",
            "Live Deployment-Status & Link-Health-Monitoring",
            "Kosten-Tracking pro Projekt mit ARR-Schätzung",
            "AI-generierte Next Actions & Security-Tasks",
        ],
    },

    "tech-lead": {
        slug: "tech-lead",
        badge: "Für Tech Leads & CTOs",
        headline: "Automated Governance for Your Software Portfolio.",
        subheadline:
            "Standardisierte ADRs, automatische Architektur-Reviews und Kosten-Tracking — alles in einem Dashboard. Kein manuelles Reporting mehr.",
        ctaText: "Demo ansehen →",
        ctaHref: "/",
        heroStat: { value: "13", label: "vordefinierte ADR-Templates" },
        painPoints: [
            {
                icon: "📄",
                title: "Fehlende Standardisierung",
                description:
                    "Jedes Projekt ist anders dokumentiert. Neues Teammitglied? Onboarding dauert Wochen.",
            },
            {
                icon: "💰",
                title: "Hidden Costs",
                description:
                    "AWS, Vercel, Supabase — Bills laufen auf, ohne klare Zuordnung zu Projekten oder Teams.",
            },
            {
                icon: "🏗️",
                title: "Architektur-Drift",
                description:
                    "Ohne zentrale ADRs entscheidet jeder selbst. Technische Schulden akkumulieren unbemerkt.",
            },
        ],
        solutionTitle: "Governance auf Autopilot.",
        solutionFeatures: [
            "13 vordefinierte ADRs (Next.js, TypeScript Strict, etc.)",
            "Automatische Architektur-Analyse per AI",
            "Multi-Provider Deployment-Management (Vercel, Fly.io, AWS)",
            "Portfolio-Reports mit Technologie-Verteilung & Health-Scores",
        ],
    },

    showcase: {
        slug: "showcase",
        badge: "Portfolio Showcase",
        headline: "See the Business Value Behind the Code.",
        subheadline:
            "Nicht nur Repos — sondern echte Produkte mit Deployment-Status, Business-Potential und Tech-Stack-Analyse. Für alle, die mehr sehen wollen als nur Code.",
        ctaText: "Portfolio ansehen →",
        ctaHref: "/portfolio",
        heroStat: { value: "63", label: "analysierte Repositories" },
        painPoints: [
            {
                icon: "🔍",
                title: "Code ≠ Produkt",
                description:
                    "GitHub zeigt Commits. Nicht ob das Projekt live ist, Nutzer hat oder Geld verdient.",
            },
            {
                icon: "📊",
                title: "Kein Business-Kontext",
                description:
                    "Technische Tiefe ist unsichtbar ohne Value Proposition, Revenue Streams und Cost Structure.",
            },
            {
                icon: "🌐",
                title: "Deployment-Blackbox",
                description:
                    "Ist das deployed? Welche Domain? Läuft es? — Ohne Tool: keine Ahnung.",
            },
        ],
        solutionTitle: "Das vollständige Bild.",
        solutionFeatures: [
            "Live-Status aller Deployments mit Latency-Messung",
            "Business Canvas pro Projekt (Value Prop, Revenue, Costs)",
            "Technologie-Verteilung & Komplexitäts-Score",
            "AI-generierte Projekt-Beschreibungen (SEO-optimiert)",
        ],
    },

    home: {
        slug: "home",
        badge: "Böschi & Friends",
        headline: "Unlock Your Song - Erzähl deine Story, wir machen Musik daraus.",
        subheadline:
            "Mit unserem Song-&-Cover-Agenten bekommst du in Minuten deinen eigenen Song und ein individuelles Cover. Einfach deine Wünsche erzählen!",
        ctaText: "Jetzt Song erstellen →",
        ctaHref: "/auth/signin",
        heroStat: { value: "100%", label: "Dein eigener Song" },
        painPoints: [
            {
                icon: "🎵",
                title: "Keine musikalische Erfahrung?",
                description:
                    "Kein Problem. Du brauchst kein Instrument und keine Band. Deine Idee reicht.",
            },
            {
                icon: "⏱️",
                title: "Stundenlanges Komponieren?",
                description:
                    "Vergiss monatelange Studio-Sessions. Wir liefern Ergebnisse in Minuten.",
            },
            {
                icon: "🎨",
                title: "Fehlendes Cover-Art?",
                description:
                    "Ein Song braucht ein Gesicht. Wir generieren das passende Artwork gleich mit.",
            },
        ],
        solutionTitle: "Dein Song in wenigen Schritten.",
        solutionFeatures: [
            "Erzähl uns deine Geschichte oder Idee",
            "Wähle Genre und Stimmung",
            "Erhalte deinen fertigen Song inkl. Lyrics",
            "Download & Share mit deinen Freunden",
        ],
    },
};
