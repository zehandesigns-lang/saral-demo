# Ronak Agency — Dashboard Demo

A self-contained, static preview of the commission-agent dashboard, built to share via a link.

**Live demo:** https://zehandesigns-lang.github.io/saral-demo/ *(after you enable GitHub Pages — see below)*

## What this is

A single `index.html` page — no server, no build step, no database. It renders a working
commission-agent dashboard (this-week cards, outstanding & ageing, monthly sales/commission
chart, top manufacturers, and a searchable customer/manufacturer drill-down).

- **5 manufacturers** and **5 customers** are real business names from the agency's books.
- **Every amount, bill and date is randomly generated sample data** — no real financial
  information is included.

The real product reads the agency's own Microsoft Access database directly and refreshes
live; this demo bakes in fabricated figures so it can run anywhere as a plain web page.

## Publish it on GitHub Pages

1. Create a new **public** repository under your account (e.g. `saral-demo`).
2. Push this folder to it:
   ```bash
   git remote add origin https://github.com/zehandesigns-lang/saral-demo.git
   git branch -M main
   git push -u origin main
   ```
3. On GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch**,
   pick **main** / **/ (root)**, Save.
4. Wait ~1 minute. Your link will be:
   **https://zehandesigns-lang.github.io/saral-demo/**

Share that link with anyone — it opens in any browser, phone or desktop.
