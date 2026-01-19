---
title: "Dokumentations-Regelwerk"
type: "reference"
audience: "developer"
status: "approved"
priority: "high"
version: "1.0.0"
created: "2025-12-17"
updated: "2025-12-29"
reviewers: ["@antigravity"]
related: ["GOVERNANCE_FRAMEWORK.md"]
tags: ["rules", "governance", "standards", "documentation"]
---

# 📚 Dokumentations-Regelwerk

Ein umfassendes Regelwerk für strukturierte, wartbare Projekt-Dokumentation.

## 🎯 Zielsetzung

Dieses Regelwerk standardisiert die Erstellung, Pflege und Organisation von Dokumentation in Software-Projekten. Es basiert auf bewährten Praktiken und stellt sicher, dass Dokumentation immer aktuell, auffindbar und nützlich ist.

## 📁 1. Ordnerstruktur

### 1.1 Standard-Verzeichnisbaum

```
docs/
├── 01-architecture/          # Architekturentscheidungen & Design
│   ├── adr/                 # Architecture Decision Records
│   ├── design/              # Design-Dokumente
│   └── patterns/            # Architektur-Patterns
├── 02-implementation/       # Implementierungsdetails
│   ├── setup/               # Setup & Installation
│   ├── configuration/       # Konfigurations-Anleitungen
│   └── migration/           # Migrations-Guides
├── 03-operations/           # Betrieb & Wartung
│   ├── deployment/          # Deployment-Anleitungen
│   ├── monitoring/          # Monitoring & Logging
│   └── troubleshooting/     # Fehlerbehebung
├── 04-business/             # Business & Produkt
│   ├── features/            # Feature-Beschreibungen
│   ├── strategy/            # Strategie-Dokumente
│   └── portfolio/           # Portfolio-Dokumentation
├── 05-reference/            # Referenz-Dokumentation
│   ├── api/                 # API-Dokumentation
│   ├── cli/                 # CLI-Befehle
│   └── glossary/            # Glossar & Begriffe
├── _templates/              # Dokumentations-Vorlagen
│   ├── README.md.template
│   ├── ADR.md.template
│   └── GUIDE.md.template
└── _assets/                 # Bilder, Diagramme, etc.
    ├── images/
    └── diagrams/
```

### 1.2 Root-Level Dateien

Im Projekt-Root nur folgende Dokumentationsdateien zulassen:

- `README.md` - Projektübersicht (zwingend erforderlich)
- `CHANGELOG.md` - Änderungshistorie (automatisch gepflegt)
- `CONTRIBUTING.md` - Contributing Guidelines
- `LICENSE` - Lizenzinformationen
- `ARCHITECTURE.md` - Kurze Architektur-Übersicht

### 1.3 Dateibenennungs-Konventionen

**Allgemeine Regeln:**
- **KEBAB-CASE.md** für reguläre Dokumente
- **README.md** für Verzeichnis-Übersichten
- **ADR-XXX.md** für Architecture Decision Records
- **UPPER_SNAKE_CASE.md** für Status- und Planungs-Dokumente

**Spezifische Muster:**
- `feature-name.md` - Feature-Beschreibungen
- `setup-platform.md` - Plattform-spezifische Setups
- `troubleshooting-issue.md` - Problem-spezifische Lösungsanleitungen

## 📝 2. Dokumentations-Typen

### 2.1 Architektur-Dokumentation (01-architecture/)

**Architecture Decision Records (ADR)**
```markdown
# ADR-XXX: [Titel]

## Status
## Datum
## Context
## Decision
## Consequences
```

**Design-Dokumente**
- Problembeschreibung
- Lösungsansätze
- Technische Details
- Implementierungsplan

### 2.2 Implementierungs-Dokumentation (02-implementation/)

**Setup-Guides**
- Voraussetzungen
- Schritt-für-Schritt Anleitung
- Verifizierungsschritte
- Troubleshooting

**Konfigurations-Dokumente**
- Parameter-Beschreibungen
- Beispiel-Konfigurationen
- Best Practices

### 2.3 Operations-Dokumentation (03-operations/)

**Deployment-Anleitungen**
- Environment-Voraussetzungen
- Deployment-Schritte
- Rollback-Prozeduren
- Health-Checks

**Runbooks**
- Vorfälle beschreiben
- Diagnose-Schritte
- Lösungsprozeduren
- Präventionsmaßnahmen

### 2.4 Business-Dokumentation (04-business/)

**Feature-Dokumente**
- Nutzer-Ziel
- Akzeptanzkriterien
- User Stories
- Testing-Anforderungen

### 2.5 Referenz-Dokumentation (05-reference/)

**API-Dokumentation**
- Endpunkte
- Parameter
- Response-Formate
- Fehler-Codes

## 📋 3. Dokumenten-Metadaten

### 3.1 YAML-Frontmatter

Jedes Dokument MUSS folgenden Frontmatter enthalten:

```yaml
---
title: "Dokumenttitel"
type: "architecture|implementation|operations|business|reference"
audience: "developer|operator|business|all"
status: "draft|review|approved|deprecated"
created: "YYYY-MM-DD"
updated: "YYYY-MM-DD"
version: "1.0.0"
review_due: "YYYY-MM-DD"
tags: ["tag1", "tag2"]
---
```

### 3.2 Metadaten-Beschreibungen

**title:** Klarer, eindeutiger Dokumenttitel  
**type:** Dokumentations-Typ (siehe 2.1-2.5)  
**audience:** Primäre Zielgruppe  
**status:** Aktueller Dokumentenstatus  
**created:** Erstellungsdatum  
**updated:** Letzte Aktualisierung  
**version:** Semantische Versionierung  
**review_due:** Nächstes Review-Datum  
**tags:** Such- und Kategorisierungs-Tags

## 🎨 4. Formatierungs-Standards

### 4.1 Markdown-Struktur

```markdown
# 🎯 Titel
<!-- YAML Frontmatter -->

## 📋 Inhaltsverzeichnis
<!-- Automatisch generiert -->

## 🎯 Überblick
<!-- Kurze Zusammenfassung -->

## ✨ Hauptinhalt
<!-- Detaillierte Beschreibung -->

## 🔗 Verwandte Dokumente
<!-- Querverweise -->

## 📞 Support & Kontakt
<!-- Hilfe bei Problemen -->
```

### 4.2 Emoji-Konventionen

**Überschriften:**
- 🎯 Titel/Hauptthema
- 📋 Inhaltsverzeichnis
- ✨ Features/Neuerungen
- 🛠️ Technische Details
- 🔧 Konfiguration
- 🚀 Deployment
- 🔍 Analyse/Monitoring
- 🔗 Verweise/Links
- 📞 Support/Kontakt

**Status:**
- ✅ Erledigt/Aktiv
- ⚠️ Warnung/Wichtig
- ❌ Problem/Deprecated
- 🔄 In Bearbeitung
- 📅 Geplant

### 4.3 Code-Formatierung

**Inline-Code:** `variable_name` für Variablen, `function()` für Funktionen

**Code-Blöcke:**
```typescript
// Immer mit Sprachangabe
const example = "string";
```

**Datei-Pfade:** Verwende absolute Pfade ab Projekt-Root: `docs/01-architecture/ADR-001.md`

## 🔄 5. Lebenszyklus-Management

### 5.1 Dokumenten-Status

**draft:** In Erstellung, nicht für öffentliche Nutzung  
**review:** In Review-Phase, fast fertig  
**approved:** Fertig, öffentlich verfügbar  
**deprecated:** Veraltet, aber noch vorhanden  
**archived:** Nicht mehr relevant, aber archiviert

### 5.2 Review-Prozess

**Erstellung:**
1. Vorlage aus `_templates/` verwenden
2. Metadaten ausfüllen
3. Inhalt erstellen
4. Selbst-Review durchführen

**Review:**
1. Pull Request erstellen
2. Automatische Checks (Links, Format)
3. Peer-Review anfordern
4. Feedback einarbeiten
5. Genehmigung & Merge

**Wartung:**
1. Quartalweise Review-Check
2. `review_due` Datum beachten
3. Veraltete Dokumente aktualisieren/archivieren
4. Links überprüfen

### 5.3 Automatisierungs-Regeln

**CI/CD Integration:**
- Markdown-Linting in PRs
- Link-Integritäts-Checks
- Metadaten-Validierung
- Auto-Update von `updated` Datum

**Release-Management:**
- CHANGELOG automatisch aktualisieren
- Version-Tags setzen
- Dokumentation deployen

## 🔍 6. Qualitätssicherung

### 6.1 Mindestanforderungen

**Inhaltliche Qualität:**
- Klares Ziel definiert
- Zielgruppe bekannt
- Aktuell und korrekt
- Verständlich geschrieben

**Strukturelle Qualität:**
- Vollständige Metadaten
- Korrekte Formatierung
- Funktionierende Links
- Inhaltsverzeichnis vorhanden

**Technische Qualität:**
- Markdown valide
- Code-Beispiele lauffähig
- Screenshots aktuell
- Diagramme lesbar

### 6.2 Review-Checkliste

**Vor Veröffentlichung:**
- [ ] Metadaten vollständig?
- [ ] Inhaltsverzeichnis aktuell?
- [ ] Alle Links funktionieren?
- [ ] Code-Beispiele getestet?
- [ ] Sprache konsistent?
- [ ] Emoji-Konventionen eingehalten?
- [ ] Zielgruppe angemessen?

**Bei Änderungen:**
- [ ] `updated` Datum aktualisiert?
- [ ] `version` erhöht?
- [ ] Verwandte Dokumente aktualisiert?
- [ ] CHANGELOG aktualisiert?

## 🔗 7. Querverweise & Navigation

### 7.1 Interne Verlinkung

**Relative Links:** Verwende relative Pfade für Dokumente im selben Ordner
```markdown
[Verwandtes Thema](related-topic.md)
```

**Absolute Links:** Verwende absolute Pfade für Dokumente in anderen Ordnern
```markdown
[Setup-Anleitung](/docs/02-implementation/setup/environment.md)
```

**Anker-Links:** Verwende Anker für Abschnitte innerhalb eines Dokuments
```markdown
[Siehe Konfiguration](#konfiguration)
```

### 7.2 Zentrale Navigation

**DOCS_INDEX.md:** Zentraler Index mit allen Dokumenten
- Automatisch generiert aus Metadaten
- Nach Typ und Zielgruppe sortiert
- Volltextsuche

**Breadcrumb-Navigation:** In jedem Dokument
```markdown
Home > 02-Implementation > Setup > Environment
```

## 📊 8. Automatisierungs-Tools

### 8.1 Empfohlene Tools

**Markdown-Linting:**
- `markdownlint-cli2` für Format-Checks
- Integration in CI/CD Pipeline

**Link-Checking:**
- `markdown-link-check` für Link-Validierung
- Automatische PR-Checks

**Metadaten-Validation:**
- Custom Script für Frontmatter-Validierung
- Erforderliche Felder prüfen

**Auto-Generation:**
- Inhaltsverzeichnisse generieren
- Index-Seiten erstellen
- CHANGELOG automatisieren

### 8.2 Script-Beispiele

**DOCS_INDEX Generator:**
```bash
#!/bin/bash
# Generiert zentralen Dokumentations-Index
find docs/ -name "*.md" -exec grep -l "type:" {} \; | \
while read file; do
  # Metadaten extrahieren und Index erstellen
done
```

**Link-Checker:**
```bash
#!/bin/bash
# Prüft alle Markdown-Links
find docs/ -name "*.md" -exec markdown-link-check {} \;
```

## 🎯 9. Implementierungs-Leitfaden

### 9.1 Projekt-Setup

**1. Ordnerstruktur anlegen:**
```bash
mkdir -p docs/{01-architecture/{adr,design,patterns},02-implementation/{setup,configuration,migration},03-operations/{deployment,monitoring,troubleshooting},04-business/{features,strategy,portfolio},05-reference/{api,cli,glossary},_templates,_assets/{images,diagrams}}
```

**2. Vorlagen erstellen:**
- README.md.template
- ADR.md.template
- GUIDE.md.template

**3. Tools installieren:**
```bash
npm install -D markdownlint-cli2 markdown-link-check
```

### 9.2 Migration bestehender Dokumente

**1. Analyse:**
- Bestehende Dokumente inventarisieren
- Typ und Zielgruppe bestimmen
- Qualität bewerten

**2. Umstrukturierung:**
- In neue Ordnerstruktur verschieben
- Metadaten hinzufügen
- Format anpassen

**3. Bereinigung:**
- Veraltete Dokumente archivieren
- Duplikate entfernen
- Links aktualisieren

### 9.3 Wartungs-Plan

**Wöchentlich:**
- Neue Dokumente reviewen
- Link-Checks durchführen
- CI/CD überwachen

**Monatlich:**
- Review-Datum-Check durchführen
- Veraltete Dokumente identifizieren
- Index aktualisieren

**Quartalweise:**
- Vollständiges Review aller Dokumente
- Qualitätsoptimierung
- Archivierung durchführen

## 📞 10. Support & Troubleshooting

### 10.1 Häufige Probleme

**Links funktionieren nicht:**
- Pfad prüfen (relative vs absolute)
- Dateinamen auf Korrektheit prüfen
- Sonderzeichen vermeiden

**Metadaten nicht erkannt:**
- YAML-Syntax prüfen
- Frontmatter muss am Anfang stehen
- Keine Leerzeile vor `---`

**Formatierungsprobleme:**
- Markdown-Linting nutzen
- Emoji-Konventionen prüfen
- Code-Sprachangaben ergänzen

### 10.2 Hilfe-Ressourcen

**Interne Dokumentation:**
- `_templates/` für Vorlagen
- `DOCS_INDEX.md` für Überblick
- Team-Kontakte in README.md

---

## 📝 Änderungshistorie

### v1.0.0 (2025-12-17)
- Initialversion
- Vollständiges Regelwerk erstellt
- Basierend auf Best Practices aus Vibecoder Projekt
