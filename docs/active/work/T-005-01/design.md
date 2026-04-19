# Design — T-005-01: trim-figures-to-9

## Options

### A. Delete the Oprah entry from FIGURES
Remove the single object literal at index 9. No other changes needed.

**Pros:** Minimal, correct, no side effects.
**Cons:** None.

### B. Replace Oprah with a different 10th character
Substitute a different figure to keep the count at 10.

**Pros:** Grid stays at 10 items.
**Cons:** User explicitly asked for 9. Adds scope.

## Decision

**Option A.** The user's explicit requirement is "9 characters." Delete the Oprah entry.

## Rejected

Option B — out of scope, user was clear.
