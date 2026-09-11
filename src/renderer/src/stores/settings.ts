import { ref } from "vue";
import { defineStore } from "pinia";
import type { AppSettings } from "../../../shared/ipc-schema";

export const useSettingsStore = defineStore("settings", () => {
  const settings = ref<AppSettings | null>(null);

  async function load() {
    settings.value = await window.api.invoke("setting:getAppSettings");
  }

  async function update(key: string, value: unknown) {
    settings.value = await window.api.invoke(
      "setting:setAppSettings",
      key,
      value,
    );
  }

  return { settings, load, update };
});
