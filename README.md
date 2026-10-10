# AI Automation Builds

**Five working AI agents that take over specific manual tasks.**

Small businesses lose leads because nobody answers the phone. Receipts get filed
by hand. Sales calls aren't prepared. This repo is five finished builds that
address those tasks — each one running, each one deployable.

---

## What's in here

| # | Build | What it does | Who it's for |
|---|-------|--------------|--------------|
| 01 | **Telegram Receipt Assistant** | Photograph a receipt → it reads the vendor, date, total, tax, and category, and files it in a spreadsheet. Over $500? It emails you. | Anyone expensing anything |
| 02 | **Website Lead Chatbot** | A chatbot on a solar company's site that answers questions and books estimates. Trained on that company's own services and pricing. | Local service businesses |
| 03 | **Speed-to-Lead Voice Agent** | Someone fills in a form → within seconds an AI **calls them**. It qualifies them, and only patches through to a human if they clear the bar. Trades, clinics, anyone who lives on inbound calls | High-value, speed-sensitive businesses |
| 04 | **Sales Copilot** | Before every call, the rep gets a briefing: who this is, what they've done, what was discussed last time, what's likely to be asked. Plus live scraping and research during the call. | Sales teams |
| 05 | **AI Lead Qualifier** | A form fills up → the system checks whether the person is worth a real conversation, and if so, emails them a booking link automatically. | Businesses drowning in junk leads |

---

## Why these five

They're ordered from simple to genuinely advanced, and each one addresses a task
that small businesses do by hand and lose money on:

- Filing receipts at the end of the month, from photographs
- Answering website enquiries that arrive after hours
- Calling back a lead while they're still on your competitor's site
- Walking into a sales call without knowing the last conversation
- Booking a call with someone who was never going to buy

Each build is a complete n8n workflow. Not a tutorial — a working file you
import and run.

---

## Running a build

Every `.json` file is an [n8n](https://n8n.io) workflow.

1. Import it: **Workflows → Import → Upload File**
2. Open it and look for red markers — those are credentials you need to supply
3. Fill them in and hit **Activate**

### Credentials you'll need to supply

The API keys have been removed from these files. Replace the placeholders with
your own:

| Placeholder | Where to get it | Used by |
|-------------|-----------------|---------|
| `YOUR_GEMINI_API_KEY_HERE` | [aistudio.google.com](https://aistudio.google.com) | Builds 01, 02 |
| `YOUR_NREL_API_KEY_HERE` | [developer.nrel.gov](https://developer.nrel.gov) | Build 02 (solar estimates) |
| `YOUR_AIRTABLE_PAT_HERE` | [airtable.com](https://airtable.com) → personal access token | Build 03 |
| `YOUR_APIFY_API_TOKEN_HERE` | [apify.com](https://apify.com) | Build 04 |
| `YOUR_FIRECRAWL_API_KEY_HERE` | [firecrawl.dev](https://firecrawl.dev) | Build 04 |

Some builds also need credentials set inside n8n itself (Telegram, Google
Sheets, Gmail) — connect them through n8n's credential store, not in the file.

---

## Build 04 — the frontend

`04 Sales Rep Copilot/smith-solar-sales-copilot/` contains the actual web app that
the n8n backend talks to. React, TypeScript, Tailwind.

```bash
cd smith-solar-sales-copilot
npm install
npm run dev
```

`Lovable Prompt Extracted.md` is the prompt used to generate it — useful if you
want to build a version for a different business.

---

## Layout

```
├── 01 Telegram Receipt Analysis Assistant/
│   └── Telegram Receipt Assistant.json
├── 02 Website Lead Gen Chatbot/
│   ├── index.html                 ← the widget you paste into a website
│   ├── Solar Lead Agent.json
│   └── Solar Estimate.json
├── 03 Speed-to-Lead Voice Agent/
│   ├── Speed-to-Lead Voice Agent.json
│   ├── Retell Voice Agent Prompt.docx
│   └── Automation Brief Input.docx
├── 04 Sales Rep Copilot/
│   ├── Sales Copilot.json
│   ├── smith-solar-sales-copilot/   ← the React frontend
│   └── *.docx                      ← the brief and prompts it was built from
└── 05 AI Lead Qualifier/
    ├── Tally Form Import.csv       ← the form, ready to import
    └── Tally Form Spec.md
```

Each build folder keeps the brief it was built from, so you can see the reasoning
and rebuild it for a different business.

---

## What's next

This is the first module of a larger program. Done: 5 builds.
In progress: AI Automations (lead qualifier, voice agent, proposal generator).
Not started: Vibe Coding, AI Agent Workforces.

New builds get added here as they're finished.

The `.docx` files are original briefs and prompts — keep or remove them as suits
you.