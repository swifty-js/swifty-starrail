<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { storeToRefs } from "pinia";
import { useSettingsStore } from "../../stores/settings";
import Switch from "../../components/switch.vue";
import { toast } from "../../stores/toast";
import ProgressBar from "../../components/progress-bar.vue";
import SettingRow from "./setting-row.vue";
import { ExternalLink, RefreshCw } from "@lucide/vue";

const settingsStore = useSettingsStore();
const { settings } = storeToRefs(settingsStore);

const version = ref("");
const fpsStatus = ref("");
const updateState = ref<string>("idle");
const updateProgress = ref(0);
const updateVersion = ref("");
let pollingTimer: ReturnType<typeof setInterval> | null = null;

function stopPolling() {
  if (pollingTimer) {
    clearInterval(pollingTimer);
    pollingTimer = null;
  }
}

function startPolling() {
  stopPolling();
  pollingTimer = setInterval(async () => {
    const info = await window.api.invoke("update:getDownloadInfo");
    updateState.value = info.state;
    updateProgress.value = info.progress;
    if (
      info.state === "downloaded" ||
      info.state === "error" ||
      info.state === "idle" ||
      info.state === "not-available"
    ) {
      stopPolling();
      if (info.state === "error") {
        toast.info("Update failed", info.error ?? "Unknown error");
      }
    }
  }, 500);
}

onMounted(async () => {
  settingsStore.load();
  version.value = await window.api.invoke("config:getAppVersion");
  const res = await window.api.invoke("unlockFps:isUnlocked");
  fpsStatus.value = res.msg;
});

onUnmounted(stopPolling);

async function handleCheckUpdate() {
  updateState.value = "checking";
  const result = await window.api.invoke("update:checkForUpdates");
  updateState.value = result.state;
  if (result.version) updateVersion.value = result.version;
  if (result.state === "available") {
    toast.info("New version available", `v${result.version} is available`);
  } else if (result.state === "not-available") {
    toast.info("Up to date", "No updates available");
  } else if (result.state === "error") {
    toast.info("Check failed", "Unable to reach the update server");
  }
}

async function handleDownloadUpdate() {
  updateState.value = "downloading";
  updateProgress.value = 0;
  startPolling();
  await window.api.invoke("update:downloadUpdate");
}

async function handleInstallUpdate() {
  await window.api.invoke("update:quitAndInstall");
}

async function handleToggleFps() {
  const result = await window.api.invoke("unlockFps:toggle");
  if (result.msg === "OK") {
    fpsStatus.value = result.fps === 120 ? "unlocked" : "locked";
    toast.info(
      "FPS Setting",
      `${result.fps === 120 ? "Unlocked" : "Locked"} to ${result.fps} FPS`,
    );
  } else {
    toast.info("Operation failed", result.msg);
  }
}
</script>

<template>
  <div v-if="settings" class="h-full overflow-y-auto pb-1.5">
    <div class="flex flex-col gap-3 p-4">
      <section class="rounded-md bg-white/50 p-4 shadow-sm">
        <h2 class="mb-3 text-sm font-medium text-gray-700">General</h2>
        <div class="flex flex-col gap-3">
          <SettingRow
            label="Exit on close"
            description="When disabled, the window minimizes to the tray on close"
          >
            <Switch
              :checked="settings.CloseDirectly"
              @change="(v) => settingsStore.update('CloseDirectly', v)"
            />
          </SettingRow>
          <SettingRow label="Check for updates on launch">
            <Switch
              :checked="settings.CheckUpdateOnLaunch"
              @change="(v) => settingsStore.update('CheckUpdateOnLaunch', v)"
            />
          </SettingRow>
          <SettingRow label="Collapse sidebar by default">
            <Switch
              :checked="settings.SidebarCollapsed"
              @change="(v) => settingsStore.update('SidebarCollapsed', v)"
            />
          </SettingRow>
          <SettingRow label="Debug mode">
            <Switch
              :checked="settings.Debug"
              @change="(v) => settingsStore.update('Debug', v)"
            />
          </SettingRow>
        </div>
      </section>

      <section class="rounded-md bg-white/50 p-4 shadow-sm">
        <h2 class="mb-3 text-sm font-medium text-gray-700">Game Settings</h2>
        <SettingRow
          label="Unlock 120 FPS"
          :description="
            fpsStatus === 'unlocked'
              ? 'Currently unlocked'
              : fpsStatus === 'locked'
                ? 'Currently 60 FPS'
                : fpsStatus
          "
        >
          <Switch
            :checked="fpsStatus === 'unlocked'"
            :disabled="fpsStatus !== 'unlocked' && fpsStatus !== 'locked'"
            @change="() => handleToggleFps()"
          />
        </SettingRow>
      </section>

      <section class="rounded-md bg-white/50 p-4 shadow-sm">
        <h2 class="mb-3 text-sm font-medium text-gray-700">About</h2>
        <div class="flex flex-col gap-3 text-sm text-gray-600">
          <p>Star Rail Toolbox v{{ version }}</p>
          <a
            class="inline-flex items-center gap-1 text-purple-500 hover:text-purple-600"
            href="https://github.com/hangtiancheng/swifty-starrail"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
            <ExternalLink :size="12" />
          </a>
          <div class="flex flex-col gap-2">
            <button
              v-if="
                updateState === 'idle' ||
                updateState === 'not-available' ||
                updateState === 'error'
              "
              class="inline-flex w-fit items-center gap-1.5 rounded bg-purple-500 px-3 py-1.5 text-xs text-white hover:bg-purple-600"
              @click="handleCheckUpdate"
            >
              <RefreshCw :size="12" />
              Check for Updates
            </button>
            <span
              v-else-if="updateState === 'checking'"
              class="text-xs text-gray-400"
            >
              Checking for updates...
            </span>
            <button
              v-else-if="updateState === 'available'"
              class="inline-flex w-fit items-center gap-1.5 rounded bg-purple-500 px-3 py-1.5 text-xs text-white hover:bg-purple-600"
              @click="handleDownloadUpdate"
            >
              Download v{{ updateVersion }}
            </button>
            <div
              v-else-if="updateState === 'downloading'"
              class="flex flex-col gap-1"
            >
              <span class="text-xs text-gray-500">
                Downloading v{{ updateVersion }}...
              </span>
              <ProgressBar :value="updateProgress" />
            </div>
            <button
              v-else-if="updateState === 'downloaded'"
              class="inline-flex w-fit items-center gap-1.5 rounded bg-green-500 px-3 py-1.5 text-xs text-white hover:bg-green-600"
              @click="handleInstallUpdate"
            >
              Restart and Install
            </button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
