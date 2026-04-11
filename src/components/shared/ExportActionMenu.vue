<script setup lang="ts">
export type ExportActionItem = {
  label: string;
  icon: string;
  caption?: string;
  action: () => void | Promise<void>;
};

const props = withDefaults(
  defineProps<{
    items: ExportActionItem[];
    ariaLabel?: string;
    icon?: string;
  }>(),
  {
    ariaLabel: 'Экспорт',
    icon: 'ios_share',
  },
);

const runAction = async (item: ExportActionItem) => {
  await item.action();
};
</script>

<template>
  <q-btn class="export-menu__trigger" round flat :icon="props.icon" :aria-label="props.ariaLabel">
    <q-menu anchor="bottom right" self="top right" class="export-menu">
      <q-list class="export-menu__list">
        <q-item
          v-for="item in props.items"
          :key="`${item.label}-${item.icon}`"
          clickable
          v-close-popup
          class="export-menu__item"
          @click="runAction(item)"
        >
          <q-item-section avatar>
            <div class="export-menu__icon">
              <q-icon :name="item.icon" size="18px" />
            </div>
          </q-item-section>

          <q-item-section>
            <q-item-label class="export-menu__label">{{ item.label }}</q-item-label>
            <q-item-label v-if="item.caption" caption class="export-menu__caption">
              {{ item.caption }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-btn>
</template>

<style scoped lang="scss">
.export-menu__trigger {
  color: var(--q-primary);
  background: color-mix(in srgb, var(--q-primary) 10%, white);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--q-primary) 14%, white);
}

.export-menu {
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.14);
}

.export-menu__list {
  min-width: 236px;
  padding: 8px;
  background: #ffffff;
}

.export-menu__item {
  min-height: 0;
  gap: 2px;
  padding: 10px 12px;
  border-radius: 14px;
}

.export-menu__item + .export-menu__item {
  margin-top: 4px;
}

.export-menu__item:hover,
.export-menu__item:focus-visible {
  background: color-mix(in srgb, var(--q-primary) 8%, white);
}

.export-menu__icon {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 12px;
  color: var(--q-primary);
  background: color-mix(in srgb, var(--q-primary) 10%, white);
}

.export-menu__label {
  color: #0f172a;
  font-size: 0.95rem;
  font-weight: 700;
}

.export-menu__caption {
  margin-top: 2px;
  color: #64748b;
  line-height: 1.35;
}

@media (max-width: 420px) {
  .export-menu__list {
    min-width: 220px;
  }

  .export-menu__item {
    padding: 10px;
  }
}
</style>
