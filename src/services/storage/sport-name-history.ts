const STORAGE_KEY = 'opti-fit:sport-name-history';

const normalizeName = (value: string): string => value.trim().replace(/\s+/g, ' ');

export const getSportNameHistory = (): string[] => {
  try {
    const rawValue = localStorage.getItem(STORAGE_KEY);

    if (!rawValue) {
      return [];
    }

    const parsed = JSON.parse(rawValue) as string[];
    return parsed.map(normalizeName).filter(Boolean);
  } catch (error) {
    console.error('Не удалось прочитать историю видов спорта', error);
    return [];
  }
};

export const saveSportNameHistory = (names: string[]): void => {
  try {
    const uniqueNames = [...new Set(names.map(normalizeName).filter(Boolean))];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(uniqueNames));
  } catch (error) {
    console.error('Не удалось сохранить историю видов спорта', error);
  }
};

export const mergeSportNameHistory = (currentNames: string[], incomingNames: string[]): string[] => {
  const merged = [...incomingNames, ...currentNames].map(normalizeName).filter(Boolean);
  return [...new Set(merged)];
};
