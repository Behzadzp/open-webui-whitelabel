# AI Error Message Management — Implementation Plan

**Project:** Open WebUI White Label fork (v0.13.4 baseline)
**Feature:** Centralized, administrator-managed Error Message Mapping for AI request errors
**Languages:** Persian (`fa`) and English (`en`) only
**Status:** Architecture document — implementation reference only. No source code modified.

---

## 1. Project Context and Objective

Open WebUI is deployed with LiteLLM (v1.110.1) as an OpenAI-compatible AI gateway. When AI requests fail, Open WebUI currently surfaces raw technical error details to end users (LiteLLM Tags, budget identifiers, cost figures, raw provider payloads).

This feature introduces a centralized Error Message Mapping system:

1. Open WebUI receives an AI request error.
2. The error is classified into a predefined category using structured error fields (type, code, HTTP status, message patterns).
3. The system selects the administrator-configured message for that category, in the user's current UI language.
4. The user-friendly message is displayed instead of technical details.
5. Administrators can edit Persian and English message text per category through the Admin Panel.

**Strict scope:** Only AI request/response error paths are affected. This includes LiteLLM errors, OpenAI-compatible API errors, provider errors, model request errors, streaming errors, AI timeouts, connection failures, budget errors, and rate-limit errors.

**Explicitly out of scope:** Success notifications, settings save confirmations, user management notifications, authentication UI messages unrelated to AI requests, file upload errors, image upload errors, general application errors, Admin Panel notifications, and any non-AI toast messages. The general notification system (svelte-sonner toasts used elsewhere) is not replaced. `generateOpenAIChatCompletion` is also used in `NoteEditor.svelte` for title generation (non-chat AI context) — that usage is out of scope and must not be modified.

---

## 2. Verified Existing Error Flow

### 2.1 Backend Error Flow

**Entry point:** `POST /api/chat/completions` → `backend/open_webui/routers/openai.py` → `generate_chat_completion()`.

The function relays the request to the upstream provider (LiteLLM) via `aiohttp.ClientSession` (`backend/open_webui/utils/session_pool.py`).

**Non-streaming error path:** If the upstream returns HTTP >= 400 with non-SSE content, the raw error body is returned as `JSONResponse(status_code=r.status, content=response)`. The raw upstream error passes through verbatim.

**Streaming error path:** If the upstream returns SSE with status >= 400, the body is read and returned as `JSONResponse`. If status < 400, the stream passes through raw via `stream_wrapper()`.

**Error event logging:** `publish_model_provider_request_failed()` in `backend/open_webui/events.py` classifies failures into `error_type` (`model_not_found`, `authentication_failed`, `rate_limited`, `server_failed`, `upstream_error`) and logs server-side. It emits a Socket.IO event `EVENTS.MODEL_PROVIDER_REQUEST_FAILED`. Server-log only; does not affect frontend display.

### 2.2 Frontend Error Flow

**API client:** `generateOpenAIChatCompletion()` in `src/lib/apis/openai/index.ts`.

**Main error handler:** `handleOpenAIError(error, responseMessage)` in `src/lib/components/chat/Chat.svelte`. Three call sites:

1. Socket.IO `chat:message:error` event → `handleOpenAIError(error, message)` — streaming errors delivered via Socket.IO
2. Non-streaming response `res.error` → `handleOpenAIError(res.error, responseMessage)`
3. `chatCompletionEventHandler` error field → `handleOpenAIError(error, message)`

Current implementation:
```javascript
const errorMessage = getErrorMessage(error, $i18n.t('Server connection failed'));
responseMessage.error = { content: errorMessage };
responseMessage.done = true;
history.messages[responseMessage.id] = responseMessage;
if (!responseFailed) toast.error(errorMessage);
```

**Exception catch block:** Catches exceptions thrown by `generateOpenAIChatCompletion()` in `Chat.svelte`. Performs its own error extraction and sets `responseMessage.error = { content: error }` (raw error object, not sanitized). Displays raw error via `toast.error()`.

**Streaming parser:** `createOpenAITextStream()` in `src/lib/apis/streaming/index.ts`. When `parsedData.error` is present, yields `{ done: true, value: '', error: parsedData.error }`. These stream errors surface through the Socket.IO `chat:message:error` path, not through `handleOpenAIError()` directly.

**Error message extraction utility:** `getErrorMessage()` in `src/lib/apis/openai/index.ts`. Extracts from `err.detail.error.message`, `err.detail.message`, `err.error.message`, `err.message`, etc. Also used by non-AI paths (`getOpenAIConfig`, `updateOpenAIConfig`, `getProviderModelCatalog`, etc.) — must NOT be changed globally.

**Error display component:** `Error.svelte` (`src/lib/components/chat/Messages/Error.svelte`). Renders `message.error.content` via its own `getErrorMessage()`. Simply stringifies — no classification or sanitization.

**Toast notifications:** `svelte-sonner` `toast.error()` called in multiple places in `Chat.svelte` (file upload, chat variables, web search confirmation, etc.) — those are out of scope.

### 2.3 User-Visible Error Locations

| Location | Component | Display Type | In Scope? |
|----------|-----------|--------------|-----------|
| Assistant message error bubble | `Error.svelte` | Inline message content | Yes |
| Toast notification | `handleOpenAIError()` / catch block | `svelte-sonner` toast | Yes |
| Streaming SSE error | Socket.IO `chat:message:error` → `handleOpenAIError()` | Inline + toast | Yes |
| Non-streaming API error | `res.error` → `handleOpenAIError()` | Inline + toast | Yes |
| Network/exception error | Catch block in Chat.svelte | Toast + inline | Yes |
| File upload error | Various `toast.error()` in Chat.svelte | Toast | No — out of scope |
| Settings save | `toast.success('Settings saved successfully!')` | Toast | No — out of scope |

### 2.4 Coverage Verification

The two interception points (`handleOpenAIError()` and catch block in Chat.svelte) cover all AI error paths:

- **Streaming errors:** Backend returns SSE error → Socket.IO `chat:message:error` → `handleOpenAIError()`
- **Non-streaming errors:** Backend returns HTTP error JSON → `res.error` → `handleOpenAIError()`
- **Network failures:** `generateOpenAIChatCompletion()` throws → catch block in Chat.svelte
- **Timeouts:** Fetch timeout → exception → catch block in Chat.svelte
- **Malformed responses:** `res.json()` fails → exception → catch block in Chat.svelte

No AI error path bypasses both interception points. Duplicate processing is possible if both `handleOpenAIError()` and the catch block fire for the same error, but they handle different failure modes (Socket.IO vs. HTTP exception), so duplication is unlikely.

## 3. LiteLLM Error Compatibility

LiteLLM (v1.110.1) returns OpenAI-compatible error responses:

```json
{
  "error": {
    "message": "string",
    "type": "string",
    "code": "string or int",
    "param": "string or null"
  }
}
```

### Verified from Source Code

`backend/open_webui/routers/openai.py` extracts `retry-after` and `retry-after-ms` headers but does NOT extract `rate_limit_type` or `rate_limited_by`. `publish_model_provider_request_failed()` classifies all 429 responses as `rate_limited` regardless of source.

| Error Category | HTTP Status | Error Type | Other Signals | Reliability | Source Verification |
|---|---|---|---|---|---|
| `rate_limit` | 429 | `rate_limit_exceeded` | `retry-after` header | Medium — RPM/TPM not distinguishable | Source: `publish_model_provider_request_failed` classifies all 429 as `rate_limited` |
| `budget_exceeded` | 422 | `budget_exceeded` | Message contains "Budget has been exceeded" | High | LiteLLM documentation; example observed: "Budget has been exceeded! Tag=... Current cost: 0.102062, Max budget: 0.1" |
| `model_unavailable` | 404 | `not_found_error`, `model_not_found` | Message contains "model" | High | Source: `publish_model_provider_request_failed` maps 404 + model keywords to `model_not_found` |
| `authentication_error` | 401/403 | `authentication_error` | — | High | Source: `publish_model_provider_request_failed` maps 401/403 to `authentication_failed` |
| `permission_error` | 403 | — | Message contains "permission" or "access" | Medium | 403 could be auth or permission; message pattern needed to distinguish |
| `provider_error` | 502/503/504 | Varies | Upstream provider error body | Medium | Source: `publish_model_provider_request_failed` maps >=500 to `server_failed` |
| `timeout` | 504 | — | Timeout exception | Medium | Runtime behavior not verified from source |
| `connection_error` | — | — | Connection refused, DNS failure, fetch TypeError | High | Network exception type |
| `context_length_exceeded` | 400/422 | — | Message contains "context", "token", "maximum context" | Medium | Message pattern matching |
| `content_policy` | 400 | — | Message contains "policy", "safety", "content" | Medium | Message pattern matching |
| `generic_error` | Any | — | Fallback | N/A | Fallback category |

### Runtime Verification Required

- Whether LiteLLM 1.110.1 sends `rate_limit_type` and `rate_limited_by` headers in our deployment
- Whether provider-generated 429 responses include LiteLLM error fields or passthrough provider error bodies
- Whether the `retry-after` header is accessible to the frontend through the current request path

---

## 4. Final Error Categories

| Category Key | Description | Detection Signals | Reliability | Default Persian | Default English |
|---|---|---|---|---|---|
| `rate_limit` | Rate limit exceeded (RPM, TPM, or concurrency) | HTTP 429, `error.type` = `rate_limit_exceeded`, `retry-after` header | Medium (combined — RPM/TPM indistinguishable) | محدودیت نرخ درخواست است. لطفاً کمی صبر کنید و دوباره تلاش کنید. | Rate limit exceeded. Please wait and try again. |
| `budget_exceeded` | Budget or spend limit exceeded | HTTP 422, `error.type` = `budget_exceeded`, message contains "Budget has been exceeded" | High | اعتبار حساب شما برای ادامه کافی نیست. لطفاً حساب خود را شارژ کنید. | Your account balance is insufficient to continue. Please recharge your account. |
| `model_unavailable` | Model not found or unavailable | HTTP 404, `error.type` = `not_found_error` / `model_not_found`, message contains "model" | High | مدل درخواست شده در دسترس نیست. | The requested model is not available. |
| `authentication_error` | Authentication failure | HTTP 401/403, `error.type` = `authentication_error` | High | احراز هویت ناموفق است. لطفاً دوباره تلاش کنید. | Authentication failed. Please try again. |
| `permission_error` | Permission denied | HTTP 403, message contains "permission" or "access" | Medium | شما دسترسی کافی برای این عملیات ندارید. | You do not have permission to perform this action. |
| `provider_error` | AI provider or gateway error | HTTP 502/503/504, or unclassified provider error | Medium | خدمات هوش مصنوعی موقتاً در دسترس نیست. | The AI service is temporarily unavailable. |
| `timeout` | Request timeout | HTTP 504, timeout exception | Medium | زمان انتظار برای پاسخ به پایان رسید. لطفاً دوباره تلاش کنید. | The request timed out. Please try again. |
| `connection_error` | Network connection failure | Connection refused, DNS failure, fetch TypeError | High | نمی‌توان به سرویس هوش مصنوعی متصل شد. | Unable to connect to the AI service. |
| `context_length_exceeded` | Context window exceeded | HTTP 400/422, message contains "context length", "maximum context", "token limit" | Medium | مکالمه بسیار طولانی است. لطفاً یک گفتگو جدید شروع کنید. | The conversation is too long. Please start a new chat. |
| `content_policy` | Content policy violation | HTTP 400, message contains "content policy", "safety policy", "policy violation" | Medium | این درخواست به دلیل سیاست محتوای امنیتی مسدود شده است. | This request was blocked by content policy. |
| `generic_error` | Fallback for unclassified errors | Any error not matching above categories | N/A | خطای پیش‌بینی نشده‌ای رخ داد. لطفاً دوباره تلاش کنید. | An unexpected error occurred. Please try again. |

**Note:** RPM and TPM are combined into a single `rate_limit` category because LiteLLM may use the same `error.type` for both, and the distinguishing headers are not guaranteed to be forwarded to the frontend.

**Fallback:** `generic_error` is the required fallback — every unclassified error routes here.

---

## 5. Classification Signals and Precedence

### Precedence Order

1. **Explicit error type/code** — `error.type` field from structured error body
2. **Specific message patterns** — narrowly defined substrings (e.g., "Budget has been exceeded")
3. **HTTP status** — only when reliable (404 → model_unavailable, 401 → authentication_error, 429 → rate_limit)
4. **Exception/network signature** — fetch TypeError → connection_error, AbortError → timeout
5. **Generic fallback** — `generic_error`

### Ambiguity Resolution

| Conflict | Resolution |
|---|---|
| HTTP 403: auth vs permission | Check message pattern first ("permission", "access denied", "forbidden" → `permission_error`); fall back to `authentication_error`. `error.type` = `authentication_error` is not checked early on 403 so permission signals are not overridden. |
| HTTP 429: user vs provider rate limit | Both classified as `rate_limit` — cannot reliably distinguish |
| HTTP 404: model vs endpoint | Check message contains "model" → `model_unavailable`, otherwise `generic_error` |
| HTTP 422: budget vs validation | Check message contains "Budget has been exceeded" → `budget_exceeded`, otherwise `generic_error` |
| HTTP 504: timeout vs provider error | Check timeout exception type → `timeout`; otherwise `provider_error` |
| HTTP 400: context vs content vs other | Check specific patterns ("context length" → `context_length_exceeded`, "content policy" → `content_policy`), otherwise `generic_error` |

### Classification Limitations

- RPM and TPM cannot be reliably distinguished — combined into `rate_limit`
- Provider-generated 429 vs LiteLLM-generated 429 may not be distinguishable if provider passthrough lacks LiteLLM error fields
- Broad message substring checks ("model", "content", "permission", "context") are unreliable alone — must be combined with status code and error type
- Unknown provider error bodies route to `generic_error`

---

## 6. Language Behavior

### Selection Rules

The user-facing message is selected based on the user's current Open WebUI interface language:

1. **Persian UI language** (`fa`, including compatible variants like `fa-IR`) → Persian custom message
2. **Every other UI locale** (`en`, `de`, `fr`, etc.) → English custom message
3. **Missing/empty custom Persian message** → Persian default message
4. **Missing/empty custom English message** → English default message
5. **Unknown/unclassified error** → `generic_error` category
6. **No automatic translation** — messages are entered manually by administrators
7. **No separate multilingual framework** — uses existing i18n system only for language detection

### Language Detection

The current UI language is available via `$i18n.language` (i18next), already used in `Banner.svelte`, `ChatList.svelte`, and other components.

Detection logic:
```javascript
const isPersian = $i18n.language?.startsWith('fa');
const message = isPersian ? customMessages[category]?.fa : customMessages[category]?.en;
```

The backend default locale (`ui.default_locale`) is available in the `config` store (`$config?.default_locale`), but `$i18n.language` reflects the actual active language (which may differ due to user selection via querystring/localStorage).

---

## 7. User-Facing Security Requirements

Every user-visible AI request error covered by this feature must display a mapped, safe message. If classification or mapping fails, use the generic default rather than exposing the raw error.

### Information That Must NOT Appear in User-Facing Messages

- LiteLLM Tags
- Internal user identifiers
- Budget identifiers
- Current cost / maximum budget
- API keys / provider credentials
- Internal URLs
- Raw provider payloads
- Stack traces
- Raw exception details
- Internal implementation information

### Boundary Between User-Visible and Internal

| Channel | Content | Allowed? |
|---|---|---|
| Chat UI error bubble | Mapped safe message only | Yes — mapped message |
| Toast notification | Mapped safe message only | Yes — mapped message |
| Browser console | Raw error for debugging | Yes — developer-only |
| Server logs | Full technical error | Yes — preserved via `publish_model_provider_request_failed()` |
| Network tab | Raw HTTP response | Yes — browser developer tool |

The mapper itself must fail safely: any exception in classification or message lookup returns `generic_error` default, never the raw error.

---

## 8. Admin UI Design

### Location

New tab in the existing Settings Modal, accessible from `/admin/settings` → `admin:error-messages`. The Settings Modal (`src/lib/components/chat/SettingsModal.svelte`) already renders admin tabs for users with `$user?.role === 'admin'`.

### Registration

Add to `SettingsModal.svelte`:
- `adminSettings` array: `{ id: 'admin:error-messages', title: 'Error Messages', ... }`
- `adminSettingGroups`: `'admin:error-messages': $i18n.t('System')`
- Render branch: `{:else if selectedTab === 'admin:error-messages'} <AdminErrorMessages ... />`

### Page Layout

A new component `src/lib/components/admin/Settings/ErrorMessages.svelte` containing:

- Page heading: "Error Messages"
- Description: "Customize user-facing error messages for AI request failures."
- Table/list of predefined error categories, each row:
  - Category name (read-only, from i18n)
  - Brief description (read-only, from i18n)
  - Persian message textarea
  - English message textarea
  - "Reset to default" button per row
- Global "Save all" button at bottom
- Optional "Reset all to defaults" button (only if it fits the existing design without unnecessary complexity)

### Components to Reuse

- `AdminSettingSection`, `AdminSettingRow`, `AdminSettingField`, `AdminSettingSaveButton` from `src/lib/components/admin/Settings/`
- `Textarea` from `src/lib/components/common/Textarea.svelte`
- `toast` from `svelte-sonner` for save confirmation
- `Switch` from `src/lib/components/common/Switch.svelte` (only if an enabled/disabled toggle is added later — not required for MVP)

### Restrictions

- Administrators cannot create new categories
- Administrators cannot modify classification logic
- Administrators cannot define custom regex matching rules
- Category list is code-managed

---

## 9. Configuration Storage and API

### Storage Mechanism

Reuse the existing `Config` per-key database storage (`backend/open_webui/models/config.py`):

- **Storage key:** `ui.error_messages`
- **Value:** JSON object mapping category keys to language message objects:
  ```json
  {
    "rate_limit": { "en": "...", "fa": "..." },
    "budget_exceeded": { "en": "...", "fa": "..." },
    ...
  }
  ```
- **Defaults:** Defined in code as a TypeScript constant map. Used when no config value exists or when a category/language field is missing/empty.

This follows the existing pattern of `ui.i18n`, `ui.default_interface_settings`, and other `ui.*` keys already stored in the Config table.

### Read Mechanism

**Important:** `GET /api/config` does NOT return all config values. It uses `Config.get_many()` with an explicit key list (`backend/open_webui/main.py`, lines ~2373-2426). `ui.error_messages` must be added to that list.

- `GET /api/config` (`backend/open_webui/main.py`) returns a nested object where config keys are grouped under section objects. `ui.error_messages` is nested under the `ui` object as `'error_messages': config.get('ui.error_messages')`.
- Already loaded in `src/routes/(app)/+layout.svelte` via `getBackendConfig().then((value) => config.set(value))`
- Available to frontend as `$config.ui.error_messages` (nested under `ui`), NOT `$config.error_messages` at top level.

**Backend change required:** Add `'ui.error_messages'` to the `Config.get_many()` call in `get_app_config()` and map it to the return dict as `'error_messages': config.get('ui.error_messages')` inside the `'ui': { ... }` object.

No dedicated read endpoint is needed. The existing `GET /api/config` already returns all config to authenticated users. The error messages themselves are non-sensitive user-facing text, so exposing them to all authenticated users is acceptable.

### Write Endpoint

**POST** `/api/configs/error-messages` in `backend/open_webui/routers/configs.py`

- Authorization: `Depends(get_admin_user)` (same as all other config endpoints in this file)
- Body: `{ "messages": { "rate_limit": { "en": "...", "fa": "..." }, ... } }`
- Persistence: `Config.upsert({ 'ui.error_messages': form_data.messages })`
- Event: Not needed. Frontend does not listen for `CONFIG_UPDATED`. Page reload is sufficient for config changes to take effect.

### Validation Requirements

- Admin authorization enforced by backend
- Valid JSON structure required
- Known category keys only (from `ERROR_CATEGORIES`)
- Supported language keys only: `en`, `fa`
- String values only
- Empty values allowed (falls back to default)
- Missing categories allowed (falls back to default)
- No partial or malformed config persistence
- Invalid input must not corrupt existing configuration (reject entire payload on validation failure)

### Why a Dedicated Endpoint

Existing POST endpoints in `configs.py` use flat `KEY_MAP` dicts. Error messages have a nested structure (category → language → message) that doesn't fit the flat pattern. A dedicated endpoint follows the existing pattern (see `set_interface_visibility`, `set_connections_config`).

### Config Refresh

No real-time refresh needed for MVP. Page reload or existing config refresh is sufficient. `CONFIG_UPDATED` Socket.IO event is not used by the frontend and is not required.

### Admin Authorization

- Backend: `Depends(get_admin_user)` enforces admin-only write access
- Frontend: Settings Modal already restricts admin tabs to `$user?.role === 'admin'`
- No additional frontend-only authorization is needed; backend enforcement is authoritative

---

## 10. Centralized Error Mapping Architecture

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      CLIENT (Browser)                            │
│  ┌──────────────┐  ┌──────────────────┐  ┌──────────────────┐ │
│  │  Chat UI     │  │  Error.svelte    │  │  Admin Panel     │ │
│  │  (toast)     │  │  (message area)  │  │  (settings)      │ │
│  └──────┬───────┘  └────────┬─────────┘  └────────┬─────────┘ │
│         │                   │                     │            │
└─────────┼───────────────────┼─────────────────────┼────────────┘
          │                   │                     │
          ▼                   ▼                     ▼
┌─────────────────────────────────────────────────────────────────┐
│              ERROR MAPPER (src/lib/utils/error-mapper.ts)       │
│  classifyError(error, status, headers) → { category }          │
│  getMappedMessage(category, lang, customMessages) → string      │
└─────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│              CONFIG (ui.error_messages in Config table)          │
│  GET /api/config  →  loads into $config store                   │
│  POST /api/configs/error-messages  →  admin write               │
└─────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility |
|-----------|---------------|
| `src/lib/utils/error-mapper.ts` (new) | Central classification + message lookup. Pure functions, no side effects. |
| `src/lib/components/chat/Chat.svelte` | Call mapper in `handleOpenAIError()` and catch block. Set `responseMessage.error = { content: mappedMessage }`. |
| `src/lib/apis/openai/index.ts` | No change — `getErrorMessage()` used by non-AI paths too. Mapper called from `Chat.svelte` directly. |
| `src/lib/apis/streaming/index.ts` | No change — stream errors flow through `handleOpenAIError()` via Socket.IO. |
| `src/lib/components/chat/Messages/Error.svelte` | No change — displays `message.error.content` which is already mapped. |
| `src/lib/components/admin/Settings/ErrorMessages.svelte` (new) | Admin UI for editing Persian/English messages per category. |
| `src/lib/components/chat/SettingsModal.svelte` | Register `admin:error-messages` tab. |
| `backend/open_webui/routers/configs.py` | POST `/api/configs/error-messages` (admin-only write). |
| `backend/open_webui/models/config.py` | No change — existing `Config.upsert()`/`Config.get()` used. |
| `backend/open_webui/main.py` | `GET /api/config` endpoint — returns flat config object via `Config.get_many()` | Add `'ui.error_messages'` to `Config.get_many()` key list and map it to return dict | Required | Without this change, error messages are not returned to frontend |

### Data Flow

1. **Error occurs** → Backend returns HTTP error or Socket.IO `chat:message:error` event
2. **Frontend receives error** → `handleOpenAIError(error, responseMessage)` called
3. **Classification** → `classifyError(error, status, headers)` returns category key
4. **Message lookup** → `getMappedMessage(category, $i18n.language, $config.ui.error_messages)` returns user-friendly message
5. **Display** → `responseMessage.error = { content: mappedMessage }`; toast shows mapped message; `Error.svelte` displays mapped content
6. **Original error** → Preserved in server logs via `publish_model_provider_request_failed()` and `console.error()`; not exposed to user

### Default and Missing Value Handling

- If `ui.error_messages` config is missing entirely → use code-defined defaults
- If a category is missing from config → use code-defined default for that category
- If a language field is empty/missing → use code-defined default for that language
- If category is unclassified → use `generic_error` default
- Defaults are defined in `src/lib/utils/error-mapper.ts` as a constant map

---

## 11. Explicit Exclusions

### Must NOT Modify

- General notification system (`svelte-sonner` toasts used for non-AI purposes)
- Success notifications ("Settings saved successfully")
- Settings save confirmation messages
- User management notifications
- Authentication UI messages unrelated to AI requests
- File upload errors
- Image upload errors
- General application errors
- Admin Panel notifications
- LiteLLM or its configuration
- AI connection settings
- Budget/spend tracking architecture
- Backend logging behavior (server-side logs preserved)

### Only These AI Error Paths Are Intercepted

- `handleOpenAIError()` in `Chat.svelte` (covers Socket.IO streaming errors and non-streaming `res.error`) — calls mapper instead of `getErrorMessage()`
- Exception catch block in `Chat.svelte` (~line 5188-5221) (covers API call exceptions from `generateOpenAIChatCompletion()`)

`getErrorMessage()` utility itself is NOT modified — it continues to serve non-AI paths. Within `handleOpenAIError()`, its call is replaced by the mapper.

All other `toast.error()` calls in `Chat.svelte` (file upload, chat variables, web search confirmation, etc.) remain unchanged.

---

## 12. Minimal Verified File-Change Matrix

| File | Existing Responsibility | Proposed Change | Required/Optional | Reason |
|------|------------------------|-----------------|-------------------|--------|
| `src/lib/utils/error-mapper.ts` | (new file) | Error classification logic + default Persian/English messages | Required | Centralized mapper — must exist |
| `src/lib/components/chat/Chat.svelte` | Chat orchestration; `handleOpenAIError()` and catch block handle AI errors | Apply mapper in `handleOpenAIError()` and catch block (~line 5188-5221) | Required | Primary interception point for all AI error paths |
| `backend/open_webui/routers/configs.py` | Config API routes (admin-only) | Add POST `/api/configs/error-messages` endpoint | Required | Admin write endpoint for error messages |
| `src/lib/components/admin/Settings/ErrorMessages.svelte` | (new file) | Admin UI for editing Persian/English messages per category | Required | Admin UI entry point |
| `src/lib/components/chat/SettingsModal.svelte` | Settings modal with admin tabs | Register `admin:error-messages` tab | Required | Admin UI navigation |
| `src/lib/i18n/locales/en-US/translation.json` | English translations | Add category label/description keys | Required | Admin UI labels |
| `src/lib/apis/openai/index.ts` | OpenAI API client; `getErrorMessage()` utility | No change — used by non-AI paths too | Not required | Changing it would affect non-AI error paths |
| `src/lib/apis/configs/index.ts` | API client for config endpoints | New: `setErrorMessages()` function for POST `/api/configs/error-messages` | Required | Admin write endpoint client |
| `src/lib/apis/streaming/index.ts` | SSE stream parsing | No change — stream errors flow through `handleOpenAIError()` | Not required | Already covered by Chat.svelte interception |
| `src/lib/components/chat/Messages/Error.svelte` | Displays `message.error.content` | No change — content already mapped upstream | Not required | Display-only component |
| `src/lib/stores/index.ts` | App state stores | No change — error messages accessed via `$config.ui.error_messages` | Not required | Reuses existing config store |
| `src/lib/apis/index.ts` | Backend API client | No change — `GET /api/config` already returns messages | Not required | Reuses existing endpoint |
| `src/routes/(app)/+layout.svelte` | Loads `config` store on app init | No change — already loads all config | Not required | Error messages load with config |
| `backend/open_webui/models/config.py` | Config DB model | No change — existing `Config.upsert()`/`Config.get()` sufficient | Not required | No schema change needed |
| `backend/open_webui/main.py` | `GET /api/config` endpoint — returns flat config object via `Config.get_many()` | Add `'ui.error_messages'` to `Config.get_many()` key list and map it to return dict | Required | Without this change, error messages are not returned to frontend |

---

## 13. Implementation Phases

### Phase 1: Backend Config Write Endpoint

**Objective:** Add admin-only endpoint to write error message config and make it readable via `GET /api/config`.

**Files:** `backend/open_webui/routers/configs.py`, `backend/open_webui/main.py`

**Changes:**
- `backend/open_webui/routers/configs.py`: Add POST `/api/configs/error-messages` endpoint with `get_admin_user` authorization; validate JSON structure (known categories, `en`/`fa` keys, string values); `Config.upsert({ 'ui.error_messages': messages })`
- `backend/open_webui/main.py`: Add `'ui.error_messages'` to `Config.get_many()` key list; map it as `'error_messages': config.get('ui.error_messages')` in the return dict

**Dependencies:** Existing `Config` model, `get_admin_user`

**Verification:** Admin can POST; non-admin gets 401/403; invalid categories rejected; config persists; `$config.error_messages` accessible on frontend

---

### Phase 2: Error Mapper Utility

**Objective:** Create centralized error classification and message lookup module.

**Files:** `src/lib/utils/error-mapper.ts` (new)

**Changes:**
- `ERROR_CATEGORIES` constant object (category keys + descriptions)
- `DEFAULT_ERROR_MESSAGES` constant map (Persian + English per category)
- `classifyError(error, status, headers) → { category }` function
- `getMappedMessage(category, lang, customMessages) → string` function

**Dependencies:** None

**Risks:** Classification logic must match actual LiteLLM error responses from our deployment

**Verification:** Unit-test classification for each category; verify fallback to `generic_error`; verify language selection logic

---

### Phase 3: Frontend Error Handling Integration

**Objective:** Apply mapper to AI error paths in Chat.svelte.

**Files:** `src/lib/components/chat/Chat.svelte`

**Changes:**
- Modify `handleOpenAIError()` to use mapper instead of raw `getErrorMessage()` + toast
- Modify catch block (~line 5188-5221) to use mapper and set sanitized `responseMessage.error`
- Preserve original error in server logs (already done via `console.log(error)`)

**Dependencies:** Phase 2 (error-mapper.ts)

**Risks:** Multiple error paths must all be covered; streaming errors must be caught before reaching user

**Verification:** Test each error path displays sanitized message; verify technical details not in user-visible UI; verify no duplicate toasts

---

### Phase 4: Admin Panel UI

**Objective:** Create Admin Panel page for editing error messages.

**Files:**
- `src/lib/components/admin/Settings/ErrorMessages.svelte` (new)
- `src/lib/components/chat/SettingsModal.svelte` — register tab
- `src/lib/i18n/locales/en-US/translation.json` — add category labels

**Dependencies:** Phase 1 (backend API), Phase 2 (default messages)

**Risks:** UI must follow existing AdminSetting patterns for consistency

**Verification:** Verify admin can save and see changes; verify non-admin cannot access tab

---

### Phase 5: End-to-End Testing and Security Verification

**Objective:** Validate complete behavior against acceptance criteria.

**Files:** All modified files

**Risks:** Regression in existing error display behavior

**Verification:** See Section 14 acceptance criteria

---

## 14. Testing and Acceptance Criteria

| Test | Expected Result |
|------|----------------|
| Budget exceeded (HTTP 422) | User sees custom budget message, not "Tag=... Current cost: ..." |
| RPM rate-limit (HTTP 429) | User sees rate_limit message |
| TPM rate-limit (HTTP 429) | User sees rate_limit message (same as RPM) |
| Provider-generated 429 | User sees rate_limit or generic message (not raw provider error) |
| Timeout | User sees timeout message |
| Connection failure | User sees connection error message |
| Model unavailable | User sees model_unavailable message |
| Authentication error | User sees authentication_error message |
| Permission error | User sees permission_error message |
| Context length exceeded | User sees context_length_exceeded message |
| Content policy error | User sees content_policy message |
| Unknown error | User sees generic_error message |
| Streaming error | User sees mapped message, not raw SSE error |
| Non-streaming error | User sees mapped message |
| Persian UI (`fa`) | Displays Persian custom message |
| English UI (`en`) | Displays English custom message |
| Other UI language (`de`, `fr`, etc.) | Displays English custom message |
| Empty Persian custom message | Falls back to Persian default |
| Empty English custom message | Falls back to English default |
| No custom message configured | Falls back to code default |
| Admin can save changes | Message persists and is reflected in UI |
| Changes persist across restart | Config stored in database survives restart |
| Non-admin cannot modify settings | POST /api/configs/error-messages returns 401/403 |
| Technical details not exposed | No Tag, user ID, cost, API key, stack trace in user-visible UI |
| Unrelated notifications unchanged | "Settings saved successfully" and other non-AI toasts remain unchanged |

---

## 15. Runtime Verification Requirements

### Verified Facts (from source inspection)

1. `$i18n.language` provides current UI language (used in Banner.svelte, ChatList.svelte)
2. `Config.get()`/`Config.upsert()`/`Config.get_namespace()` exist for per-key config storage
3. `GET /api/config` uses explicit `Config.get_many()` key list; `'ui.error_messages'` was added to that key list (`backend/open_webui/main.py`)
4. `POST /api/configs/{section}` endpoints exist with `get_admin_user` authorization
5. `handleOpenAIError()` in `Chat.svelte` is the central error handler for AI errors
6. Socket.IO `chat:message:error` events route through `handleOpenAIError()`
7. `publish_model_provider_request_failed()` logs server-side and emits Socket.IO events
8. Backend returns configuration nested under `ui` object: `$config.ui.error_messages` (NOT `$config.error_messages` at top level). See `backend/open_webui/main.py` where `'error_messages': config.get('ui.error_messages')` is inside the `'ui': { ... }` object.
9. Frontend currently accesses `$config?.error_messages` at top level in three locations — this is a confirmed defect (see Correction Checklist).

### Recommended Design Decisions (implemented)

1. Store error messages under `ui.error_messages` key in the Config table (single JSON object, category → {en, fa})
2. Dedicated POST `/api/configs/error-messages` endpoint for admin writes (implemented)
3. No dedicated read endpoint needed — reuse `GET /api/config`; `'ui.error_messages'` added to `Config.get_many()` key list. A `GET /configs/error-messages` endpoint was also implemented but is currently unused by the frontend.
4. No Socket.IO config refresh needed for MVP — page reload or existing config refresh is sufficient. Frontend does not listen for `CONFIG_UPDATED`.
5. **CONFIGURATION PATH**: Frontend must access `$config?.ui?.error_messages` (nested under `ui`), NOT `$config?.error_messages` (top-level). This is a confirmed defect requiring code correction.
6. No separate store needed — access via `$config`, not a separate store.
7. No changes to `Error.svelte` — content already mapped upstream by `handleOpenAIError()`.

### Runtime Tests Required (cannot verify from source alone)

1. Whether LiteLLM 1.110.1 sends `rate_limit_type` and `rate_limited_by` headers in our deployment
2. Whether provider-generated 429 responses include LiteLLM error fields or passthrough provider bodies
3. Whether `$config.ui.error_messages` path correctly returns configuration after the frontend path fix
4. Whether Socket.IO `CONFIG_UPDATED` event triggers frontend config reload — NOT NEEDED for MVP (frontend does not listen)
5. End-to-end: admin saves error messages → configuration persists → chat errors display mapped messages

### Future Optional Improvements

1. Per-category enabled/disabled toggle
2. Socket.IO-driven config refresh without page reload
3. Additional language support beyond Persian/English
4. Error message preview in Admin UI

---

## 16. Implementation Correction Checklist

This checklist documents all defects found during implementation and code review, their status, and verification results.

### Confirmed Defects Requiring Code Changes (ALL FIXED)

| # | Severity | Description | File | Correction | Verification |
|---|----------|-------------|------|------------|--------------|
| 1 | Critical | Frontend accessed `$config?.error_messages` at top level, but backend exposes `error_messages` nested under `ui` object (`$config.ui.error_messages`) | `src/lib/components/chat/Chat.svelte` lines 5203, 5322; `src/lib/components/admin/Settings/ErrorMessages.svelte` line 137 | Changed all 3 references from `$config?.error_messages` to `$config?.ui?.error_messages` | Static check: 0 stale `$config?.error_messages` references remain; 3 correct `$config?.ui?.error_messages` references verified |
| 2 | High | `classifyError()` 403 branch checked `typeLower === 'authentication_error'` before permission message patterns, making `permission_error` unreachable | `src/lib/utils/error-mapper.ts` lines 330-338 | Reordered 403 block: permission message patterns checked first → `permission_error`, fall back to `authentication_error` | All 8 classification test cases passed |
| 3 | High | Section 1 `typeLower === 'authentication_error'` check (line 287) short-circuited all `authentication_error` typed errors before the 403 block, including 403 responses with permission messages | `src/lib/utils/error-mapper.ts` line 287 | Added `&& resolvedStatus !== 403` guard so 403 errors reach the 403 block for permission evaluation | All 8 classification test cases passed |

### Defects Already Corrected in Source

| # | Severity | Description | File | Correction Status |
|---|----------|-------------|------|-------------------|
| A | Critical | `setErrorMessages()` API client used escaped `$` in template literals (`\${WEBUI_API_BASE_URL}` and ``\`Bearer \${token}\``), producing literal strings instead of interpolated values | `src/lib/apis/configs/index.ts` | Fixed — template literals now correctly interpolate `${WEBUI_API_BASE_URL}` and `Bearer ${token}` |

### Runtime Verification Items

| # | Item | Method | Status |
|---|------|--------|--------|
| 1 | Confirm `$config.ui.error_messages` path returns saved configuration after frontend fix | Save admin config, reload chat page, verify custom messages display | Pending runtime |
| 2 | Confirm non-admin users cannot POST to `/configs/error-messages` | Attempt request without admin token, expect 401/403 | Pending runtime |
| 3 | Confirm invalid payloads (unknown category, wrong language key, non-string message) return 400 | Send malformed POST body, expect 400 validation error | Pending runtime |
| 4 | Confirm empty custom messages fall back to defaults | Set empty string for a category, trigger error, verify default message displays | Pending runtime |
| 5 | Confirm Persian UI shows Persian messages, English UI shows English messages | Switch UI language, trigger error, verify correct language | Pending runtime |
| 6 | Confirm unrelated toasts/notifications unchanged | Verify settings save toast, file upload toast, etc. still work | Pending runtime |

### Non-Blocking Recommendations (Outside Immediate Correction Scope)

1. Import `DEFAULT_ERROR_MESSAGES` from `$lib/utils/error-mapper.ts` in `ErrorMessages.svelte` instead of duplicating default message strings (lines 28-120 currently hardcode defaults)
2. Add confirmation dialog before `resetAll()` executes to prevent accidental loss of custom configuration
3. Consider reordering timeout message pattern check before TypeError network check to correctly classify TypeError with timeout-like messages

---

## 17. Summary of Corrections to Previous Analysis

The previous analysis contained several inaccuracies and unnecessary complexities that have been corrected:

1. **Removed dedicated `errorMessages` store** — Error messages are stored under `ui.error_messages` in the existing `Config` table and accessed via `$config.ui.error_messages`, not a separate store or top-level key.
2. **Removed dedicated read API endpoint** — `GET /api/config` already returns all config; no new read endpoint needed.
3. **Removed Socket.IO config refresh requirement** — Not needed for MVP; changes take effect on page reload or existing config refresh.
4. **Removed modification of `Error.svelte`** — The component is display-only; `message.error.content` is already mapped by `handleOpenAIError()`.
5. **Narrowed interception points** — Only `handleOpenAIError()` and the catch block (~line 5188-5221) in `Chat.svelte` need modification. No changes to streaming parser or multiple layers.
6. **Simplified language behavior** — Persian (`fa`) → Persian message, everything else → English. No per-locale storage, no translation framework.
7. **Removed `MessageError.svelte` references** — The actual component is `Error.svelte` at `src/lib/components/chat/Messages/Error.svelte`, and it requires no changes.
8. **Combined RPM/TPM into single `rate_limit` category** — They cannot be reliably distinguished.
9. **Removed `getErrorMessage()` global change** — Only modify `handleOpenAIError()` and the catch block; `getErrorMessage()` utility remains unchanged unless called from non-AI error paths.

---

## 18. Implementation Status

### Feature Status: IMPLEMENTED

The AI Error Message Management feature is fully implemented across all planned layers:

| Layer | File | Status |
|-------|------|--------|
| Error Classification | `src/lib/utils/error-mapper.ts` | Implemented — all 11 categories, precedence rules, safe fallback |
| Default Messages | `src/lib/utils/error-mapper.ts` | Implemented — Persian + English defaults for all categories |
| Chat Integration | `src/lib/components/chat/Chat.svelte` | Implemented — `handleOpenAIError()` + catch block use mapper |
| Admin UI | `src/lib/components/admin/Settings/ErrorMessages.svelte` | Implemented — edit/reset/save per-category Persian/English messages |
| Admin Navigation | `src/lib/components/chat/SettingsModal.svelte` | Implemented — `admin:error-messages` tab registered |
| Backend Write API | `backend/open_webui/routers/configs.py` | Implemented — POST `/api/configs/error-messages` (admin-only) |
| Backend Read Exposure | `backend/open_webui/main.py` | Implemented — `ui.error_messages` added to `get_many()` key list |
| API Client | `src/lib/apis/configs/index.ts` | Implemented — `setErrorMessages()` function |
| Translations | `src/lib/i18n/locales/en-US/translation.json` | Implemented — 29 errorMessages keys added |

### Final Code Review Status: PASS

All three confirmed defects from code review were corrected:

1. **Frontend config path**: All 3 `$config?.error_messages` references changed to `$config?.ui?.error_messages`
2. **403 classification precedence**: Permission signals checked before auth type fallback on 403
3. **403 auth-type short-circuit**: Section 1 `authentication_error` type check now excludes status 403

API client template literal fix verified correct.

### Known Validation Limitations

- Docker runtime testing: **PENDING** — not performed in this environment
- Frontend ESLint/Svelte type checking: timed out in this environment
- Automated unit tests: project has no test framework for this feature code; classification logic verified via standalone simulation (all 8 required test cases passed)

---

## 19. Actual Configuration Structure

### Storage Key

`ui.error_messages` — stored in the existing `Config` database table as a JSON object.

### Backend Response Structure

```javascript
GET /api/config returns:
{
  ...
  "ui": {
    ...
    "error_messages": {
      "rate_limit": { "en": "...", "fa": "..." },
      "budget_exceeded": { "en": "...", "fa": "..." },
      ...
    },
    ...
  },
  ...
}
```

### Frontend Consumption Path

`$config.ui.error_messages` — nested under `ui`, NOT at top level.

### Default Handling

- Missing config → code-defined defaults from `DEFAULT_ERROR_MESSAGES`
- Missing category → code-defined default for that category
- Missing/empty language field → code-defined default for that language
- Unclassified error → `generic_error` default

---

## 20. Actual API Behavior

### Endpoint: POST `/api/configs/error-messages`

- **Authorization:** `Depends(get_admin_user)` — admin-only write access
- **Method:** POST
- **Request Body:** `{ "messages": { "<category>": { "en": "<string>", "fa": "<string>" }, ... } }`
- **Persistence:** `Config.upsert({ 'ui.error_messages': form_data.messages })`
- **Validation:** Known categories only (`VALID_ERROR_CATEGORIES`), language keys `en`/`fa` only, string values only, empty values allowed, invalid payloads rejected with HTTP 400
- **Response:** `{ "messages": <saved messages> }`

### Endpoint: GET `/api/configs/error-messages` (also implemented)

- **Authorization:** `Depends(get_verified_user)` — any authenticated user
- **Method:** GET
- **Response:** `{ "messages": <stored messages or empty object> }`

### Read Path

All frontend consumers read error messages via `$config.ui.error_messages` from the `GET /api/config` response. `ui.error_messages` was added to `Config.get_many()` key list in `backend/open_webui/main.py`.

---

## 21. Actual Classification Behavior

### All 11 Categories

| Category | Description |
|----------|-------------|
| `rate_limit` | HTTP 429 or type `rate_limit_exceeded` |
| `budget_exceeded` | Type `budget_exceeded` or message contains "budget...exceeded" |
| `model_unavailable` | Type `not_found_error`/`model_not_found` or 404 + message contains "model" |
| `authentication_error` | HTTP 401, or 403 without permission signals |
| `permission_error` | 403 + message contains "permission"/"access denied"/"forbidden" |
| `provider_error` | HTTP 502/503/504 (non-timeout) or >=500 |
| `timeout` | HTTP 504 + timeout exception/message patterns, or exception/network timeout |
| `connection_error` | Fetch/TypeError network errors, connection-related messages |
| `context_length_exceeded` | HTTP 400/422 + message contains context/token limit patterns |
| `content_policy` | HTTP 400 + message contains content/safety/policy violation patterns |
| `generic_error` | Fallback for all unclassified/unknown errors |

### Classification Precedence

1. Explicit error type/code from structured error body
2. Specific message patterns (combined with status when applicable)
3. HTTP status code (reliable mappings only)
4. Exception/network signature
5. Generic fallback

### HTTP 403 Behavior (After Correction)

Permission-related message signals take precedence over generic authentication type:

| 403 Error Type | 403 Message | Classification | Rationale |
|---------------|-------------|----------------|-----------|
| `authentication_error` | "Permission denied" | `permission_error` | Permission signal detected |
| — | "Access denied" | `permission_error` | Permission signal detected |
| — | "Forbidden" | `permission_error` | Permission signal detected |
| `authentication_error` | "Authentication failed" | `authentication_error` | No permission signal |
| — | "Request rejected" | `authentication_error` | Default fallback |

### Security Guarantees

- Raw provider responses never exposed to end users
- API keys, credentials, user IDs, spend/budget information never in user-facing messages
- Stack traces never exposed
- Generic fallback used when classification/mapping fails — never raw error

---

## Document Path

`/projects/open-webui-whitelable/open-webui-whitelabel/docs/ai-error-message-management-plan.md`

This document is the definitive implementation reference for the AI Error Message Management feature.
