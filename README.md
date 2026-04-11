# OptiFit

Мобильное MVP-приложение для учета тренировок на базе Vue 3, TypeScript, Quasar, Pinia и Capacitor.

## Структура

```text
opti-fit/
├── capacitor.config.ts
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── src/
│   ├── App.vue
│   ├── main.ts
│   ├── env.d.ts
│   ├── layouts/
│   │   └── MainLayout.vue
│   ├── pages/
│   │   ├── HomePage.vue
│   │   └── WorkoutEditorPage.vue
│   ├── components/
│   │   ├── calendar/
│   │   │   └── WorkoutCalendar.vue
│   │   └── workouts/
│   │       ├── DayWorkoutsPanel.vue
│   │       ├── ExerciseFieldset.vue
│   │       ├── WorkoutCard.vue
│   │       └── WorkoutForm.vue
│   ├── composables/
│   │   └── useCalendar.ts
│   ├── router/
│   │   ├── index.ts
│   │   └── routes.ts
│   ├── services/
│   │   └── storage/
│   │       ├── local-workout-storage.ts
│   │       └── workout-storage.ts
│   ├── stores/
│   │   └── workouts.ts
│   ├── styles/
│   │   ├── app.scss
│   │   └── quasar-variables.scss
│   ├── types/
│   │   └── workout.ts
│   └── utils/
│       ├── date.ts
│       └── id.ts
```

## Запуск

```bash
npm install
npm run dev
```

## Capacitor

```bash
npm run build
npx cap sync
npx cap open android
```
