const ruFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const ruCompactFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'short',
});

export const getTodayIsoDate = (): string => {
  const now = new Date();
  return toIsoDate(now);
};

export const toIsoDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const fromIsoDate = (value: string): Date => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const formatDisplayDate = (value: string): string => ruFormatter.format(fromIsoDate(value));

export const formatCompactDate = (value: string): string => ruCompactFormatter.format(fromIsoDate(value));

export const getMonthLabel = (date: Date): string =>
  date.toLocaleDateString('ru-RU', {
    month: 'long',
    year: 'numeric',
  });

export const isSameMonth = (left: Date, right: Date): boolean =>
  left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth();

export const isSameDate = (left: Date, right: Date): boolean =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

export const sortByUpdatedAtDesc = <T extends { updatedAt: string }>(items: T[]): T[] =>
  [...items].sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime());
