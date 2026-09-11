<script setup lang="ts">
import { ref, onErrorCaptured } from "vue";
import { EventType, reportFrameworkError } from "@swifty.js/sentry";
import ErrorFallback from "./components/error-fallback.vue";

const error = ref<Error | null>(null);
const errorInfo = ref<string>("");

onErrorCaptured((err, _instance, info) => {
  error.value = err instanceof Error ? err : new Error(String(err));
  errorInfo.value = info;
  reportFrameworkError({ type: EventType.Vue, error: err, context: info });
  return false;
});

function reset() {
  error.value = null;
  errorInfo.value = "";
}
</script>

<template>
  <ErrorFallback v-if="error" :error="error" :info="errorInfo" @retry="reset" />
  <RouterView v-else />
</template>
