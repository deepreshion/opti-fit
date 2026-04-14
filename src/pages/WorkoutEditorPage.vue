<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { copyToClipboard, useQuasar } from 'quasar';

import ExportActionMenu, { type ExportActionItem } from 'src/components/shared/ExportActionMenu.vue';
import WorkoutForm from 'src/components/workouts/WorkoutForm.vue';
import { buildWorkoutExportData, serializeWorkout } from 'src/services/export/workout-export';
import { useWorkoutsStore } from 'src/stores/workouts';
import type { Workout, WorkoutDraft } from 'src/types/workout';
import { isCardioWorkout, isSportWorkout, isStrengthWorkout } from 'src/types/workout';
import { getTodayIsoDate } from 'src/utils/date';
import { createId } from 'src/utils/id';

const route = useRoute();
const router = useRouter();
const $q = useQuasar();
const workoutsStore = useWorkoutsStore();

const createInitialDraft = (): WorkoutDraft => ({
  date: String(route.query.date ?? workoutsStore.selectedDate ?? getTodayIsoDate()),
  type: 'strength',
  exercises: [
    {
      id: createId(),
      name: '',
      sets: 3,
      reps: 10,
      weight: null,
      note: '',
      splitBySets: false,
      setEntries: [],
    },
  ],
});

const workoutId = computed(() => String(route.params.id ?? ''));
const isEditing = computed(() => Boolean(workoutId.value));
const currentWorkout = computed<Workout | null>(() =>
  draft.value.id ? workoutsStore.getWorkoutById(draft.value.id) : null,
);

const draft = ref<WorkoutDraft>(createInitialDraft());

onMounted(async () => {
  if (!workoutsStore.isLoaded) {
    await workoutsStore.loadWorkouts();
  }

  if (isEditing.value) {
    const workout = workoutsStore.getWorkoutById(workoutId.value);

    if (!workout) {
      $q.notify({
        type: 'negative',
        message: 'Тренировка не найдена',
      });
      router.replace({ name: 'home' });
      return;
    }

    draft.value = isStrengthWorkout(workout)
      ? {
          id: workout.id,
          date: workout.date,
          type: 'strength',
          exercises: workout.exercises.map((exercise) => ({ ...exercise })),
        }
      : isSportWorkout(workout)
        ? {
            id: workout.id,
            date: workout.date,
            type: 'sport',
            sport: { ...workout.sport },
          }
        : {
            id: workout.id,
            date: workout.date,
            type: 'cardio',
            cardio: { ...workout.cardio },
          };
  }
});

const pageTitle = computed(() => (isEditing.value ? 'Редактировать тренировку' : 'Добавить тренировку'));

const copyWorkout = async (format: 'json' | 'text') => {
  try {
    const exportableWorkout = buildWorkoutExportData(draft.value, currentWorkout.value);
    await copyToClipboard(serializeWorkout(exportableWorkout, format));

    $q.notify({
      type: 'positive',
      message: format === 'json' ? 'JSON скопирован в буфер обмена' : 'Тренировка скопирована строкой',
    });
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Не удалось скопировать тренировку',
    });
  }
};

const exportMenuItems = computed<ExportActionItem[]>(() => [
  {
    label: 'Копировать JSON',
    caption: 'Скопировать текущую тренировку в JSON',
    icon: 'data_object',
    action: () => copyWorkout('json'),
  },
  {
    label: 'Копировать строкой',
    caption: 'Скопировать тренировку в читаемом виде',
    icon: 'notes',
    action: () => copyWorkout('text'),
  },
]);

const saveWorkout = async () => {
  if (isStrengthWorkout(draft.value) && draft.value.exercises.length === 0) {
    $q.notify({
      type: 'warning',
      message: 'Добавьте хотя бы одно упражнение',
    });
    return;
  }

  if (isCardioWorkout(draft.value) && draft.value.cardio.activity.trim().length === 0) {
    $q.notify({
      type: 'warning',
      message: 'Укажите вид кардио',
    });
    return;
  }

  if (isSportWorkout(draft.value) && draft.value.sport.sport.trim().length === 0) {
    $q.notify({
      type: 'warning',
      message: 'Укажите вид спорта',
    });
    return;
  }

  try {
    if (draft.value.id) {
      await workoutsStore.updateWorkout({
        id: draft.value.id,
        ...draft.value,
      });
    } else {
      await workoutsStore.addWorkout(draft.value);
    }

    workoutsStore.setSelectedDate(draft.value.date);

    $q.notify({
      type: 'positive',
      message: 'Тренировка сохранена',
    });

    router.push({ name: 'home' });
  } catch {
    $q.notify({
      type: 'negative',
      message: workoutsStore.errorMessage || 'Не удалось сохранить тренировку',
    });
  }
};

const requestDelete = () => {
  if (!draft.value.id) {
    return;
  }

  $q.dialog({
    title: 'Удалить тренировку',
    message: 'Это действие нельзя отменить.',
    persistent: true,
    cancel: {
      label: 'Отмена',
      flat: true,
      rounded: true,
      noCaps: true,
    },
    ok: {
      label: 'Удалить',
      color: 'negative',
      rounded: true,
      noCaps: true,
    },
  }).onOk(async () => {
    try {
      await workoutsStore.deleteWorkout(draft.value.id!);
      $q.notify({
        type: 'positive',
        message: 'Тренировка удалена',
      });
      router.push({ name: 'home' });
    } catch {
      $q.notify({
        type: 'negative',
        message: workoutsStore.errorMessage || 'Не удалось удалить тренировку',
      });
    }
  });
};
</script>

<template>
  <q-page class="editor-page">
    <div class="editor-page__content">
      <div class="editor-page__topbar">
        <q-btn round flat icon="arrow_back" aria-label="Назад" @click="router.back()" />

        <div class="editor-page__heading">
          <h1 class="editor-page__title">{{ pageTitle }}</h1>
        </div>

        <ExportActionMenu v-if="isEditing" :items="exportMenuItems" aria-label="Экспорт тренировки" />
      </div>

      <q-banner v-if="workoutsStore.errorMessage" rounded class="bg-red-1 text-negative">
        {{ workoutsStore.errorMessage }}
      </q-banner>

      <WorkoutForm
        v-model="draft"
        :editing="isEditing"
        :saving="workoutsStore.isSaving"
        @submit="saveWorkout"
        @delete="requestDelete"
      />
    </div>
  </q-page>
</template>

<style scoped lang="scss">
.editor-page {
  padding: 10px 12px 14px;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
}

.editor-page__content {
  display: grid;
  gap: 12px;
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
  min-width: 0;
}

.editor-page__topbar {
  display: flex;
  align-items: center;
  gap: 10px;
}

.editor-page__heading {
  min-width: 0;
  flex: 1;
}

.editor-page__title {
  margin: 0;
  color: #0f172a;
  font-size: 1.18rem;
  font-weight: 800;
  line-height: 1.1;
}

@media (max-width: 420px) {
  .editor-page {
    padding: 8px 10px 10px;
  }

  .editor-page__content {
    gap: 10px;
  }

  .editor-page__topbar {
    min-width: 0;
  }

  .editor-page__topbar > div {
    min-width: 0;
  }

  .editor-page__title {
    font-size: 1rem;
  }
}
</style>
