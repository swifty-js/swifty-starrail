<script setup lang="ts">
defineProps<{
  label: string;
  description?: string;
}>();
</script>

<template>
  <div class="flex items-center justify-between">
    <div>
      <span class="text-sm">{{ label }}</span>
      <p v-if="description" class="text-xs text-gray-400">
        {{ description }}
      </p>
    </div>
    <slot />
  </div>
</template>
