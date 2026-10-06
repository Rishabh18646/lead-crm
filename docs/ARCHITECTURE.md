# Architecture

- **Client** (`src/`): React SPA built with Vite. Components in `src/components`, business logic in `src/services`.
- **Server** (`server/index.ts`): Express app exposing auth and data APIs, calling Gemini server-side so the API key never reaches the browser. In development it embeds the Vite dev server; in production it serves `dist/`.
- **Auth**: bcrypt-hashed passwords, HTTP-only session cookies, failed-login lockout, `admin`/`member` roles.
