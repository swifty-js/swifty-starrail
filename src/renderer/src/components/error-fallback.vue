<script setup lang="ts">
defineProps<{
  error: Error;
  info?: string;
}>();

defineEmits<{
  retry: [];
}>();

function reload() {
  globalThis.location.reload();
}
</script>

<template>
  <div class="flex h-screen w-screen items-center justify-center bg-gray-50">
    <div class="max-w-md rounded-lg bg-white p-6 shadow-md">
      <h2 class="mb-2 text-lg text-red-600">App Error</h2>
      <p class="mb-4 text-sm text-gray-600">
        {{ error.message }}
      </p>
      <pre
        v-if="info"
        class="mb-4 max-h-40 overflow-auto rounded bg-gray-100 p-3 text-xs text-gray-500"
        v-text="info"
      />
      <button
        class="rounded bg-purple-500 px-4 py-2 text-sm text-white hover:bg-purple-600"
        @click="reload"
      >
        Reload
      </button>
    </div>
  </div>
</template>
