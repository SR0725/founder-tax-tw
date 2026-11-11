# GoTax: hackathon demo

For: the YC founder judges at c0mpiled-18 (2026-11-11). 90-second demo video.
Chinese version: `docs/video-script-bilingual.md`.

Three parts: the problem → an animation, then the live demo → the market we start with.

- The demo is the real app running on the synthetic data in `public/sample-data/`. The numbers on screen are what the app shows on 2026-11-11; see "Where the numbers come from".
- "Not tax advice" stays on screen the whole time, not spoken.

## Script

| # | Shot | Line | On screen |
|---|---|---|---|
| | | **The problem** | |
| 1 | FACE | Meet Ray. He's a Taiwanese founder with two US companies. | Ray on camera, or a photo of Ray; lower third "Ray · Taiwanese founder · 2 US companies" |
| 2 | FACE | We're Taiwanese founders too. Opening a US company is so hard, with so much paperwork, that you miss something. | Face |
| 3 | FACE | Then suddenly, you find out about Form 5472, and a $25,000 penalty. | "Form 5472 · $25,000" big on screen |
| 4 | FACE | Nobody told Ray. Now he's stuck paying a CPA every year, just to copy numbers from the bank into forms. | Face |
| | | **Animation (to add later)** | |
| A | | | Animation before the demo. Not written yet |
| | | **The demo** | |
| 5 | VO | So we built GoTax. | Home page (Today), headline "Your 2 US companies owe 8 filings in 2027." |
| 6 | VO | It lists every filing your US companies owe, in date order: when each one is due, and what missing it costs. | Pan the three cards: Next deadline "82 days", Known penalty exposure "$31,200.00 USD", "3 questions"; then down the filings list |
| 7 | VO | Every deadline and penalty comes from an official source. | Open the Form 5472 row: "$25,000 per missed form", red "In 155 days" badge; hover "Official source" |
| 8 | VO | And it also flags the Taiwan side: your personal Taiwan tax return, which a US accountant never looks at. | Click the "Taiwan side" filter: "Your personal Taiwan return: overseas income and CFC rules" |
| 9 | VO | Give it the company's bank statement, and the AI sorts every transaction. | Click "Draft Form 5472"; click "Use the sample statement"; cut the ~11 s wait; "Read 15 transactions. 5 are reportable. 4 need a decision."; scroll to the flagged "WIRE IN TAIPEI FUBON" row and its reason |
| 10 | VO | And you're the final reviewer. Only then does it go to a CPA to sign. | Tick each box, counter climbs to "8 of 8"; button turns to "Ready for CPA signature" |
| | | **The market** | |
| 11 | FACE | We're starting with Taiwanese founders, or people who run US companies. Then every founder in Asia building one. | Face |
| 12 | FACE | So the next founder learns about all of these forms from us, not from the IRS. | Callback to "Form 5472 · $25,000", then end card: GoTax · team · GitHub link · Not tax advice |

About 175 spoken words, roughly 55 seconds, leaving about 35 seconds for the animation and the demo to play between lines.

## Where the numbers come from

All from the app on the synthetic data, checked on 2026-11-11.

| Number on screen | Where it comes from |
|---|---|
| 2 companies, 8 filings | Today page: "Your 2 US companies owe 8 filings in 2027" |
| 82 days, 155 days | Next deadline (Form 1099-NEC, 2027-02-01) and Form 5472 (2027-04-15), counted from 2026-11-11. **They change daily**: re-read them if you record on another day |
| $25,000 | Form 5472's rule in `src/lib/obligations.ts`; still unverified, check https://www.irs.gov/instructions/i5472, Penalties |
| $31,200 | Today page's "Known penalty exposure": $25,000 (Form 5472) + $6,000 (Form 1065: $250 × 2 members × 12 months) + $200 (Delaware tax) |
| 15, 5 and 4 transactions; 8 of 8 | Draft page after "Use the sample statement", classified by Claude. The keyword fallback gives the same 5, 4 and 8; check the take matches |

## Before recording

| Item | What to do |
|---|---|
| Green source badge on the draft | Record on a machine with the `claude` CLI logged in, so the badge reads "Transactions classified by Claude" and not the orange keyword-rules note |
| Animation | Write and build the animation for row A |
