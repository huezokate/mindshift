# MindShift - Phase Beta Specification
**Version:** 1.0  
**Date:** March 25, 2026  
**Purpose:** Collaborative mind mapping for planning and life goals

---

## Phase Beta Overview

**Two Distinct Paths:**
- **Beta.1:** Lightweight collaborative planning (trips, projects, decisions)
- **Beta.2:** Deep life mapping with 7 categories (5-year vision, personal growth)

**Core Value:** Transform perspectives into actionable plans with accountability and progress tracking

---

## Beta.1: Collaborative Planning Maps

### B1.1: Map Creation Flow
**Description:** User creates a focused, multi-aspect map  
**Components:**
- Start with a central question/goal (e.g., "Plan Europe trip")
- Add 2-3 main aspects/categories
- Each aspect becomes a branch
- Simple node-based layout
- Auto-save as you type

**Example Categories:**
- Trip planning: Stay, Travel, Entertainment
- Career decision: Skills needed, Timeline, Resources
- Event planning: Venue, Budget, Guest list

### B1.2: Node System
**Description:** Building blocks of the map  
**Components:**
- **Central node:** Main goal/question
- **Aspect nodes:** 2-3 main categories (level 1)
- **Detail nodes:** Sub-items under each aspect (level 2)
- **Action nodes:** Specific to-dos (level 3, optional)
- Drag to reposition
- Click to expand/collapse
- Color-code by status (to-do, in progress, done)

### B1.3: Collaboration Invite
**Description:** Share map with 1-2 people  
**Components:**
- "Invite collaborator" button
- Send via link or email
- Permissions: View-only or Edit
- Max 2 collaborators (Beta.1 limit)
- Real-time cursors (see who's editing)
- Comment threads on nodes

### B1.4: AI Assistance (Beta.1)
**Description:** Get perspective on your plan  
**Components:**
- "Ask a figure" on any node
- Historical figure gives input on that specific aspect
- Example: "What would Steve Jobs say about this timeline?"
- Responses appear as attached notes
- Can apply to entire map or individual nodes

### B1.5: Export & Share (Beta.1)
**Description:** Take your map elsewhere  
**Components:**
- Export as image (shareable)
- Export as PDF (printable)
- Share link (public view-only)
- Copy to clipboard (plain text outline)

---

## Beta.2: Life Vision Maps

### B2.1: 5-Year Vision Setup
**Description:** Guided setup for comprehensive life planning  
**Components:**
- Onboarding wizard: "Where do you want to be in 5 years?"
- 7 pre-defined categories (prompts for each)
- Can customize category names
- Each category starts as empty node
- Progress indicator (1/7 categories filled)

**Default 7 Categories:**
1. Career & Purpose
2. Health & Wellness
3. Relationships & Love
4. Financial Goals
5. Personal Growth & Learning
6. Creative Expression
7. Lifestyle & Environment

### B2.2: Category Deep Dive
**Description:** Prompts to fill each category  
**Components:**
- For each category, user answers 3 questions:
  - Where are you now?
  - Where do you want to be?
  - What's one step you can take?
- AI generates sub-nodes based on answers
- User can edit, add, or remove
- Visual: Category expands as you fill it

### B2.3: Timeline & Milestones
**Description:** Break 5 years into phases  
**Components:**
- Toggle timeline view
- Add milestones (3 months, 6 months, 1 year, 3 years, 5 years)
- Assign nodes to milestones
- Progress tracker: "You're 15% toward your 6-month goals"
- Visual: Gantt-style or roadmap view

### B2.4: Accountability System
**Description:** Keep user on track  
**Components:**
- Weekly check-ins (push notifications)
- "What did you accomplish this week?" prompt
- Mark nodes as "in progress" or "complete"
- Celebrate wins (confetti animation, streak tracking)
- Monthly reflection prompts

### B2.5: AI Life Coach Mode
**Description:** Get perspective on your entire life map  
**Components:**
- "Ask about my map" button
- Select a figure to analyze entire map
- AI identifies patterns, gaps, priorities
- Example: "Dolly notices you have lots of career goals but no self-care plans"
- Suggested rebalancing or next steps

### B2.6: Privacy & Sharing (Beta.2)
**Description:** Keep it private or share selectively  
**Components:**
- Default: Private (only you can see)
- Option: Share with 1 collaborator (therapist, coach, partner)
- Collaborator permissions: View-only or Comment-only (no editing)
- Revoke access anytime
- Export for personal use (PDF, image)

---

## Shared Features (Beta.1 + Beta.2)

### B3.1: Mind Map Canvas
**Description:** The actual interactive workspace  
**Components:**
- Infinite canvas (pan and zoom)
- Node creation (click to add)
- Drag to connect nodes
- Automatic layout suggestions
- Grid snap (optional)
- Keyboard shortcuts (tab to create child, enter for sibling)

### B3.2: Visual Customization
**Description:** Make it yours  
**Components:**
- Node colors (match Alpha color schemes)
- Node shapes (circle, square, rounded)
- Connection styles (straight, curved, angled)
- Background patterns (grid, dots, blank)
- Dark mode support
- Icons for nodes (optional)

### B3.3: Templates Library
**Description:** Pre-made maps to get started  
**Components:**
- Trip planning template
- Career pivot template
- 5-year life vision template
- Wedding planning template
- Business idea template
- Relationship goals template
- Fitness journey template

### B3.4: Inline Historical Perspective
**Description:** Apply Alpha's figure feature to nodes  
**Components:**
- Right-click any node → "Get perspective"
- Choose figure from dropdown
- Response appears as note attached to node
- Can get multiple perspectives on same node
- Keeps conversation context (remembers earlier nodes)

### B3.5: Progress Dashboard
**Description:** See your map at a glance  
**Components:**
- Summary view (all maps or one map)
- Completion percentage
- Recent activity
- Upcoming milestones
- Time spent on map
- Collaborator activity

---

## Transition from Alpha to Beta

### B4.1: Journal Entry → Map Upgrade
**Description:** Convert Alpha journal entry into Beta map  
**Components:**
- "Explore deeper" button on journal entries
- AI suggests categories based on journal history
- Example: "You've asked about career 5 times. Want to map it out?"
- One-click conversion to Beta.1 or Beta.2 map
- Journal entry becomes central question

### B4.2: Onboarding for Beta Users
**Description:** Smooth intro to mind mapping  
**Components:**
- Interactive tutorial (first-time only)
- Sample map to explore
- Video walkthrough (30 seconds)
- Tooltips on key features
- "Skip tutorial" option

### B4.3: Beta Access Gating
**Description:** When/how to unlock Beta  
**Components:**
- Free users: 1 Beta.1 map, 0 Beta.2 maps
- Premium users: Unlimited Beta.1, 1 Beta.2 map
- Pro tier (future): Unlimited both + advanced features
- Upgrade prompt when limit hit

---

## Backend Requirements (Beta-Specific)

### B5.1: Map Data Schema
**Description:** How maps are stored  
**Components:**
- Maps table (id, user_id, type, title, created_at, updated_at)
- Nodes table (id, map_id, parent_id, content, position_x, position_y, color, status)
- Connections table (id, from_node_id, to_node_id, style)
- Collaborators table (map_id, user_id, permission_level)
- Comments table (node_id, user_id, comment_text, created_at)

### B5.2: Real-Time Sync
**Description:** Multiplayer editing  
**Components:**
- WebSocket connection for live updates
- Operational Transform (OT) for conflict resolution
- Cursor positions broadcast to collaborators
- Lock mechanism (one person edits a node at a time)
- Auto-save every 2 seconds
- Offline mode with sync on reconnect

### B5.3: AI Context Window Management
**Description:** How AI sees the whole map  
**Components:**
- Serialize entire map as context for AI
- Truncate if exceeds token limit
- Prioritize: central node → level 1 → level 2
- Remember conversation history per map
- "Map summary" pre-prompt for AI

### B5.4: Collaboration Permissions System
**Description:** Who can do what  
**Components:**
- Owner: Full control (edit, delete, invite)
- Editor: Can add/edit/delete nodes, cannot invite others
- Commenter: Can add comments only
- Viewer: Read-only
- Permission change log (audit trail)

---

## Monetization (Beta)

### B6.1: Free Tier Limits
**Description:** What free users get  
**Components:**
- 1 Beta.1 map (up to 10 nodes)
- 0 Beta.2 maps
- 1 collaborator max
- 3 AI perspective requests per map
- Basic export (image only)

### B6.2: Premium Tier ($4.99/mo)
**Description:** Unlock more planning power  
**Components:**
- Unlimited Beta.1 maps
- 1 Beta.2 map (7 categories)
- 2 collaborators per map
- Unlimited AI perspectives
- All export formats (PDF, image, text)
- Priority support

### B6.3: Pro Tier ($9.99/mo - Future)
**Description:** For serious planners  
**Components:**
- Unlimited Beta.2 maps
- 5 collaborators per map
- AI life coach mode (cross-map insights)
- Advanced analytics
- White-label export (no branding)
- API access (future)

---

## UI/UX Considerations

### B7.1: Mobile vs Desktop
**Description:** Different experiences  
**Components:**
- **Mobile:** Linear view (collapsible tree), tap to expand
- **Desktop:** Full canvas view, drag-and-drop
- **Tablet:** Hybrid (canvas with touch gestures)
- Sync across devices
- "Continue on desktop" prompt for complex maps

### B7.2: Accessibility
**Description:** Inclusive design  
**Components:**
- Keyboard navigation (tab, arrow keys)
- Screen reader support
- High contrast mode
- Zoom controls
- Voice input (future)

### B7.3: Performance
**Description:** Handle large maps  
**Components:**
- Lazy load nodes (only render visible)
- Virtual scrolling for node lists
- Debounce auto-save
- Optimize for 100+ nodes
- Progress indicator for AI requests

---

## Analytics & Tracking (Beta)

### B8.1: Feature Usage
**Description:** What people actually use  
**Components:**
- Map creation rate (Beta.1 vs Beta.2)
- Average nodes per map
- Collaboration invites sent
- AI perspective requests
- Export/share actions
- Template usage

### B8.2: Engagement Metrics
**Description:** How sticky is Beta  
**Components:**
- Return rate (daily, weekly, monthly)
- Time spent on map
- Completion rate (fill all 7 categories in Beta.2)
- Milestone achievement rate
- Collaboration activity

### B8.3: Conversion Metrics
**Description:** Does Beta drive premium  
**Components:**
- Alpha → Beta transition rate
- Free → Premium conversion (Beta users)
- Upgrade triggers (hit limit, invite collaborator, etc.)
- Feature usage by tier
- Churn rate

---

## Technical Risks & Dependencies (Beta)

**High Risk:**
- B5.2: Real-time sync (complex, needs WebSockets or similar)
- B5.3: AI context management (token limits, large maps)
- B3.1: Mind map canvas (UX-heavy, requires library or custom build)

**Medium Risk:**
- B5.1: Map data schema (complex relationships, needs careful design)
- B5.4: Permissions system (security-critical)
- B7.1: Mobile vs desktop UX (different paradigms)

**Low Risk:**
- B3.2: Visual customization (straightforward UI)
- B3.3: Templates (static content)
- B4.1: Alpha → Beta transition (use existing data)

---

## Open Questions (Beta)

1. **Mind map library:** Build custom canvas or use library (e.g., React Flow, D3, Cytoscape.js)?
2. **Real-time tech:** WebSockets, Firestore, or something else?
3. **Mobile editing:** Full canvas or simplified tree view?
4. **Beta.2 prompts:** Are 7 categories fixed or customizable?
5. **Collaboration limits:** Should premium unlock more than 2 collaborators?
6. **AI memory:** Does AI remember context across sessions on same map?
7. **Offline mode:** How much can users do offline?
8. **Version history:** Can users roll back changes?

---

## Success Criteria (Phase Beta)

**Launch Goals (Month 1 post-Beta):**
- 30% of Alpha users try Beta
- 100 Beta.1 maps created
- 20 Beta.2 maps created (deeper commitment)
- 10% upgrade to Premium for Beta features
- 5+ active collaboration sessions

**Technical Goals:**
- Real-time sync latency <500ms
- Support maps up to 100 nodes without lag
- Auto-save success rate >99%
- Collaboration conflicts handled gracefully

**User Experience Goals:**
- Users complete their first map in <15 minutes
- 50%+ return to edit map within 7 days
- Positive sentiment on "planning" vs "fun" value
- Clear differentiation: Alpha = quick perspective, Beta = deep planning

---

## Future Considerations (NOT Phase Beta)

### B9.1: Advanced AI Features (Future)
**Description:** Smarter assistance  
**Components:**
- Auto-suggest nodes based on pattern
- Conflict detection ("Career goals clash with lifestyle goals")
- Progress predictions ("At this rate, you'll hit your milestone in 8 months")
- Smart milestones (AI suggests timeline)

### B9.2: Community Features (Future)
**Description:** Learn from others  
**Components:**
- Public map gallery (opt-in)
- Template marketplace
- "Maps like yours" suggestions
- Leaderboards (goals achieved)

### B9.3: Integrations (Future)
**Description:** Connect to other tools  
**Components:**
- Google Calendar (sync milestones)
- Notion/Obsidian (export maps)
- Todoist/Asana (convert nodes to tasks)
- Therapy platforms (share with therapist)

---

## Priority Notes (Beta)

**Must Have (P0) - Can't launch Beta without:**
- B3.1: Mind Map Canvas (core functionality)
- B1.1: Map Creation Flow (Beta.1 basics)
- B1.2: Node System (how maps work)
- B5.1: Map Data Schema (backend storage)
- B4.1: Alpha → Beta transition (hook from Alpha)

**Should Have (P1) - Needed for value:**
- B1.3: Collaboration Invite (key differentiator)
- B2.1: 5-Year Vision Setup (Beta.2 core)
- B2.2: Category Deep Dive (Beta.2 substance)
- B3.4: Inline Historical Perspective (Alpha integration)
- B5.2: Real-time Sync (multiplayer magic)

**Nice to Have (P2) - Enhances experience:**
- B2.3: Timeline & Milestones (advanced planning)
- B2.4: Accountability System (retention driver)
- B3.3: Templates Library (faster onboarding)
- B3.5: Progress Dashboard (engagement)
- B6.1-B6.3: Monetization tiers (can start simpler)

**Later (P3) - Post-launch optimization:**
- B2.5: AI Life Coach Mode (premium feature)
- B7.2: Advanced accessibility
- B8.1-B8.3: Detailed analytics
- B9.1-B9.3: Future features

---

**End of Phase Beta Spec**
