---
title: "New Profile Workflow Implementation Guide"
type: "architecture"
audience: "developer"
status: "approved"
priority: "medium"
version: "1.1.0"
created: "2025-12-28"
updated: "2026-01-01"
tags: ["workflow", "profile", "guide", "implementation"]
---

# 🛠️ Workflow: Create New Profile (Implementation Guide)

This document describes the **complete end-to-end process** for integrating a new profile (Character/Brand) into the Acid Monk Generator.

> ⚠️ **CRITICAL:** Follow ALL steps in order. Missing steps (especially database migration) will cause production issues!

---

## 🏗️ 1. Conceptual Preparation (The Vibe)

Before coding, ensure you have the following assets and definitions ready:

### A. Identity & Branding
*   **Slug:** URL identifier (e.g., `story-spark`, `iron-voice`, `music-hooks`).
    - ⚠️ **MUST be lowercase with hyphens** (kebab-case)
    - ⚠️ **MUST be unique** across all profiles
    - ⚠️ **MUST match** between database, topics-config, and all code references
*   **Tenant ID:** UUID of the tenant this profile belongs to (usually `f59b5aab-7290-48d2-8f97-8d316f6452e2` for ACID MONK)
*   **Profile ID:** Generate a new UUID for the profile (e.g., `123e4567-e89b-12d3-a456-426614174009`)
*   **Names:** Display Name (e.g., "✨ Story Spark") and internal ID.
*   **Sponsor:** Name and URL for the branding fallback (e.g., "Zound Lab").

### B. Visual Style
*   **Colors:** Primary, Secondary, and Accent colors.
*   **Theme Color:** Tailwind color name (e.g., `purple`, `red`, `amber`, `orange`) for UI components.
*   **Particle Effect:** `chaos` (wild), `hearts` (romantic), `stars` (magical), `fire` (aggressive), `snow`, `waves`.
*   **Background Animation:** `float` (calm), `ken-burns` (slow zoom), `breathe` (pulse).

### C. Audio Strategy
*   **Voice ID:** ElevenLabs Voice ID (ensure it's added to the project and tested).
*   **Ambient Music:** 3-5 MP3 tracks that define the vibe (hosted on R2/CDN).
*   **Ambient Mode:** Does it need a new genre in ambient tracks? (e.g., `magical`, `gym`, `bistro`, `mystic`)

---

## 💻 2. Implementation Steps

Follow these steps **IN ORDER** to add a new profile.

### ⚠️ Step 0: Database Migration (CRITICAL - DO THIS FIRST!)

**File:** `supabase/migrations/YYYYMMDD_add_[profile-name]_profile.sql`

Create a new migration file with the current date and profile name.

```sql
-- Add [Profile Name] Profile
-- Created: YYYY-MM-DD
-- Description: Adds the [Profile Name] generator profile

INSERT INTO am_generator_profiles (
    id, tenant_id, slug, name, shortcut, is_active,
    branding, voice_config, ui_config, ai_config, created_at
) VALUES (
    '123e4567-e89b-12d3-a456-426614174XXX', -- Generate unique UUID
    'f59b5aab-7290-48d2-8f97-8d316f6452e2', -- Default tenant
    'your-profile-slug', -- ⚠️ CRITICAL: Must match topics-config!
    '🎯 Your Profile Name',
    'YP', -- 2-letter shortcut
    true,
    '{
        "sponsorName": "Sponsor Name",
        "sponsorUrl": "https://sponsor-url.com",
        "showSponsor": true
    }'::jsonb,
    '{
        "voiceId": "ELEVENLABS_VOICE_ID",
        "settings": {
            "stability": 0.5,
            "similarity_boost": 0.75,
            "style": 0.5,
            "use_speaker_boost": true
        }
    }'::jsonb,
    '{
        "title": "🎯 YOUR PROFILE",
        "subtitle": "Profile Tagline",
        "description": "Profile description for users.",
        "features": [
            {"icon": "🎵", "text": "Feature 1"},
            {"icon": "⚡", "text": "Feature 2"},
            {"icon": "🌟", "text": "Feature 3"}
        ],
        "inputLabel": "Input Label",
        "step1Title": "Step 1 Title",
        "filenamePattern": "profile-filename",
        "themeColor": "purple"
    }'::jsonb,
    '{
        "systemRole": "Du bist [Profile Name], ein [description]. Deine Persönlichkeit ist [traits]. Du nutzt Begriffe wie [keywords].",
        "promptTemplate": "Analysiere das Thema von {url}. Generiere {count} [style] Sprüche. Stil: [style]. Themen: [themes]. Sprache: {language}. Output nur die Sätze, einer pro Zeile. KEINE Anführungszeichen."
    }'::jsonb,
    NOW()
) ON CONFLICT (id) DO UPDATE SET 
    branding = EXCLUDED.branding,
    voice_config = EXCLUDED.voice_config,
    ui_config = EXCLUDED.ui_config,
    ai_config = EXCLUDED.ai_config,
    is_active = true;
```

**Apply Migration:**
```bash
# Local development (if using Supabase CLI)
supabase db push

# Production (via Supabase Dashboard)
# Go to SQL Editor → Paste migration → Run
```

---

### Step 1: Define Audio Assets (Ambient Tracks)

**File:** `src/lib/ambient-tracks.ts`

1.  **Add Tracks:**
    Add a new key to the `DEMO_TRACKS` object with your CDN MP3 URLs.
    ```typescript
    export const DEMO_TRACKS: Record<string, Track[]> = {
        // ... existing
        'magical': [ // New Category for Story Spark
             { id: 's1', title: 'Magical Night', src: `${BASE_URL}/StorySpark_01_Magical_Night.mp3` },
             { id: 's2', title: 'Star Dust', src: `${BASE_URL}/StorySpark_02_Star_Dust.mp3` },
             { id: 's3', title: 'Dream Journey', src: `${BASE_URL}/StorySpark_03_Dream_Journey.mp3` },
        ],
    };
    ```

2.  **Update Ambient Mode Type:**
    Add your new mode to the type definition:
    ```typescript
    ambientMode?: 'romantic' | 'fun' | 'mystic' | 'water' | 'gym' | 'bistro' | 'magical' | 'default';
    ```

---

### Step 2: Configure Topic Page (if applicable)

**File:** `src/lib/topics-config.ts`

If this profile should have a dedicated topic page, add it to `TOPICS_CONFIG`:

```typescript
export const TOPICS_CONFIG: Record<string, TopicConfig> = {
    // ... existing
    'your-topic-slug': {
        slug: 'your-topic-slug',
        title: 'Topic Title',
        description: 'Short description for the topic page.',
        seoDescription: 'SEO-optimized description for search engines.',
        filterProfiles: ['your-profile-slug'], // ⚠️ MUST match database slug!
        excludeTags: ['unwanted', 'tags', 'to', 'filter', 'out'], // Optional
        gradientFrom: 'from-purple-600',
        gradientTo: 'to-indigo-900',
        ambientMode: 'magical' // Must match ambient-tracks.ts key
    }
};
```

**⚠️ CRITICAL VALIDATION:**
- `filterProfiles` array MUST contain the **exact slug** from the database migration
- Test the topic page URL: `https://yoursite.com/topic/your-topic-slug`
- Verify content appears (not empty page)

---

### Step 3: Update RSS Feed Configuration

**File:** `src/app/api/rss/[slug]/route.ts`

The RSS feed system automatically uses `topics-config.ts`, so if you added a topic page in Step 2, the RSS feed will be auto-generated.

**Verify RSS Feed:**
- URL: `https://yoursite.com/api/rss/your-topic-slug`
- Test in RSS reader (e.g., Feedly, RSS Bot)

**Add RSS Auto-Discovery (Optional):**
If you want the topic page to advertise its RSS feed:

**File:** `src/app/topic/[slug]/page.tsx`

The RSS link tag is already implemented in the metadata, so no changes needed!

---

### Step 4: Configure Profile Tags (Generator UI)

**File:** `src/lib/profile-tags.ts`

Define the categorization system (Tags) for the new profile. This drives the prompt generation UI.

```typescript
export const PROFILE_TAGS = {
    // ... existing
    'your-profile-slug': { // ⚠️ MUST match database slug!
        categories: [
            {
                name: 'Anlass',
                tags: [
                    { id: 'bedtime', label: '🌙 Gute-Nacht', keywords: ['einschlafen', 'bett', 'traum'] },
                    { id: 'adventure', label: '🦁 Abenteuer', keywords: ['held', 'reise', 'quest'] },
                    // ... more tags
                ]
            },
            {
                name: 'Stimmung',
                tags: [
                    { id: 'calm', label: '😌 Ruhig', keywords: ['entspannt', 'sanft', 'friedlich'] },
                    { id: 'exciting', label: '⚡ Spannend', keywords: ['action', 'tempo', 'dynamisch'] },
                    // ... more tags
                ]
            }
        ],
        quickCombos: [
            { label: '🌙 Traumreise', tags: ['bedtime', 'fantasy', 'calm'] },
            { label: '🦁 Heldenreise', tags: ['adventure', 'exciting', 'brave'] },
            // ... more combos
        ]
    }
};
```

---

### Step 5: Visuals & Components (UI Integration)

**File:** `src/components/landing/ListenPageUI.tsx`

1.  **Background Gradient:**
    Update the `bgClass` logic to include your new slug and gradient.
    ```typescript
    const bgClass =
        profile?.slug === 'story-spark' ? 'bg-gradient-to-br from-indigo-900 via-purple-900 to-black' :
        profile?.slug === 'iron-voice' ? 'bg-gradient-to-br from-orange-900 via-red-900 to-black' :
        profile?.slug === 'your-profile-slug' ? 'bg-gradient-to-br from-[color1] via-[color2] to-black' :
        // ... default
    ```

2.  **Particle Effects:**
    Map the slug to a particle type (`stars`, `hearts`, `chaos`, `waves`, `fire`).
    ```typescript
    const particleVariant = 
        ['story-spark'].includes(slug) ? 'stars' : 
        ['iron-voice'].includes(slug) ? 'fire' :
        ['your-profile-slug'].includes(slug) ? 'stars' :
        // ... default
    ```

3.  **Floating Orbs:**
    Map the slug to an orb color variant.
    ```typescript
    <FloatingOrbs 
        variant={
            slug === 'story-spark' ? 'mystic' : 
            slug === 'iron-voice' ? 'fire' :
            slug === 'your-profile-slug' ? 'mystic' :
            'default'
        } 
    />
    ```

4.  **Ambient Player Mode:**
    Ensure the `mode` prop passed to `<AmbientPlayer />` matches the key you created in Step 1.
    ```typescript
    const audioMode = 
        slug === 'story-spark' ? 'magical' : 
        slug === 'iron-voice' ? 'gym' :
        slug === 'your-profile-slug' ? 'magical' :
        'default';
    ```

---

### Step 6: Update Homepage (Profile Selection)

**File:** `src/app/page.tsx`

The homepage automatically fetches all active profiles from the database, so no code changes needed!

**Verify:**
- New profile appears on homepage
- Click "Starten" navigates to correct generator page
- Profile card shows correct icon, name, and description

---

## 🎨 7. Asset Management (Audio Pipeline)

If you have new audio tracks:

1.  **Place raw MP3s** in `scripts/audio-pipeline/input/`.
2.  **Update mapping** in `scripts/process-audio.js`:
    ```javascript
    const MAPPING = [
        { key: 'Raw_Filename_01', target: 'YourProfile_01_Track_Name.mp3' },
        { key: 'Raw_Filename_02', target: 'YourProfile_02_Track_Name.mp3' },
    ];
    ```
3.  **Run compression:**
    ```bash
    npm run compress-audio
    ```
4.  **Upload to R2:**
    ```bash
    npm run upload-audio
    ```
5.  **Verify URLs** are accessible: `https://cdn.unlock-your-song.de/acid-monk/ambient/YourProfile_01_Track_Name.mp3`

---

## ✅ Complete Checklist

### Database & Backend
- [ ] **Database Migration** created and applied (`supabase/migrations/`)
- [ ] **Profile Slug** is unique and consistent across all files
- [ ] **Tenant ID** and **Profile ID** are correct UUIDs
- [ ] **Voice ID** tested in ElevenLabs and working

### Audio Assets
- [ ] **MP3s uploaded** to R2 and accessible publicly
- [ ] **Ambient Tracks** defined in `src/lib/ambient-tracks.ts`
- [ ] **Ambient Mode** added to type definition
- [ ] **Audio URLs** verified (no 404s)

### Configuration Files
- [ ] **Topic Page** configured in `src/lib/topics-config.ts` (if applicable)
- [ ] **Profile Tags** defined in `src/lib/profile-tags.ts`
- [ ] **RSS Feed** verified at `/api/rss/[topic-slug]` (if applicable)

### UI Integration
- [ ] **Background Gradient** set in `ListenPageUI.tsx`
- [ ] **Particle Effects** configured in `ListenPageUI.tsx`
- [ ] **Floating Orbs** variant set in `ListenPageUI.tsx`
- [ ] **Ambient Player Mode** mapped in `ListenPageUI.tsx`

### Testing
- [ ] **Homepage** shows new profile card
- [ ] **Generator Page** loads at `/[profile-slug]`
- [ ] **Topic Page** shows content (not empty) at `/topic/[topic-slug]`
- [ ] **RSS Feed** validates at `/api/rss/[topic-slug]`
- [ ] **Audio Generation** works end-to-end
- [ ] **Share Page** displays correctly at `/listen/[shareId]`

### Production Deployment
- [ ] **Database Migration** applied to production Supabase
- [ ] **Audio Files** uploaded to production R2
- [ ] **Code Deployed** to Vercel
- [ ] **Smoke Test** completed on production URL

---

## 🚨 Common Pitfalls & Solutions

### Issue: Topic Page is Empty
**Cause:** Profile slug mismatch between `topics-config.ts` and database.

**Solution:**
1. Check database: `SELECT slug FROM am_generator_profiles WHERE is_active = true;`
2. Verify `filterProfiles` in `topics-config.ts` matches **exactly**
3. Example: Database has `music-hooks`, but config has `acid-monk` ❌

### Issue: RSS Feed Returns 404
**Cause:** Topic slug not in `TOPICS_CONFIG`.

**Solution:**
1. Add topic to `src/lib/topics-config.ts`
2. Verify URL: `/api/rss/[topic-slug]` matches `TOPICS_CONFIG` key

### Issue: Audio Doesn't Play
**Cause:** Ambient mode not defined or MP3 URLs broken.

**Solution:**
1. Check `DEMO_TRACKS` in `ambient-tracks.ts` has your mode
2. Verify MP3 URLs return 200 (not 404)
3. Check browser console for CORS errors

### Issue: Profile Not on Homepage
**Cause:** `is_active = false` in database or migration not applied.

**Solution:**
1. Check database: `SELECT * FROM am_generator_profiles WHERE slug = 'your-slug';`
2. Ensure `is_active = true`
3. Clear Next.js cache: `rm -rf .next && npm run dev`

---

## 📋 Example: Complete Profile Addition

See existing profiles for reference:
- **Iron Voice (Fitness):** `supabase/migrations/20251225_add_new_profiles.sql` (lines 5-54)
- **Wave Guide (SUP):** `supabase/migrations/20251221_add_wave_guide_profile.sql`
- **Music Hooks (ACID MONK):** Check database directly (original profile)

---

## 🔄 Profile Update Workflow

To update an existing profile:

1. **Modify Database:**
   ```sql
   UPDATE am_generator_profiles 
   SET 
       branding = '{"sponsorName": "New Name", ...}'::jsonb,
       ui_config = '{"title": "New Title", ...}'::jsonb
   WHERE slug = 'profile-slug';
   ```

2. **Update Code** (if UI changes):
   - `topics-config.ts` (if topic page exists)
   - `ambient-tracks.ts` (if audio changes)
   - `ListenPageUI.tsx` (if visual changes)

3. **Deploy** and verify changes in production.

---

*Last Updated: 2025-12-28 (v1.18.3)*
*Includes: Database Migration, Topic Pages, RSS Feeds, Slug Consistency*
