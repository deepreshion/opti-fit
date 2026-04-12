export type WorkoutType = 'strength' | 'cardio' | 'sport';

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number | null;
}

export interface CardioExercise {
  activity: string;
  duration: number;
  distance: number | null;
  calories: number | null;
}

export interface SportSession {
  sport: string;
  duration: number;
  calories: number | null;
}

interface BaseWorkout {
  id: string;
  date: string;
  type: WorkoutType;
  createdAt: string;
  updatedAt: string;
}

export interface StrengthWorkout extends BaseWorkout {
  type: 'strength';
  exercises: Exercise[];
}

export interface CardioWorkout extends BaseWorkout {
  type: 'cardio';
  cardio: CardioExercise;
}

export interface SportWorkout extends BaseWorkout {
  type: 'sport';
  sport: SportSession;
}

export type Workout = StrengthWorkout | CardioWorkout | SportWorkout;

export interface TrainingDay {
  date: string;
  workouts: Workout[];
  hasWorkout: boolean;
  hasStrengthWorkout: boolean;
  hasCardioWorkout: boolean;
  hasSportWorkout: boolean;
}

interface BaseWorkoutDraft {
  id?: string;
  date: string;
  type: WorkoutType;
}

export interface StrengthWorkoutDraft extends BaseWorkoutDraft {
  type: 'strength';
  exercises: Exercise[];
}

export interface CardioWorkoutDraft extends BaseWorkoutDraft {
  type: 'cardio';
  cardio: CardioExercise;
}

export interface SportWorkoutDraft extends BaseWorkoutDraft {
  type: 'sport';
  sport: SportSession;
}

export type WorkoutDraft = StrengthWorkoutDraft | CardioWorkoutDraft | SportWorkoutDraft;

export const isStrengthWorkout = (workout: Workout | WorkoutDraft): workout is StrengthWorkout | StrengthWorkoutDraft =>
  workout.type === 'strength';

export const isCardioWorkout = (workout: Workout | WorkoutDraft): workout is CardioWorkout | CardioWorkoutDraft =>
  workout.type === 'cardio';

export const isSportWorkout = (workout: Workout | WorkoutDraft): workout is SportWorkout | SportWorkoutDraft =>
  workout.type === 'sport';
