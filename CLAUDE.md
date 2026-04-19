# CLAUDE.md

## Project

MindShift — a perspective-mapping tool that guides users through a 5-year vision exercise, then visualizes their goals as an interactive spatial mind map canvas with organic-shaped nodes per life category.

## Stack

Vanilla HTML/CSS/JS — single-file or multi-file HTML. No framework, no build step.

## Current State

- `mindshift.html` — latest version of the 5-screen linear wizard UI
- `mindshift (1).html`, `mindshift (2).html` — earlier iterations
- All UI logic is inline JS in the HTML files

## Design Reference

Figma: https://www.figma.com/design/Mubv0Ghdm2SPxF42JVsX8M/MindShift?node-id=19-99
- Section "old UI" — 5 screens of the current linear wizard
- Section "Lo-fi new UI for mind map screen" — the target: a spatial canvas mind map centered on "In 5 years..." with 7 organic-shaped nodes (career, creativity, health & wellness, relationships, travel, finances, Scandinavia) connected by curved arrows; each node shows goal bullets + mood board images



### Directory Conventions

```
docs/active/tickets/    # Ticket files (markdown with YAML frontmatter)
docs/active/stories/    # Story files (same frontmatter pattern)
docs/active/work/       # Work artifacts, one subdirectory per ticket ID
```

---

The RDSPI workflow definition is in docs/knowledge/rdspi-workflow.md and is injected into agent context by lisa automatically.
