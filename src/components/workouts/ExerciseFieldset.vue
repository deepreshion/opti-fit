<script setup lang="ts">
import type { Exercise } from 'src/types/workout';
import { createId } from 'src/utils/id';
import { formatExerciseProgress } from 'src/utils/strength';
import WorkoutNameField from './WorkoutNameField.vue';

const props = defineProps<{
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

const nonNegativeRule = (value: number | null) => value === null || value >= 0 || 'Введите число от 0';

const createSetEntry = () => ({
  id: createId(),
  reps: props.exercise.reps > 0 ? props.exercise.reps : 8,
  weight: props.exercise.weight,
});

const enableSplitMode = () => {
  if (props.exercise.setEntries.length > 0) {
    return;
  }

  const nextSetCount = Math.max(props.exercise.sets, 1);
  props.exercise.setEntries = Array.from({ length: nextSetCount }, () => createSetEntry());
};

const handleSplitModeChange = (enabled: boolean | null) => {
  props.exercise.splitBySets = Boolean(enabled);

  if (props.exercise.splitBySets) {
    enableSplitMode();
    return;
  }

  props.exercise.setEntries = [];
};

const addSetEntry = () => {
  props.exercise.setEntries.push(createSetEntry());
};

const removeSetEntry = (setId: string) => {
  if (props.exercise.setEntries.length <= 1) {
    return;
  }

  props.exercise.setEntries = props.exercise.setEntries.filter((setEntry) => setEntry.id !== setId);
};
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

      <q-toggle
        :model-value="exercise.splitBySets"
        checked-icon="format_list_numbered"
        unchecked-icon="tune"
        color="primary"
        label="Вести по подходам"
        @update:model-value="handleSplitModeChange"
      />

      <div v-if="exercise.splitBySets" class="exercise-card__sets">
        <div class="exercise-card__sets-header">
          <p class="exercise-card__sets-title">Подходы</p>
          <q-btn
            type="button"
            no-caps
            rounded
            flat
            icon="add"
            color="primary"
            label="Добавить подход"
            @click="addSetEntry"
          />
        </div>

        <div
          v-for="(setEntry, setIndex) in exercise.setEntries"
          :key="setEntry.id"
          class="exercise-card__set-row"
        >
          <q-input
            v-model.number="setEntry.weight"
            outlined
            type="number"
            inputmode="decimal"
            label="Вес"
            suffix="кг"
            hide-bottom-space
            :rules="[nonNegativeRule]"
            lazy-rules
            class="exercise-card__set-field"
          />
          <q-input
            v-model.number="setEntry.reps"
            outlined
            type="number"
            inputmode="numeric"
            label="Повторы"
            hide-bottom-space
            :rules="[requiredRule]"
            lazy-rules
            class="exercise-card__set-field"
          />
          <q-btn
            type="button"
            round
            flat
            color="negative"
            icon="close"
            :disable="exercise.setEntries.length <= 1"
            :aria-label="`Удалить подход ${setIndex + 1}`"
            class="exercise-card__set-remove"
            @click="removeSetEntry(setEntry.id)"
          />
        </div>

        <p class="exercise-card__sets-preview">{{ formatExerciseProgress(exercise) }}</p>
      </div>

      <div v-else class="exercise-card__grid">
        <q-input
          v-model.number="exercise.sets"
          outlined
          type="number"
          inputmode="numeric"
          label="Подходы"
          hide-bottom-space
          :rules="[requiredRule]"
          lazy-rules
        />
        <q-input
          v-model.number="exercise.reps"
          outlined
          type="number"
          inputmode="numeric"
          label="Повторения"
          hide-bottom-space
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
          hide-bottom-space
          :rules="[nonNegativeRule]"
          lazy-rules
        />
      </div>

      <q-input
        v-model="exercise.note"
        outlined
        type="textarea"
        autogrow
        clearable
        label="Заметка"
        maxlength="240"
        hide-bottom-space
      />
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

.exercise-card__sets {
  display: grid;
  gap: 8px;
  padding: 10px;
  border-radius: 16px;
  background: rgba(241, 245, 249, 0.85);
}

.exercise-card__sets-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.exercise-card__sets-title {
  margin: 0;
  color: #0f172a;
  font-size: 0.9rem;
  font-weight: 700;
}

.exercise-card__set-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
}

.exercise-card__set-field :deep(.q-field__control) {
  min-height: 44px;
}

.exercise-card__set-remove {
  align-self: center;
}

.exercise-card__sets-preview {
  margin: 2px 0 0;
  color: #475569;
  font-size: 0.86rem;
}

@media (max-width: 480px) {
  .exercise-card__set-row {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto;
  }
}
</style>
