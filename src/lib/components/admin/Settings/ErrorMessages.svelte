<script lang="ts">
	import { getBackendConfig } from '$lib/apis';
	import { setErrorMessages } from '$lib/apis/configs';
	import { config } from '$lib/stores';
	import { onMount, getContext, tick } from 'svelte';
	import { toast } from 'svelte-sonner';

	import Textarea from '$lib/components/common/Textarea.svelte';
	import AdminSettingSection from './AdminSettingSection.svelte';
	import AdminSettingField from './AdminSettingField.svelte';

	const i18n: any = getContext('i18n');

	// Error categories defined in $lib/utils/error-mapper.ts
	const ERROR_CATEGORIES: Array<{
		key: string;
		label: string;
		description: string;
		defaultEn: string;
		defaultFa: string;
	}> = [
		{
			key: 'rate_limit',
			label: $i18n.t('settings.admin.errorMessages.categories.rateLimit.label'),
			description: $i18n.t(
				'settings.admin.errorMessages.categories.rateLimit.description'
			),
			defaultEn: 'Rate limit exceeded. Please wait and try again.',
			defaultFa: 'محدودیت نرخ درخواست است. لطفاً کمی صبر کنید و دوباره تلاش کنید.'
		},
		{
			key: 'budget_exceeded',
			label: $i18n.t('settings.admin.errorMessages.categories.budgetExceeded.label'),
			description: $i18n.t(
				'settings.admin.errorMessages.categories.budgetExceeded.description'
			),
			defaultEn: 'Your account balance is insufficient to continue. Please recharge your account.',
			defaultFa: 'اعتبار حساب شما برای ادامه کافی نیست. لطفاً حساب خود را شارژ کنید.'
		},
		{
			key: 'model_unavailable',
			label: $i18n.t('settings.admin.errorMessages.categories.modelUnavailable.label'),
			description: $i18n.t(
				'settings.admin.errorMessages.categories.modelUnavailable.description'
			),
			defaultEn: 'The requested model is not available.',
			defaultFa: 'مدل درخواست شده در دسترس نیست.'
		},
		{
			key: 'authentication_error',
			label: $i18n.t('settings.admin.errorMessages.categories.authenticationError.label'),
			description: $i18n.t(
				'settings.admin.errorMessages.categories.authenticationError.description'
			),
			defaultEn: 'Authentication failed. Please try again.',
			defaultFa: 'احراز هویت ناموفق است. لطفاً دوباره تلاش کنید.'
		},
		{
			key: 'permission_error',
			label: $i18n.t('settings.admin.errorMessages.categories.permissionError.label'),
			description: $i18n.t(
				'settings.admin.errorMessages.categories.permissionError.description'
			),
			defaultEn: 'You do not have permission to perform this action.',
			defaultFa: 'شما دسترسی کافی برای این عملیات ندارید.'
		},
		{
			key: 'provider_error',
			label: $i18n.t('settings.admin.errorMessages.categories.providerError.label'),
			description: $i18n.t(
				'settings.admin.errorMessages.categories.providerError.description'
			),
			defaultEn: 'The AI service is temporarily unavailable.',
			defaultFa: 'خدمات هوش مصنوعی موقتاً در دسترس نیست.'
		},
		{
			key: 'timeout',
			label: $i18n.t('settings.admin.errorMessages.categories.timeout.label'),
			description: $i18n.t('settings.admin.errorMessages.categories.timeout.description'),
			defaultEn: 'The request timed out. Please try again.',
			defaultFa: 'زمان انتظار برای پاسخ به پایان رسید. لطفاً دوباره تلاش کنید.'
		},
		{
			key: 'connection_error',
			label: $i18n.t('settings.admin.errorMessages.categories.connectionError.label'),
			description: $i18n.t(
				'settings.admin.errorMessages.categories.connectionError.description'
			),
			defaultEn: 'Unable to connect to the AI service.',
			defaultFa: 'نمی‌توان به سرویس هوش مصنوعی متصل شد.'
		},
		{
			key: 'context_length_exceeded',
			label: $i18n.t(
				'settings.admin.errorMessages.categories.contextLengthExceeded.label'
			),
			description: $i18n.t(
				'settings.admin.errorMessages.categories.contextLengthExceeded.description'
			),
			defaultEn: 'The conversation is too long. Please start a new chat.',
			defaultFa: 'مکالمه بسیار طولانی است. لطفاً یک گفتگو جدید شروع کنید.'
		},
		{
			key: 'content_policy',
			label: $i18n.t('settings.admin.errorMessages.categories.contentPolicy.label'),
			description: $i18n.t(
				'settings.admin.errorMessages.categories.contentPolicy.description'
			),
			defaultEn: 'This request was blocked by content policy.',
			defaultFa: 'این درخواست به دلیل سیاست محتوای امنیتی مسدود شده است.'
		},
		{
			key: 'generic_error',
			label: $i18n.t('settings.admin.errorMessages.categories.genericError.label'),
			description: $i18n.t(
				'settings.admin.errorMessages.categories.genericError.description'
			),
			defaultEn: 'An unexpected error occurred. Please try again.',
			defaultFa: 'خطای پیش‌بینی نشده‌ای رخ داد. لطفاً دوباره تلاش کنید.'
		}
	];

	let errorMessages: Record<string, { en: string; fa: string }> = {};
	let savedConfig: Record<string, { en: string; fa: string }> | null = null;
	let saving = false;

	const getDefaultMessage = (
		category: string,
		lang: 'en' | 'fa'
	): string => {
		const cat = ERROR_CATEGORIES.find((c) => c.key === category);
		if (!cat) return '';
		return lang === 'fa' ? cat.defaultFa : cat.defaultEn;
	};

	const loadConfig = async () => {
		const cfg = $config?.ui?.error_messages;
		if (cfg && typeof cfg === 'object' && !Array.isArray(cfg)) {
			errorMessages = { ...cfg };
		} else {
			errorMessages = {};
		}
		savedConfig = structuredClone(errorMessages);
	};

	const saveHandler = async () => {
		if (saving) return;
		saving = true;
		try {
			const res = await setErrorMessages(localStorage.token, {
				messages: errorMessages
			});
			if (!res) throw new Error($i18n.t('Failed to save error messages'));
			savedConfig = structuredClone(errorMessages);
			await config.set(await getBackendConfig());
			toast.success($i18n.t('Settings saved successfully!'));
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: String(error)
			);
		} finally {
			saving = false;
		}
	};

	const resetCategory = (category: string) => {
		errorMessages = {
			...errorMessages,
			[category]: {
				en: getDefaultMessage(category, 'en'),
				fa: getDefaultMessage(category, 'fa')
			}
		};
	};

	const resetAll = () => {
		const defaults: Record<string, { en: string; fa: string }> = {};
		for (const cat of ERROR_CATEGORIES) {
			defaults[cat.key] = {
				en: cat.defaultEn,
				fa: cat.defaultFa
			};
		}
		errorMessages = defaults;
	};

	const hasChanges = () => {
		return JSON.stringify(errorMessages) !== JSON.stringify(savedConfig ?? {});
	};

	const isEmpty = (value: string | undefined | null): boolean => {
		return value === undefined || value === null || value.trim() === '';
	};

	onMount(async () => {
		await tick();
		await loadConfig();
	});
</script>

<form
	class="flex h-full flex-col justify-between text-sm"
	on:submit|preventDefault={saveHandler}
>
	<h2 class="text-sm font-medium text-gray-900 dark:text-white mb-4">
		{$i18n.t('settings.admin.errorMessages.title')}
	</h2>

	<p class="text-[0.6875rem] text-gray-400 dark:text-gray-600 mb-6">
		{$i18n.t('settings.admin.errorMessages.description')}
	</p>

	<div class="flex-1 min-h-0 overflow-y-auto scrollbar-hover pr-1.5">
		<AdminSettingSection first title={$i18n.t('settings.admin.errorMessages.sections.messages.title')}>
			{#each ERROR_CATEGORIES as category}
				<AdminSettingField
					label={category.label}
					description={category.description}
				>
					<div class="grid grid-cols-2 gap-4">
						<div class="flex flex-col gap-2">
							<label class="text-[0.625rem] text-gray-500 dark:text-gray-400">
								{$i18n.t('settings.admin.errorMessages.fields.persian.label')}
							</label>
							<Textarea
								bind:value={errorMessages[category.key]?.fa ?? ''}
								placeholder={category.defaultFa}
								maxSize={500}
								className="w-full"
							/>
						</div>
						<div class="flex flex-col gap-2">
							<label class="text-[0.625rem] text-gray-500 dark:text-gray-400">
								{$i18n.t('settings.admin.errorMessages.fields.english.label')}
							</label>
							<Textarea
								bind:value={errorMessages[category.key]?.en ?? ''}
								placeholder={category.defaultEn}
								maxSize={500}
								className="w-full"
							/>
						</div>
						<button
							type="button"
							class="shrink-0 text-[0.625rem] text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
							on:click={() => resetCategory(category.key)}
						>
							{$i18n.t('settings.admin.errorMessages.buttons.resetToDefault')}
						</button>
					</div>
				</AdminSettingField>
			{/each}
		</AdminSettingSection>
	</div>

	<div class="flex justify-end pt-6 text-sm font-normal">
		<button
			type="button"
			class="h-7 shrink-0 items-center justify-center gap-1.5 rounded-lg px-2.5 text-xs font-normal text-gray-600 transition hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/[0.04]"
			:disabled={!hasChanges() || saving}
			on:click={resetAll}
		>
			{$i18n.t('settings.admin.errorMessages.buttons.resetAll')}
		</button>
		<button
			type="submit"
			class="h-7 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-gray-900 px-2.5 text-xs font-normal text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white"
			:disabled={!hasChanges() || saving}
		>
			{$i18n.t('Save')}
			{#if saving}
				<span class="shrink-0 size-3">
					<svg
						aria-hidden="true"
						class="animate-spin"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
					>
						<circle
							class="opacity-25"
							cx="12"
							cy="12"
							r="10"
							stroke="currentColor"
							stroke-width="4"
						></circle>
						<path
							class="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						></path>
					</svg>
				</span>
			{/if}
		</button>
	</div>
</form>
