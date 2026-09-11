<script setup lang="ts">
import { Check } from "@lucide/vue";

defineProps<{
  checked: boolean;
  label?: string;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  change: [checked: boolean];
}>();
</script>

<template>
  <label
    class="flex items-center gap-2"
    :class="disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'"
  >
    <span
      class="flex h-4 w-4 items-center justify-center rounded border transition-colors"
      :class="
        checked ? 'border-purple-500 bg-purple-500' : 'border-gray-400 bg-white'
      "
      @click="!disabled && emit('change', !checked)"
    >
      <Check v-if="checked" :size="12" class="text-white" />
    </span>
    <span v-if="label" class="text-sm">{{ label }}</span>
  </label>
</template>
