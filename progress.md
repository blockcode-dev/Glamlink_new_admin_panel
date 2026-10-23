# Audit progress

Tracks the work done against the code and dependency audit of the admin panel ([full audit](https://claude.ai/code/artifact/e5486df6-a77d-4fd4-abc6-0030334b5224)). The audit was taken at commit `4ebfc15` on `main`.

- **Branch:** `refactor/one-library-per-job`. All work below is **uncommitted** on this branch.
- **Status as of:** 2026-10-15.
- **Backend questions:** security items that need a server change or answer are collected in [Admin panel security: backend changes and questions](https://claude.ai/code/artifact/7cf1fb80-6241-4282-b8a6-9966c6290ed9). The panel side of those items waits for its answers.
- **Not yet done:** a manual pass in a real browser. Build, tests and lint pass, and every route renders in the test environment, but nobody has clicked through the app since these changes.

## At a glance

| Measure | At audit (`4ebfc15`) | Now |
| --- | --- | --- |
| Clean `npm ci` | Fails (ERESOLVE) | Passes, 283 packages |
| `npm audit` | 143 advisories (4 critical, 45 high) | 0 |
| Packages in lockfile | 1,739 | 363 |
| Direct dependencies | 41 (no dev dependencies) | 28 + 14 dev |
| Production JS | 6.2 MB (1.62 MB gzipped), one file | 2.85 MB (852 KB gzipped), still one file |
| UI kits / icon sets | 5 / 5 | 1 / 1 (antd, `@ant-design/icons`) |
| Jobs done by two or more libraries | 10 | 0 |
| Routes unreachable from the UI | 29 | 0 (deleted) |
| `console.*` calls | 320 (including credential logging) | 222 in the source, all `console.error` / `console.warn`; none in production builds |
| Tests | None | 51 (Vitest) |
| Lint | ESLint (CRA): 51 hook-dependency and 14 anchor warnings | oxlint: 0 errors; 60 warnings (42 hook deps, 14 anchors, 4 missing keys) |
| Colour literals outside the global stylesheet | 876 in 71 files (266 distinct values) | 0, enforced by a test; card-data swatches excepted |
| Language | JavaScript | TypeScript, `strict` mode, 0 type errors; the build fails on a type error |

Against the audit's "Fix first" list, 4 of 5 items are done; the fifth (a new, restricted Maps key for the panel) is partly done. Of the 23 confirmed bugs, 10 are fixed, 2 are partly fixed and 11 are open. The bug list was intentionally left for a later pass; the ones fixed went away as a side effect of other work: the TypeScript migration (see [Found during the TypeScript migration](#found-during-the-typescript-migration)) and the security pass (session handling).

## Work done

Nine passes, in order. Each pass was verified with a production build before the next one started.

### 1. One job, one library

- antd is the only UI kit. PrimeReact, react-bootstrap, MUI v4/v6, MUI X DataGrid, emotion, and the Bootstrap, Popper and Font Awesome CDN files are gone.
- `@ant-design/icons` is the only icon set. react-icons, PrimeIcons and `@mui/icons-material` are gone.
- Notifications use antd only (react-toastify removed). Tables use antd Table only.
- Dates use dayjs only. moment is removed; the `customParseFormat` plugin is set up in `src/config/dayjs.ts`.
- Charts use chart.js / react-chartjs-2 only. `@ant-design/plots` is removed.
- Image cropping uses antd-img-crop only, wrapped by `src/components/ImageCropModal.tsx`. The separate react-easy-crop cropper and `getCroppedImg` are removed.
- Removing the MUI packages fixed the `npm ci` ERESOLVE failure.

### 2. Editor and router

- **TinyMCE (cloud) and CKEditor 5 → Tiptap 3**, as one shared editor: `src/components/RichTextEditor.tsx` plus `src/components/richText/extensions.ts`.
- **No API key or cloud script is needed for the editor anymore.**
- HTML saved by the old editors loads and saves back unchanged. That covers:
  - journal topic tags (`data-paragraph-id`, `data-topic-ids`, `data-topic-names`);
  - business mentions (`mention-tag`, `data-card-id`);
  - `<video><source>`, inline iframes, table borders and cell widths, fonts, colours, alignment and inline images.
- Tests in `extensions.test.ts` lock this behaviour in.
- **`react-router-dom` → `react-router`** (v7 at this step; v8 since pass 5).

### 3. Dead code

- **Deleted the 29 unreachable route entries and their 28 page files:**
  - Blogs and Blog categories
  - Support, Terms & Conditions, About Us
  - Old Services
  - Add User, Edit Admin, Settings, Personal Information, Forgot Password
  - Upload CSV, Promotion Request, the `/view-order/:id` route
- **Also deleted the API code only those pages used:** `BlogsApi`, and unused exports in `Api.ts`, `AppointmentsApi.ts` and `Host.ts`.
- **Restoring a page:** everything is in git history at `4ebfc15`.
- **Template leftovers removed:**
  - `manifest.json` and the stock React logos
  - the "Enter your description here" meta tag
  - starter-template CSS (`.quill`, `--color-ffd333`, `.red`, invalid `font` shorthands)
  - the unused ToastContainer
  - Banner's redirects to routes that only exist in the professional app
  - the dead `signout` key handler
- **Logging and comments:**
  - commented-out code and debug `console.log` calls are removed, including the one that printed the admin's email and password on every login;
  - logs on error paths became `console.error`.
- **Renamed:** `glamlink in black (1).png` → `src/assets/glamlink-logo-black.png`.

### 4. Build tooling

- **Create React App → Vite 8**: dev server on port 3000, output still in `build/`.
- **Tests:** Vitest 5 with jsdom and Testing Library, 21 tests. They cover:
  - routing;
  - the rich-text editor (toolbar modes, late-loading values, topic tagging);
  - legacy HTML round-trips;
  - dayjs parsing.
- **Lint:** oxlint, configured in `.oxlintrc.json`.
  - Real bugs are errors: undefined variables, hook-rule violations, duplicate JSX props.
  - Not enforced yet: React Compiler readiness rules and the stricter accessibility rules. They are listed in the config, to be turned on area by area.
- Node version pinned through `engines`: `^22.22.2 || >=24.15.0`.
- **Environment variables were renamed from `REACT_APP_*` to `VITE_*`.** Deployment and CI configs must use the new names (see `.env.example`).
- ffmpeg.wasm now loads its ESM core, because Vite runs its worker as a module worker.
- `README.md` was rewritten (stack, setup, env vars, scripts, layout).

### 5. Latest stable versions

| Package | Before → after | Notes |
| --- | --- | --- |
| react, react-dom | 18.2 → 19.3.1 | Required by react-router 8 |
| antd | 5.11 → 6.6.6 | Prop renames applied in 23 files (see below) |
| @ant-design/icons | 5.6 → 6.3.4 | Matches antd 6, so only one copy is installed |
| react-router | 7.18 → 8.4.0 | Needs React ≥ 19.2.7 and Node ≥ 22.22. None of the v8 breaking changes affect the APIs we use. |
| axios | 1.5 → 1.20.0 | Clears its advisories |
| dompurify | 2.4 → 3.4.17 | Clears its advisories; same `sanitize()` API |
| chart.js / react-chartjs-2 | 4.4 → 4.5.1 / 5.2 → 5.3.1 | |
| dayjs | 1.11.20 → 1.11.23 | |
| papaparse | 5.4 → 5.7.0 | |
| react-player | **Removed** | All 8 players show our own uploaded files. Replaced with the native `<video>` element, at the same 360 px height. |
| @floating-ui/dom | **Removed from `package.json`** | Not imported by our code; Tiptap installs it on its own |

- **antd 6 dropped `visible` on Modal and Drawer.** Six modals and the Product drawer would never have opened. They now use `open`: Specialities, the product and service category editors, ProfessionalForm, and the Product drawer.
- **Other antd 6 renames:**
  - `bodyStyle` → `styles.body`
  - `destroyOnClose` → `destroyOnHidden`
  - `maskClosable` → `mask.closable`
  - Space `direction` → `orientation`
  - Divider `type` → `orientation`, and `orientation="left"` → `titlePlacement="start"`
  - Drawer `width` → `size`
  - Card `bordered` removed (it is now the default)
  - `notification` `message` → `title`
- **Check:** all 83 routes were rendered in the test environment with the API mocked. No antd deprecation warnings or React 19 warnings appeared.

**Already on the latest version:** Tiptap, @dnd-kit, antd-img-crop and browser-image-compression. (ffmpeg.wasm was later replaced by Mediabunny, pass 9.)

### 6. TypeScript

- **All 137 source files are TypeScript** (44 `.ts`, 93 `.tsx`), compiled by TypeScript 7 in `strict` mode with 0 errors. There is no `any` and no `@ts-ignore`.
- **Checks:**
  - `npm run typecheck` runs `tsc`, and `npm run build` now runs it first, so a type error fails the build.
  - oxlint gained its TypeScript rules. `no-undef` is off because `tsc` reports undefined names better.
- **Domain types:** `src/types/` (14 files, about 970 lines) describes every API response and record the pages use: users, posts and clips, catalog, e-commerce, journals, access cards, analytics, ads and more.
  - All 23 API modules are typed against these, so `result.data.data` has a real type on every page.
  - The types were inferred from how the pages read each response, not from a backend schema. Fields the code treats defensively are optional. When the API turns out to differ, fix the type and `npm run typecheck` lists every page affected.
- **Shared helpers added in `src/utils/`:**
  - `apiError.ts`: typed readers for a failed request (`apiErrorStatus`, `apiErrorMessage`, `apiErrorBody`), plus `errorMessage` and `isFormValidationError`.
  - `table.ts`: `TableParams`, `TableChangeHandler`, `WithIndex` and `singleSorter`, for the list pages' pagination and sort state.
  - `routing.ts`: `useIdParam()`, for pages routed with `:id`.
  - `apiList.ts`: reads the list endpoints that answer in three different shapes.
- **Small refactors done where typing required them:**
  - **ImageCropModal** now receives the whole new file list, and remembers the latest list itself so several crops in a row still append.
  - **Video `<Upload>` on Edit Access Card:** its unused `fileList` prop was dropped, matching the Create page.
  - **Access-card gallery:** saved images keep their numeric id in a `mediaId` field, so `existing_image_ids` is sent exactly as before.
- **Escape hatches:** 24 non-null assertions and 28 casts, all at boundaries, with a comment where the reason isn't obvious. Examples:
  - picked upload files always carrying `originFileObj`;
  - antd's `customRequest` file;
  - the dashboard hover handlers styling `e.target`.
- **Behaviour was kept the same**, apart from the handful of fixes listed in [Found during the TypeScript migration](#found-during-the-typescript-migration).
  - **How this was checked:** all 83 routes were rendered in the test environment before and after, and the console output matched.
  - **One harmless change:** arguments the API functions already ignored (mostly tokens) were removed from the calls.

### 7. Security (panel side)

Frontend-only fixes from the audit's security list. Anything that needs a backend decision is in the [backend questions doc](https://claude.ai/code/artifact/7cf1fb80-6241-4282-b8a6-9966c6290ed9) instead.

- **Stored HTML is sanitized everywhere it is rendered.**
  - `src/utils/sanitizeHtml.ts` wraps DOMPurify with the panel's allowlist, and `src/components/SafeHtml.tsx` renders through it. All 6 `dangerouslySetInnerHTML` sites now use `SafeHtml`: card bio (2), product description, FAQ answer, topic description, service description.
  - **Kept:** formatting, links, images, tables, `video`/`source`, `class`, `style` and `data-*` (the editor's topic tags and mentions), and `https` iframes, which get a `sandbox`.
  - **Removed:** scripts, event handlers, `javascript:` URLs, non-https iframes, `<style>` tags, forms, and `position` in inline styles (so content can't cover the page with a fake screen). Links with `target` get `rel="noopener noreferrer"`.
  - **The editor sanitizes too:** initial content, content loaded later, the HTML source view, and paste/drop. Its iframe node also refuses non-https sources. Journal bodies can be created through endpoints that take no token, so an admin opening one in the editor was an XSS path.
- **CSV exports (Users, Products) are escaped.** Cells starting with `=`, `+`, `-` or `@` get a leading apostrophe, so a seller or user name can't run as a spreadsheet formula. Phone numbers and plain numbers are left alone. Names with commas or quotes no longer break the row, and `#` no longer cuts the file short. Shared helper: `src/utils/csv.ts`.
- **One place owns the session: `src/utils/session.ts`.**
  - `getToken`, `setToken`, `clearSession` and a `useSessionToken()` hook. MainLayout re-renders from it, so signing out (here or in another tab) shows the login form at once. Pages still read `localStorage.getItem("adminToken")` directly; only saving and clearing moved.
  - **A global axios response handler ends the session** when a request that carried the current token gets a `jsonwebtoken` error back (`jwt expired`, `invalid signature`, `jwt malformed`, `invalid token`). It clears the token and shows "Your session has expired" once. Before, an expired session went to the login page but kept the token. The handler ignores requests sent with an older token or none.
  - **401 does not log out yet.** 13 save handlers read 401 as "expired" (they now call `clearSession()`), but 30 list pages read it as "not allowed for this role". The backend doc asks which is right (section 3).
  - The local "jwt expired" branches in 7 list pages are removed; they would have shown the message twice.
- **MainLayout** loads the profile and badge counts only when signed in, and again after signing in inside the layout (before, the header name stayed empty until a reload). The badge counts now send the token.
- **Login** refuses a response without a token instead of saving the string "undefined", and shows an error for failures it doesn't recognise (before, they showed nothing). Tokens saved as "undefined" or "null" by older builds count as signed out.
- **Podcast schedules:** "get by id" and "delete" now send the token (they sent `Bearer undefined`).
- **Search engines:** `index.html` carries `<meta name="robots" content="noindex, nofollow">`. `public/robots.txt` keeps crawling allowed on purpose, with a comment saying why: search engines only honour `noindex` on pages they may fetch, and `Disallow: /` would let a linked URL be listed without its content. The backend doc also asks the host for an `X-Robots-Tag` header.
- **The ffmpeg core ships with the build** instead of loading from unpkg at run time. `@ffmpeg/core` 0.12.10 is a dependency now (the code had pinned 0.12.6 on the CDN), so `package-lock.json` pins its integrity hash, and the ad video cropper loads it through Vite `?url` imports. Checked in headless Chrome against both the dev server and a production build: the core loaded, cropped and encoded a test clip, and no request left the site. The build now contains a 32 MB `ffmpeg-core-*.wasm`, still downloaded only on the first crop; the README warns that some hosts cap file size (Cloudflare Pages: 25 MiB).
- **Google Maps loads on first use** (`src/utils/googleMaps.ts`) instead of from a synchronous script tag on every page. Only the access card forms use it (address autocomplete, city geocoding), so the login page and the rest of the panel no longer run a Google script or expose the key. It uses Google's async loading (`loading=async` + `importLibrary`), which also silences Google's console warning about synchronous loading. Checked in headless Chrome: one script tag however many fields ask, `places.Autocomplete` and `Geocoder` available, and the login page requests nothing from Google except Fonts.
- **The image-compression worker loads its library from our build.** browser-image-compression runs in a web worker that, by default, loads the library from the jsdelivr CDN with `importScripts()`. The audit missed this one. `ImageCropModal` now passes `libURL`, pointing at the copy Vite emits (`assets/browser-image-compression-*.js`). Checked in headless Chrome against a production build served by a logging server: a 3000×2000 photo came back at 2000×1333 and the worker fetched our copy. The library's CDN default is still in the bundle as a string, but it is used only when `libURL` is missing.
- **Production builds drop every `console.*` call** (`vite.config.ts`: Rolldown's `compress.dropConsole`). Error logs print whole axios errors, request headers and the admin token included, and anyone shown the console or sent a screenshot could copy them. Dev and tests keep the logs. Production loses them too, so add an error reporter (e.g. Sentry) if production errors need to be seen.
- **Tests:** 25 new (sanitizer, CSV escaping, Maps loader, hostile content in the editor, the session store and handler, sign-out, badge-count token, login without a token). All 83 routes render with the same console output as after the TypeScript pass.

### 8. One stylesheet, colour tokens

- **`src/index.css` is the only global stylesheet** and the one place a colour is written. `App.css` was merged into it and deleted.
- **Palette:**
  - primary `#226168`;
  - an off-white page (`--color-bg` `#f5f6f3`) and near-white panels (`--color-surface` `#fcfcfa`) instead of pure white;
  - greyish-black text (`--color-text` `#2b2f31`) instead of `#000`;
  - secondary and tertiary text and borders;
  - success, warning, error and info, each with a soft and a border shade;
  - a small accent set for categories and charts;
  - shadow and overlay colours.
- **Every file follows it:**
  - **CSS and inline styles:** all 876 colour literals in 71 files now use `var(--color-…)`. A codemod mapped each value by hue, lightness and use (text, background, border, shadow). Named colours used as CSS (`"red"`, `"gray"`, …) were changed by hand.
  - **antd:** themed app-wide from the same tokens (`src/config/theme.ts`, `ConfigProvider` in `App.tsx`): primary, links, status colours, text, backgrounds, borders, sidebar and font. Access Card Analytics no longer has its own primary colour.
  - **Tag and Badge presets:** antd's preset palette (`"green"`, `"purple"`, …) is mapped to the tokens too, so `<Tag color="green">` follows the palette without code changes. Booking tags that used `"black"` (not an antd preset; it rendered a solid black tag) now use `"default"`.
  - **Charts:** Chart.js draws on a canvas, which can't read `var()`, so the Dashboard charts read the tokens at render time (`cssVar()`, `withAlpha()`).
  - **Sass:** `color.adjust()` on the brand colour became tokens (`--color-primary-active`, `--color-primary-soft-hover`). Analytics' `rgba($brand, …)` became `color-mix()`.
- **Kept as literals, marked `color-literal-ok`:** values that are data, not panel styling:
  - access card brand colour presets and the default (saved with the card and shown on the public card);
  - the rich-text editor's colour-picker defaults and the video block's inline style (saved into article HTML).
- **Guard:** `src/theme.test.ts` fails on any hex, `rgb()` or `hsl()` literal outside `index.css`, on named colours in stylesheets, and on named colours in inline styles. A run with planted violations confirmed it catches each kind.
- **Fixes the theme exposed:**
  - The black logo sat on teal; its bar is now off-white and lines up with the header.
  - The SIGN IN label was dark on teal.
  - Three card-page buttons painted a primary background over a default button. They now use `type="primary"`, so hover works.
- **Checked** with screenshots in headless Chrome (login, dashboard, access cards, analytics, create card, admin profile), with the API stubbed.

### 9. Backend answers and the new API

The backend answered every question in the [backend questions doc](https://claude.ai/code/artifact/7cf1fb80-6241-4282-b8a6-9966c6290ed9) and listed what the panel must change for the new API (`api.glamlink.net`) in its `docs/handoff/admin-panel.md`.

- **Ad video cropping no longer needs ffmpeg.wasm (32 MB).**
  - It now uses the browser's own video encoder (WebCodecs) through Mediabunny (`src/pages/Ads/cropVideo.ts`): crop, scale to the slot's exact size, H.264 MP4, audio removed, as before.
  - Mediabunny is a 548 KB chunk (137 KB gzipped), loaded only when someone crops: about 75× less to download than the old core. `@ffmpeg/core`, `@ffmpeg/ffmpeg` and `@ffmpeg/util` are removed.
  - It's also faster (the browser's encoder, often on the GPU): a 2-second 720p clip cropped in under a second.
  - Checked in headless Chrome, dev and production builds: an MP4 source, and a portrait WebM (VP9) with Opus audio, both came out H.264 at exactly the slot size with no audio track.
  - Browsers without WebCodecs H.264 encoding get a clear message instead of a failed crop. The CSP no longer needs `'wasm-unsafe-eval'`.
- **One API client, as the backend asked.** Every admin endpoint now refuses a missing token.
  - `utils/session.ts` attaches `Authorization: Bearer <token>` to every axios call to `VITE_API_BASE_URL`, except the sign-in calls. Other hosts never get the token.
  - All per-call auth headers are gone: `x-access-token` in 55 calls and `Bearer` in 25. So are the token parameters of 22 API functions, their arguments at the call sites, and every `localStorage.getItem("adminToken")` in the pages (133 at audit time). The 122 calls that sent no token now send it. The service CSV upload moved from `fetch` to the API module so it gets the token too.
  - **401 now always means "sign in again"** (the API's `ADMIN_SIGN_IN_REQUIRED` / `ADMIN_SESSION_EXPIRED`): a 401 for the current token ends the session and shows the login form. A 401 from the sign-in call doesn't. The "jwt expired" checks are gone; the new API never sends them.
  - The 30 "not allowed" redirects moved from 401 to 403, which the API will use once admin roles are enforced. The 13 save handlers that cleared the session themselves now leave it to the shared client.
- **Sign-in, sign-out, password:**
  - Login shows the API's single message for every failure ("Invalid email or password.") and a wait message on 429 (15 tries per 15 minutes).
  - Sign out calls `POST /admin/auth/logout` first, which ends the admin's sessions on every device.
  - After a password change the panel signs out and asks for the new password: the API ends every session on a password change.
- **Endpoints, fields and URLs the new API changed:**
  - Renamed: `getBookingsByCounsellorId` → `getBookingsByProfessionalId` and `getAllReferralByBeauticianId` → `getAllReferralByProfessionalId` (functions renamed with them). Deleting an admin calls `DELETE /admin/deleteAdmin` with `{ admin_id }`; the old path never existed.
  - Request bodies: reviews-taken and availability send `professional_id` instead of `counselor_id`.
  - Response fields: `appointment_counselor` → `appointment_professional` (Appointments, both booking tabs, Dashboard). "Beautician" became "Professional" in the founder messages and the service list column.
  - **Add Admin** asks for a password (at least 8 characters); the API requires one. It shows the API's own 400 message (e.g. "Email already taken").
  - Service Categories and Appointments read the total from `data.count` (the backend confirmed the shape); pagination totals were missing before.
  - The 26 double-slash URLs (`/api/v1//journal/topic`) are fixed.
  - `.env.example` holds the new API's URLs; the README says the API only answers listed origins (local dev needs `http://localhost:3000` added).

**Still in use but unmaintained:** browser-image-compression has had no release since March 2023. It does real work: it shrinks photos to at most 2000 px before cropping. Replace it with a small in-house resize helper when convenient.

## Status against the audit

**Status values:** **Done**, **Partly** or **Open**. Paths are under `src/` unless shown otherwise.

### Fix first

| Item | Status | Notes |
| --- | --- | --- |
| Rotate leaked Google Maps / TinyMCE keys | **Partly** | The leaked keys are disabled (owner) and TinyMCE needs none. The backend rotated its own Google key. Still to confirm: a new panel Maps key restricted to `admin.glamlink.net`, in the existing Cloud project, set as `VITE_GOOGLE_MAPS_API_KEY`. |
| Remove the credential `console.log` in `Api.ts` | **Done** | |
| Sanitize the `dangerouslySetInnerHTML` sites | **Done** | 4 of the 10 sites went with deleted pages; the other 6 render through `SafeHtml` (pass 7) |
| Unblock `npm ci` | **Done** | |
| Confirm server auth for calls made without a token | **Done** | Confirmed and enforced by the backend; the panel sends the token everywhere |

### Security

| Area | Status | Notes |
| --- | --- | --- |
| Stored XSS | **Done** | All 6 sites render through `SafeHtml`; the editor sanitizes what it loads. Server-side sanitizing is asked for in the backend doc (section 5), because the app and website may render the same fields. |
| CSV formula injection (found in this pass) | **Done** | Users and Products exports escape cells through `utils/csv.ts` |
| Secrets in git history | **Done** | Keys rotated; the backend checked the panel's history (all branches) and found no backend secret, only a public Stripe publishable test key |
| Credential logging | **Done** | Login and user-list logs removed; no `console.log` left in the code; production builds drop all `console.*` calls |
| Calls without auth | **Done** | The backend now requires an admin token on every admin endpoint (25 public reads are public on purpose), and the panel sends `Authorization: Bearer` on every API call (pass 9) |
| Session handling | **Done** | `utils/session.ts`: one client, 401 ends the session, sign-out on the server, sign-out after a password change. Server side: 12-hour tokens, revocation, login rate limit. httpOnly cookies were declined for now (they need CSRF protection; planned with admin roles). |
| Third-party scripts | **Done** | Bootstrap, Popper and Font Awesome CDN files are removed; ffmpeg is gone (the browser's own encoder crops ad videos); Google Maps loads only on the access card forms; the image-compression worker loads its library from the build (found in this pass). Google Fonts remains (a stylesheet, no script). Restricting the Maps key is in the backend doc (section 6). |
| Indexing | **Done** | `noindex, nofollow` meta tag in `index.html`; `robots.txt` deliberately allows crawling so the tag is seen. An `X-Robots-Tag` header is asked of the host (backend doc, section 6). |
| Browser libraries with advisories | **Done** | axios, dompurify and react-router upgraded; moment, TinyMCE and CKEditor removed; `npm audit` is clean |

### Install & build

| Item | Status | Notes |
| --- | --- | --- |
| `npm ci` fails | **Done** | |
| Create React App deprecated | **Done** | Vite 8 |
| One 6.2 MB bundle, no route-level splitting | **Partly** | 2.87 MB / 855 KB gzipped now; still one file. Both editors' CDN scripts are gone; ffmpeg is replaced by a 137 KB (gzipped) chunk loaded only when cropping. Next step: `React.lazy` per route. |
| CKEditor is 21% of the bundle | **Done** | Removed |

### package.json review

All ten "same job, several libraries" rows are resolved:

| Job | Kept |
| --- | --- |
| UI components, styling | antd. Sass is kept only for the existing `.scss` files. |
| Icons | `@ant-design/icons`. The audit suggested also keeping react-icons for brand logos; it was dropped instead. |
| Rich-text editor | Tiptap (replaces both CKEditor and TinyMCE) |
| Charts | chart.js |
| Dates | dayjs |
| Image cropping | antd-img-crop |
| Notifications | antd `message` / `notification` |
| Routing | react-router 8 |
| Tables | antd Table |

Every package in the "deprecated, unmaintained, or due for replacement" table was removed, replaced or upgraded. There are two exceptions:

- **browser-image-compression:** kept, as the audit advised.
- **Google Places Autocomplete: Partly.** Its script now loads on first use (pass 7), but it still uses the legacy `places.Autocomplete` API (`utils/LocationAutocomplete.tsx`).

The version mismatches and duplicate copies are gone: Bootstrap CSS/JS is removed, and there is now a single `@ant-design/icons`, a single react-easy-crop (inside antd-img-crop) and no MUI. The "behind but not urgent" upgrades are done or no longer apply, because those packages were removed.

### Unused files and dead code

| Item | Status | Notes |
| --- | --- | --- |
| 29 unreachable routes | **Done** | Deleted; restorable from `4ebfc15` |
| `Forgotpassword.js`, `CustomInput.js`, `UploadCSV.jsx` | **Done** | Deleted |
| `manifest.json`, stock logos, `index.html` CDN scripts and placeholder description | **Done** | |
| Unused API exports | **Done** | |
| Banner redirects; dead `signout` handler | **Done** | |
| react-toastify | **Done** | Removed |
| Starter-template CSS | **Done** | |
| 320 `console.*` calls | **Done** | No debug logs left; the remaining `console.error` / `console.warn` calls on error paths are dropped from production builds |

### Broken code (23 bugs)

| Where | Problem | Status |
| --- | --- | --- |
| `Specialities.tsx:336` | Links to `/view-user/:id`; the route is `/viewUser/:id` | **Open** |
| `/view-order/:id`, `ViewOrder.tsx` | The route rendered ViewOrder with no id; `onClose` is never called | **Partly**: route deleted, and the drawer no longer requests `getOrderById/null` on load; ViewOrder still never calls `onClose`, so the order list doesn't refresh after an edit |
| `Banner.tsx`, `ProfessionalForm.tsx`, `Product.tsx` | Sorter reads `a.user_profile.name` | **Done** (TypeScript migration): each now sorts by the name its column shows |
| `Specialities.tsx`, `ProductCategory.tsx` | Stale `tableParams.pagination.current` overwrites the requested page | **Open** |
| `Orders.tsx` | Search reads a different path than the column shows | **Done** (TypeScript migration): searches the customer name the table shows |
| `MainLayout.tsx:104,120` | Badge counts requested without the token | **Done** (security pass) |
| `MainLayout.tsx` | Profile and counts fetched on mount, before login | **Done** (security pass): they load once signed in |
| `MainLayout.tsx:70,87` | Expired session keeps the token | **Done** (security pass): cleared by the global handler |
| `MainLayout.tsx:168` and menu items | `defaultSelectedKeys={[""]}`; parent and child share keys `/journals`, `/podcast-schedule`, `/product-category` | **Open** (the "Duplicated key" warning still logs) |
| `Login.tsx:33` | `error.response.data` read without a guard | **Done**: errors are read through `apiErrorMessage`; unknown errors now show a message, and a missing token is refused (security pass) |
| `Dashboard.tsx:433` | Professionals chart uses `period`, not `professionalPeriod` | **Open** |
| `Dashboard.tsx:1243,1280` | Dropdowns default to "week"; state starts at "today" | **Open** |
| `Dashboard.tsx:96` | Y-axis `max: 50` cuts off larger values | **Open** |
| `Dashboard.tsx:1081` | `rowKey="course_id"`, a field the rows lack | **Open** |
| `User.tsx:106,174` | Sort fields look swapped; search covers only the current page | **Open** |
| `AddAdmin` | "Select Role" option could submit `role_id = NaN` | **Done** (now an antd Select with a placeholder) |
| 7 files | antd props passed to PrimeReact buttons | **Done** (PrimeReact removed) |
| `AdminUser.tsx` | `<div s>` typo | **Done** |
| Missing React keys (6 places) | | **Partly**: 2 were on deleted pages; `CreateBusinessCard.tsx:1193` and 3 in `Professionals.tsx` remain |
| `AppointmentsApi.ts`, `ClipsApi.ts`, `PostApi.ts` | `timezone: "Asia/Kolkata"` hard-coded | **Open** |
| `DashboardApi.ts:16,22` | `BASE_URL + "/admin/..."` gives `//admin` | **Open** |
| `Product.tsx:319` | Effect depends on `[tableParams]`; every sort or page click refetches everything | **Open** |
| `Banner.tsx` | Redirects to six routes that don't exist here | **Done** (removed) |

### Mismatched UI

| Item | Status | Notes |
| --- | --- | --- |
| Several kits on one screen | **Done** | antd everywhere |
| No shared theme; several brand-teal shades and blues | **Done** | One palette in `index.css` and an app-wide antd theme built from it (pass 8); a test keeps colour literals out of every other file |
| 15 date display formats | **Open** | Still 15, including both `DD/MM/YYYY` and `MM/DD/YYYY` |
| "Welcome Melanie", "Employee(s) deleted", "Number of Services", two "Status" columns in Products, Change Password at `/reset-password` | **Open** | All five unchanged |
| Current page never highlighted | **Open** | |
| Scrollbars hidden (`index.css`, `MainLayout.scss`) | **Open** | |
| Header menu needs Bootstrap JS; `<li>` in a `<div>`; "Sign Out" link without `to` | **Done** | antd Dropdown |
| Banner row checkboxes with no bulk action | **Done** | Removed |
| Orders shows plain "Loading..." text | **Open** | `Orders.tsx:157` |
| Deprecated antd props (`visible`, `bodyStyle`) | **Done** | Part of the antd 6 migration |
| 14 `<a>` elements without `href` | **Open** | Lint reports 14 `anchor-is-valid` warnings |

### Code health

| Item | Status | Notes |
| --- | --- | --- |
| No shared HTTP client; two auth schemes | **Done** | One client in `utils/session.ts` sends `Authorization: Bearer` on every call (pass 9) |
| List-page logic copy-pasted about 40 times | **Open** | |
| Lint findings | **Partly** | Now oxlint: 43 hook-dependency, 14 anchor, 4 missing-key warnings; 0 errors |
| Misspelled file names | **Partly** | Logo renamed; `ViewSericeCategory.jsx` deleted. Still misspelled: `Directroy.tsx`, `Eductaion/AddEduction.tsx`, `Eductaion/Eduction.tsx`, `AddServiceCategroy.tsx`, `EcommeceApi.ts`, `Viewad.tsx`. |
| No tests, boilerplate README, no Node pin | **Done** | 21 tests, new README, `engines` set (no `.nvmrc`) |

## Decisions to revisit

Choices made along the way that are worth a second look. None blocks anything today.

| Decision | Why it was made | What would change it |
| --- | --- | --- |
| Production builds drop every `console.*` call, `console.error` included | Error logs print whole axios errors, the admin token in the request headers included | Adding an error reporter (e.g. Sentry) to see production errors |
| Ad videos are cropped with the browser's encoder (WebCodecs), not ffmpeg.wasm | 32 MB less to ship and download, and faster | An admin browser without WebCodecs H.264 encoding (old Safari or Firefox) or one that can't decode a source format such as HEVC (it couldn't preview that video either); server-side cropping would cover both |
| `robots.txt` allows crawling, against the audit's suggestion | Search engines only honour `noindex` on pages they may fetch | Nothing, unless the host adds an `X-Robots-Tag` header; then either works |
| antd's preset tag colours (`"green"`, `"purple"`, …) are themed rather than replaced | One mapping in `config/theme.ts` keeps all tags on the palette without touching 60+ call sites | Wanting tag colours by meaning only (`success`, `error`, …); then replace the names |
| Panels are near-white (`#fcfcfa`) on an off-white page (`#f5f6f3`) | You asked for no pure white; panels still need to stand out from the page | Taste: change `--color-surface` / `--color-bg` in `index.css` |
| The sidebar is dark slate (`#263033`), and the logo bar off-white | antd's default navy clashed with the teal, and the black logo can't sit on dark teal | A light sidebar, or a white logo file |
| Access card brand colours (default `#23B9CD` and 8 presets) stay as they were | They are card data saved to the backend and shown on public cards, not panel styling | A product decision to change the cards' default brand colour |

## Found during the TypeScript migration

Strict typing flagged code that reads fields that don't exist, passes arguments nobody reads, or can only fail.

**Fixed.** These could only throw or never worked, and the intended field was obvious:

- **Clips search** read `item.content`, which clips don't have, so the first keystroke threw. It now searches `description`.
- **Posts search** threw on posts without text (`content` is null). It now skips them.
- **Banner, Professional Form and Products:** sorting by the name column read `a.user_profile`, which those rows don't have, so the click threw (audit item). Each now sorts by the name the column shows.
- **Orders search** read `item.orders_user`, but the customer is under `order_details_order`, so it never matched (audit item).
- **Order details drawer:** it requested `getOrderById/null` on page load. That request is now skipped until an order is picked.
- **Service Categories:** deleting a category called `getData()` without the table state, which threw inside its own try/catch, so the list never refreshed. It now passes the current table state.
- **Ads:** cropping a video for the "Journal Listing In-Feed 2" slot (no fixed height) always failed inside ffmpeg (`scale=600:null`). The dialog now says the slot has no fixed video size.
- **Access card details:** the business-hours list used `size="4px"`, which antd ignores. It is now `size={4}`.
- **Create Access Card:** `variant="bordered"` isn't a valid Card value; it is now `"outlined"`, with no visual change.

**Kept as-is, for the bug pass.** Behaviour is unchanged; the code is typed to match what it does today:

- **More requests that go out without a token.** Most of these pages passed a token that the API function ignores; those dead arguments were removed, and the requests are unchanged.
  - Referral and Reward Rules lists
  - Professional Form list
  - FAQ delete
  - Service Category CSV upload (a plain `fetch`)
  - Every Directory, Ads, journal category, author, journal, education, event and shop call
  - Access card list and delete
  - All 20 dashboard stats
- **Podcast schedules:** "get by id" and "delete" were called without the token, so they sent `Authorization: Bearer undefined`. Fixed in the security pass.
- **Parameters that never reach the API:** the `order` / `sortField` sent by the Users, Professionals, Clips, Service Categories and Appointments lists, and `limit` on Directory, Authors and Journal Categories. They were removed, so requests are unchanged.
- **Inconsistent response reads:** Service Categories and Appointments read rows from `data.rows` but the total from a top-level `count`; one of the two is probably wrong.
- **Edit Service Category:** `handleSubmit` is both the Save button's click handler and the nested form's `onFinish`. Pressing Enter in the title passes form values instead of an event, and throws.
- **Double fetching:**
  - User Bookings and Professional Bookings declare the same effect twice, so every tab switch fetches twice.
  - Edit Access Card fetches the card twice on load.
- **Professionals:** the promotion handlers reset `selectedProfessional` where `selectedProfession` looks intended, so the profession picker keeps its value.
- **Create Access Card** shares one city list across all locations, so picking a state for one location replaces the others' city options.
- **Login Activity:** the spinner never shows, because `loading` is never set to true.

## The audit's suggested order, revisited

| Phase | Done | Still to do |
| --- | --- | --- |
| 1. Now | Credential logs removed; axios, dompurify and router upgraded; moment removed; keys disabled by the owner; `SafeHtml` for the 6 HTML sites; `noindex` | Nothing left in the panel |
| 2. This week | MUI removed; route groups decided (deleted); react-toastify, Font Awesome, Bootstrap JS and Popper removed; expired sessions cleared by a global handler | Broken-code table; catch-all 404 route; shared axios client and 401 handling (after the backend answers); confirm server auth on token-less endpoints |
| 3. Consolidate | antd only; dayjs, one icon set, one editor, chart.js, one cropper; one theme and palette | One date format |
| 4. Platform | Vite; React 19, antd 6, react-router 8 | `React.lazy` per route |

## Suggested next steps

1. **Browser QA of this branch.** Nothing has been clicked through since the migration. Priorities:
   - visual changes from antd 6;
   - the small fixes listed in [Found during the TypeScript migration](#found-during-the-typescript-migration);
   - the modals and drawer listed in pass 5;
   - video previews;
   - the rich-text editor on the journal pages;
   - image cropping.
2. **Security, backend side.** The panel's own fixes are done (pass 7). The rest waits on answers in the [backend questions doc](https://claude.ai/code/artifact/7cf1fb80-6241-4282-b8a6-9966c6290ed9):
   - server auth on the 122 endpoints called without a token (40 change data); this is the most urgent item;
   - one header scheme, then one shared axios client that attaches the token to every request;
   - 401 vs 403, so the panel can log out on 401;
   - token lifetime, revocation, login rate limiting, and maybe httpOnly cookies;
   - a new, restricted Maps key and security headers on the panel's host.
3. **Route-level lazy loading**, to get the 852 KB gzipped bundle off the login path.
4. **The 11 open bugs** in the broken-code table, plus the "kept as-is" items found during the TypeScript migration.
5. **Date format:** a single date-format helper (the theme is done, pass 8). Font sizes, spacing and radii are still written per file; tokens for them would be the next step after colour.
6. **Housekeeping:**
   - fix the misspelled file names;
   - replace browser-image-compression;
   - move Google Places to `PlaceAutocompleteElement` (it already loads on demand);
   - turn on the oxlint rules that are off today.
