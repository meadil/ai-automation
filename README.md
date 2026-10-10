# AI Automation Builds

5 production-ready AI automation builds from the AI Automation Agency program (Module 1: AI Agents). Each build progresses from simple to advanced.

## Builds

| # | Build | Description | Tech Stack |
|---|-------|-------------|------------|
| 01 | **Telegram Receipt Analysis Assistant** | Extract & categorize expenses from receipt photos sent to Telegram | n8n, Telegram API, OCR |
| 02 | **Website Lead Gen Chatbot** | Solar estimate chatbot embedded on website, captures leads | n8n, HTML/JS widget, webhook |
| 03 | **Speed-to-Lead Voice Agent** | AI voice agent calls leads within seconds of form submission | n8n, Retell AI, Twilio |
| 04 | **Sales Rep Copilot** | Full-stack app: n8n backend + Lovable React frontend, assists sales calls | n8n, Lovable, React, Supabase |
| 05 | **AI Lead Qualifier** | Tally form → n8n workflow → qualified leads get booking link emailed | n8n, Tally, Email |

## Structure

```
├── 01 Telegram Receipt Analysis Assistant/
│   └── Telegram Receipt Assistant.json          # n8n workflow
├── 02 Website Lead Gen Chatbot/
│   ├── index.html                               # Embeddable widget
│   ├── Solar Estimate.json                      # n8n workflow
│   └── Solar Lead Agent.json                    # n8n workflow
├── 03 Speed-to-Lead Voice Agent/
│   ├── Automation Brief Input.docx              # Build brief
│   ├── Retell Voice Agent Prompt.docx           # Voice agent prompt
│   └── Speed-to-Lead Voice Agent.json           # n8n workflow
├── 04 Sales Rep Copilot/
│   ├── Automation Brief Input.docx              # Build brief
│   ├── GPT Planning Conversation.docx           # Planning notes
│   ├── Lovable Frontend Prompt.docx             # Frontend prompt
│   ├── Lovable Prompt Extracted.md              # Extracted prompt
│   └── Sales Copilot.json                       # n8n workflow
└── 05 AI Lead Qualifier/
    ├── Tally Form Import.csv                    # Form template
    ├── Tally Form Spec.md                       # Form specification
    └── (workflow in n8n)
```

## Usage

Each `.json` file is an n8n workflow export. Import into n8n via **Workflows → Import**.

For Build 04 (Sales Copilot), the Lovable frontend is deployed separately — see `Lovable Prompt Extracted.md` for the prompt used to generate it.

## Progress

- ✅ Module 1 (AI Agents): 5/5 builds complete
- 🔄 Module 2 (AI Automations): In progress
- 🔄 Module 3 (Vibe Coding): Not started
- 🔄 Module 4 (AI Agent Workforces): Not started

---

Built as part of the AI Automation Agency program. See `ai-automation-program.md` in second-brain for full curriculum tracker.