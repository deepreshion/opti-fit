const STORAGE_KEY = 'opti-fit:exercise-name-history';

const normalizeName = (value: string): string => value.trim().replace(/\s+/g, ' ');

export const getExerciseNameHistory = (): string[] => {
  try {
    const rawValue = localStorage.getItem(STORAGE_KEY);

    if (!rawValue) {
      return [];
    }

    const parsed = JSON.parse(rawValue) as string[];
    return parsed.map(normalizeName).filter(Boolean);
  } catch (error) {
    console.error('Не удалось прочитать историю упражнений', error);
    return [];
  }
};

export const saveExerciseNameHistory = (names: string[]): void => {
  try {
    const uniqueNames = [...new Set(names.map(normalizeName).filter(Boolean))];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(uniqueNames));
  } catch (error) {
    console.error('Не удалось сохранить историю упражнений', error);
  }
};

export const mergeExerciseNameHistory = (currentNames: string[], incomingNames: string[]): string[] => {
  const merged = [...incomingNames, ...currentNames].map(normalizeName).filter(Boolean);
  return [...new Set(merged)];
};
