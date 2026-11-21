# White Label Assets Inventory

**Project:** Bezia (White Label fork of Open WebUI)
**Baseline Version:** v0.13.4
**Development Branch:** whitelabel/v0.13.4
**Document Status:** Investigation complete — no source code or assets modified

---

## 1. Overview

This document is a comprehensive technical inventory of all visual assets in the Open WebUI codebase that are candidates for white-label customization as part of the Bezia rebranding effort.

The purpose is to provide a technically accurate catalog so that replacement assets can be prepared with compatible specifications in a future task. No image files, SVGs, source code, or configuration files were modified during this investigation.

### Scope

**IN SCOPE** — Branding-related visual assets that identify Open WebUI:
- Application logos (main, sidebar, header, compact variants)
- Browser and application identity assets (favicon, Apple Touch Icon, PWA icons, manifest icons)
- Authentication and loading screen assets (login/signup branding, splash screen)
- Main application interface branding (chat interface, sidebar, empty states, welcome screens, About section)
- Background images, social preview images, Open Graph images
- Email-related branding assets (if present)

**OUT OF SCOPE** — Non-branding visual assets:
- Emoji SVG files (under `static/assets/emojis/`) — these are standard Unicode emoji, not product branding
- Font files (Inter, Vazirmatn) — these are typography, not branding assets
- User-generated content (profile images, uploaded files)
- Generic UI illustrations (file type icons, spinners, placeholder graphics)
- Third-party assets (OAuth provider logos like Google, Microsoft, GitHub — these are provider branding)
- Video assets (welcome.mp4, welcome.webp) — already addressed as non-image branding
- Audio assets (greeting.mp3)

---

## 2. Asset Inventory

### 2.1 Logos

| ID | Category | File Path | Filename | Format | Dimensions | Aspect Ratio | File Size | Transparency | Light/Dark Variants | Used Directly or Processed |
|----|----------|-----------|----------|--------|------------|--------------|-----------|--------------|---------------------|---------------------------|
| LG-001 | PWA manifest icon (backend-generated only) | `static/static/logo.png` | logo.png | PNG | 500×500 | 1:1 | 29,390 bytes | Yes (RGBA) | No | Processed via backend manifest at `/api/config` |
| LG-002 | Sidebar header image (visible UI logo) | `static/static/favicon.png` | favicon.png | PNG | 512×512 | 1:1 | 21,666 bytes | Yes (RGBA) | No | Directly in Sidebar.svelte at `size-5` (20px), circular |
| LG-003 | Sidebar header image (mobile view) | `static/static/favicon.png` | favicon.png | PNG | 512×512 | 1:1 | 21,666 bytes | Yes (RGBA) | No | Directly in Sidebar.svelte at `size-5` (20px), circular |
| LG-004 | Splash screen (light mode) | `static/static/splash.png` | splash.png | PNG | 500×500 | 1:1 | 5,239 bytes | Yes (RGBA) | Light mode only | Directly in src/app.html |
| LG-005 | Splash screen (dark mode) | `static/static/splash-dark.png` | splash-dark.png | PNG | 500×500 | 1:1 | 5,419 bytes | Yes (RGBA) | Dark mode only | Directly in src/app.html |

### 2.2 Browser and Application Icons

| ID | Category | File Path | Filename | Format | Dimensions | Aspect Ratio | File Size | Transparency | Light/Dark Variants | Used Directly or Processed |
|----|----------|-----------|----------|--------|------------|--------------|-----------|--------------|---------------------|---------------------------|
| IC-001 | Favicon (primary) | `static/static/favicon.png` | favicon.png | PNG | 512×512 | 1:1 | 21,666 bytes | Yes (RGBA) | No | Directly (link rel="icon") |
| IC-002 | Favicon (96×96) | `static/static/favicon-96x96.png` | favicon-96x96.png | PNG | 96×96 | 1:1 | 3,310 bytes | Yes (RGBA) | No | Directly (link rel="icon" sizes="96x96") |
| IC-003 | Favicon (SVG) | `static/static/favicon.svg` | favicon.svg | SVG | 500×500 (viewBox) | 1:1 | 29,094 bytes | Yes (embedded PNG) | No | Directly (link rel="icon" type="image/svg+xml") |
| IC-004 | Favicon (ICO fallback) | `static/static/favicon.ico` | favicon.ico | ICO | 32×32 | 1:1 | 1,075 bytes | Yes (RGBA) | No | Directly (link rel="shortcut icon") |
| IC-005 | Apple Touch Icon | `static/static/apple-touch-icon.png` | apple-touch-icon.png | PNG | 180×180 | 1:1 | 6,942 bytes | Yes (RGBA) | No | Directly (link rel="apple-touch-icon" sizes="180x180") |
| IC-006 | PWA Manifest Icon (192) | `static/static/web-app-manifest-192x192.png` | web-app-manifest-192x192.png | PNG | 192×192 | 1:1 | 7,443 bytes | Yes (RGBA) | No | Via backend `/manifest.json` route |
| IC-007 | PWA Manifest Icon (512) | `static/static/web-app-manifest-512x512.png` | web-app-manifest-512x512.png | PNG | 512×512 | 1:1 | 22,194 bytes | Yes (RGBA) | No | Via backend `/manifest.json` route |
| IC-008 | Duplicate favicon (root static) | `static/favicon.png` | favicon.png | PNG | 512×512 | 1:1 | 21,666 bytes | Yes (RGBA) | No | Referenced in some frontend code as `/favicon.png` |
| IC-009 | Duplicate user image (root static) | `static/user.png` | user.png | PNG | 400×400 | 1:1 | 7,858 bytes | Yes (RGBA) | No | Served as default user profile image |

### 2.3 Authentication and Loading Screens

| ID | Category | File Path | Filename | Format | Dimensions | Aspect Ratio | File Size | Transparency | Light/Dark Variants | Used Directly or Processed |
|----|----------|-----------|----------|--------|------------|--------------|-----------|--------------|---------------------|---------------------------|
| AS-001 | Splash screen logo (light) | `static/static/splash.png` | splash.png | PNG | 500×500 | 1:1 | 5,239 bytes | Yes (RGBA) | Light mode | Preloaded and displayed on splash screen |
| AS-002 | Splash screen logo (dark) | `static/static/splash-dark.png` | splash-dark.png | PNG | 500×500 | 1:1 | 5,419 bytes | Yes (RGBA) | Dark mode | Preloaded and displayed on splash screen |
| AS-003 | Login page logo | `static/static/favicon.png` | favicon.png | PNG | 512×512 | 1:1 | 21,666 bytes | Yes (RGBA) | No | Displayed on auth page (top-right or center) |
| AS-004 | Onboarding screen logo | `static/static/favicon.png` | favicon.png | PNG | 512×512 | 1:1 | 21,666 bytes | Yes (RGBA) | No | Displayed on onboarding welcome screen |

### 2.4 Main Application Interface

| ID | Category | File Path | Filename | Format | Dimensions | Aspect Ratio | File Size | Transparency | Light/Dark Variants | Used Directly or Processed |
|----|----------|-----------|----------|--------|------------|--------------|-----------|--------------|---------------------|---------------------------|
| AI-001 | Fallback model/profile image | `static/static/favicon.png` | favicon.png | PNG | 512×512 | 1:1 | 21,666 bytes | Yes (RGBA) | No | Used as fallback when no profile image is set |
| AI-002 | Default user profile image | `static/static/user.png` | user.png | PNG | 400×400 | 1:1 | 7,858 bytes | Yes (RGBA) | No | Generic default avatar — not a branding asset |
| AI-003 | Image placeholder | `static/image-placeholder.png` | image-placeholder.png | PNG | 1024×1024 | 1:1 | 92,991 bytes | Yes (Palette) | No | Generic placeholder for missing images |

### 2.5 Other Branding Assets

| ID | Category | File Path | Filename | Format | Dimensions | Aspect Ratio | File Size | Transparency | Light/Dark Variants | Used Directly or Processed |
|----|----------|-----------|----------|--------|------------|--------------|-----------|--------------|---------------------|---------------------------|
| OA-001 | Repository banner (GitHub) | `banner.png` | banner.png | PNG | 2000×200 | 10:1 | 213,965 bytes | Yes (RGBA) | No | Not referenced in application code; repository-level only |
| OA-002 | PWA Web App Manifest (static file) | `static/static/site.webmanifest` | site.webmanifest | JSON | N/A | N/A | 450 bytes | N/A | No | Not referenced by application code (see Section 5) |
| OA-003 | OpenSearch description | `static/opensearch.xml` | opensearch.xml | XML | N/A | N/A | 667 bytes | N/A | No | Served at /opensearch.xml endpoint |
| OA-004 | Favicon (root-level duplicate) | `static/favicon.png` | favicon.png | PNG | 512×512 | 1:1 | 21,666 bytes | Yes (RGBA) | No | Some frontend code references `/favicon.png` (root path) |

---

## 3. Asset Usage Mapping

### 3.1 Detailed Usage by Asset

#### LG-001: `static/static/logo.png`

| Usage Location | Component/File | Reference | Purpose | Display Method | Constraints |
|----------------|----------------|-----------|---------|----------------|-------------|
| Backend PWA manifest | `backend/open_webui/main.py` (lines ~3061, ~3067) | `'src': '/static/logo.png'` | PWA install icon (purpose: "any" and "maskable") | Served as manifest icon via `/api/config` | 500×500 PNG, purpose="any" and purpose="maskable" |

**Verified fact:** `logo.png` is NOT used as a visible UI logo anywhere in the frontend. It appears only in the backend-generated PWA manifest. The actual visible application logo displayed in the sidebar header, login page, and onboarding screen is `favicon.png`.

#### LG-002 / LG-003: `static/static/favicon.png` — Sidebar Header Logo

| Usage Location | Component/File | Reference | Purpose | Display Method | Constraints |
|----------------|----------------|-----------|---------|----------------|-------------|
| Sidebar header (desktop) | `src/lib/components/layout/Sidebar.svelte` (line ~1232) | `src="{WEBUI_BASE_URL}/static/favicon.png"` | Sidebar logo image | `` class `sidebar-new-chat-icon size-5 rounded-full` | `size-5` = 20px, `rounded-full` = circular |
| Sidebar header (mobile button) | `src/lib/components/layout/Sidebar.svelte` (line ~1419) | `src="{WEBUI_BASE_URL}/static/favicon.png"` | Sidebar logo image | `` class `sidebar-new-chat-icon size-5 rounded-full` | `size-5` = 20px, `rounded-full` = circular |

**LICENSE notice in source** (lines ~1222-1225): "LICENSE covers this Open WebUI sidebar logo. Do not alter, remove, obscure, or replace it except as LICENSE permits."

#### LG-004 / LG-005: `static/static/splash.png` and `static/static/splash-dark.png`

| Usage Location | Component/File | Reference | Purpose | Display Method | Constraints |
|----------------|----------------|-----------|---------|----------------|-------------|
| Splash screen (light) | `src/app.html` (lines 88-96, 122, 175) | `/static/splash.png` | Preloaded and displayed on app splash screen | `` with style `width: auto; height: 6rem` (JS-created) and `width: auto; height: 13rem` (HTML) | Height constrained to 6rem (JS) / 13rem (HTML); width auto |
| Splash screen (dark) | `src/app.html` (lines 88-96, 122) | `/static/splash-dark.png` | Preloaded and displayed on app splash screen (dark theme) | `` with style `width: auto; height: 6rem` | Height constrained to 6rem; width auto |
| Splash screen (HER theme) | `src/app.html` (line 175) | `/static/splash.png` | Displayed for HER theme with CSS filter invert(1) | `` id="logo-her" with `width: auto; height: 13rem` | Height 13rem; filter: invert(1) applied via CSS |

#### IC-001: `static/static/favicon.png`

| Usage Location | Component/File | Reference | Purpose | Display Method | Constraints |
|----------------|----------------|-----------|---------|----------------|-------------|
| Browser favicon | `src/app.html` (line 9) | `/static/favicon.png` | Browser tab icon | `<link rel="icon" type="image/png" href="/static/favicon.png">` | 512×512 PNG |
| Login page logo | `src/routes/auth/+page.svelte` (line 463) | `{WEBUI_BASE_URL}/static/favicon.png` | Login page branding logo | `` with class `w-6 rounded-full` | Size 6 (24px), circular |
| Onboarding logo | `src/lib/components/OnBoarding.svelte` (line 50) | `/static/favicon.png` | Onboarding screen logo | `` with class `size-6 rounded-full` | Size 6 (24px), circular |
| Fallback model image | `src/lib/components/workspace/Models/CreateModel.svelte` | `${WEBUI_BASE_URL}/static/favicon.png` | Fallback when no profile image | Direct image src | No explicit constraints |
| Fallback model image | `src/lib/components/workspace/Models/ModelEditor.svelte` | `${WEBUI_BASE_URL}/static/favicon.png` | Fallback when no profile image | Direct image src | No explicit constraints |
| Fallback model image | `src/lib/components/workspace/Models.svelte` (line ~790) | `/favicon.png` | Error fallback (onError) | `e.target.src = '/favicon.png'` | No explicit constraints |
| Fallback user image | `src/lib/components/common/ChatParticipants.svelte` (lines 44-45) | `${WEBUI_BASE_URL}/static/favicon.png` | Fallback when image load fails | `image.src = .../static/favicon.png` | No explicit constraints |
| Fallback user image | `src/lib/components/chat/Messages/ProfileImage.svelte` (line 9) | `${WEBUI_BASE_URL}/static/favicon.png` | Default profile image | Constant FALLBACK_SRC | No explicit constraints |
| Fallback at-mention image | `src/lib/components/chat/MessageInput/Commands/AtCommands.svelte` (line 372) | `/favicon.png` | Error fallback | `e.currentTarget.src = '/favicon.png'` | No explicit constraints |
| Fallback model selector | `src/lib/components/chat/ModelSelector/ModelItem.svelte` (line 116) | `/favicon.png` | Error fallback | `e.currentTarget.src = '/favicon.png'` | No explicit constraints |
| Fallback channel webhook | `src/lib/components/channel/WebhookItem.svelte` (lines 102, 142) | `${WEBUI_BASE_URL}/static/favicon.png` | Fallback when no imageSrc | `src={imageSrc || .../static/favicon.png}` | No explicit constraints |
| Fallback citations | `src/lib/components/chat/Messages/Citations.svelte` (line 195) | `/favicon.png` | Error fallback | `e.target.src = '/favicon.png'` | No explicit constraints |
| Fallback user message | `src/lib/components/chat/Messages/UserMessage.svelte` (line 180) | `${WEBUI_BASE_URL}/static/favicon.png` | Fallback when no image | Ternary fallback | No explicit constraints |
| Fallback channel messages | `src/lib/components/channel/Messages/Message.svelte` (lines 427, 488) | `/favicon.png` | Error fallback | `e.currentTarget.src = '/favicon.png'` | No explicit constraints |
| Fallback mention list | `src/lib/components/channel/MessageInput/MentionList.svelte` (lines 268, 280) | `/favicon.png` | Error fallback | `e.currentTarget.src = '/favicon.png'` | No explicit constraints |
| Fallback admin analytics | `src/lib/components/admin/Analytics/Dashboard.svelte` (line 734) | `/favicon.png` | Error fallback | `if (!image.src.endsWith('/favicon.png')) image.src = '/favicon.png'` | No explicit constraints |
| Fallback admin models | `src/lib/components/admin/Settings/Models.svelte` (line 1051) | `/favicon.png` | Error fallback | `e.target.src = '/favicon.png'` | No explicit constraints |
| Fallback chat placeholder | `src/lib/components/chat/ChatPlaceholder.svelte` (line 98) | `/favicon.png` | Error fallback | `e.currentTarget.src = '/favicon.png'` | No explicit constraints |
| Fallback placeholder | `src/lib/components/chat/Placeholder.svelte` (line 271) | `/favicon.png` | Error fallback | `e.currentTarget.src = '/favicon.png'` | No explicit constraints |
| Backend model router | `backend/open_webui/routers/models.py` (lines 1027, 1031, 1057, 1061) | `/static/favicon.png` | Default model profile image | `url='/static/favicon.png'` | Served as FileResponse |
| Backend channels router | `backend/open_webui/routers/channels.py` (lines 2071-2075, 2111-2115) | `{STATIC_DIR}/favicon.png` | Default webhook/user image | `FileResponse(f'{STATIC_DIR}/favicon.png')` | Served as file |
| Backend users router | `backend/open_webui/routers/users.py` (lines 855, 867) | `{STATIC_DIR}/user.png` | Default user profile image | `FileResponse(f'{STATIC_DIR}/user.png')` | Served as file |

#### IC-002: `static/static/favicon-96x96.png`

| Usage Location | Component/File | Reference | Purpose | Display Method | Constraints |
|----------------|----------------|-----------|---------|----------------|-------------|
| Browser favicon | `src/app.html` (lines 10-16) | `/static/favicon-96x96.png` | Browser tab icon (96×96) | `<link rel="icon" type="image/png" href="/static/favicon-96x96.png" sizes="96x96">` | 96×96 PNG |

#### IC-003: `static/static/favicon.svg`

| Usage Location | Component/File | Reference | Purpose | Display Method | Constraints |
|----------------|----------------|-----------|---------|----------------|-------------|
| Browser favicon | `src/app.html` (lines 17-22) | `/static/favicon.svg` | Browser tab icon (SVG) | `<link rel="icon" type="image/svg+xml" href="/static/favicon.svg">` | SVG with embedded PNG data URI |

#### IC-004: `static/static/favicon.ico`

| Usage Location | Component/File | Reference | Purpose | Display Method | Constraints |
|----------------|----------------|-----------|---------|----------------|-------------|
| Browser favicon | `src/app.html` (line 23) | `/static/favicon.ico` | Legacy browser favicon | `<link rel="shortcut icon" href="/static/favicon.ico">` | 32×32 ICO |

#### IC-005: `static/static/apple-touch-icon.png`

| Usage Location | Component/File | Reference | Purpose | Display Method | Constraints |
|----------------|----------------|-----------|---------|----------------|-------------|
| Apple touch icon | `src/app.html` (lines 24-29) | `/static/apple-touch-icon.png` | Apple device touch icon | `<link rel="apple-touch-icon" sizes="180x180" href="/static/apple-touch-icon.png">` | 180×180 PNG |

#### IC-006 / IC-007: PWA Manifest Icons

| Usage Location | Component/File | Reference | Purpose | Display Method | Constraints |
|----------------|----------------|-----------|---------|----------------|-------------|
| PWA manifest | `static/static/site.webmanifest` (lines 6-16) | `/static/web-app-manifest-192x192.png`, `/static/web-app-manifest-512x512.png` | PWA install icons | Manifest JSON with purpose="maskable" | 192×192 and 512×512 PNG, purpose="maskable" |
| PWA manifest (backend) | `backend/open_webui/main.py` (lines ~3050-3070) | `/static/logo.png` (purpose: "any" and "maskable") | Backend-generated PWA manifest | Dynamic manifest at /api/v1/config | Uses logo.png (500×500) |

#### IC-008: `static/favicon.png` (root-level duplicate)

| Usage Location | Component/File | Reference | Purpose | Display Method | Constraints |
|----------------|----------------|-----------|---------|----------------|-------------|
| Root path reference | Various frontend components | `/favicon.png` | Fallback when image errors occur | `e.target.src = '/favicon.png'` | Resolves to root /favicon.png which is same file as static/static/favicon.png |

#### IC-009: `static/static/user.png`

| Usage Location | Component/File | Reference | Purpose | Display Method | Constraints |
|----------------|----------------|-----------|---------|----------------|-------------|
| Default user profile | `backend/open_webui/routers/users.py` (lines 855, 867) | `{STATIC_DIR}/user.png` | Default user profile image | `FileResponse(f'{STATIC_DIR}/user.png')` | Served as file, no display constraints in frontend |

### 3.2 SVG Technical Details: `static/static/favicon.svg`

| Property | Value |
|----------|-------|
| Format | SVG |
| ViewBox | `0 0 500 500` |
| Explicit width | 500 |
| Explicit height | 500 |
| Dimensions type | Fixed (width and height attributes set to 500) |
| Colors | Contains embedded PNG image (base64 data URI) — no CSS/currentColor usage |
| Embedded raster | Yes — contains `` element with `xlink:href` pointing to base64-encoded PNG |
| File size | 29,094 bytes |

### 3.3 Duplicate Files Across Directories

Three directories contain asset files:
- `static/` — repository root
- `static/static/` — primary source directory
- `backend/open_webui/static/` — backend runtime directory

All files across all three directories are **byte-identical** (verified via md5sum):

| Asset | static/ | static/static/ | backend/open_webui/static/ | Identical? |
|-------|---------|----------------|----------------------------|------------|
| favicon.png | 23b815fa... | 23b815fa... | 23b815fa... | Yes |
| user.png | a8e92dd2... | a8e92dd2... | a8e92dd2... | Yes |
| logo.png | N/A | b1d202c5... | b1d202c5... | Yes |
| splash.png | N/A | 931a56a3... | 931a56a3... | Yes |
| splash-dark.png | N/A | cbce0a5d... | cbce0a5d... | Yes |

No build step copies these files (verified in `hatch_build.py` — only builds frontend via vite; no static file copying). All three directories are independently present in the repository.

**Replacement note:** When replacing an asset, all three copies must be updated to remain synchronized. Replacing only one copy will leave stale assets served from other paths. The canonical runtime source is `backend/open_webui/static/` (resolved via `STATIC_DIR`), but frontend code references `/static/` which maps to this directory.

---

## 4. Technical Specifications

### 4.1 Image Asset Specifications

| Asset | Path | Format | W×H | Ratio | Size | Mode/Color | Transparency | SVG ViewBox | SVG Width/Height | Fixed/Responsive | Hardcoded Colors | Embedded Raster |
|-------|------|--------|-----|-------|------|------------|--------------|-------------|------------------|------------------|------------------|-----------------|
| logo.png | `static/static/logo.png` | PNG | 500×500 | 1:1 | 29,390 | RGBA | Yes | N/A | N/A | N/A | N/A | No |
| splash.png | `static/static/splash.png` | PNG | 500×500 | 1:1 | 5,239 | RGBA | Yes | N/A | N/A | N/A | N/A | No |
| splash-dark.png | `static/static/splash-dark.png` | PNG | 500×500 | 1:1 | 5,419 | RGBA | Yes | N/A | N/A | N/A | N/A | No |
| favicon.png | `static/static/favicon.png` | PNG | 512×512 | 1:1 | 21,666 | RGBA | Yes | N/A | N/A | N/A | N/A | No |
| favicon-96x96.png | `static/static/favicon-96x96.png` | PNG | 96×96 | 1:1 | 3,310 | RGBA | Yes | N/A | N/A | N/A | N/A | No |
| favicon.svg | `static/static/favicon.svg` | SVG | 500×500 | 1:1 | 29,094 | N/A | Yes | 0 0 500 500 | 500 / 500 | Fixed | Yes (embedded PNG) | Yes |
| favicon.ico | `static/static/favicon.ico` | ICO | 32×32 | 1:1 | 1,075 | RGBA | Yes | N/A | N/A | N/A | N/A | No |
| apple-touch-icon.png | `static/static/apple-touch-icon.png` | PNG | 180×180 | 1:1 | 6,942 | RGBA | Yes | N/A | N/A | N/A | N/A | No |
| web-app-manifest-192x192.png | `static/static/web-app-manifest-192x192.png` | PNG | 192×192 | 1:1 | 7,443 | RGBA | Yes | N/A | N/A | N/A | N/A | No |
| web-app-manifest-512x512.png | `static/static/web-app-manifest-512x512.png` | PNG | 512×512 | 1:1 | 22,194 | RGBA | Yes | N/A | N/A | N/A | N/A | No |
| user.png | `static/static/user.png` | PNG | 400×400 | 1:1 | 7,858 | L (grayscale) | Yes | N/A | N/A | N/A | N/A | No |
| image-placeholder.png | `static/image-placeholder.png` | PNG | 1024×1024 | 1:1 | 92,991 | P (palette) | Yes | N/A | N/A | N/A | N/A | No |
| banner.png | `banner.png` | PNG | 2000×200 | 10:1 | 213,965 | RGBA | Yes | N/A | N/A | N/A | N/A | No |

### 4.2 Configuration File Specifications

| File | Path | Format | Purpose |
|------|------|--------|---------|
| PWA Web App Manifest | `static/static/site.webmanifest` | JSON | PWA install manifest, references 192×192 and 512×512 maskable icons |
| Backend PWA Manifest | `backend/open_webui/main.py` (lines ~3050-3070) | Python (dict) | Dynamic PWA manifest at /api/v1/config, uses logo.png |
| OpenSearch XML | `static/opensearch.xml` | XML | Browser search provider description, references favicon.png |
| Root manifest | `static/manifest.json` | JSON | Empty placeholder `{}` |

---

## 6. Replacement Risk Assessment

### 6.1 Risk Classification by Asset

| Asset ID | Path | Replacement Complexity | Visual Impact | Combined Risk |
|----------|------|----------------------|---------------|---------------|
| LG-001 | `static/static/logo.png` | Low | Low | Low |
| LG-002/LG-003 | `static/static/favicon.png` | High | High | High |
| LG-004 | `static/static/splash.png` | Medium | Medium | Medium |
| LG-005 | `static/static/splash-dark.png` | Medium | Medium | Medium |
| IC-001 | `static/static/favicon.png` | High | High | High |
| IC-002 | `static/static/favicon-96x96.png` | Low | Medium | Low |
| IC-003 | `static/static/favicon.svg` | Medium | Medium | Medium |
| IC-004 | `static/static/favicon.ico` | Low | Low | Low |
| IC-005 | `static/static/apple-touch-icon.png` | Low | Low | Low |
| IC-006/IC-007 | `static/static/web-app-manifest-*.png` | Low | Medium | Low |
| IC-008 | `static/favicon.png` | Low | High | Medium |
| IC-009 | `static/static/user.png` | Low | N/A | N/A |
| AI-002 | `static/static/user.png` | Low | N/A | N/A |
| OA-002 | `static/static/site.webmanifest` | Medium | Low | Low |
| OA-003 | `static/opensearch.xml` | Low | Low | Low |

### 6.2 Replacement Complexity Definitions

- **Low:** Direct file replacement with no code changes expected. Single reference point.
- **Medium:** Replacement requires special validation (e.g., SVG structure matching, CSS height constraints, multiple dependent assets).
- **High:** Code/configuration changes are likely required. Shared asset used across many parts of the application with display constraints (e.g., circular cropping at small sizes).

### 6.3 Visual Impact Definitions

- **Low:** Affects one limited UI location (e.g., PWA manifest icon only).
- **Medium:** Affects several locations (e.g., favicon sizes, PWA icons).
- **High:** Shared asset used across many parts of the application (e.g., favicon.png used in 20+ frontend components + backend).

### 6.4 Why favicon.png is High/High

`favicon.png` serves as:
1. **Browser favicon** (512×512, in app.html)
2. **Sidebar header logo** (20px circular in Sidebar.svelte)
3. **Login page logo** (24px circular)
4. **Onboarding screen logo** (24px circular)
5. **Fallback image** in 20+ frontend components when profile/model images fail to load
6. **Backend default** for model profile images and webhook images

The circular constraint (`rounded-full`) and small display sizes (20-24px) mean the replacement asset must work when cropped to a circle at small dimensions.

---

## 7. Assets Not Recommended for Replacement

| Asset | Path | Reason |
|-------|------|--------|
| image-placeholder.png | `static/image-placeholder.png` | Generic UI placeholder, not product branding |
| user.png | `static/static/user.png` | **Generic default avatar, not a branding asset.** Served when no user profile image is set. Replacing it is not necessary for white labeling and would change the default user experience rather than branding. |
| Emoji SVGs | `static/assets/emojis/*.svg` | Standard Unicode emoji, not product branding |
| Font files | `static/assets/fonts/*.ttf` | Typography assets, not branding |
| OAuth provider SVGs | Inline in `src/routes/auth/+page.svelte` | Third-party provider branding (Google, Microsoft, GitHub) |
| welcome.mp4 / welcome.webp | `static/assets/welcome.mp4`, `static/assets/welcome.webp` | Video assets for onboarding, not image branding |
| greeting.mp3 | `static/audio/greeting.mp3` | Audio asset, not visual branding |
| banner.png | `banner.png` | Repository-level GitHub banner, not referenced in application code |
| static/manifest.json | `static/manifest.json` | Empty placeholder `{}`; backend route overrides it |

---

## 8. Recommended Bezia Replacement Specifications

### 7.1 Recommended Specifications (Preserving Technical Contract)

| Asset ID | Path | Recommended Format | Recommended Dimensions | Recommended Aspect Ratio | Transparency | Variants | Notes |
|----------|------|-------------------|----------------------|------------------------|--------------|----------|-------|
| LG-001 | `static/static/logo.png` | PNG | 500×500 | 1:1 | Yes (RGBA) | 1 | Preserve original technical contract |
| LG-002/LG-003 | `static/static/favicon.png` | PNG | 512×512 | 1:1 | Yes (RGBA) | 1 | Must work as circular crop at 20-24px |
| LG-004 | `static/static/splash.png` | PNG | 500×500 | 1:1 | Yes (RGBA) | 1 (light) | Height constrained to 6rem (JS) / 13rem (HTML) |
| LG-005 | `static/static/splash-dark.png` | PNG | 500×500 | 1:1 | Yes (RGBA) | 1 (dark) | Height constrained to 6rem |
| IC-002 | `static/static/favicon-96x96.png` | PNG | 96×96 | 1:1 | Yes (RGBA) | 1 | Preserve 96×96 |
| IC-003 | `static/static/favicon.svg` | SVG | 500×500 (viewBox) | 1:1 | Yes | 1 | Must preserve viewBox="0 0 500 500" and width/height="500" |
| IC-004 | `static/static/favicon.ico` | ICO | 32×32 | 1:1 | Yes | 1 | Legacy fallback |
| IC-005 | `static/static/apple-touch-icon.png` | PNG | 180×180 | 1:1 | Yes (RGBA) | 1 | Preserve 180×180 |
| IC-006/IC-007 | `static/static/web-app-manifest-*.png` | PNG | 192×192 / 512×512 | 1:1 | Yes (RGBA) | 2 (maskable) | Must work as maskable icons |
| OA-002 | `static/static/site.webmanifest` | JSON | N/A | N/A | N/A | 1 | Update icon paths if filenames change |

### 8.2 Assets Where Different Size/Format Is Preferable

None identified — all branding assets should preserve their original technical contract to avoid code changes.

### 8.3 Code Changes Required for Non-Standard Recommendations

If any non-standard size or format is desired:
- **SVG favicon (IC-003):** Would require updating `src/app.html` link element and potentially the SVG structure
- **PWA manifest icons (IC-006/IC-007):** Would require updating `static/static/site.webmanifest` and backend manifest in `backend/open_webui/main.py`
- **Different splash dimensions:** Would require CSS/style updates in `src/app.html` for height constraints

---

## 9. Missing Information or Items Requiring Manual Verification

1. **LICENSE restriction on sidebar logo:** The Sidebar.svelte source contains comments stating "LICENSE covers this Open WebUI sidebar logo. Do not alter, remove, obscure, or replace it except as LICENSE permits: https://docs.openwebui.com/license." This needs legal review before replacing favicon.png as used in the sidebar.

2. **PWA manifest dual sources:** Verified — the active manifest is the backend-generated `/manifest.json` route (`backend/open_webui/main.py` line 3029). The static file `static/static/site.webmanifest` exists but is **not referenced** anywhere in the application code (verified via grep). The empty `static/manifest.json` placeholder is overridden by the backend route.

3. **`static/` vs `static/static/` vs `backend/open_webui/static/`:** Verified — all three directories contain **byte-identical** files (confirmed via md5sum). `STATIC_DIR` resolves to `backend/open_webui/static/`. No build step copies files between directories; all three are independently present in the repository.

4. **favicon.ico detailed structure:** The ICO file may contain multiple resolutions (16×16, 32×32, etc.). Could not verify internal structure without additional tools.

5. **favicon.svg embedded PNG:** The SVG contains a base64-embedded PNG. The embedded PNG dimensions and properties could not be separately verified.

6. **Color profile:** No color profile information (ICC, sRGB, etc.) could be determined from file inspection alone.

7. **HER theme splash handling:** The `splash.png` is used for HER theme with CSS `filter: invert(1)`. Need to verify if a separate dark-optimized asset is needed for HER theme or if `splash-dark.png` suffices.

8. **site.webmanifest purpose:** The static `site.webmanifest` file exists but is not referenced by any code. It may be intended for manual deployment or may be legacy.

---

## 10. Recommended Replacement Order

| Priority | Asset ID | Path | Reason |
|----------|----------|------|--------|
| 1 | LG-002/LG-003 | `static/static/favicon.png` | Actual visible UI logo (sidebar header, login, onboarding) — High Visual Impact |
| 2 | LG-001 | `static/static/logo.png` | Backend PWA manifest icon — only used in manifest |
| 3 | LG-004/LG-005 | `static/static/splash.png`, `static/static/splash-dark.png` | Splash screens, high visibility on app load |
| 4 | IC-005 | `static/static/apple-touch-icon.png` | Apple device branding |
| 5 | IC-003 | `static/static/favicon.svg` | SVG favicon, requires SVG structure preservation |
| 6 | IC-002 | `static/static/favicon-96x96.png` | Secondary favicon size |
| 7 | IC-004 | `static/static/favicon.ico` | Legacy fallback |
| 8 | IC-006/IC-007 | `static/static/web-app-manifest-*.png` | PWA manifest icons |
| 9 | OA-002 | `static/static/site.webmanifest` | Update only if icon filenames change |
| 10 | OA-003 | `static/opensearch.xml` | Update only if favicon path changes |

---

## 11. Verification Results

### 10.1 Path Verification

All identified asset paths were verified to exist:

| Asset | Path | Exists |
|-------|------|--------|
| logo.png | `static/static/logo.png` | Yes |
| splash.png | `static/static/splash.png` | Yes |
| splash-dark.png | `static/static/splash-dark.png` | Yes |
| favicon.png | `static/static/favicon.png` | Yes |
| favicon.png (root) | `static/favicon.png` | Yes |
| favicon-96x96.png | `static/static/favicon-96x96.png` | Yes |
| favicon.svg | `static/static/favicon.svg` | Yes |
| favicon.ico | `static/static/favicon.ico` | Yes |
| apple-touch-icon.png | `static/static/apple-touch-icon.png` | Yes |
| web-app-manifest-192x192.png | `static/static/web-app-manifest-192x192.png` | Yes |
| web-app-manifest-512x512.png | `static/static/web-app-manifest-512x512.png` | Yes |
| user.png | `static/static/user.png` | Yes |
| user.png (root) | `static/user.png` | Yes |
| image-placeholder.png | `static/image-placeholder.png` | Yes |
| banner.png | `banner.png` | Yes |
| site.webmanifest | `static/static/site.webmanifest` | Yes |
| opensearch.xml | `static/opensearch.xml` | Yes |
| manifest.json | `static/manifest.json` | Yes |

### 10.2 Dimensions and Formats Verified

All image dimensions and formats were verified using PIL (Python Imaging Library). See Section 4.1 for complete specifications.

### 10.3 Source References Verified

All source code references were verified using grep across `.svelte`, `.py`, `.html` files. Key corrected findings:

- **`logo.png` is NOT used as a visible UI logo.** It appears only in the backend PWA manifest (`backend/open_webui/main.py` lines ~3061, ~3067).
- **The actual visible UI logo is `favicon.png`**, used in:
  - Sidebar header (`Sidebar.svelte` lines ~1232, ~1419) at 20px circular
  - Login page (`src/routes/auth/+page.svelte` line 463) at 24px circular
  - Onboarding screen (`OnBoarding.svelte` line 50) at 24px circular
  - Browser favicon (`src/app.html` line 9)
  - 20+ fallback locations throughout frontend components
  - Backend model and channels routers

### 10.4 Duplicate Files Identified

| Asset | Locations | Identical? |
|-------|-----------|------------|
| favicon.png | `static/static/favicon.png`, `static/favicon.png`, `backend/open_webui/static/favicon.png` | Yes (21,666 bytes each) |
| user.png | `static/static/user.png`, `static/user.png`, `backend/open_webui/static/user.png` | Yes (7,858 bytes each) |
| logo.png | `static/static/logo.png`, `backend/open_webui/static/logo.png` | Yes (29,390 bytes each) |
| splash.png | `static/static/splash.png`, `backend/open_webui/static/splash.png` | Yes (5,239 bytes each) |
| splash-dark.png | `static/static/splash-dark.png`, `backend/open_webui/static/splash-dark.png` | Yes (5,419 bytes each) |

### 10.5 Git Status

```
git diff --check: No whitespace errors detected
git status --short: Only docs/white-label-assets-inventory.md is new (untracked)
```

No existing source code or asset files were modified during this investigation.

---

## Summary

- **Total relevant assets identified:** 14 branding assets (plus 4 configuration files)
- **Corrected key finding:** `logo.png` is NOT the main UI logo. The actual visible application logo throughout the UI is `favicon.png`, used in the sidebar header, login page, onboarding screen, browser favicon, and 20+ fallback locations.
- **Corrected key finding:** `user.png` is a generic default avatar, not a branding asset — should NOT be replaced as part of white labeling.
- **Corrected key finding:** `static/static/site.webmanifest` is NOT referenced by any code; the backend-generated `/manifest.json` route is the active manifest.
- **Corrected key finding:** All three asset directories (`static/`, `static/static/`, `backend/open_webui/static/`) contain byte-identical files; no build step synchronizes them.
- **Most important assets to replace first:** favicon.png (UI logo), logo.png (PWA manifest), splash.png/splash-dark.png (splash screens)
- **Assets replaceable directly (Low Complexity):** logo.png, favicon-96x96.png, favicon.ico, apple-touch-icon.png, web-app-manifest-192x192.png, web-app-manifest-512x512.png
- **Assets requiring verification (Medium Complexity):** splash.png, splash-dark.png, favicon.svg
- **Assets requiring code changes if modified (High Complexity):** favicon.png (used in 20+ locations with circular display constraints)
- **Generated inventory document:** `docs/white-label-assets-inventory.md`
- **Confirmation:** No existing source code or asset was modified during this investigation.
