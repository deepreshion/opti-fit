import type { Exercise } from 'src/types/workout';

const normalizeNumber = (value: number | null | undefined): number => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const hasSplitSets = (exercise: Exercise): boolean =>
  Array.isArray(exercise.setEntries) && exercise.setEntries.length > 0;

export const getExerciseSetsCount = (exercise: Exercise): number =>
  hasSplitSets(exercise) ? exercise.setEntries.length : normalizeNumber(exercise.sets);

export const getExerciseTotalReps = (exercise: Exercise): number =>
  hasSplitSets(exercise)
    ? exercise.setEntries.reduce((sum, setEntry) => sum + normalizeNumber(setEntry.reps), 0)
    : normalizeNumber(exercise.sets) * normalizeNumber(exercise.reps);

export const getExerciseTotalVolume = (exercise: Exercise): number =>
  hasSplitSets(exercise)
    ? exercise.setEntries.reduce((sum, setEntry) => sum + normalizeNumber(setEntry.reps) * normalizeNumber(setEntry.weight), 0)
    : normalizeNumber(exercise.sets) * normalizeNumber(exercise.reps) * normalizeNumber(exercise.weight);

const formatWeightForSet = (weight: number | null): string => {
  if (weight === null || weight === undefined) {
    return '0';
  }

  return Number.isInteger(weight) ? String(weight) : weight.toString();
};

export const formatExerciseProgress = (exercise: Exercise): string => {
  if (hasSplitSets(exercise)) {
    return exercise.setEntries
      .map((setEntry) => `${formatWeightForSet(setEntry.weight)}×${normalizeNumber(setEntry.reps)}`)
      .join(', ');
  }

  const weight = exercise.weight ?? 0;
  return `${normalizeNumber(exercise.sets)}×${normalizeNumber(exercise.reps)} · ${weight} кг`;
};
