# Founder Tax TW (working name)

US tax compliance for Taiwanese founders who own a US company.

Built at **c0mpiled-18: YC Startup School Hackathon, Taipei Edition** (2026-11-11).
YC Request for Startups track: *The $15-an-Hour Expert* (Winter 2027).

## Problem

A Taiwanese founder opens a Delaware company in an afternoon. After that, nobody
tells them which US filings they owe, when they are due, or what the penalty is
for missing one. Today they track it in a spreadsheet and pay a CPA for work that
is mostly mechanical.

## What we are building tonight

One complete workflow:

1. Upload a Stripe export and bank statements.
2. AI determines which filings the company owes, with deadlines and penalties.
3. AI drafts each filing and flags every field it is unsure about, with its reasoning.
4. A non-credentialed reviewer clears an AI-generated checklist before a CPA signs.

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

Drafting calls the local [Claude Code](https://claude.com/claude-code) CLI (`claude`), so it uses whatever
Claude login that machine already has and needs no API key. If the CLI is missing, the app says so on
screen and falls back to keyword rules.

## Docs

- `docs/CONTEXT.md`: full project context for teammates (Traditional Chinese)
- `docs/tax-rules.md`: draft filing rules, all unverified until sourced
- `CLAUDE.md`: short working rules for AI coding assistants

## Why us

One of us is this user: a Taiwanese founder with a Delaware company. Existing
services pair a web form with a room of accountants and only cover the US side.
We cover both the US filings and the Taiwan-side consequences, and we put the
work in the hands of a non-credentialed reviewer backed by AI.

## Rules for this repo

- Everything here is built during the event.
- **Never commit real financial data.** Use the synthetic files in `sample-data/`.
- Not tax advice. Drafts require review by a licensed professional.

## Team

- Ray ([@SR0725](https://github.com/SR0725))
- [@maxyeh0817](https://github.com/maxyeh0817)
- [@FOwen123](https://github.com/FOwen123)
- Fourth teammate joining
