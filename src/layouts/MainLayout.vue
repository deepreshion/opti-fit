<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useWorkoutsStore } from 'src/stores/workouts';
import { useTelegramSessionStore } from 'src/stores/telegram-session';
import { getTodayIsoDate } from 'src/utils/date';

const drawerOpen = ref(false);
const router = useRouter();
const workoutsStore = useWorkoutsStore();
const telegramSessionStore = useTelegramSessionStore();
const { isTelegram, tgUser, displayName } = storeToRefs(telegramSessionStore);

const hasAvatar = computed(() => Boolean(tgUser.value?.photoUrl));

const navigateHome = () => {
  drawerOpen.value = false;
  router.push({ name: 'home' });
};

const navigateStatistics = () => {
  drawerOpen.value = false;
  router.push({ name: 'statistics' });
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

        <div class="app-user">
          <q-chip
            v-if="isTelegram"
            dense
            color="primary"
            text-color="white"
            class="app-user__env"
          >
            Telegram Mini App
          </q-chip>
          <q-avatar size="34px" class="app-user__avatar">
            <img v-if="hasAvatar" :src="tgUser?.photoUrl" alt="Telegram avatar" />
            <q-icon v-else name="person" />
          </q-avatar>
          <span class="app-user__name">{{ displayName }}</span>
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

        <q-item clickable v-ripple @click="navigateStatistics">
          <q-item-section avatar>
            <q-icon name="insights" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Статистика</q-item-label>
            <q-item-label caption>Недельная и месячная аналитика по нагрузке</q-item-label>
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
    linear-gradient(180deg, var(--app-bg) 0%, var(--app-bg) 100%);
}

.app-header {
  background: var(--app-bg);
  color: var(--app-text);
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

.app-user {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.app-user__env {
  max-width: 148px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.app-user__avatar {
  background: rgba(100, 116, 139, 0.18);
  color: var(--app-text);
}

.app-user__name {
  max-width: min(34vw, 180px);
  color: var(--app-text);
  font-size: 0.86rem;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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

  .app-user {
    gap: 6px;
  }

  .app-user__env {
    display: none;
  }

  .app-user__name {
    max-width: 27vw;
    font-size: 0.76rem;
  }
}
</style>
