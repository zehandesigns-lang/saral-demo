# Ronak Agency — Dashboard Demo

A self-contained, static preview of the commission-agent dashboard — the full multi-page
experience, running entirely in the browser with no server or database.

**Live demo:** https://zehandesigns-lang.github.io/saral-demo/

## What's inside

The real product's pages, served statically. A small `data.js` generates a sample dataset
and answers all of the pages' `/api/…` calls in the browser, so every feature works:

- **Dashboard** (`index.html`) — "this week" cards with hyperlinks, big-picture KPIs,
  **outstanding & ageing** with a **collection worklist** (oldest bill remaining, days overdue),
  monthly chart, concentration, top manufacturers, and a searchable party box.
- **Customer page** (`buyer.html`) — every bill, with period and paid/unpaid filters.
- **Manufacturer page** (`manufacturer.html`) — commission bills, with the same filters.
- **Weekly sales** (`sales.html`) and **Weekly commission** (`commweekly.html`) — week →
  party → bill drill-downs, with a searchable manufacturer filter.
- **Bill** (`bill.html`) and **Commission bill** (`commbill.html`) — printable invoice / note.

5 manufacturers and 5 customers use **real business names** from the agency's books, but
**every amount, bill and date is randomly generated sample data** — no real financial
information. The live product reads the agency's own database directly and refreshes live.

## Hosting

Static files on GitHub Pages (branch `main`, root). No build step. To update, edit the
files and `git push`; Pages redeploys automatically.
