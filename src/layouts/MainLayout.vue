<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useWorkoutsStore } from 'src/stores/workouts';
import { getTodayIsoDate } from 'src/utils/date';

const drawerOpen = ref(false);
const router = useRouter();
const workoutsStore = useWorkoutsStore();

const navigateHome = () => {
  drawerOpen.value = false;
  router.push({ name: 'home' });
};

const navigateToTodayWorkout = () => {
  const today = getTodayIsoDate();
  drawerOpen.value = false;
  workoutsStore.setSelectedDate(today);
  router.push({
    name: 'workout-create',
    query: {
      date: today,
    },
  });
};
</script>

<template>
  <q-layout view="lhh Lpr lff" class="app-layout">
    <q-header class="app-header">
      <q-toolbar class="app-toolbar">
        <q-btn
          round
          flat
          icon="menu"
          aria-label="Открыть меню"
          @click="drawerOpen = !drawerOpen"
        />

        <div class="app-brand">
          <p class="app-brand__eyebrow">Дневник тренировок</p>
          <q-toolbar-title class="app-title">OptiFit</q-toolbar-title>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="drawerOpen"
      side="left"
      overlay
      bordered
      :width="288"
      class="app-drawer"
    >
      <div class="app-drawer__header">
        <p class="app-drawer__eyebrow">Меню</p>
        <h2 class="app-drawer__title">Быстрые действия</h2>
      </div>

      <q-list padding class="app-drawer__list">
        <q-item clickable v-ripple @click="navigateHome">
          <q-item-section avatar>
            <q-icon name="calendar_month" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Календарь</q-item-label>
            <q-item-label caption>Главный экран и список тренировок</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple @click="navigateToTodayWorkout">
          <q-item-section avatar>
            <q-icon name="today" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Добавить тренировку сегодня</q-item-label>
            <q-item-label caption>Сразу открыть форму на сегодняшнюю дату</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<style scoped lang="scss">
.app-layout {
  background:
    radial-gradient(circle at top, rgba(64, 143, 255, 0.12), transparent 42%),
    linear-gradient(180deg, #f4f7fb 0%, #eef3f8 100%);
}

.app-header {
  background: rgba(255, 255, 255, 0.94);
  color: #0f172a;
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
}

.app-toolbar {
  min-height: 60px;
  padding: 6px 12px;
}

.app-brand {
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
  min-width: 0;
  margin: 0 8px;
}

.app-brand__eyebrow {
  margin: 0 0 2px;
  color: #64748b;
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.app-title {
  padding: 0;
  font-size: 1.15rem;
  font-weight: 800;
  letter-spacing: 0.01em;
}

.app-drawer {
  background:
    radial-gradient(circle at top right, rgba(15, 118, 110, 0.12), transparent 38%),
    #f8fafc;
}

.app-drawer__header {
  padding: 20px 20px 8px;
}

.app-drawer__eyebrow {
  margin: 0 0 4px;
  color: #64748b;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.app-drawer__title {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 800;
  color: #0f172a;
}

.app-drawer__list :deep(.q-item) {
  min-height: 64px;
  border-radius: 18px;
  margin: 0 8px 6px;
}

@media (max-width: 420px) {
  .app-toolbar {
    min-height: 56px;
    padding: 4px 10px;
  }

  .app-brand {
    margin: 0 6px;
  }

  .app-brand__eyebrow {
    font-size: 0.58rem;
    margin-bottom: 0;
  }

  .app-title {
    font-size: 0.92rem;
    line-height: 1.05;
  }
}
</style>
