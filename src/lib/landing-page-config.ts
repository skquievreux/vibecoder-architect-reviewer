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
        badge: "VibeCoder Architect Reviewer",
        headline: "VibeCoder Architect: Governance & Portfolio Intelligence.",
        subheadline:
            "Analysiere dein gesamtes Software-Portfolio in Sekunden. Automatische Architektur-Reviews, ADRs und Kosten-Tracking für moderne Entwickler-Teams.",
        ctaText: "Jetzt starten →",
        ctaHref: "/auth/signin",
        heroStat: { value: "60+", label: "Unterstützte Projekte" },
        painPoints: [
            {
                icon: "🏗️",
                title: "Fehlende Architektur-Übersicht",
                description:
                    "Welche Tech-Stacks nutzen deine 60+ Repos wirklich? Vibecoder analysiert sie alle automatisch.",
            },
            {
                icon: "💰",
                title: "Kosten-Transparenz",
                description:
                    "Kein Überblick über Vercel, Supabase und AWS Rechnungen? Wir ordnen Kosten direkt den Projekten zu.",
            },
            {
                icon: "📋",
                title: "Keine Standardisierung",
                description:
                    "ADRs und Dokumentation fehlen oft. Unser AI-Reviewer erstellt sie für dich on-the-fly.",
            },
        ],
        solutionTitle: "Vollständige Kontrolle über deinen Code.",
        solutionFeatures: [
            "Automatisierte Tech-Stack Analyse",
            "Zentrales Dashboard für alle Projekte",
            "KI-gestützte Architektur-Reviews",
            "Kosten- & Deployment-Monitoring",
        ],
    },
};
