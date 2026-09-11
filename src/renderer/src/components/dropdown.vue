<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { ChevronDown } from "@lucide/vue";

interface DropdownOption {
  label: string;
  value: string;
}

const props = defineProps<{
  options: DropdownOption[];
  value: string;
  placeholder?: string;
}>();

const emit = defineEmits<{
  change: [value: string];
}>();

const open = ref(false);
const rootRef = ref<HTMLElement | null>(null);

function handleClickOutside(e: MouseEvent) {
  if (rootRef.value && !rootRef.value.contains(e.target as Node)) {
    open.value = false;
  }
}

onMounted(() => document.addEventListener("mousedown", handleClickOutside));
onUnmounted(() =>
  document.removeEventListener("mousedown", handleClickOutside),
);

const selected = computed(() =>
  props.options.find((o) => o.value === props.value),
);

function select(value: string) {
  emit("change", value);
  open.value = false;
}
</script>

<template>
  <div ref="rootRef" class="relative">
    <button
      class="flex h-8 items-center gap-1 rounded border border-gray-300 bg-white px-3 text-sm hover:border-purple-400"
      @click="open = !open"
    >
      <span>{{ selected?.label ?? placeholder ?? "Select" }}</span>
      <ChevronDown
        :size="14"
        class="transition-transform"
        :class="{ 'rotate-180': open }"
      />
    </button>
    <div
      v-if="open"
      class="absolute top-full left-0 z-10 mt-1 max-h-48 w-full overflow-y-auto rounded border border-gray-200 bg-white py-1 shadow-md"
    >
      <button
        v-for="opt in options"
        :key="opt.value"
        class="w-full px-3 py-1.5 text-left text-sm hover:bg-purple-50"
        :class="opt.value === value ? 'bg-purple-50 text-purple-600' : ''"
        @click="select(opt.value)"
      >
        {{ opt.label }}
      </button>
    </div>
  </div>
</template>
