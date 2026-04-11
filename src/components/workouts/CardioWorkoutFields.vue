<script setup lang="ts">
import type { CardioExercise } from 'src/types/workout';

defineProps<{
  cardio: CardioExercise;
}>();

const requiredTextRule = (value: string) => value.trim().length > 0 || 'Введите значение';
const positiveNumberRule = (value: number) => value > 0 || 'Введите число больше нуля';
const nonNegativeRule = (value: number | null) => (value === null || value >= 0) || 'Введите число от 0';
</script>

<template>
  <q-card flat bordered class="cardio-card">
    <q-card-section class="cardio-card__header">
      <div>
        <p class="cardio-card__eyebrow">Кардио</p>
        <h3 class="cardio-card__title">{{ cardio.activity || 'Новая кардио-тренировка' }}</h3>
      </div>
    </q-card-section>

    <q-card-section class="cardio-card__content">
      <q-input
        v-model="cardio.activity"
        outlined
        label="Вид активности"
        autocomplete="off"
        hide-bottom-space
        :rules="[requiredTextRule]"
        lazy-rules
      />

      <div class="cardio-card__grid">
        <q-input
          v-model.number="cardio.duration"
          outlined
          type="number"
          inputmode="numeric"
          label="Минуты"
          suffix="мин"
          :rules="[positiveNumberRule]"
          lazy-rules
        />
        <q-input
          v-model.number="cardio.distance"
          outlined
          type="number"
          inputmode="decimal"
          label="Дистанция"
          suffix="км"
          :rules="[nonNegativeRule]"
          lazy-rules
        />
        <q-input
          v-model.number="cardio.calories"
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
.cardio-card {
  border-radius: 24px;
  border-color: rgba(15, 23, 42, 0.08);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.92) 100%);
  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.05);
}

.cardio-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.cardio-card__eyebrow {
  margin: 0 0 4px;
  color: #64748b;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.cardio-card__title {
  margin: 0;
  color: #0f172a;
  font-size: 1rem;
  line-height: 1;
  font-weight: 800;
}

.cardio-card__content {
  display: grid;
  gap: 14px;
}

.cardio-card__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.cardio-card__grid :deep(.q-field__control) {
  min-height: 46px;
}

.cardio-card__grid :deep(.q-field__native),
.cardio-card__grid :deep(.q-field__input),
.cardio-card__grid :deep(.q-field__label) {
  font-size: 0.86rem;
}

@media (max-width: 420px) {
  .cardio-card__grid {
    gap: 6px;
  }
}
</style>
