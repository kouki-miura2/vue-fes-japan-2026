# Vue Fes Japan 2026

An app that allows you to create your own screen layout by rearranging screen elements.

Then update the lockfile and check nothing still refers to the deleted runtime:

```bash
vp install
git grep -n -i -e backend-node -- ':!README.md' ':!.claude/skills/check-secrets' ':!.claude/agents/web-security-auditor.md'                          # kept Cloudflare Workers
git grep -n -i -e backend-worker -e wrangler -e workerd -- ':!README.md' ':!.claude/skills/check-secrets' ':!.claude/agents/web-security-auditor.md' # kept Node.js
```

(`.claude/skills/check-secrets` and `.claude/agents/web-security-auditor.md` cover both runtimes conditionally, so they stay either way.)

4. Rename the project and set its time zone:

- Root `package.json` — `name`
- `packages/utils/src/date/zone.ts` — `TIME_ZONE_OFFSET_MINUTES` if the app's time zone isn't JST (UTC+9)
- `apps/frontend/.env` — `VITE_APP_TITLE` (browser tab title and app bar)
- `apps/backend-worker/wrangler.jsonc` — `name` if you kept Cloudflare Workers (the Worker's name; must be unique per account, or deploys overwrite each other)
- `README.md` — title and description (this file)

Then check nothing still refers to the template:

```bash
git grep -n -i fullstack-typescript -- ':!README.md'
```

5. Install dependencies and confirm everything works:

```bash
vp install
vp run ready
```

6. Commit the result and push to the new remote:

```bash
git add -A
git commit -m "chore: initial commit from fullstack-typescript template"
git branch -M main
git push -u origin main
```

## Development

The frontend is served at `/` and the API at `/api` on the same origin, in development and in
production. Run both dev servers and open the frontend's URL; it proxies `/api` to the backend
(`localhost:8787`):

```bash
vp run dev-b   # backend
vp run dev-f   # frontend
```

In production, the backend runtime serves both: the Worker (`apps/backend-worker`) serves the
frontend build as static assets, and the Node.js server (`apps/backend-node`) serves it with
`serveStatic`. Both list `frontend` as a workspace dependency, so `vp run -r build` (or `-t` for
one package) builds the frontend once, before them; the Worker's `deploy` builds it itself.

- Check everything is ready:

```bash
vp run ready
```

- Run all tests:

```bash
vp run -r test
```

- Build everything:

```bash
vp run -r build
```

## packages/utils

- Run format/lint/type checks:

```bash
vp run utils#check
```

- Run the tests:

```bash
vp run utils#test
```

## apps/backend

Runtime-agnostic routes and business logic. Run it through `apps/backend-worker` or `apps/backend-node`.

- Run format/lint/type checks:

```bash
vp run backend#check
```

- Run the tests:

```bash
vp run backend#test
```

## apps/backend-worker

Runs `apps/backend` on Cloudflare Workers.

- Debug locally (reloads on changes in `apps/backend` too):

```bash
vp run backend-worker#dev
```

- Build (frontend + dry-run Worker bundle):

```bash
vp run -t backend-worker#build
```

- Deploy (frontend + API, one Worker):

```bash
vp run backend-worker#deploy
```

- Regenerate Workers binding types:

```bash
vp run backend-worker#cf-typegen
```

## apps/backend-node

Runs `apps/backend` as a standalone Node.js server.

- Debug locally (reloads on changes in `apps/backend` too):

```bash
vp run backend-node#dev
```

- Build (frontend + server bundle):

```bash
vp run -t backend-node#build
```

- Run the built bundle (frontend at `/`, API at `/api`, port from `PORT`):

```bash
vp run backend-node#start
```

## apps/frontend

- Run format/lint/type checks:

```bash
vp run frontend#check
```

- Run the tests:

```bash
vp run frontend#test
```

- Run the dev server:

```bash
vp run frontend#dev
```

- Build:

```bash
vp run frontend#build
```

- Preview the production build:

```bash
vp run frontend#preview
```
