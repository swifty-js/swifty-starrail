<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    value: number;
    max?: number;
  }>(),
  { max: 1 },
);

const percent = computed(() => Math.min(100, (props.value / props.max) * 100));
</script>

<template>
  <div class="h-2 w-full overflow-hidden rounded-full bg-gray-200">
    <div
      class="h-full rounded-full bg-purple-500 transition-all duration-300"
      :style="{ width: `${percent}%` }"
    />
  </div>
</template>
