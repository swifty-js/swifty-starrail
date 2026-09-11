<script setup lang="ts">
import { ref } from "vue";
import {
  Download,
  Upload,
  Link,
  MoreVertical,
  LayoutGrid,
  List,
} from "@lucide/vue";
import { useGachaStore } from "../../stores";
import { storeToRefs } from "pinia";
import UidDropdown from "../../components/uid-dropdown.vue";
import { toast } from "../../stores/toast";
import { useClickOutside } from "../../composables/use-click-outside";

defineProps<{
  viewMode: "pool" | "type";
}>();

const emit = defineEmits<{
  viewModeChange: [mode: "pool" | "type"];
}>();

const gachaStore = useGachaStore();
const { uids, currentUid } = storeToRefs(gachaStore);

const showMenu = ref(false);
const menuRef = ref<HTMLElement | null>(null);
useClickOutside(menuRef, () => (showMenu.value = false), showMenu);

async function handleGetURL() {
  showMenu.value = false;
  const result = await gachaStore.getGachaURL("cn");
  if (result.msg === "OK" && result.data) {
    await gachaStore.refreshData("srgf_v1.0", {});
    toast.info("Fetch succeeded", "跃迁记录 URL obtained");
  } else {
    toast.info("Fetch failed", result.msg);
  }
}

async function handleImport() {
  showMenu.value = false;
  const result = await gachaStore.importData("srgf_v1.0");
  if (result.msg === "OK") {
    toast.info("Import succeeded", "跃迁记录 imported");
  } else if (result.msg !== "Canceled") {
    toast.info("Import failed", result.msg);
  }
}

async function handleExport() {
  showMenu.value = false;
  const result = await gachaStore.exportData("srgf_v1.0");
  if (result.msg === "OK" && "data" in result) {
    const path = (result as { msg: string; data: { path: string } }).data.path;
    if (path) window.api.invoke("shell:showItemInFolder", path);
    toast.info("Export succeeded", "跃迁记录 exported");
  } else if (result.msg !== "Canceled") {
    toast.info("Export failed", result.msg);
  }
}
</script>

<template>
  <div
    class="flex h-12.5 items-center gap-2.5 rounded-md bg-white/50 px-3 shadow-sm"
  >
    <UidDropdown
      v-if="uids && currentUid"
      :uids="uids"
      :current-uid="currentUid"
      :on-select="gachaStore.setCurrentUid"
      :on-add="gachaStore.newUser"
      :on-delete="gachaStore.deleteUser"
    />

    <div class="ml-auto flex items-center gap-1">
      <button
        class="flex h-8 w-8 items-center justify-center rounded"
        :class="
          viewMode === 'pool'
            ? 'bg-purple-100 text-purple-600'
            : 'hover:bg-gray-100'
        "
        title="卡池视图"
        @click="emit('viewModeChange', 'pool')"
      >
        <LayoutGrid :size="16" />
      </button>
      <button
        class="flex h-8 w-8 items-center justify-center rounded"
        :class="
          viewMode === 'type'
            ? 'bg-purple-100 text-purple-600'
            : 'hover:bg-gray-100'
        "
        title="类型视图"
        @click="emit('viewModeChange', 'type')"
      >
        <List :size="16" />
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
        class="absolute top-full right-0 z-20 mt-1 w-36 rounded-md bg-white py-1 shadow-lg"
      >
        <button
          class="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50"
          @click="handleGetURL"
        >
          <Link :size="14" />
          Fetch Records
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
