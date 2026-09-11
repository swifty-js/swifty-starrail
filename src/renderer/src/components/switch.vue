<script setup lang="ts">
defineProps<{
  checked: boolean;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  change: [checked: boolean];
}>();
</script>

<template>
  <button
    class="relative h-6 w-11 rounded-full transition-colors"
    :class="[
      checked ? 'bg-purple-500' : 'bg-gray-300',
      disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
    ]"
    @click="!disabled && emit('change', !checked)"
  >
    <span
      class="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform"
      :class="checked ? 'translate-x-5' : 'translate-x-0'"
    />
  </button>
</template>
