import type { Workout } from 'src/types/workout';

export interface WorkoutStorageService {
  getWorkouts(): Promise<Workout[]>;
  saveWorkouts(workouts: Workout[]): Promise<void>;
  addWorkout(workout: Workout): Promise<void>;
  updateWorkout(workout: Workout): Promise<void>;
  deleteWorkout(workoutId: string): Promise<void>;
  getWorkoutsByDate(date: string): Promise<Workout[]>;
  hasWorkoutOnDate(date: string): Promise<boolean>;
}
