<script setup lang="ts">
import { computed, ref } from 'vue';

const props = withDefaults(defineProps<{
  modelValue: string;
  label: string;
  suggestions: string[];
  requiredMessage?: string;
}>(), {
  requiredMessage: 'Введите значение',
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const isFocused = ref(false);

const normalizedValue = computed({
  get: () => props.modelValue,
  set: (value: string) => {
    emit('update:modelValue', value);
  },
});

const normalizeValue = (value: string) => value.trim().replace(/\s+/g, ' ');

const hasExactSuggestionMatch = computed(() => {
  const currentValue = props.modelValue.trim().toLowerCase();

  if (currentValue.length === 0) {
    return false;
  }

  return props.suggestions.some((name) => name.trim().toLowerCase() === currentValue);
});

const filteredSuggestions = computed(() => {
  const query = props.modelValue.trim().toLowerCase();

  return props.suggestions
    .filter((name) => (query.length === 0 ? true : name.toLowerCase().includes(query)))
    .filter((name) => normalizeValue(name) !== normalizeValue(props.modelValue))
    .slice(0, 6);
});

const visibleSuggestions = computed(() => {
  if (isFocused.value === false) {
    return [];
  }

  if (hasExactSuggestionMatch.value) {
    return [];
  }

  if (props.modelValue.trim().length < 1 && filteredSuggestions.value.length === 0) {
    return [];
  }

  return filteredSuggestions.value;
});

const requiredTextRule = (value: string) => value.trim().length > 0 || props.requiredMessage;

const handleBlur = () => {
  normalizedValue.value = normalizeValue(props.modelValue);
  window.setTimeout(() => {
    isFocused.value = false;
  }, 120);
};

const applySuggestion = (value: string) => {
  normalizedValue.value = normalizeValue(value);
  isFocused.value = false;
};
</script>

<template>
  <div class="workout-name-field">
    <q-input
      v-model="normalizedValue"
      outlined
      :label="label"
      autocomplete="off"
      autocapitalize="sentences"
      hide-bottom-space
      :rules="[requiredTextRule]"
      lazy-rules
      @focus="isFocused = true"
      @blur="handleBlur"
    />

    <div v-if="visibleSuggestions.length > 0" class="workout-name-field__suggestions">
      <q-chip
        v-for="suggestion in visibleSuggestions"
        :key="suggestion"
        clickable
        color="grey-2"
        text-color="dark"
        size="md"
        @mousedown.prevent
        @click="applySuggestion(suggestion)"
      >
        {{ suggestion }}
      </q-chip>
    </div>
  </div>
</template>

<style scoped lang="scss">
.workout-name-field {
  display: grid;
  gap: 10px;
}

.workout-name-field__suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: -2px;
  align-items: flex-start;
}

.workout-name-field__suggestions :deep(.q-chip) {
  display: inline-flex;
  flex: 0 1 auto;
  width: fit-content;
  margin: 0;
  min-height: 34px;
  height: auto;
  max-width: min(100%, 28rem);
  white-space: normal;
  overflow-wrap: anywhere;
  word-break: break-word;
  line-height: 1.2;
  padding-top: 7px;
  padding-bottom: 7px;
  border-radius: 999px;
}

.workout-name-field__suggestions :deep(.q-chip__content) {
  display: block;
  white-space: normal;
  overflow-wrap: anywhere;
  word-break: break-word;
}
</style>
