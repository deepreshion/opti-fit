<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { copyToClipboard, useQuasar } from 'quasar';

import ExportActionMenu, { type ExportActionItem } from 'src/components/shared/ExportActionMenu.vue';
import WorkoutCalendar from 'src/components/calendar/WorkoutCalendar.vue';
import DayWorkoutsPanel from 'src/components/workouts/DayWorkoutsPanel.vue';
import { downloadWorkoutExport, serializeAllWorkouts } from 'src/services/export/workout-export';
import { useWorkoutsStore } from 'src/stores/workouts';

const router = useRouter();
const $q = useQuasar();
const workoutsStore = useWorkoutsStore();

const workoutsForSelectedDay = computed(() => workoutsStore.workoutsBySelectedDate);

onMounted(async () => {
  if (!workoutsStore.isLoaded) {
    await workoutsStore.loadWorkouts();
  }
});

const openCreateWorkout = () => {
  router.push({
    name: 'workout-create',
    query: {
      date: workoutsStore.selectedDate,
    },
  });
};

const openStatistics = () => {
  router.push({ name: 'statistics' });
};

const openEditWorkout = (workoutId: string) => {
  router.push({
    name: 'workout-edit',
    params: {
      id: workoutId,
    },
  });
};

const exportAllWorkouts = (format: 'json' | 'text') => {
  const payload = serializeAllWorkouts(workoutsStore.workouts, format);
  const fileName = `all-workouts.${format === 'json' ? 'json' : 'txt'}`;

  downloadWorkoutExport(payload, fileName, format);

  $q.notify({
    type: 'positive',
    message: format === 'json' ? 'Все данные экспортированы в JSON' : 'Все данные экспортированы строкой',
  });
};

const copyAllWorkouts = async () => {
  try {
    await copyToClipboard(serializeAllWorkouts(workoutsStore.workouts, 'text'));
    $q.notify({
      type: 'positive',
      message: 'Все данные скопированы в буфер обмена',
    });
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Не удалось скопировать данные',
    });
  }
};

const exportMenuItems = computed<ExportActionItem[]>(() => [
  {
    label: 'Экспорт JSON',
    caption: 'Скачать архив всех тренировок',
    icon: 'data_object',
    action: () => exportAllWorkouts('json'),
  },
  {
    label: 'Экспорт строкой',
    caption: 'Скачать данные в читаемом виде',
    icon: 'notes',
    action: () => exportAllWorkouts('text'),
  },
  {
    label: 'Копировать в буфер',
    caption: 'Быстро поделиться всеми данными',
    icon: 'content_copy',
    action: copyAllWorkouts,
  },
]);

const deleteWorkout = (workoutId: string) => {
  $q.dialog({
    title: 'Удалить тренировку',
    message: 'Тренировка будет удалена без возможности восстановления.',
    persistent: true,
    ok: {
      label: 'Удалить',
      color: 'negative',
      noCaps: true,
      rounded: true,
    },
    cancel: {
      label: 'Отмена',
      flat: true,
      noCaps: true,
      rounded: true,
    },
  }).onOk(async () => {
    try {
      await workoutsStore.deleteWorkout(workoutId);
      $q.notify({
        type: 'positive',
        message: 'Тренировка удалена',
      });
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
  <q-page class="home-page">
    <div class="home-page__content">
      <section class="home-hero">
        <div class="home-hero__content">
          <p class="home-hero__eyebrow">Календарь</p>
          <h1 class="home-hero__title">Тренировки по дням</h1>
          <p class="home-hero__text">Выберите дату и добавьте тренировку.</p>
        </div>

        <ExportActionMenu aria-label="Экспорт всех данных" :items="exportMenuItems" />
      </section>

      <WorkoutCalendar />

      <q-banner v-if="workoutsStore.errorMessage" rounded class="bg-red-1 text-negative">
        {{ workoutsStore.errorMessage }}
      </q-banner>

      <DayWorkoutsPanel
        :selected-date="workoutsStore.selectedDate"
        :workouts="workoutsForSelectedDay"
        :loading="!workoutsStore.isLoaded"
        @add="openCreateWorkout"
        @edit="openEditWorkout"
        @delete="deleteWorkout"
      />
    </div>
  </q-page>
</template>

<style scoped lang="scss">
.home-page {
  padding: 10px 12px 20px;
}

.home-page__content {
  display: grid;
  gap: 12px;
  max-width: 720px;
  margin: 0 auto;
}

.home-hero {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 0 2px;
}

.home-hero__content {
  min-width: 0;
  flex: 1;
}

.home-hero__eyebrow {
  margin: 0 0 6px;
  color: var(--app-muted-text);
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.home-hero__title {
  margin: 0;
  color: var(--app-text);
  font-size: 1.3rem;
  font-weight: 900;
  line-height: 1.08;
}

.home-hero__text {
  margin: 6px 0 0;
  color: var(--app-muted-text);
  font-size: 0.9rem;
  line-height: 1.4;
}

@media (max-width: 420px) {
  .home-page {
    padding: 8px 10px 16px;
  }

  .home-page__content {
    gap: 10px;
  }

  .home-hero__eyebrow {
    font-size: 0.72rem;
    margin-bottom: 4px;
  }

  .home-hero__title {
    font-size: 1.08rem;
    line-height: 1.08;
  }

  .home-hero__text {
    font-size: 0.84rem;
    line-height: 1.32;
  }
}
</style>
