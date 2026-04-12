<script setup lang="ts">
import { computed, ref } from 'vue';
import type { QForm } from 'quasar';

import { useWorkoutsStore } from 'src/stores/workouts';
import type {
  CardioWorkoutDraft,
  SportWorkoutDraft,
  StrengthWorkoutDraft,
  WorkoutDraft,
  WorkoutType,
} from 'src/types/workout';
import { isCardioWorkout, isSportWorkout, isStrengthWorkout } from 'src/types/workout';
import { createId } from 'src/utils/id';
import { formatDisplayDate } from 'src/utils/date';
import CardioWorkoutFields from './CardioWorkoutFields.vue';
import ExerciseFieldset from './ExerciseFieldset.vue';
import SportWorkoutFields from './SportWorkoutFields.vue';

const props = defineProps<{
  modelValue: WorkoutDraft;
  saving?: boolean;
  editing?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: WorkoutDraft];
  submit: [];
  delete: [];
}>();

const workoutsStore = useWorkoutsStore();
const formRef = ref<QForm | null>(null);
const isQuickAddVisible = ref(false);

const workoutTypeOptions: Array<{ label: string; value: WorkoutType; icon: string }> = [
  { label: 'Силовая', value: 'strength', icon: 'fitness_center' },
  { label: 'Кардио', value: 'cardio', icon: 'monitor_heart' },
  { label: 'Спорт', value: 'sport', icon: 'sports_soccer' },
];

const createEmptyStrengthDraft = (date: string, id?: string): StrengthWorkoutDraft => ({
  id,
  date,
  type: 'strength',
  exercises: [
    {
      id: createId(),
      name: '',
      sets: 3,
      reps: 10,
      weight: 0,
    },
  ],
});

const createEmptyCardioDraft = (date: string, id?: string): CardioWorkoutDraft => ({
  id,
  date,
  type: 'cardio',
  cardio: {
    activity: '',
    duration: 30,
    distance: null,
    calories: null,
  },
});

const createEmptySportDraft = (date: string, id?: string): SportWorkoutDraft => ({
  id,
  date,
  type: 'sport',
  sport: {
    sport: '',
    duration: 60,
    calories: null,
  },
});

const formattedDate = computed(() => formatDisplayDate(props.modelValue.date));
const quickExerciseNames = computed(() => workoutsStore.quickExerciseNames);
const quickCardioNames = computed(() => workoutsStore.quickCardioNames);
const quickSportNames = computed(() => workoutsStore.quickSportNames);
const isStrengthDraft = computed(() => isStrengthWorkout(props.modelValue));
const isCardioDraft = computed(() => isCardioWorkout(props.modelValue));
const isSportDraft = computed(() => isSportWorkout(props.modelValue));
const strengthDraft = computed<StrengthWorkoutDraft | null>(() =>
  isStrengthDraft.value ? (props.modelValue as StrengthWorkoutDraft) : null,
);
const cardioDraft = computed<CardioWorkoutDraft | null>(() =>
  isCardioDraft.value ? (props.modelValue as CardioWorkoutDraft) : null,
);
const sportDraft = computed<SportWorkoutDraft | null>(() =>
  isSportDraft.value ? (props.modelValue as SportWorkoutDraft) : null,
);

const strengthExerciseCount = computed(() => strengthDraft.value?.exercises.length ?? 0);
const strengthTotalSets = computed(() =>
  strengthDraft.value?.exercises.reduce((sum: number, exercise) => sum + exercise.sets, 0) ?? 0,
);
const cardioSummary = computed(() => cardioDraft.value?.cardio ?? null);
const sportSummary = computed(() => sportDraft.value?.sport ?? null);

const summaryHint = computed(() => {
  if (isStrengthDraft.value) {
    return 'Силовая тренировка с упражнениями и подходами.';
  }

  if (isSportDraft.value) {
    return 'Спортивная сессия с видом спорта, временем и калориями.';
  }

  return 'Кардио-сессия с одной компактной записью.';
});

const quickAddTitle = computed(() => {
  if (isStrengthDraft.value) {
    return 'Быстро добавить упражнение';
  }

  if (isSportDraft.value) {
    return 'Быстро подставить вид спорта';
  }

  return 'Быстро подставить активность';
});

const quickAddValues = computed(() => {
  if (isStrengthDraft.value) {
    return quickExerciseNames.value;
  }

  if (isSportDraft.value) {
    return quickSportNames.value;
  }

  return quickCardioNames.value;
});

const hasQuickAddValues = computed(() => quickAddValues.value.length > 0);

const patchDraft = (nextDraft: WorkoutDraft) => {
  emit('update:modelValue', nextDraft);
};

const updateWorkoutType = (type: WorkoutType | null) => {
  if (!type || type === props.modelValue.type) {
    return;
  }

  if (type === 'strength') {
    patchDraft(createEmptyStrengthDraft(props.modelValue.date, props.modelValue.id));
    return;
  }

  if (type === 'sport') {
    patchDraft(createEmptySportDraft(props.modelValue.date, props.modelValue.id));
    return;
  }

  patchDraft(createEmptyCardioDraft(props.modelValue.date, props.modelValue.id));
};

const addExercise = () => {
  if (!isStrengthDraft.value) {
    return;
  }

  patchDraft({
    ...strengthDraft.value!,
    exercises: [
      ...strengthDraft.value!.exercises,
      {
        id: createId(),
        name: '',
        sets: 3,
        reps: 10,
        weight: 0,
      },
    ],
  });
};

const removeExercise = (exerciseId: string) => {
  if (!isStrengthDraft.value) {
    return;
  }

  patchDraft({
    ...strengthDraft.value!,
    exercises: strengthDraft.value!.exercises.filter((exercise) => exercise.id !== exerciseId),
  });
};

const addPresetExercise = (name: string) => {
  if (!isStrengthDraft.value) {
    return;
  }

  patchDraft({
    ...strengthDraft.value!,
    exercises: [
      ...strengthDraft.value!.exercises,
      {
        id: createId(),
        name,
        sets: 3,
        reps: 10,
        weight: 0,
      },
    ],
  });
};

const applyQuickAddValue = (value: string) => {
  if (isStrengthDraft.value) {
    addPresetExercise(value);
    return;
  }

  if (isSportDraft.value && sportDraft.value) {
    patchDraft({
      ...sportDraft.value,
      sport: {
        ...sportDraft.value.sport,
        sport: value,
      },
    });
    return;
  }

  if (isCardioDraft.value && cardioDraft.value) {
    patchDraft({
      ...cardioDraft.value,
      cardio: {
        ...cardioDraft.value.cardio,
        activity: value,
      },
    });
  }
};

const toggleQuickAdd = () => {
  if (!hasQuickAddValues.value) {
    return;
  }

  isQuickAddVisible.value = !isQuickAddVisible.value;
};

const handleSubmit = async () => {
  const isValid = await formRef.value?.validate();

  if (!isValid) {
    return;
  }

  emit('submit');
};
</script>

<template>
  <q-form ref="formRef" class="workout-form" greedy @submit.prevent="handleSubmit">
    <q-card flat bordered class="workout-form__summary">
      <q-card-section class="workout-form__summary-content">
        <div>
          <p class="workout-form__eyebrow">Дата тренировки</p>
          <h2 class="workout-form__title">{{ formattedDate }}</h2>
        </div>

        <div class="workout-form__type-toggle" role="tablist" aria-label="Тип тренировки">
          <button
            v-for="option in workoutTypeOptions"
            :key="option.value"
            type="button"
            class="workout-form__type-option"
            :class="[
              `workout-form__type-option--${option.value}`,
              { 'workout-form__type-option--active': modelValue.type === option.value },
            ]"
            :aria-pressed="modelValue.type === option.value"
            @click="updateWorkoutType(option.value)"
          >
            <q-icon :name="option.icon" size="22px" />
            <span>{{ option.label }}</span>
          </button>
        </div>

        <p class="workout-form__hint">{{ summaryHint }}</p>

        <div class="workout-form__summary-chips">
          <template v-if="isStrengthDraft">
            <q-chip square color="blue-1" text-color="primary" icon="format_list_numbered">
              {{ strengthExerciseCount }}
              {{ strengthExerciseCount === 1 ? 'упражнение' : strengthExerciseCount < 5 ? 'упражнения' : 'упражнений' }}
            </q-chip>
            <q-chip square icon="repeat" class="workout-form__chip workout-form__chip--strength">
              {{ strengthTotalSets }} подходов
            </q-chip>
          </template>

          <template v-else-if="cardioSummary">
            <q-chip square icon="timer" class="workout-form__chip workout-form__chip--cardio">
              {{ cardioSummary.duration || 0 }} мин
            </q-chip>
            <q-chip square color="cyan-1" text-color="cyan-10" icon="route">
              {{ cardioSummary.distance ?? 0 }} км
            </q-chip>
          </template>

          <template v-else-if="sportSummary">
            <q-chip square icon="sports_soccer" class="workout-form__chip workout-form__chip--sport">
              {{ sportSummary.sport || 'Спорт' }}
            </q-chip>
            <q-chip square icon="timer" class="workout-form__chip workout-form__chip--sport">
              {{ sportSummary.duration || 0 }} мин
            </q-chip>
          </template>
        </div>

<!--        <div v-if="hasQuickAddValues" class="workout-form__summary-actions">-->
<!--          <q-btn-->
<!--            no-caps-->
<!--            unelevated-->
<!--            size="sm"-->
<!--            color="grey-2"-->
<!--            text-color="grey-8"-->
<!--            class="workout-form__quick-toggle"-->
<!--            :icon="isQuickAddVisible ? 'expand_less' : 'bolt'"-->
<!--            :label="isQuickAddVisible ? 'Скрыть быстрое добавление' : 'Быстрое добавление'"-->
<!--            @click="toggleQuickAdd"-->
<!--          />-->
<!--        </div>-->
      </q-card-section>
    </q-card>

    <div v-if="hasQuickAddValues && isQuickAddVisible" class="workout-form__quick-add">
      <div class="workout-form__quick-header">
        <p class="workout-form__section-title">{{ quickAddTitle }}</p>
        <span class="workout-form__quick-caption">3 последних</span>
      </div>

      <div class="workout-form__quick-chips">
        <button
          v-for="value in quickAddValues"
          :key="value"
          type="button"
          class="workout-form__quick-chip"
          @click="applyQuickAddValue(value)"
        >
          <q-icon
            :name="isStrengthDraft ? 'add' : isSportDraft ? 'sports_soccer' : 'bolt'"
            size="18px"
            class="workout-form__quick-chip-icon"
          />
          <span>{{ value }}</span>
        </button>
      </div>
    </div>

    <template v-if="isStrengthDraft">
      <div v-if="strengthDraft && strengthDraft.exercises.length === 0" class="workout-form__empty">
        <q-icon name="fitness_center" size="28px" color="primary" />
        <div>
          <p class="workout-form__empty-title">Пока нет упражнений</p>
          <p class="workout-form__empty-text">Добавьте первое упражнение, чтобы сохранить тренировку.</p>
        </div>
      </div>

      <ExerciseFieldset
        v-for="(exercise, index) in strengthDraft?.exercises ?? []"
        :key="exercise.id"
        :exercise="exercise"
        :index="index"
        :name-suggestions="workoutsStore.exerciseNameHistory"
        @remove="removeExercise"
      />

      <q-btn
        type="button"
        no-caps
        rounded
        outline
        color="primary"
        icon="add"
        label="Добавить упражнение"
        class="workout-form__add"
        @click="addExercise"
      />
    </template>

    <CardioWorkoutFields
      v-else-if="cardioDraft"
      :cardio="cardioDraft.cardio"
      :activity-suggestions="quickCardioNames"
    />

    <SportWorkoutFields
      v-else-if="sportDraft"
      :sport="sportDraft.sport"
      :sport-suggestions="quickSportNames"
    />

    <div class="workout-form__actions">
      <q-btn
        no-caps
        rounded
        color="primary"
        class="workout-form__submit"
        :loading="saving"
        label="Сохранить"
        type="submit"
      />

      <q-btn
        v-if="editing"
        type="button"
        no-caps
        rounded
        flat
        color="negative"
        class="workout-form__delete"
        label="Удалить"
        @click="emit('delete')"
      />
    </div>
  </q-form>
</template>

<style scoped lang="scss">
@use 'src/styles/quasar-variables' as *;

.workout-form {
  display: grid;
  gap: 16px;
  width: 100%;
  min-width: 0;
}

.workout-form__summary {
  width: 100%;
  border-radius: 24px;
  border-color: rgba(15, 23, 42, 0.08);
  background:
    radial-gradient(circle at top right, rgba(20, 184, 166, 0.12), transparent 44%),
    rgba(255, 255, 255, 0.96);
}

.workout-form__summary-content {
  display: grid;
  gap: 14px;
}

.workout-form__eyebrow {
  margin: 0 0 4px;
  color: #64748b;
  font-size: 0.82rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.workout-form__title {
  margin: 0;
  color: #0f172a;
  font-size: 1.3rem;
  font-weight: 800;
}

.workout-form__hint {
  margin: 8px 0 0;
  color: #64748b;
  font-size: 0.92rem;
  line-height: 1.42;
}

.workout-form__type-toggle {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px;
  padding: 6px;
  border-radius: 22px;
  background: rgba(15, 23, 42, 0.05);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.8),
    0 10px 24px rgba(15, 23, 42, 0.06);
}

.workout-form__type-option {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 58px;
  padding: 0 14px;
  border: none;
  border-radius: 18px;
  background: transparent;
  color: #526277;
  font: inherit;
  font-size: 0.98rem;
  font-weight: 800;
  letter-spacing: -0.01em;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    background-color 0.18s ease,
    color 0.18s ease,
    box-shadow 0.18s ease;
}

.workout-form__type-option:hover {
  background: rgba(255, 255, 255, 0.62);
  color: #0f172a;
}

.workout-form__type-option:active {
  transform: scale(0.985);
}

.workout-form__type-option--active {
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.12);
}

.workout-form__type-option--strength.workout-form__type-option--active {
  background: linear-gradient(180deg, $workout-strength-surface 0%, #cdeee4 100%);
  color: $workout-strength-color;
}

.workout-form__type-option--cardio.workout-form__type-option--active {
  background: linear-gradient(180deg, $workout-cardio-surface 0%, #ffe4d2 100%);
  color: $workout-cardio-color;
}

.workout-form__type-option--sport.workout-form__type-option--active {
  background: $workout-sport-surface;
  color: $workout-sport-color;
}

.workout-form__summary-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.workout-form__summary-actions {
  display: flex;
  justify-content: flex-end;
}

.workout-form__chip {
  font-weight: 700;
}

.workout-form__chip--strength {
  background: $workout-strength-surface;
  color: $workout-strength-color;
}

.workout-form__chip--cardio {
  background: $workout-cardio-surface;
  color: $workout-cardio-color;
}

.workout-form__chip--sport {
  background: $workout-sport-surface;
  color: $workout-sport-color;
}

.workout-form__section-title {
  margin: 0;
  color: #0f172a;
  font-size: 0.94rem;
  font-weight: 800;
}

.workout-form__quick-add {
  display: grid;
  gap: 10px;
  padding: 14px;
  min-width: 0;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(15, 23, 42, 0.05);
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.04);
}

.workout-form__quick-toggle {
  min-height: 34px;
  border-radius: 999px;
  padding-inline: 6px;
  font-weight: 700;
}

.workout-form__quick-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.workout-form__quick-caption {
  color: #64748b;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.workout-form__quick-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-width: 0;
}

.workout-form__quick-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex: 0 1 auto;
  width: fit-content;
  max-width: 100%;
  min-height: 40px;
  padding: 8px 14px;
  border: none;
  border-radius: 999px;
  background: #ffffff;
  color: #0f172a;
  font: inherit;
  font-size: 0.94rem;
  font-weight: 700;
  line-height: 1.2;
  text-align: left;
  cursor: pointer;
  box-shadow: 0 6px 14px rgba(15, 23, 42, 0.08);
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    background-color 0.18s ease;
}

.workout-form__quick-chip:hover {
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 10px 18px rgba(15, 23, 42, 0.1);
}

.workout-form__quick-chip:active {
  transform: scale(0.985);
}

.workout-form__quick-chip-icon {
  color: var(--q-primary);
  flex: 0 0 auto;
}

.workout-form__empty {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border-radius: 20px;
  background: rgba(224, 242, 254, 0.72);
  color: #0f172a;
}

.workout-form__empty-title {
  margin: 0 0 2px;
  font-weight: 700;
}

.workout-form__empty-text {
  margin: 0;
  color: #64748b;
  font-size: 0.92rem;
}

.workout-form__add {
  width: 100%;
  min-height: 52px;
  border-style: dashed;
}

.workout-form__actions {
  display: grid;
  gap: 8px;
  margin-top: 4px;
  padding: 0;
}

.workout-form__submit,
.workout-form__delete {
  width: 100%;
  min-height: 52px;
}

@media (max-width: 420px) {
  .workout-form {
    gap: 12px;
  }

  .workout-form__summary,
  .workout-form__quick-add,
  .workout-form__empty {
    border-radius: 20px;
  }

  .workout-form__summary-content {
    gap: 10px;
  }

  .workout-form__hint {
    font-size: 0.9rem;
    line-height: 1.4;
  }

  .workout-form__summary-chips {
    gap: 6px;
  }

  .workout-form__quick-add {
    padding: 12px;
    gap: 8px;
  }

  .workout-form__quick-header {
    align-items: flex-start;
    flex-direction: column;
    gap: 4px;
  }

  .workout-form__quick-chips {
    gap: 6px;
  }

  .workout-form__quick-chip {
    min-height: 38px;
    padding: 7px 12px;
    font-size: 0.9rem;
  }

  .workout-form__type-toggle {
    gap: 4px;
    padding: 4px;
    border-radius: 18px;
  }

  .workout-form__type-option {
    min-height: 52px;
    padding: 0 10px;
    gap: 6px;
    border-radius: 14px;
    font-size: 0.9rem;
  }

  .workout-form__actions {
    gap: 6px;
  }
}
</style>
