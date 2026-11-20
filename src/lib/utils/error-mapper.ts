/**
 * AI Error Message Mapper
 *
 * Centralized error classification and message lookup for AI request errors.
 * Classifies errors into predefined categories and returns user-friendly,
 * safe messages in Persian or English based on the user's UI language.
 *
 * Security: Never exposes raw error details to end users. Falls back to
 * generic_error defaults when classification or mapping fails.
 */

// ---------------------------------------------------------------------------
// Error Categories
// ---------------------------------------------------------------------------

export type ErrorCategory =
	| 'rate_limit'
	| 'budget_exceeded'
	| 'model_unavailable'
	| 'authentication_error'
	| 'permission_error'
	| 'provider_error'
	| 'timeout'
	| 'connection_error'
	| 'context_length_exceeded'
	| 'content_policy'
	| 'generic_error';

export interface ErrorCategoryInfo {
	key: ErrorCategory;
	label: string;
	description: string;
}

export const ERROR_CATEGORIES: Record<ErrorCategory, ErrorCategoryInfo> = {
	rate_limit: {
		key: 'rate_limit',
		label: 'Rate Limit',
		description: 'Request rate limit exceeded (RPM, TPM, or concurrency)'
	},
	budget_exceeded: {
		key: 'budget_exceeded',
		label: 'Budget Exceeded',
		description: 'Account balance or spend limit exceeded'
	},
	model_unavailable: {
		key: 'model_unavailable',
		label: 'Model Unavailable',
		description: 'The requested model is not found or unavailable'
	},
	authentication_error: {
		key: 'authentication_error',
		label: 'Authentication Error',
		description: 'Authentication failed for the AI service'
	},
	permission_error: {
		key: 'permission_error',
		label: 'Permission Error',
		description: 'Insufficient permissions to perform this action'
	},
	provider_error: {
		key: 'provider_error',
		label: 'Provider Error',
		description: 'AI provider or gateway error'
	},
	timeout: {
		key: 'timeout',
		label: 'Timeout',
		description: 'The request timed out'
	},
	connection_error: {
		key: 'connection_error',
		label: 'Connection Error',
		description: 'Unable to connect to the AI service'
	},
	context_length_exceeded: {
		key: 'context_length_exceeded',
		label: 'Context Length Exceeded',
		description: 'The conversation is too long for the model context window'
	},
	content_policy: {
		key: 'content_policy',
		label: 'Content Policy',
		description: 'Request blocked by content safety policy'
	},
	generic_error: {
		key: 'generic_error',
		label: 'Generic Error',
		description: 'An unexpected error occurred'
	}
};

// ---------------------------------------------------------------------------
// Default Messages (Persian + English)
// ---------------------------------------------------------------------------

export interface ErrorMessageMap {
	en: string;
	fa: string;
}

export const DEFAULT_ERROR_MESSAGES: Record<ErrorCategory, ErrorMessageMap> = {
	rate_limit: {
		en: 'Rate limit exceeded. Please wait and try again.',
		fa: 'محدودیت نرخ درخواست است. لطفاً کمی صبر کنید و دوباره تلاش کنید.'
	},
	budget_exceeded: {
		en: 'Your account balance is insufficient to continue. Please recharge your account.',
		fa: 'اعتبار حساب شما برای ادامه کافی نیست. لطفاً حساب خود را شارژ کنید.'
	},
	model_unavailable: {
		en: 'The requested model is not available.',
		fa: 'مدل درخواست شده در دسترس نیست.'
	},
	authentication_error: {
		en: 'Authentication failed. Please try again.',
		fa: 'احراز هویت ناموفق است. لطفاً دوباره تلاش کنید.'
	},
	permission_error: {
		en: 'You do not have permission to perform this action.',
		fa: 'شما دسترسی کافی برای این عملیات ندارید.'
	},
	provider_error: {
		en: 'The AI service is temporarily unavailable.',
		fa: 'خدمات هوش مصنوعی موقتاً در دسترس نیست.'
	},
	timeout: {
		en: 'The request timed out. Please try again.',
		fa: 'زمان انتظار برای پاسخ به پایان رسید. لطفاً دوباره تلاش کنید.'
	},
	connection_error: {
		en: 'Unable to connect to the AI service.',
		fa: 'نمی‌توان به سرویس هوش مصنوعی متصل شد.'
	},
	context_length_exceeded: {
		en: 'The conversation is too long. Please start a new chat.',
		fa: 'مکالمه بسیار طولانی است. لطفاً یک گفتگو جدید شروع کنید.'
	},
	content_policy: {
		en: 'This request was blocked by content policy.',
		fa: 'این درخواست به دلیل سیاست محتوای امنیتی مسدود شده است.'
	},
	generic_error: {
		en: 'An unexpected error occurred. Please try again.',
		fa: 'خطای پیش‌بینی نشده‌ای رخ داد. لطفاً دوباره تلاش کنید.'
	}
};

// ---------------------------------------------------------------------------
// Classification Helpers
// ---------------------------------------------------------------------------

type ErrorLike = Record<string, any> | string | undefined | null;

/** Extract a string error type from various error shapes. */
const getErrorType = (error: ErrorLike): string | undefined => {
	if (!error || typeof error !== 'object') return undefined;
	const e = error as Record<string, any>;

	// OpenAI-compatible: error.type
	if (typeof e.type === 'string' && e.type.trim()) return e.type.trim();
	if (typeof e.error?.type === 'string' && e.error.type.trim()) return e.error.type.trim();
	if (typeof e.detail?.error?.type === 'string' && e.detail.error.type.trim())
		return e.detail.error.type.trim();
	if (typeof e.detail?.type === 'string' && e.detail.type.trim()) return e.detail.type.trim();

	return undefined;
};

/** Extract a string error code from various error shapes. */
const getErrorCode = (error: ErrorLike): string | undefined => {
	if (!error || typeof error !== 'object') return undefined;
	const e = error as Record<string, any>;

	if (typeof e.code === 'string' && e.code.trim()) return e.code.trim();
	if (typeof e.error?.code === 'string' && e.error.code.trim()) return e.error.code.trim();
	if (typeof e.detail?.error?.code === 'string' && e.detail.error.code.trim())
		return e.detail.error.code.trim();
	if (typeof e.detail?.code === 'string' && e.detail.code.trim()) return e.detail.code.trim();

	return undefined;
};

/** Extract the error message string from various error shapes. */
const getErrorMessageText = (error: ErrorLike): string => {
	if (!error) return '';
	if (typeof error === 'string') return error;
	const e = error as Record<string, any>;

	const candidates = [
		e?.detail?.error?.message,
		e?.detail?.message,
		e?.detail?.content,
		e?.error?.message,
		e?.error?.content,
		e?.message,
		e?.content
	];

	for (const candidate of candidates) {
		if (typeof candidate === 'string' && candidate.trim()) return candidate.trim();
	}

	return '';
};

/** Check if a message string contains a given substring (case-insensitive). */
const messageContains = (message: string, ...substrings: string[]): boolean => {
	const lower = message.toLowerCase();
	return substrings.some((s) => lower.includes(s.toLowerCase()));
};

/** Extract HTTP status from error or explicit parameter. */
const getStatus = (status: number | undefined, error: ErrorLike): number | undefined => {
	if (typeof status === 'number') return status;
	if (!error || typeof error !== 'object') return undefined;
	const e = error as Record<string, any>;

	if (typeof e.status === 'number') return e.status;
	if (typeof e.statusCode === 'number') return e.statusCode;
	if (typeof e.response?.status === 'number') return e.response.status;
	if (typeof e.response?.statusCode === 'number') return e.response.statusCode;

	return undefined;
};

/** Extract headers from error or explicit parameter. */
const getHeaders = (
	headers: Record<string, string> | undefined,
	error: ErrorLike
): Record<string, string> | undefined => {
	if (headers) return headers;
	if (!error || typeof error !== 'object') return undefined;
	const e = error as Record<string, any>;

	if (e.headers && typeof e.headers === 'object') return e.headers as Record<string, string>;
	if (e.response?.headers && typeof e.response.headers === 'object')
		return e.response.headers as Record<string, string>;

	return undefined;
};

// ---------------------------------------------------------------------------
// Classification
// ---------------------------------------------------------------------------

/**
 * Classify an AI request error into a predefined category.
 *
 * Precedence:
 *   1. Explicit error type/code from structured error body
 *   2. Specific message patterns
 *   3. HTTP status code
 *   4. Exception/network signature
 *   5. Generic fallback
 *
 * @param error - The error object (any shape)
 * @param status - Optional HTTP status code
 * @param headers - Optional HTTP headers
 * @returns The classified error category
 */
export const classifyError = (
	error: ErrorLike,
	status?: number,
	headers?: Record<string, string>
): ErrorCategory => {
	try {
		const resolvedStatus = getStatus(status, error);
		const resolvedHeaders = getHeaders(headers, error);
		const errorType = getErrorType(error);
		const errorCode = getErrorCode(error);
		const message = getErrorMessageText(error);

		// --- 1. Explicit error type/code ---
		const typeLower = (errorType || '').toLowerCase();
		const codeLower = (errorCode || '').toLowerCase();

		if (typeLower === 'rate_limit_exceeded' || codeLower === 'rate_limit_exceeded') {
			return 'rate_limit';
		}
		if (typeLower === 'budget_exceeded' || codeLower === 'budget_exceeded') {
			return 'budget_exceeded';
		}
		if (typeLower === 'not_found_error' || typeLower === 'model_not_found') {
			return 'model_unavailable';
		}
		if (typeLower === 'authentication_error' && resolvedStatus !== 403) {
			return 'authentication_error';
		}
		if (
			typeLower === 'invalid_request_error' &&
			messageContains(message, 'budget', 'exceeded')
		) {
			return 'budget_exceeded';
		}

		// --- 2. Specific message patterns (narrow, combined with status) ---

		// Budget exceeded — most specific first
		if (
			messageContains(message, 'budget has been exceeded') ||
			messageContains(message, 'budget exceeded')
		) {
			return 'budget_exceeded';
		}

		// Context length exceeded
		if (
			resolvedStatus &&
			(resolvedStatus === 400 || resolvedStatus === 422) &&
			messageContains(message, 'context length', 'maximum context', 'token limit')
		) {
			return 'context_length_exceeded';
		}

		// Content policy
		if (
			resolvedStatus === 400 &&
			messageContains(message, 'content policy', 'safety policy', 'policy violation')
		) {
			return 'content_policy';
		}

		// Model unavailable — check message contains "model" with 404
		if (resolvedStatus === 404 && messageContains(message, 'model')) {
			return 'model_unavailable';
		}

		// Permission vs authentication on 403
		// Permission-related signals take precedence over generic authentication type
		if (resolvedStatus === 403) {
			if (messageContains(message, 'permission', 'access denied', 'forbidden')) {
				return 'permission_error';
			}
			return 'authentication_error';
		}

		// --- 3. HTTP status code (reliable mappings only) ---

		if (resolvedStatus === 429) return 'rate_limit';
		if (resolvedStatus === 401) return 'authentication_error';
		if (resolvedStatus === 404) return 'model_unavailable';

		// 502/503/504 — provider errors
		if (resolvedStatus === 502 || resolvedStatus === 503) return 'provider_error';
		if (resolvedStatus === 504) {
			// 504 could be timeout or provider error; check exception type
			const errorName = error instanceof Error ? error.name : '';
			const errorConstructor = error?.constructor?.name ?? '';
			if (
				errorName === 'AbortError' ||
				errorName === 'TimeoutError' ||
				errorConstructor === 'AbortError' ||
				errorConstructor === 'TimeoutError' ||
				messageContains(message, 'timeout', 'timed out', 'deadline exceeded')
			) {
				return 'timeout';
			}
			return 'provider_error';
		}

		if (resolvedStatus && resolvedStatus >= 500) return 'provider_error';

		// --- 4. Exception/network signature ---

		// Fetch/Network errors
		if (error instanceof TypeError) {
			const typeErrorMessage = (error as Error).message.toLowerCase();
			if (
				typeErrorMessage.includes('fetch') ||
				typeErrorMessage.includes('network') ||
				typeErrorMessage.includes('connection') ||
				typeErrorMessage.includes('dns') ||
				typeErrorMessage.includes('connrefused') ||
				typeErrorMessage.includes('connection refused')
			) {
				return 'connection_error';
			}
		}

		// Abort/Timeout errors
		if (
			error instanceof Error &&
			(error.name === 'AbortError' ||
				error.name === 'TimeoutError' ||
				messageContains(message, 'aborted', 'timed out', 'timeout'))
		) {
			return 'timeout';
		}

		// Connection-related message patterns
		if (
			messageContains(
				message,
				'connection refused',
				'connection reset',
				'network error',
				'dns failure',
				'failed to fetch',
				'unable to connect'
			)
		) {
			return 'connection_error';
		}

		// Timeout message patterns
		if (messageContains(message, 'timeout', 'timed out', 'deadline exceeded')) {
			return 'timeout';
		}

		// --- 5. Generic fallback ---
		return 'generic_error';
	} catch {
		// Never throw — always fail safely to generic_error
		return 'generic_error';
	}
};

// ---------------------------------------------------------------------------
// Message Lookup
// ---------------------------------------------------------------------------

/**
 * Determine if the given UI language code is Persian.
 */
export const isPersianLanguage = (lang: string | undefined | null): boolean => {
	if (!lang) return false;
	return lang.toLowerCase().startsWith('fa');
};

/**
 * Get the user-facing error message for a category in the given language.
 *
 * Falls back safely:
 *   - Missing/empty custom Persian → Persian default
 *   - Missing/empty custom English → English default
 *   - Missing category → default for that category
 *   - Any failure → generic_error default
 *
 * @param category - Error category key
 * @param lang - Current UI language code (e.g. 'fa', 'en', 'de')
 * @param customMessages - Admin-configured messages from $config.error_messages
 * @returns Safe user-facing message string
 */
export const getMappedMessage = (
	category: ErrorCategory,
	lang: string | undefined | null,
	customMessages: Record<string, any> | undefined | null
): string => {
	try {
		const isFa = isPersianLanguage(lang);
		const targetLang = isFa ? 'fa' : 'en';

		// Look up custom message
		const categoryMessages =
			customMessages && typeof customMessages === 'object' && !Array.isArray(customMessages)
				? (customMessages[category] as Record<string, string> | undefined)
				: undefined;

		const customMessage =
			categoryMessages && typeof categoryMessages === 'object'
				? categoryMessages[targetLang]
				: undefined;

		if (typeof customMessage === 'string' && customMessage.trim()) {
			return customMessage.trim();
		}

		// Fall back to code default
		const def = DEFAULT_ERROR_MESSAGES[category];
		if (def) {
			return def[targetLang];
		}

		// Ultimate fallback — generic_error English default
		return DEFAULT_ERROR_MESSAGES.generic_error.en;
	} catch {
		return DEFAULT_ERROR_MESSAGES.generic_error.en;
	}
};

// ---------------------------------------------------------------------------
// Combined Helper (for convenience in Chat.svelte)
// ---------------------------------------------------------------------------

export interface MappedError {
	category: ErrorCategory;
	message: string;
}

/**
 * Classify an error and return the mapped user-friendly message.
 * Convenience wrapper combining classifyError + getMappedMessage.
 */
export const mapError = (
	error: ErrorLike,
	lang: string | undefined | null,
	customMessages: Record<string, any> | undefined | null,
	status?: number,
	headers?: Record<string, string>
): MappedError => {
	const category = classifyError(error, status, headers);
	const message = getMappedMessage(category, lang, customMessages);
	return { category, message };
};
