import "./main.css";

import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import { router } from "./routes";
import { enablePlugin, type IOptions } from "@swifty.js/sentry";
import { vuePlugin } from "@swifty.js/sentry/vue";
import {
  ScreenRecordPlugin,
  ExposurePlugin,
  PerformancePlugin,
} from "@swifty.js/sentry/plugins";

const sentryOptions: Partial<IOptions> = {
  dsn: import.meta.env.DEV ? "/dev/sentry" : "ipc",
  beforeSendBatch(eventList) {
    if (!import.meta.env.DEV) {
      window.api.send("sentry:log", eventList);
      return false;
    }
    return eventList;
  },
};

const app = createApp(App);

// vuePlugin installs app.config.errorHandler and initializes the SDK
// (init is a no-op if already initialized).
app.use(createPinia());
app.use(router);
app.use(vuePlugin, sentryOptions);

enablePlugin(
  new ScreenRecordPlugin(),
  new ExposurePlugin(),
  new PerformancePlugin(),
);

app.mount("#app");
