---
title: "Sponsoring & Analytics Strategy"
type: "business"
audience: "product-owner"
status: "approved"
priority: "high"
version: "1.0.0"
created: "2026-01-01"
updated: "2026-01-01"
tags: ["monetization", "analytics", "sponsoring", "metrics"]
---

# Konzept: Sponsoring & Analytics Integration

Dieses Dokument beschreibt die Strategie zur Monetarisierung durch Sponsoren und die Messung des Erfolgs durch Google Analytics 4 (GA4).

---

## 1. Sponsoring-Konzept

Das Ziel ist es, Sponsoren nativ in das Erlebnis einzubinden, sodass es für den Nutzer (den Creator) einen Mehrwert bietet oder zumindest nicht stört.

### A. Integrations-Stufen (Inventory)

Wir bieten 3 Stufen der Integration an:

1.  **"Powered By" (Basic)**
    *   **Position:** Kleines Logo/Badge oben links auf der Landingpage + Footer.
    *   **Inhalt:** "Supported by [Sponsor]".
    *   **Preis-Modell:** Flat Fee pro Monat (z.B. 500€).
    *   **Ziel:** Markenbekanntheit (Awareness).

2.  **"In-Text Native" (Advanced)** (Bereits technisch vorbereitet!)
    *   **Funktion:** Die KI fügt automatisch ein "Powered by [Marke]" oder einen kurzen Claim am Ende jedes generierten Spruchs hinzu.
    *   **Vorteil:** Der Sponsor wird *Teil des Contents*, der geteilt wird.
    *   **Preis-Modell:** Cost-Per-Generation (CPG). Z.B. 0,50€ pro 10 generierten Sprüchen.
    *   **Messung:** Anzahl der Generierungen.

3.  **"Full Branded Profile" (Premium)**
    *   **Funktion:** Ein komplett eigenes Profil (wie "Bike Park"), das nur für den Sponsor existiert.
    *   **Assets:** Eigene Stimme (Corporate Voice), eigenes Farbschema, eigene Musik.
    *   **Preis-Modell:** Setup-Fee (einmalig 2.500€) + monatliche Hosting-Gebühr.

### B. Preis-Kalkulation (Beispiel)

| Feature             | Abrechnung  | Beispiel-Preis         |
| :------------------ | :---------- | :--------------------- |
| **Logo Placement**  | Monatlich   | 250€ - 500€ / Monat    |
| **In-Text Mention** | Performance | 0,05€ pro Generierung  |
| **Branded Profile** | Projekt     | 3.000€ Setup + 150€/Mo |

---

## 2. Analytics Konzept (Messwerte)

Um den Wert für Sponsoren zu beweisen, müssen wir präzise Daten liefern. Standard "Page Views" reichen nicht.

### A. Wichtige KPIs (Key Performance Indicators)

1.  **Engagement Rate:** Wie viele Besucher generieren tatsächlich einen Spruch?
2.  **Conversion Rate:** Wie viele klicken auf den "Sponsor Link" oder "Call to Action"?
3.  **Virality:** Wie oft wird eine generierte Seite *geteilt* (Share-Button Klicks)?

### B. Tracking-Events (GA4)

Wir implementieren folgende Custom Events:

*   `generate_hook_start`: Klick auf "Analysieren".
    *   *Param:* `profile_id` (Welches Profil wird genutzt?)
*   `generate_hook_success`: Erfolgreiche Ausgabe.
    *   *Param:* `hook_count` (Anzahl der Ergebnisse)
*   `share_landingpage`: Klick auf "Landing Page erstellen".
    *   *Param:* `sponsor_active` (true/false)
*   `download_zip`: (Admin only) Download der Assets.
*   `click_sponsor`: Klick auf das Sponsor-Badge oder den CTA.
    *   *Param:* `sponsor_url`

### C. Dashboard für Sponsoren
Langfristig können wir Sponsoren einen monatlichen Report senden:
> "Ihr Profil 'Bike Park' wurde 500x genutzt, 1200 Sprüche wurden generiert und 50 User haben auf Ihre Webseite geklickt."

---

## 3. Technische Umsetzung (Roadmap)

1.  **UI Cleanup:** Entfernen von "Datei Upload" (Fokus auf KI).
2.  **Landingpage:** Umbau der Startseite zu einem rotierenden Showcase, um verschiedene Sponsoren/Profile zu zeigen.
3.  **GA4 Setup:** Einbindung des Google Tags und Definition der Events im Code.
