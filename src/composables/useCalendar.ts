import { computed, ref, watch } from 'vue';

import { useWorkoutsStore } from 'src/stores/workouts';
import { fromIsoDate, getMonthLabel, getTodayIsoDate, isSameDate, isSameMonth, toIsoDate } from 'src/utils/date';

interface CalendarCell {
  isoDate: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  hasWorkout: boolean;
  hasStrengthWorkout: boolean;
  hasCardioWorkout: boolean;
  hasSportWorkout: boolean;
  isFuture: boolean;
}

const WEEK_DAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export const useCalendar = () => {
  const workoutsStore = useWorkoutsStore();
  const visibleMonth = ref<Date>(fromIsoDate(workoutsStore.selectedDate));
  const today = fromIsoDate(getTodayIsoDate());

  watch(
    () => workoutsStore.selectedDate,
    (selectedDate) => {
      const selected = fromIsoDate(selectedDate);

      if (!isSameMonth(selected, visibleMonth.value)) {
        visibleMonth.value = selected;
      }
    },
  );

  const monthLabel = computed(() => getMonthLabel(visibleMonth.value));
  const canGoNextMonth = computed(() => !isSameMonth(visibleMonth.value, today));

  const calendarGrid = computed<CalendarCell[]>(() => {
    const year = visibleMonth.value.getFullYear();
    const month = visibleMonth.value.getMonth();
    const firstDay = new Date(year, month, 1);
    const firstWeekday = (firstDay.getDay() + 6) % 7;
    const gridStart = new Date(year, month, 1 - firstWeekday);

    return Array.from({ length: 42 }, (_, index) => {
      const cellDate = new Date(gridStart);
      cellDate.setDate(gridStart.getDate() + index);
      const isoDate = toIsoDate(cellDate);
      const markers = workoutsStore.getWorkoutMarkers(isoDate);

      return {
        isoDate,
        dayNumber: cellDate.getDate(),
        isCurrentMonth: cellDate.getMonth() === month,
        isToday: isSameDate(cellDate, today),
        isSelected: isoDate === workoutsStore.selectedDate,
        hasWorkout: markers.hasStrength || markers.hasCardio || markers.hasSport,
        hasStrengthWorkout: markers.hasStrength,
        hasCardioWorkout: markers.hasCardio,
        hasSportWorkout: markers.hasSport,
        isFuture: cellDate.getTime() > today.getTime(),
      };
    });
  });

  const goToPreviousMonth = () => {
    visibleMonth.value = new Date(visibleMonth.value.getFullYear(), visibleMonth.value.getMonth() - 1, 1);
  };

  const goToNextMonth = () => {
    if (canGoNextMonth.value === false) {
      return;
    }

    visibleMonth.value = new Date(visibleMonth.value.getFullYear(), visibleMonth.value.getMonth() + 1, 1);
  };

  return {
    weekDayLabels: WEEK_DAY_LABELS,
    monthLabel,
    canGoNextMonth,
    visibleMonth,
    calendarGrid,
    goToPreviousMonth,
    goToNextMonth,
  };
};
