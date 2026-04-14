import type { Workout, WorkoutType } from 'src/types/workout';
import { formatCompactDate, fromIsoDate, toIsoDate } from 'src/utils/date';
import { getExerciseSetsCount, getExerciseTotalReps, getExerciseTotalVolume } from 'src/utils/strength';

export type StatsMetricKey = 'sessions' | 'minutes' | 'calories';

export interface WorkoutDayStat {
  date: string;
  shortDateLabel: string;
  weekdayLabel: string;
  dayNumber: number;
  isToday: boolean;
  isCurrentMonth: boolean;
  workoutCount: number;
  strengthCount: number;
  cardioCount: number;
  sportCount: number;
  minutes: number;
  calories: number;
  distance: number;
  sets: number;
  reps: number;
  volume: number;
}

export interface WorkoutTypeTotals {
  strength: number;
  cardio: number;
  sport: number;
}

export interface TopWorkoutEntry {
  label: string;
  count: number;
  type: WorkoutType;
}

export interface WeekdayRhythmStat {
  key: string;
  label: string;
  sessions: number;
  minutes: number;
  calories: number;
}

export interface WorkoutStreak {
  current: number;
  best: number;
}

export interface WorkoutPeriodStats {
  label: string;
  subtitle: string;
  startDate: string;
  endDate: string;
  days: WorkoutDayStat[];
  totalWorkouts: number;
  activeDays: number;
  totalMinutes: number;
  totalCalories: number;
  totalDistance: number;
  totalSets: number;
  totalReps: number;
  totalVolume: number;
  averageWorkoutsPerActiveDay: number;
  averageMinutesPerWorkout: number;
  completionRate: number;
  typeTotals: WorkoutTypeTotals;
  topEntries: TopWorkoutEntry[];
  weekdayRhythm: WeekdayRhythmStat[];
  peakDay: WorkoutDayStat | null;
}

const weekdayShortFormatter = new Intl.DateTimeFormat('ru-RU', {
  weekday: 'short',
});

const monthFormatter = new Intl.DateTimeFormat('ru-RU', {
  month: 'long',
  year: 'numeric',
});

const rangeFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'short',
});

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const addDays = (date: Date, amount: number) => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + amount);
  return startOfDay(nextDate);
};

const getStartOfWeek = (date: Date) => {
  const offset = (date.getDay() + 6) % 7;
  return addDays(date, -offset);
};

const getEndOfWeek = (date: Date) => addDays(getStartOfWeek(date), 6);

const getStartOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);

const getEndOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);

const enumerateDates = (startDate: Date, endDate: Date) => {
  const dates: Date[] = [];
  let cursor = startOfDay(startDate);

  while (cursor.getTime() <= endDate.getTime()) {
    dates.push(cursor);
    cursor = addDays(cursor, 1);
  }

  return dates;
};

const normalizeLabel = (value: string) => value.trim().replace(/\s+/g, ' ');

const getWeekdayLabel = (date: Date) => {
  const label = weekdayShortFormatter.format(date).replace('.', '');
  return label.charAt(0).toUpperCase() + label.slice(1);
};

const getMetricValue = (day: WorkoutDayStat, metric: StatsMetricKey) => {
  if (metric === 'minutes') {
    return day.minutes;
  }

  if (metric === 'calories') {
    return day.calories;
  }

  return day.workoutCount;
};

const buildTypeTotals = (workouts: Workout[]): WorkoutTypeTotals =>
  workouts.reduce<WorkoutTypeTotals>(
    (totals, workout) => {
      totals[workout.type] += 1;
      return totals;
    },
    {
      strength: 0,
      cardio: 0,
      sport: 0,
    },
  );

const buildTopEntries = (workouts: Workout[]) => {
  const entryMap = new Map<string, TopWorkoutEntry>();

  workouts.forEach((workout) => {
    if (workout.type === 'strength') {
      workout.exercises.forEach((exercise) => {
        const normalizedLabel = normalizeLabel(exercise.name);

        if (!normalizedLabel) {
          return;
        }

        const entryKey = `strength:${normalizedLabel.toLowerCase()}`;
        const currentEntry = entryMap.get(entryKey);

        entryMap.set(entryKey, {
          label: currentEntry?.label ?? normalizedLabel,
          count: (currentEntry?.count ?? 0) + 1,
          type: 'strength',
        });
      });

      return;
    }

    if (workout.type === 'cardio') {
      const normalizedLabel = normalizeLabel(workout.cardio.activity);

      if (!normalizedLabel) {
        return;
      }

      const entryKey = `cardio:${normalizedLabel.toLowerCase()}`;
      const currentEntry = entryMap.get(entryKey);

      entryMap.set(entryKey, {
        label: currentEntry?.label ?? normalizedLabel,
        count: (currentEntry?.count ?? 0) + 1,
        type: 'cardio',
      });

      return;
    }

    const normalizedLabel = normalizeLabel(workout.sport.sport);

    if (!normalizedLabel) {
      return;
    }

    const entryKey = `sport:${normalizedLabel.toLowerCase()}`;
    const currentEntry = entryMap.get(entryKey);

    entryMap.set(entryKey, {
      label: currentEntry?.label ?? normalizedLabel,
      count: (currentEntry?.count ?? 0) + 1,
      type: 'sport',
    });
  });

  return [...entryMap.values()]
    .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label, 'ru'))
    .slice(0, 6);
};

const buildWeekdayRhythm = (days: WorkoutDayStat[]): WeekdayRhythmStat[] => {
  const monday = getStartOfWeek(new Date(2026, 0, 5));
  const weekdayOrder = enumerateDates(monday, addDays(monday, 6)).map((date) => ({
    key: getWeekdayLabel(date).toLowerCase(),
    label: getWeekdayLabel(date),
  }));

  return weekdayOrder.map(({ key, label }, index) => {
    const weekdayDays = days.filter((day) => ((fromIsoDate(day.date).getDay() + 6) % 7) === index);

    return {
      key,
      label,
      sessions: weekdayDays.reduce((sum, day) => sum + day.workoutCount, 0),
      minutes: weekdayDays.reduce((sum, day) => sum + day.minutes, 0),
      calories: weekdayDays.reduce((sum, day) => sum + day.calories, 0),
    };
  });
};

const buildDayStat = (date: Date, workouts: Workout[], todayIsoDate: string): WorkoutDayStat => {
  const dayDate = toIsoDate(date);
  const sameDayWorkouts = workouts.filter((workout) => workout.date === dayDate);

  return sameDayWorkouts.reduce<WorkoutDayStat>(
    (dayStat, workout) => {
      dayStat.workoutCount += 1;

      if (workout.type === 'strength') {
        dayStat.strengthCount += 1;

        workout.exercises.forEach((exercise) => {
          dayStat.sets += getExerciseSetsCount(exercise);
          dayStat.reps += getExerciseTotalReps(exercise);
          dayStat.volume += getExerciseTotalVolume(exercise);
        });

        return dayStat;
      }

      if (workout.type === 'cardio') {
        dayStat.cardioCount += 1;
        dayStat.minutes += workout.cardio.duration || 0;
        dayStat.calories += workout.cardio.calories || 0;
        dayStat.distance += workout.cardio.distance || 0;
        return dayStat;
      }

      dayStat.sportCount += 1;
      dayStat.minutes += workout.sport.duration || 0;
      dayStat.calories += workout.sport.calories || 0;
      return dayStat;
    },
    {
      date: dayDate,
      shortDateLabel: formatCompactDate(dayDate),
      weekdayLabel: getWeekdayLabel(date),
      dayNumber: date.getDate(),
      isToday: dayDate === todayIsoDate,
      isCurrentMonth: true,
      workoutCount: 0,
      strengthCount: 0,
      cardioCount: 0,
      sportCount: 0,
      minutes: 0,
      calories: 0,
      distance: 0,
      sets: 0,
      reps: 0,
      volume: 0,
    },
  );
};

const buildStreak = (workouts: Workout[], anchorDate: string): WorkoutStreak => {
  const activeDates = [...new Set(workouts.map((workout) => workout.date))].sort();

  if (activeDates.length === 0) {
    return { current: 0, best: 0 };
  }

  let best = 1;
  let currentRun = 1;

  for (let index = 1; index < activeDates.length; index += 1) {
    const previousDate = fromIsoDate(activeDates[index - 1]);
    const currentDate = fromIsoDate(activeDates[index]);
    const diffInDays = Math.round((currentDate.getTime() - previousDate.getTime()) / 86_400_000);

    if (diffInDays === 1) {
      currentRun += 1;
      best = Math.max(best, currentRun);
    } else {
      currentRun = 1;
    }
  }

  const activeDateSet = new Set(activeDates);
  let current = 0;
  let cursor = anchorDate;

  while (activeDateSet.has(cursor)) {
    current += 1;
    cursor = toIsoDate(addDays(fromIsoDate(cursor), -1));
  }

  return { current, best };
};

const buildPeriodStats = (
  workouts: Workout[],
  startDate: Date,
  endDate: Date,
  label: string,
  subtitle: string,
  anchorDate: string,
) => {
  const todayIsoDate = toIsoDate(new Date());
  const dates = enumerateDates(startDate, endDate);
  const days = dates.map((date) => buildDayStat(date, workouts, todayIsoDate));
  const workoutsInPeriod = workouts.filter((workout) => {
    const workoutDate = fromIsoDate(workout.date).getTime();
    return workoutDate >= startDate.getTime() && workoutDate <= endDate.getTime();
  });

  const totalWorkouts = workoutsInPeriod.length;
  const totalMinutes = days.reduce((sum, day) => sum + day.minutes, 0);
  const totalCalories = days.reduce((sum, day) => sum + day.calories, 0);
  const totalDistance = days.reduce((sum, day) => sum + day.distance, 0);
  const totalSets = days.reduce((sum, day) => sum + day.sets, 0);
  const totalReps = days.reduce((sum, day) => sum + day.reps, 0);
  const totalVolume = days.reduce((sum, day) => sum + day.volume, 0);
  const activeDays = days.filter((day) => day.workoutCount > 0).length;
  const completionRate = days.length > 0 ? Math.round((activeDays / days.length) * 100) : 0;

  return {
    label,
    subtitle,
    startDate: toIsoDate(startDate),
    endDate: toIsoDate(endDate),
    days,
    totalWorkouts,
    activeDays,
    totalMinutes,
    totalCalories,
    totalDistance,
    totalSets,
    totalReps,
    totalVolume,
    averageWorkoutsPerActiveDay: activeDays > 0 ? Number((totalWorkouts / activeDays).toFixed(1)) : 0,
    averageMinutesPerWorkout: totalWorkouts > 0 ? Math.round(totalMinutes / totalWorkouts) : 0,
    completionRate,
    typeTotals: buildTypeTotals(workoutsInPeriod),
    topEntries: buildTopEntries(workoutsInPeriod),
    weekdayRhythm: buildWeekdayRhythm(days),
    peakDay:
      days
        .filter((day) => day.workoutCount > 0)
        .sort((left, right) => {
          const rightWeight = right.workoutCount * 1000 + right.minutes * 10 + right.calories;
          const leftWeight = left.workoutCount * 1000 + left.minutes * 10 + left.calories;
          return rightWeight - leftWeight;
        })[0] ?? null,
    streak: buildStreak(workouts, anchorDate),
  };
};

export const getWeeklyStats = (workouts: Workout[], anchorDate: string): WorkoutPeriodStats & { streak: WorkoutStreak } => {
  const anchor = fromIsoDate(anchorDate);
  const startDate = getStartOfWeek(anchor);
  const endDate = getEndOfWeek(anchor);
  const subtitle = `${rangeFormatter.format(startDate)} - ${rangeFormatter.format(endDate)}`;

  return buildPeriodStats(workouts, startDate, endDate, 'Неделя', subtitle, anchorDate);
};

export const getMonthlyStats = (workouts: Workout[], anchorDate: string): WorkoutPeriodStats & { streak: WorkoutStreak } => {
  const anchor = fromIsoDate(anchorDate);
  const startDate = getStartOfMonth(anchor);
  const endDate = getEndOfMonth(anchor);
  const subtitle = monthFormatter.format(anchor);

  return buildPeriodStats(workouts, startDate, endDate, 'Месяц', subtitle, anchorDate);
};

export const getStatsMetricMax = (days: WorkoutDayStat[], metric: StatsMetricKey) =>
  Math.max(0, ...days.map((day) => getMetricValue(day, metric)));

export const getStatsMetricValue = getMetricValue;

export const buildMonthHeatmap = (days: WorkoutDayStat[], anchorDate: string) => {
  const anchor = fromIsoDate(anchorDate);
  const monthStart = getStartOfMonth(anchor);
  const monthEnd = getEndOfMonth(anchor);
  const leadingDays = (monthStart.getDay() + 6) % 7;
  const trailingDays = 6 - ((monthEnd.getDay() + 6) % 7);
  const gridStart = addDays(monthStart, -leadingDays);
  const gridEnd = addDays(monthEnd, trailingDays);
  const dayMap = new Map(days.map((day) => [day.date, day]));
  const gridDays = enumerateDates(gridStart, gridEnd).map((date) => {
    const isoDate = toIsoDate(date);
    const existingDay = dayMap.get(isoDate);

    return (
      existingDay ?? {
        date: isoDate,
        shortDateLabel: formatCompactDate(isoDate),
        weekdayLabel: getWeekdayLabel(date),
        dayNumber: date.getDate(),
        isToday: false,
        isCurrentMonth: date.getMonth() === anchor.getMonth(),
        workoutCount: 0,
        strengthCount: 0,
        cardioCount: 0,
        sportCount: 0,
        minutes: 0,
        calories: 0,
        distance: 0,
        sets: 0,
        reps: 0,
        volume: 0,
      }
    );
  });

  const weeks: WorkoutDayStat[][] = [];

  for (let index = 0; index < gridDays.length; index += 7) {
    weeks.push(gridDays.slice(index, index + 7));
  }

  return weeks;
};
