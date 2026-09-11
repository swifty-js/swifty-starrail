<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useToastStore } from "../stores/toast";
import ToastItem from "./toast-item.vue";

const { items } = storeToRefs(useToastStore());
</script>

<template>
  <div
    v-if="items.length > 0"
    class="fixed top-14 right-4 z-50 flex flex-col gap-2"
  >
    <ToastItem v-for="item in items" :key="item.id" :item="item" />
  </div>
</template>
