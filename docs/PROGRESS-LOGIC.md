# How the Logic Flows

1. **Config: `ProgressiveDataLayers.ts`**
   - Defines which data fields belong to each layer
     (`basic`, `intermediate`, `advanced`, `expert`).
   - Exported as `DATA_LAYERS`.

2. **Unlock Logic: `ProgressiveDataUnlocks.ts`**
   - Contains the function `getUnlockedLayers(gameState)` that determines which layers
     are unlocked based on the current game state.
   - Well-documented and easy to adjust.

3. **Usage in UI: `MapPage.tsx` (ProgressiveDataPanel)**
   - Imports both `DATA_LAYERS` and `getUnlockedLayers`.
   - Maps the current `gameState` to the shape expected by `getUnlockedLayers`.
   - Renders all fields for each unlocked layer, using a helper (`getFieldValue`)
     to extract the correct value from `gameState`.
   - Shows an animation/message when a new layer is unlocked.

---

## **What’s Connected**

- **Config → Unlock Logic:**The unlock logic is independent of the config,
  but both use the same layer names.
- **Unlock Logic → UI:**The UI calls `getUnlockedLayers` with the current
  game state to determine which layers to show.
- **Config → UI:**The UI uses `DATA_LAYERS` to know which fields to render
  for each unlocked layer.
- **UI → Helper:**
  The UI uses `getFieldValue` to display the correct value for each field.

---

## **What’s Left for You**

- You can further refine the `getFieldValue` helper to handle new
  fields or more complex value logic.
- You can style the panel and unlock message for a better user experience.
- You can add new layers or fields by updating the config and helper.

---

## **Summary Table**

| File                      | Role/Responsibility          | Connected? |
| ------------------------- | ---------------------------- | ---------- |
| ProgressiveDataLayers.ts  | Layer/field config           | ✅         |
| ProgressiveDataUnlocks.ts | Unlock logic based on game   |
| state                     | ✅                           |
| MapPage.tsx               | UI: renders unlocked fields, |
| uses both                 | ✅                           |
| (ProgressiveDataPanel)    | config and unlock logic      |            |
