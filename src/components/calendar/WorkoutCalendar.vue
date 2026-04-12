<script setup lang="ts">
import { useWorkoutsStore } from 'src/stores/workouts';
import { useCalendar } from 'src/composables/useCalendar';

const workoutsStore = useWorkoutsStore();
const { weekDayLabels, monthLabel, canGoNextMonth, calendarGrid, goToPreviousMonth, goToNextMonth } = useCalendar();
</script>

<template>
  <section class="calendar-card">
    <div class="calendar-card__header">
      <div>
        <h3 class="calendar-card__title">{{ monthLabel }}</h3>
      </div>

      <div class="calendar-card__actions">
        <q-btn round flat icon="chevron_left" size="md" aria-label="Предыдущий месяц" @click="goToPreviousMonth" />
        <q-btn
          round
          flat
          icon="chevron_right"
          size="md"
          aria-label="Следующий месяц"
          :disable="!canGoNextMonth"
          @click="goToNextMonth"
        />
      </div>
    </div>

    <div class="calendar-grid calendar-grid--labels">
      <span v-for="label in weekDayLabels" :key="label" class="calendar-grid__label">
        {{ label }}
      </span>
    </div>

    <div class="calendar-grid">
      <button
        v-for="day in calendarGrid"
        :key="day.isoDate"
        type="button"
        class="calendar-day"
        :class="{
          'calendar-day--muted': !day.isCurrentMonth,
          'calendar-day--selected': day.isSelected,
          'calendar-day--today': day.isToday,
          'calendar-day--marked': day.hasWorkout,
          'calendar-day--future': day.isFuture,
        }"
        :disabled="day.isFuture"
        @click="day.isFuture === false && workoutsStore.setSelectedDate(day.isoDate)"
      >
        <span class="calendar-day__number">{{ day.dayNumber }}</span>
        <span v-if="day.isToday" class="calendar-day__caption">сегодня</span>

        <span v-if="day.hasWorkout" class="calendar-day__markers" aria-hidden="true">
          <span v-if="day.hasStrengthWorkout" class="calendar-day__marker calendar-day__marker--strength"></span>
          <span v-if="day.hasCardioWorkout" class="calendar-day__marker calendar-day__marker--cardio"></span>
          <span v-if="day.hasSportWorkout" class="calendar-day__marker calendar-day__marker--sport"></span>
        </span>
      </button>
    </div>

    <div class="calendar-legend">
      <div class="calendar-legend__item">
        <span class="calendar-legend__dot calendar-legend__dot--strength"></span>
        <span>Силовая</span>
      </div>
      <div class="calendar-legend__item">
        <span class="calendar-legend__dot calendar-legend__dot--cardio"></span>
        <span>Кардио</span>
      </div>
      <div class="calendar-legend__item">
        <span class="calendar-legend__dot calendar-legend__dot--sport"></span>
        <span>Спорт</span>
      </div>
      <div class="calendar-legend__item">
        <span class="calendar-legend__outline"></span>
        <span>Сегодня</span>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
@use 'src/styles/quasar-variables' as *;

.calendar-card {
  padding: 16px;
  border-radius: 32px;
  background:
    radial-gradient(circle at top right, rgba(0, 129, 167, 0.12), transparent 35%),
    rgba(255, 255, 255, 0.94);
  box-shadow: 0 20px 46px rgba(15, 23, 42, 0.08);
}

.calendar-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.calendar-card__title {
  margin: 0;
  color: #0f172a;
  font-size: 1.22rem;
  line-height: 1;
  font-weight: 800;
  text-transform: capitalize;
  padding-top: 10px;
}

.calendar-card__actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 6px;
}

.calendar-grid--labels {
  margin-bottom: 8px;
}

.calendar-grid__label {
  text-align: center;
  color: rgba(15, 23, 42, 0.58);
  font-size: 0.72rem;
  font-weight: 700;
}

.calendar-day {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 54px;
  border: none;
  border-radius: 18px;
  background: rgba(253, 252, 220, 0.34);
  color: #0f172a;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;
}

.calendar-day:active {
  transform: scale(0.98);
}

.calendar-day:disabled {
  cursor: default;
}

.calendar-day--muted {
  color: rgba(15, 23, 42, 0.34);
  background: rgba(15, 23, 42, 0.05);
}

.calendar-day--future {
  color: rgba(15, 23, 42, 0.24);
  background: rgba(15, 23, 42, 0.04);
  box-shadow: none;
}

.calendar-day--today {
  box-shadow: inset 0 0 0 2px rgba(2, 132, 199, 0.45);
}

.calendar-day--selected {
  background: linear-gradient(180deg, #0081a7 0%, #006e8d 100%);
  color: #ffffff;
  box-shadow: 0 14px 24px rgba(0, 129, 167, 0.26);
}

.calendar-day__number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.calendar-day__caption {
  margin-top: 2px;
  font-size: 0.58rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  opacity: 0.72;
}

.calendar-day__markers {
  position: absolute;
  bottom: 7px;
  left: 50%;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transform: translateX(-50%);
}

.calendar-day__marker {
  width: 6px;
  height: 6px;
  border-radius: 999px;
}

.calendar-day__marker--strength {
  background: $workout-strength-color;
}

.calendar-day__marker--cardio {
  background: $workout-cardio-color;
}

.calendar-day__marker--sport {
  background: $workout-sport-color;
}

.calendar-day--selected .calendar-day__marker {
  background: #ffffff;
}

.calendar-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 14px;
  margin-top: 12px;
  color: rgba(15, 23, 42, 0.62);
  font-size: 0.76rem;
  font-weight: 600;
}

.calendar-legend__item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.calendar-legend__dot,
.calendar-legend__outline {
  width: 10px;
  height: 10px;
  border-radius: 999px;
}

.calendar-legend__dot--strength {
  background: $workout-strength-color;
}

.calendar-legend__dot--cardio {
  background: $workout-cardio-color;
}

.calendar-legend__dot--sport {
  background: $workout-sport-color;
}

.calendar-legend__outline {
  border: 2px solid rgba(2, 132, 199, 0.6);
  background: transparent;
}

@media (max-width: 420px) {
  .calendar-card {
    padding: 14px;
    border-radius: 26px;
  }

  .calendar-card__header {
    align-items: flex-start;
  }

  .calendar-card__title {
    font-size: 1.08rem;
  }

  .calendar-card__actions {
    gap: 0;
  }

  .calendar-card__actions :deep(.q-btn) {
    min-width: 36px;
    min-height: 36px;
  }

  .calendar-grid {
    gap: 4px;
  }

  .calendar-grid__label {
    font-size: 0.68rem;
  }

  .calendar-day {
    min-height: 46px;
    border-radius: 14px;
    font-size: 0.88rem;
  }

  .calendar-day__caption {
    display: none;
  }

  .calendar-day__markers {
    bottom: 5px;
  }
}
</style>
