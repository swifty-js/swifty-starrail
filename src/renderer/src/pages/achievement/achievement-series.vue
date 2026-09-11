<script setup lang="ts">
import type { SeriesItem } from "./types";

defineProps<{
  items: SeriesItem[];
  selectedId: number;
}>();

const emit = defineEmits<{
  select: [id: number];
}>();
</script>

<template>
  <div
    class="flex w-50 shrink-0 flex-col gap-0.5 overflow-y-auto bg-white/50 p-1"
  >
    <button
      v-for="item in items"
      :key="item.seriesId"
      class="flex cursor-pointer flex-col rounded px-3 py-2 text-left transition-colors"
      :class="
        selectedId === item.seriesId
          ? 'bg-purple-100 text-purple-700'
          : 'hover:bg-white/50'
      "
      @click="emit('select', item.seriesId)"
    >
      <span class="text-sm">{{ item.seriesTitle }}</span>
      <span class="text-xs text-gray-500">
        {{ item.countFinished }}/{{ item.countTotal }}
      </span>
    </button>
  </div>
</template>
