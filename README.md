SvelteKit username generator.

## Development

```sh
npm install
npm run dev
```

## Production

This app is not a static site. It uses a SvelteKit server route at `src/routes/api/generate-ai/+server.ts` and requires a Node runtime.

Build and run it with:

```sh
npm install
npm run build
npm run start
```

The production server listens on the `PORT` environment variable, which works with Coolify's default Node deployment flow.

## Coolify

Use a Node app, not a static site.

- Build command: `npm install && npm run build`
- Start command: `npm run start`
- Required env vars: `GROQ_API_KEY`

Optional:

- `GROQ_MODEL` — Groq model ID; defaults to `openai/gpt-oss-20b`
- `BASE_PATH` if you are serving the app under a subpath

### Groq Free Plan

`openai/gpt-oss-20b` can be used on Groq's Free plan without monetary charges, subject to
the plan's rate limits. At the time of writing, those limits are 30 requests per minute,
1,000 requests per day, 8,000 tokens per minute, and 200,000 tokens per day. The app allows
up to 1,024 completion tokens per AI request so GPT-OSS can complete its hidden reasoning before
returning a username; reasoning-heavy requests may therefore reach the daily token limit before
the daily request limit.

If the Groq quota is exceeded or an AI request fails, the server falls back to the non-AI username
generator. See Groq's [current Free plan limits](https://console.groq.com/docs/rate-limits), as
they may change.
