# Open WebUI White Label UI Inventory

> **Documentation-only file.** This file describes branding elements identified during source-code investigation.
It does not modify any application source code, assets, configuration, or behavior.

---

## 1. Overview

This document is a comprehensive inventory of all frontend UI branding elements in the Open WebUI application (version v0.13.4 baseline).
The purpose is to prepare a detailed catalog of all visible branding-related elements that may need to be customized as part of the White Label project.

### Scope

**IN SCOPE** — Frontend UI branding elements visible to users:
- Application name displayed in the interface
- Sidebar application name
- Application logos
- Favicon and browser icons
- Browser tab title and page metadata
- Login and signup page branding
- Welcome screens, splash screens, loading screens
- About dialogs and application information
- Footer branding
- Branding-related text in menus and dialogs
- Branding-related images and illustrations
- Frontend metadata and page titles
- i18n translation strings containing branding

**OUT OF SCOPE** — Backend and internal service identifiers:
- Backend module names
- Python package names
- API routes and endpoint names
- Database tables and models
- Internal configuration variables (unless they directly control visible frontend branding)
- Docker service names and image names
- Internal logging identifiers
- LiteLLM integration code
- Authentication and authorization mechanisms
- Internal service communication
## 2. Sidebar Application Name (Initial Reference Element)

This section documents the first branding element identified for customization: the application name displayed in the sidebar.

### HTML Reference

\`\`\`html
<div
  id="sidebar-webui-name"
  class=" self-center truncate font-normal text-gray-700 dark:text-gray-200"
>
  Open WebUI
</div>
\`\`\`

### Source Component

- **Component:** `Sidebar.svelte`
- **File:** `src/lib/components/layout/Sidebar.svelte`

### Source Location

- **Line numbers:** 1427–1437
  - Line 1427: `<a href="/" class="flex min-w-0 flex-1 px-0.5" on:click={newChatHandler}>`
  - Line 1428–1430: Comment block with LICENSE notice
  - Line 1431–1436: `<div id="sidebar-webui-name">...</div>`
  - Line 1435: `{$WEBUI_NAME}`

### Data Source

- **Variable:** `$WEBUI_NAME` (Svelte store, reactive)
- **Store definition:** `src/lib/stores/index.ts`, line 20:
  ```ts
  export const WEBUI_NAME = writable(APP_NAME);
  ```
- **Constant source:** `src/lib/constants.ts`, line 7:
  ```ts
  export const APP_NAME = 'Open WebUI';
  ```

### Value Flow

1. `APP_NAME` constant = `'Open WebUI'` (hardcoded in `src/lib/constants.ts`)
2. `WEBUI_NAME` writable store initialized with `APP_NAME` value (`src/lib/stores/index.ts`, line 20)
3. At runtime, `WEBUI_NAME` is overwritten by backend config: `src/routes/+layout.svelte`, line 333:
   ```ts
   await WEBUI_NAME.set(backendConfig.name);
   ```
4. Backend `WEBUI_NAME` comes from environment variable: `backend/open_webui/env.py`, line 963:
   ```python
   WEBUI_NAME = os.getenv('WEBUI_NAME', 'Open WebUI')
   ```
5. If `WEBUI_NAME` env var is set to something other than `'Open WebUI'`, it appends ` (Open WebUI)` (env.py, lines 964–965)

### Is Text Hardcoded or Dynamic?

The text is **dynamically generated** through the chain: `APP_NAME` constant → `WEBUI_NAME` store → backend config → frontend store update → Svelte template interpolation `{$WEBUI_NAME}`.

### Shared Configuration Source

Yes — `WEBUI_NAME` is a shared Svelte store that supplies the application name to multiple UI elements across the application.

### Same Value Reused Elsewhere

Yes. `WEBUI_NAME` is referenced in 100+ source files including:
- Sidebar (`src/lib/components/layout/Sidebar.svelte`)
- Navbar (`src/lib/components/chat/Navbar.svelte`)
- Auth page (`src/routes/auth/+page.svelte`)
- Home layout (`src/lib/components/home/HomeLayout.svelte`)
- About dialog (`src/lib/components/chat/Settings/About.svelte`)
- Error page (`src/routes/error/+page.svelte`)
- Root layout (`src/routes/+layout.svelte`)
- OnBoarding (`src/lib/components/OnBoarding.svelte`)
- All workspace layouts (Models, Knowledge, Tools, Prompts, Skills, Workspace)

### Future Customization Considerations

1. Changing `APP_NAME` in `src/lib/constants.ts` changes the **initial** value before backend config loads.
2. Changing the backend `WEBUI_NAME` environment variable changes the runtime value (after backend config fetch).
3. Because `WEBUI_NAME` is a shared store, modifying it at one source updates all dependent UI elements automatically.
4. The About dialog has special handling: it only displays `$WEBUI_NAME` if it does **not** include `'Open WebUI'` (line 136–138 of About.svelte).

---

## 3. UI Branding Inventory

The following table lists all identified UI branding elements. Each row represents a specific, identifiable UI element visible to users.

| ID | UI Element | Display Location | Source File | Component | Current Branding | Customization Method | Priority |
|----|-----------|-----------------|-------------|-----------|------------------|---------------------|----------|
| UI-001 | Sidebar application name | Sidebar header (top) | `src/lib/components/layout/Sidebar.svelte` (line 1435) | Sidebar.svelte | `{$WEBUI_NAME}` | Modify `APP_NAME` constant or `WEBUI_NAME` store | High |
| UI-002 | Browser tab title (root layout) | Browser tab / window title | `src/routes/+layout.svelte` (line 464) | +layout.svelte | `{$WEBUI_NAME}` | Modify `WEBUI_NAME` store | High |
| UI-003 | Browser tab title (auth page) | Browser tab / window title on /auth | `src/routes/auth/+page.svelte` (line 256) | auth/+page.svelte | `{`${$WEBUI_NAME}`}` | Modify `WEBUI_NAME` store | High |
| UI-004 | Browser tab title (home page) | Browser tab / window title on home | `src/lib/components/home/HomeLayout.svelte` (line 19) | HomeLayout.svelte | `{$i18n.t('Home')} / {$WEBUI_NAME}` | Modify `WEBUI_NAME` store | High |
| UI-005 | Browser tab title (workspace pages) | Browser tab / window title on workspace routes | Multiple: `src/lib/components/workspace/Models.svelte` (line 518), `Knowledge.svelte` (line 314), `Tools.svelte` (line 345), `Prompts.svelte` (line 401), `Skills.svelte` (line 348), `Workspace.svelte` (line 123) | Various workspace components | `{$WEBUI_NAME}` via PageTitle | Modify `WEBUI_NAME` store | Medium |
| UI-006 | Login page title | Login/signup page heading | `src/routes/auth/+page.svelte` (line 337) | auth/+page.svelte | `Get started with {{WEBUI_NAME}}`, `Sign in to {{WEBUI_NAME}}`, `Sign up to {{WEBUI_NAME}}` | Modify `WEBUI_NAME` store | High |
| UI-007 | Login page logo (center position) | Login card center logo image | `src/routes/auth/+page.svelte` (line 320–326) | auth/+page.svelte | `src="{WEBUI_BASE_URL}/static/favicon.png"`, alt=`{$WEBUI_NAME} logo` | Replace image file or change `WEBUI_BASE_URL` | High |
| UI-008 | Login page logo (top-right position) | Login page top-right corner logo | `src/routes/auth/sessions/[id]/+page.svelte` (lines 68–74, 96–106) | auth sessions page | `src="{WEBUI_BASE_URL}/static/favicon.png"`, alt=`{$WEBUI_NAME} logo` | Replace image file | Medium |
| UI-009 | Onboarding screen logo | Onboarding welcome screen top-left | `src/lib/components/OnBoarding.svelte` (lines 47–53) | OnBoarding.svelte | `src="/static/favicon.png"`, alt=`{$WEBUI_NAME} logo` | Replace image file | High |
| UI-010 | Onboarding screen wordmark | Onboarding welcome screen header text | `src/lib/components/OnBoarding.svelte` (line 79) | OnBoarding.svelte | `Open WebUI` (hardcoded text) | Modify source text | High |
| UI-011 | About dialog title | Settings > About dialog | `src/lib/components/chat/Settings/About.svelte` (line 64) | About.svelte | `${$WEBUI_NAME} ${version title}` | Modify `WEBUI_NAME` store | Medium |
| UI-012 | About dialog copyright | Settings > About dialog footer | `src/lib/components/chat/Settings/About.svelte` (lines 176–178) | About.svelte | `Copyright (c) {year} Open WebUI Inc.` | Modify source text | Medium |
| UI-013 | About dialog license attribution | Settings > About dialog | `src/lib/components/chat/Settings/About.svelte` (lines 136–138) | About.svelte | `{$WEBUI_NAME} - {license type} purchased by {org}` (conditional) | Modify `WEBUI_NAME` store | Medium |
| UI-014 | Error page title | Backend required error page | `src/routes/error/+page.svelte` (line 25) | error/+page.svelte | `{{webUIName}} Backend Required` | Modify `WEBUI_NAME` store | Medium |
| UI-015 | Splash screen logo (light mode) | Application splash screen on load | `src/app.html` (lines 122–123) | app.html (inline script) | `src="/static/splash.png"` | Replace image file | High |
| UI-016 | Splash screen logo (dark mode) | Application splash screen on load (dark) | `src/app.html` (lines 88–90, 122) | app.html (inline script) | `src="/static/splash-dark.png"` | Replace image file | High |
| UI-017 | Splash screen logo (HER theme) | Application splash screen (HER theme) | `src/app.html` (lines 171–175) | app.html | `src="/static/splash.png"` | Replace image file | Medium |
| UI-018 | Favicon (standard) | Browser favicon | `src/app.html` (line 9) | app.html | `href="/static/favicon.png"` | Replace image file | High |
| UI-019 | Favicon (96x96) | Browser favicon | `src/app.html` (lines 11–16) | app.html | `href="/static/favicon-96x96.png"` | Replace image file | High |
| UI-020 | Favicon (SVG) | Browser favicon | `src/app.html` (lines 17–22) | app.html | `href="/static/favicon.svg"` | Replace image file | High |
| UI-021 | Favicon (shortcut icon) | Browser favicon | `src/app.html` (line 23) | app.html | `href="/static/favicon.ico"` | Replace image file | High |
| UI-022 | Apple touch icon | iOS home screen icon | `src/app.html` (lines 25–29) | app.html | `href="/static/apple-touch-icon.png"` | Replace image file | High |
| UI-023 | PWA manifest name | Web app manifest | `src/routes/+layout.svelte` (lines 3049–3052), `backend/open_webui/main.py` | Backend generates manifest | `'name': app.state.WEBUI_NAME`, `'short_name': app.state.WEBUI_NAME` | Modify backend WEBUI_NAME | High |
| UI-024 | PWA manifest icons | Web app manifest icons | `backend/open_webui/main.py` (lines 3060–3071) | Backend generates manifest | `'src': '/static/logo.png'` | Replace image file | High |
| UI-025 | OpenSearch description | Browser search integration | `backend/open_webui/main.py` (lines 3087–3095) | Backend generates XML | `<ShortName>{app.state.WEBUI_NAME}</ShortName>` | Modify backend WEBUI_NAME | Medium |
| UI-026 | i18n translations referencing Open WebUI | All translated UI text | `src/lib/i18n/locales/en-US/translation.json` and other locale files | i18n system | Multiple strings containing "Open WebUI" | Modify translation files | Medium |
| UI-027 | Twitter/X link in About | Settings > About dialog community links | `src/lib/components/chat/Settings/About.svelte` (line 153) | About.svelte | `https://twitter.com/OpenWebUI` | Modify source URL | Low |
| UI-028 | GitHub link in About | Settings > About dialog community links | `src/lib/components/chat/Settings/About.svelte` (line 158) | About.svelte | `https://github.com/open-webui/open-webui` | Modify source URL | Low |
| UI-029 | Open WebUI Inc. copyright link | Settings > About dialog copyright | `src/lib/components/chat/Settings/About.svelte` (line 178) | About.svelte | `https://openwebui.com` | Modify source URL | Low |
| UI-030 | Discord link in About | Settings > About dialog community links | `src/lib/components/chat/Settings/About.svelte` (line 148) | About.svelte | `https://discord.gg/5rJgQTnV4s` | Modify source URL | Low |
| UI-031 | Read the docs link | Onboarding welcome screen | `src/lib/components/OnBoarding.svelte` (line 117) | OnBoarding.svelte | `https://docs.openwebui.com/` | Modify source URL | Low |
| UI-032 | Fallback logo for model images | Model profile images when unavailable | Multiple: `src/lib/components/workspace/Models/ModelEditor.svelte`, `CreateModel.svelte`, `Models.svelte`, `src/lib/components/chat/ChatPlaceholder.svelte`, `src/lib/components/chat/MessageInput/Commands/AtCommands.svelte`, `Models.svelte` | Various components | `src="{WEBUI_BASE_URL}/static/favicon.png"` or `src="/favicon.png"` | Replace image file | Medium |
| UI-033 | Open WebUI Community references | Community sharing redirects | `src/lib/components/workspace/Tools.svelte` (line 229), `Models.svelte` (line 280), `Prompts.svelte` (line 230), `src/lib/components/chat/ShareChatModal.svelte` (line 49, 213) | Various components | `Redirecting you to Open WebUI Community`, `Share to Open WebUI Community` | Modify i18n strings | Low |

---

## 4. Image and Asset Inventory

The following table lists all image and visual assets related to Open WebUI branding.

### Branding Assets (Directly Replaceable)

| ID | Asset Name | File Path | Format | Dimensions | Usage Location | Referenced By | Direct File Replacement |
|----|-----------|-----------|--------|------------|----------------|---------------|------------------------|
| IMG-001 | Main favicon | `static/static/favicon.png` | PNG | 512x512 | Browser tab, login page, onboarding, auth pages | `src/app.html` (line 9), `src/routes/auth/+page.svelte` (line 323), `src/lib/components/OnBoarding.svelte` (line 50), `src/routes/auth/sessions/[id]/+page.svelte` | Yes |
| IMG-002 | Favicon 96x96 | `static/static/favicon-96x96.png` | PNG | 96x96 | Browser tab | `src/app.html` (lines 11–16) | Yes |
| IMG-003 | Favicon SVG | `static/static/favicon.svg` | SVG | Scalable | Browser tab | `src/app.html` (lines 17–22) | Yes |
| IMG-004 | Favicon ICO | `static/static/favicon.ico` | ICO | 32x32 | Browser tab (legacy) | `src/app.html` (line 23) | Yes |
| IMG-005 | Apple touch icon | `static/static/apple-touch-icon.png` | PNG | 180x180 | iOS home screen | `src/app.html` (lines 25–29) | Yes |
| IMG-006 | Main logo | `static/static/logo.png` | PNG | 500x500 | PWA manifest icons | `backend/open_webui/main.py` (lines 3061, 3067) | Yes |
| IMG-007 | Splash screen (light) | `static/static/splash.png` | PNG | 500x500 | App splash screen | `src/app.html` (lines 89, 122, 175) | Yes |
| IMG-008 | Splash screen (dark) | `static/static/splash-dark.png` | PNG | 500x500 | App splash screen (dark mode) | `src/app.html` (lines 88–90, 122) | Yes |
| IMG-009 | PWA icon 192x192 | `static/static/web-app-manifest-192x192.png` | PNG | 192x192 | PWA manifest (static site.webmanifest — not referenced by application code) | `static/static/site.webmanifest` (lines 6–10) | Yes |
| IMG-010 | PWA icon 512x512 | `static/static/web-app-manifest-512x512.png` | PNG | 512x512 | PWA manifest (static site.webmanifest — not referenced by application code) | `static/static/site.webmanifest` (lines 11–16) | Yes |
| IMG-011 | Welcome video | `static/assets/welcome.mp4` | MP4 | Unknown | Onboarding background video | `src/lib/components/OnBoarding.svelte` (line 59) | Yes (same filename) |
| IMG-012 | Welcome poster | `static/assets/welcome.webp` | WEBP | 1280x720 | Onboarding video poster | `src/lib/components/OnBoarding.svelte` (line 65) | Yes (same filename) |
| IMG-013 | User placeholder image | `static/user.png` | PNG | Unknown | Default user avatar | Various components referencing user.png | Yes |
| IMG-014 | Image placeholder | `static/image-placeholder.png` | PNG | Unknown | Generic image placeholder | Various components | Yes (generic, not branding) |

### Assets Requiring Source-Code Changes

None identified — all branding images are referenced by static paths and can be replaced by placing new image files at the same paths.

### Dynamically Generated Assets

- **PWA manifest:** Generated by backend at `backend/open_webui/main.py` (lines 3049–3078). References `/static/logo.png` and uses `app.state.WEBUI_NAME`. The manifest itself is dynamically generated, but the image assets it references are static files.
- **OpenSearch XML:** Generated by backend at `backend/open_webui/main.py` (lines 3087–3096). References `app.state.WEBUI_NAME` and favicon URL.

### Non-Branding Visual Assets (Generic)

The following assets are generic illustrations or icons, not Open WebUI branding. They should **not** be replaced as part of white labeling:

- `src/lib/components/icons/` — All Svelte icon components (UI icons, not branding)
- `src/lib/components/chat/FileNav/Icon.svelte` — File type icons (pdf-logo, pptx-logo, etc.)
- `static/static/user.png` — Generic user avatar placeholder (could be considered neutral)
- `static/image-placeholder.png` — Generic image placeholder
- `static/static/marker-icon.png`, `marker-icon-2x.png`, `marker-shadow.png` — Map markers (Leaflet)


## 5. Shared Branding Sources and Dependencies

### Primary Shared Source: `WEBUI_NAME` Store

**File:** `src/lib/stores/index.ts` (line 20)
```ts
export const WEBUI_NAME = writable(APP_NAME);
```

**Initial value source:** `src/lib/constants.ts`, line 7:
```ts
export const APP_NAME = 'Open WebUI';
```

**Runtime override:** `src/routes/+layout.svelte` (line 333)
```ts
await WEBUI_NAME.set(backendConfig.name);
```

**Backend source:** `backend/open_webui/env.py` (line 963)
```python
WEBUI_NAME = os.getenv('WEBUI_NAME', 'Open WebUI')
```

**Dependency chain:** `APP_NAME` constant → `WEBUI_NAME` store → backend config API → frontend store update → all UI components

### Components Depending on `WEBUI_NAME`

The `WEBUI_NAME` store is imported and used in 100+ files. Key consumers include:

| Component/File | Usage |
|---------------|-------|
| `src/lib/components/layout/Sidebar.svelte` | Sidebar app name display (UI-001) |
| `src/routes/+layout.svelte` | Browser tab title, meta tags (UI-002, UI-023) |
| `src/routes/auth/+page.svelte` | Auth page title, login headings, logo alt text (UI-003, UI-006, UI-007) |
| `src/lib/components/home/HomeLayout.svelte` | Home page browser title (UI-004) |
| `src/lib/components/chat/Settings/About.svelte` | About dialog title, license attribution (UI-011, UI-012, UI-013) |
| `src/routes/error/+page.svelte` | Error page title (UI-014) |
| `src/lib/components/OnBoarding.svelte` | Onboarding logo alt text | |

### Backend-Provided Branding via Config API

The backend `/api/v1/config` endpoint returns a `name` field that becomes `WEBUI_NAME` on the frontend:

**File:** `backend/open_webui/main.py` (lines 2432–2436)
```python
return {
    ...
    'name': app.state.WEBUI_NAME,
    ...
}
```

**File:** `backend/open_webui/main.py` (lines 3049–3052)
```python
{
    'name': app.state.WEBUI_NAME,
    'short_name': app.state.WEBUI_NAME,
    ...
}
```

### i18n Translation Strings with `{{WEBUI_NAME}}`

**File:** `src/lib/i18n/locales/en-US/translation.json`
- Line 1641: `"Get started with {{WEBUI_NAME}}"`
- Line 4188: `"Sign in to {{WEBUI_NAME}}"`
- Line 4189: `"Sign in to {{WEBUI_NAME}} with LDAP"`
- Line 4194: `"Sign up to {{WEBUI_NAME}}"`
- Line 4195: `"Signing in to {{WEBUI_NAME}}"`

These are used in `src/routes/auth/+page.svelte` via `$i18n.t()` calls with `WEBUI_NAME` parameter substitution.

---

## 6. Frontend vs Backend Classification

### Frontend UI Branding Elements (IN SCOPE)

All elements listed in Section 3 (UI-001 through UI-033) and Section 4 (IMG-001 through IMG-014) are frontend UI branding elements.

### Backend Internal Identifiers (OUT OF SCOPE)

The following occurrences of "Open WebUI" or related terms are **internal technical identifiers** and must NOT be changed as part of UI White Label customization:

| Identifier | Location | Reason for Exclusion |
|-----------|----------|---------------------|
| Python package name `open_webui` | `backend/open_webui/` directory | Internal Python package, not user-visible |
| Docker service names | `docker-compose*.yaml` | Internal infrastructure identifiers |
| Database filename `webui.db` | `backend/open_webui/env.py` (line 89) | Internal database file name |
| API route paths | `backend/open_webui/` routers | Internal API endpoints, not branding |
| OAuth client name `'Open WebUI'` | `backend/open_webui/utils/oauth.py` (line 585) | Internal OAuth client identifier |
| MFA issuer name `'Open WebUI'` | `backend/open_webui/utils/mfa.py` (line 260) | Internal TOTP issuer identifier |
| Notification app name default `'Open WebUI'` | `backend/open_webui/utils/notifications.py` (lines 345, 371) | Internal notification parameter default |
| ACP client info `'open_webui'` | `backend/open_webui/utils/agents/acp.py` (line 164) | Internal agent protocol identifier |
| Codex client info `'open_webui'` | `backend/open_webui/utils/agents/codex.py` (line 20) | Internal agent protocol identifier |
| LiteLLM integration code | Various backend files | Internal integration, not user-visible branding |
| Collection name references | `backend/open_webui/retrieval/vector/dbs/*.py` | Internal vector database collection names |
| GitHub repository URLs in About | `src/lib/components/chat/Settings/About.svelte` | External links to project repository (not application branding per se) |
| `openwebui.com` domain references | Various files | External documentation/support links |

### Dependencies That Supply Visible Frontend Branding

The following backend elements **do** supply visible frontend branding and should be documented (but not modified without explicit authorization):

| Backend Element | Location | Supplies Frontend Element |
|----------------|----------|--------------------------|
| `WEBUI_NAME` env var | `backend/open_webui/env.py` (line 963) | `WEBUI_NAME` store → all UI name displays |
| `backendConfig.name` API response | `backend/open_webui/main.py` (line 2435) | `WEBUI_NAME` store update on frontend |
| PWA manifest generation | `backend/open_webui/main.py` (lines 3049–3078) | PWA name, short_name, icons |
| OpenSearch XML generation | `backend/open_webui/main.py` (lines 3087–3096) | Search description ShortName |

---

## 7. Recommended Implementation Order

The following sequence is recommended for safe, progressive UI customization:

### Phase 1: High-Impact, Independent Changes

1. **UI-001 — Sidebar application name** (Sidebar.svelte line 1435)
   - Change `APP_NAME` in `src/lib/constants.ts` or set `WEBUI_NAME` env var
   - Independent, no side effects on other components

2. **IMG-001 through IMG-005 — Favicon assets**
   - Replace `static/static/favicon.png`, `favicon-96x96.png`, `favicon.svg`, `favicon.ico`, `apple-touch-icon.png`
   - Direct file replacement, no source code changes

3. **IMG-007, IMG-008 — Splash screen images**
   - Replace `static/static/splash.png` and `splash-dark.png`
   - Direct file replacement

4. **UI-002 — Browser tab title (root layout)**
   - Automatically updated when `WEBUI_NAME` changes

### Phase 2: Authentication and Welcome Screens

5. **IMG-006 — Main logo (PWA manifest)**
   - Replace `static/static/logo.png`

6. **IMG-009, IMG-010 — PWA manifest icons**
   - Replace `web-app-manifest-192x192.png` and `web-app-manifest-512x512.png`

7. **UI-006, UI-007 — Login page branding**
   - Login page title updates via `WEBUI_NAME`
   - Login page logo uses `favicon.png` (already replaced in Phase 1)

8. **UI-009, UI-010 — Onboarding screen**
   - Logo uses `favicon.png` (already replaced)
   - Wordmark text "Open WebUI" in OnBoarding.svelte line 79 requires source change

### Phase 3: About Dialog and Secondary Elements

9. **UI-011 through UI-013 — About dialog**
   - Title updates via `WEBUI_NAME`
   - Copyright text "Open WebUI Inc." requires source change
   - Social links (GitHub, Twitter, Discord) require source changes

10. **UI-014 — Error page**
    - Automatically updated via `WEBUI_NAME`

11. **IMG-011, IMG-012 — Welcome video/poster**
    - Replace `welcome.mp4` and `welcome.webp` (same filenames)

### Phase 4: i18n and Community References

12. **UI-026 — i18n translation strings**
    - Update translation files for all locales containing "Open WebUI"
    - Special attention to `{{WEBUI_NAME}}` parameterized strings

13. **UI-027 through UI-031 — External links**
    - Twitter/X, GitHub, Open WebUI Inc., Discord, docs links

14. **UI-032 — Fallback logo references**
    - Components that fall back to `favicon.png` for model images (already replaced in Phase 1)

15. **UI-033 — Community references**
    - "Open WebUI Community" text in sharing dialogs

---

## 8. Unresolved Items

1. **Image dimensions for some assets:** Could not programmatically determine dimensions for `favicon.ico`, `user.png`, `image-placeholder.png`, `welcome.mp4`. The `file` command was not available in the environment.

2. **PWA manifest dual sources:** Verified — the active manifest is the backend-generated `/manifest.json` route (`backend/open_webui/main.py` line 3029). The static file `static/static/site.webmanifest` exists but is **not referenced** anywhere in the application code (verified via grep). The empty `static/manifest.json` placeholder is overridden by the backend route.

3. **`static/` vs `static/static/` vs `backend/open_webui/static/`:** Verified — all three directories contain **byte-identical** files (confirmed via md5sum). `STATIC_DIR` resolves to `backend/open_webui/static/`. No build step copies files between directories; all three are independently present in the repository. All three copies must be updated when replacing an asset to remain synchronized.

4. **HER theme splash screen:** Verified — `splash.png` is used for HER theme with CSS `filter: invert(1)`. Uncertainty remains whether a separate dark-optimized asset is needed beyond `splash-dark.png`.

5. **`static/custom.css` and `static/static/custom.css`:** Both files exist but are empty (0 bytes). May be intended for custom styling overrides.

---

## Summary

- **UI branding elements identified:** 33 (UI-001 through UI-033)
- **Branding-related image assets:** 14 (IMG-001 through IMG-014)
- **Directly replaceable image assets:** 14 (all can be replaced by same filename/path)
- **Elements requiring source-code changes:** UI-010 (Onboarding wordmark), UI-012 (About copyright), UI-027 through UI-031 (external links), UI-033 (community references)
- **Primary shared branding dependency:** `WEBUI_NAME` Svelte store, initialized from `APP_NAME` constant, overridden by backend config API
- **No application source code or assets were modified** during this investigation


## Task 01 Implementation Status — Complete

**Task identifier:** Task 01
**New application name:** Bezia
**Status:** Complete

### Modified Source Files

| File | Old Value | New Value |
|------|-----------|-----------|
| `src/lib/constants.ts` (line 7) | `export const APP_NAME = 'Open WebUI';` | `export const APP_NAME = 'Bezia';` |
| `backend/open_webui/env.py` (line 963) | `WEBUI_NAME = os.getenv('WEBUI_NAME', 'Open WebUI')` | `WEBUI_NAME = os.getenv('WEBUI_NAME', 'Bezia')` |

### Removed Legacy Suffix Behavior

The following legacy suffix logic was removed from `backend/open_webui/env.py` (lines 964–965):

```python
if WEBUI_NAME != 'Open WebUI':
    WEBUI_NAME += ' (Open WebUI)'
```

This ensured that when a custom `WEBUI_NAME` was set via environment variable, the legacy `(Open WebUI)` suffix was appended. This behavior has been removed so the application name is exactly `Bezia` without any suffix.

### Preserved Architecture

The shared `WEBUI_NAME` configuration flow remains unchanged:

1. `src/lib/constants.ts` — `APP_NAME` constant (frontend default, now `'Bezia'`)
2. `src/lib/stores/index.ts` — `WEBUI_NAME` writable store initialized from `APP_NAME` (unchanged)
3. `src/routes/+layout.svelte` — Runtime update `WEBUI_NAME.set(backendConfig.name)` (unchanged)
4. `backend/open_webui/env.py` — Backend default from `WEBUI_NAME` env var, default `'Bezia'`
5. `backend/open_webui/main.py` — Configuration API exposing `app.state.WEBUI_NAME` (unchanged)

Environment variable override support remains fully functional: administrators can still set `WEBUI_NAME` to override the default in future deployments.

### Intentionally Unchanged Branding Elements

The following UI branding elements were **not** modified as part of Task 01 and are intentionally deferred to future tasks:

- Onboarding hardcoded wordmark ("Open WebUI" in `OnBoarding.svelte`)
- About dialog copyright ("Open WebUI Inc.")
- About dialog external links (GitHub, Twitter/X, Discord, docs URLs)
- Community references ("Open WebUI Community")
- Translation strings containing hardcoded branding text
- Logo and image files (favicon, splash screen, etc.)
- CSS or styling
- HTML structure
- Component layouts

### Git Status

Modified application source files:
- `src/lib/constants.ts`
- `backend/open_webui/env.py`

Modified documentation:
- `docs/white-label-ui-inventory.md`

No Docker, deployment, LiteLLM, authentication, database, or production configuration was modified.


## Task 02 Implementation Status — Complete

**Task identifier:** Task 02
**Status:** Complete

### Modified Source Files

| File | Change |
|------|--------|
| `src/lib/constants.ts` | Added `export const BEZIA_VERSION = '0.0.1';` next to `APP_NAME` |
| `src/lib/components/chat/Settings/General.svelte` | Removed translation-help message and link (lines 195–209) |
| `src/lib/components/chat/Settings/About.svelte` | Simplified to display only `${WEBUI_NAME} Version` and `BEZIA_VERSION` |

### Changes Detail

#### BEZIA_VERSION Constant (`src/lib/constants.ts`)
Added a dedicated, independently configurable version constant:
```ts
export const BEZIA_VERSION = '0.0.1';
```

This constant is separate from the upstream Open WebUI technical versioning (`WEBUI_VERSION`, `WEBUI_BUILD_CHANNEL`, etc.), which remains unchanged.

#### General Settings Simplification (`src/lib/components/chat/Settings/General.svelte`)
Removed the translation-help message block:
- Removed the `Couldn't find your language?` message
- Removed the link to `https://github.com/open-webui/open-webui/blob/main/docs/CONTRIBUTING.md#-translations-and-internationalization`
- The Language selector and all other General Settings options remain fully functional

#### About Page Simplification (`src/lib/components/chat/Settings/About.svelte`)
Simplified to display only:
- **About** (page title)
- **Bezia Version** (section title using `$WEBUI_NAME`)
- **0.0.1** (version value from `BEZIA_VERSION`)

Removed content:
- Version/build information (`v0.13.4 (unknown build)`)
- Update check functionality (`See what's new`, version check links/buttons)
- Community section (Discord, X/Twitter, GitHub links)
- Credits and attribution (Twemoji, Copyright, Open WebUI Inc., All rights reserved, Tim J. Baek)

The About tab and navigation remain functional.

### Preserved Architecture
- Upstream technical versioning remains unchanged (`WEBUI_VERSION`, `WEBUI_BUILD_CHANNEL`, etc.)
- Backend version API responses remain unchanged
- i18n translation files remain unchanged
- All LICENSE files and third-party notices remain unchanged

### Git Status

Modified application source files:
- `src/lib/constants.ts`
- `src/lib/components/chat/Settings/General.svelte`
- `src/lib/components/chat/Settings/About.svelte`

Modified documentation:
- `docs/white-label-ui-inventory.md`

No Docker, deployment, LiteLLM, authentication, database, or production configuration was modified.

## Task 03 Implementation Status — Complete

**Task identifier:** Task 03
**Status:** Complete

### Change Summary

Removed the word "WebUI" from the General Settings section heading:
- `WebUI Settings` → `Settings`

### Modified Files

| File | Change |
|------|--------|
| `src/lib/i18n/locales/en-US/translation.json` | `"settings.personal.general.sections.webuiSettings.title": "WebUI Settings"` → `"Settings"` |
| `src/lib/i18n/locales/dg-DG/translation.json` | `"settings.personal.general.sections.webuiSettings.title": "Many WebUI Settings"` → `"Many Settings"` |

### Scope Preserved

Only the section heading text was changed. No other headings, labels, descriptions, translations, or UI text were modified. No backend code, API behavior, authentication, database logic, configuration, or Docker files were changed.
