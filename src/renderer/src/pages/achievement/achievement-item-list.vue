<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useVirtualizer } from "@tanstack/vue-virtual";
import { useAchievementStore } from "../../stores";
import { Check } from "@lucide/vue";
import type { AchievementItem } from "./types";

const props = defineProps<{
  items: AchievementItem[];
  meAchievementMap: Record<string, string[]>;
  selectedSeries: number;
}>();

const ITEM_HEIGHT = 65;

const achievementStore = useAchievementStore();

const parentRef = ref<HTMLElement | null>(null);

watch(
  () => props.selectedSeries,
  () => {
    parentRef.value?.scrollTo({ top: 0 });
  },
);

// Options must be a computed so the virtualizer reacts to the item list
// arriving/changing after mount (a plain object is captured once).
const virtualizer = useVirtualizer(
  computed(() => ({
    count: props.items.length,
    getScrollElement: () => parentRef.value,
    estimateSize: () => ITEM_HEIGHT,
    overscan: 5,
  })),
);

const virtualItems = computed(() =>
  virtualizer.value.getVirtualItems().map((virtualRow) => ({
    virtualRow,
    item: props.items[virtualRow.index]!,
  })),
);
const totalSize = computed(() => virtualizer.value.getTotalSize());

function handleToggle(item: AchievementItem) {
  if (item.achievementIsDisabled) return;
  const newStatus = item.achievementStatus === 2 ? 1 : 2;
  achievementStore.setStatus([item.achievementId], newStatus);
}
</script>

<template>
  <div ref="parentRef" class="flex-1 overflow-y-auto">
    <div class="relative w-full" :style="{ height: `${totalSize}px` }">
      <div
        v-for="{ virtualRow, item } in virtualItems"
        :key="item.achievementId"
        class="absolute top-0 left-0 w-full px-1"
        :style="{
          height: `${ITEM_HEIGHT}px`,
          transform: `translateY(${virtualRow.start}px)`,
        }"
      >
        <div
          class="flex h-full items-center gap-3 rounded-md px-3 transition-colors"
          :class="
            item.achievementIsDisabled ? 'opacity-50' : 'hover:bg-white/50'
          "
        >
          <button
            class="flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded border transition-colors"
            :class="[
              item.achievementStatus === 2
                ? 'border-purple-500 bg-purple-500'
                : 'border-gray-400 bg-white',
              item.achievementIsDisabled
                ? 'cursor-not-allowed'
                : 'cursor-pointer',
            ]"
            :disabled="item.achievementIsDisabled"
            @click="handleToggle(item)"
          >
            <Check
              v-if="item.achievementStatus === 2"
              :size="12"
              class="text-white"
            />
          </button>

          <div class="flex flex-1 flex-col justify-center overflow-hidden">
            <div class="flex items-center gap-2">
              <span class="truncate text-sm font-medium">
                {{ item.achievementTitle }}
              </span>
              <span
                v-if="item.achievementShowType"
                class="shrink-0 rounded bg-gray-200 px-1 text-xs text-gray-500"
              >
                {{ item.achievementShowType }}
              </span>
              <span
                v-if="meAchievementMap[item.achievementId]"
                class="shrink-0 rounded bg-purple-100 px-1 text-xs text-purple-600"
                :title="item.achievementMutualExclusiveInfo"
              >
                Exclusive
              </span>
            </div>
            <span class="truncate text-xs text-gray-500">
              {{ item.achievementDescUpper }}
            </span>
            <span
              v-if="item.achievementDescLower"
              class="truncate text-xs text-gray-400"
            >
              {{ item.achievementDescLower }}
            </span>
          </div>

          <div class="flex shrink-0 flex-col items-end text-xs text-gray-400">
            <template v-if="item.achievementFinishDate">
              <span>{{ item.achievementFinishDate }}</span>
              <span>{{ item.achievementFinishTime }}</span>
            </template>
            <span class="text-purple-500">
              {{ item.achievementReward }} 星琼
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
