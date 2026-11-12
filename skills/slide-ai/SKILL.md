---
name: slide-ai
description: Use when the user asks for a slide deck, presentation, pitch or proposal as a PowerPoint (.pptx) file. Builds the deck from a declarative spec with slide-ai-kit (fixed-grid templates, a theme for brand colours/fonts/logos), validates content limits, then renders to PDF and looks at every page before delivering.
license: Apache-2.0
---

# slide-ai

Build themed .pptx decks with `slide-ai-kit`. The kit owns layout; you own the story.

## 0. Preflight

```bash
command -v slide-ai >/dev/null || echo "Install: npm i -g github:sparklabx/slide-ai-kit"
slide-ai workflow     # the build loop, with the kit's absolute import paths
slide-ai templates    # what each template takes, and its limits
slide-ai themes       # bundled themes
```

If `slide-ai` is missing, tell the user the install command; don't install global packages yourself.

## 1. Brief

Ask before building when unknown: audience, language, goal of the deck, brand (theme), and the facts the
slides must state. Never invent numbers, dates, customers or claims; mark anything you had to assume as
a placeholder in your reply.

## 2. Theme

Use the user's theme if they have one. Otherwise copy `themes/default/` into their project, set `name`,
`footer`, colours (`dark` is the cover background, `primary`/`accent` the highlights), fonts and logos
(PNG `{ path, aspect }`: `word`, `wordWhite`, `mark`, `markWhite`). Never write into the kit itself.

## 3. Plan, then build

Outline one message per slide: cover → sections → content → closing. Then write a build script in the
user's project (see `slide-ai workflow`) and run it. `buildDeck` validates first: on an error, split the
slide or cut text. Never shrink fonts to make content fit.

Screenshots: PNG only. Crop away browser/app chrome that carries no message, so the content reads at
slide size. Use `screen` (image + up to 4 points) for product tours, `hero` sparingly.

## 4. Look at it

```bash
slide-ai render deck.pptx                 # → deck.pdf (LibreOffice)
pdftoppm -r 60 -png deck.pdf /tmp/deck    # then view the pages
```

Check: overflow, cut-off text, big empty areas, cramped cards, screenshots too small to read, logo
placement on dark vs light slides. Fix and rebuild; about two rounds.

## 5. Deliver

Give the .pptx and the .pdf paths, plus a short list of placeholders or unverified claims. Fonts not
installed on the reader's machine fall back in PowerPoint, so the PDF is the safest to send. Edit and
re-run the build script for revisions; don't keep v2/v3 copies unless the user asks for a new version.
