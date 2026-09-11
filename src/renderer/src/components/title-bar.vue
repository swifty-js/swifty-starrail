<script setup lang="ts">
import { Minus, Square, X } from "@lucide/vue";

function handleControl(action: "close" | "maximize" | "minimize") {
  window.api.invoke("window:control", action);
}
</script>

<template>
  <div
    class="flex h-11.25 w-full items-center bg-white/50 shadow-sm backdrop-blur-md [-webkit-app-region:drag]"
  >
    <span class="ml-3 text-lg">Star Rail Toolbox</span>
    <div class="ml-auto flex h-full [-webkit-app-region:no-drag]">
      <button
        class="flex h-full w-12.5 items-center justify-center transition-colors hover:bg-white/50"
        @click="handleControl('minimize')"
      >
        <Minus :size="14" />
      </button>
      <button
        class="flex h-full w-12.5 items-center justify-center transition-colors hover:bg-white/50"
        @click="handleControl('maximize')"
      >
        <Square :size="12" />
      </button>
      <button
        class="flex h-full w-12.5 items-center justify-center transition-colors hover:bg-red-400/60"
        @click="handleControl('close')"
      >
        <X :size="14" />
      </button>
    </div>
  </div>
</template>
