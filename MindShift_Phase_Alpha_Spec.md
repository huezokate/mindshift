# MindShift - Phase Alpha Specification
**Version:** 1.0  
**Date:** March 25, 2026  
**Purpose:** Mobile-first perspective playground with journal feature

---

## Core User Flow

### F1: Landing Experience
**Description:** First impression, sets tone  
**Components:**
- Single text input: "What's on your mind?"
- Character limit: 280 chars
- Placeholder examples cycling through
- Minimal UI, notepad aesthetic

### F2: Figure Selection
**Description:** Visual grid of historical figures  
**Components:**
- 10-15 hand-drawn silhouettes
- Tap to select
- Brief descriptor under each (3-5 words)
- Scrollable grid layout

### F3: Response Generation
**Description:** AI-generated perspective from chosen figure  
**Components:**
- Loading state (2-3 seconds)
- Response appears in notepad style
- Figure silhouette displayed
- 150-300 word response
- Figure's voice/tone

### F4: Customization Tools
**Description:** Make the response shareable/pretty  
**Components:**
- 3 color schemes (Bright Pop, Muted Earth, High Contrast)
- Dark mode toggle
- Basic sticker pack (5-7 stickers)
- Preview before sharing

### F5: Share Functionality
**Description:** Export to social media  
**Components:**
- Generate mobile-optimized image (vertical)
- One-tap IG Story share
- One-tap TikTok share
- Subtle watermark: "mindshift.app"
- Copy link option

---

## Account & Persistence

### F6: Anonymous Usage (Pre-Account)
**Description:** No account needed for first 3 uses  
**Components:**
- localStorage for session data
- Session counter
- No login walls
- Browser-based saves

### F7: Account Creation Prompt
**Description:** Subtle unlock after 3 uses  
**Components:**
- Modal: "Save your perspective journal?"
- Google OAuth (one-tap)
- Apple OAuth (one-tap)
- Email magic link fallback
- Instant gratification message

### F8: Journal View
**Description:** Saved entries chronologically  
**Components:**
- Chronological feed
- Filter by figure
- Entry cards (question + figure + date)
- Tap to expand
- Re-share option
- Re-customize option

---

## Monetization Features

### F9: Free Tier Limits
**Description:** What free users get  
**Components:**
- 3 perspectives per question max
- 3 color schemes
- Basic sticker pack
- Unlimited journal saves (post-account)
- Watermark on shares

### F10: Premium Upgrade Prompt
**Description:** When/how to show paid tier  
**Components:**
- Triggered at 3-perspective limit
- Modal showing premium benefits
- $1.99/mo or $9.99/yr pricing
- "Unlock all figures" messaging

### F11: Premium Features
**Description:** What paid users get  
**Components:**
- Unlimited perspectives per question
- All figures unlocked (50+ eventually)
- Premium sticker packs
- No watermark on shares
- Priority support (future)

---

## Backend Requirements

### F12: API Integration
**Description:** Claude Haiku calls for perspective generation  
**Components:**
- Cloudflare Function (serverless)
- POST to /functions/generate-response
- System prompt per figure
- User question as input
- Response parsing and display

### F13: User Authentication
**Description:** OAuth and session management  
**Components:**
- Google OAuth integration
- Apple OAuth integration
- Magic link email system
- Session tokens
- Secure storage

### F14: Database Schema
**Description:** What data we store  
**Components:**
- Users table (id, email, created_at, premium_status)
- Entries table (id, user_id, question, figure, response, created_at)
- Customizations table (entry_id, color_scheme, stickers_used)
- Usage tracking (API call counts for billing)

---

## Content & Design Assets

### F15: Figure Roster (Launch)
**Description:** Initial 10-15 historical figures  
**Components:**
- Socrates (philosophy, questioning)
- Abraham Lincoln (persistence, leadership)
- Dolly Parton (authenticity, resilience)
- Marcus Aurelius (stoicism, control)
- Maya Angelou (voice, expression)
- Steve Jobs (vision, simplicity)
- Marie Curie (persistence, barriers)
- Nelson Mandela (patience, vision)
- Amelia Earhart (courage, boundaries)
- Rosa Parks (strength, dignity)
- [5 more TBD based on appeal/diversity]

### F16: Visual Design System
**Description:** Aesthetic components  
**Components:**
- Hand-drawn silhouettes (SVG, 10-15)
- 3 color palettes (hex codes defined)
- Dark mode palette
- Basic sticker pack (SVG, 5-7)
- Typography (2 fonts max: heading + body)
- Spacing system (8px grid)

### F17: Copywriting & Tone
**Description:** Voice of the app  
**Components:**
- Welcome copy
- Empty states
- Error messages
- Upgrade prompts
- Social share text
- Figure descriptor copy (3-5 words each)

---

## Technical Infrastructure

### F18: Frontend (Mobile-First)
**Description:** What the user interacts with  
**Components:**
- React or similar framework
- Responsive breakpoints (mobile → tablet → desktop)
- PWA capabilities (add to home screen)
- Offline mode (view saved journal)
- Loading states for all async actions

### F19: Hosting & Deployment
**Description:** Where the app lives  
**Components:**
- Cloudflare Pages (already set up)
- Auto-deploy from GitHub
- SSL/HTTPS
- Custom domain (mindshift.app)
- Analytics (Google Analytics or Plausible)

### F20: Performance & Optimization
**Description:** Speed and efficiency  
**Components:**
- Image optimization (WebP, lazy loading)
- API response caching (where appropriate)
- Minified CSS/JS
- Fast initial load (<2 seconds)
- Smooth animations (60fps)

---

## Analytics & Tracking

### F21: User Behavior Metrics
**Description:** What we measure  
**Components:**
- Questions asked (anonymized)
- Figures selected (popularity)
- Customizations used
- Shares completed
- Account creation rate
- Premium conversion rate

### F22: Business Metrics
**Description:** Revenue and costs  
**Components:**
- API call costs (Claude Haiku usage)
- MRR (Monthly Recurring Revenue)
- Churn rate
- CAC (Customer Acquisition Cost via social shares)
- LTV (Lifetime Value)

---

## Future Considerations (NOT Phase Alpha)

### F23: Stage 2 Teaser
**Description:** Hint at mind mapping  
**Components:**
- "Explore deeper" button on journal entries
- Subtle messaging after 5+ entries
- Preview of what mind mapping looks like
- NOT built yet, just teased

### F24: Community Features (Future)
**Description:** Social elements (not now)  
**Components:**
- Share journal publicly (opt-in)
- See what others asked
- Trending questions
- Figure leaderboards

---

## Priority Notes

**Must Have (P0) - Can't launch without:**
- F1: Landing Experience
- F2: Figure Selection
- F3: Response Generation
- F5: Share Functionality
- F12: API Integration
- F15: Figure Roster (at least 10)
- F18: Frontend (mobile-first)

**Should Have (P1) - Needed for retention:**
- F4: Customization Tools
- F6: Anonymous Usage
- F7: Account Creation
- F8: Journal View
- F13: User Authentication
- F14: Database Schema
- F16: Visual Design System

**Nice to Have (P2) - Enhances experience:**
- F9: Free Tier Limits (can be unlimited initially)
- F10: Premium Upgrade Prompt
- F11: Premium Features
- F17: Copywriting & Tone (can be basic)
- F21: User Behavior Metrics

**Later (P3) - Post-launch optimization:**
- F19: Hosting optimization (already have basic)
- F20: Performance tweaks
- F22: Business Metrics
- F23: Stage 2 Teaser
- F24: Community Features

---

## Technical Risks & Dependencies

**High Risk:**
- F12: API Integration (currently broken, needs backend fix)
- F13: User Authentication (OAuth setup complexity)
- F14: Database Schema (need to choose DB solution)

**Medium Risk:**
- F16: Visual Design System (requires design work)
- F15: Figure Roster (requires content/prompt engineering)
- F4: Customization Tools (sticker UX needs testing)

**Low Risk:**
- F1-F3: Core flow (straightforward UI)
- F5: Share Functionality (standard web APIs)
- F18: Frontend (CC can build this)

---

## Open Questions

1. **Database choice:** Supabase, Firebase, or Cloudflare D1?
2. **Figure expansion:** How do we add figures post-launch without rebuild?
3. **Sticker interaction:** Drag-drop or auto-place?
4. **Response timing:** Instant or typewriter effect?
5. **Premium trigger:** Show upgrade after 3 uses or wait longer?
6. **Journal organization:** Tags/topics or just chrono + figure filter?

---

## Success Criteria (Phase Alpha)

**Launch Goals (Month 1):**
- 1,000 users try the tool
- 300 create accounts (30% conversion)
- 50 shares to social media (5% share rate)
- API costs < $50
- 10 premium conversions ($20 MRR)

**Technical Goals:**
- <2 second load time
- <5% error rate on API calls
- 99% uptime
- Mobile responsive on iOS + Android

**User Experience Goals:**
- Users complete flow in <2 minutes
- 50%+ return for 2nd question
- Positive sentiment in shared content
- Clear brand recognition ("MindShift")

---

**End of Phase Alpha Spec**
