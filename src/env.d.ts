/// <reference types="vite/client" />

interface TelegramWebAppUser {
  id: number;
  is_bot?: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

interface TelegramWebAppInitDataUnsafe {
  user?: TelegramWebAppUser;
  [key: string]: unknown;
}

interface TelegramWebAppThemeParams {
  bg_color?: string;
  secondary_bg_color?: string;
  text_color?: string;
  hint_color?: string;
  link_color?: string;
  button_color?: string;
  button_text_color?: string;
}

interface TelegramWebApp {
  initData: string;
  initDataUnsafe: TelegramWebAppInitDataUnsafe;
  colorScheme?: 'light' | 'dark';
  themeParams: TelegramWebAppThemeParams;
  ready: () => void;
  expand: () => void;
}

interface TelegramGlobal {
  WebApp?: TelegramWebApp;
}

interface Window {
  Telegram?: TelegramGlobal;
}
