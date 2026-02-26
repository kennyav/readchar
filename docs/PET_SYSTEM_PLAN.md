# Pet System Plan: User-Grown Companion

This doc outlines what you need to bring a **pet** to life that is created from user interaction, evolves as the user grows, and is unique per user. The pet will replace the current reading companion and have a decay mechanism the devolves the progress of the pet over time if the user doesn't read for a while—**without requiring any pre-made art**.

---

## 1. Can you generate a pet with “no design”?

**Yes.** Your app already does this for the reading companion: **procedural generation**.

- **Current companion:** A **seed** + **books** → deterministic traits (skin, hair, eyes, shape) → **SVG** built from code. No sprites or assets.
- **Pet:** Same idea. Define a **pet trait model** (body shape, color, markings, size, “species” feel) and **derive every value from user data**. Render with **SVG or simple shapes** (circles, paths, gradients). No artwork required.

So: **design** = the rules and parameters (e.g. “ear shape index 0–3”, “primary color from palette”). You don’t need **art assets** (images, sprites); the pet is **generated** from those rules.

---

## 2. What you need to make the system work

### A. **Pet identity (unique per user)**

Uniqueness comes from **user-specific inputs**:

| Input | Purpose |
|-------|--------|
| **Seed** | Already have it (`useAvatarIdentity`). Use it (or a derivative) so the same user always gets the same “base” pet. |
| **Books** | Genres, count, order, themes. Shape which traits get stronger (e.g. more Fantasy → more “magical” look). |
| **Character attributes** | `CharacterState.attributes` (wisdom, curiosity, empathy, etc.). Good for personality or evolution stage. |
| **Reading time / level** | `totalReadingTime`, `currentLevel`, `totalBooksRead`. Drives evolution stages (egg → baby → grown, or similar). |

So: **same user + same behavior → same pet**. Different user or different reading path → different pet.

### B. **Pet data model**

You need a **stored representation** of the pet so the UI and evolution logic share one source of truth.

**Option 1 – Derived only (no new storage)**  
- Pet = pure function of `(seed, books, character)`.  
- Pros: No sync, no DB.  
- Cons: “Pet” can’t have its own history (e.g. name, one-off events) unless you encode them elsewhere.

**Option 2 – Stored pet state (recommended if you want names, milestones, or cross-device)**  
- Add a **Pet** (or `companion_pet`) type and store it (e.g. in Supabase with `user_id`).  
- Fields you might want:
  - `seed` or `identity_hash` (so rendering stays deterministic).
  - `stage` or `evolution_level` (egg, baby, adult, etc.).
  - `traits`: small object or JSON (e.g. `bodyType`, `primaryColor`, `markingStyle`).
  - Optional: `name`, `unlocked_at`, `last_evolved_at`.

Start with **Option 1** (pure function) to get behavior and visuals right; add **Option 2** when you need persistence or extra pet-specific state.

### C. **Evolution triggers**

Define **when** the pet changes. Map your existing user data into “growth”:

- **Books added** → e.g. every N books, or when total books cross a threshold → advance stage.
- **Reading time** → e.g. every X hours total reading → new stage or trait unlock.
- **Character level** → same as today’s level-up logic; pet can “level up” in sync.
- **Attribute milestones** → e.g. first time “imagination” passes 50 → unlock a trait.

All of this can live in a small **pet evolution module** that takes `CharacterState` + `Book[]` (+ optional stored pet) and returns **current stage** and **traits**.

### D. **Trait system (procedural “design”)**

Define a small set of **traits** that drive how the pet looks. Each trait is a **number or enum** derived from seed + user data. Examples:

- **Species / body type** – e.g. 0–2 from `seedValue(seed, "pet_species")` (blob, quadruped, winged).
- **Primary / secondary color** – from a palette; index from seed + dominant genre or top attribute.
- **Size or “stage”** – from evolution level (egg = 0.5, adult = 1.0).
- **Markings** – stripes, spots, none; index from seed + another key.
- **Accessories** – similar to companion equipment: after X Fantasy books, “tiny hat”; after Y Philosophy, “glasses.” Driven by genre distribution or attributes.

You already have **seedValue**, **genre distribution**, and **attribute values**; the pet is just another consumer of these.

### E. **Rendering (no assets)**

- **SVG:** Like `ReadingAvatar`, draw the pet with `<svg>` and shapes/paths. One component, e.g. `PetAvatar`, that takes `PetTraits` and `stage` and renders circles, ellipses, paths, gradients.
- **CSS + divs:** Simple pets (e.g. blob with eyes) can be divs with border-radius, box-shadow, and a few child elements for eyes/mouth.
- **Canvas:** Optional; only if you want animation or particles. Not required for a first version.

Recommendation: **SVG** so you can keep the same “hand-crafted procedural” style as the rest of the app.

### F. **Where the pet lives in the app**

- **Companion tab:** Show the pet next to (or instead of) the current companion, or as a “pet” that sits beside the reading avatar.
- **Evolution moment:** When the user crosses a threshold (e.g. level up, book count), show a short “Your pet evolved!” state (reuse the same pattern as your existing level-up toast).

---

## 3. Minimal path to “a pet that grows with the user”

1. **Pet trait type** – Define `PetTraits` (e.g. bodyType, primaryColor, stage, markingStyle) and a function `computePetTraits(seed, books, character): PetTraits`.
2. **Evolution stages** – Map `character.currentLevel` (and/or total books, reading time) to stages (e.g. 1–3: egg, 4–7: young, 8+: adult). No new tables yet.
3. **Render** – `PetAvatar.tsx`: takes `PetTraits`, renders a simple SVG (e.g. one body shape + eyes + optional markings). Reuse your existing color/theme tokens.
4. **Companion tab** – Use `computePetTraits` from `useAppData` + `useAvatarIdentity`, pass traits into `PetAvatar`, and show the pet in the Companion tab.
5. **Optional later:** Persist pet (e.g. name, last stage) in Supabase; add “Your pet evolved!” when stage changes; add more traits and accessories from genres/attributes.

---

## 4. Summary

| Question | Answer |
|----------|--------|
| Do I need pre-made art? | **No.** Procedural generation from traits (like your current companion) is enough. |
| What makes the pet unique? | **Seed + books + character state** (and optionally stored pet state). |
| What do I need to build? | **Trait model**, **evolution rules** (from existing data), **one render component (e.g. SVG)**, and **integration in Companion tab**. |
| Where does pet state live? | Start with **derived only**; add DB when you need persistence or pet-specific features. |

You have the data (seed, books, character, attributes); you only need to define the **pet trait schema**, the **mapping from user data → traits**, and a **simple procedural renderer** to make the system come to life.
