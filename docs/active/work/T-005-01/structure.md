# Structure — T-005-01: trim-figures-to-9

## Files Modified

- `mindshift.html` — remove the Oprah Winfrey entry from FIGURES (line 2110)

## Files Created

None.

## Change Shape

Single-line deletion inside the FIGURES array literal. The trailing comma on the Steve Jobs entry (line 2109) becomes the new last entry — the comma after it must also be removed to keep valid JS (or kept if the trailing comma is already valid, which it is in modern JS — but to be safe, remove it to match the style of the array).

Actually in modern JS, trailing commas in arrays are valid. The existing entries all have trailing commas. Removing line 2110 leaves Steve Jobs as the last entry with a trailing comma — this is valid and consistent with the existing style.
