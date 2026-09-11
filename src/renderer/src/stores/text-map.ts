import { ref } from "vue";
import { defineStore } from "pinia";

export const useTextMapStore = defineStore("text-map", () => {
  const textMap = ref<Record<string, string> | null>(null);

  async function loadTextMap(fileName: string) {
    textMap.value = (await window.api.invoke(
      "static:loadJson",
      fileName,
    )) as Record<string, string>;
  }

  function getText(hash: string) {
    return textMap.value?.[hash] ?? "";
  }

  return { textMap, loadTextMap, getText };
});
