# OptiFit

Мобильное приложение-дневник тренировок на Vue 3 + TypeScript + Quasar + Pinia.

## Запуск в обычном браузере

```bash
npm install
npm run dev
```

Откройте адрес из Vite (обычно `http://localhost:9000`).

## Сборка

```bash
npm run build
```

## Telegram Mini App

Приложение поддерживает запуск внутри Telegram Mini App без backend-авторизации:

- данные тренировок по-прежнему хранятся локально в `localStorage`;
- Telegram используется только как UI-контекст (профиль пользователя + тема);
- при отсутствии Telegram SDK приложение работает как обычный веб-клиент.

### Как проверить в Telegram

1. Опубликуйте фронтенд по HTTPS URL (локальный `localhost` Telegram не откроет).
2. В BotFather настройте Mini App URL вашего бота.
3. Откройте Mini App из Telegram.
4. Убедитесь, что в шапке отображается пользователь и бейдж `Telegram Mini App`.

### Какие поля пользователя доступны только в Mini App

При запуске в Telegram доступны поля из `WebApp.initDataUnsafe.user`:

- `id`
- `username`
- `first_name`
- `last_name`
- `language_code`
- `photo_url`

В обычном браузере эти данные недоступны, в интерфейсе показывается fallback `Гость`.

## Capacitor (опционально)

```bash
npm run build
npx cap sync
npx cap open android
```
