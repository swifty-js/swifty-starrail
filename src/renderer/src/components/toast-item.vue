<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import { X } from "@lucide/vue";
import {
  useToastStore,
  type ToastItem as ToastItemType,
} from "../stores/toast";

const props = defineProps<{ item: ToastItemType }>();

const toastStore = useToastStore();

let timer: ReturnType<typeof setTimeout> | null = null;

onMounted(() => {
  if (props.item.duration > 0) {
    timer = setTimeout(
      () => toastStore.remove(props.item.id),
      props.item.duration,
    );
  }
});

onUnmounted(() => {
  if (timer) clearTimeout(timer);
});
</script>

<template>
  <div
    class="flex w-80 flex-col gap-1 rounded-md bg-white/90 p-3 shadow-md backdrop-blur-sm"
  >
    <div class="flex items-center justify-between">
      <span class="text-sm font-medium">{{ item.title }}</span>
      <button
        class="rounded p-0.5 hover:bg-black/5"
        @click="toastStore.remove(item.id)"
      >
        <X :size="14" />
      </button>
    </div>
    <!-- content comes from the app's own message catalog, same trust level as the React version -->
    <div class="text-xs text-gray-600" v-html="item.content" />
  </div>
</template>
