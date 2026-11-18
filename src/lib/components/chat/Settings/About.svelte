<script lang="ts">
import { WEBUI_NAME } from '$lib/stores';
import { BEZIA_VERSION } from '$lib/constants';
import { getContext } from 'svelte';

import UserSettingRow from './UserSettingRow.svelte';
import UserSettingSection from './UserSettingSection.svelte';

const i18n: any = getContext('i18n');
</script>

<div id="tab-about" class="flex flex-col h-full justify-between text-sm">
<h2 class="text-sm font-medium text-gray-900 dark:text-white mb-4">
{$i18n.t('settings.personal.about.title')}
</h2>

<div class="flex-1 min-h-0 overflow-y-auto scrollbar-hover pr-1.5">
<UserSettingSection title={`${$WEBUI_NAME} Version`} first>
<UserSettingRow description={BEZIA_VERSION} />
</UserSettingSection>
</div>
</div>
