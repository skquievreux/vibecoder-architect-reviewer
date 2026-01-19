---
title: "Audio-First UX Concept"
type: "architecture"
audience: "designer"
status: "approved"
priority: "high"
version: "1.0.0"
created: "2026-01-01"
updated: "2026-01-01"
tags: ["ux", "audio", "concept", "frontend"]
---

# 🎧 Audio-First UX Konzept für Listen Page

**Problem-Analyse:**
1. ❌ Nutzer sieht sofort den Text → kein Anreiz zum Anhören
2. ❌ Unklar, ob Audio gerade abgespielt wird
3. ❌ Kein Auto-Play → Nutzer muss aktiv klicken
4. ❌ Text-Spoiler nimmt die Spannung

---

## 🎯 Ziel
**Der Nutzer soll den Hook HÖREN, nicht nur lesen.**

---

## 💡 Konzept-Vorschläge

### **Option A: "Audio-First mit Text-Reveal"** ⭐ EMPFOHLEN

#### Flow:
1. **Seite lädt** → Bild + Play-Button sichtbar
2. **Text ist verborgen** (Blur-Effekt oder "Tap to reveal")
3. **Audio startet automatisch** (nach 0.5s Verzögerung)
4. **Während Playback:**
   - Pulsierender Play-Button zeigt Aktivität
   - Wellenform-Animation oder Equalizer
   - Optional: Text erscheint **Wort für Wort** synchron zum Audio
5. **Nach Ende:** Text bleibt vollständig sichtbar

#### Vorteile:
- ✅ Fokus auf Audio-Erlebnis
- ✅ Visuelles Feedback (Animation)
- ✅ Text als Bonus nach dem Hören
- ✅ Spannung bleibt erhalten

#### Mockup:
```
┌─────────────────────────────┐
│                             │
│      [Bild mit Blur]        │
│                             │
│   ┌───────────────────┐     │
│   │  "🎧 Hör zu..."   │     │
│   │   [▶ PLAYING]     │     │  ← Pulsierend
│   │   ━━━━●━━━━━      │     │  ← Fortschrittsbalken
│   └───────────────────┘     │
│                             │
│   [Text noch verborgen]     │  ← Blur oder "Tap to reveal"
│                             │
└────────────────────────────┘
```

---

### **Option B: "Karaoke-Style"** 🎤

#### Flow:
1. Audio startet automatisch
2. Text erscheint **Wort für Wort** synchron zum Voiceover
3. Aktuelles Wort wird highlighted
4. Nach Ende: Kompletter Text bleibt sichtbar

#### Vorteile:
- ✅ Maximale Engagement
- ✅ Text + Audio perfekt synchronisiert
- ✅ Sehr dynamisch

#### Nachteile:
- ⚠️ Technisch aufwendig (Timing-Daten nötig)
- ⚠️ Funktioniert nur, wenn Audio-Länge bekannt

---

### **Option C: "Minimalist mit Play-Aufforderung"**

#### Flow:
1. Seite zeigt nur Bild + großen Play-Button
2. Text ist komplett ausgeblendet
3. **Kein Auto-Play** → Nutzer muss klicken
4. Nach Klick: Audio + Text erscheinen gleichzeitig
5. Während Playback: Visuelles Feedback (Equalizer)

#### Vorteile:
- ✅ Nutzer hat Kontrolle
- ✅ Kein unerwarteter Sound
- ✅ Einfach zu implementieren

#### Nachteile:
- ⚠️ Nutzer könnte Play-Button übersehen
- ⚠️ Höhere Absprungrate

---

## 🎨 Visuelle Feedback-Elemente

### 1. **Pulsierender Play-Button**
```css
@keyframes pulse-play {
  0%, 100% { 
    transform: scale(1); 
    box-shadow: 0 0 0 0 rgba(6, 182, 212, 0.7);
  }
  50% { 
    transform: scale(1.05); 
    box-shadow: 0 0 0 20px rgba(6, 182, 212, 0);
  }
}
```

### 2. **Wellenform-Animation**
```
━━━━━━━━━━━━━━━━━━━━
  ▁▃▅▇█▇▅▃▁  ← Animiert während Playback
━━━━━━━━━━━━━━━━━━━━
```

### 3. **Equalizer-Bars** (wie Spotify)
```
█ ▄ █ ▃ ▇ ▅ █  ← Tanzen im Takt
```

### 4. **Fortschrittsbalke mit Wellen-Effekt**
```
🌊━━━━━━●━━━━━━━━━ 0:08 / 0:15
```

---

## 🚀 Implementierungs-Empfehlung

### **Phase 1: Quick Win (Option A - Vereinfacht)**

**Änderungen:**
1. ✅ **Auto-Play aktivieren** (mit 500ms Verzögerung)
2. ✅ **Text initial ausblenden** (Blur-Filter)
3. ✅ **Play-Button pulsiert** während Audio läuft
4. ✅ **"Tap to reveal text"** Button unter dem Player
5. ✅ **Nach Audio-Ende:** Text automatisch einblenden

**Code-Änderungen:**
```typescript
// ListenPageUI.tsx
const [textRevealed, setTextRevealed] = useState(false);
const [audioPlaying, setAudioPlaying] = useState(false);

useEffect(() => {
  // Auto-reveal text after audio ends
  if (!audioPlaying && hasPlayed) {
    setTimeout(() => setTextRevealed(true), 500);
  }
}, [audioPlaying]);

// SpruchDisplay mit Blur
<SpruchDisplay 
  text={share.spruch}
  className={textRevealed ? "" : "blur-md select-none"}
/>

// Reveal Button
{!textRevealed && (
  <button onClick={() => setTextRevealed(true)}>
    📖 Text anzeigen
  </button>
)}
```

---

### **Phase 2: Premium Experience (Option B)**

**Zusätzliche Features:**
- Word-by-word reveal mit Timing
- Waveform-Visualisierung
- Ambient Player duckt automatisch während Hook läuft
- Share-Animation nach Audio-Ende

---

## 📊 A/B Test Hypothesen

### Metriken:
1. **Audio Completion Rate** (Wie viele hören bis zum Ende?)
2. **Text Reveal Rate** (Wie viele klicken auf "Text anzeigen"?)
3. **Share Rate** (Erhöht sich durch bessere Experience?)
4. **Bounce Rate** (Verlassen Nutzer früher?)

### Test-Varianten:
- **A:** Aktuell (Text sofort sichtbar, kein Auto-Play)
- **B:** Auto-Play + Text verborgen
- **C:** Auto-Play + Text blur + Reveal-Button

---

## 🎯 Finale Empfehlung

**Start mit Option A (vereinfacht):**

1. ✅ **Auto-Play nach 500ms** (Browser-Policy beachten)
2. ✅ **Text mit Blur-Effekt** (filter: blur(8px))
3. ✅ **Pulsierender Play-Button** während Playback
4. ✅ **"📖 Text anzeigen" Button** (optional)
5. ✅ **Auto-Reveal nach Audio-Ende**

**Warum?**
- Schnell implementierbar (1-2 Stunden)
- Großer UX-Gewinn
- Messbare Verbesserung der Audio-Completion-Rate
- Kein Breaking Change (Text bleibt verfügbar)

---

## 🔧 Technische Umsetzung

### Browser Auto-Play Policy:
```typescript
// Muted Auto-Play ist erlaubt
// Unmuted Auto-Play nur nach User-Interaction

// Lösung: Starte muted, dann fade-in
audioRef.current.muted = true;
audioRef.current.play().then(() => {
  // Fade in volume
  audioRef.current.muted = false;
});
```

### Accessibility:
- Screen Reader Announcement: "Audio wird abgespielt"
- Skip-Button für Nutzer, die nicht warten wollen
- Keyboard-Navigation (Space = Play/Pause)

---

**Nächster Schritt:** Soll ich Option A implementieren? 🎧
