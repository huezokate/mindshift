# T-008-01 Research: Portrait Hashes + Design Token Map

## Portrait Image Hashes (all 15 confirmed)

| Figure | Figma imageHash |
|---|---|
| Socrates | e7e56d650f73fe3ed6e8409d3ad225fef79de4b7 |
| A. Lincoln | 52347d1d6f616676f495c561bd82dc0d24055448 |
| Dolly Parton | 48ff0f825a268629573f4bff8e6f2c8f9c6d7220 |
| N. Mandela | 1ff19f904f4fbb75cb4b755d5e63aa284b8a0bb9 |
| Rosa Parks | 8dc7cbba6dca5fd0057ce7b2ed15e13f7c90a459 |
| Maya Angelou | 8021860afb9e77e06eab636a85ea15d5331213b0 |
| Frida Kahlo | d46a4202627698f1845db14c2aa7513293d6e856 |
| Che Guevara | 59e91cf971d672367078ddb42d72670715bbf86a |
| Ching Shih | 2311c6460d2e3f173c1bc5d1d54b99299fc96c98 |
| M. Gandhi | c77ba7e09c194e7fc30cb5e49c56b8f3419fcaad |
| Napoleon | 94841b3b9e45430ee166f6109d216faff3eb2575 |
| Salvador Dalí | ed2d7486f571dc687927ecc4dea89c15dbf2a247 |
| Chuck Norris | 15ccd921a70a3394b18ec106799db479e030e682 |
| D. Trump | 4a7c31910117c66fbcabb8b25d73141a24f933e8 |
| V. Lenin | edb23437c0112bc90083be8688f90974a95d6bc2 |

## Exact Color Tokens (from node 200-2866)

| Token | Hex | 0-1 Range |
|---|---|---|
| BG | #080810 | r:8/255 g:8/255 b:16/255 |
| BG-card | #0D0D1A | r:13/255 g:13/255 b:26/255 |
| NEON Blue | #00F5FF | r:0 g:245/255 b:1 |
| Header text | #E0F7FF | r:224/255 g:247/255 b:1 |
| Secondary text | #7ECFDF | r:126/255 g:207/255 b:223/255 |
| NEON Green | #39FF14 | r:57/255 g:1 b:20/255 |
| NEON Pink | #FF2D78 | r:1 g:45/255 b:120/255 |
| NEON Violet | #B04CFF | r:176/255 g:76/255 b:1 |

## Asymmetric Border Patterns

| Component | top | right | bottom | left | color |
|---|---|---|---|---|---|
| Button Primary | 4 | 1 | 1 | 4 | #39FF14 |
| Button Secondary | 1 | 2 | 2 | 1 | #FF2D78 |
| Input field (main) | 4 | 1 | 1 | 4 | #00F5FF |
| ADD CARD | 1 | 4 | 2 | 4 | #FF2D78 |
| LENS RESPONSE | 1 | 4 | 4 | 1 | #B04CFF |

## Typography

| Style | Family | Weight | Size | Line Height | Tracking | Case |
|---|---|---|---|---|---|---|
| H1 | Courier Prime | Bold | 28px | 26.1px | 4.2px | UPPER |
| H2 | Courier Prime | Bold | 18px | normal | 1.44px | UPPER |
| Body | Courier Prime | Regular | 14px | 20.8px | 0.52px | - |
| Subhead | Courier Prime | Bold | 12px | normal | 1.32px | UPPER |
| Tooltip | Courier Prime | Regular | 10px | 12px | 1px | UPPER |
| Button | Alumni Sans SC | SemiBold | 14px | normal | 2.6px | UPPER |

## Portrait Specs

- Size: 102×102px
- Border radius: 40px
- Normal: 2px border #FF2D78
- Selected: 4px border #FF2D78 + drop shadow ({radius:10,color:#FF4664} + {radius:30,color:#FF2D7833})

## Glow Effects

- NEON Green text glow: shadow radius 10 #39FF1466 + radius 30 #39FF1426
- Applied to lens names in selected state
