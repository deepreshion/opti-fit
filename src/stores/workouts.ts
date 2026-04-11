import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

import {
  getExerciseNameHistory,
  mergeExerciseNameHistory,
  saveExerciseNameHistory,
} from 'src/services/storage/exercise-name-history';
import { workoutStorageService } from 'src/services/storage/local-workout-storage';
import type { Workout, WorkoutDraft } from 'src/types/workout';
import { isStrengthWorkout } from 'src/types/workout';
import { createId } from 'src/utils/id';
import { getTodayIsoDate, sortByUpdatedAtDesc } from 'src/utils/date';

const getStrengthNames = (workouts: Workout[]) =>
  workouts.flatMap((workout) => (isStrengthWorkout(workout) ? workout.exercises.map((exercise) => exercise.name) : []));

export const useWorkoutsStore = defineStore('workouts', () => {
  const workouts = ref<Workout[]>([]);
  const exerciseNameHistory = ref<string[]>([]);
  const selectedDate = ref<string>(getTodayIsoDate());
  const isLoaded = ref(false);
  const isSaving = ref(false);
  const errorMessage = ref('');

  const workoutsBySelectedDate = computed(() =>
    sortByUpdatedAtDesc(workouts.value.filter((workout) => workout.date === selectedDate.value)),
  );

  const workoutDates = computed(() => [...new Set(workouts.value.map((workout) => workout.date))]);
  const workoutDateSet = computed(() => new Set(workoutDates.value));
  const workoutMarkersByDate = computed(() => {
    const markerMap = new Map<string, { hasStrength: boolean; hasCardio: boolean }>();

    workouts.value.forEach((workout) => {
      const current = markerMap.get(workout.date) ?? {
        hasStrength: false,
        hasCardio: false,
      };

      if (isStrengthWorkout(workout)) {
        current.hasStrength = true;
      } else {
        current.hasCardio = true;
      }

      markerMap.set(workout.date, current);
    });

    return markerMap;
  });
  const quickExerciseNames = computed(() => exerciseNameHistory.value.slice(0, 3));

  const persistExerciseNameHistory = (names: string[]) => {
    const normalizedNames = names.filter((name) => name.trim().length > 0);
    exerciseNameHistory.value = mergeExerciseNameHistory(exerciseNameHistory.value, normalizedNames);
    saveExerciseNameHistory(exerciseNameHistory.value);
  };

  const setSelectedDate = (date: string) => {
    selectedDate.value = date;
  };

  const clearError = () => {
    errorMessage.value = '';
  };

  const loadWorkouts = async () => {
    clearError();

    try {
      workouts.value = await workoutStorageService.getWorkouts();
      exerciseNameHistory.value = mergeExerciseNameHistory(getExerciseNameHistory(), getStrengthNames(workouts.value));
      saveExerciseNameHistory(exerciseNameHistory.value);
      isLoaded.value = true;
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : 'Ошибка загрузки тренировок';
    }
  };

  const addWorkout = async (draft: WorkoutDraft) => {
    clearError();
    isSaving.value = true;

    try {
      const timestamp = new Date().toISOString();
      const workout: Workout =
        draft.type === 'strength'
          ? {
              id: createId(),
              type: 'strength',
              date: draft.date,
              exercises: draft.exercises,
              createdAt: timestamp,
              updatedAt: timestamp,
            }
          : {
              id: createId(),
              type: 'cardio',
              date: draft.date,
              cardio: draft.cardio,
              createdAt: timestamp,
              updatedAt: timestamp,
            };

      await workoutStorageService.addWorkout(workout);
      workouts.value = sortByUpdatedAtDesc([...workouts.value, workout]);

      if (isStrengthWorkout(workout)) {
        persistExerciseNameHistory(workout.exercises.map((exercise) => exercise.name));
      }

      return workout;
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : 'Ошибка сохранения тренировки';
      throw error;
    } finally {
      isSaving.value = false;
    }
  };

  const updateWorkout = async (draft: WorkoutDraft & { id: string }) => {
    clearError();
    isSaving.value = true;

    try {
      const currentWorkout = workouts.value.find((workout) => workout.id === draft.id);

      if (!currentWorkout) {
        throw new Error('Тренировка не найдена');
      }

      const updatedWorkout: Workout =
        draft.type === 'strength'
          ? {
              id: currentWorkout.id,
              type: 'strength',
              date: draft.date,
              exercises: draft.exercises,
              createdAt: currentWorkout.createdAt,
              updatedAt: new Date().toISOString(),
            }
          : {
              id: currentWorkout.id,
              type: 'cardio',
              date: draft.date,
              cardio: draft.cardio,
              createdAt: currentWorkout.createdAt,
              updatedAt: new Date().toISOString(),
            };

      await workoutStorageService.updateWorkout(updatedWorkout);
      workouts.value = sortByUpdatedAtDesc(
        workouts.value.map((workout) => (workout.id === updatedWorkout.id ? updatedWorkout : workout)),
      );

      if (isStrengthWorkout(updatedWorkout)) {
        persistExerciseNameHistory(updatedWorkout.exercises.map((exercise) => exercise.name));
      }

      return updatedWorkout;
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : 'Ошибка обновления тренировки';
      throw error;
    } finally {
      isSaving.value = false;
    }
  };

  const deleteWorkout = async (workoutId: string) => {
    clearError();
    isSaving.value = true;

    try {
      await workoutStorageService.deleteWorkout(workoutId);
      workouts.value = workouts.value.filter((workout) => workout.id !== workoutId);
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : 'Ошибка удаления тренировки';
      throw error;
    } finally {
      isSaving.value = false;
    }
  };

  const getWorkoutById = (workoutId: string) => workouts.value.find((workout) => workout.id === workoutId) ?? null;

  const getWorkoutsByDate = (date: string) =>
    sortByUpdatedAtDesc(workouts.value.filter((workout) => workout.date === date));

  const hasWorkoutOnDate = (date: string) => workoutDateSet.value.has(date);

  const getWorkoutMarkers = (date: string) =>
    workoutMarkersByDate.value.get(date) ?? {
      hasStrength: false,
      hasCardio: false,
    };

  return {
    workouts,
    exerciseNameHistory,
    selectedDate,
    isLoaded,
    isSaving,
    errorMessage,
    workoutsBySelectedDate,
    workoutDates,
    workoutDateSet,
    workoutMarkersByDate,
    quickExerciseNames,
    setSelectedDate,
    clearError,
    loadWorkouts,
    addWorkout,
    updateWorkout,
    deleteWorkout,
    getWorkoutById,
    getWorkoutsByDate,
    hasWorkoutOnDate,
    getWorkoutMarkers,
  };
});
