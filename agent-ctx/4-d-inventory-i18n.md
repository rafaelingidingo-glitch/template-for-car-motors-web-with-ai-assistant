# Task 4-d: Update InventorySection, CarCard, CarModal with i18n

## Summary
Successfully updated three component files to use the i18n translation system from `@/lib/i18n/context`.

## Changes Made

### 1. InventorySection.tsx
- Added `import { useLanguage } from "@/lib/i18n/context"`
- Added `const { t } = useLanguage()` hook call
- Replaced 30+ hardcoded English strings with `t.inventory.*` and `t.nav.*` keys
- All filter labels, placeholders, buttons, loading states, and empty states now use translations
- Styling, animations, and structure unchanged

### 2. CarCard.tsx
- Added `import { useLanguage } from "@/lib/i18n/context"`
- Added `const { t } = useLanguage()` hook call
- Replaced 5 hardcoded strings: seats, doors, viewDetails, inquireNow, sold
- Styling, animations, and structure unchanged

### 3. CarModal.tsx
- Added `import { useLanguage } from "@/lib/i18n/context"`
- Added `const { t } = useLanguage()` hook call
- Replaced 12 hardcoded strings with `t.carModal.*` keys
- DetailRow receives already-translated labels from parent (no changes to DetailRow itself)
- Styling, animations, and structure unchanged

## Verification
- ESLint passes with zero errors/warnings
- Dev server compiles successfully
- All components remain "use client"
