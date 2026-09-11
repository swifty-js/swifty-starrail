<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { useRoute } from "vue-router";
import TitleBar from "../components/title-bar.vue";
import Sidebar from "../components/sidebar.vue";
import ToastContainer from "../components/toast.vue";
import AlertDialog from "../components/alert-dialog.vue";
import { toast } from "../stores/toast";
import {
  useSettingsStore,
  useTextMapStore,
  useAchievementStore,
  useGachaStore,
} from "../stores";

const route = useRoute();
const mainRef = ref<HTMLElement | null>(null);
const scrollPositions = new Map<string, number>();
let prevPath = route.path;

onMounted(() => {
  const bootstrap = async () => {
    const settingsStore = useSettingsStore();
    const textMapStore = useTextMapStore();
    await Promise.all([
      settingsStore.load(),
      textMapStore.loadTextMap("TextMapCHS"),
    ]);
    await Promise.all([useAchievementStore().init(), useGachaStore().init()]);
    const settings = settingsStore.settings;
    if (settings?.CheckUpdateOnLaunch) {
      const result = await window.api.invoke("update:checkForUpdates");
      if (result.state === "available" && result.version) {
        toast.info(
          "New version available",
          `v${result.version} is available. Go to Settings to download.`,
        );
      }
    }
  };
  bootstrap();
});

// Save/restore scroll position on route change
watch(
  () => route.path,
  (path) => {
    if (mainRef.value) {
      scrollPositions.set(prevPath, mainRef.value.scrollTop);
    }
    prevPath = path;
    requestAnimationFrame(() => {
      if (mainRef.value) {
        mainRef.value.scrollTop = scrollPositions.get(path) ?? 0;
      }
    });
  },
);
</script>

<template>
  <div class="flex h-screen w-screen flex-col overflow-hidden">
    <TitleBar />
    <div class="flex flex-1 overflow-hidden">
      <Sidebar />
      <main ref="mainRef" class="flex-1 overflow-hidden p-1.5">
        <RouterView v-slot="{ Component }">
          <div :key="route.path" class="page-animate h-full">
            <component :is="Component" />
          </div>
        </RouterView>
      </main>
    </div>
    <ToastContainer />
    <AlertDialog />
  </div>
</template>
