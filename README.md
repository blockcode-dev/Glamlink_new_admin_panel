# Glamlink Admin Panel

Admin panel for the Glamlink website (glamlink.net): professionals and their public pages, Access cards (requests, orders, pricing, subscriptions), the directory and its applications, the journal, magazine, videos and podcast, ads, the home page, and what the website's forms collect.

The website comes first. The mobile app's screens (app users, posts, clips, followers, bookings, services, shop products and orders, referrals and rewards, banners and app FAQs) were removed until the app is rebuilt; they are in git history at `2970239`. What the panel must do for the new API is in the backend's `docs/handoff/admin-panel.md`.

## Stack

| Job | Library |
| --- | --- |
| Language | [TypeScript](https://www.typescriptlang.org) (strict); `tsc` type-checks, Vite transpiles |
| Build & dev server | [Vite](https://vite.dev) |
| UI components, icons, notifications | [antd](https://ant.design) + `@ant-design/icons` |
| Routing | [React Router](https://reactrouter.com) v8 (`react-router`) |
| Rich-text editor | [Tiptap](https://tiptap.dev) — shared `src/components/RichTextEditor.tsx` |
| Charts | Chart.js (`react-chartjs-2`) |
| Dates | dayjs |
| Image cropping | `antd-img-crop` (wrapped by `src/components/ImageCropModal.tsx`) |
| Tests | [Vitest](https://vitest.dev) + Testing Library (jsdom) |
| Lint | [oxlint](https://oxc.rs/docs/guide/usage/linter) |

## Getting started

Requires Node `^22.22.2` or `>=24.15.0`.

```bash
npm install
cp .env.example .env   # then fill in the values
npm run dev            # http://localhost:3000
```

### Environment variables

Read at build time from `.env` (see `.env.example`). Only variables prefixed with `VITE_` reach the app; restart the dev server after changing them. A new variable must also be declared in `src/vite-env.d.ts`, or reading it is a type error.

| Variable | Used for |
| --- | --- |
| `VITE_API_BASE_URL` | Backend API base URL (ends with `/`); production: `https://api.glamlink.net/api/v1/` |
| `VITE_IMAGE_BASE_URL` | Base URL for uploaded images; production: `https://api.glamlink.net/images/` |
| `VITE_VIDEO_BASE_URL` | Base URL for uploaded videos; production: `https://api.glamlink.net/videos/` |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps address search and geocoding on the access card forms; the script loads on first use (`src/utils/googleMaps.ts`) |
| `VITE_WEBSITE_URL` | Optional. The public website, for "view on site" links (`src/utils/website.ts`); defaults to `https://glamlink.net` |

The API only answers browsers on origins it lists (`ACCESSDOMAINS` on the server; production: `https://admin.glamlink.net`). To run the panel locally against it, ask for `http://localhost:3000` to be added.

Every request carries the admin token through one shared client (`src/utils/session.ts`); API functions don't set auth headers themselves.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` (or `npm start`) | Dev server with hot reload on port 3000 |
| `npm run build` | Type-check, then production build into `build/` (fails on any type error) |
| `npm run typecheck` | Type-check only (`tsc`, no output files) |
| `npm run preview` | Serve the production build locally |
| `npm test` | Run the test suite once |
| `npm run test:watch` | Re-run tests on change |
| `npm run lint` | Lint with oxlint (rules in `.oxlintrc.json`) |

The ad video cropper uses the browser's own encoder (WebCodecs, through Mediabunny), so admins need a current Chrome, Edge, Safari or Firefox to crop videos.

## Project layout

```
index.html                Vite entry (loads src/index.tsx)
src/
  App.tsx                 Routes
  components/             Shared components: layout, rich-text editor, image cropper, and for the newer screens
                          PageHeader/Panel, AccountSelect (pick professional and brand accounts),
                          ImageUploadField (upload an image, keep its link), DateRangeFilter
  config/                 Environment, dayjs and the antd theme (built from index.css)
  index.css               The only global stylesheet; every colour token lives here
  pages/                  One folder per admin section
  services/Api/           API calls, one module per backend area, typed with the models in types/
  types/                  API response shapes and domain models (users, journals, access cards, …)
  utils/                  Shared helpers: API error readers, showFieldError (a refusal's details.field on its
                          form field), table state, :id route param, CSV export, website links
  setupTests.ts           Vitest setup (jest-dom matchers, jsdom shims)
  vite-env.d.ts           Types for the VITE_* environment variables
```

Tests live next to the code they cover (`*.test.ts` / `*.test.tsx`).

## Colours

Every colour is a token in `src/index.css` (`--color-primary`, `--color-text`, `--color-surface`, …). Use them as `var(--color-…)` in CSS, SCSS and inline styles. The antd theme reads the same tokens (`src/config/theme.ts`), so antd components and preset tag colours (`<Tag color="green">`) follow them automatically. Charts draw on a canvas and can't use `var()`; read tokens there with `cssVar("--color-…")`.

`src/theme.test.ts` fails on any hex, `rgb()` or `hsl()` colour outside `index.css`. If a value is data rather than styling (e.g. a brand colour saved with an access card), mark its line `// color-literal-ok: <reason>`.

The domain types in `src/types/` were inferred from how the pages use each response, not from a backend schema. Fields the code treats defensively (`?.`, fallbacks) are optional; when the API turns out to differ, fix the type there and let `npm run typecheck` show every page affected.
