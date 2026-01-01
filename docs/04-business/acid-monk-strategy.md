---
title: "Acid Monk: Viral Marketing Engine & Share Machine Strategy"
type: "business"
audience: "product-owner"
status: "approved"
priority: "high"
version: "1.0.0"
created: "2025-12-18"
updated: "2026-01-01"
tags: ["marketing", "strategy", "acid-monk"]
---

# Acid Monk: Viral Marketing Engine & Share Machine

Dieses Dokument beschreibt die Strategie, Architektur und Implementierung von Acid Monk nicht nur als "Sprüche-Generator", sondern als **Lead-Generation-Engine für Quievreux Services**.

---

## 🎯 Strategische Kern-Idee

**"Jeder generierte Spruch wird zur viralen Visitenkarte für deine Services."**

Der User kommt für den Spaß (Entertainment), teilt den Content (Viralität) und generiert dabei Reichweite für die echten Monetarisierungs-Produkte (Unlock Your Song, Consulting, etc.).

### 🛒 Das Ökosystem

Acid Monk fungiert als **Top-of-Funnel** Tool, das Traffic auf folgende Services leitet:

| Service                       | Acid Monk Hook                     | Zielgruppe              | Passender Kontext                        |
| ----------------------------- | ---------------------------------- | ----------------------- | ---------------------------------------- |
| **Unlock Your Song**          | "Persönlicher Song in Minuten"     | Geschenke-Suchende      | Geburtstage, Hochzeiten, Liebe, Jubiläen |
| **DreamEdit**                 | "Profi-Bildbearbeitung mit KI"     | Content Creators        | Bilder, Fotos, Visuelles                 |
| **Newsletter Command Center** | "Automatisiere dein Marketing"     | Solopreneure / Marketer | Business, URLs, Websites, Marketing      |
| **Quievreux Consulting**      | "KI-Integration für dein Business" | KMUs                    | Allgemeine Business-Themen               |

---

## 🏗️ Architektur & User Flow

### 1. Die Generierungs-Phase (Der Spaß-Faktor)

Der User interagiert mit **Acid Monk** (Web App):
1.  **Input**: Text, URL oder Bild (bald).
2.  **Charakter**: Wählt Persona (z.B. *Don Key* für Satire, *Melody* für Emotion).
3.  **Generierung**: KI erstellt Text + ElevenLabs generiert Audio.
4.  **Selektion**: User wählt den besten Spruch aus.

### 2. Die Share-Phase (Der Viral-Loop)

Anstatt nur eine MP3 herunterzuladen, erstellt der User ein **Share-Asset**:
1.  Klick auf **Share** (📤).
2.  System generiert eine unique **Share Page** (`/listen/[id]`).
3.  System erstellt ein **OG-Image** (Social Preview) mit Spruch + Branding + QR-Code.
4.  User teilt den Link via WhatsApp, Twitter, LinkedIn.

### 3. Die Conversion-Phase (Der Payoff)

Der Empfänger öffnet den Link:
1.  Sieht das **Branding-Image** (z.B. Don Key).
2.  Hört das **Audio** (Entertainment).
3.  Sieht einen **intelligenten CTA**, basierend auf dem Content (z.B. "Geburtstag" erkannt → "Schenk einen Song").
4.  Klickt und konvertiert auf der Zielseite (`unlock-your-song.de`).

---

## 📦 Technisches Datenmodell (Schema)

```prisma
// Erweiterung für prisma/schema.prisma

model ShareAsset {
  id            String   @id @default(cuid())
  
  // Content
  spruch        String   @db.Text
  characterId   String   // "don-key", "unlock-your-song", etc.
  audioUrl      String   // R2 URL
  
  // Ursprung / Kontext
  sourceType    String   // "TEXT", "URL", "IMAGE"
  sourceData    Json?    // Original-Input für Kontext-Analyse
  detectedTopics String[] // ["birthday", "party"] - für Smart CTA
  
  // Generierte Assets
  shareImageUrl String?    // Optional: Statisches R2 Bild
  
  // Analytics
  views         Int        @default(0)
  plays         Int        @default(0)
  ctaClicks     Int        @default(0)
  shares        Int        @default(0)
  
  createdAt     DateTime   @default(now())
  
  @@index([characterId])
}
```

## 🧠 Smart CTA Logik

Die Landing Page entscheidet dynamisch, welcher CTA angezeigt wird:

```typescript
function getCampaignForShare(share: ShareAsset): Campaign {
  // 1. Priorität: Explizites Profil
  if (share.characterId === 'unlock-your-song') return CAMPAIGNS.UNLOCK_YOUR_SONG;
  
  // 2. Priorität: Themen-Erkennung
  const topics = share.detectedTopics || [];
  
  if (topics.includes('birthday') || topics.includes('love')) return CAMPAIGNS.UNLOCK_YOUR_SONG;
  if (topics.includes('business') || topics.includes('marketing')) return CAMPAIGNS.NEWSLETTER;
  if (share.sourceType === 'IMAGE') return CAMPAIGNS.DREAMEDIT;
  
  // 3. Fallback
  return CAMPAIGNS.DEFAULT; // Eigenen Spruch erstellen
}
```

---

## 🎨 Visual Design System (Share Images)

Das Share-Image muss auf Social Media (WhatsApp Preview, Twitter Card) sofort auffallen.

**Layout (Quadratisch 1:1 Basis):**
- **Hintergrund**: Profil-Farbe (Don Key: Gold/Braun, Melody: Pink).
- **Zentrum**: Der Spruch in großer, fetter Typografie (`Inter Tight`).
- **Unten Links**: QR-Code zum Anhören (wenn als Bild geteilt).
- **Unten Rechts**: Branding / URL.
- **Visuals**: Optional das hochgeladene User-Bild im Hintergrund (abgedunkelt).

---

## 🛣️ Roadmap

### Phase 1: MVP (Abgeschlossen ✅)
- [x] Basis-Generator (Text/URL).
- [x] Profile (Don Key, Melody).
- [x] Audio-Preview.
- [x] Basis Share-Link Erstellung (`/listen/[id]`).
- [x] Dynamisches OG-Image.

### Phase 2: Intelligence & Polish (Aktuell)
- [ ] **Smart CTA**: Kontext-Erkennung implementieren (Perplexity liefert Topics mit).
- [ ] **R2 Integration**: Share-Bilder und Audios persistent speichern (statt live/temp).
- [ ] **Analytics**: Echte Views/Klicks tracken.
- [ ] **Mobile Optimierung**: Share-Page für Handy perfektionieren (Sticky Play Button).

### Phase 3: Expansion
- [ ] **Bild-Input**: "Foto machen, Spruch erhalten".
- [ ] **Gamification**: "Spruch des Tages", Leaderboards.
- [ ] **Direkt-Integration**: WhatsApp Share Button native.

---

## 💰 Business Case Rechnung

**Annahme:**
- 1000 generierte Shares / Monat.
- Ø 10 Views pro Share = 10.000 Touchpoints.
- CTR auf CTA = 5% (konservativ) = 500 Klicks auf Services.
- Conversion Rate Service = 2% = 10 Sales/Leads.

**Potenzial:**
- Bei 50€ Marge/Sale (Unlock Your Song) = **500€/Monat** direkter Wert.
- Brand Awareness für "Quievreux AI" = Unbezahlbar.
- Kosten (ElevenLabs/R2) ≈ 10-20€.

**ROI**: Extrem positiv, sobald der virale Loop (User teilt → Neuer User kommt) greift.

---

*Dokument erstellt am 18.12.2025*
