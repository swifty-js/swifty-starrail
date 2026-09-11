<script setup lang="ts">
import { ref } from "vue";
import AchievementHead from "./achievement-head.vue";
import AchievementSeries from "./achievement-series.vue";
import AchievementItemList from "./achievement-item-list.vue";
import { useAchievementMeta } from "./use-achievement-meta";
import { useAchievementFiltered } from "./use-achievement-filtered";
import { defaultFilter } from "./types";
import type { FilterSetting } from "./types";

const { achievementItems, seriesItems, meAchievementMap, achievementDataMap } =
  useAchievementMeta();

const filter = ref<FilterSetting>({ ...defaultFilter });

const {
  filteredItems,
  seriesWithProgress,
  selectedSeries,
  handleSelectSeries,
  handleSearch,
} = useAchievementFiltered(
  achievementItems,
  seriesItems,
  meAchievementMap,
  achievementDataMap,
  filter,
);

function handleFilterChange(f: FilterSetting) {
  filter.value = f;
}
</script>

<template>
  <div class="flex h-full flex-col gap-1.5 pb-1.5">
    <AchievementHead
      :filter="filter"
      :default-filter="defaultFilter"
      @search="handleSearch"
      @filter-change="handleFilterChange"
    />
    <div
      class="flex flex-1 gap-0 overflow-hidden rounded-md bg-white/50 shadow-sm"
    >
      <AchievementSeries
        :items="seriesWithProgress"
        :selected-id="selectedSeries"
        @select="handleSelectSeries"
      />
      <AchievementItemList
        :items="filteredItems"
        :me-achievement-map="meAchievementMap"
        :selected-series="selectedSeries"
      />
    </div>
  </div>
</template>
