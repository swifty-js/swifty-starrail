import { ref } from "vue";
import { defineStore } from "pinia";

export interface ToastItem {
  id: number;
  title: string;
  content: string;
  duration: number;
}

let nextId = 0;

export const useToastStore = defineStore("toast", () => {
  const items = ref<ToastItem[]>([]);

  function add(title: string, content: string, duration = 5000) {
    items.value = [...items.value, { id: nextId++, title, content, duration }];
  }

  function remove(id: number) {
    items.value = items.value.filter((t) => t.id !== id);
  }

  return { items, add, remove };
});

export const toast = {
  info: (title: string, content: string, duration?: number) => {
    useToastStore().add(title, content, duration);
  },
};
