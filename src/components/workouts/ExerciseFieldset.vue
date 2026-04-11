<script setup lang="ts">
import { computed, ref } from 'vue';
import type { Exercise } from 'src/types/workout';

const props = defineProps<{
  exercise: Exercise;
  index: number;
  nameSuggestions: string[];
}>();

const emit = defineEmits<{
  remove: [exerciseId: string];
}>();
const isNameFieldFocused = ref(false);

const normalizeExerciseName = () => {
  props.exercise.name = props.exercise.name.trim().replace(/\s+/g, ' ');
};

const hasExactSuggestionMatch = computed(() => {
  const currentName = props.exercise.name.trim().toLowerCase();

  if (currentName.length === 0) {
    return false;
  }

  return props.nameSuggestions.some((name) => name.trim().toLowerCase() === currentName);
});

const filteredSuggestions = computed(() => {
  const query = props.exercise.name.trim().toLowerCase();

  return props.nameSuggestions
    .filter((name) => (query.length === 0 ? true : name.toLowerCase().includes(query)))
    .filter((name) => name !== props.exercise.name.trim())
    .slice(0, 6);
});

const visibleSuggestions = computed(() => {
  if (isNameFieldFocused.value === false) {
    return [];
  }

  if (hasExactSuggestionMatch.value === true) {
    return [];
  }

  if (props.exercise.name.trim().length < 2) {
    return [];
  }

  return filteredSuggestions.value;
});

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
      <q-input
        v-model="exercise.name"
        outlined
        label="Название"
        autocomplete="off"
        hide-bottom-space
        :rules="[requiredRule]"
        lazy-rules
        @focus="isNameFieldFocused = true"
        @blur="
          normalizeExerciseName();
          isNameFieldFocused = false;
        "
      />

      <div v-if="visibleSuggestions.length > 0" class="exercise-card__suggestions">
        <q-chip
          v-for="name in visibleSuggestions"
          :key="name"
          clickable
          color="grey-3"
          text-color="dark"
          size="md"
          @click="
            exercise.name = name;
            isNameFieldFocused = false;
          "
        >
          {{ name }}
        </q-chip>
      </div>

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

.exercise-card__suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: -2px;
}

.exercise-card__suggestions :deep(.q-chip) {
  margin: 0;
  max-width: 100%;
  height: auto;
  min-height: 32px;
  white-space: normal;
  overflow-wrap: anywhere;
  word-break: break-word;
  line-height: 1.2;
  padding-top: 6px;
  padding-bottom: 6px;
}

.exercise-card__suggestions :deep(.q-chip__content) {
  display: block;
  white-space: normal;
  overflow-wrap: anywhere;
  word-break: break-word;
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
