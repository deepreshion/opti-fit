<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import {
  buildMonthHeatmap,
  getMonthlyStats,
  getStatsMetricMax,
  getStatsMetricValue,
  getWeeklyStats,
  type StatsMetricKey,
  type WorkoutDayStat,
} from 'src/services/stats/workout-stats';
import { useWorkoutsStore } from 'src/stores/workouts';
import { formatDisplayDate, getTodayIsoDate } from 'src/utils/date';

const router = useRouter();
const workoutsStore = useWorkoutsStore();
const selectedMetric = ref<StatsMetricKey>('sessions');
const selectedWeeklyDate = ref(workoutsStore.selectedDate || getTodayIsoDate());

const metricOptions: Array<{ label: string; value: StatsMetricKey; caption: string }> = [
  { label: 'Сессии', value: 'sessions', caption: 'Количество тренировок' },
  { label: 'Минуты', value: 'minutes', caption: 'Общее время активности' },
  { label: 'Калории', value: 'calories', caption: 'Сожжённые калории' },
];

const typeMeta = {
  strength: {
    label: 'Силовые',
    icon: 'fitness_center',
    className: 'statistics-page__type-card--strength',
  },
  cardio: {
    label: 'Кардио',
    icon: 'monitor_heart',
    className: 'statistics-page__type-card--cardio',
  },
  sport: {
    label: 'Спорт',
    icon: 'sports_soccer',
    className: 'statistics-page__type-card--sport',
  },
} as const;

const anchorDate = computed(() => workoutsStore.selectedDate || getTodayIsoDate());
const weeklyStats = computed(() => getWeeklyStats(workoutsStore.workouts, anchorDate.value));
const monthlyStats = computed(() => getMonthlyStats(workoutsStore.workouts, anchorDate.value));
const monthHeatmap = computed(() => buildMonthHeatmap(monthlyStats.value.days, anchorDate.value));

const weeklyMetricMax = computed(() => getStatsMetricMax(weeklyStats.value.days, selectedMetric.value));
const monthlyMetricMax = computed(() => getStatsMetricMax(monthlyStats.value.days, selectedMetric.value));
const weekdayMetricMax = computed(() =>
  Math.max(
    0,
    ...monthlyStats.value.weekdayRhythm.map((day) =>
      selectedMetric.value === 'minutes'
        ? day.minutes
        : selectedMetric.value === 'calories'
          ? day.calories
          : day.sessions,
    ),
  ),
);

const weekOverviewCards = computed(() => [
  {
    label: 'Тренировок',
    value: weeklyStats.value.totalWorkouts,
    caption: `за ${weeklyStats.value.subtitle}`,
  },
  {
    label: 'Активных дней',
    value: weeklyStats.value.activeDays,
    caption: `${weeklyStats.value.completionRate}% недели`,
  },
  {
    label: 'Минут',
    value: weeklyStats.value.totalMinutes,
    caption: 'в кардио и спорте',
  },
  {
    label: 'Ккал',
    value: weeklyStats.value.totalCalories,
    caption: 'по заполненным данным',
  },
]);

const monthOverviewCards = computed(() => [
  {
    label: 'Тренировок',
    value: monthlyStats.value.totalWorkouts,
    caption: monthlyStats.value.subtitle,
  },
  {
    label: 'Активных дней',
    value: monthlyStats.value.activeDays,
    caption: `${monthlyStats.value.completionRate}% месяца`,
  },
  {
    label: 'Подходов',
    value: monthlyStats.value.totalSets,
    caption: 'силовая нагрузка',
  },
  {
    label: 'Км',
    value: monthlyStats.value.totalDistance.toFixed(1),
    caption: 'кардио-дистанция',
  },
]);

const selectedWeekDay = computed<WorkoutDayStat | null>(() => {
  const day = weeklyStats.value.days.find((item) => item.date === selectedWeeklyDate.value);

  if (day) {
    return day;
  }

  return weeklyStats.value.days.find((item) => item.workoutCount > 0) ?? weeklyStats.value.days[0] ?? null;
});

const monthTypeItems = computed(() => {
  const total = monthlyStats.value.totalWorkouts || 1;

  return (Object.keys(typeMeta) as Array<keyof typeof typeMeta>).map((type) => ({
    ...typeMeta[type],
    value: monthlyStats.value.typeTotals[type],
    share: Math.round((monthlyStats.value.typeTotals[type] / total) * 100),
  }));
});

watch(
  anchorDate,
  (nextDate) => {
    selectedWeeklyDate.value = nextDate;
  },
  { immediate: true },
);

onMounted(async () => {
  if (!workoutsStore.isLoaded) {
    await workoutsStore.loadWorkouts();
  }
});

const goBackHome = () => {
  router.push({ name: 'home' });
};

const openCreateWorkout = () => {
  router.push({
    name: 'workout-create',
    query: {
      date: workoutsStore.selectedDate || getTodayIsoDate(),
    },
  });
};

const metricValueLabel = (value: number, metric: StatsMetricKey) => {
  if (metric === 'minutes') {
    return `${value} мин`;
  }

  if (metric === 'calories') {
    return `${value} ккал`;
  }

  return `${value}`;
};

const getBarHeight = (value: number, maxValue: number) => {
  if (maxValue <= 0) {
    return '10%';
  }

  return `${Math.max(10, Math.round((value / maxValue) * 100))}%`;
};

const getHeatLevel = (day: WorkoutDayStat) => {
  const maxValue = monthlyMetricMax.value;
  const value = getStatsMetricValue(day, selectedMetric.value);

  if (value <= 0 || maxValue <= 0) {
    return 0;
  }

  const ratio = value / maxValue;

  if (ratio >= 0.8) {
    return 4;
  }

  if (ratio >= 0.55) {
    return 3;
  }

  if (ratio >= 0.3) {
    return 2;
  }

  return 1;
};

const getWeekdayBarHeight = (value: number) => {
  if (weekdayMetricMax.value <= 0) {
    return '12%';
  }

  return `${Math.max(12, Math.round((value / weekdayMetricMax.value) * 100))}%`;
};

const getWeekdayMetricValue = (day: (typeof monthlyStats.value.weekdayRhythm)[number]) => {
  if (selectedMetric.value === 'minutes') {
    return day.minutes;
  }

  if (selectedMetric.value === 'calories') {
    return day.calories;
  }

  return day.sessions;
};
</script>

<template>
  <q-page class="statistics-page">
    <div class="statistics-page__content">
      <section class="statistics-hero">
        <div class="statistics-hero__text">
          <p class="statistics-hero__eyebrow">Аналитика</p>
          <h1 class="statistics-hero__title">Статистика тренировок</h1>
          <p class="statistics-hero__description">
            Недельный и месячный срез по выбранной дате:
            <strong>{{ formatDisplayDate(anchorDate) }}</strong>
          </p>
        </div>

        <div class="statistics-hero__actions">
          <q-btn flat round icon="calendar_month" aria-label="К календарю" @click="goBackHome" />
        </div>
      </section>

      <template v-if="workoutsStore.isLoaded && workoutsStore.workouts.length === 0">
        <section class="statistics-empty">
          <q-icon name="insights" size="36px" color="primary" />
          <div>
            <h2 class="statistics-empty__title">Пока не хватает данных для аналитики</h2>
            <p class="statistics-empty__text">
              Добавьте несколько тренировок, и здесь появятся графики нагрузки, ритм по дням недели и лучшие паттерны.
            </p>
          </div>
          <q-btn no-caps rounded unelevated color="primary" label="Добавить первую тренировку" @click="openCreateWorkout" />
        </section>
      </template>

      <template v-else>
        <section class="statistics-overview">
          <article class="statistics-card statistics-card--week">
            <div class="statistics-card__header">
              <div>
                <p class="statistics-card__eyebrow">Неделя</p>
                <h2 class="statistics-card__title">{{ weeklyStats.subtitle }}</h2>
              </div>
            </div>

            <div class="statistics-card__metrics">
              <div v-for="card in weekOverviewCards" :key="card.label" class="statistics-mini-stat">
                <p class="statistics-mini-stat__label">{{ card.label }}</p>
                <p class="statistics-mini-stat__value">{{ card.value }}</p>
                <p class="statistics-mini-stat__caption">{{ card.caption }}</p>
              </div>
            </div>
          </article>

          <article class="statistics-card statistics-card--month">
            <div class="statistics-card__header">
              <div>
                <p class="statistics-card__eyebrow">Месяц</p>
                <h2 class="statistics-card__title">{{ monthlyStats.subtitle }}</h2>
              </div>
            </div>

            <div class="statistics-card__metrics">
              <div v-for="card in monthOverviewCards" :key="card.label" class="statistics-mini-stat">
                <p class="statistics-mini-stat__label">{{ card.label }}</p>
                <p class="statistics-mini-stat__value">{{ card.value }}</p>
                <p class="statistics-mini-stat__caption">{{ card.caption }}</p>
              </div>
            </div>
          </article>
        </section>

<!--        <section class="statistics-card statistics-card&#45;&#45;filters">-->
<!--          <div class="statistics-card__header">-->
<!--            <div>-->
<!--              <p class="statistics-card__eyebrow">Фокус метрики</p>-->
<!--              <h2 class="statistics-card__title">Что смотреть на графиках</h2>-->
<!--            </div>-->
<!--          </div>-->

<!--          <div class="statistics-segments" role="tablist" aria-label="Выбор метрики для графиков">-->
<!--            <button-->
<!--              v-for="option in metricOptions"-->
<!--              :key="option.value"-->
<!--              type="button"-->
<!--              class="statistics-segments__option"-->
<!--              :class="{ 'statistics-segments__option&#45;&#45;active': selectedMetric === option.value }"-->
<!--              :aria-pressed="selectedMetric === option.value"-->
<!--              @click="selectedMetric = option.value"-->
<!--            >-->
<!--              <span>{{ option.label }}</span>-->
<!--              <small>{{ option.caption }}</small>-->
<!--            </button>-->
<!--          </div>-->
<!--        </section>-->

<!--        <section class="statistics-card">-->
<!--          <div class="statistics-card__header">-->
<!--            <div>-->
<!--              <p class="statistics-card__eyebrow">Неделя</p>-->
<!--              <h2 class="statistics-card__title">Динамика по дням</h2>-->
<!--            </div>-->
<!--            <p class="statistics-card__subtitle">{{ weeklyStats.subtitle }}</p>-->
<!--          </div>-->

<!--          <div class="weekly-chart">-->
<!--            <button-->
<!--              v-for="day in weeklyStats.days"-->
<!--              :key="day.date"-->
<!--              type="button"-->
<!--              class="weekly-chart__day"-->
<!--              :class="{-->
<!--                'weekly-chart__day&#45;&#45;active': selectedWeekDay?.date === day.date,-->
<!--                'weekly-chart__day&#45;&#45;today': day.isToday,-->
<!--              }"-->
<!--              @click="selectedWeeklyDate = day.date"-->
<!--            >-->
<!--              <span class="weekly-chart__weekday">{{ day.weekdayLabel }}</span>-->
<!--              <div class="weekly-chart__track">-->
<!--                <span-->
<!--                  class="weekly-chart__fill"-->
<!--                  :style="{ height: getBarHeight(getStatsMetricValue(day, selectedMetric), weeklyMetricMax) }"-->
<!--                />-->
<!--              </div>-->
<!--              <span class="weekly-chart__value">{{ metricValueLabel(getStatsMetricValue(day, selectedMetric), selectedMetric) }}</span>-->
<!--            </button>-->
<!--          </div>-->

<!--          <div v-if="selectedWeekDay" class="weekly-focus">-->
<!--            <div class="weekly-focus__head">-->
<!--              <div>-->
<!--                <p class="statistics-card__eyebrow">Выбранный день</p>-->
<!--                <h3 class="weekly-focus__title">{{ formatDisplayDate(selectedWeekDay.date) }}</h3>-->
<!--              </div>-->
<!--              <q-chip square class="weekly-focus__metric">-->
<!--                {{ selectedWeekDay.workoutCount }} трен.-->
<!--              </q-chip>-->
<!--            </div>-->

<!--            <div class="weekly-focus__stats">-->
<!--              <div class="weekly-focus__stat">-->
<!--                <span>Минуты</span>-->
<!--                <strong>{{ selectedWeekDay.minutes }}</strong>-->
<!--              </div>-->
<!--              <div class="weekly-focus__stat">-->
<!--                <span>Калории</span>-->
<!--                <strong>{{ selectedWeekDay.calories }}</strong>-->
<!--              </div>-->
<!--              <div class="weekly-focus__stat">-->
<!--                <span>Подходы</span>-->
<!--                <strong>{{ selectedWeekDay.sets }}</strong>-->
<!--              </div>-->
<!--              <div class="weekly-focus__stat">-->
<!--                <span>Км</span>-->
<!--                <strong>{{ selectedWeekDay.distance.toFixed(1) }}</strong>-->
<!--              </div>-->
<!--            </div>-->
<!--          </div>-->
<!--        </section>-->

        <section class="statistics-split">
          <article class="statistics-card">
            <div class="statistics-card__header">
              <div>
                <p class="statistics-card__eyebrow">Баланс типов</p>
                <h2 class="statistics-card__title">Чем заполнен месяц</h2>
              </div>
            </div>

            <div class="statistics-stack">
              <span
                v-for="item in monthTypeItems"
                :key="item.label"
                class="statistics-stack__segment"
                :class="item.className"
                :style="{ flexGrow: Math.max(item.value, 0.45) }"
              />
            </div>

            <div class="statistics-type-list">
              <div v-for="item in monthTypeItems" :key="item.label" class="statistics-type-card" :class="item.className">
                <div class="statistics-type-card__head">
                  <q-icon :name="item.icon" size="20px" />
                  <span>{{ item.label }}</span>
                </div>
                <strong>{{ item.value }}</strong>
                <small>{{ item.share }}% месяца</small>
              </div>
            </div>
          </article>

          <article class="statistics-card">
            <div class="statistics-card__header">
              <div>
                <p class="statistics-card__eyebrow">Ритм</p>
                <h2 class="statistics-card__title">По дням недели</h2>
              </div>
            </div>

            <div class="weekday-chart">
              <div v-for="day in monthlyStats.weekdayRhythm" :key="day.key" class="weekday-chart__item">
                <div class="weekday-chart__track">
                  <span class="weekday-chart__fill" :style="{ height: getWeekdayBarHeight(getWeekdayMetricValue(day)) }" />
                </div>
                <strong>{{ day.label }}</strong>
                <small>{{ metricValueLabel(getWeekdayMetricValue(day), selectedMetric) }}</small>
              </div>
            </div>
          </article>
        </section>

        <section>
          <article class="statistics-card">
            <div class="statistics-card__header">
              <div>
                <p class="statistics-card__eyebrow">Чаще всего</p>
                <h2 class="statistics-card__title">Повторяющиеся активности</h2>
              </div>
            </div>

            <div v-if="monthlyStats.topEntries.length > 0" class="statistics-top-list">
              <div v-for="entry in monthlyStats.topEntries" :key="`${entry.type}-${entry.label}`" class="statistics-top-item">
                <q-icon :name="typeMeta[entry.type].icon" size="18px" />
                <span>{{ entry.label }}</span>
                <strong>{{ entry.count }}×</strong>
              </div>
            </div>
            <p v-else class="statistics-card__subtitle">
              Заполните названия активностей и упражнений, и здесь появятся повторяющиеся паттерны.
            </p>
          </article>
        </section>
      </template>
    </div>
  </q-page>
</template>

<style scoped lang="scss">
@use 'src/styles/quasar-variables' as *;

.statistics-page {
  padding: 10px 12px 24px;
}

.statistics-page__content {
  display: grid;
  gap: 12px;
  max-width: 760px;
  margin: 0 auto;
}

.statistics-hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 4px 2px 0;
}

.statistics-hero__text {
  min-width: 0;
  flex: 1;
}

.statistics-hero__eyebrow,
.statistics-card__eyebrow {
  margin: 0 0 6px;
  color: #64748b;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.statistics-hero__title,
.statistics-card__title {
  margin: 0;
  color: #0f172a;
  font-size: 1.28rem;
  line-height: 1.06;
  font-weight: 900;
}

.statistics-hero__description,
.statistics-card__subtitle {
  margin: 8px 0 0;
  color: #64748b;
  font-size: 0.9rem;
  line-height: 1.45;
}

.statistics-hero__actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.statistics-card,
.statistics-empty {
  padding: 16px;
  border-radius: 28px;
  background:
    radial-gradient(circle at top right, rgba(20, 184, 166, 0.08), transparent 38%),
    rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(15, 23, 42, 0.06);
  box-shadow: 0 16px 36px rgba(15, 23, 42, 0.06);
}

.statistics-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.statistics-overview,
.statistics-split {
  display: grid;
  gap: 12px;
}

.statistics-card--week {
  background:
    radial-gradient(circle at top right, rgba(0, 129, 167, 0.14), transparent 42%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(245, 250, 255, 0.96));
}

.statistics-card--month {
  background:
    radial-gradient(circle at top right, rgba(21, 101, 192, 0.14), transparent 42%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(244, 247, 255, 0.96));
}

.statistics-card__metrics {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.statistics-mini-stat {
  display: grid;
  grid-template-rows: auto auto 1fr;
  gap: 4px;
  align-content: stretch;
  justify-items: start;
  min-height: 104px;
  padding: 10px 12px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(15, 23, 42, 0.05);
}

.statistics-mini-stat__label {
  margin: 0;
  color: #64748b;
  font-size: 0.76rem;
  font-weight: 700;
}

.statistics-mini-stat__value {
  margin: 2px 0 0;
  min-height: 1.1em;
  display: inline-flex;
  align-items: flex-end;
  color: #0f172a;
  font-size: 1.1rem;
  line-height: 1;
  font-weight: 900;
}

.statistics-mini-stat__caption {
  margin-top: auto;
  color: #64748b;
  font-size: 0.72rem;
  line-height: 1.28;
}

.statistics-card--week .statistics-card__header,
.statistics-card--month .statistics-card__header {
  margin-bottom: 10px;
}

.statistics-card--week .statistics-card__title,
.statistics-card--month .statistics-card__title {
  font-size: 1.1rem;
}

.statistics-card--week .statistics-card__eyebrow,
.statistics-card--month .statistics-card__eyebrow {
  margin-bottom: 4px;
}

.statistics-segments {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.statistics-segments__option {
  display: grid;
  gap: 2px;
  padding: 12px 10px;
  border: none;
  border-radius: 18px;
  background: rgba(15, 23, 42, 0.05);
  color: #526277;
  font: inherit;
  text-align: left;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    background-color 0.18s ease;
}

.statistics-segments__option span {
  font-size: 0.94rem;
  font-weight: 800;
}

.statistics-segments__option small {
  color: inherit;
  font-size: 0.72rem;
  line-height: 1.3;
}

.statistics-segments__option--active {
  background: linear-gradient(180deg, rgba(0, 129, 167, 0.16), rgba(0, 129, 167, 0.08));
  color: #005c75;
  box-shadow: 0 10px 22px rgba(0, 129, 167, 0.14);
}

.weekly-chart,
.weekday-chart {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 8px;
}

.weekly-chart__day {
  display: grid;
  gap: 8px;
  border: none;
  padding: 0;
  background: transparent;
  color: inherit;
  font: inherit;
}

.weekly-chart__weekday,
.weekly-chart__value,
.weekday-chart__item small {
  text-align: center;
}

.weekly-chart__weekday {
  color: #64748b;
  font-size: 0.74rem;
  font-weight: 700;
}

.weekly-chart__track,
.weekday-chart__track {
  position: relative;
  height: 156px;
  border-radius: 20px;
  background: rgba(15, 23, 42, 0.05);
  overflow: hidden;
}

.weekly-chart__fill,
.weekday-chart__fill {
  position: absolute;
  inset-inline: 0;
  bottom: 0;
  border-radius: 18px 18px 0 0;
  background: linear-gradient(180deg, #1aa3d1 0%, #007ea3 100%);
}

.weekly-chart__value {
  color: #0f172a;
  font-size: 0.72rem;
  font-weight: 700;
  line-height: 1.25;
}

.weekly-chart__day--active .weekly-chart__track {
  outline: 2px solid rgba(0, 129, 167, 0.35);
  background: rgba(0, 129, 167, 0.09);
}

.weekly-chart__day--today .weekly-chart__weekday {
  color: #005c75;
}

.weekly-focus {
  display: grid;
  gap: 12px;
  margin-top: 14px;
  padding: 14px;
  border-radius: 22px;
  background: rgba(247, 250, 252, 0.96);
}

.weekly-focus__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.weekly-focus__title,
.statistics-peak__title,
.statistics-empty__title {
  margin: 0;
  color: #0f172a;
  font-size: 1.04rem;
  font-weight: 800;
}

.weekly-focus__metric {
  background: rgba(0, 129, 167, 0.12);
  color: #005c75;
  font-weight: 800;
}

.weekly-focus__stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.weekly-focus__stat {
  display: grid;
  gap: 6px;
  padding: 12px;
  border-radius: 18px;
  background: #ffffff;
  border: 1px solid rgba(15, 23, 42, 0.05);
}

.weekly-focus__stat span {
  color: #64748b;
  font-size: 0.8rem;
  font-weight: 700;
}

.weekly-focus__stat strong {
  color: #0f172a;
  font-size: 1.08rem;
  font-weight: 900;
}

.statistics-peak {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-top: 14px;
  padding: 14px;
  border-radius: 20px;
  background: rgba(0, 129, 167, 0.08);
}

.statistics-peak__stats {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.statistics-peak__stats span {
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.8);
  color: #005c75;
  font-size: 0.75rem;
  font-weight: 800;
}

.statistics-stack {
  display: flex;
  gap: 6px;
  height: 14px;
  margin-bottom: 14px;
}

.statistics-stack__segment {
  min-width: 10px;
  border-radius: 999px;
}

.statistics-type-list {
  display: grid;
  gap: 10px;
}

.statistics-type-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 18px;
  color: #0f172a;
}

.statistics-type-card__head {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 800;
}

.statistics-type-card strong {
  font-size: 1.1rem;
  font-weight: 900;
}

.statistics-type-card small {
  color: inherit;
  opacity: 0.76;
  font-size: 0.76rem;
}

.statistics-page__type-card--strength,
.statistics-stack__segment.statistics-page__type-card--strength {
  background: $workout-strength-surface;
  color: $workout-strength-color;
}

.statistics-page__type-card--cardio,
.statistics-stack__segment.statistics-page__type-card--cardio {
  background: $workout-cardio-surface;
  color: $workout-cardio-color;
}

.statistics-page__type-card--sport,
.statistics-stack__segment.statistics-page__type-card--sport {
  background: $workout-sport-surface;
  color: $workout-sport-color;
}

.weekday-chart__item {
  display: grid;
  gap: 8px;
}

.weekday-chart__item strong {
  color: #0f172a;
  font-size: 0.76rem;
  text-align: center;
}

.statistics-top-list {
  display: grid;
  gap: 10px;
}

.statistics-top-item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 18px;
  background: rgba(15, 23, 42, 0.04);
}

.statistics-top-item span {
  min-width: 0;
  color: #0f172a;
  font-weight: 700;
}

.statistics-top-item strong {
  color: #005c75;
  font-weight: 900;
}

.statistics-empty {
  display: grid;
  gap: 14px;
  justify-items: start;
}

.statistics-empty__text {
  margin: 8px 0 0;
  color: #64748b;
  line-height: 1.45;
}

@media (min-width: 680px) {
  .statistics-overview,
  .statistics-split {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 520px) {
  .statistics-page {
    padding: 8px 10px 18px;
  }

  .statistics-page__content {
    gap: 10px;
  }

  .statistics-card,
  .statistics-empty {
    padding: 14px;
    border-radius: 24px;
  }

  .statistics-hero {
    gap: 10px;
  }

  .statistics-hero__title,
  .statistics-card__title {
    font-size: 1.1rem;
  }

  .statistics-card__metrics,
  .weekly-focus__stats {
    grid-template-columns: 1fr;
  }

  .statistics-card--week .statistics-card__metrics,
  .statistics-card--month .statistics-card__metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 6px;
  }

  .statistics-segments {
    grid-template-columns: 1fr;
  }

  .statistics-mini-stat {
    min-height: 88px;
    padding: 9px 10px;
    border-radius: 14px;
  }

  .statistics-mini-stat__label {
    font-size: 0.72rem;
  }

  .statistics-mini-stat__value {
    font-size: 1rem;
  }

  .statistics-mini-stat__caption {
    font-size: 0.68rem;
  }

  .weekly-chart,
  .weekday-chart {
    gap: 6px;
  }

  .weekly-chart__track,
  .weekday-chart__track {
    height: 132px;
    border-radius: 16px;
  }

  .statistics-peak {
    display: grid;
  }

  .statistics-peak__stats {
    justify-content: flex-start;
  }
}
</style>
