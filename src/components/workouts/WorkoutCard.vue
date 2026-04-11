<script setup lang="ts">
import { computed } from 'vue';
import type { Workout } from 'src/types/workout';
import { isStrengthWorkout } from 'src/types/workout';

const props = defineProps<{
  workout: Workout;
}>();

const emit = defineEmits<{
  edit: [workoutId: string];
  delete: [workoutId: string];
}>();

const totalSets = computed(() =>
  isStrengthWorkout(props.workout)
    ? props.workout.exercises.reduce((accumulator, exercise) => accumulator + exercise.sets, 0)
    : 0,
);

const typeLabel = computed(() => (props.workout.type === 'strength' ? 'Силовая' : 'Кардио'));
</script>

<template>
  <q-card flat bordered class="workout-card">
    <q-card-section class="workout-card__header">
      <div>
        <p class="workout-card__label">{{ typeLabel }}</p>
        <h3 class="workout-card__title">
          {{ workout.type === 'strength' ? `${workout.exercises.length} упражнений` : workout.cardio.activity || 'Кардио' }}
        </h3>
      </div>

      <q-badge
        rounded
        :color="workout.type === 'strength' ? 'teal-2' : 'orange-2'"
        :text-color="workout.type === 'strength' ? 'teal-10' : 'orange-10'"
        class="workout-card__badge"
      >
        {{ workout.type === 'strength' ? `${totalSets} подходов` : `${workout.cardio.duration} мин` }}
      </q-badge>
    </q-card-section>

    <q-card-section class="workout-card__body">
      <template v-if="workout.type === 'strength'">
        <div v-for="exercise in workout.exercises" :key="exercise.id" class="exercise-row">
          <div>
            <p class="exercise-row__name">{{ exercise.name }}</p>
            <p class="exercise-row__meta">{{ exercise.sets }} x {{ exercise.reps }} · {{ exercise.weight ?? 0 }} кг</p>
          </div>
        </div>
      </template>

      <div v-else class="exercise-row exercise-row--cardio">
        <div>
          <p class="exercise-row__name">{{ workout.cardio.activity }}</p>
          <p class="exercise-row__meta">
            {{ workout.cardio.duration }} мин
            <span v-if="workout.cardio.distance !== null"> · {{ workout.cardio.distance }} км</span>
            <span v-if="workout.cardio.calories !== null"> · {{ workout.cardio.calories }} ккал</span>
          </p>
        </div>
      </div>
    </q-card-section>

    <q-separator />

    <q-card-actions align="between" class="workout-card__actions">
      <q-btn no-caps rounded flat icon="edit" color="primary" label="Редактировать" @click="emit('edit', workout.id)" />
      <q-btn no-caps rounded flat icon="delete" color="negative" label="Удалить" @click="emit('delete', workout.id)" />
    </q-card-actions>
  </q-card>
</template>

<style scoped lang="scss">
.workout-card {
  border-radius: 24px;
  border-color: rgba(15, 23, 42, 0.08);
  background: rgba(255, 255, 255, 0.95);
}

.workout-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.workout-card__label {
  margin: 0 0 4px;
  color: #64748b;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.workout-card__title {
  margin: 0;
  color: #0f172a;
  line-height: 1;
  font-size: 1rem;
  font-weight: 800;
}

.workout-card__badge {
  padding: 8px 10px;
  font-weight: 700;
}

.workout-card__body {
  display: grid;
  gap: 10px;
}

.exercise-row {
  padding: 12px 14px;
  border-radius: 18px;
  background: #f8fafc;
}

.exercise-row--cardio {
  background: rgba(255, 247, 237, 0.95);
}

.exercise-row__name {
  margin: 0 0 4px;
  color: #0f172a;
  font-size: 0.98rem;
  font-weight: 700;
}

.exercise-row__meta {
  margin: 0;
  color: #64748b;
  font-size: 0.9rem;
}

.workout-card__actions {
  padding: 10px 12px 14px;
}
</style>
