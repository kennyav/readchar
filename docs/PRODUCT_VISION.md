# Product Vision: ReadChar

## Goal

**Help people rediscover reading.**

Reading is a habit that atrophies when we stop. ReadChar makes that visible and rewarding by tying your habit to a companion that grows with you—and gently reflects when you step away.

---

## Core Loop

- **Read more** → Your character/pet **grows**. Attributes (wisdom, curiosity, empathy, etc.) go up. The companion evolves visually (stages, accessories, aura).
- **Read less or stop** → A **decay** rate applies. Stats decrease and the companion **devolves** (e.g. weaker form, duller look). Like real life: when we stop practicing or studying, we forget; the app mirrors that “use it or lose it” feeling.

So the pet is both a reward for reading and a gentle, non-shaming reflection of consistency.

---

## Roadmap (order of work)

1. **Redesign** — Main page and overall aesthetic: pet as hero, “reading companion” feel, clearer hierarchy. *(current focus)*
2. **Pet stages** — Define and build distinct visual stages for the companion (e.g. seedling → growing → strong; or by level bands). Make growth and devolution visible through the character art.
3. **Decay** — Implement decay logic (time since last read, streak breaks) and wire it to stats + character state so the pet can devolve when the user doesn’t read.

---

## Notes

- Attributes already map to genres and improve with books + reading sessions; decay will reduce these over time when inactive.
- Copy and UI should emphasize “companion” and “rediscover reading,” not only “level up” or “stats.”
