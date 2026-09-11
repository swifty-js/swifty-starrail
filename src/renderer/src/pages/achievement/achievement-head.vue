<script setup lang="ts">
import { ref, computed } from "vue";
import {
  Search,
  X,
  MoreVertical,
  RefreshCw,
  Download,
  Upload,
  Loader2,
} from "@lucide/vue";
import { useAchievementStore } from "../../stores";
import { toast } from "../../stores/toast";
import { useClickOutside } from "../../composables/use-click-outside";
import type { FilterSetting } from "./types";

// filter/onFilterChange/defaultFilter are reserved for the filter panel UI
defineProps<{
  filter: FilterSetting;
  defaultFilter: FilterSetting;
}>();

const emit = defineEmits<{
  search: [value: string];
  filterChange: [filter: FilterSetting];
}>();

const achievementStore = useAchievementStore();
const headInfo = computed(() => achievementStore.headInfo);

const searchValue = ref("");
const showMenu = ref(false);
const menuRef = ref<HTMLElement | null>(null);
useClickOutside(menuRef, () => (showMenu.value = false), showMenu);

function doSearch(value?: string) {
  const v = value ?? searchValue.value;
  emit("search", v);
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === "Enter") doSearch();
}

async function handleImport() {
  showMenu.value = false;
  const result = await achievementStore.importData("swifty-starrail");
  if (result.msg === "OK") {
    toast.info("Import succeeded", "Achievement data imported");
  } else if (result.msg !== "Canceled") {
    toast.info("Import failed", result.msg);
  }
}

async function handleExport() {
  showMenu.value = false;
  const result = await achievementStore.exportData("swifty-starrail");
  if (result.msg === "OK" && "data" in result) {
    const path = (result as { msg: string; data: { path: string } }).data.path;
    if (path) window.api.invoke("shell:showItemInFolder", path);
    toast.info("Export succeeded", "Achievement data exported");
  } else if (result.msg !== "Canceled") {
    toast.info("Export failed", result.msg);
  }
}

async function handleRefresh() {
  showMenu.value = false;
  const result = await window.api.invoke(
    "achievement:refreshFromMYS",
    true,
    "cn",
  );
  if (result.msg === "OK") {
    await achievementStore.init();
    toast.info("Refresh succeeded", "Achievement data synced from 米游社");
  } else if (result.msg !== "Canceled") {
    toast.info("Refresh failed", result.msg);
  }
}
</script>

<template>
  <div
    class="flex h-12.5 items-center gap-2.5 rounded-md bg-white/50 px-3 shadow-sm"
  >
    <Loader2
      v-if="headInfo === 'Loading'"
      :size="18"
      class="animate-spin text-gray-400"
    />
    <span v-else class="text-lg">{{ headInfo }}</span>

    <div class="relative flex flex-1 items-center">
      <input
        v-model="searchValue"
        class="h-10 w-full rounded-md bg-white/70 px-3 pr-16 text-sm outline-none hover:bg-white/90 focus:bg-white"
        placeholder="Search by name, description, or ID"
        spellcheck="false"
        @keydown="handleKeyDown"
      />
      <button
        v-if="searchValue"
        class="absolute right-10 text-gray-400 hover:text-gray-600"
        @click="
          () => {
            searchValue = '';
            doSearch('');
          }
        "
      >
        <X :size="14" />
      </button>
      <button
        class="absolute right-3 text-gray-500 hover:text-gray-700"
        @click="doSearch()"
      >
        <Search :size="16" />
      </button>
    </div>

    <div ref="menuRef" class="relative">
      <button
        class="flex h-9 w-9 items-center justify-center rounded-md bg-purple-500 text-white hover:bg-purple-600"
        @click="showMenu = !showMenu"
      >
        <MoreVertical :size="16" />
      </button>
      <div
        v-if="showMenu"
        class="absolute top-full right-0 z-20 mt-1 w-32 rounded-md bg-white py-1 shadow-lg"
      >
        <button
          class="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
          @click="handleRefresh"
        >
          <RefreshCw :size="14" />
          Refresh
        </button>
        <button
          class="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
          @click="handleImport"
        >
          <Upload :size="14" />
          Import
        </button>
        <button
          class="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
          @click="handleExport"
        >
          <Download :size="14" />
          Export
        </button>
      </div>
    </div>
  </div>
</template>
