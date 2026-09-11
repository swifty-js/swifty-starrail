import { watch, onUnmounted, type Ref } from "vue";

export function useClickOutside(
  targetRef: Ref<HTMLElement | null>,
  onClose: () => void,
  active: Ref<boolean> | boolean = true,
) {
  let handler: ((e: MouseEvent) => void) | null = null;

  const start = () => {
    if (handler) return;
    handler = (e: MouseEvent) => {
      if (targetRef.value && !targetRef.value.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
  };

  const stop = () => {
    if (!handler) return;
    document.removeEventListener("mousedown", handler);
    handler = null;
  };

  watch(
    () => (typeof active === "boolean" ? active : active.value),
    (isActive) => {
      if (isActive) {
        start();
      } else {
        stop();
      }
    },
    { immediate: true },
  );

  onUnmounted(stop);
}
