# LeadPulse

LinkedIn lead generation and CRM: contact extraction, duplicate detection, automated outreach sequences, analytics and team management.

## Features

- **Lead management** – searchable lead table, detail drawer, Excel import
- **Enrichment** – Gemini-powered contact and job-history enrichment
- **Deduplication** – audit and merge duplicate leads
- **Outreach** – multi-step sequences and templates
- **Analytics** – pipeline and performance dashboard
- **Teams & auth** – cookie sessions, roles (admin/member), lockout protection
- **Browser extension** preview for LinkedIn capture

## Tech stack

React 19 · TypeScript · Vite · Tailwind CSS 4 · Express · Google Gemini (`@google/genai`)

## Getting started

Prerequisites: Node.js 20+ (or Bun).

```bash
npm install
cp .env.example .env     # then fill in GEMINI_API_KEY and SESSION_SECRET
npm run dev              # http://localhost:3000
```

| Script | Description |
| --- | --- |
| `npm run dev` | Start API + Vite dev server |
| `npm run build` | Build client and bundle server into `dist/` |
| `npm start` | Run the production build |
| `npm run lint` | Type-check with `tsc` |

## Project structure

```
.
├── server/            Express API, auth, Gemini integration
├── src/
│   ├── components/    UI components
│   ├── services/      Auth, enrichment, outreach, import, dedupe
│   ├── data/          Mock data
│   ├── utils/         Helpers
│   └── types.ts       Shared types
├── docs/              Architecture notes
└── .github/           CI, issue and PR templates
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and [CONTRIBUTING.md](CONTRIBUTING.md).

## Security

Never commit `.env`. See [SECURITY.md](SECURITY.md) for reporting vulnerabilities.

## License

[MIT](LICENSE)
