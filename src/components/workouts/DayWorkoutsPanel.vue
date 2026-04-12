<script setup lang="ts">
import { computed } from 'vue';
import type { Workout } from 'src/types/workout';
import { formatDisplayDate } from 'src/utils/date';
import WorkoutCard from './WorkoutCard.vue';

const props = defineProps<{
  selectedDate: string;
  workouts: Workout[];
  loading?: boolean;
}>();

const emit = defineEmits<{
  add: [];
  edit: [workoutId: string];
  delete: [workoutId: string];
}>();

const formattedDate = computed(() => formatDisplayDate(props.selectedDate));
</script>

<template>
  <section class="day-panel">
    <div class="day-panel__header">
      <div>
        <h5 class="day-panel__title">{{ formattedDate }}</h5>
      </div>

      <q-btn
        no-caps
        rounded
        color="primary"
        icon="add"
        label="Добавить тренировку"
        class="day-panel__add"
        @click="emit('add')"
      />
    </div>

    <q-banner v-if="loading" rounded class="day-panel__banner day-panel__banner--loading">
      Загружаем тренировки…
    </q-banner>

    <q-banner v-else-if="workouts.length === 0" rounded class="day-panel__banner day-panel__banner--empty text-center">
      Нет тренировок на выбранный день
    </q-banner>

    <div v-else class="day-panel__list">
      <WorkoutCard
        v-for="workout in workouts"
        :key="workout.id"
        :workout="workout"
        @edit="emit('edit', $event)"
        @delete="emit('delete', $event)"
      />
    </div>
  </section>
</template>

<style scoped lang="scss">
.day-panel {
  display: grid;
  gap: 16px;
}

.day-panel__header {
  display: grid;
  gap: 14px;
}

.day-panel__title {
  margin: 0;
  color: var(--app-text);
  font-size: 1.35rem;
  font-weight: 800;
}

.day-panel__add {
  min-height: 52px;
}

.day-panel__banner {
  border-radius: 22px;
  padding: 16px 18px;
}

.day-panel__banner--loading {
  background: rgba(2, 132, 199, 0.12);
  color: var(--app-primary);
}

.day-panel__banner--empty {
  background: var(--app-surface);
  color: var(--app-muted-text);
}

.day-panel__list {
  display: grid;
  gap: 12px;
}
</style>
