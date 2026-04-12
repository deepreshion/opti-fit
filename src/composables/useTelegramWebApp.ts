import { ref } from 'vue';

const TELEGRAM_WEBAPP_SDK_URL = 'https://telegram.org/js/telegram-web-app.js';
const TELEGRAM_SDK_TIMEOUT_MS = 3000;

let telegramSdkLoader: Promise<void> | null = null;

export interface TelegramUserProfile {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  languageCode: string;
  photoUrl: string;
}

const toTelegramUserProfile = (user: TelegramWebAppUser | undefined): TelegramUserProfile | null => {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    username: user.username ?? '',
    firstName: user.first_name ?? '',
    lastName: user.last_name ?? '',
    languageCode: user.language_code ?? '',
    photoUrl: user.photo_url ?? '',
  };
};

const isClientEnvironment = () => typeof window !== 'undefined' && typeof document !== 'undefined';

const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      reject(new Error('Telegram SDK load timeout'));
    }, timeoutMs);

    promise
      .then((result) => {
        window.clearTimeout(timeoutId);
        resolve(result);
      })
      .catch((error: unknown) => {
        window.clearTimeout(timeoutId);
        reject(error);
      });
  });

const loadTelegramSdk = async () => {
  if (!isClientEnvironment()) {
    return;
  }

  if (window.Telegram?.WebApp) {
    return;
  }

  if (!telegramSdkLoader) {
    telegramSdkLoader = new Promise<void>((resolve, reject) => {
      const existingScript = document.querySelector<HTMLScriptElement>(
        `script[src="${TELEGRAM_WEBAPP_SDK_URL}"]`,
      );

      if (existingScript) {
        if (window.Telegram?.WebApp) {
          resolve();
          return;
        }

        existingScript.addEventListener('load', () => resolve(), { once: true });
        existingScript.addEventListener('error', () => reject(new Error('Telegram SDK load failed')), { once: true });
        return;
      }

      const script = document.createElement('script');
      script.src = TELEGRAM_WEBAPP_SDK_URL;
      script.async = true;
      script.defer = true;
      script.addEventListener('load', () => resolve(), { once: true });
      script.addEventListener('error', () => reject(new Error('Telegram SDK load failed')), { once: true });
      document.head.appendChild(script);
    }).catch((error: unknown) => {
      telegramSdkLoader = null;
      throw error;
    });
  }

  await withTimeout(telegramSdkLoader, TELEGRAM_SDK_TIMEOUT_MS);
};

const applyTelegramTheme = (themeParams: TelegramWebAppThemeParams | undefined) => {
  if (!isClientEnvironment()) {
    return;
  }

  const root = document.documentElement;

  if (!themeParams) {
    root.removeAttribute('data-tg-theme');
    root.removeAttribute('data-tg-color-scheme');
    return;
  }

  const setVar = (name: string, value: string | undefined) => {
    if (value) {
      root.style.setProperty(name, value);
    }
  };

  setVar('--tg-theme-bg-color', themeParams.bg_color);
  setVar('--tg-theme-secondary-bg-color', themeParams.secondary_bg_color);
  setVar('--tg-theme-text-color', themeParams.text_color);
  setVar('--tg-theme-hint-color', themeParams.hint_color);
  setVar('--tg-theme-primary-color', themeParams.button_color ?? themeParams.link_color);
  root.setAttribute('data-tg-theme', 'active');
};

export const useTelegramWebApp = () => {
  const isTelegram = ref(false);
  const webApp = ref<TelegramWebApp | null>(null);
  const tgUser = ref<TelegramUserProfile | null>(null);
  const initData = ref('');
  const colorScheme = ref<TelegramWebApp['colorScheme'] | null>(null);
  const themeParams = ref<TelegramWebAppThemeParams | null>(null);

  const initialize = async () => {
    if (!isClientEnvironment()) {
      return;
    }

    try {
      await loadTelegramSdk();
    } catch {
      // Outside Telegram Mini App the SDK may be unavailable; this is an expected fallback.
    }

    const nextWebApp = window.Telegram?.WebApp ?? null;

    if (!nextWebApp) {
      isTelegram.value = false;
      webApp.value = null;
      tgUser.value = null;
      initData.value = '';
      colorScheme.value = null;
      themeParams.value = null;
      applyTelegramTheme(undefined);
      return;
    }

    try {
      nextWebApp.ready();
      nextWebApp.expand();
    } catch {
      // Keep a graceful fallback if ready/expand throws in non-standard environments.
    }

    isTelegram.value = true;
    webApp.value = nextWebApp;
    tgUser.value = toTelegramUserProfile(nextWebApp.initDataUnsafe.user);
    initData.value = nextWebApp.initData ?? '';
    colorScheme.value = nextWebApp.colorScheme ?? null;
    themeParams.value = nextWebApp.themeParams ?? null;
    if (colorScheme.value) {
      document.documentElement.setAttribute('data-tg-color-scheme', colorScheme.value);
    } else {
      document.documentElement.removeAttribute('data-tg-color-scheme');
    }

    applyTelegramTheme(themeParams.value ?? undefined);
  };

  return {
    isTelegram,
    webApp,
    tgUser,
    initData,
    colorScheme,
    themeParams,
    initialize,
  };
};
