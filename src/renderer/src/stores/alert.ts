import { ref } from "vue";
import { defineStore } from "pinia";

export interface AlertOptions {
  title: string;
  content: string;
  confirmText?: string;
  cancelText?: string;
}

export const useAlertStore = defineStore("alert", () => {
  const visible = ref(false);
  const options = ref<AlertOptions>({ title: "", content: "" });
  let resolveFn: ((confirmed: boolean) => void) | null = null;

  function show(opts: AlertOptions) {
    return new Promise<boolean>((resolve) => {
      resolveFn = resolve;
      visible.value = true;
      options.value = opts;
    });
  }

  function close(confirmed: boolean) {
    resolveFn?.(confirmed);
    resolveFn = null;
    visible.value = false;
  }

  return { visible, options, show, close };
});

export const alert = {
  confirm: (options: AlertOptions) => useAlertStore().show(options),
};
