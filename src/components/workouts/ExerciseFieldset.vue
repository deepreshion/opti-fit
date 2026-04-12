<script setup lang="ts">
import type { Exercise } from 'src/types/workout';
import WorkoutNameField from './WorkoutNameField.vue';

defineProps<{
  exercise: Exercise;
  index: number;
  nameSuggestions: string[];
}>();

const emit = defineEmits<{
  remove: [exerciseId: string];
}>();

const requiredRule = (value: string | number) => {
  if (typeof value === 'number') {
    return value > 0 || 'Введите значение';
  }

  return value.trim().length > 0 || 'Введите значение';
};

const nonNegativeRule = (value: number | null) => (value !== null && value >= 0) || 'Введите число от 0';
</script>

<template>
  <q-card flat bordered class="exercise-card">
    <q-card-section class="exercise-card__header">
      <div>
        <p class="exercise-card__eyebrow">Упражнение {{ index + 1 }}</p>
        <h3 class="exercise-card__title">{{ exercise.name || 'Новое упражнение' }}</h3>
      </div>

      <q-btn
        type="button"
        round
        flat
        color="negative"
        icon="delete"
        aria-label="Удалить упражнение"
        @click="emit('remove', exercise.id)"
      />
    </q-card-section>

    <q-card-section class="exercise-card__content">
      <WorkoutNameField
        v-model="exercise.name"
        label="Название"
        :suggestions="nameSuggestions"
        required-message="Введите значение"
      />

      <div class="exercise-card__grid">
        <q-input
          v-model.number="exercise.sets"
          outlined
          type="number"
          inputmode="numeric"
          label="Подходы"
          :rules="[requiredRule]"
          lazy-rules
        />
        <q-input
          v-model.number="exercise.reps"
          outlined
          type="number"
          inputmode="numeric"
          label="Повторения"
          :rules="[requiredRule]"
          lazy-rules
        />
        <q-input
          v-model.number="exercise.weight"
          outlined
          type="number"
          inputmode="decimal"
          label="Вес"
          suffix="кг"
          :rules="[nonNegativeRule]"
          lazy-rules
        />
      </div>
    </q-card-section>
  </q-card>
</template>

<style scoped lang="scss">
.exercise-card {
  border-radius: 24px;
  border-color: rgba(15, 23, 42, 0.08);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.92) 100%);
  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.05);
}

.exercise-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.exercise-card__eyebrow {
  margin: 0 0 4px;
  color: #64748b;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.exercise-card__title {
  margin: 0;
  color: #0f172a;
  font-size: 1rem;
  line-height: 1;
  font-weight: 800;
}

.exercise-card__content {
  display: grid;
  gap: 14px;
}

.exercise-card__content :deep(.q-field__label) {
  font-weight: 600;
}

.exercise-card__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.exercise-card__grid :deep(.q-field__control) {
  min-height: 46px;
}

.exercise-card__grid :deep(.q-field__native),
.exercise-card__grid :deep(.q-field__input),
.exercise-card__grid :deep(.q-field__label) {
  font-size: 0.86rem;
}
</style>
