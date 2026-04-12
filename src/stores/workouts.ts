import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

import {
  getCardioNameHistory,
  mergeCardioNameHistory,
  saveCardioNameHistory,
} from 'src/services/storage/cardio-name-history';
import {
  getExerciseNameHistory,
  mergeExerciseNameHistory,
  saveExerciseNameHistory,
} from 'src/services/storage/exercise-name-history';
import {
  getSportNameHistory,
  mergeSportNameHistory,
  saveSportNameHistory,
} from 'src/services/storage/sport-name-history';
import { workoutStorageService } from 'src/services/storage/local-workout-storage';
import type { Workout, WorkoutDraft } from 'src/types/workout';
import { isSportWorkout, isStrengthWorkout } from 'src/types/workout';
import { createId } from 'src/utils/id';
import { getTodayIsoDate, sortByUpdatedAtDesc } from 'src/utils/date';

const getStrengthNames = (workouts: Workout[]) =>
  workouts.flatMap((workout) => (isStrengthWorkout(workout) ? workout.exercises.map((exercise) => exercise.name) : []));

const getSportNames = (workouts: Workout[]) =>
  workouts.flatMap((workout) => (isSportWorkout(workout) ? [workout.sport.sport] : []));

const getCardioNames = (workouts: Workout[]) =>
  workouts.flatMap((workout) => (workout.type === 'cardio' ? [workout.cardio.activity] : []));

export const useWorkoutsStore = defineStore('workouts', () => {
  const workouts = ref<Workout[]>([]);
  const exerciseNameHistory = ref<string[]>([]);
  const cardioNameHistory = ref<string[]>([]);
  const sportNameHistory = ref<string[]>([]);
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
    const markerMap = new Map<string, { hasStrength: boolean; hasCardio: boolean; hasSport: boolean }>();

    workouts.value.forEach((workout) => {
      const current = markerMap.get(workout.date) ?? {
        hasStrength: false,
        hasCardio: false,
        hasSport: false,
      };

      if (isStrengthWorkout(workout)) {
        current.hasStrength = true;
      } else if (isSportWorkout(workout)) {
        current.hasSport = true;
      } else {
        current.hasCardio = true;
      }

      markerMap.set(workout.date, current);
    });

    return markerMap;
  });
  const quickExerciseNames = computed(() => exerciseNameHistory.value.slice(0, 3));
  const quickCardioNames = computed(() => cardioNameHistory.value.slice(0, 3));
  const quickSportNames = computed(() => sportNameHistory.value.slice(0, 3));

  const persistExerciseNameHistory = (names: string[]) => {
    const normalizedNames = names.filter((name) => name.trim().length > 0);
    exerciseNameHistory.value = mergeExerciseNameHistory(exerciseNameHistory.value, normalizedNames);
    saveExerciseNameHistory(exerciseNameHistory.value);
  };

  const persistCardioNameHistory = (names: string[]) => {
    const normalizedNames = names.filter((name) => name.trim().length > 0);
    cardioNameHistory.value = mergeCardioNameHistory(cardioNameHistory.value, normalizedNames);
    saveCardioNameHistory(cardioNameHistory.value);
  };

  const persistSportNameHistory = (names: string[]) => {
    const normalizedNames = names.filter((name) => name.trim().length > 0);
    sportNameHistory.value = mergeSportNameHistory(sportNameHistory.value, normalizedNames);
    saveSportNameHistory(sportNameHistory.value);
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
      cardioNameHistory.value = mergeCardioNameHistory(getCardioNameHistory(), getCardioNames(workouts.value));
      sportNameHistory.value = mergeSportNameHistory(getSportNameHistory(), getSportNames(workouts.value));
      saveExerciseNameHistory(exerciseNameHistory.value);
      saveCardioNameHistory(cardioNameHistory.value);
      saveSportNameHistory(sportNameHistory.value);
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
          : draft.type === 'sport'
            ? {
                id: createId(),
                type: 'sport',
                date: draft.date,
                sport: draft.sport,
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
      } else if (workout.type === 'cardio') {
        persistCardioNameHistory([workout.cardio.activity]);
      } else if (isSportWorkout(workout)) {
        persistSportNameHistory([workout.sport.sport]);
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
          : draft.type === 'sport'
            ? {
                id: currentWorkout.id,
                type: 'sport',
                date: draft.date,
                sport: draft.sport,
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
      } else if (updatedWorkout.type === 'cardio') {
        persistCardioNameHistory([updatedWorkout.cardio.activity]);
      } else if (isSportWorkout(updatedWorkout)) {
        persistSportNameHistory([updatedWorkout.sport.sport]);
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
      hasSport: false,
    };

  return {
    workouts,
    exerciseNameHistory,
    cardioNameHistory,
    sportNameHistory,
    selectedDate,
    isLoaded,
    isSaving,
    errorMessage,
    workoutsBySelectedDate,
    workoutDates,
    workoutDateSet,
    workoutMarkersByDate,
    quickExerciseNames,
    quickCardioNames,
    quickSportNames,
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
