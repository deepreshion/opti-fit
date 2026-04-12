import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { useTelegramWebApp, type TelegramUserProfile } from 'src/composables/useTelegramWebApp';

export const useTelegramSessionStore = defineStore('telegram-session', () => {
  const isTelegram = ref(false);
  const tgUser = ref<TelegramUserProfile | null>(null);
  const initData = ref('');
  const colorScheme = ref<TelegramWebApp['colorScheme'] | null>(null);
  const themeParams = ref<TelegramWebAppThemeParams | null>(null);
  const isReady = ref(false);

  const displayName = computed(() => {
    if (!tgUser.value) {
      return 'Гость';
    }

    if (tgUser.value.username) {
      return `@${tgUser.value.username}`;
    }

    return [tgUser.value.firstName, tgUser.value.lastName].filter(Boolean).join(' ') || 'Гость';
  });

  const initialize = async () => {
    if (isReady.value) {
      return;
    }

    const telegram = useTelegramWebApp();
    await telegram.initialize();

    isTelegram.value = telegram.isTelegram.value;
    tgUser.value = telegram.tgUser.value;
    initData.value = telegram.initData.value;
    colorScheme.value = telegram.colorScheme.value;
    themeParams.value = telegram.themeParams.value;
    isReady.value = true;

    if (import.meta.env.DEV) {
      console.info(
        `[Telegram] initialized isTelegram=${isTelegram.value} userId=${tgUser.value?.id ?? 'none'}`,
      );
    }
  };

  return {
    isTelegram,
    tgUser,
    initData,
    colorScheme,
    themeParams,
    isReady,
    displayName,
    initialize,
  };
});
