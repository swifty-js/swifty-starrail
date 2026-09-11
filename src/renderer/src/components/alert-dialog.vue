<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useAlertStore } from "@renderer/stores";

const { visible, options } = storeToRefs(useAlertStore());
const alertStore = useAlertStore();
</script>

<template>
  <div
    v-if="visible"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
  >
    <div class="w-80 rounded-lg bg-white p-5 shadow-lg">
      <h3 class="mb-2 text-base font-medium">
        {{ options.title }}
      </h3>
      <p class="mb-4 text-sm text-gray-600">
        {{ options.content }}
      </p>
      <div class="flex justify-end gap-2">
        <button
          v-if="options.cancelText !== undefined"
          class="rounded px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
          @click="alertStore.close(false)"
        >
          {{ options.cancelText || "Cancel" }}
        </button>
        <button
          class="rounded bg-purple-500 px-3 py-1.5 text-sm text-white hover:bg-purple-600"
          @click="alertStore.close(true)"
        >
          {{ options.confirmText || "Confirm" }}
        </button>
      </div>
    </div>
  </div>
</template>
