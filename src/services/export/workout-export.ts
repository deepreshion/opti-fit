import type { Workout, WorkoutDraft } from 'src/types/workout';
import { isSportWorkout, isStrengthWorkout } from 'src/types/workout';
import { formatDisplayDate } from 'src/utils/date';
import { formatExerciseProgress, hasSplitSets } from 'src/utils/strength';

export type ExportFormat = 'json' | 'text';

export const buildWorkoutExportData = (
  draft: WorkoutDraft,
  existingWorkout?: Workout | null,
): Workout => {
  const timestamp = new Date().toISOString();

  if (draft.type === 'strength') {
    return {
      id: draft.id ?? existingWorkout?.id ?? 'draft-workout',
      date: draft.date,
      type: 'strength',
      exercises: draft.exercises.map((exercise) => ({
        ...exercise,
        name: exercise.name.trim(),
        note: exercise.note.trim(),
      })),
      createdAt: existingWorkout?.createdAt ?? timestamp,
      updatedAt: existingWorkout?.updatedAt ?? timestamp,
    };
  }

  if (draft.type === 'sport') {
    return {
      id: draft.id ?? existingWorkout?.id ?? 'draft-workout',
      date: draft.date,
      type: 'sport',
      sport: {
        ...draft.sport,
        sport: draft.sport.sport.trim(),
      },
      createdAt: existingWorkout?.createdAt ?? timestamp,
      updatedAt: existingWorkout?.updatedAt ?? timestamp,
    };
  }

  return {
    id: draft.id ?? existingWorkout?.id ?? 'draft-workout',
    date: draft.date,
    type: 'cardio',
    cardio: {
      ...draft.cardio,
      activity: draft.cardio.activity.trim(),
    },
    createdAt: existingWorkout?.createdAt ?? timestamp,
    updatedAt: existingWorkout?.updatedAt ?? timestamp,
  };
};

export const serializeWorkout = (workout: Workout, format: ExportFormat): string => {
  if (format === 'json') {
    return JSON.stringify(workout, null, 2);
  }

  if (isStrengthWorkout(workout)) {
    const lines = [
      `Тренировка: ${formatDisplayDate(workout.date)}`,
      'Тип: Силовая',
      '',
      ...workout.exercises.flatMap((exercise, index) => [
        `${index + 1}. ${exercise.name}`,
        `   Прогресс: ${formatExerciseProgress(exercise)}`,
        `   Подходы: ${hasSplitSets(exercise) ? exercise.setEntries.length : exercise.sets}`,
        ...(exercise.note ? [`   Заметка: ${exercise.note}`] : []),
        '',
      ]),
    ];

    return lines.join('\n').trim();
  }

  if (isSportWorkout(workout)) {
    const lines = [
      `Тренировка: ${formatDisplayDate(workout.date)}`,
      'Тип: Спорт',
      '',
      `Вид спорта: ${workout.sport.sport}`,
      `Длительность: ${workout.sport.duration} мин`,
      `Калории: ${workout.sport.calories === null ? '-' : `${workout.sport.calories} ккал`}`,
    ];

    return lines.join('\n').trim();
  }

  const lines = [
    `Тренировка: ${formatDisplayDate(workout.date)}`,
    'Тип: Кардио',
    '',
    `Активность: ${workout.cardio.activity}`,
    `Длительность: ${workout.cardio.duration} мин`,
    `Дистанция: ${workout.cardio.distance === null ? '-' : `${workout.cardio.distance} км`}`,
    `Калории: ${workout.cardio.calories === null ? '-' : `${workout.cardio.calories} ккал`}`,
  ];

  return lines.join('\n').trim();
};

export const serializeAllWorkouts = (workouts: Workout[], format: ExportFormat = 'json'): string => {
  if (format === 'json') {
    return JSON.stringify(workouts, null, 2);
  }

  if (workouts.length === 0) {
    return 'Тренировок пока нет.';
  }

  return workouts
    .map((workout) => serializeWorkout(workout, 'text'))
    .join('\n\n--------------------\n\n');
};

export const downloadWorkoutExport = (payload: string, fileName: string, format: ExportFormat): void => {
  const blob = new Blob([payload], {
    type: format === 'json' ? 'application/json;charset=utf-8' : 'text/plain;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = fileName;
  link.click();

  URL.revokeObjectURL(url);
};
