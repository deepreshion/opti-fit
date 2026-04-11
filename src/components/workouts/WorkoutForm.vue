<script setup lang="ts">
import { computed, ref } from 'vue';
import type { QForm } from 'quasar';

import { useWorkoutsStore } from 'src/stores/workouts';
import type { CardioWorkoutDraft, StrengthWorkoutDraft, WorkoutDraft, WorkoutType } from 'src/types/workout';
import { isCardioWorkout, isStrengthWorkout } from 'src/types/workout';
import { createId } from 'src/utils/id';
import { formatDisplayDate } from 'src/utils/date';
import CardioWorkoutFields from './CardioWorkoutFields.vue';
import ExerciseFieldset from './ExerciseFieldset.vue';

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

const formattedDate = computed(() => formatDisplayDate(props.modelValue.date));
const quickExerciseNames = computed(() => workoutsStore.quickExerciseNames);
const isStrengthDraft = computed(() => isStrengthWorkout(props.modelValue));
const isCardioDraft = computed(() => isCardioWorkout(props.modelValue));
const strengthDraft = computed<StrengthWorkoutDraft | null>(() =>
  isStrengthDraft.value ? (props.modelValue as StrengthWorkoutDraft) : null,
);
const cardioDraft = computed<CardioWorkoutDraft | null>(() =>
  isCardioDraft.value ? (props.modelValue as CardioWorkoutDraft) : null,
);
const strengthExerciseCount = computed(() => strengthDraft.value?.exercises.length ?? 0);
const strengthTotalSets = computed(() =>
  strengthDraft.value?.exercises.reduce((sum: number, exercise) => sum + exercise.sets, 0) ?? 0,
);
const cardioSummary = computed(() => cardioDraft.value?.cardio ?? null);

const patchDraft = (nextDraft: WorkoutDraft) => {
  emit('update:modelValue', nextDraft);
};

const updateWorkoutType = (type: WorkoutType | null) => {
  if (!type || type === props.modelValue.type) {
    return;
  }

  patchDraft(
    type === 'strength'
      ? createEmptyStrengthDraft(props.modelValue.date, props.modelValue.id)
      : createEmptyCardioDraft(props.modelValue.date, props.modelValue.id),
  );
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
          <p class="workout-form__hint">
            {{ isStrengthDraft ? 'Силовая тренировка с упражнениями и подходами.' : 'Кардио-сессия с одной компактной записью.' }}
          </p>
        </div>

        <q-btn-toggle
          :model-value="modelValue.type"
          no-caps
          unelevated
          spread
          toggle-color="primary"
          color="grey-2"
          text-color="grey-8"
          class="workout-form__type-toggle"
          :options="[
            { label: 'Силовая', value: 'strength', icon: 'fitness_center' },
            { label: 'Кардио', value: 'cardio', icon: 'monitor_heart' },
          ]"
          @update:model-value="updateWorkoutType"
        />

        <div class="workout-form__summary-chips">
          <template v-if="isStrengthDraft">
            <q-chip square color="blue-1" text-color="primary" icon="format_list_numbered">
              {{ strengthExerciseCount }}
              {{ strengthExerciseCount === 1 ? 'упражнение' : strengthExerciseCount < 5 ? 'упражнения' : 'упражнений' }}
            </q-chip>
            <q-chip square color="teal-1" text-color="teal-10" icon="repeat">
              {{ strengthTotalSets }} подходов
            </q-chip>
          </template>

          <template v-else-if="cardioSummary">
            <q-chip square color="orange-1" text-color="orange-10" icon="timer">
              {{ cardioSummary.duration || 0 }} мин
            </q-chip>
            <q-chip square color="cyan-1" text-color="cyan-10" icon="route">
              {{ cardioSummary.distance ?? 0 }} км
            </q-chip>
          </template>
        </div>
      </q-card-section>
    </q-card>

    <template v-if="isStrengthDraft">
      <div class="workout-form__quick-add">
        <p class="workout-form__section-title">Быстро добавить</p>
        <div class="workout-form__quick-chips">
          <q-chip
            v-for="name in quickExerciseNames"
            :key="name"
            clickable
            color="white"
            text-color="dark"
            icon="add"
            @click="addPresetExercise(name)"
          >
            {{ name }}
          </q-chip>
        </div>
      </div>

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

    <CardioWorkoutFields v-else-if="cardioDraft" :cardio="cardioDraft.cardio" />

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
  overflow: hidden;
  border-radius: 16px;
}

.workout-form__summary-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.workout-form__section-title {
  margin: 0 0 8px;
  color: #0f172a;
  font-size: 0.94rem;
  font-weight: 800;
}

.workout-form__quick-add {
  padding: 0 2px;
  min-width: 0;
}

.workout-form__quick-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  overflow-x: hidden;
  padding-bottom: 4px;
  min-width: 0;
}

.workout-form__quick-chips::-webkit-scrollbar {
  display: none;
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

  .workout-form__summary-chips :deep(.q-chip),
  .workout-form__quick-chips :deep(.q-chip) {
    margin: 0;
    max-width: 100%;
  }

  .workout-form__actions {
    gap: 6px;
  }
}
</style>
