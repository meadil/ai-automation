# Tally Form — Build 05 spec

CSV at `Tally Form Import.csv` is the importable file — use that.
This file is the reference for field names and block types.

## Form title

```
How can we help?
```

## Question blocks

| # | Label                     | Tally block          | Airtable field | Required |
|---|---------------------------|----------------------|----------------|----------|
| 1 | First Name                | Short answer         | First Name     | Yes |
| 2 | Last Name                 | Short answer         | Last Name      | Yes |
| 3 | Email                     | Email                | Email          | Yes |
| 4 | Phone                     | Phone number         | Phone          | Yes |
| 5 | Company                   | Short answer         | Company        | Yes |
| 6 | Budget                    | Number               | Budget         | No |
| 7 | Details                   | Long answer          | Details        | No |

Field names must match the Airtable `Lead Contacts` table exactly — the workflow
maps them by name.

## Branding

- Background: white
- Text: #2c3e50
- Button: #f39c12
- Accent: #1a5276

Kept consistent with the Smith Solar site from Build 02.

## Qualification rule

Budget >= $10,000 → `Qualification` = true. Anything below or blank → false.

The sample rows in the CSV cover both sides: four above the line, one below.

## After publishing

1. Copy the form's share URL
2. Open Tally → Integrations → Webhooks
3. Add a webhook pointing at the n8n URL (provided once the workflow exists)
4. Submit the form once and confirm the webhook fires

## If CSV import fails

Build the 7 blocks by hand using the table above. Tally's text/markdown import
only reliably handles multiple-choice and checkbox lists, not mixed block types,
so the CSV is the safe route.