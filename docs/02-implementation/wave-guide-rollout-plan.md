---
title: "Wave Guide Profile Implementation Plan"
type: "implementation"
audience: "developer"
status: "approved"
priority: "high"
version: "1.0.0"
created: "2025-12-21"
updated: "2026-01-01"
tags: ["wave-guide", "rollout", "plan", "profile"]
---

# 🌊 WAVE GUIDE SUP-Profil - Implementierungsplan (Executive Summary)

**Status:** 🟡 Bereit zur Umsetzung  
**Erstellt:** 2025-12-21  
**Geschätzte Umsetzungszeit:** 1-2 Tage

---

## 📋 Übersicht

Das **WAVE GUIDE** Profil ist ein neues Character-Profil für SUP (Stand-Up Paddling) Verleiher, Schulen und Events. Es folgt dem etablierten Workflow aus `concept-new-profile-workflow.md`.

**Zielgruppe:** 500-800 SUP-Stationen im DACH-Raum  
**Tonalität:** Entspannt, naturverbunden, Flow-State  
**Farben:** Sky Blue (#0EA5E9), Cyan (#06B6D4), Sunset Orange (#F59E0B)

---

## ✅ Was bereits definiert ist

- [x] Konzept & Identität
- [x] Farbschema & Visuelles Design
- [x] Voice-Konfiguration (ElevenLabs Rachel)
- [x] AI System Role & Prompt Template
- [x] Beispiel-Hooks für Marketing
- [x] Suno AI Prompts für Ambient Audio
- [x] Detaillierter Implementierungsplan

**Siehe:** `.agent/workflows/wave-guide-implementation.md`

---

## 🚀 Nächste Schritte (Priorisiert)

### Phase 1: Datenbank (30 Min)

#### 1. SQL Migration erstellen
```bash
# Datei: supabase/migrations/20251221_add_wave_guide_profile.sql
```

**Inhalt:** Siehe `.agent/workflows/wave-guide-implementation.md` Phase 2.1

**Ausführen:**
```bash
# Falls Supabase CLI vorhanden:
supabase db push

# Alternativ: Manuell im Supabase Dashboard SQL Editor
```

#### 2. TypeScript Profile aktualisieren (Optional)
**Datei:** `src/lib/profiles.ts`  
**Aktion:** Neues Profil-Objekt hinzufügen (siehe Plan Phase 2.2)

---

### Phase 2: Frontend - Visuelle Integration (2-3 Std)

#### 3. ListenPageUI.tsx - 5 Änderungen
**Datei:** `src/components/landing/ListenPageUI.tsx`

**Änderungen:**
- [ ] A. Hintergrund-Farbe (bgClass) → `wave-guide` Gradient
- [ ] B. Partikel-Effekt (particleVariant) → `'waves'`
- [ ] C. Floating Orbs (orbsMode) → `'water'`
- [ ] D. Bild-Animation (imageAnimation) → `'animate-float'`
- [ ] E. Typography Variant (typographyVariant) → `'water'`

**Details:** Siehe Plan Phase 3.1

---

#### 4. AmbientPlayer.tsx - Audio-Kategorie
**Datei:** `src/components/landing/AmbientPlayer.tsx`

**Änderungen:**
- [ ] Interface erweitern: `mode?: ... | 'water'`
- [ ] DEMO_TRACKS erweitern mit `water: [...]`
- [ ] Theme Colors definieren für `mode === 'water'`

**WICHTIG:** MP3-URLs müssen später durch echte R2-URLs ersetzt werden (Platzhalter OK für jetzt)

**Details:** Siehe Plan Phase 3.2

---

#### 5. ParticleBackground.tsx - Neue Variante
**Datei:** `src/components/landing/ParticleBackground.tsx` (oder ähnlich)

**Änderungen:**
- [ ] Neue `case 'waves':` hinzufügen
- [ ] CSS Animation `@keyframes float-wave` (falls nötig)

**Details:** Siehe Plan Phase 3.3

---

#### 6. FloatingOrbs.tsx - Neue Kategorie
**Datei:** `src/components/landing/FloatingOrbs.tsx`

**Änderungen:**
- [ ] Interface erweitern: `mode?: ... | 'water'`
- [ ] `getOrbColors()` erweitern mit `case 'water':`

**Details:** Siehe Plan Phase 3.4

---

### Phase 3: Assets & Media (1-2 Std)

#### 7. Hero-Bild generieren
**Tool:** `generate_image`

**Prompt:**
```
Stand-up paddleboarding at sunset, silhouette of person on SUP board,
calm lake with mirror reflection, golden hour lighting,
mountains in background, peaceful and serene atmosphere,
cinematic composition, warm orange and blue tones,
professional photography style, 16:9 aspect ratio
```

**Speicherort:** `public/images/wave-guide-hero.webp`

---

#### 8. Ambient Audio erstellen (Optional - kann später)
**Tool:** Suno AI

**3 Tracks:**
1. Ocean Waves (60 BPM, meditative)
2. Tropical Vibes (85 BPM, laid-back)
3. River Flow (70 BPM, peaceful)

**Prompts:** Siehe Plan Phase 3 (Original)

**Upload zu R2:** `ambient/wave-guide/`

---

### Phase 4: Testing (1 Std)

#### 9. Lokaler Test
```bash
npm run dev
```

**Checkliste:**
- [ ] `/wave-guide` Route lädt
- [ ] Gradient-Hintergrund korrekt (Blau/Cyan)
- [ ] Wellen-Partikel sichtbar
- [ ] Floating Orbs in Wasser-Farben
- [ ] Ambient Player zeigt "Water" Kategorie
- [ ] Profil erscheint auf Homepage

---

#### 10. Funktionale Tests
**Test-URLs:**
- `https://www.sup-station-beispiel.de` (Dummy)
- - Oder echte SUP-Website

**Erwartung:**
- URL-Analyse generiert poetische, naturverbundene Hooks
- Max. 12-15 Wörter
- Keine aggressiven Sales-Phrasen

---

## 📂 Betroffene Dateien (Zusammenfassung)

### Neu zu erstellen:
1. `supabase/migrations/20251221_add_wave_guide_profile.sql`
2. `public/images/wave-guide-hero.webp` (via generate_image)

### Zu bearbeiten:
1. `src/lib/profiles.ts` (Optional)
2. `src/components/landing/ListenPageUI.tsx` ⭐ **Hauptänderung**
3. `src/components/landing/AmbientPlayer.tsx`
4. `src/components/landing/ParticleBackground.tsx`
5. `src/components/landing/FloatingOrbs.tsx`

---

## 🎯 Quick Win - Heute machbar

**Minimale Version (2-3 Std):**
1. ✅ SQL Migration (30 Min)
2. ✅ ListenPageUI.tsx Änderungen (1 Std)
3. ✅ AmbientPlayer.tsx (30 Min - mit Platzhalter-URLs)
4. ✅ FloatingOrbs.tsx (30 Min)
5. ✅ ParticleBackground.tsx (30 Min)
6. ✅ Lokaler Test (30 Min)

**Später hinzufügen:**
- Hero-Bild (kann Platzhalter nutzen)
- Echte Ambient-Audio-Files (R2 Upload)
- Marketing-Material

---

## 🤔 Offene Fragen

1. **Particle-Komponente:** Wie heißt die Datei genau?
   - Suche nach: `ParticleBackground`, `Particles`, oder ähnlich
   - Grep: `grep -r "particleVariant" src/`

2. **Ambient Player:** Sind Platzhalter-URLs OK für ersten Test?
   - Empfehlung: Ja, später durch R2-URLs ersetzen

3. **Voice-Test:** Soll ich einen Test-Hook generieren?
   - Empfehlung: Ja, nach Frontend-Integration

---

## 📞 Nächster Schritt - DEINE Entscheidung

**Option A: Sofort starten (Ich mache es)**
→ Ich erstelle die SQL-Migration und beginne mit den Frontend-Änderungen

**Option B: Erst Dateien prüfen**
→ Ich suche zuerst die Particle- und Orbs-Komponenten, um die genaue Struktur zu verstehen

**Option C: Schrittweise mit Feedback**
→ Ich mache Schritt 1 (SQL), du testest, dann weiter

**Was möchtest du?** 🎯
