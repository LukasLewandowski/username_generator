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
- Required env vars: `OPENROUTER_API_KEY`

Optional:

- `BASE_PATH` if you are serving the app under a subpath
