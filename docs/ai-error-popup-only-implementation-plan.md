# AI Error Popup-Only Implementation Plan

**Project:** Open WebUI White Label Fork  
**Baseline:** v0.13.4  
**Branch:** `whitelabel/v0.13.4`  
**Status:** Implementation planning — documentation only  
**Next stage:** Implementation by an AI coding agent

---

## 1. Project Context

This project is a white-label fork of Open WebUI v0.13.4. It includes a configurable AI Error Management feature that allows administrators to define user-friendly error messages in Persian (`fa`) and English (`en`) through the Admin Settings UI.

The existing error categories are:

- `rate_limit`
- `budget_exceeded`
- `model_unavailable`
- `authentication_error`
- `permission_error`
- `provider_error`
- `timeout`
- `connection_error`
- `context_length_exceeded`
- `content_policy`
- `generic_error`

The system supports Persian and English custom messages, default fallback messages, error classification, and mapping raw AI/provider errors into user-friendly messages via `src/lib/utils/error-mapper.ts`.

---

## 2. Objective

Change AI error handling so that AI request errors are displayed **exclusively through the existing toast/notification mechanism**, never as chat messages.

**Target behavior:**

```
AI Request Failure
    |
    v
Error Classification (classifyError())
    |
    v
Message Mapping (mapError() / getMappedMessage())
    |
    v
Configured Friendly Message
    |
    v
Toast / Popup Notification (svelte-sonner)
    |
    v
No error bubble inserted into chat
```

Raw provider/LiteLLM/backend error details must never be exposed to end users.

---

## 3. Verified Source Behavior

### 3.1 Current Error Pathways

All AI completion error pathways converge into two locations in `src/lib/components/chat/Chat.svelte`:

| Pathway | Location | Handler |
|---------|----------|---------|
| Non-streaming HTTP failure | Line 5197 (catch block) | `generateOpenAIChatCompletion().catch()` |
| Streaming failure via Socket.IO | Line 1957 | `chatEventHandler` → `handleOpenAIError()` |
| Streaming failure via event handler | Line 4001 | `chatCompletionEventHandler()` → `handleOpenAIError()` |
| Network/connection exception | Line 5197 (catch block) | `generateOpenAIChatCompletion().catch()` |
| Action/tool error | Line 3786 | `chatActionHandler` catch block |

### 3.2 `handleOpenAIError()` (Chat.svelte, line 5317)

```svelte
const handleOpenAIError = (error, responseMessage) => {
    const responseFailed = responseMessage.done && responseMessage.error;
    const { message: errorMessage } = mapError(
        error,
        $i18n.language,
        $config?.ui?.error_messages
    );
    responseMessage.error = { content: errorMessage };   // <-- inserts error into message
    responseMessage.done = true;
    if (responseMessage.statusHistory) {
        responseMessage.statusHistory = responseMessage.statusHistory.filter(
            (status) => status.action !== 'knowledge_search'
        );
    }
    history.messages[responseMessage.id] = responseMessage;   // <-- persists to history
    if (!responseFailed) toast.error(errorMessage);           // <-- shows toast
};
```

Key observations:
- Calls `mapError()` → uses existing classification and Admin-configured messages ✅
- Shows `toast.error()` ✅
- **Also sets `responseMessage.error`** — this inserts a user-facing error into the chat message ❌ (target: remove)
- **Also writes to `history.messages`** — persists error to history ❌ (target: remove)
- `toast.error()` is only called when `!responseFailed` — prevents duplicate toast on repeat errors ✅

### 3.3 Catch block (Chat.svelte, line 5197)

```svelte
.catch(async (error) => {
    console.log(error);
    const { message: errorMessage } = mapError(
        error,
        $i18n.language,
        $config?.ui?.error_messages
    );
    toast.error(errorMessage);
    responseMessage.error = { content: errorMessage };   // <-- inserts error into message
    responseMessage.done = true;
    history.messages[responseMessageId] = responseMessage;   // <-- persists to history
    history.currentId = responseMessageId;
    return null;
});
```

Key observations:
- Calls `mapError()` ✅
- Shows `toast.error()` ✅
- **Also sets `responseMessage.error`** ❌ (target: remove)
- **Also writes to `history.messages`** ❌ (target: remove)
- Sets `history.currentId` — affects message navigation

### 3.4 `chatCompletionEventHandler()` (Chat.svelte, line 3996)

```svelte
if (error) {
    if (shared) message.error = error;
    else handleOpenAIError(error, message);
}
```

The `shared` path writes raw `error` directly to `message.error` without mapping. This path is for shared/sidebar chat updates.

### 3.5 Socket.IO `chat:message:error` (Chat.svelte, line 1957)

```svelte
} else if (type === 'chat:message:error') {
    const responseCompleted = message.done;
    if (event.shared) {
        message.error = data.error;
        message.done = true;
    } else handleOpenAIError(data.error, message);
    ...
}
```

The `shared` path writes raw `data.error` directly to `message.error` without mapping.

### 3.6 `chatActionHandler()` catch block (Chat.svelte, line 3786)

```svelte
.catch((error) => {
    toast.error(`${error}`);
    if ($chatId === _chatId && history.messages[responseMessageId]) {
        history.messages[responseMessageId].error = { content: error };
    }
    return null;
});
```

This writes the **raw** error object directly to `message.error` without classification or mapping. It also calls `toast.error()` with raw error.

### 3.7 `createMessagePair()` (Chat.svelte, line 3836)

Creates assistant placeholder messages **before** the AI request:

```svelte
responseMessages.push({
    id: responseMessageId,
    parentId: userMessageId,
    childrenIds: [],
    role: 'assistant',
    user_id: $user?.id,
    content: `[RESPONSE] ${responseMessageId}`,
    done: true,
    model: modelId,
    modelName: model.name ?? model.id,
    modelIdx: modelIdx,
    timestamp: Math.floor(Date.now() / 1000)
});
```

The placeholder is inserted into `history.messages` and `history.currentId` is set. This is the message that gets updated with `responseMessage.error` on failure.

### 3.8 `ResponseMessage.svelte` error rendering (line 973-974)

```svelte
{#if message?.error}
    <Error content={message?.error?.content ?? message.content} />
{/if}
```

This renders the error bubble inside the chat when `message.error` is set.

### 3.9 `loadChat()` (Chat.svelte, line 3270)

On page refresh, `loadChat()` reads persisted messages from the backend via `getChatById()` and restores `history`. Any persisted error messages will be re-rendered by `ResponseMessage.svelte` on refresh.

### 3.10 `NotificationToast.svelte`

Imported at line 169 of `Chat.svelte` but **not invoked programmatically** for AI errors. AI errors use `svelte-sonner`'s `toast.error()` directly.

### 3.11 `error-mapper.ts` — reusable, no changes needed

`classifyError()`, `getMappedMessage()`, and `mapError()` are already implemented and correct. They use `$config.ui.error_messages` for Admin-configured messages and fall back to `DEFAULT_ERROR_MESSAGES`. Language selection uses `isPersianLanguage()` (checks if lang starts with `'fa'`).

---

## 4. Target Architecture

### 4.1 New Failure Flow

```
AI Request Failure
    |
    v
Catch block / handleOpenAIError() / chatCompletionEventHandler()
    |
    v
classifyError() + mapError()  (existing, unchanged)
    |
    v
Configured friendly message   (from Admin settings or defaults)
    |
    v
toast.error(friendlyMessage)  (existing svelte-sonner)
    |
    v
NO responseMessage.error assignment
NO history.messages error write
NO error bubble in chat
```

### 4.2 Requirements

1. AI request errors display through toast notification only.
2. No error message bubble inside the chat conversation.
3. New failed requests do not create user-facing error assistant messages.
4. Existing historical error bubbles are suppressed (not deleted).
5. Raw errors are never exposed to users.
6. Admin-configured friendly messages are reused.
7. Persian and English support remains functional.
8. User messages are preserved.
9. Successful assistant responses are unaffected.
10. Partial response content is handled correctly.
11. Retry/regenerate/continue work after failure.
12. Refresh does not reintroduce error bubbles.
13. Historical data is not deleted or modified.
14. No unnecessary backend changes.
15. No new dependencies.

---

## 5. File-by-File Implementation Plan

### 5.1 `src/lib/components/chat/Chat.svelte` — PRIMARY MODIFICATION

**5.1.1 `handleOpenAIError()` (line 5317)**

Remove these assignments:
- `responseMessage.error = { content: errorMessage };` (line 5324)
- `history.messages[responseMessage.id] = responseMessage;` (line 5331)

Keep:
- `mapError()` call for classification and friendly message
- `responseMessage.done = true;` (line 5325) — needed to mark the assistant message as complete so retry/regenerate works
- `toast.error(errorMessage)` (line 5332) — guarded by `if (!responseFailed)`
- `statusHistory` filtering (lines 5326-5330)

**5.1.2 Catch block (line 5197)**

Remove these assignments:
- `responseMessage.error = { content: errorMessage };` (lines 5207-5209)
- `history.messages[responseMessageId] = responseMessage;` (line 5213)
- `history.currentId = responseMessageId;` (line 5214)

Keep:
- `mapError()` call
- `toast.error(errorMessage)` (line 5206)
- `responseMessage.done = true;` (line 5211)
- `return null;`

**5.1.3 `chatCompletionEventHandler()` (line 3996)**

For the `shared` path (`message.error = error`), replace with mapped message or remove. For the non-shared path, `handleOpenAIError()` will be modified per 5.1.1.

**5.1.4 Socket.IO `chat:message:error` (line 1957)**

For the `shared` path (`message.error = data.error`), replace with mapped message or remove. For the non-shared path, `handleOpenAIError()` will be modified per 5.1.1.

**5.1.5 `chatActionHandler()` catch block (line 3786)**

Replace raw `error` with mapped message via `mapError()`, or remove the `message.error` assignment entirely. This is a separate action-error pathway (not standard AI completion) — evaluate whether in scope.

### 5.2 `src/lib/components/chat/Messages/ResponseMessage.svelte` — SECONDARY MODIFICATION

**5.2.1 Suppress error rendering (line 973-974)**

Change:
```svelte
{#if message?.error}
    <Error content={message?.error?.content ?? message.content} />
{/if}
```

To suppress rendering of `message.error` for assistant messages while preserving:
- Successful assistant messages (no `error` property)
- Partial assistant content (message has content, no `error` bubble)
- User messages (no `error` property)

Recommended approach: wrap the error block so it only renders when there is meaningful error content AND the message has no response content, OR simply remove the block entirely since new errors will not set `responseMessage.error` after Phase 1 changes.

**5.2.2 Handle empty assistant placeholders**

When `responseMessage.error` is no longer set, failed assistant messages will have `content: '[RESPONSE] ${id}'` (the placeholder text from `createMessagePair`). This placeholder should not render as a visible message. The existing `visibleResponseContent` computation at line 216-218 and `hasResponseContent` at line 218 should be checked to ensure empty/placeholder messages don't render as empty bubbles.

### 5.3 `src/lib/components/common/NotificationToast.svelte` — NO CHANGE

Imported but not invoked for AI errors. AI errors use `svelte-sonner`'s `toast.error()` directly. No modification needed unless popup UX improvements are deemed essential.

### 5.4 Files that must remain UNCHANGED

| File | Reason |
|------|--------|
| `src/lib/utils/error-mapper.ts` | Already correct; reusable; no changes needed |
| `src/lib/components/chat/Messages/Error.svelte` | Per constraints, do not modify |
| `src/lib/components/admin/Settings/ErrorMessages.svelte` | Admin UI out of scope |
| `src/lib/apis/configs/index.ts` | Config API out of scope |
| `backend/open_webui/routers/configs.py` | Backend config out of scope |
| `backend/open_webui/routers/openai.py` | Backend error handling out of scope |
| `backend/open_webui/events.py` | Backend events out of scope |
| `backend/open_webui/main.py` | Backend out of scope |
| Database schema | No changes |
| Docker configuration | No changes |

---

## 6. Historical Error Handling

### 6.1 Problem

Existing conversations may contain persisted assistant messages with `error` property:

```json
{
  "role": "assistant",
  "content": "",
  "error": { "content": "Provider returned an error..." },
  "done": true
}
```

On refresh, `loadChat()` restores these from the database. `ResponseMessage.svelte` line 973-974 would render them as error bubbles.

### 6.2 Strategy — Render-time suppression (do not modify data)

**Do not delete or modify historical records.** Instead, suppress rendering at the UI layer:

- In `ResponseMessage.svelte`, change the `{#if message?.error}` block so that error-only assistant messages (no response content) do not render the `<Error />` component.
- Messages with both partial content AND error: render the content but suppress the error bubble.
- User messages: never affected (they don't have `error`).

### 6.3 Distinction: Error-only vs Partial+Error

| Message type | content | error | Render content? | Render error bubble? |
|--------------|---------|-------|-----------------|---------------------|
| Error-only assistant | "" or placeholder | set | No | No (suppress) |
| Partial + error | "Partial response..." | set | Yes | No |
| Successful assistant | "Full response" | not set | Yes | N/A |
| User message | "Hello" | not set | Yes | N/A |

---

## 7. Error Handling Pathways Coverage

### 7.1 In-scope pathways (use central error handler)

| Pathway | Converges to | Classification used | Mapping used |
|---------|-------------|---------------------|--------------|
| Non-streaming HTTP failure | Catch block (line 5197) | `mapError()` | `mapError()` |
| Streaming SSE error | Socket.IO → `handleOpenAIError()` (line 1962) | `mapError()` | `mapError()` |
| Streaming event error | `chatCompletionEventHandler()` → `handleOpenAIError()` (line 4001) | `mapError()` | `mapError()` |
| Network/connection exception | Catch block (line 5197) | `mapError()` | `mapError()` |
| Timeout | Catch block (line 5197) | `mapError()` | `mapError()` |

### 7.2 Out-of-scope or separate-issue pathways

| Pathway | Status | Reason |
|---------|--------|--------|
| `chatActionHandler()` catch (line 3786) | Out of scope / separate | Uses raw error, not mapped; action-specific |
| Socket.IO `shared` path (lines 1959-1960, 4000) | Out of scope / separate | Shared/sidebar chat updates; different context |
| File upload errors | Out of scope | Separate toast.error() paths, not AI completion |
| Image generation errors | Out of scope | Separate API |
| Voice/audio errors | Out of scope | Separate realtime handling |
| Web search errors | Out of scope | Separate retrieval API |

### 7.3 Duplicate notification risk

The `handleOpenAIError()` function guards against duplicates with `if (!responseFailed) toast.error(errorMessage)`. The catch block always calls `toast.error()`. If both pathways could fire for the same error, duplicates could occur. The implementation should verify that only one pathway fires per error (they handle different failure modes: Socket.IO vs HTTP exception).

---

## 8. Popup UX Recommendations

### 8.1 Essential changes

None strictly essential — `svelte-sonner`'s `toast.error()` already works for displaying mapped messages.

### 8.2 Optional enhancements (not required for MVP)

| Enhancement | Justification | Priority |
|-------------|---------------|----------|
| Title support (category label) | Current toast shows only message; title would improve UX | Low |
| Duration control | Longer duration for important errors | Low |
| Duplicate prevention | Prevent toast spam on rapid retries | Medium |
| RTL/Persian direction | Persian text direction inherited from page | Low |
| Long message clamping | Prevent overflow on very long messages | Low |

**Recommendation:** Use `svelte-sonner` as-is for MVP. Do not introduce `NotificationToast.svelte` or a custom toast component unless essential improvements prove necessary during implementation.

### 8.3 Persian/RTL

- Language detection: `isPersianLanguage(lang)` in `error-mapper.ts` checks if lang starts with `'fa'`
- RTL direction: inherited from page-level `dir` attribute; no toast-specific styling currently
- No changes required for MVP unless Persian text renders incorrectly

---

## 9. Risks and Safeguards

| Risk | Description | Safeguard |
|------|-------------|-----------|
| **A — User message loss** | Failed request must not remove/corrupt user message | Do not modify user message creation in `createMessagePair()` |
| **B — Broken chat history** | Removing error metadata must not corrupt message structure | Keep `done: true`, keep placeholder message in history, only remove `error` property |
| **C — Retry/regenerate failure** | Users must retry failed requests | Regenerate button in `ResponseMessage.svelte` works on `done` messages; doesn't depend on `error` |
| **D — Empty assistant bubble** | Placeholder `[RESPONSE] ${id}` may render as empty bubble | Check `visibleResponseContent`/`hasResponseContent` rendering; suppress empty placeholder |
| **E — Historical raw error exposure** | Existing DB records may contain raw errors | Render-time suppression in `ResponseMessage.svelte`; do not delete DB records |
| **F — Partial response loss** | Partial content before failure must not be lost | Only suppress error bubble, not message content |
| **G — Duplicate notifications** | Multiple handlers firing for same error | Verify single pathway per error; `handleOpenAIError()` already guards with `responseFailed` |
| **H — Successful requests** | Normal responses must be unaffected | Only modify error pathways; success path untouched |
| **I — Classification regression** | Existing mapper must continue working | Do not modify `error-mapper.ts` |

---

## 10. Testing Matrix

### 10.1 Error Classification (can test `error-mapper.ts` locally)

- [ ] HTTP 429 / rate limit → `rate_limit`
- [ ] TPM/RPM exceeded → `rate_limit`
- [ ] Budget exceeded → `budget_exceeded`
- [ ] HTTP 401 authentication → `authentication_error`
- [ ] HTTP 403 permission → `permission_error`
- [ ] HTTP 502/503 provider errors → `provider_error`
- [ ] HTTP 504 timeout → `timeout`
- [ ] Connection errors → `connection_error`
- [ ] Context length exceeded → `context_length_exceeded`
- [ ] Content policy → `content_policy`
- [ ] Generic/unknown errors → `generic_error`

### 10.2 Notification Behavior (requires running app)

- [ ] Error popup appears after failed AI request
- [ ] Correct Admin-configured message appears
- [ ] Correct language (Persian/English) used
- [ ] Raw provider error not shown
- [ ] Duplicate notifications do not occur unexpectedly
- [ ] Dismissal works
- [ ] Notification does not prevent continuing conversation
- [ ] Successful requests do not produce error popups

### 10.3 Chat Behavior (requires running app)

- [ ] Failed request does not display error bubble
- [ ] Failed request does not insert error assistant message
- [ ] Original user message remains
- [ ] Empty assistant placeholders not visible
- [ ] Partial assistant output handled correctly
- [ ] Successful assistant responses unchanged
- [ ] Chat remains usable after error
- [ ] Retry works
- [ ] Regenerate works
- [ ] Continue-response works

### 10.4 Historical Conversations (requires running app + DB)

- [ ] Existing error-only assistant messages hidden
- [ ] Existing raw errors not visible after refresh
- [ ] Existing user messages remain
- [ ] Successful messages remain
- [ ] Partial assistant content remains visible
- [ ] Historical DB records not deleted/modified

### 10.5 Refresh and Persistence (requires running app + DB)

1. Trigger AI error → toast appears, no bubble
2. Dismiss notification / wait
3. Refresh page
4. Reopen conversation → no error bubble
5. Conversation structurally valid
6. Retry still possible

### 10.6 Local vs Runtime

- **Local:** `error-mapper.ts` unit tests (classification, mapping)
- **Runtime:** All chat behavior, toast, refresh, historical tests require Docker + browser (Playwright)

---

## 11. Implementation Phases

### Phase 1 — Error Path Changes (Essential)

1. Modify `handleOpenAIError()` in `Chat.svelte`: remove `responseMessage.error` and `history.messages[responseMessage.id]` assignments
2. Modify catch block in `Chat.svelte`: remove `responseMessage.error`, `history.messages[responseMessageId]`, `history.currentId` assignments
3. Verify `mapError()` and `toast.error()` remain intact

### Phase 2 — Historical Rendering Compatibility (Essential)

4. Modify `ResponseMessage.svelte`: suppress `{#if message?.error}` error bubble rendering
5. Verify empty assistant placeholders don't render as visible bubbles
6. Verify partial content messages render content without error bubble

### Phase 3 — Popup UX (Optional)

7. Add title support, duration control, duplicate prevention if needed
8. Only if MVP behavior proves insufficient

### Phase 4 — Verification (Essential)

9. Execute all testing matrix items
10. Report any tests that could not be run
11. Review final diff before completion

---

## 12. Instructions for the Next Implementation Agent

1. **Read this document before modifying source.**
2. **Read `docs/ai-error-message-management-plan.md`** for existing error management architecture.
3. **Inspect current Git status and diffs** before making changes. Preserve all existing modifications.
4. **Follow the minimal-change approach.** Modify only files listed in Section 5.
5. **Do not modify backend, Admin UI, database, or configuration** unless this plan explicitly demonstrates a necessary reason.
6. **Do not refactor unrelated code.**
7. **Do not introduce new dependencies.**
8. **Do not change successful request behavior.**
9. **Do not expose raw error details** to users.
10. **Keep the existing error classification and mapping architecture** (`error-mapper.ts`, `classifyError()`, `getMappedMessage()`, `mapError()`).
11. **Preserve retry, regeneration, continuation, and conversation integrity.**
12. **Verify every affected pathway** listed in Section 7.
13. **Run appropriate tests.** Report tests that could not be run honestly — do not claim successful testing without actual verification.
14. **Review the final diff** before concluding. Confirm only approved files were changed.

---

## 13. Acceptance Criteria

- [ ] AI request errors are displayed through notifications only.
- [ ] Error messages are not displayed as chat bubbles.
- [ ] New failed requests do not create user-facing error assistant messages.
- [ ] Existing historical error bubbles are suppressed.
- [ ] Raw errors are never exposed to users.
- [ ] Admin-configured friendly messages are reused.
- [ ] Persian and English support remains functional.
- [ ] User messages are preserved.
- [ ] Successful assistant responses are unaffected.
- [ ] Partial response content is handled correctly.
- [ ] Retry works.
- [ ] Regenerate works.
- [ ] Chat continuation works.
- [ ] Refresh does not reintroduce error bubbles.
- [ ] Historical data is not deleted.
- [ ] No unnecessary backend changes.
- [ ] No unnecessary new dependencies.
- [ ] Git changes remain within the approved scope (only `Chat.svelte` and `ResponseMessage.svelte`).

---

## 14. Out-of-Scope Items

- File upload errors
- Image generation errors
- Voice/audio errors
- Web search errors (separate retrieval API)
- Admin UI changes
- Backend API changes
- Database schema changes
- New notification framework
- New toast component (unless proven essential)
- Docker/configuration changes

---

## 15. Open Questions

1. **`chatActionHandler()` catch block (line 3786):** This writes raw error to `message.error` and calls `toast.error()` with raw error. It's an action/tool error pathway, not standard AI completion. Should this be brought into the mapped-error flow, or left as-is?

2. **Socket.IO `shared` paths (lines 1959-1960, 4000):** These write raw `data.error`/`error` directly to `message.error` for shared/sidebar chat updates. Should these also use `mapError()` or be suppressed?

3. **Empty assistant placeholder rendering:** After removing `responseMessage.error`, the placeholder content `[RESPONSE] ${id}` may still render. Need to verify whether `visibleResponseContent`/`hasResponseContent` in `ResponseMessage.svelte` suppresses empty/placeholder messages, or if additional rendering logic is needed.

4. **`history.currentId` in catch block:** The catch block sets `history.currentId = responseMessageId`. If removed, what is the impact on message navigation after a failure?

---

## 16. Document Control

- **Source of investigation findings:** Completed investigation report (session context)
- **Verification:** All line numbers and function names verified against current source at branch `whitelabel/v0.13.4`
- **Git status at time of writing:** Clean, nothing to commit
- **Files created:** `docs/ai-error-popup-only-implementation-plan.md` (this document)
- **Files modified:** None
- **Next stage:** Implementation by AI coding agent based on this plan
