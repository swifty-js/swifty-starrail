<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useGachaStore } from "../../stores";
import GachaHead from "./gacha-head.vue";
import GachaPoolView from "./gacha-pool-view.vue";
import GachaTypeView from "./gacha-type-view.vue";

const gachaStore = useGachaStore();
const { currentData, viewMode } = storeToRefs(gachaStore);
</script>

<template>
  <div class="flex h-full flex-col gap-1.5 pb-1.5">
    <GachaHead
      :view-mode="viewMode"
      @view-mode-change="gachaStore.setViewMode"
    />
    <div class="flex-1 overflow-hidden rounded-md bg-white/50 shadow-sm">
      <GachaPoolView
        v-if="currentData && viewMode === 'pool'"
        :data="currentData"
      />
      <GachaTypeView
        v-if="currentData && viewMode === 'type'"
        :data="currentData"
      />
    </div>
  </div>
</template>
