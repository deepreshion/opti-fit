import type { CardioExercise, Exercise, Workout } from 'src/types/workout';
import { sortByUpdatedAtDesc } from 'src/utils/date';

import type { WorkoutStorageService } from './workout-storage';

const STORAGE_KEY = 'opti-fit:workouts';

type PersistedWorkout = Partial<Workout> & {
  exercises?: Partial<Exercise>[];
  cardio?: Partial<CardioExercise>;
  type?: string;
};

const normalizeExercise = (exercise: Partial<Exercise>, index: number): Exercise => ({
  id: exercise.id ?? `exercise-${index}`,
  name: String(exercise.name ?? '').trim(),
  sets: Number(exercise.sets ?? 0),
  reps: Number(exercise.reps ?? 0),
  weight: exercise.weight === null || exercise.weight === undefined ? null : Number(exercise.weight),
});

const normalizeCardio = (cardio: Partial<CardioExercise> | undefined): CardioExercise => ({
  activity: String(cardio?.activity ?? '').trim(),
  duration: Number(cardio?.duration ?? 0),
  distance: cardio?.distance === null || cardio?.distance === undefined ? null : Number(cardio.distance),
  calories: cardio?.calories === null || cardio?.calories === undefined ? null : Number(cardio.calories),
});

const normalizeWorkout = (workout: PersistedWorkout): Workout | null => {
  if (typeof workout.id !== 'string' || typeof workout.date !== 'string') {
    return null;
  }

  const createdAt = typeof workout.createdAt === 'string' ? workout.createdAt : new Date().toISOString();
  const updatedAt = typeof workout.updatedAt === 'string' ? workout.updatedAt : createdAt;

  if (workout.type === 'cardio') {
    return {
      id: workout.id,
      date: workout.date,
      type: 'cardio',
      cardio: normalizeCardio(workout.cardio),
      createdAt,
      updatedAt,
    };
  }

  return {
    id: workout.id,
    date: workout.date,
    type: 'strength',
    exercises: Array.isArray(workout.exercises)
      ? workout.exercises.map((exercise, index) => normalizeExercise(exercise, index))
      : [],
    createdAt,
    updatedAt,
  };
};

export class LocalWorkoutStorageService implements WorkoutStorageService {
  async getWorkouts(): Promise<Workout[]> {
    try {
      const rawValue = localStorage.getItem(STORAGE_KEY);

      if (!rawValue) {
        return [];
      }

      const parsed = JSON.parse(rawValue) as PersistedWorkout[];
      return sortByUpdatedAtDesc(parsed.map(normalizeWorkout).filter((workout): workout is Workout => workout !== null));
    } catch (error) {
      console.error('Не удалось прочитать тренировки из localStorage', error);
      throw new Error('Не удалось загрузить тренировки');
    }
  }

  async saveWorkouts(workouts: Workout[]): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sortByUpdatedAtDesc(workouts)));
    } catch (error) {
      console.error('Не удалось сохранить тренировки в localStorage', error);
      throw new Error('Не удалось сохранить тренировки');
    }
  }

  async addWorkout(workout: Workout): Promise<void> {
    const workouts = await this.getWorkouts();
    await this.saveWorkouts([workout, ...workouts]);
  }

  async updateWorkout(workout: Workout): Promise<void> {
    const workouts = await this.getWorkouts();
    const nextWorkouts = workouts.map((item) => (item.id === workout.id ? workout : item));
    await this.saveWorkouts(nextWorkouts);
  }

  async deleteWorkout(workoutId: string): Promise<void> {
    const workouts = await this.getWorkouts();
    await this.saveWorkouts(workouts.filter((item) => item.id !== workoutId));
  }

  async getWorkoutsByDate(date: string): Promise<Workout[]> {
    const workouts = await this.getWorkouts();
    return workouts.filter((workout) => workout.date === date);
  }

  async hasWorkoutOnDate(date: string): Promise<boolean> {
    const workouts = await this.getWorkoutsByDate(date);
    return workouts.length > 0;
  }
}

export const workoutStorageService: WorkoutStorageService = new LocalWorkoutStorageService();
