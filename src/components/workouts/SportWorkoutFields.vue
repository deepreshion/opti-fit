<script setup lang="ts">
import type { SportSession } from 'src/types/workout';
import WorkoutNameField from './WorkoutNameField.vue';

defineProps<{
  sport: SportSession;
  sportSuggestions: string[];
}>();

const positiveNumberRule = (value: number) => value > 0 || 'Введите число больше нуля';
const nonNegativeRule = (value: number | null) => (value === null || value >= 0) || 'Введите число от 0';
</script>

<template>
  <q-card flat bordered class="sport-card">
    <q-card-section class="sport-card__header">
      <div>
        <p class="sport-card__eyebrow">Спорт</p>
        <h3 class="sport-card__title">{{ sport.sport || 'Новая спортивная тренировка' }}</h3>
      </div>
    </q-card-section>

    <q-card-section class="sport-card__content">
      <WorkoutNameField
        v-model="sport.sport"
        label="Вид спорта"
        :suggestions="sportSuggestions"
        required-message="Введите вид спорта"
      />

      <div class="sport-card__grid">
        <q-input
          v-model.number="sport.duration"
          outlined
          type="number"
          inputmode="numeric"
          label="Время"
          suffix="мин"
          :rules="[positiveNumberRule]"
          lazy-rules
        />
        <q-input
          v-model.number="sport.calories"
          outlined
          type="number"
          inputmode="numeric"
          label="Калории"
          suffix="ккал"
          :rules="[nonNegativeRule]"
          lazy-rules
        />
      </div>
    </q-card-section>
  </q-card>
</template>

<style scoped lang="scss">
.sport-card {
  border-radius: 24px;
  border-color: rgba(15, 23, 42, 0.08);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.92) 100%);
  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.05);
}

.sport-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.sport-card__eyebrow {
  margin: 0 0 4px;
  color: #64748b;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.sport-card__title {
  margin: 0;
  color: #0f172a;
  font-size: 1rem;
  line-height: 1;
  font-weight: 800;
}

.sport-card__content {
  display: grid;
  gap: 14px;
}

.sport-card__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.sport-card__grid :deep(.q-field__control) {
  min-height: 46px;
}

.sport-card__grid :deep(.q-field__native),
.sport-card__grid :deep(.q-field__input),
.sport-card__grid :deep(.q-field__label) {
  font-size: 0.86rem;
}

@media (max-width: 420px) {
  .sport-card__grid {
    gap: 6px;
  }
}
</style>
